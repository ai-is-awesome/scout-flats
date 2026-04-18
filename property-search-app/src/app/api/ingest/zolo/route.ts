import {
  PropertySource,
  PropertyStatus,
  SharingType,
  UploadedVia,
} from "@/generated/prisma/enums";
import type { SharingType as SharingTypeEnum } from "@/generated/prisma/client";
import { prisma } from "@/lib/types/zolo_api_types/db";
import type {
  ZoloCombinedCenterSearchAndPricingType,
  ZoloRoomPricingApiObject,
  ZoloRoomVariantTypeList,
} from "@property-search/shared-types";
import { buildPropertyImagesCreate } from "@/lib/ingest/zolo/build-property-images";
import { mapZoloGenderToPrisma } from "@/lib/ingest/zolo/mappers";
import zoloTransformer from "@/lib/ingest/zolo/transform";
import { ensureLocality } from "@/lib/ingest/ensure-locality";

const ZOLO_SHARING_TO_ENUM: Record<string, SharingTypeEnum> = {
  "1 Sharing": SharingType.PRIVATE_ROOM,
  "2 Sharing": SharingType.DOUBLE_SHARING,
  "3 Sharing": SharingType.TRIPLE_SHARING,
  "Private Room": SharingType.PRIVATE_ROOM,
  "Two Sharing": SharingType.DOUBLE_SHARING,
  "Three Sharing": SharingType.TRIPLE_SHARING,
  Private: SharingType.PRIVATE_ROOM,
  Studio: SharingType.STUDIO_APARTMENT,
};

function mapZoloSharingType(zoloSharingType: string): SharingTypeEnum {
  return ZOLO_SHARING_TO_ENUM[zoloSharingType] ?? SharingType.DOUBLE_SHARING;
}

/** Prisma default interactive tx timeout is 5s; Zolo ingest does many nested creates per property. */
const INGEST_TX_OPTIONS = {
  maxWait: 15_000,
  timeout: 120_000,
} as const;

type PlanCreate = {
  durationMonths: number;
  effectiveMonthlyPrice: number;
  isBasePlan: boolean;
  discountPercentage: number | null;
  promoOffers?: {
    create: Array<{
      applicableMonths: number;
      discountPercentage: number;
      promoCode: string | null;
    }>;
  };
};

type RoomVariantCreate = {
  sharingType: SharingTypeEnum;
  roomName: string;
  basePrice: number;
  variantLabel: string | null;
  variantDetails: object | null;
  pricingPlans: PlanCreate[];
};

type ZoloPackageRow = ZoloRoomVariantTypeList["packagesList"][number];

function buildPricingPlans(
  packagesList: ZoloPackageRow[],
  topDiscount: ZoloRoomPricingApiObject["discountedPrice"] | undefined
): PlanCreate[] {
  return packagesList.map((pkg) => ({
    durationMonths: pkg.durationValue ?? 1,
    effectiveMonthlyPrice: Math.round(pkg.discountedPrice ?? pkg.price ?? 0),
    isBasePlan: pkg.isBasePackage ?? false,
    discountPercentage:
      pkg.discountOffered != null && (pkg.price ?? 0) > 0
        ? (pkg.discountOffered / (pkg.price ?? 1)) * 100
        : null,
    promoOffers: topDiscount
      ? {
          create: [
            {
              applicableMonths: topDiscount.noOfMonths ?? 1,
              discountPercentage: topDiscount.discountPercent ?? 0,
              promoCode: topDiscount.rentalPromoCode || null,
            },
          ],
        }
      : undefined,
  }));
}

function getVariantDetails(variant: unknown): object | null {
  const v = variant as { variantDetails?: object } | undefined;
  return v?.variantDetails ?? null;
}

/**
 * Zolo puts `variants` and `roomVariantTypeList` as siblings on each pricing item.
 * When lengths match, pair by index and persist variant metadata in `variantDetails`.
 * Otherwise still emit rows from `roomVariantTypeList` (and/or orphan `variants`) with best-effort pairing.
 */
