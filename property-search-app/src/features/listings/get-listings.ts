import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/types/zolo_api_types/db";
import type { Prisma } from "@/generated/prisma/client";
import {
  Gender,
  PropertySource,
  PropertyStatus,
  SharingType,
} from "@/generated/prisma/client";
import { aggregatePricingByOccupancy } from "./aggregate-pricing";
import type { ListingFilters, ListingItem } from "./types";
import { listingFiltersCacheKey } from "./types";

const DEFAULT_AMENITIES = ["WiFi", "Power Backup", "CCTV"];
const PROFILE_LISTINGS = process.env.LISTINGS_PROFILE === "true";

function nowMs(): number {
  return performance.now();
}

function logProfile(step: string, ms: number, meta?: Record<string, unknown>) {
  if (!PROFILE_LISTINGS) return;
  if (meta) {
    console.log(`[listings] ${step}: ${Math.round(ms)}ms`, meta);
    return;
  }
  console.log(`[listings] ${step}: ${Math.round(ms)}ms`);
}

function activeFilterMeta(filters: ListingFilters): Record<string, unknown> {
  const meta: Record<string, unknown> = {};
  if (filters.q) meta.q = filters.q;
  if (filters.locality) meta.locality = filters.locality;
  if (filters.provider !== "all") meta.provider = filters.provider;
  if (filters.gender !== "all") meta.gender = filters.gender;
  if (filters.type !== "all") meta.type = filters.type;
  if (filters.occupancy !== "all") meta.occupancy = filters.occupancy;
  if (filters.priceMin > 0) meta.priceMin = filters.priceMin;
  if (filters.priceMax < 30000) meta.priceMax = filters.priceMax;
  return meta;
}

function mapGender(g: Gender | null): ListingItem["gender"] {
  if (g === Gender.MALE) return "male";
  if (g === Gender.FEMALE) return "female";
  return "unisex";
}

function mapProvider(s: PropertySource): ListingItem["provider"] {
  if (s === PropertySource.ZOLO) return "zolo";
  if (s === PropertySource.COLIVE) return "colive";
  return "other";
}

function sharingTypeToOccupancy(st: SharingType | null): string {
  if (st == null) return "—";
  switch (st) {
    case SharingType.PRIVATE_ROOM:
      return "single";
    case SharingType.DOUBLE_SHARING:
      return "double";
    case SharingType.TRIPLE_SHARING:
      return "triple";
    case SharingType.THREE_BHK:
      return "quad";
    case SharingType.TWO_BHK:
      return "1bhk";
    case SharingType.STUDIO_APARTMENT:
      return "studio";
    default:
      return String(st).toLowerCase();
  }
}

function typeLabelFromCategory(category: string | null): string {
  const c = (category ?? "").toLowerCase();
  if (c.includes("coliv")) return "Co-living";
  if (c.includes("hostel")) return "Hostel";
  if (c.includes("studio")) return "Studio";
  if (c.includes("bhk") || c.includes("apartment")) return "Apartment";
  return "PG";
}

function occupancyFilterToSharing(
  o: ListingFilters["occupancy"]
): SharingType | null {
  switch (o) {
    case "single":
      return SharingType.PRIVATE_ROOM;
    case "double":
      return SharingType.DOUBLE_SHARING;
    case "triple":
      return SharingType.TRIPLE_SHARING;
    case "quad":
      return SharingType.THREE_BHK;
    default:
      return null;
  }
}

function listingTypeToSharing(t: string): SharingType | null {
  switch (t) {
    case "1bhk":
      return SharingType.TWO_BHK;
    case "2bhk":
      return SharingType.THREE_BHK;
    case "studio":
      return SharingType.STUDIO_APARTMENT;
    default:
      return null;
  }
}

