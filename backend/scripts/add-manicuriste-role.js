const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addManicuristeRole() {
  try {
    console.log('Vérification de l\'enum Role...');
    
    // Vérifier si MANICURISTE existe déjà
    const checkQuery = `
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Role')
      ORDER BY enumsortorder;
    `;
    
    const existingRoles = await prisma.$queryRawUnsafe(checkQuery);
    console.log('Valeurs actuelles de l\'enum Role:', existingRoles);
    
    const hasManicuriste = existingRoles.some(r => r.enumlabel === 'MANICURISTE');
    
    if (hasManicuriste) {
      console.log('✅ MANICURISTE existe déjà dans l\'enum Role');
      return;
    }
    
    console.log('MANICURISTE n\'existe pas. Ajout en cours...');
    
    // Ajouter MANICURISTE en recréant l'enum
    // Il faut d'abord supprimer la valeur par défaut, puis la remettre après
    const addQuery = `
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'MANICURISTE' 
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Role')
        ) THEN
          -- Étape 1: Supprimer la valeur par défaut temporairement
          ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
          
          -- Étape 2: Créer le nouveau type enum
          CREATE TYPE "Role_new" AS ENUM ('CLIENT', 'COIFFEUSE', 'MANICURISTE', 'VENDEUSE', 'ADMIN');
          
          -- Étape 3: Modifier la colonne pour utiliser le nouveau type
          ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
          
          -- Étape 4: Remettre la valeur par défaut
          ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CLIENT'::"Role_new";
          
          -- Étape 5: Supprimer l'ancien enum
          DROP TYPE "Role";
          
          -- Étape 6: Renommer le nouveau enum
          ALTER TYPE "Role_new" RENAME TO "Role";
          
          RAISE NOTICE 'MANICURISTE ajouté avec succès';
        END IF;
      END $$;
    `;
    
    await prisma.$executeRawUnsafe(addQuery);
    
    // Vérifier le résultat
    const updatedRoles = await prisma.$queryRawUnsafe(checkQuery);
    console.log('✅ Valeurs après ajout:', updatedRoles);
    console.log('✅ MANICURISTE ajouté avec succès à l\'enum Role!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addManicuristeRole()
  .then(() => {
    console.log('Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
