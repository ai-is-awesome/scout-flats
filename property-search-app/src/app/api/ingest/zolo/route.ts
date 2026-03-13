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
} from "@property-search/shared-types";
import zoloTransformer from "@/lib/ingest/zolo/transform";
import { ZOLO_GENDER_TO_PRISMA_GENDER } from "@/lib/ingest/zolo/mappers";

const ZOLO_SHARING_TO_ENUM: Record<string, SharingTypeEnum> = {
  "1 Sharing": SharingType.PRIVATE_ROOM,
  "2 Sharing": SharingType.DOUBLE_SHARING,
  "3 Sharing": SharingType.TRIPLE_SHARING,
  Private: SharingType.PRIVATE_ROOM,
  Studio: SharingType.STUDIO_APARTMENT,
};

function mapZoloSharingType(zoloSharingType: string): SharingTypeEnum {
  return ZOLO_SHARING_TO_ENUM[zoloSharingType] ?? SharingType.DOUBLE_SHARING;
}

function buildRoomVariantsCreate(pricingItems: ZoloRoomPricingApiObject[]): {
  sharingType: SharingTypeEnum;
  roomName: string;
  basePrice: number;
  pricingPlans: {
    create: Array<{
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
    }>;
  };
}[] {
  return pricingItems.map((item) => {
    const firstVariant = item.variants?.[0];
    const firstTypeList = firstVariant?.roomVariantTypeList?.[0];
    const packagesList = firstTypeList?.packagesList ?? [];
    const topDiscount = item.discountedPrice;

    const pricingPlansCreate = packagesList.map((pkg) => ({
      durationMonths: pkg.durationValue ?? 1,
      effectiveMonthlyPrice: Math.round(pkg.discountedPrice ?? pkg.price ?? 0),
      isBasePlan: pkg.isBasePackage ?? false,
      discountPercentage:
        pkg.discountOffered != null
          ? (pkg.discountOffered / (pkg.price || 1)) * 100
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

    return {
      sharingType: mapZoloSharingType(item.sharingType ?? ""),
      roomName: firstVariant?.roomName ?? item.sharingType ?? "Room",
      basePrice: Math.round(item.minRent ?? 0),
      pricingPlans: { create: pricingPlansCreate },
    };
  });
}

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

    console.log("Existing property: ", existingProperty);

    if (existingProperty) {
      const { basicData, detailed_pricing_info } = property;
      const [longitude, latitude] = basicData.location ?? [0, 0];

      await prisma.$transaction(async (tx) => {
        const db = tx as typeof prisma;
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
            locality: basicData.locality ?? undefined,
            localityKey: basicData.localityKey ?? undefined,
            cityKey: basicData.cityKey ?? undefined,
            city: basicData.city ?? undefined,
            propertyState: basicData.propertyState ?? undefined,
            propertyCategory: basicData.propertyCategory ?? undefined,
            averageRating: basicData.averageRating ?? undefined,
            latitude: latitude ? Number(latitude) : undefined,
            longitude: longitude ? Number(longitude) : undefined,
            propertyInternalId: basicData.id ?? undefined,
            providerJson: property as unknown as object,
            uploadedVia: UploadedVia.SCRIPT,
          },
        });

        const roomVariantsCreate = buildRoomVariantsCreate(
          detailed_pricing_info ?? []
        );

        if (roomVariantsCreate.length > 0) {
          await db.roomVariant.createMany({
            data: roomVariantsCreate.map((r) => ({
              propertyId: existingProperty.id,
              sharingType: r.sharingType,
              roomName: r.roomName,
              basePrice: r.basePrice,
            })),
          });

          const createdVariants = await db.roomVariant.findMany({
            where: { propertyId: existingProperty.id },
            orderBy: { id: "asc" },
          });

          for (
            let i = 0;
            i < createdVariants.length && i < roomVariantsCreate.length;
            i++
          ) {
            const planCreates = roomVariantsCreate[i].pricingPlans.create;
            for (const plan of planCreates) {
              const createdPlan = await db.pricingPlan.create({
                data: {
                  roomTypeId: createdVariants[i].id,
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
        }
      });
    } else {
      console.log("Creating a zolo property");
      const trimmed_property =
        zoloTransformer.get_trimmed_property_for_db(property);
      prisma.property.create({
        data: {
          source: "ZOLO",
          uploadedVia: UploadedVia.SCRIPT,
          propertyUniqueId: property.basicData.zoloCode,
          propertyInternalId: property.basicData.id,
          providerJson: trimmed_property,
          name: property.basicData.name,
          description: property.basicData.description,
          genderAllowed:
            ZOLO_GENDER_TO_PRISMA_GENDER[property.basicData.gender],
          addressLine1: property.basicData.addressLine1,
          addressLine2: property.basicData.addressLine2,
          locality: property.basicData.locality,
          localityKey: property.basicData.localityKey,
          cityKey: property.basicData.cityKey,
          city: property.basicData.city,
          propertyState: property.basicData.propertyState,
          propertyCategory: property.basicData.propertyCategory,
          averageRating: property.basicData.averageRating,
          latitude: property.basicData.location[0],
          longitude: property.basicData.location[1],
          status: PropertyStatus.ACTIVE,
        },
      });
    }
  }

  return Response.json({
    message: "Data received! Total items: " + zoloProperties.length,
  });
}
