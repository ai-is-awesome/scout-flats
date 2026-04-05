/** URL-driven filter state for the listings page (matches FilterBar value strings). */
export type ListingFilters = {
  q: string;
  /** Exact locality filter (URL `locality`); takes precedence over `q` in queries. */
  locality: string;
  provider: "all" | "zolo" | "colive";
  gender: "all" | "male" | "female" | "unisex";
  type: string;
  occupancy: "all" | "single" | "double" | "triple" | "quad";
  priceMin: number;
  priceMax: number;
  /** Only affects layout; not used for data fetching or cache key. */
  view: "list" | "map";
};

/** Serializable public shape for listing cards and map (from DB + light mapping). */
export type ListingItem = {
  id: string;
  name: string;
  provider: "zolo" | "colive" | "other";
  gender: "male" | "female" | "unisex";
  /** Short label for the type badge (e.g. PG, Co-living). */
  typeLabel: string;
  area: string;
  city: string;
  /** Optional; used for search on mock / if stored later. */
  pincode?: string;
  rating: number;
  reviewCount: number;
  images: string[];
  amenities: string[];
  pricing: { occupancy: string; price: number; originalPrice: number }[];
  discount?: { label: string; percentage: number };
  foodIncluded: boolean;
  availableFrom: string;
  highlights: string[];
};

function firstParam(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const v = sp[key];
  if (Array.isArray(v)) return v[0];
  return v;
}

/** Parse Next.js `searchParams` into `ListingFilters`. */
export function parseListingFilters(
  sp: Record<string, string | string[] | undefined>
): ListingFilters {
  const provider = firstParam(sp, "provider");
  const gender = firstParam(sp, "gender");
  const type = firstParam(sp, "type");
  const occupancy = firstParam(sp, "occupancy");
  const view = firstParam(sp, "view");
  const q = firstParam(sp, "q") ?? "";
  const locality = firstParam(sp, "locality") ?? "";
  const priceMinRaw = firstParam(sp, "priceMin");
  const priceMaxRaw = firstParam(sp, "priceMax");

  const priceMin = Math.max(
    0,
    Number.isFinite(Number(priceMinRaw)) ? Number(priceMinRaw) : 0
  );
  const priceMax = Math.min(
    30000,
    Number.isFinite(Number(priceMaxRaw)) ? Number(priceMaxRaw) : 30000
  );

  return {
    q: q.trim(),
    locality: locality.trim(),
    provider:
      provider === "zolo" || provider === "colive" ? provider : "all",
    gender:
      gender === "male" || gender === "female" || gender === "unisex"
        ? gender
        : "all",
    type: type && type.length > 0 ? type : "all",
    occupancy:
      occupancy === "single" ||
      occupancy === "double" ||
      occupancy === "triple" ||
      occupancy === "quad"
        ? occupancy
        : "all",
    priceMin,
    priceMax: Math.max(priceMin, priceMax),
    view: view === "map" ? "map" : "list",
  };
}

/** Stable cache key segment for `unstable_cache` (excludes `view`). */
export function listingFiltersCacheKey(filters: ListingFilters): string {
  const { view: _v, ...rest } = filters;
  return JSON.stringify(rest);
}

export function filtersToSearchParams(
  f: ListingFilters
): Record<string, string> {
  const out: Record<string, string> = {};
  if (f.q) out.q = f.q;
  if (f.locality) out.locality = f.locality;
  if (f.provider !== "all") out.provider = f.provider;
  if (f.gender !== "all") out.gender = f.gender;
  if (f.type !== "all") out.type = f.type;
  if (f.occupancy !== "all") out.occupancy = f.occupancy;
  if (f.priceMin > 0) out.priceMin = String(f.priceMin);
  if (f.priceMax < 30000) out.priceMax = String(f.priceMax);
  if (f.view === "map") out.view = "map";
  return out;
}
