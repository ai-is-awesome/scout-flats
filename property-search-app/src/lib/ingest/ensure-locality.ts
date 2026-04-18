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

  const city = await prisma.city.upsert({
    where: { cityKey: input.cityKey },
    create: {
      cityKey: input.cityKey,
      name: input.cityName ?? input.cityKey,
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
