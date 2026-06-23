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
