# 🔍 Guide: Neon vs Backend API - Comprendre la Différence

## ⚠️ Confusion Courante

**Neon** et le **Backend API** sont deux choses différentes :

| Service | Rôle | URL Type |
|---------|------|----------|
| **Neon** | Base de données PostgreSQL | `postgresql://user:pass@ep-xxx.neon.tech/db` |
| **Backend API** | Serveur NestJS (votre API) | `https://votre-backend-url.com` |

---

## 📊 Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────┐
│   Frontend  │ ──────> │  Backend API │ ──────> │   Neon   │
│   (Vercel)  │         │  (Render/    │         │ (Database)│
│             │         │   Railway)    │         │          │
└─────────────┘         └──────────────┘         └──────────┘
     │                        │                        │
     │                        │                        │
NEXT_PUBLIC_          CORS_ORIGIN              DATABASE_URL
API_URL               (Frontend URL)           (Neon URL)
```

---

## 🎯 Où est Votre Backend Déployé ?

Votre backend NestJS doit être déployé sur une plateforme. Voici les options :

### Option 1: Render (Recommandé pour NestJS)
- **URL typique:** `https://urbanbeauty.onrender.com` ou `https://urbanbeauty-backend.onrender.com`
- **Avantages:** Gratuit, optimisé pour NestJS
- **Inconvénient:** Sleep après 15 min d'inactivité (free tier)

### Option 2: Railway
- **URL typique:** `https://votre-app.railway.app`
- **Avantages:** Pas de sleep, rapide
- **Inconvénient:** Limité à 500h/mois (free tier)

### Option 3: Vercel (pour le backend aussi)
- **URL typique:** `https://votre-backend.vercel.app`
- **Avantages:** Tout au même endroit
- **Inconvénient:** Moins optimal pour NestJS (timeout 10s)

### Option 4: Autre plateforme
- Fly.io, Heroku, DigitalOcean, etc.

---

## 🔧 Configuration Correcte

### 1. Frontend (Vercel) - Variables d'Environnement

```env
# ⚠️ IMPORTANT: Ceci doit pointer vers votre BACKEND API, pas vers Neon!
NEXT_PUBLIC_API_URL=https://votre-backend-url.com

# Exemples:
# Si backend sur Render: https://urbanbeauty.onrender.com
# Si backend sur Railway: https://votre-app.railway.app
# Si backend sur Vercel: https://votre-backend.vercel.app
```

**❌ INCORRECT:**
```env
NEXT_PUBLIC_API_URL=postgresql://...@neon.tech  # ❌ C'est l'URL de la DB, pas du backend!
```

**✅ CORRECT:**
```env
NEXT_PUBLIC_API_URL=https://urbanbeauty.onrender.com  # ✅ URL du backend API
```

---

### 2. Backend (Render/Railway/etc.) - Variables d'Environnement

```env
# Base de données Neon (utilisée PAR le backend)
DATABASE_URL=postgresql://user:password@ep-xxx.region.neon.tech/dbname?sslmode=require

# CORS - URL du frontend Vercel
CORS_ORIGIN=https://urban-beauty.vercel.app

# JWT
JWT_SECRET=votre-secret
JWT_EXPIRES_IN=7d

# Node Environment
NODE_ENV=production
```

---

## 🔍 Comment Trouver l'URL de Votre Backend ?

### Si votre backend est sur Render:

