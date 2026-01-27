-- AlterTable
-- Add providerId to Category to link categories to providers

-- Step 1: Add providerId column (nullable, for global categories)
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "providerId" TEXT;

-- Step 2: Add foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Category_providerId_fkey'
    ) THEN
        ALTER TABLE "Category" 
        ADD CONSTRAINT "Category_providerId_fkey" 
        FOREIGN KEY ("providerId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Step 3: Create index for providerId
CREATE INDEX IF NOT EXISTS "Category_providerId_idx" ON "Category"("providerId");

-- Step 4: Drop old unique constraint on name
ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_name_key";

-- Step 5: Add new unique constraint on (name, providerId)
-- This allows same category name for different providers, but unique per provider
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Category_name_providerId_key'
    ) THEN
        ALTER TABLE "Category" 
        ADD CONSTRAINT "Category_name_providerId_key" UNIQUE ("name", "providerId");
    END IF;
END $$;

-- Step 6: Drop old unique constraint on slug
ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_slug_key";

-- Step 7: Add new unique constraint on slug (slug can be unique globally or per provider)
-- For now, we'll make slug unique globally but it can be modified later if needed
-- Note: The service will generate unique slugs by including providerId in the slug generation

