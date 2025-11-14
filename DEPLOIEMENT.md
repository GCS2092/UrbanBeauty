# 🚀 Guide de Déploiement UrbanBeauty

## 📋 Vue d'ensemble

Ce guide vous explique comment déployer UrbanBeauty sur **Vercel** (frontend) et **Render** (backend).

---

## 🎯 Recommandation : Vercel + Render

### Pourquoi cette combinaison ?

| Plateforme | Usage | Raison |
|------------|-------|--------|
| **Vercel** | Frontend | Optimisé pour Next.js, CDN global, gratuit |
| **Render** | Backend | Parfait pour NestJS, PostgreSQL inclus, gratuit |

---

## 📦 Étape 1 : Préparer le code

### 1.1 Vérifier que tout est commité

```bash
git status
git add .
git commit -m "Ready for deployment"
```

### 1.2 Pousser sur GitHub

**Option A : HTTPS (recommandé si pas de clé SSH)**
```bash
git remote set-url origin https://github.com/GCS2092/UrbanBeauty.git
git push -u origin main
```

**Option B : SSH (si clé configurée)**
```bash
git remote set-url origin git@github.com:GCS2092/UrbanBeauty.git
git push -u origin main
```

---

## 🌐 Étape 2 : Déployer le Frontend sur Vercel

