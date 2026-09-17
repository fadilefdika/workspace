/*
  Warnings:

  - The values [DRAFTING,REVIEW,SCHEDULED] on the enum `ContentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContentStatus_new" AS ENUM ('IDEA', 'DRAFT', 'READY', 'PUBLISHED');
ALTER TABLE "content_items" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "content_items" ALTER COLUMN "status" TYPE "ContentStatus_new" USING ("status"::text::"ContentStatus_new");
ALTER TYPE "ContentStatus" RENAME TO "ContentStatus_old";
ALTER TYPE "ContentStatus_new" RENAME TO "ContentStatus";
DROP TYPE "ContentStatus_old";
ALTER TABLE "content_items" ALTER COLUMN "status" SET DEFAULT 'IDEA';
COMMIT;

-- AlterTable
ALTER TABLE "content_items" ADD COLUMN     "metrics_comments" INTEGER,
ADD COLUMN     "metrics_likes" INTEGER,
ADD COLUMN     "metrics_reach" INTEGER,
ADD COLUMN     "metrics_shares" INTEGER,
ADD COLUMN     "published_date" TIMESTAMP(3),
ADD COLUMN     "theme_tag" TEXT;
