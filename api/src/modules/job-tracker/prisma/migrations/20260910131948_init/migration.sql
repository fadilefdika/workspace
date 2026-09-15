-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "ApplicationSource" AS ENUM ('LINKEDIN', 'JOBSTREET', 'GLINTS', 'COMPANY_WEBSITE', 'REFERRAL', 'CAREER_FAIR', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'SCREENING', 'INTERVIEW_HR', 'INTERVIEW_USER', 'OFFER', 'ACCEPTED', 'REJECTED', 'GHOSTED');

-- CreateEnum
CREATE TYPE "StageOutcome" AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "industry" TEXT,
    "location" TEXT,
    "website_url" TEXT,
    "career_page_url" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "research_notes" TEXT,
    "deal_breakers" TEXT[],
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "applied_date" TIMESTAMP(3) NOT NULL,
    "source" "ApplicationSource" NOT NULL,
    "application_link" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "status_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contact_person" TEXT,
    "contact_info" TEXT,
    "next_follow_up" TIMESTAMP(3),
    "follow_up_count" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "salary_range" TEXT,
    "attachment_url" TEXT,
    "archived_job_description" TEXT,
    "fit_score" INTEGER,
    "fit_notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_stages" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "stage_name" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3),
    "feedback" TEXT,
    "outcome" "StageOutcome" NOT NULL DEFAULT 'PENDING',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_stages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_stages" ADD CONSTRAINT "interview_stages_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
