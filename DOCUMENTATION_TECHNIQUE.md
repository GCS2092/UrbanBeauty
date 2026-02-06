# UrbanBeauty ? Documentation Technique

> Version: 2026-02-06

## 1) Architecture technique

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

## 2) Mod?le de donn?es (principales tables)

Sch?ma `public`:
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
- `users`, `sessions`, `identities`, etc.

## 3) Authentification & s?curit?
- Supabase Auth comme source d?identit? principale.
- Session persist?e c?t? client (Supabase JS client).
- RLS sur tables sensibles.

Policies recommand?es:
- `public.users`: lecture par `auth.uid()::text = id`
- `public.profiles`: lecture par `auth.uid() = userId`
- `shipping_addresses`: CRUD par `auth.uid() = userId`

## 4) API (vue d?ensemble)

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

## 5) PWA & mode hors?ligne
- Service Worker + cache statique
- File d?attente offline pour POST/PUT/PATCH/DELETE
- Synchronisation automatique quand la connexion revient

Fichiers cl?s:
- `frontend/public/sw.js`
- `frontend/src/lib/offline.ts`
- `frontend/src/components/offline/OfflineProvider.tsx`

## 6) D?ploiement (technique)

### Frontend
- Vercel
- Root: `frontend`
- Build: `npm run build`

### Backend
- Render (ou Railway)
- Root: `backend`
- Build: `npm install && npm run build`
- Start: `npm run start:prod`

## 7) Variables d?environnement

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

## 8) Lancer en local

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
