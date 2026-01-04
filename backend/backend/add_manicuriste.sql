-- Ajouter MANICURISTE à l'enum Role si il n'existe pas déjà
DO $$ 
BEGIN
    -- Vérifier si MANICURISTE existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'MANICURISTE' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Role')
    ) THEN
        -- Créer le nouveau type enum avec toutes les valeurs
        CREATE TYPE "Role_new" AS ENUM ('CLIENT', 'COIFFEUSE', 'MANICURISTE', 'VENDEUSE', 'ADMIN');
        
        -- Mettre à jour la colonne User.role
        ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
        
        -- Supprimer l'ancien enum
        DROP TYPE "Role";
        
        -- Renommer le nouveau enum
        ALTER TYPE "Role_new" RENAME TO "Role";
        
        RAISE NOTICE 'Valeur MANICURISTE ajoutée avec succès à l''enum Role';
    ELSE
        RAISE NOTICE 'La valeur MANICURISTE existe déjà dans l''enum Role';
    END IF;
END $$;

-- Vérifier le résultat
SELECT enumlabel, enumsortorder 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Role')
ORDER BY enumsortorder;

