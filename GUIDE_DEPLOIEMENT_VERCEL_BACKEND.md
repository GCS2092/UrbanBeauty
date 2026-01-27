# 🚀 Guide: Déployer le Backend NestJS sur Vercel

## ⚠️ Important: Limitations Vercel

Vercel peut supporter NestJS, mais avec quelques limitations:

| Aspect | Vercel | Render/Railway |
|--------|--------|----------------|
| **Timeout** | 10s (free), 60s (pro) | Pas de limite |
| **Cold Start** | Oui (première requête) | Non |
| **Long-running** | ❌ Non optimal | ✅ Optimal |
| **WebSockets** | ❌ Limité | ✅ Supporté |
| **Fichiers upload** | ⚠️ Limité | ✅ Supporté |

**Recommandation:** Vercel fonctionne bien pour les APIs simples, mais Render/Railway sont meilleurs pour NestJS complet.

---

## 📝 Étape 1: Créer le Handler Serverless

Pour que NestJS fonctionne sur Vercel, nous devons créer un handler serverless.

### 1.1 Créer le fichier handler

Créez un fichier `backend/api/index.ts` (ou `backend/vercel.ts` à la racine):

```typescript
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { execSync } from 'child_process';

const logger = new Logger('VercelHandler');

let cachedApp: any;

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    // Run migrations in production
    if (process.env.NODE_ENV === 'production') {
      try {
        logger.log('🔄 Running database migrations...');
        execSync('npx prisma migrate deploy', {
          stdio: 'inherit',
          env: process.env,
        });
        logger.log('✅ Database migrations applied successfully');
      } catch (error) {
        logger.warn('⚠️ Failed to run migrations (this is OK if migrations are already applied)');
      }
    }

    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
      logger: ['error', 'warn', 'log'],
    });

    // Set global prefix
    app.setGlobalPrefix('api', {
      exclude: ['/', '/health', '/test-db'],
    });

    // Enable CORS
    const corsOrigin = process.env.CORS_ORIGIN;
    const allowedOrigins = corsOrigin 
      ? corsOrigin.split(',').map(origin => origin.trim())
      : ['*'];
    
    app.enableCors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes('*')) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
          return callback(null, true);
        }
        callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    cachedApp = expressApp;
    return expressApp;
  } catch (error) {
    logger.error('❌ Failed to create app', error);
    throw error;
  }
}

export default async function handler(req: any, res: any) {
  const app = await createApp();
  return app(req, res);
}
```

### 1.2 Installer les dépendances nécessaires

Dans `backend/package.json`, assurez-vous d'avoir:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "@types/express": "^4.17.21"
  }
}
```

---

## 📝 Étape 2: Configurer vercel.json

Mettez à jour `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**OU** si vous préférez utiliser `vercel.ts` à la racine:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "vercel.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "vercel.ts"
    }
  ]
}
```

---

## 📝 Étape 3: Déployer sur Vercel

### 3.1 Créer un nouveau projet Vercel pour le backend

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Add New Project"**
3. Sélectionnez votre repository **UrbanBeauty**
4. Configurez:

   **Framework Preset:** `Other` (ou laissez Vercel détecter)

   **Root Directory:** `backend` ⚠️ **IMPORTANT**

   **Build Command:** 
   ```bash
   npm install && npx prisma generate && npm run build
   ```

   **Output Directory:** `dist` (ou laissez vide)

   **Install Command:** `npm install`

5. Cliquez sur **"Deploy"**

### 3.2 Configurer les Variables d'Environnement

Une fois le projet créé, allez dans **Settings** → **Environment Variables** et ajoutez:

```env
# Base de données Neon
DATABASE_URL=postgresql://neondb_owner:npg_oRJdp1qIz0fa@ep-steep-cloud-ah81g4m1-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# CORS - URL de votre frontend Vercel
CORS_ORIGIN=https://urban-beauty.vercel.app

# JWT
JWT_SECRET=votre-secret-super-long-changez-moi
JWT_EXPIRES_IN=7d

