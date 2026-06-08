/*
  Warnings:

  - You are about to drop the column `is_saturday` on the `jobs` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "WorkingDays" AS ENUM ('MON_FRI', 'MON_SAT', 'MON_SUN', 'FLEXIBLE', 'CUSTOM');

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "is_saturday",
ADD COLUMN     "working_days" "WorkingDays",
ADD COLUMN     "working_days_note" TEXT;
