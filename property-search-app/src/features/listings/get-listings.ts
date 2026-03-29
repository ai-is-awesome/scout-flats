import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/types/zolo_api_types/db";
import type { Prisma } from "@/generated/prisma/client";
import {
  Gender,
  PropertySource,
  PropertyStatus,
  SharingType,
} from "@/generated/prisma/client";
import type { ListingFilters, ListingItem } from "./types";
import { listingFiltersCacheKey } from "./types";

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

function sharingTypeToOccupancy(st: SharingType): string {
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

function listingTypeToSharing(
  t: string
): SharingType | null {
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

function categoryContains(
  type: string
): Prisma.PropertyWhereInput | null {
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
  const and: Prisma.PropertyWhereInput[] = [
    { status: PropertyStatus.ACTIVE },
  ];

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

  if (filters.q) {
    const q = filters.q.trim();
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { locality: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { localityKey: { contains: q, mode: "insensitive" } },
        { addressLine1: { contains: q, mode: "insensitive" } },
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

  const priceNarrowed =
    filters.priceMin > 0 || filters.priceMax < 30000;
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
  return prisma.property.findMany({
    where,
    select: {
      id: true,
      name: true,
      source: true,
      genderAllowed: true,
      locality: true,
      localityKey: true,
      city: true,
      addressLine1: true,
      latitude: true,
      longitude: true,
      averageRating: true,
      propertyCategory: true,
      providerJson: true,
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
}

type RawListingRow = Awaited<ReturnType<typeof queryListingsRaw>>[number];

function mapRowToListingItem(row: RawListingRow): ListingItem {
  const variants = row.roomVariants ?? [];
  const pricing = variants.map((rv) => {
    const plan = rv.pricingPlans[0];
    const price =
      plan?.effectiveMonthlyPrice ?? rv.basePrice;
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

  const amenities: string[] = [];
  if (row.providerJson && typeof row.providerJson === "object") {
    const j = row.providerJson as Record<string, unknown>;
    const am = j.amenities;
    if (Array.isArray(am)) {
      amenities.push(...am.filter((x): x is string => typeof x === "string"));
    }
  }

  return {
    id: row.id,
    name: row.name ?? "Unnamed property",
    provider: mapProvider(row.source),
    gender: mapGender(row.genderAllowed),
    typeLabel: typeLabelFromCategory(row.propertyCategory),
    area: row.locality ?? "Bangalore",
    city: row.city ?? "Bangalore",
    rating: row.averageRating ?? 0,
    reviewCount: 0,
    images: row.images.map((i) => i.imageUrl),
    amenities: amenities.length ? amenities : ["WiFi"],
    pricing:
      pricing.length > 0
        ? pricing
        : [{ occupancy: "—", price: lowest, originalPrice: lowest }],
    discount,
    foodIncluded: false,
    availableFrom: "See details",
    highlights: row.localityKey
      ? [row.localityKey.replace(/_/g, " ")]
      : [],
  };
}

async function fetchListingsFromDb(
  filters: ListingFilters
): Promise<ListingItem[]> {
  const rows = await queryListingsRaw(filters);
  return rows.map(mapRowToListingItem);
}

export async function getListings(
  filters: ListingFilters
): Promise<ListingItem[]> {
  const dataFilters: ListingFilters = { ...filters, view: "list" };
  const cached = unstable_cache(
    async () => fetchListingsFromDb(dataFilters),
    ["listings", listingFiltersCacheKey(dataFilters)],
    { revalidate: 300 }
  );
  return cached();
}
