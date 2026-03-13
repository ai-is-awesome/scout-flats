/*
  Warnings:

  - A unique constraint covering the columns `[source,propertyUniqueId]` on the table `Property` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[source,propertyInternalId]` on the table `Property` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Property_localityKey_idx" ON "Property"("localityKey");

-- CreateIndex
CREATE INDEX "Property_source_idx" ON "Property"("source");

-- CreateIndex
CREATE INDEX "Property_genderAllowed_idx" ON "Property"("genderAllowed");

-- CreateIndex
CREATE UNIQUE INDEX "Property_source_propertyUniqueId_key" ON "Property"("source", "propertyUniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Property_source_propertyInternalId_key" ON "Property"("source", "propertyInternalId");
