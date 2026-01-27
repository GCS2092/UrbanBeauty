# 🚀 Guide Complet: Configuration avec Neon

## 📋 Vue d'Ensemble

Vous avez maintenant:
- ✅ **Base de données Neon** créée
- ✅ **Frontend** sur Vercel
- ⚠️ **Backend** à déployer (sur Render ou Railway)

---

## 🎯 Architecture Finale

```
┌─────────────┐         ┌──────────────┐         ┌──────────┐
│   Frontend  │ ──────> │  Backend API │ ──────> │   Neon   │
│   (Vercel)  │         │  (Render/    │         │ (Database)│
│             │         │   Railway)   │         │          │
└─────────────┘         └──────────────┘         └──────────┘
     │                        │                        │
     │                        │                        │
NEXT_PUBLIC_          DATABASE_URL              (Votre URL Neon)
API_URL               (Votre URL Neon)         postgresql://...
```

---

## 📝 Étape 1: Déployer le Backend sur Render

### 1.1 Créer un compte Render

1. Allez sur [render.com](https://render.com)
2. Cliquez sur **"Get Started for Free"**
3. Connectez-vous avec GitHub

### 1.2 Créer un Web Service (Backend)

1. Dans le dashboard Render, cliquez sur **"New +"**
2. Sélectionnez **"Web Service"**
3. Connectez votre repository GitHub **UrbanBeauty**
4. Configurez le service:

   **Name:** `urbanbeauty-backend` (ou le nom que vous voulez)

   **Region:** Choisissez la région la plus proche

   **Branch:** `main` (ou votre branche principale)

   **Root Directory:** `backend` ⚠️ **IMPORTANT**

   **Runtime:** `Node`

   **Build Command:** 
   ```bash
   npm install && npx prisma generate && npm run build
   ```

   **Start Command:**
   ```bash
   npm run start:prod
   ```

   **Plan:** `Free` (pour commencer)

5. Cliquez sur **"Create Web Service"**

### 1.3 Configurer les Variables d'Environnement

Une fois le service créé, allez dans **"Environment"** → **"Environment Variables"** et ajoutez:

```env
# ⚠️ IMPORTANT: Utilisez VOTRE URL Neon (celle que vous venez de créer)
DATABASE_URL=postgresql://neondb_owner:npg_oRJdp1qIz0fa@ep-steep-cloud-ah81g4m1-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# CORS - URL de votre frontend Vercel (remplacez par votre URL Vercel)
CORS_ORIGIN=https://urban-beauty.vercel.app

# JWT Secret (générez un secret aléatoire long)
JWT_SECRET=votre-secret-super-long-et-securise-changez-moi
JWT_EXPIRES_IN=7d

# Node Environment
NODE_ENV=production

# Port (Render définit automatiquement, mais vous pouvez le laisser)
PORT=10000
```

**⚠️ IMPORTANT:** 
- Remplacez `DATABASE_URL` par **VOTRE** URL Neon (celle que vous avez copiée)
- Remplacez `CORS_ORIGIN` par **VOTRE** URL Vercel du frontend

### 1.4 Attendre le Déploiement

1. Render va automatiquement:
   - Installer les dépendances
   - Générer Prisma Client
   - Builder le projet
   - Démarrer le serveur

2. Attendez 5-10 minutes pour le premier déploiement

3. Une fois terminé, vous verrez l'URL de votre backend, par exemple:
   ```
   https://urbanbeauty-backend.onrender.com
   ```
   **⚠️ COPIEZ CETTE URL, vous en aurez besoin!**

---

## 📝 Étape 2: Configurer le Frontend (Vercel)

### 2.1 Mettre à Jour NEXT_PUBLIC_API_URL

1. Allez sur [vercel.com](https://vercel.com)
2. Ouvrez votre projet **frontend**
3. Allez dans **Settings** → **Environment Variables**
4. Trouvez ou créez `NEXT_PUBLIC_API_URL`
5. Mettez la valeur à l'URL de votre backend Render:
   ```
   https://urbanbeauty-backend.onrender.com
   ```
   (Remplacez par **VOTRE** URL Render)

6. Cliquez sur **Save**

7. Vercel redéploiera automatiquement (attendez 2-3 minutes)

---

## 📝 Étape 3: Vérifier que Tout Fonctionne

### 3.1 Tester le Backend

Ouvrez votre navigateur et allez sur:
```
https://votre-backend-url.onrender.com/api/health
```

Vous devriez voir:
```json
{"status":"ok","database":"connected"}
```

### 3.2 Tester le Frontend

1. Allez sur votre site Vercel
2. Ouvrez la console du navigateur (F12)
3. Vérifiez qu'il n'y a plus d'erreurs 404 ou CORS
4. Les requêtes API devraient maintenant fonctionner!

---

## 🔧 Alternative: Déployer sur Railway (Recommandé si Render ne fonctionne pas)

Railway est une alternative à Render qui ne met pas les services en veille.

### Configuration Railway:

1. Allez sur [railway.app](https://railway.app)
2. Cliquez sur **"New Project"** → **"Deploy from GitHub"**
3. Sélectionnez votre repository **UrbanBeauty**
4. Railway détectera automatiquement le projet
5. Cliquez sur le service créé
6. Allez dans **"Variables"** et ajoutez les mêmes variables que pour Render
7. Allez dans **"Settings"** → **"Generate Domain"** pour obtenir l'URL
8. Configurez:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm run start:prod`

---

## 📋 Checklist Complète

### Backend (Render/Railway)
- [ ] Service créé et déployé
- [ ] `DATABASE_URL` configuré avec votre URL Neon
- [ ] `CORS_ORIGIN` configuré avec votre URL Vercel
- [ ] `JWT_SECRET` configuré (générez un secret aléatoire)
- [ ] `NODE_ENV=production` configuré
- [ ] Backend accessible (test `/api/health`)
- [ ] URL du backend copiée

### Frontend (Vercel)
- [ ] `NEXT_PUBLIC_API_URL` configuré avec l'URL du backend
- [ ] Frontend redéployé
- [ ] Pas d'erreurs dans la console du navigateur

### Base de Données (Neon)
- [ ] Base de données créée
- [ ] URL de connexion copiée
- [ ] Migrations Prisma exécutées (automatique au démarrage)

---

## 🆘 Problèmes Courants

### "Backend retourne 404"

**Cause:** Le backend n'est pas encore déployé ou les routes ne sont pas configurées.

**Solution:**
1. Vérifiez que le backend est bien déployé sur Render/Railway
2. Vérifiez les logs du backend pour voir les erreurs
3. Attendez que le déploiement soit terminé (5-10 minutes)

### "Erreur CORS"

**Cause:** `CORS_ORIGIN` dans le backend ne correspond pas à l'URL Vercel.

**Solution:**
1. Vérifiez l'URL exacte de votre frontend Vercel
2. Mettez à jour `CORS_ORIGIN` dans Render/Railway
3. Redéployez le backend

### "DATABASE_URL incorrect"

**Cause:** L'URL Neon n'est pas correctement copiée.

**Solution:**
1. Retournez sur Neon Console
2. Copiez à nouveau l'URL complète (avec le mot de passe)
3. Mettez à jour `DATABASE_URL` dans Render/Railway
4. Redéployez le backend

### "Backend en veille (503)"

**Cause:** Render free tier met les services en veille après 15 min.

**Solution:**
1. Attendez 30-60 secondes (le service se réveille automatiquement)
2. Ou utilisez Railway (pas de veille)

---

## 💡 Résumé des URLs

Après configuration, vous devriez avoir:

1. **Frontend Vercel:** `https://urban-beauty.vercel.app` (ou votre URL)
2. **Backend Render:** `https://urbanbeauty-backend.onrender.com` (ou votre URL)
3. **Base de données Neon:** `postgresql://...@ep-steep-cloud-ah81g4m1-pooler...` (votre URL)

**Configuration:**
- Frontend → `NEXT_PUBLIC_API_URL` = URL du backend
- Backend → `DATABASE_URL` = URL Neon
- Backend → `CORS_ORIGIN` = URL du frontend

---

## 🎉 Félicitations!

Une fois tout configuré, votre application devrait fonctionner:
- ✅ Frontend sur Vercel
- ✅ Backend sur Render/Railway
- ✅ Base de données sur Neon
- ✅ Tout connecté et fonctionnel!

---

## 📞 Besoin d'Aide?

Si vous rencontrez des problèmes:
1. Vérifiez les logs du backend (Render/Railway dashboard)
2. Vérifiez la console du navigateur (F12)
3. Testez les routes directement avec `curl` ou Postman
4. Vérifiez que toutes les variables d'environnement sont correctes
