/*
  Warnings:

  - The values [NEW,READY,SENT,ARCHIVED,REJECTED] on the enum `JobStatus` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Job` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `aiReason` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `aiScore` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `customerRating` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `customerReviews` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `duplicateOf` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `isDuplicate` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `isSuitable` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `priceMax` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `priceMin` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `processedAt` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `rawHtml` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `scrapedAt` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `sourceId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `dailyLimit` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastReset` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sentToday` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `telegramFirstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalClicked` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalReceived` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Filter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ParsedTask` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Source` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expiresAt` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalFileName` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalFilePath` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalRows` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PRO', 'BUSINESS', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "Marketplace" AS ENUM ('WILDBERRIES', 'YANDEX_MARKET', 'OZON', 'KAZANEXPRESS');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('PENDING', 'DOWNLOADING_IMAGE', 'PROCESSING', 'UPLOADING_IMAGES', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('MAIN', 'FEATURES', 'BENEFITS', 'DETAILS');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('LOCAL', 'GOOGLE_DRIVE', 'YANDEX_DISK');

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'UPLOADING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('GOOGLE_DRIVE', 'YANDEX_DISK', 'GOOGLE_SHEETS', 'TELEGRAM');

-- CreateEnum
CREATE TYPE "ScannerJobStatus" AS ENUM ('NEW', 'PROCESSING', 'READY', 'REJECTED', 'SENT', 'FAILED');

-- AlterEnum
BEGIN;
CREATE TYPE "JobStatus_new" AS ENUM ('PENDING', 'UPLOADING', 'PROCESSING', 'GENERATING', 'UPLOADING_IMAGES', 'GENERATING_CSV', 'COMPLETED', 'FAILED', 'EXPIRED');
ALTER TABLE "Job" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Job" ALTER COLUMN "status" TYPE "JobStatus_new" USING ("status"::text::"JobStatus_new");
ALTER TYPE "JobStatus" RENAME TO "JobStatus_old";
ALTER TYPE "JobStatus_new" RENAME TO "JobStatus";
DROP TYPE "JobStatus_old";
ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Filter" DROP CONSTRAINT "Filter_userId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "ParsedTask" DROP CONSTRAINT "ParsedTask_sourceId_fkey";

-- DropIndex
DROP INDEX "Job_priceMin_priceMax_idx";

-- DropIndex
DROP INDEX "Job_sourceId_externalId_idx";

-- DropIndex
DROP INDEX "Job_sourceId_externalId_key";

-- DropIndex
DROP INDEX "Job_status_scrapedAt_idx";

-- DropIndex
DROP INDEX "Job_url_key";

-- DropIndex
DROP INDEX "User_isActive_idx";

-- AlterTable
ALTER TABLE "Job" DROP CONSTRAINT "Job_pkey",
DROP COLUMN "aiReason",
DROP COLUMN "aiScore",
DROP COLUMN "category",
DROP COLUMN "currency",
DROP COLUMN "customerName",
DROP COLUMN "customerRating",
DROP COLUMN "customerReviews",
DROP COLUMN "description",
DROP COLUMN "duplicateOf",
DROP COLUMN "externalId",
DROP COLUMN "isDuplicate",
DROP COLUMN "isSuitable",
DROP COLUMN "priceMax",
DROP COLUMN "priceMin",
DROP COLUMN "processedAt",
DROP COLUMN "publishedAt",
DROP COLUMN "rawHtml",
DROP COLUMN "scrapedAt",
DROP COLUMN "sentAt",
DROP COLUMN "skills",
DROP COLUMN "sourceId",
DROP COLUMN "title",
DROP COLUMN "url",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "csvDownloadUrl" TEXT,
ADD COLUMN     "csvFilePath" TEXT,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "failedRows" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "imagesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "originalFileName" TEXT NOT NULL,
ADD COLUMN     "originalFilePath" TEXT NOT NULL,
ADD COLUMN     "processedRows" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "totalRows" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ADD CONSTRAINT "Job_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Job_id_seq";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "dailyLimit",
DROP COLUMN "isActive",
DROP COLUMN "language",
DROP COLUMN "lastActive",
DROP COLUMN "lastReset",
DROP COLUMN "sentToday",
DROP COLUMN "telegramFirstName",
DROP COLUMN "totalClicked",
DROP COLUMN "totalReceived",
ADD COLUMN     "defaultMarketplace" "Marketplace" NOT NULL DEFAULT 'WILDBERRIES',
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "googleDriveToken" TEXT,
ADD COLUMN     "jobLimit" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "jobsThisMonth" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "planExpiresAt" TIMESTAMP(3),
ADD COLUMN     "totalImages" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalJobs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "yandexDiskToken" TEXT,
ALTER COLUMN "telegramId" DROP NOT NULL;

-- DropTable
DROP TABLE "Filter";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "ParsedTask";

-- DropTable
DROP TABLE "Source";

-- DropEnum
DROP TYPE "TaskStatus";

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "article" TEXT NOT NULL,
    "brand" TEXT,
    "name" TEXT,
    "characteristics" JSONB NOT NULL,
    "sourceImageUrl" TEXT NOT NULL,
    "sourceImageLocal" TEXT,
    "status" "ItemStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "csvData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "type" "ImageType" NOT NULL,
    "localPath" TEXT NOT NULL,
    "storageProvider" "StorageProvider" NOT NULL,
    "storageId" TEXT NOT NULL,
    "publicUrl" TEXT,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadStatus" "UploadStatus" NOT NULL DEFAULT 'PENDING',
    "uploadError" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScannerSource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "scanInterval" INTEGER NOT NULL DEFAULT 300,
    "rateLimit" INTEGER NOT NULL DEFAULT 60,
    "lastScannedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScannerSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScannerJob" (
    "id" SERIAL NOT NULL,
    "externalId" TEXT,
    "sourceId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priceMin" INTEGER,
    "priceMax" INTEGER,
    "aiScore" INTEGER NOT NULL DEFAULT 0,
    "aiReason" TEXT,
    "isSuitable" BOOLEAN NOT NULL DEFAULT false,
    "status" "ScannerJobStatus" NOT NULL DEFAULT 'NEW',
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScannerJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScannerNotification" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScannerNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" SERIAL NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "keywords" TEXT[],
    "minPrice" INTEGER,
    "maxPrice" INTEGER,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Item_jobId_status_idx" ON "Item"("jobId", "status");

-- CreateIndex
CREATE INDEX "Item_article_idx" ON "Item"("article");

-- CreateIndex
CREATE UNIQUE INDEX "Item_jobId_article_key" ON "Item"("jobId", "article");

-- CreateIndex
CREATE INDEX "Image_itemId_type_idx" ON "Image"("itemId", "type");

-- CreateIndex
CREATE INDEX "Image_storageProvider_storageId_idx" ON "Image"("storageProvider", "storageId");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_userId_provider_key" ON "Integration"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "ScannerSource_name_key" ON "ScannerSource"("name");

-- CreateIndex
CREATE INDEX "ScannerSource_name_idx" ON "ScannerSource"("name");

-- CreateIndex
CREATE INDEX "ScannerSource_type_idx" ON "ScannerSource"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ScannerJob_url_key" ON "ScannerJob"("url");

-- CreateIndex
CREATE INDEX "ScannerJob_sourceId_idx" ON "ScannerJob"("sourceId");

-- CreateIndex
CREATE INDEX "ScannerJob_status_idx" ON "ScannerJob"("status");

-- CreateIndex
CREATE INDEX "ScannerJob_isSuitable_idx" ON "ScannerJob"("isSuitable");

-- CreateIndex
CREATE INDEX "ScannerJob_scrapedAt_idx" ON "ScannerJob"("scrapedAt");

-- CreateIndex
CREATE INDEX "ScannerNotification_jobId_idx" ON "ScannerNotification"("jobId");

-- CreateIndex
CREATE INDEX "ScannerNotification_telegramId_idx" ON "ScannerNotification"("telegramId");

-- CreateIndex
CREATE INDEX "ScannerNotification_status_idx" ON "ScannerNotification"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_telegramId_key" ON "UserSettings"("telegramId");

-- CreateIndex
CREATE INDEX "UserSettings_telegramId_idx" ON "UserSettings"("telegramId");

-- CreateIndex
CREATE INDEX "Job_userId_status_idx" ON "Job"("userId", "status");

-- CreateIndex
CREATE INDEX "Job_status_createdAt_idx" ON "Job"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Job_expiresAt_idx" ON "Job"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_plan_idx" ON "User"("plan");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScannerJob" ADD CONSTRAINT "ScannerJob_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ScannerSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScannerNotification" ADD CONSTRAINT "ScannerNotification_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ScannerJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
