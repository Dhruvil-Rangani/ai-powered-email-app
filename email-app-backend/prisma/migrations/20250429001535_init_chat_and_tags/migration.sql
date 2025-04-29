/*
  Warnings:

  - You are about to drop the `EmailTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('user', 'assistant');

-- DropTable
DROP TABLE "EmailTag";

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- CreateIndex
CREATE INDEX "Tag_emailId_idx" ON "Tag"("emailId");

-- CreateIndex
CREATE INDEX "Tag_label_idx" ON "Tag"("label");
