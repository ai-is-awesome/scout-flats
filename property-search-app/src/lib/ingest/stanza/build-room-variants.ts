import type { StanzaLivingPricingType } from "@property-search/shared-types";
import type { SharingType as SharingTypeEnum } from "@/generated/prisma/client";
import { mapStanzaOccupancyToSharing } from "./mappers";

export type StanzaRoomVariantCreate = {
  sharingType: SharingTypeEnum;
  roomName: string;
  basePrice: number;
  variantLabel: string | null;
  pricingPlans: Array<{
    durationMonths: number;
    effectiveMonthlyPrice: number;
    isBasePlan: boolean;
    discountPercentage: number | null;
  }>;
};

/**
 * One residenceOccupancy (Single/Double/Triple) → one RoomVariant with one PricingPlan.
 * Stanza only exposes monthly pricing at the occupancy level — simpler than Zolo's nested variants.
 */
export function buildStanzaRoomVariants(
  occupancies: StanzaLivingPricingType[],
  propertyDiscountPercentage: number | null | undefined
): StanzaRoomVariantCreate[] {
  return occupancies.map((occ) => {
    const price = Math.round(
      occ.discountedPrice ?? occ.inventoryPrice ?? occ.startingPrice ?? 0
    );
    return {
      sharingType: mapStanzaOccupancyToSharing(occ.occupancyOccupancy),
      roomName: occ.occupancyName ?? "Room",
      basePrice: price,
      variantLabel: occ.pricingPlan ?? null,
      pricingPlans: [
        {
          durationMonths: 1,
          effectiveMonthlyPrice: price,
          isBasePlan: true,
          discountPercentage:
            propertyDiscountPercentage && propertyDiscountPercentage > 0
              ? propertyDiscountPercentage
              : null,
        },
      ],
    };
  });
}
