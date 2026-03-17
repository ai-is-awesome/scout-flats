import { Gender } from "@/generated/prisma/enums";

export const ZOLO_GENDER_TO_PRISMA_GENDER: Record<string, Gender> = {
  men: Gender.MALE,
  male: Gender.MALE,
  women: Gender.FEMALE,
  female: Gender.FEMALE,
  couple: Gender.UNISEX,
  unisex: Gender.UNISEX,
};

export function mapZoloGenderToPrisma(
  zoloGender: string | null | undefined
): Gender | undefined {
  if (zoloGender == null || zoloGender === "") return undefined;
  return ZOLO_GENDER_TO_PRISMA_GENDER[zoloGender.trim().toLowerCase()];
}
