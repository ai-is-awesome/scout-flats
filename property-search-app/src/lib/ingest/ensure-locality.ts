import { prisma } from "@/lib/types/zolo_api_types/db";

type EnsureLocalityInput = {
  cityKey: string | null | undefined;
  cityName: string | null | undefined;
  stateName?: string | null | undefined;
  localityKey: string | null | undefined;
  localityName: string | null | undefined;
};

type EnsureLocalityResult = {
  cityId: string | null;
  localityId: string | null;
};

// Providers send different names for the same city (Zolo: "bangalore", Stanza: "bengaluru").
// Canonicalize at ingest so we don't split a city across two rows again.
const CITY_KEY_ALIASES: Record<string, string> = {
  bangalore: "bengaluru",
};

function canonicalCityKey(key: string): string {
  return CITY_KEY_ALIASES[key] ?? key;
}

/**
 * Upserts City + Locality rows from raw provider strings and returns their ids.
 * Auto-creates unknown localities — consistent with the dev-stage "capture everything" approach.
 * Switch to manual review later once the canonical list stabilizes.
 */
export async function ensureLocality(
  input: EnsureLocalityInput
): Promise<EnsureLocalityResult> {
  if (!input.cityKey) {
    return { cityId: null, localityId: null };
  }

  const cityKey = canonicalCityKey(input.cityKey);

  const city = await prisma.city.upsert({
    where: { cityKey },
    create: {
      cityKey,
      name: input.cityName ?? cityKey,
      stateName: input.stateName ?? undefined,
    },
    update: {},
  });

  if (!input.localityKey) {
    return { cityId: city.id, localityId: null };
  }

  const locality = await prisma.locality.upsert({
    where: {
      cityId_localityKey: {
        cityId: city.id,
        localityKey: input.localityKey,
      },
    },
    create: {
      cityId: city.id,
      localityKey: input.localityKey,
      name: input.localityName ?? input.localityKey,
    },
    update: {},
  });

  return { cityId: city.id, localityId: locality.id };
}
