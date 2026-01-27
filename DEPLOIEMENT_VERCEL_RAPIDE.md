# ⚡ Déploiement Rapide: Backend sur Vercel

## ✅ Ce qui a été configuré

J'ai déjà créé les fichiers nécessaires:
- ✅ `backend/api/index.ts` - Handler serverless pour Vercel
- ✅ `backend/vercel.json` - Configuration Vercel

---

## 🚀 Étapes de Déploiement (5 minutes)

### Étape 1: Créer le Projet Backend sur Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Add New Project"**
3. Sélectionnez votre repository **UrbanBeauty**
4. Configurez:

   **Framework Preset:** `Other`

   **Root Directory:** `backend` ⚠️ **IMPORTANT**

   **Build Command:** 
   ```bash
   npm install && npx prisma generate && npm run build
   ```

   **Output Directory:** (laissez vide)

   **Install Command:** `npm install`

5. Cliquez sur **"Deploy"**

### Étape 2: Configurer les Variables d'Environnement

Une fois le projet créé:

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez ces variables:

```env
DATABASE_URL=postgresql://neondb_owner:npg_oRJdp1qIz0fa@ep-steep-cloud-ah81g4m1-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

CORS_ORIGIN=https://urban-beauty.vercel.app

JWT_SECRET=votre-secret-super-long-changez-moi-123456789
JWT_EXPIRES_IN=7d

NODE_ENV=production
```

**⚠️ IMPORTANT:** 
- Remplacez `DATABASE_URL` par **VOTRE** URL Neon complète
- Remplacez `CORS_ORIGIN` par **VOTRE** URL Vercel du frontend

3. Cliquez sur **Save**

### Étape 3: Attendre le Déploiement

1. Vercel va automatiquement déployer (3-5 minutes)
2. Une fois terminé, copiez l'URL de votre backend (ex: `https://urbanbeauty-backend.vercel.app`)

### Étape 4: Mettre à Jour le Frontend

1. Allez sur votre projet **frontend** dans Vercel
2. **Settings** → **Environment Variables**
3. Modifiez `NEXT_PUBLIC_API_URL` avec l'URL de votre backend Vercel
4. Vercel redéploiera automatiquement

### Étape 5: Tester

Testez votre backend:
```
https://votre-backend-url.vercel.app/api/health
```

Vous devriez voir: `{"status":"ok","database":"connected"}`

---

## ✅ C'est tout!

Votre backend est maintenant déployé sur Vercel et connecté à Neon!

---

## 🆘 Si ça ne fonctionne pas

### Erreur: "Module not found"

**Solution:** Vérifiez que toutes les dépendances sont dans `backend/package.json`

### Erreur: "Function timeout"

**Solution:** 
- Vercel free tier a un timeout de 10 secondes
- Optimisez vos requêtes ou considérez Render/Railway pour les long-running tasks

### Erreur: "Prisma Client not generated"

**Solution:** Le Build Command devrait inclure `npx prisma generate`

---

## 📚 Documentation Complète

Pour plus de détails, voir: `GUIDE_DEPLOIEMENT_VERCEL_BACKEND.md`
