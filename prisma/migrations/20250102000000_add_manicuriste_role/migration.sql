-- AlterEnum
-- This migration adds 'MANICURISTE' to the Role enum
-- PostgreSQL requires recreating the enum type to add a new value

-- Step 1: Check if MANICURISTE already exists, if not, add it
DO $$ 
BEGIN
    -- Check if the value already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'MANICURISTE' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Role')
    ) THEN
        -- Create new enum type with all values including MANICURISTE
        CREATE TYPE "Role_new" AS ENUM ('CLIENT', 'COIFFEUSE', 'MANICURISTE', 'VENDEUSE', 'ADMIN');
        
        -- Update the User table column to use the new enum
        ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
        
        -- Drop the old enum type
        DROP TYPE "Role";
        
        -- Rename the new enum to the original name
        ALTER TYPE "Role_new" RENAME TO "Role";
    END IF;
END $$;
