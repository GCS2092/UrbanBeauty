-- AlterEnum (only if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'STAFF' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Role')) THEN
    ALTER TYPE "Role" ADD VALUE 'STAFF';
  END IF;
END $$;

-- CreateEnum (only if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VariantDisplayMode') THEN
    CREATE TYPE "VariantDisplayMode" AS ENUM ('SIZE_FIRST', 'COLOR_FIRST');
  END IF;
END $$;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "variantDisplayMode" "VariantDisplayMode" NOT NULL DEFAULT 'SIZE_FIRST';

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN IF NOT EXISTS "color" TEXT;

-- Sync storeId columns (added directly in DB)
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "storeId" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "storeId" TEXT;

-- Sync foreign keys for storeId (drop + recreate pour éviter les conflits)
ALTER TABLE "Coupon" DROP CONSTRAINT IF EXISTS "Coupon_storeId_fkey";
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_storeId_fkey"
  FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_storeId_fkey";
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey"
  FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;