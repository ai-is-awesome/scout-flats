-- Fix typo: DB has "ProprtyStatus", schema expects "PropertyStatus".
CREATE TYPE "PropertyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING_REVIEW', 'REJECTED');

ALTER TABLE "Property"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Property"
  ALTER COLUMN "status" TYPE "PropertyStatus"
  USING "status"::text::"PropertyStatus";

ALTER TABLE "Property"
  ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

DROP TYPE "ProprtyStatus";
