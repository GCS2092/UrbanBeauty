-- CreateTable
CREATE TABLE "HairStyleRequest" (
    "id" TEXT NOT NULL,
    "lookbookItemId" TEXT,
    "lookbookItemName" TEXT,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "clientEmail" TEXT,
    "hairStyleType" TEXT NOT NULL,
    "numberOfBraids" INTEGER,
    "braidType" TEXT,
    "numberOfPackages" INTEGER,
    "preferredTime" TIMESTAMP(3),
    "preferredDate" TIMESTAMP(3),
    "additionalDetails" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HairStyleRequest_pkey" PRIMARY KEY ("id")
);

