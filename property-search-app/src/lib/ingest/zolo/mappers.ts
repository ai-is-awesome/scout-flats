import { Gender } from "@/generated/prisma/enums";

export const ZOLO_GENDER_TO_PRISMA_GENDER: Record<string, Gender> = {
  men: "MALE",
  women: "FEMALE",
  couple: "UNISEX",
};
