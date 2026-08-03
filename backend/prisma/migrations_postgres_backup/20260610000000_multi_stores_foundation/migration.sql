-- Multi-boutiques foundation migration
-- Default main store id used for backfill of existing rows

-- CreateEnum
CREATE TYPE "StoreStaffRole" AS ENUM ('MANAGER', 'ACCOUNTANT', 'COMMERCIAL', 'WAREHOUSE', 'DELIVERY');
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'VALIDATED', 'CANCELLED');
CREATE TYPE "CreditNoteStatus" AS ENUM ('ISSUED', 'APPLIED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "StockMovementType" ADD VALUE 'TRANSFER_OUT';
ALTER TYPE "StockMovementType" ADD VALUE 'TRANSFER_IN';

-- CreateTable Store
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Store_code_key" ON "Store"("code");

INSERT INTO "Store" ("id", "code", "name", "address", "isMain", "isActive", "taxRate", "discountRate", "currency", "exchangeRate", "createdAt", "updatedAt")
VALUES ('clmainstore000000000001', 'UBT', 'UrbanBeauty Siège', 'Dakar, Sénégal', true, true, 0, 0, 'XOF', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- CreateTable UserStore
CREATE TABLE "UserStore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "role" "StoreStaffRole" NOT NULL DEFAULT 'MANAGER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserStore_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserStore_userId_storeId_key" ON "UserStore"("userId", "storeId");
CREATE INDEX "UserStore_storeId_idx" ON "UserStore"("storeId");

ALTER TABLE "UserStore" ADD CONSTRAINT "UserStore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserStore" ADD CONSTRAINT "UserStore_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable StockTransfer
CREATE TABLE "StockTransfer" (
    "id" TEXT NOT NULL,
    "transferNumber" TEXT NOT NULL,
    "fromStoreId" TEXT NOT NULL,
    "toStoreId" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "validatedBy" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockTransfer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StockTransfer_transferNumber_key" ON "StockTransfer"("transferNumber");
CREATE INDEX "StockTransfer_fromStoreId_idx" ON "StockTransfer"("fromStoreId");
CREATE INDEX "StockTransfer_toStoreId_idx" ON "StockTransfer"("toStoreId");

ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_fromStoreId_fkey" FOREIGN KEY ("fromStoreId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_toStoreId_fkey" FOREIGN KEY ("toStoreId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable StockTransferItem
CREATE TABLE "StockTransferItem" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "StockTransferItem_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "StockTransferItem" ADD CONSTRAINT "StockTransferItem_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "StockTransfer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockTransferItem" ADD CONSTRAINT "StockTransferItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockTransferItem" ADD CONSTRAINT "StockTransferItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable CreditNote
CREATE TABLE "CreditNote" (
    "id" TEXT NOT NULL,
    "creditNoteNumber" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT,
    "status" "CreditNoteStatus" NOT NULL DEFAULT 'ISSUED',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditNote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CreditNote_creditNoteNumber_key" ON "CreditNote"("creditNoteNumber");
CREATE INDEX "CreditNote_storeId_idx" ON "CreditNote"("storeId");

ALTER TABLE "CreditNote" ADD CONSTRAINT "CreditNote_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CreditNote" ADD CONSTRAINT "CreditNote_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Product overstockAlert
ALTER TABLE "Product" ADD COLUMN "overstockAlert" INTEGER;

-- Order store fields
ALTER TABLE "Order" ADD COLUMN "storeId" TEXT;
ALTER TABLE "Order" ADD COLUMN "storeDiscount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "reservationExpiresAt" TIMESTAMP(3);

UPDATE "Order" SET "storeId" = 'clmainstore000000000001' WHERE "storeId" IS NULL;

ALTER TABLE "Order" ALTER COLUMN "storeId" SET NOT NULL;
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Order_storeId_idx" ON "Order"("storeId");
CREATE INDEX "Order_status_reservationExpiresAt_idx" ON "Order"("status", "reservationExpiresAt");

-- Invoice store fields
ALTER TABLE "Invoice" ADD COLUMN "storeId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "storeDiscount" INTEGER NOT NULL DEFAULT 0;

UPDATE "Invoice" SET "storeId" = 'clmainstore000000000001' WHERE "storeId" IS NULL;

ALTER TABLE "Invoice" ALTER COLUMN "storeId" SET NOT NULL;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Invoice_storeId_idx" ON "Invoice"("storeId");

-- InvoiceSequence: migrate to composite key per store
CREATE TABLE "InvoiceSequence_new" (
    "storeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "InvoiceSequence_new_pkey" PRIMARY KEY ("storeId","year")
);

INSERT INTO "InvoiceSequence_new" ("storeId", "year", "lastNumber")
SELECT 'clmainstore000000000001', "year", "lastNumber" FROM "InvoiceSequence";

DROP TABLE "InvoiceSequence";
ALTER TABLE "InvoiceSequence_new" RENAME TO "InvoiceSequence";
ALTER TABLE "InvoiceSequence" RENAME CONSTRAINT "InvoiceSequence_new_pkey" TO "InvoiceSequence_pkey";
ALTER TABLE "InvoiceSequence" ADD CONSTRAINT "InvoiceSequence_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AuditLog storeId
ALTER TABLE "AuditLog" ADD COLUMN "storeId" TEXT;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "AuditLog_storeId_idx" ON "AuditLog"("storeId");

-- StockMovement storeId + transferId
ALTER TABLE "StockMovement" ADD COLUMN "storeId" TEXT;
ALTER TABLE "StockMovement" ADD COLUMN "transferId" TEXT;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "StockMovement_storeId_idx" ON "StockMovement"("storeId");

-- Expense storeId
ALTER TABLE "Expense" ADD COLUMN "storeId" TEXT;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Expense_storeId_idx" ON "Expense"("storeId");
