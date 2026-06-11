-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWING', 'INTERVIEW', 'OFFERED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EmailTemplateType" AS ENUM ('REJECTION', 'INTERVIEW_INVITE', 'OFFER_LETTER');

-- CreateTable: job_locations
CREATE TABLE "job_locations" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "province_code" TEXT,
    "province_name" TEXT,
    "district_code" TEXT,
    "district_name" TEXT,
    "address" TEXT,

    CONSTRAINT "job_locations_pkey" PRIMARY KEY ("id")
);

-- Data migration: copy existing single-location data from jobs to job_locations
INSERT INTO "job_locations" ("id", "job_id", "province_code", "province_name", "district_code", "district_name", "address")
SELECT
    gen_random_uuid()::text,
    "id",
    "province_code",
    "province_name",
    "district_code",
    "district_name",
    "address"
FROM "jobs"
WHERE "province_code" IS NOT NULL
   OR "district_code" IS NOT NULL
   OR "address" IS NOT NULL;

-- AlterTable: remove old location columns from jobs
ALTER TABLE "jobs"
    DROP COLUMN IF EXISTS "address",
    DROP COLUMN IF EXISTS "province_code",
    DROP COLUMN IF EXISTS "province_name",
    DROP COLUMN IF EXISTS "district_code",
    DROP COLUMN IF EXISTS "district_name";

-- AlterTable: add email_notification_enabled to employer_profiles
ALTER TABLE "employer_profiles"
    ADD COLUMN "email_notification_enabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: applications
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "location_id" TEXT,
    "resume_id" TEXT,
    "cv_file_url" TEXT,
    "cover_letter" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable: saved_jobs
CREATE TABLE "saved_jobs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: email_templates
CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL,
    "employer_id" TEXT NOT NULL,
    "type" "EmailTemplateType" NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "applications_job_id_candidate_id_key" ON "applications"("job_id", "candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_jobs_user_id_job_id_key" ON "saved_jobs"("user_id", "job_id");

-- AddForeignKey
ALTER TABLE "job_locations" ADD CONSTRAINT "job_locations_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "job_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "employer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
