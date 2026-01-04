<<<<<<< HEAD
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
=======
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

>>>>>>> ce1af0a55e00aed7309910251c94e5caf36f46ce
