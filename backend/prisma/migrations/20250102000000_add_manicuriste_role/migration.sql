-- AlterEnum
-- This migration adds 'MANICURISTE' to the Role enum
-- Note: PostgreSQL doesn't support ALTER TYPE ADD VALUE in a transaction block
-- This needs to be run manually or via a migration tool that handles it

-- For PostgreSQL, we need to recreate the enum type
-- First, create a new enum with the additional value
DO $$ BEGIN
    CREATE TYPE "Role_new" AS ENUM ('CLIENT', 'COIFFEUSE', 'MANICURISTE', 'VENDEUSE', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update the column to use the new enum
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");

-- Drop the old enum and rename the new one
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";