1. Allez sur [dashboard.render.com](https://dashboard.render.com)
2. Trouvez votre service backend (Web Service)
3. L'URL est affichée en haut, par exemple: `https://urbanbeauty.onrender.com`
4. **Copiez cette URL** et mettez-la dans `NEXT_PUBLIC_API_URL` sur Vercel

### Si votre backend est sur Railway:

1. Allez sur [railway.app](https://railway.app)
2. Ouvrez votre projet
3. Cliquez sur votre service backend
4. L'URL est dans l'onglet "Settings" → "Networking"
5. **Copiez cette URL** et mettez-la dans `NEXT_PUBLIC_API_URL` sur Vercel

### Si votre backend est sur Vercel:

1. Allez sur [vercel.com](https://vercel.com)
2. Ouvrez votre projet backend
3. L'URL est affichée, par exemple: `https://votre-backend.vercel.app`
4. **Copiez cette URL** et mettez-la dans `NEXT_PUBLIC_API_URL` sur Vercel

---

## ✅ Étapes pour Corriger la Configuration

### Étape 1: Identifier Où est Votre Backend

**Question:** Où avez-vous déployé votre backend NestJS ?
- [ ] Render
- [ ] Railway
- [ ] Vercel
- [ ] Autre: _______________
- [ ] Je ne sais pas / Pas encore déployé

### Étape 2: Trouver l'URL du Backend

Une fois que vous savez où est votre backend, trouvez son URL (voir section ci-dessus).

### Étape 3: Mettre à Jour Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Ouvrez votre projet **frontend**
3. Allez dans **Settings** → **Environment Variables**
4. Trouvez `NEXT_PUBLIC_API_URL`
5. **Modifiez** la valeur pour pointer vers l'URL de votre backend
6. Cliquez sur **Save**
7. Vercel redéploiera automatiquement

### Étape 4: Vérifier que Ça Fonctionne

Testez dans votre navigateur:
```bash
# Ouvrez la console du navigateur (F12)
# Vous devriez voir les requêtes API aller vers la bonne URL
```

Ou testez manuellement:
```bash
# Remplacez par votre URL backend
curl https://votre-backend-url.com/api/health
```

---

## 🚨 Problèmes Courants

### "Je ne sais pas où est mon backend"

**Solution:** Vous devez d'abord déployer votre backend sur une plateforme:
- **Render** (recommandé): [render.com](https://render.com)
- **Railway**: [railway.app](https://railway.app)
- **Vercel**: [vercel.com](https://vercel.com)

### "J'ai installé Neon dans Vercel, mais je ne vois pas d'URL"

**Explication:** Neon dans Vercel vous donne seulement la `DATABASE_URL` pour votre backend. Vous devez toujours déployer votre backend séparément.

**Solution:** 
1. Déployez votre backend sur Render/Railway/Vercel
2. Configurez `DATABASE_URL` dans le backend avec l'URL Neon
3. Configurez `NEXT_PUBLIC_API_URL` dans le frontend avec l'URL du backend

### "Mon backend est sur Render mais je ne vois pas l'URL"

**Solution:**
1. Allez sur [dashboard.render.com](https://dashboard.render.com)
2. Cherchez votre service (il devrait être listé)
3. Si vous ne le voyez pas, vous devez le créer:
   - Cliquez sur "New +" → "Web Service"
   - Connectez votre repo GitHub
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`

---

## 📝 Checklist de Configuration

- [ ] Backend déployé sur une plateforme (Render/Railway/Vercel)
- [ ] URL du backend identifiée
- [ ] `NEXT_PUBLIC_API_URL` dans Vercel pointe vers l'URL du backend
- [ ] `DATABASE_URL` dans le backend pointe vers Neon
- [ ] `CORS_ORIGIN` dans le backend inclut l'URL Vercel du frontend
- [ ] Backend redéployé après modification des variables
- [ ] Frontend redéployé après modification de `NEXT_PUBLIC_API_URL`
- [ ] Test de connexion réussi (`/api/health`)

---

## 🆘 Besoin d'Aide ?

Si vous ne savez pas où est votre backend:

1. **Vérifiez Render:** [dashboard.render.com](https://dashboard.render.com)
2. **Vérifiez Railway:** [railway.app](https://railway.app)
3. **Vérifiez Vercel:** [vercel.com](https://vercel.com) (projets backend séparés)

Si votre backend n'est nulle part, vous devez le déployer. Voir `DEPLOIEMENT.md` pour les instructions.

---

## 💡 Résumé

**Neon** = Base de données (utilisée par le backend)
**Backend API** = Serveur NestJS (doit être déployé quelque part)
**Frontend** = Next.js (sur Vercel)

`NEXT_PUBLIC_API_URL` doit pointer vers le **Backend API**, pas vers Neon!
