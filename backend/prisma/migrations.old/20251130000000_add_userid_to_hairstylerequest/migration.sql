-- AlterTable
ALTER TABLE "HairStyleRequest" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- CreateIndex (si pas déjà existant)
CREATE INDEX IF NOT EXISTS "HairStyleRequest_userId_idx" ON "HairStyleRequest"("userId");