### 2.1 Créer un compte Vercel
1. Aller sur [vercel.com](https://vercel.com)
2. Se connecter avec GitHub
3. Autoriser l'accès au repo

### 2.2 Importer le projet
1. Cliquer sur **"Add New Project"**
2. Sélectionner le repo **UrbanBeauty**
3. Configurer :
   - **Framework Preset** : Next.js
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build` (auto-détecté)
   - **Output Directory** : `.next` (auto-détecté)

### 2.3 Variables d'environnement
Ajouter dans **Environment Variables** :

```env
NEXT_PUBLIC_API_URL=https://urbanbeauty-backend.onrender.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=votre-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=votre-api-key
```

### 2.4 Déployer
- Cliquer sur **"Deploy"**
- Attendre la fin du build (2-3 minutes)
- ✅ Votre frontend est en ligne !

**URL générée** : `https://urbanbeauty.vercel.app` (ou nom personnalisé)

---

## ⚙️ Étape 3 : Déployer le Backend sur Render

### 3.1 Créer un compte Render
1. Aller sur [render.com](https://render.com)
2. Se connecter avec GitHub
3. Autoriser l'accès au repo

### 3.2 Créer une base de données PostgreSQL
1. Cliquer sur **"New +"** → **"PostgreSQL"**
2. Configurer :
   - **Name** : `urbanbeauty-db`
   - **Database** : `urbanbeauty`
   - **User** : (auto-généré)
   - **Region** : Choisir le plus proche
   - **Plan** : Free (pour commencer)
3. Noter les informations de connexion (affichées une seule fois !)

### 3.3 Créer le Web Service (Backend)
1. Cliquer sur **"New +"** → **"Web Service"**
2. Connecter le repo **UrbanBeauty**
3. Configurer :
   - **Name** : `urbanbeauty-backend`
   - **Region** : Même que la DB
   - **Branch** : `main`
   - **Root Directory** : `backend`
   - **Runtime** : Node
   - **Build Command** : `npm install && npx prisma generate && npm run build`
   - **Start Command** : `npm run start:prod`
   - **Plan** : Free (pour commencer)

### 3.4 Variables d'environnement
Dans **Environment** → **Environment Variables**, ajouter :

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
# (Utiliser l'URL fournie par Render PostgreSQL)

# JWT
JWT_SECRET=votre-secret-super-long-et-securise
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret

# CORS (URL de votre frontend Vercel)
CORS_ORIGIN=https://urbanbeauty.vercel.app

# Node Environment
NODE_ENV=production
```

### 3.5 Lier la base de données
1. Dans le service backend, aller dans **"Environment"**
2. Cliquer sur **"Link Database"**
3. Sélectionner `urbanbeauty-db`
4. La variable `DATABASE_URL` sera automatiquement ajoutée

### 3.6 Déployer
1. Cliquer sur **"Create Web Service"**
2. Attendre le build (5-10 minutes la première fois)
3. ✅ Votre backend est en ligne !

**URL générée** : `https://urbanbeauty-backend.onrender.com`

### 3.7 Exécuter les migrations Prisma
Une fois le backend déployé, exécuter les migrations :

**Option A : Via Render Shell**
1. Dans Render, aller dans le service backend
2. Cliquer sur **"Shell"**
3. Exécuter :
```bash
cd backend
npx prisma migrate deploy
```

**Option B : Localement (recommandé)**
```bash
cd backend
DATABASE_URL="votre-url-render" npx prisma migrate deploy
```

---

## 🔄 Étape 4 : Mettre à jour les URLs

### 4.1 Mettre à jour le frontend
Dans Vercel, mettre à jour la variable :
```env
NEXT_PUBLIC_API_URL=https://urbanbeauty-backend.onrender.com
```

### 4.2 Mettre à jour le backend
Dans Render, mettre à jour :
```env
CORS_ORIGIN=https://urbanbeauty.vercel.app
```

### 4.3 Redéployer
- **Vercel** : Redéploiement automatique après changement de variable
- **Render** : Cliquer sur **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🔍 Étape 5 : Vérifier le déploiement

### 5.1 Tester le backend
```bash
curl https://urbanbeauty-backend.onrender.com/health
# ou
curl https://urbanbeauty-backend.onrender.com/api
```

### 5.2 Tester le frontend
- Ouvrir `https://urbanbeauty.vercel.app`
- Vérifier que l'API est accessible

---

## ⚠️ Points importants

### Render (Backend)
- ⏰ **Sleep automatique** : Après 15 minutes d'inactivité, le service se met en veille
- 🚀 **Premier démarrage** : Peut prendre 30-60 secondes après le sleep
- 💰 **Plan gratuit** : Limité mais suffisant pour commencer
- 📊 **Logs** : Disponibles en temps réel dans l'interface Render

### Vercel (Frontend)
- ⚡ **CDN global** : Ultra-rapide partout dans le monde
- 🔄 **Déploiement automatique** : À chaque push sur `main`
- 🎨 **Preview deployments** : Une URL pour chaque Pull Request
- 💰 **Plan gratuit** : Très généreux

---

## 🔧 Alternative : Railway (Backend)

Si vous préférez Railway pour le backend :

### Avantages Railway
- ✅ Pas de sleep automatique
- ✅ Démarrage plus rapide
- ✅ Interface moderne

### Configuration Railway
1. Créer un compte sur [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub**
3. Sélectionner le repo
4. Ajouter **PostgreSQL** (Add Service)
5. Configurer les variables d'environnement
6. Root Directory : `backend`
7. Build Command : `npm install && npm run build`
8. Start Command : `npm run start:prod`

---

## 📊 Comparaison finale

| Critère | Vercel | Render | Railway |
|---------|--------|--------|---------|
| **Frontend Next.js** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Backend NestJS** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Gratuit** | ✅ Oui | ✅ Oui (sleep) | ✅ Oui (500h/mois) |
| **PostgreSQL** | ❌ | ✅ | ✅ |
| **Facilité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**Recommandation finale** : **Vercel (Frontend) + Render (Backend)**

---

## 🆘 Dépannage

### Backend ne démarre pas
- Vérifier les logs dans Render
- Vérifier que `DATABASE_URL` est correcte
- Vérifier que les migrations sont exécutées

### Frontend ne se connecte pas au backend
- Vérifier `NEXT_PUBLIC_API_URL` dans Vercel
- Vérifier `CORS_ORIGIN` dans Render
- Vérifier que le backend est bien démarré (pas en sleep)

### Erreur CORS
- Ajouter l'URL du frontend dans `CORS_ORIGIN` du backend
- Redéployer le backend

---

## 📝 Checklist de déploiement

- [ ] Code poussé sur GitHub
- [ ] Compte Vercel créé
- [ ] Frontend déployé sur Vercel
- [ ] Variables d'environnement frontend configurées
- [ ] Compte Render créé
- [ ] PostgreSQL créé sur Render
- [ ] Backend déployé sur Render
- [ ] Variables d'environnement backend configurées
- [ ] Migrations Prisma exécutées
- [ ] URLs mises à jour (frontend ↔ backend)
- [ ] Tests de connexion réussis
- [ ] Documentation à jour

---

**Bon déploiement ! 🚀**

