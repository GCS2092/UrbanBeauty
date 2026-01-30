🌟 UrbanBeauty

**Plateforme beauté tout-en-un** – Marketplace + Services de coiffure + Gestion des prestataires

---

## 📋 Description

**UrbanBeauty** est une plateforme PWA complète qui combine :

- 🛒 **Marketplace** de produits cosmétiques et accessoires beauté  
- 💇‍♀️ **Réservation de services** de coiffure  
- 👥 **Gestion multi-rôles** : Clients, Coiffeuses, Vendeuses, Administrateurs  
- 💳 **Paiements en ligne** (Stripe, Paystack, Mobile Money)  
- 📱 **PWA mobile-first** pour une expérience proche du natif  

---

## 🏗️ Architecture du projet

```

urbanBeauty/
├── frontend/          # Next.js + Tailwind CSS
├── backend/           # NestJS + Prisma
├── UrbanPresentation/ # Documentation fonctionnelle
└── UrbanArchitecture/ # Architecture technique

````

---

## 🚀 Technologies

### Frontend
- **Next.js 16**
- **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Zustand** (state management)
- **React Query**
- **React Hook Form** + **Yup**

### Backend
- **NestJS**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **JWT** (authentification)
- **Passport**
- **Cloudinary** (upload images)

---

## 📦 Installation

### Prérequis
- Node.js 18+
- PostgreSQL
- npm ou yarn

---

### 🔧 Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run start:dev
````

---

### 🎨 Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## 🔐 Variables d’environnement

### Backend (`.env`)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/urbanbeauty"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
```

---

## 🗄️ Base de données

```bash
cd backend
npx prisma studio
```

---

## 🚀 Déploiement

### ✅ Recommandé : Vercel (Frontend) + Render (Backend)

#### Frontend – Vercel

* Déploiement automatique via GitHub
* CDN global
* SSL automatique
* Optimisé pour Next.js

**Configuration**

* Root Directory : `frontend`
* Build Command : `npm run build`
* Output : `.next`

---

#### Backend – Render

* NestJS parfaitement supporté
* PostgreSQL managé
* Logs temps réel
* SSL automatique

**Configuration**

* Root Directory : `backend`
* Build : `npm install && npm run build`
* Start : `npm run start:prod`

---

## 📊 Comparatif

| Élément          | Vercel | Render    |
| ---------------- | ------ | --------- |
| Frontend Next.js | ⭐⭐⭐⭐⭐  | ⭐⭐⭐       |
| Backend NestJS   | ⭐⭐⭐    | ⭐⭐⭐⭐⭐     |
| PostgreSQL       | ❌      | ✅         |
| Gratuit          | ✅      | ✅ (sleep) |

---

## 🧑‍💻 Scripts utiles

```bash
# Backend
npm run start:dev
npm run build
npm run start:prod

# Frontend
npm run dev
npm run build
npm run start
```

---

## 🔄 Workflow Git

```bash
git add .
git commit -m "Update UrbanBeauty documentation"
git push origin main
```

---

## 👥 Rôles utilisateurs

* **CLIENT** : Achats & réservations
* **COIFFEUSE** : Services & réservations
* **VENDEUSE** : Vente produits
* **ADMIN** : Supervision globale

---

## 🛣️ Roadmap

* [x] Structure projet
* [x] Base de données
* [ ] Authentification complète
* [ ] Produits & services
* [ ] Réservations
* [ ] Paiements
* [ ] Notifications
* [ ] Dashboards

---

## 📄 Licence

Projet privé

---

## 👤 Auteur

**GCS2092**

```` 