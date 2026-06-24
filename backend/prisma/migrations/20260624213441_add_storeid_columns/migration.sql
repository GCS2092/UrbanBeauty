-- AlterTable Product
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "storeId" TEXT;
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" 
  FOREIGN KEY ("storeId") REFERENCES "Store"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable Coupon
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "storeId" TEXT;
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_storeId_fkey" 
  FOREIGN KEY ("storeId") REFERENCES "Store"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;