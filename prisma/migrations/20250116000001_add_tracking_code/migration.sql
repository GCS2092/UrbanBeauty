-- Migration: Add trackingCode to Order table
-- Created: 2025-01-16

-- Add trackingCode column
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "trackingCode" TEXT;

-- Create unique index for trackingCode
CREATE UNIQUE INDEX IF NOT EXISTS "Order_trackingCode_key" ON "Order"("trackingCode");

-- Generate tracking codes for existing orders
DO $$
DECLARE
    order_record RECORD;
    new_tracking_code TEXT;
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    i INTEGER;
BEGIN
    FOR order_record IN SELECT id FROM "Order" WHERE "trackingCode" IS NULL LOOP
        new_tracking_code := 'UB-';
        FOR i IN 1..6 LOOP
            new_tracking_code := new_tracking_code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
        
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM "Order" WHERE "trackingCode" = new_tracking_code) LOOP
            new_tracking_code := 'UB-';
            FOR i IN 1..6 LOOP
                new_tracking_code := new_tracking_code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
            END LOOP;
        END LOOP;
        
        UPDATE "Order" SET "trackingCode" = new_tracking_code WHERE id = order_record.id;
    END LOOP;
END $$;

