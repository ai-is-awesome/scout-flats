/*
  Warnings:

  - You are about to drop the column `roomTypeId` on the `PricingPlan` table. All the data in the column will be lost.
  - You are about to drop the column `providerRawData` on the `Property` table. All the data in the column will be lost.
  - Added the required column `roomVariantId` to the `PricingPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageOrder` to the `PropertyImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `PropertyImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PricingPlan" DROP CONSTRAINT "PricingPlan_roomTypeId_fkey";

-- AlterTable
ALTER TABLE "PricingPlan" DROP COLUMN "roomTypeId",
ADD COLUMN     "roomVariantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "providerRawData";

-- AlterTable
ALTER TABLE "PropertyImage" ADD COLUMN     "imageLabel" TEXT,
ADD COLUMN     "imageOrder" INTEGER NOT NULL,
ADD COLUMN     "imageUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RoomVariant" ADD COLUMN     "variantDetails" JSONB,
ADD COLUMN     "variantLabel" TEXT;

-- CreateIndex
CREATE INDEX "RoomVariant_propertyId_idx" ON "RoomVariant"("propertyId");

-- AddForeignKey
ALTER TABLE "PricingPlan" ADD CONSTRAINT "PricingPlan_roomVariantId_fkey" FOREIGN KEY ("roomVariantId") REFERENCES "RoomVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
