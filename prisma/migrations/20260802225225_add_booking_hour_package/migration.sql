/*
  Warnings:

  - Added the required column `hour_package_id` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "hour_package_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "bookings_hour_package_id_idx" ON "bookings"("hour_package_id");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_hour_package_id_fkey" FOREIGN KEY ("hour_package_id") REFERENCES "hour_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