function buildRoomVariantsCreate(
  pricingItems: ZoloRoomPricingApiObject[]
): RoomVariantCreate[] {
  const result: RoomVariantCreate[] = [];

  for (const item of pricingItems) {
    const sharingType = mapZoloSharingType(item.sharingType ?? "");
    const basePrice = Math.round(item.minRent ?? 0);
    const topDiscount = item.discountedPrice;
    const variants = (item.variants ?? []) as Array<(typeof item.variants)[0]>;
    const typeList = item.roomVariantTypeList ?? [];
    console.log("Building roomvariants create");

    const lengthsMatch =
      variants.length === typeList.length && typeList.length > 0;

    if (typeList.length > 0) {
      for (let i = 0; i < typeList.length; i++) {
        const typeEntry = typeList[i];
        const variant =
          i < variants.length
            ? variants[i]
            : variants.length === 1
            ? variants[0]
            : undefined;

        const variantDetails =
          lengthsMatch && i < variants.length
            ? getVariantDetails(variants[i])
            : variant
            ? getVariantDetails(variant)
            : null;

        result.push({
          sharingType,
          roomName: variant?.roomName ?? item.sharingType ?? "Room",
          basePrice,
          variantLabel: typeEntry.roomVariantType ?? null,
          variantDetails,
          pricingPlans: buildPricingPlans(
            [...(typeEntry.packagesList ?? [])] as ZoloPackageRow[],
            topDiscount
          ),
        });
      }
    } else if (variants.length > 0) {
      for (const variant of variants) {
        result.push({
          sharingType,
          roomName: variant.roomName ?? item.sharingType ?? "Room",
          basePrice,
          variantLabel: null,
          variantDetails: getVariantDetails(variant),
          pricingPlans: [],
        });
      }
    } else {
      result.push({
        sharingType,
        roomName: item.sharingType ?? "Room",
        basePrice,
        variantLabel: null,
        variantDetails: null,
        pricingPlans: [],
      });
    }
  }

  return result;
}

