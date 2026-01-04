-- Migration: Add reviews system, ratings, and hair style request updates
-- Created: 2025-01-16

-- 1. Add providerReply and providerReplyAt to Review table
ALTER TABLE "Review" 
ADD COLUMN IF NOT EXISTS "providerReply" TEXT,
ADD COLUMN IF NOT EXISTS "providerReplyAt" TIMESTAMP(3);

-- 2. Create ReviewHelpful table
CREATE TABLE IF NOT EXISTS "ReviewHelpful" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewHelpful_pkey" PRIMARY KEY ("id")
);

-- 3. Add foreign keys and constraints for ReviewHelpful
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ReviewHelpful_reviewId_fkey'
    ) THEN
        ALTER TABLE "ReviewHelpful" 
        ADD CONSTRAINT "ReviewHelpful_reviewId_fkey" 
        FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ReviewHelpful_userId_fkey'
    ) THEN
        ALTER TABLE "ReviewHelpful" 
        ADD CONSTRAINT "ReviewHelpful_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 4. Add unique constraint for ReviewHelpful
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ReviewHelpful_reviewId_userId_key'
    ) THEN
        ALTER TABLE "ReviewHelpful" 
        ADD CONSTRAINT "ReviewHelpful_reviewId_userId_key" UNIQUE ("reviewId", "userId");
    END IF;
END $$;

-- 5. Add indexes for ReviewHelpful
CREATE INDEX IF NOT EXISTS "ReviewHelpful_reviewId_idx" ON "ReviewHelpful"("reviewId");
CREATE INDEX IF NOT EXISTS "ReviewHelpful_userId_idx" ON "ReviewHelpful"("userId");

-- 6. Add rating and reviewCount to Product table (if they don't exist)
ALTER TABLE "Product" 
ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- 7. Add rating and reviewCount to Service table (if they don't exist)
ALTER TABLE "Service" 
ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- 8. Add providerId to HairStyleRequest table (if it doesn't exist)
ALTER TABLE "HairStyleRequest" 
ADD COLUMN IF NOT EXISTS "providerId" TEXT;

-- 9. Add foreign key for providerId in HairStyleRequest
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'HairStyleRequest_providerId_fkey'
    ) THEN
        ALTER TABLE "HairStyleRequest" 
        ADD CONSTRAINT "HairStyleRequest_providerId_fkey" 
        FOREIGN KEY ("providerId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 10. Add indexes for HairStyleRequest
CREATE INDEX IF NOT EXISTS "HairStyleRequest_providerId_idx" ON "HairStyleRequest"("providerId");
CREATE INDEX IF NOT EXISTS "HairStyleRequest_status_idx" ON "HairStyleRequest"("status");

-- 11. Update existing products and services to set reviewCount based on existing reviews
UPDATE "Product" 
SET "reviewCount" = (
    SELECT COUNT(*) 
    FROM "Review" 
    WHERE "Review"."productId" = "Product"."id" 
    AND "Review"."isPublished" = true
),
"rating" = (
    SELECT ROUND(AVG("rating")::numeric, 1)::double precision
    FROM "Review" 
    WHERE "Review"."productId" = "Product"."id" 
    AND "Review"."isPublished" = true
)
WHERE EXISTS (
    SELECT 1 FROM "Review" 
    WHERE "Review"."productId" = "Product"."id"
);

UPDATE "Service" 
SET "reviewCount" = (
    SELECT COUNT(*) 
    FROM "Review" 
    WHERE "Review"."serviceId" = "Service"."id" 
    AND "Review"."isPublished" = true
),
"rating" = (
    SELECT ROUND(AVG("rating")::numeric, 1)::double precision
    FROM "Review" 
    WHERE "Review"."serviceId" = "Service"."id" 
    AND "Review"."isPublished" = true
)
WHERE EXISTS (
    SELECT 1 FROM "Review" 
    WHERE "Review"."serviceId" = "Service"."id"
);

