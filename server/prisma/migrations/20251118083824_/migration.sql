/*
  Warnings:

  - You are about to drop the column `organizationId` on the `DocumentProof` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[did]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `issuerDid` to the `DocumentProof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactName` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DocumentProof" DROP CONSTRAINT "DocumentProof_organizationId_fkey";

-- AlterTable
ALTER TABLE "DocumentProof" DROP COLUMN "organizationId",
ADD COLUMN     "issuerDid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "contactName" TEXT NOT NULL,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "did" TEXT,
ADD COLUMN     "didPrivateKey" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_did_key" ON "Organization"("did");
