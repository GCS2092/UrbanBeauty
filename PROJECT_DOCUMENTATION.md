# UrbanBeauty ? Documentation Compl?te

> Version: 2026-02-06

## 1) R?sum? ex?cutif
UrbanBeauty est une plateforme PWA mobile?first qui combine une marketplace de produits beaut? et une place de march? de services (coiffure, manucure, etc.). Le syst?me est multi?r?les (CLIENT, COIFFEUSE, MANICURISTE, VENDEUSE, ADMIN) et propose dashboards d?di?s, r?servations, commandes, avis, notifications et messagerie.

Objectif: offrir une exp?rience unifi?e pour l?achat de produits, la prise de rendez?vous et la gestion des prestataires, avec back?office complet pour l?administration.

## 2) P?rim?tre fonctionnel (non?technique)

### Parcours CLIENT
- S?inscrire / se connecter
- Consulter services et produits
- Ajouter au panier, commander
- R?server un service
- Laisser un avis
- G?rer profil et adresses de livraison

### Parcours COIFFEUSE / MANICURISTE
- G?rer services (CRUD)
- G?rer r?servations, cr?neaux
- Consulter analytics
- G?rer profil / portfolio

### Parcours VENDEUSE
- G?rer produits (CRUD)
- Traiter commandes
- Suivre analytics ventes

### Parcours ADMIN
- G?rer utilisateurs, cat?gories, produits, services
- Param?trer la plateforme
- Acc?der aux analytics globaux

## 3) R?les & autorisations
R?les: `CLIENT`, `COIFFEUSE`, `MANICURISTE`, `VENDEUSE`, `ADMIN`.

- Les dashboards sont filtr?s par r?le.
- Le r?le est stock? dans `public.users` et/ou dans `auth.users` (user_metadata), avec un m?canisme de lecture prioritaire c?t? app.
- Le changement de r?le est op?r? par l?ADMIN depuis le dashboard ou en DB.

## 4) Architecture technique

### Frontend
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- React Query + Zustand
- PWA (Service Worker + Offline queue)

Dossier: `frontend/`

### Backend
- NestJS + TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- Auth via Supabase Auth (JWT + RLS)

Dossier: `backend/`

### Base de donn?es
- PostgreSQL (Supabase)
- Auth g?r? par sch?ma `auth`
- Donn?es applicatives dans sch?ma `public`

### Int?grations
- Supabase Auth + DB
- Firebase Cloud Messaging (notifications push)
- Cloudinary (images)
- Paiements: Stripe, Paystack (pr?vu / partiellement int?gr?)

## 5) Mod?le de donn?es (principales tables)

Sch?ma `public` (extraits):
- `users`: r?le, blocage, actif, email
- `profiles`: infos personnelles + stats prestataires
- `services`: services propos?s, ratings
- `products`: produits, stock, ratings
- `orders`, `order_items`: commandes marketplace
- `bookings`: r?servations services
- `reviews`: avis + r?ponses prestataires
- `shipping_addresses`: adresses client
- `notifications`, `notification_tokens`
- `chat_conversations`, `messages`
- `quick_replies`
- `coupons`
- `hair_style_requests`
- `maintenance_settings`

Sch?ma `auth` (Supabase):
- `users`, `sessions`, `identities` etc.

## 6) Authentification & s?curit?
- Supabase Auth comme source d?identit? principale.
- Session persist?e c?t? client (Supabase JS client).
- RLS sur tables sensibles (ex: `public.users`, `public.profiles`, `shipping_addresses`).

Recommandation: activer/maintenir les policies RLS suivantes:
- `public.users`: lecture par `auth.uid()::text = id`
- `public.profiles`: lecture par `auth.uid() = userId`
- `shipping_addresses`: CRUD par `auth.uid() = userId`

## 7) API (vue d?ensemble)

### Auth
- `/api/auth/register`, `/api/auth/login`, `/api/auth/me`

### Produits / Services
- `/api/products`, `/api/services`