function categoryContains(type: string): Prisma.PropertyWhereInput | null {
  switch (type) {
    case "pg":
      return {
        OR: [
          { propertyCategory: { contains: "pg", mode: "insensitive" } },
          { propertyCategory: { contains: "PG", mode: "insensitive" } },
        ],
      };
    case "hostel":
      return {
        propertyCategory: { contains: "hostel", mode: "insensitive" },
      };
    case "coliving":
      return {
        OR: [
          { propertyCategory: { contains: "coliv", mode: "insensitive" } },
          { propertyCategory: { contains: "co-liv", mode: "insensitive" } },
        ],
      };
    default:
      return null;
  }
}

function buildWhere(filters: ListingFilters): Prisma.PropertyWhereInput {
  const and: Prisma.PropertyWhereInput[] = [{ status: PropertyStatus.ACTIVE }];

  if (filters.provider === "zolo") {
    and.push({ source: PropertySource.ZOLO });
  } else if (filters.provider === "colive") {
    and.push({ source: PropertySource.COLIVE });
  }

  if (filters.gender !== "all") {
    const g =
      filters.gender === "male"
        ? Gender.MALE
        : filters.gender === "female"
        ? Gender.FEMALE
        : Gender.UNISEX;
    and.push({ genderAllowed: g });
  }

  const localityTrim = filters.locality.trim();
  if (localityTrim) {
    and.push({
      locality: { is: { name: { equals: localityTrim, mode: "insensitive" } } },
    });
  } else if (filters.q) {
    const q = filters.q.trim();
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { addressLine1: { contains: q, mode: "insensitive" } },
        {
          locality: {
            is: {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { localityKey: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        },
        { city: { is: { name: { contains: q, mode: "insensitive" } } } },
      ],
    });
  }

  const categoryClause = categoryContains(filters.type);
  if (categoryClause) {
    and.push(categoryClause);
  }

  const roomAnd: Prisma.RoomVariantWhereInput[] = [{ isActive: true }];

  const sharingFromType = listingTypeToSharing(filters.type);
  const occ = occupancyFilterToSharing(filters.occupancy);
  if (occ) {
    roomAnd.push({ sharingType: occ });
  } else if (sharingFromType) {
    roomAnd.push({ sharingType: sharingFromType });
  }

  const priceNarrowed = filters.priceMin > 0 || filters.priceMax < 30000;
  if (priceNarrowed) {
    roomAnd.push({
      basePrice: { gte: filters.priceMin, lte: filters.priceMax },
    });
  }

  const needsRoomVariant =
    sharingFromType !== null || occ !== null || priceNarrowed;

  if (needsRoomVariant) {
    and.push({
      roomVariants: {
        some: {
          AND: roomAnd,
        },
      },
    });
  }

  return { AND: and };
}

async function queryListingsRaw(filters: ListingFilters) {
  const where = buildWhere(filters);
  const t0 = nowMs();
  console.log("Where filter: ", where);
  const rows = await prisma.property.findMany({
    where,
    select: {
      id: true,
      name: true,
      source: true,
      genderAllowed: true,
      locality: { select: { name: true, localityKey: true } },
      city: { select: { name: true } },
      addressLine1: true,
      latitude: true,
      longitude: true,
      averageRating: true,
      propertyCategory: true,
      images: {
        orderBy: { imageOrder: "asc" },
        take: 5,
        select: { imageUrl: true },
      },
      roomVariants: {
        where: { isActive: true },
        select: {
          sharingType: true,
          basePrice: true,
          pricingPlans: {
            where: { isBasePlan: true },
            take: 1,
            select: {
              effectiveMonthlyPrice: true,
              discountPercentage: true,
            },
          },
        },
      },
    },
    take: 30,
    orderBy: { updatedAt: "desc" },
  });
  logProfile("queryListingsRaw.findMany", nowMs() - t0, {
    rows: rows.length,
    locality: filters.locality || undefined,
    hasQuery: Boolean(filters.q),
    provider: filters.provider,
  });
  return rows;
}

type RawListingRow = Awaited<ReturnType<typeof queryListingsRaw>>[number];

