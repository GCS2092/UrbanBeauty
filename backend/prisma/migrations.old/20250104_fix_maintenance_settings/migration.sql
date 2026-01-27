-- 1. Supprimer la table existante (elle est incorrecte)
DROP TABLE IF EXISTS "MaintenanceSettings";

-- 2. Recréer la table conformément au schema.prisma
CREATE TABLE "MaintenanceSettings" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),

  "isBookingDisabled" BOOLEAN NOT NULL DEFAULT false,
  "bookingMessage" TEXT,

  "isChatDisabled" BOOLEAN NOT NULL DEFAULT false,
  "chatMessage" TEXT,

  "isPrestatairesDisabled" BOOLEAN NOT NULL DEFAULT false,
  "prestatairesMessage" TEXT,

  "isAuthDisabled" BOOLEAN NOT NULL DEFAULT false,
  "authMessage" TEXT,

  "updatedBy" TEXT,

  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
