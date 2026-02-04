-- Script pour insérer un profile minimal pour un utilisateur existant
-- Remplacez les valeurs par les colonnes obligatoires de votre table profiles
-- Exemple pour l'ID d'utilisateur vu dans vos logs : 0e4d5bb8-37e9-4dab-84b9-311518d6bac5

INSERT INTO public.profiles ("id", "userId", "firstName", "lastName")
VALUES (
  gen_random_uuid()::text, -- ou mettez un id explicite si nécessaire
  '0e4d5bb8-37e9-4dab-84b9-311518d6bac5',
  'Utilisateur',
  'Test'
);

-- Adaptez les colonnes selon les contraintes NOT NULL de votre table.
-- Exécutez ce script depuis psql connecté à votre base (ou via Supabase SQL editor).