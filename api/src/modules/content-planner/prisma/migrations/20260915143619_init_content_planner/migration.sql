-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('IDEA', 'DRAFTING', 'REVIEW', 'SCHEDULED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('LINKEDIN', 'THREADS');

-- CreateTable
CREATE TABLE "content_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "contentBody" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'IDEA',
    "platform" "Platform" NOT NULL,
    "target_date" TIMESTAMP(3),
    "publish_url" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_items_pkey" PRIMARY KEY ("id")
);
