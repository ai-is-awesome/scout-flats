import { Gender, SharingType } from "@/generated/prisma/enums";
import type { SharingType as SharingTypeEnum, Gender as GenderEnum } from "@/generated/prisma/client";

export function mapStanzaGender(gender: string | null | undefined): GenderEnum | null {
  if (gender === "CO_ED") return Gender.UNISEX;
  if (gender === "MALE") return Gender.MALE;
  if (gender === "FEMALE") return Gender.FEMALE;
  return null;
}

export function mapStanzaOccupancyToSharing(
  occupancyCount: number
): SharingTypeEnum {
  if (occupancyCount <= 1) return SharingType.PRIVATE_ROOM;
  if (occupancyCount === 2) return SharingType.DOUBLE_SHARING;
  return SharingType.TRIPLE_SHARING;
}

/** "HSR Layout" → "hsr_layout" */
export function deriveLocalityKey(micromarketName: string | null | undefined): string | null {
  if (!micromarketName) return null;
  const normalized = micromarketName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
  return normalized || null;
}

/** Prefer the provider's slug; fall back to snake-cased cityName. */
export function deriveCityKey(
  citySlug: string | null | undefined,
  cityName: string | null | undefined
): string | null {
  const candidate = citySlug?.trim().toLowerCase() || cityName?.trim().toLowerCase();
  if (!candidate) return null;
  return candidate.replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") || null;
}