function mapRowToListingItem(row: RawListingRow): ListingItem {
  const variants = row.roomVariants ?? [];
  const pricing = variants.map((rv) => {
    const plan = rv.pricingPlans[0];
    const price = plan?.effectiveMonthlyPrice ?? rv.basePrice;
    const discountPct = plan?.discountPercentage;
    const originalPrice =
      discountPct != null && discountPct > 0
        ? Math.round(price / (1 - discountPct / 100))
        : price;
    return {
      occupancy: sharingTypeToOccupancy(rv.sharingType),
      price,
      originalPrice,
    };
  });

  const prices = pricing.map((p) => p.price).filter((n) => n > 0);
  const lowest = prices.length ? Math.min(...prices) : 0;
  let discount: ListingItem["discount"];
  const planDiscount = variants
    .flatMap((v) => v.pricingPlans)
    .map((p) => p.discountPercentage)
    .filter((d): d is number => d != null && d > 0);
  const maxDisc = planDiscount.length ? Math.max(...planDiscount) : 0;
  if (maxDisc > 0) {
    discount = { label: "Offer", percentage: Math.round(maxDisc) };
  }

  return {
    id: row.id,
    name: row.name ?? "Unnamed property",
    provider: mapProvider(row.source),
    gender: mapGender(row.genderAllowed),
    typeLabel: typeLabelFromCategory(row.propertyCategory),
    area: row.locality?.name ?? "Bangalore",
    city: row.city?.name ?? "Bangalore",
    rating: row.averageRating ?? 0,
    reviewCount: 0,
    images: row.images.map((i) => i.imageUrl),
    amenities: DEFAULT_AMENITIES,
    pricing:
      pricing.length > 0
        ? aggregatePricingByOccupancy(pricing)
        : [{ occupancy: "—", price: lowest, originalPrice: lowest }],
    discount,
    foodIncluded: false,
    availableFrom: "See details",
    highlights: row.locality?.localityKey
      ? [row.locality.localityKey.replace(/_/g, " ")]
      : [],
  };
}

async function fetchListingsFromDb(
  filters: ListingFilters
): Promise<ListingItem[]> {
  const t0 = nowMs();
  const rows = await queryListingsRaw(filters);
  const tMap = nowMs();
  const mapped = rows.map(mapRowToListingItem);
  logProfile("mapRowToListingItem", nowMs() - tMap, { rows: rows.length });
  logProfile("fetchListingsFromDb.total", nowMs() - t0, {
    rows: rows.length,
  });
  return mapped;
}

async function queryLocalitiesRaw(): Promise<string[]> {
  const t0 = nowMs();
  const rows = await prisma.locality.findMany({
    where: {
      properties: { some: { status: PropertyStatus.ACTIVE } },
    },
    select: { name: true },
  });
  const uniqueSorted = rows
    .map((r) => r.name)
    .filter((n) => n.trim().length > 0)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  logProfile("queryLocalitiesRaw.findMany", nowMs() - t0, {
    uniqueLocalities: uniqueSorted.length,
  });
  return uniqueSorted;
}

/** Distinct non-empty localities for search autofill (cached). */
export async function getListingLocalities(): Promise<string[]> {
  const cached = unstable_cache(
    async () => queryLocalitiesRaw(),
    ["listing-localities"],
    { revalidate: 300 }
  );
  return cached();
}

export async function getListings(
  filters: ListingFilters
): Promise<ListingItem[]> {
  const t0 = nowMs();
  const dataFilters: ListingFilters = { ...filters, view: "list" };
  const cached = unstable_cache(
    async () => fetchListingsFromDb(dataFilters),
    ["listings", listingFiltersCacheKey(dataFilters)],
    { revalidate: 300 }
  );
  const result = await cached();
  logProfile("getListings.total", nowMs() - t0, {
    rows: result.length,
    activeFilters: activeFilterMeta(dataFilters),
  });
  return result;
}
