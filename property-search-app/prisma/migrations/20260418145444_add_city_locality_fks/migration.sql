-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "cityRefId" TEXT,
ADD COLUMN     "localityId" TEXT;

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "cityKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateName" TEXT,
    "countryCode" TEXT NOT NULL DEFAULT 'IN',

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Locality" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "localityKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Locality_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_cityKey_key" ON "City"("cityKey");

-- CreateIndex
CREATE INDEX "Locality_cityId_idx" ON "Locality"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "Locality_cityId_localityKey_key" ON "Locality"("cityId", "localityKey");

-- CreateIndex
CREATE INDEX "Property_cityRefId_idx" ON "Property"("cityRefId");

-- CreateIndex
CREATE INDEX "Property_localityId_idx" ON "Property"("localityId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_cityRefId_fkey" FOREIGN KEY ("cityRefId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_localityId_fkey" FOREIGN KEY ("localityId") REFERENCES "Locality"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locality" ADD CONSTRAINT "Locality_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
