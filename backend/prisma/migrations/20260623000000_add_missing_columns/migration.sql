-- CreateEnum
CREATE TYPE "VariantDisplayMode" AS ENUM ('SIZE_FIRST', 'COLOR_FIRST');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'STAFF';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "variantDisplayMode" "VariantDisplayMode" NOT NULL DEFAULT 'SIZE_FIRST';

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN "color" TEXT;
