/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Dependency` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Dependency_name_key" ON "Dependency"("name");
