/*
  Warnings:

  - You are about to drop the column `licenseLevel` on the `Dependency` table. All the data in the column will be lost.
  - Added the required column `licenseType` to the `Dependency` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dependency" DROP COLUMN "licenseLevel",
ADD COLUMN     "licenseType" TEXT NOT NULL;
