/*
  Warnings:

  - Added the required column `licenseLevel` to the `Dependency` table without a default value. This is not possible if the table is not empty.
  - Made the column `response` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Dependency" DROP COLUMN "licenseLevel",
ADD COLUMN     "licenseLevel" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "response" SET NOT NULL;

-- DropEnum
DROP TYPE "public"."LicenseLevel";

-- CreateIndex
CREATE INDEX "Dependency_id_projectId_idx" ON "Dependency"("id", "projectId");

-- CreateIndex
CREATE INDEX "Project_id_profileId_idx" ON "Project"("id", "profileId");
