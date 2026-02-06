# UrbanBeauty ? Probl?mes rencontr?s & solutions

> Version: 2026-02-06

## 1) Redirections apr?s login (Supabase)
**Sympt?me:** login OK, mais navigation renvoie vers login.
**Cause:** session Supabase non persist?e / non ?cout?e; RLS bloquante; r?le non accessible.
**Solution:**
- Listener `onAuthStateChange` + `getSession` c?t? frontend.
- RLS policy sur `public.users` et `public.profiles`.
- Synchronisation `auth.users` ? `public.users` (id identiques).

## 2) 403 sur `/auth/v1/user`
**Cause:** mauvaise config d?environnement ou session invalide.
**Solution:**
- V?rif `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Persist session + refresh token activ?s.

## 3) 404 tables Supabase (shipping_addresses, analytics_provider, hair_style_requests)
**Cause:** tables inexistantes ou endpoints frontend pointant vers Supabase REST alors que backend calcule.
**Solution:**
- Cr?ation des tables n?cessaires.
- Ajustement des endpoints pour appeler le backend si besoin.

## 4) Prisma schema d?salign?
**Sympt?me:** milliers d?erreurs TS / champs manquants.
**Cause:** sch?ma DB incomplet vs code.
**Solution:**
- Ajout des colonnes et tables manquantes.
- Mise ? jour `schema.prisma` + `prisma generate`.

## 5) Quick Replies 400
**Cause:** DTOs sans validation NestJS.
**Solution:** ajout des d?corateurs de validation.

## 6) Render 503 (backend en veille)
**Cause:** free tier Render (sleep auto).
**Solution:** gestion d?erreur c?t? frontend + r?veil backend.

## 7) Firebase warnings
**Cause:** variables d?env manquantes.
**Solution:** fallback config + doc `NOTIFICATIONS_FIREBASE_SETUP.md`.