# Node Environment
NODE_ENV=production
```

**⚠️ IMPORTANT:** 
- Remplacez `DATABASE_URL` par **VOTRE** URL Neon
- Remplacez `CORS_ORIGIN` par **VOTRE** URL Vercel du frontend

### 3.3 Attendre le Déploiement

1. Vercel va automatiquement:
   - Installer les dépendances
   - Générer Prisma Client
   - Builder le projet
   - Déployer les fonctions serverless

2. Attendez 3-5 minutes pour le premier déploiement

3. Une fois terminé, vous verrez l'URL de votre backend, par exemple:
   ```
   https://urbanbeauty-backend.vercel.app
   ```
   **⚠️ COPIEZ CETTE URL!**

---

## 📝 Étape 4: Mettre à Jour le Frontend

### 4.1 Mettre à Jour NEXT_PUBLIC_API_URL

1. Allez sur [vercel.com](https://vercel.com)
2. Ouvrez votre projet **frontend**
3. Allez dans **Settings** → **Environment Variables**
4. Trouvez ou créez `NEXT_PUBLIC_API_URL`
5. Mettez la valeur à l'URL de votre backend Vercel:
   ```
   https://urbanbeauty-backend.vercel.app
   ```
   (Remplacez par **VOTRE** URL Vercel backend)

6. Cliquez sur **Save**

7. Vercel redéploiera automatiquement (attendez 2-3 minutes)

---

## 📝 Étape 5: Vérifier que Tout Fonctionne

### 5.1 Tester le Backend

Ouvrez votre navigateur et allez sur:
```
https://votre-backend-url.vercel.app/api/health
```

Vous devriez voir:
```json
{"status":"ok","database":"connected"}
```

### 5.2 Tester le Frontend

1. Allez sur votre site Vercel frontend
2. Ouvrez la console du navigateur (F12)
3. Vérifiez qu'il n'y a plus d'erreurs 404 ou CORS
4. Les requêtes API devraient maintenant fonctionner!

---

## 🔧 Alternative: Configuration Simplifiée (Sans Handler)

Si vous préférez une approche plus simple, vous pouvez adapter `main.ts` pour Vercel:

### Option A: Modifier main.ts pour Vercel

Créez `backend/src/main-vercel.ts`:

```typescript
// Même contenu que main.ts mais adapté pour Vercel
// Export l'app au lieu de lancer le serveur
```

Puis dans `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/src/main-vercel.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/src/main-vercel.js"
    }
  ]
}
```

---

## ⚠️ Limitations et Solutions

### Timeout de 10 secondes (Free Tier)

**Problème:** Les requêtes qui prennent plus de 10 secondes échouent.

**Solutions:**
1. Optimiser les requêtes lentes
2. Utiliser des jobs en arrière-plan
3. Upgrader vers Vercel Pro (60s timeout)

### Cold Start

**Problème:** La première requête après inactivité peut être lente (2-5 secondes).

**Solutions:**
1. Utiliser Vercel Pro (meilleur cold start)
2. Configurer des cron jobs pour garder les fonctions "chaudes"
3. Accepter le cold start (acceptable pour la plupart des cas)

### Upload de Fichiers

**Problème:** Limité à 4.5MB sur Vercel free tier.

**Solutions:**
1. Utiliser Vercel Blob Storage (déjà configuré dans votre projet)
2. Uploader directement depuis le frontend vers Cloudinary/Vercel Blob
3. Utiliser des chunks pour les gros fichiers

---

## 📋 Checklist Complète

### Backend (Vercel)
- [ ] Handler serverless créé (`api/index.ts` ou `vercel.ts`)
- [ ] `vercel.json` configuré correctement
- [ ] `DATABASE_URL` configuré avec votre URL Neon
- [ ] `CORS_ORIGIN` configuré avec votre URL Vercel frontend
- [ ] `JWT_SECRET` configuré
- [ ] `NODE_ENV=production` configuré
- [ ] Backend déployé et accessible
- [ ] Test `/api/health` réussi
- [ ] URL du backend copiée

### Frontend (Vercel)
- [ ] `NEXT_PUBLIC_API_URL` configuré avec l'URL du backend Vercel
- [ ] Frontend redéployé
- [ ] Pas d'erreurs dans la console du navigateur

---

## 🆘 Problèmes Courants

### "Function timeout"

**Cause:** Requête qui prend plus de 10 secondes.

**Solution:** Optimiser la requête ou utiliser Vercel Pro.

### "Module not found"

**Cause:** Dépendances manquantes ou build incorrect.

**Solution:** Vérifier que toutes les dépendances sont dans `package.json`.

### "Prisma Client not generated"

**Cause:** Prisma Client n'est pas généré avant le build.

**Solution:** Ajouter `npx prisma generate` dans le Build Command.

---

## 💡 Résumé

**Avantages Vercel:**
- ✅ Tout au même endroit (frontend + backend)
- ✅ Déploiement automatique
- ✅ CDN global
- ✅ Gratuit pour commencer

**Inconvénients Vercel:**
- ⚠️ Timeout 10s (free tier)
- ⚠️ Cold start possible
- ⚠️ Moins optimal pour NestJS que Render/Railway

**Recommandation:** Vercel fonctionne bien pour la plupart des APIs, mais si vous avez besoin de long-running tasks ou WebSockets, considérez Render ou Railway.
