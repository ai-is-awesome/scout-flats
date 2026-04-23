import {
  PropertySource,
  PropertyStatus,
  UploadedVia,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/types/zolo_api_types/db";
import type { StanzaLivingPropertySearchType } from "@property-search/shared-types";
import { ensureLocality } from "@/lib/ingest/ensure-locality";
import {
  deriveCityKey,
  deriveLocalityKey,
  mapStanzaGender,
} from "@/lib/ingest/stanza/mappers";
import { buildStanzaRoomVariants } from "@/lib/ingest/stanza/build-room-variants";
import { buildStanzaImagesCreate } from "@/lib/ingest/stanza/build-images";
import { NextResponse } from "next/server";

// Accelerate caps interactive tx timeout at 15s on the current plan.
const INGEST_TX_OPTIONS = {
  maxWait: 10_000,
  timeout: 15_000,
} as const;

export async function POST(request: Request) {
  const body = (await request.json()) as {
    data: StanzaLivingPropertySearchType[];
  };
  const properties = body.data ?? [];

  let processed = 0;

  for (const property of properties) {
    console.log(
      "Processing property with residenceId: ",
      property.residenceId,
      property.name
    );
    const propertyUniqueId = String(property.residenceId);
    const address = property.addressResponseDTO?.[0];

    const { cityId, localityId } = await ensureLocality({
      cityKey: deriveCityKey(property.citySlug, property.cityName),
      cityName: property.cityName,
      localityKey: deriveLocalityKey(property.micromarketName),
      localityName: property.micromarketName,
    });

    const existingProperty = await prisma.property.findUnique({
      where: {
        source_propertyUniqueId: {
          source: PropertySource.STANZA,
          propertyUniqueId,
        },
      },
    });

    const roomVariantsCreate = buildStanzaRoomVariants(
      property.residenceOccupancies ?? [],
      property.discountPercentage ?? null
    );

    await prisma.$transaction(async (tx) => {
      const db = tx as typeof prisma;

      let propertyId: string;

      if (existingProperty) {
        propertyId = existingProperty.id;
        await db.propertyImage.deleteMany({ where: { propertyId } });
        await db.roomVariant.deleteMany({ where: { propertyId } });

        await db.property.update({
          where: { id: propertyId },
          data: {
            name: property.name ?? undefined,
            addressLine1: address?.line1 ?? undefined,
            addressLine2: address?.line2 ?? undefined,
            cityId: cityId ?? undefined,
            localityId: localityId ?? undefined,
            genderAllowed: mapStanzaGender(property.gender) ?? undefined,
            averageRating: property.rating ?? undefined,
            latitude: address?.latitude ?? property.latitude ?? undefined,
            longitude: address?.longitude ?? undefined,
            seoTitle: property.seoTitle ?? undefined,
            seoDescription: property.seoDescription ?? undefined,
            seoMeta: property.seoKeywords ?? undefined,
            propertyInternalId: propertyUniqueId,
            providerJson: property as unknown as object,
            uploadedVia: UploadedVia.SCRIPT,
          },
        });
      } else {
        const created = await db.property.create({
          data: {
            source: PropertySource.STANZA,
            uploadedVia: UploadedVia.SCRIPT,
            propertyUniqueId,
            propertyInternalId: propertyUniqueId,
            providerJson: property as unknown as object,
            name: property.name ?? undefined,
            addressLine1: address?.line1 ?? undefined,
            addressLine2: address?.line2 ?? undefined,
            cityId: cityId ?? undefined,
            localityId: localityId ?? undefined,
            genderAllowed: mapStanzaGender(property.gender) ?? undefined,
            averageRating: property.rating ?? undefined,
            latitude: address?.latitude ?? property.latitude ?? undefined,
            longitude: address?.longitude ?? undefined,
            seoTitle: property.seoTitle ?? undefined,
            seoDescription: property.seoDescription ?? undefined,
            seoMeta: property.seoKeywords ?? undefined,
            status: PropertyStatus.ACTIVE,
          },
        });
        propertyId = created.id;
      }

      const imagesCreate = buildStanzaImagesCreate(
        propertyId,
        property.images ?? []
      );
      if (imagesCreate.length > 0) {
        await db.propertyImage.createMany({ data: imagesCreate });
      }

      for (const rv of roomVariantsCreate) {
        const createdVariant = await db.roomVariant.create({
          data: {
            propertyId,
            sharingType: rv.sharingType,
            roomName: rv.roomName,
            basePrice: rv.basePrice,
            variantLabel: rv.variantLabel,
          },
        });
        for (const plan of rv.pricingPlans) {
          await db.pricingPlan.create({
            data: {
              roomVariantId: createdVariant.id,
              durationMonths: plan.durationMonths,
              effectiveMonthlyPrice: plan.effectiveMonthlyPrice,
              isBasePlan: plan.isBasePlan,
              discountPercentage: plan.discountPercentage ?? undefined,
            },
          });
        }
      }
    }, INGEST_TX_OPTIONS);

    processed++;
  }

  return NextResponse.json({ ok: true, processed });
}
