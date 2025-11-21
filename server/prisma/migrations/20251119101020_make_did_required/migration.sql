/*
  Warnings:

  - Made the column `did` on table `Organization` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Organization_name_key";

-- Delete organizations without a DID (they're invalid without DID)
-- Since DID is now the primary identifier, organizations without DID cannot exist
-- First, delete associated API keys (foreign key constraint)
DELETE FROM "ApiKey" WHERE "organizationId" IN (SELECT "id" FROM "Organization" WHERE "did" IS NULL);

-- Then delete organizations without DID
DELETE FROM "Organization" WHERE "did" IS NULL;

-- DropIndex (remove unique constraint from name)
DROP INDEX IF EXISTS "Organization_name_key";

-- Make did required (now that all NULL values are removed)
ALTER TABLE "Organization" ALTER COLUMN "did" SET NOT NULL;
