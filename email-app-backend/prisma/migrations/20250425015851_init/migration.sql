-- CreateTable
CREATE TABLE "EmailTag" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailTag_pkey" PRIMARY KEY ("id")
);