// Check 2016 zolo code
export async function POST(request: Request) {
  const body = (await request.json()) as {
    data: ZoloCombinedCenterSearchAndPricingType[];
  };
  const zoloProperties = body.data;

  for (const property of zoloProperties) {
    const existingProperty = await prisma.property.findUnique({
      where: {
        source_propertyUniqueId: {
          source: PropertySource.ZOLO,
          propertyUniqueId: property.basicData.zoloCode,
        },
      },
      include: { roomVariants: true },
    });

    if (existingProperty) {
      const { basicData, detailed_pricing_info } = property;
      const [longitude, latitude] = basicData.location ?? [0, 0];

      const { cityId, localityId } = await ensureLocality({
        cityKey: basicData.cityKey,
        cityName: basicData.city,
        stateName: basicData.propertyState,
        localityKey: basicData.localityKey,
        localityName: basicData.locality,
      });

      await prisma.$transaction(async (tx) => {
        const db = tx as typeof prisma;
        await db.propertyImage.deleteMany({
          where: { propertyId: existingProperty.id },
        });
        await db.roomVariant.deleteMany({
          where: { propertyId: existingProperty.id },
        });

        await db.property.update({
          where: { id: existingProperty.id },
          data: {
            name: basicData.name ?? undefined,
            description: basicData.description ?? undefined,
            addressLine1: basicData.addressLine1 ?? undefined,
            addressLine2: basicData.addressLine2 ?? undefined,
            cityId: cityId ?? undefined,
            localityId: localityId ?? undefined,
            propertyCategory: basicData.propertyCategory ?? undefined,
            averageRating: basicData.averageRating ?? undefined,
            latitude: latitude ? Number(latitude) : undefined,
            longitude: longitude ? Number(longitude) : undefined,
            propertyInternalId: basicData.id ?? undefined,
            providerJson: property as unknown as object,
            uploadedVia: UploadedVia.SCRIPT,
          },
        });

        const imagesCreate = buildPropertyImagesCreate(
          existingProperty.id,
          property.images ?? []
        );
        if (imagesCreate.length > 0) {
          await db.propertyImage.createMany({ data: imagesCreate });
        }

        const roomVariantsCreate = buildRoomVariantsCreate(
          detailed_pricing_info ?? []
        );

        for (const rv of roomVariantsCreate) {
          const createdVariant = await db.roomVariant.create({
            data: {
              propertyId: existingProperty.id,
              sharingType: rv.sharingType,
              roomName: rv.roomName,
              basePrice: rv.basePrice,
              variantLabel: rv.variantLabel,
              variantDetails: rv.variantDetails ? rv.variantDetails : undefined,
            },
          });
          for (const plan of rv.pricingPlans) {
            const createdPlan = await db.pricingPlan.create({
              data: {
                roomVariantId: createdVariant.id,
                durationMonths: plan.durationMonths,
                effectiveMonthlyPrice: plan.effectiveMonthlyPrice,
                isBasePlan: plan.isBasePlan,
                discountPercentage: plan.discountPercentage ?? undefined,
              },
            });
            if (plan.promoOffers?.create?.length) {
              await db.promoOffer.createMany({
                data: plan.promoOffers.create.map((po) => ({
                  pricingPlanId: createdPlan.id,
                  applicableMonths: po.applicableMonths,
                  discountPercentage: po.discountPercentage,
                  promoCode: po.promoCode,
                })),
              });
            }
          }
        }
      }, INGEST_TX_OPTIONS);
    } else {
      const trimmed_property =
        zoloTransformer.get_trimmed_property_for_db(property);
      const { basicData, images, detailed_pricing_info } = property;
      const [locLong, locLat] = basicData.location ?? [0, 0];

      const { cityId, localityId } = await ensureLocality({
        cityKey: basicData.cityKey,
        cityName: basicData.city,
        stateName: basicData.propertyState,
        localityKey: basicData.localityKey,
        localityName: basicData.locality,
      });

      await prisma.$transaction(async (tx) => {
        const db = tx as typeof prisma;
        const createdProperty = await db.property.create({
          data: {
            source: PropertySource.ZOLO,
            uploadedVia: UploadedVia.SCRIPT,
            propertyUniqueId: basicData.zoloCode,
            propertyInternalId: basicData.id,
            providerJson: trimmed_property as object,
            name: basicData.name ?? undefined,
            description: basicData.description ?? undefined,
            genderAllowed: mapZoloGenderToPrisma(basicData.gender),
            addressLine1: basicData.addressLine1 ?? undefined,
            addressLine2: basicData.addressLine2 ?? undefined,
            cityId: cityId ?? undefined,
            localityId: localityId ?? undefined,
            propertyCategory: basicData.propertyCategory ?? undefined,
            averageRating: basicData.averageRating ?? undefined,
            latitude: locLat != null ? Number(locLat) : undefined,
            longitude: locLong != null ? Number(locLong) : undefined,
            status: PropertyStatus.ACTIVE,
          },
        });

        const imagesCreate = buildPropertyImagesCreate(
          createdProperty.id,
          images ?? []
        );
        if (imagesCreate.length > 0) {
          await db.propertyImage.createMany({ data: imagesCreate });
        }

        const roomVariantsCreate = buildRoomVariantsCreate(
          detailed_pricing_info ?? []
        );
        for (const rv of roomVariantsCreate) {
          const createdVariant = await db.roomVariant.create({
            data: {
              propertyId: createdProperty.id,
              sharingType: rv.sharingType,
              roomName: rv.roomName,
              basePrice: rv.basePrice,
              variantLabel: rv.variantLabel,
              variantDetails: rv.variantDetails ? rv.variantDetails : undefined,
            },
          });
          for (const plan of rv.pricingPlans) {
            const createdPlan = await db.pricingPlan.create({
              data: {
                roomVariantId: createdVariant.id,
                durationMonths: plan.durationMonths,
                effectiveMonthlyPrice: plan.effectiveMonthlyPrice,
                isBasePlan: plan.isBasePlan,
                discountPercentage: plan.discountPercentage ?? undefined,
              },
            });
            if (plan.promoOffers?.create?.length) {
              await db.promoOffer.createMany({
                data: plan.promoOffers.create.map((po) => ({
                  pricingPlanId: createdPlan.id,
                  applicableMonths: po.applicableMonths,
                  discountPercentage: po.discountPercentage,
                  promoCode: po.promoCode,
                })),
              });
            }
          }
        }
      }, INGEST_TX_OPTIONS);
    }
  }

  return Response.json({
    message: "Data received! Total items: " + zoloProperties.length,
  });
}
