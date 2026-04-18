-- Drop FK and index that reference the old column name
ALTER TABLE "Property" DROP CONSTRAINT "Property_cityRefId_fkey";
DROP INDEX "Property_cityRefId_idx";

-- Rename column (preserves the 146 backfilled values)
ALTER TABLE "Property" RENAME COLUMN "cityRefId" TO "cityId";

-- Recreate index and FK under the new name
CREATE INDEX "Property_cityId_idx" ON "Property"("cityId");
ALTER TABLE "Property" ADD CONSTRAINT "Property_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop the legacy string columns now that they've been backfilled into relations
DROP INDEX IF EXISTS "Property_localityKey_idx";
ALTER TABLE "Property"
  DROP COLUMN "locality",
  DROP COLUMN "localityKey",
  DROP COLUMN "cityKey",
  DROP COLUMN "city",
  DROP COLUMN "propertyState";
