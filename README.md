# 🌟 UrbanBeauty

**Plateforme beauté tout-en-un** - Marketplace + Services de coiffure + Gestion prestataires

## 📋 Description

UrbanBeauty est une plateforme PWA complète qui combine :
- 🛒 **Marketplace** de produits cosmétiques et accessoires beauté
- 💇‍♀️ **Réservation de services** de coiffure
- 👥 **Gestion multi-rôles** : Clients, Coiffeuses, Vendeuses, Administrateurs
- 💳 **Paiements en ligne** (Stripe, Paystack, Mobile Money)
- 📱 **PWA mobile-first** pour une expérience native

## 🏗️ Architecture

```
urbanBeauty/
├── frontend/          # Next.js 16 + Tailwind CSS + React Query
├── backend/           # NestJS + TypeScript + Prisma
├── UrbanPresentation/ # Documentation du projet
└── UrbanArchitecture/ # Architecture technique
```

## 🚀 Technologies

### Frontend
- **Next.js 16** (PWA, SSR, ISR)
- **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Zustand** (State Management)
- **React Query** (Data Fetching)
- **React Hook Form** + **Yup** (Formulaires)

### Backend
- **NestJS** (Framework Node.js)
- **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- **JWT** (Authentification)
- **Cloudinary** (Stockage images)
- **Passport** (Stratégies auth)

## 📦 Installation

### Prérequis
- Node.js 18+
- PostgreSQL
- npm ou yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Configurer DATABASE_URL
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # Configurer les variables d'environnement
npm run dev
```

## 🔐 Variables d'environnement

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/urbanbeauty"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
```

## 🗄️ Base de données

```bash
# Visualiser la base de données
cd backend
npx prisma studio
```

## 🚀 Déploiement

### Option 1 : Vercel (Frontend) + Render (Backend) ⭐ **RECOMMANDÉ**

#### Frontend sur Vercel
- ✅ **Gratuit** pour projets personnels
- ✅ **Déploiement automatique** depuis GitHub
- ✅ **CDN global** intégré (ultra-rapide)
- ✅ **Optimisé pour Next.js** (SSR, ISR, API Routes)
- ✅ **SSL automatique**
- ✅ **Preview deployments** pour chaque PR

**Configuration Vercel :**
1. Connecter le repo GitHub
2. Root Directory : `frontend`
3. Build Command : `npm run build`
4. Output Directory : `.next`
5. Variables d'environnement : Ajouter `NEXT_PUBLIC_API_URL`

#### Backend sur Render
- ✅ **Gratuit** (avec limitations : sleep après 15min inactivité)
- ✅ **PostgreSQL managé** disponible
- ✅ **Déploiement automatique** depuis GitHub
- ✅ **SSL automatique**
- ✅ **Logs en temps réel**
- ✅ **Variables d'environnement** sécurisées

**Configuration Render :**
1. Créer un **Web Service**
2. Connecter le repo GitHub
3. Root Directory : `backend`
4. Build Command : `npm install && npm run build`
5. Start Command : `npm run start:prod`
6. Ajouter PostgreSQL (Add PostgreSQL)
7. Variables d'environnement : Configurer toutes les variables

**Alternative Backend : Railway** (si Render ne convient pas)
- ✅ Pas de sleep automatique
- ✅ Plus rapide
- ⚠️ Gratuit avec limitations (500h/mois)

### Option 2 : Vercel pour tout (Frontend + Backend API Routes)

**Avantages :**
- ✅ Tout au même endroit
- ✅ Déploiement simplifié

**Inconvénients :**
- ⚠️ Backend NestJS moins optimal sur Vercel (meilleur pour Next.js API Routes)
- ⚠️ Timeout de 10s sur plan gratuit (peut être limitant pour certaines opérations)

## 📊 Comparaison Vercel vs Render

| Critère | Vercel | Render |
|---------|--------|--------|
| **Frontend Next.js** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Bon |
| **Backend NestJS** | ⭐⭐⭐ Acceptable | ⭐⭐⭐⭐⭐ Excellent |
| **Gratuit** | ✅ Oui (généreux) | ✅ Oui (sleep après 15min) |
| **CDN** | ✅ Global intégré | ⚠️ Basique |
| **PostgreSQL** | ❌ Non (externe) | ✅ Oui (add-on) |
| **Déploiement auto** | ✅ Oui | ✅ Oui |
| **SSL** | ✅ Auto | ✅ Auto |
| **Recommandation** | **Frontend** | **Backend** |

## 🎯 Recommandation finale

**Pour UrbanBeauty :**
- **Frontend** → **Vercel** (parfait pour Next.js PWA)
- **Backend** → **Render** ou **Railway** (meilleur pour NestJS)

Cette combinaison offre :
- Performance optimale pour chaque partie
- Coût minimal (gratuit pour commencer)
- Scalabilité facile
- Maintenance simplifiée

## 📝 Scripts utiles

```bash
# Backend
npm run start:dev      # Développement
npm run build          # Build production
npm run start:prod     # Production
npm run prisma:studio   # Visualiser DB

# Frontend
npm run dev            # Développement
npm run build          # Build production
npm run start          # Production
```

## 🔄 Workflow Git

```bash
# Ajouter les modifications
git add .

# Commit
git commit -m "Description des changements"

# Push vers GitHub
git push origin main
```

## 📚 Documentation

- [Présentation du projet](./UrbanPresentation/Presentation.txt)
- [Architecture technique](./UrbanArchitecture/)
- [Stack technique](./UrbanPresentation/Stacks.txt)

## 👥 Rôles utilisateurs

- **CLIENT** : Achète produits, réserve services
- **COIFFEUSE** : Gère services, reçoit réservations (abonnement requis)
- **VENDEUSE** : Vend produits via la marketplace
- **ADMIN** : Supervise la plateforme

## 🛣️ Roadmap

- [x] Structure projet
- [x] Schéma base de données
- [ ] Authentification complète
- [ ] CRUD Produits & Services
- [ ] Système de réservation
- [ ] Upload images (Cloudinary)
- [ ] Intégration paiements
- [ ] Dashboards par rôle
- [ ] Notifications push

## 📄 License

Private project

## 👤 Auteur

GCS2092

---

**Note** : Pour le déploiement, assurez-vous d'avoir configuré toutes les variables d'environnement nécessaires sur chaque plateforme.

