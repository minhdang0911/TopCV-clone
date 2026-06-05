-- CreateEnum
CREATE TYPE "JobLevel" AS ENUM ('NHAN_VIEN', 'TRUONG_NHOM', 'TRUONG_PHO_PHONG', 'QUAN_LY_GIAM_SAT', 'TRUONG_CHI_NHANH', 'PHO_GIAM_DOC', 'GIAM_DOC', 'THUC_TAP_SINH');

-- CreateEnum
CREATE TYPE "WorkingType" AS ENUM ('TOAN_THOI_GIAN', 'BAN_THOI_GIAN', 'FREELANCE', 'THUC_TAP', 'REMOTE');

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "is_saturday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "level" "JobLevel",
ADD COLUMN     "working_type" "WorkingType";
