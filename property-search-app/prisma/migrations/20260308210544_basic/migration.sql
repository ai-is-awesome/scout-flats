-- CreateEnum
CREATE TYPE "PropertySource" AS ENUM ('ZOLO', 'COLIVE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('PG_CHAIN', 'PG_INDEPENDENT', 'HOSTEL', 'COLIVING', 'APARTMENT');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNISEX');

-- CreateEnum
CREATE TYPE "ProprtyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING_REVIEW', 'REJECTED');

-- CreateEnum
CREATE TYPE "UploadedVia" AS ENUM ('SCRIPT', 'USER');

-- CreateEnum
CREATE TYPE "SharingType" AS ENUM ('PRIVATE_ROOM', 'DOUBLE_SHARING', 'TRIPLE_SHARING', 'TWO_BHK', 'THREE_BHK', 'STUDIO_APARTMENT');

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "source" "PropertySource" NOT NULL,
    "uploadedVia" "UploadedVia" NOT NULL DEFAULT 'SCRIPT',
    "propertyUniqueId" TEXT,
    "propertyInternalId" TEXT,
    "providerRawData" JSONB,
    "name" TEXT,
    "description" TEXT,
    "genderAllowed" "Gender",
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "locality" TEXT,
    "localityKey" TEXT,
    "cityKey" TEXT,
    "city" TEXT,
    "propertyState" TEXT,
    "propertyCategory" TEXT,
    "averageRating" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "ProprtyStatus" NOT NULL DEFAULT 'ACTIVE',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoMeta" TEXT,
    "providerJson" JSONB,
    "userId" TEXT,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyImage" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomVariant" (
    "id" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sharingType" "SharingType",
    "propertyId" TEXT NOT NULL,
    "roomName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "depositMonths" INTEGER,
    "noticePeriodInDays" INTEGER,
    "basePrice" INTEGER NOT NULL,

    CONSTRAINT "RoomVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "discountPercentage" DOUBLE PRECISION,
    "depositMonths" INTEGER,
    "noticePeriodInDays" INTEGER,
    "effectiveMonthlyPrice" INTEGER,
    "isBasePlan" BOOLEAN NOT NULL,

    CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoOffer" (
    "id" TEXT NOT NULL,
    "pricingPlanId" TEXT NOT NULL,
    "promoCode" TEXT,
    "discountPercentage" DOUBLE PRECISION,
    "applicableMonths" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),

    CONSTRAINT "PromoOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyImage_propertyId_idx" ON "PropertyImage"("propertyId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomVariant" ADD CONSTRAINT "RoomVariant_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingPlan" ADD CONSTRAINT "PricingPlan_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoOffer" ADD CONSTRAINT "PromoOffer_pricingPlanId_fkey" FOREIGN KEY ("pricingPlanId") REFERENCES "PricingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