### Commandes / R?servations
- `/api/orders`, `/api/bookings`

### Avis
- `/api/reviews`

### Messagerie
- `/api/chat` / `/api/messages`

### Analytics
- `/api/analytics/provider`, `/api/analytics/seller`, `/api/analytics/me`

### Divers
- `/api/shipping-addresses`
- `/api/notifications`
- `/api/maintenance`

## 8) PWA & mode hors?ligne
- Service Worker + cache statique
- File d?attente offline pour POST/PUT/PATCH/DELETE
- Synchronisation automatique quand la connexion revient

Fichiers cl?s:
- `frontend/public/sw.js`
- `frontend/src/lib/offline.ts`
- `frontend/src/components/offline/OfflineProvider.tsx`

## 9) D?ploiement

### Frontend
- Vercel
- Root: `frontend`
- Build: `npm run build`

### Backend
- Render (ou Railway)
- Root: `backend`
- Build: `npm install && npm run build`
- Start: `npm run start:prod`

## 10) Variables d?environnement

### Backend (`backend/.env`)
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `CLOUDINARY_*`
- `FIREBASE_*`

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_FIREBASE_*`

## 11) Lancer en local

```bash
# Backend
cd backend
npm install
npx prisma generate
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

## 12) Probl?mes rencontr?s & solutions apport?es

### 1. Redirections apr?s login (Supabase)
**Sympt?me:** login OK, mais navigation renvoie vers login.
**Cause:** session Supabase non persist?e / non ?cout?e; RLS bloquante; r?le non accessible.
**Solution:**
- Listener `onAuthStateChange` + `getSession` c?t? frontend.
- RLS policy sur `public.users` et `public.profiles`.
- Synchronisation `auth.users` ? `public.users` (id identiques).

### 2. 403 sur `/auth/v1/user`
**Cause:** mauvaise gestion d?acc?s ou session invalid?e.
**Solution:**
- V?rif `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans Vercel.
- Persist session + refresh token activ?s.

### 3. 404 tables Supabase (shipping_addresses, analytics_provider, etc.)
**Cause:** tables inexistantes ou endpoints frontend pointent vers Supabase REST alors que backend g?re la logique.
**Solution:**
- Cr?ation des tables `shipping_addresses`, `hair_style_requests`, etc.
- Ajustement des endpoints si n?cessaire pour appeler backend.

### 4. Prisma schema d?salign?
**Sympt?me:** milliers d?erreurs TS / champs manquants.
**Cause:** sch?ma DB incomplet vs code.
**Solution:**
- Ajout des colonnes et tables manquantes (orders, services, products, reviews, etc.).
- Mise ? jour `schema.prisma` + `prisma generate`.

### 5. Quick Replies 400
**Cause:** DTOs sans validation NestJS.
**Solution:** ajout `@IsString`, `@IsOptional`, etc. (voir `ANALYSE_FONCTIONNALITES_ET_AMELIORATIONS.md`).

### 6. Render 503 (backend en veille)
**Cause:** free tier Render (sleep auto).
**Solution:** gestion d?erreur c?t? frontend + r?veil backend.

### 7. Firebase warnings
**Cause:** variables d?env manquantes.
**Solution:** fallback config + doc `NOTIFICATIONS_FIREBASE_SETUP.md`.

## 13) Roadmap
- Paiements complets (Stripe/Paystack/MTN)
- Optimisations offline + cache API
- Am?lioration UX mobile
- Analytics avanc?s

## 14) Ressources & docs internes
- `README.md`
- `GUIDE_SUPABASE.md`
- `DEPLOIEMENT.md`
- `GUIDE_DEPLOIEMENT_VERCEL_BACKEND.md`
- `NOTIFICATIONS_FIREBASE_SETUP.md`
- `TROUBLESHOOTING_API.md`
- `ANALYSE_FONCTIONNALITES_ET_AMELIORATIONS.md`

---

### Notes
Ce document synth?tise l??tat du projet et les corrections appliqu?es jusqu?au 06/02/2026.
