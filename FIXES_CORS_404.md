# 🔧 Corrections CORS et 404 - Backend avec Neon

## ✅ Corrections Appliquées

### 1. Gestion des Erreurs 404
**Problème:** Routes backend retournant 404 avec erreurs CORS

**Solution:** Amélioration de la gestion d'erreurs dans `frontend/src/lib/api.ts`:
- Détection spécifique des erreurs 404
- Messages d'erreur détaillés pour diagnostiquer le problème
- Fallback automatique vers tableaux vides pour les requêtes GET
- Logs explicites pour identifier la cause

### 2. Configuration CORS Améliorée
**Problème:** Erreurs CORS bloquant les requêtes

**Solution:** Amélioration de la configuration CORS dans `backend/src/main.ts`:
- Support de multiples origines (séparées par virgules)
- Autorisation automatique de localhost en développement
- Logs d'avertissement pour les origines non autorisées
- Headers CORS complets (methods, headers, credentials)

### 3. Firebase Configuration
**Problème:** Warning "Firebase configuration is incomplete"

**Solution:** Amélioration des logs dans `frontend/src/lib/firebase.ts`:
- Messages de succès quand Firebase s'initialise
- Messages d'avertissement plus informatifs
- Utilisation des valeurs de fallback automatiquement

---

## 🔍 Diagnostic des Erreurs

### Erreur: CORS 404 sur `/api/products` et `/api/services`

**Causes possibles:**

1. **Backend non déployé ou URL incorrecte**
   - Vérifiez que `NEXT_PUBLIC_API_URL` dans Vercel pointe vers la bonne URL
   - Vérifiez que le backend est bien déployé et accessible

2. **Routes backend non configurées**
   - Vérifiez que les contrôleurs sont bien enregistrés dans `app.module.ts`
   - Vérifiez que le préfixe `/api` est bien configuré dans `main.ts`

3. **CORS mal configuré**
   - Vérifiez que `CORS_ORIGIN` dans le backend inclut l'URL de votre frontend Vercel
   - Format: `https://urban-beauty.vercel.app` (sans slash final)

---

## 🛠️ Solutions

### Solution 1: Vérifier l'URL du Backend

Dans votre dashboard Vercel, vérifiez la variable d'environnement:

```env
NEXT_PUBLIC_API_URL=https://votre-backend-url.com
```

**Où est votre backend déployé?**
- Si sur Render: `https://urbanbeauty.onrender.com` ou `https://urbanbeauty-backend.onrender.com`
- Si sur Railway: `https://votre-app.railway.app`
- Si sur Vercel: `https://votre-app.vercel.app`
- Si local: `http://localhost:3001` (développement uniquement)

### Solution 2: Configurer CORS dans le Backend

Dans votre plateforme de déploiement backend (Render, Railway, etc.), ajoutez/modifiez:

```env
CORS_ORIGIN=https://urban-beauty.vercel.app
```

**Pour plusieurs origines:**
```env
CORS_ORIGIN=https://urban-beauty.vercel.app,https://urbanbeauty.vercel.app
```

### Solution 3: Vérifier que le Backend Répond

Testez manuellement:

```bash
# Test de santé
curl https://votre-backend-url.com/api/health

# Test des produits
curl https://votre-backend-url.com/api/products

# Test des services
curl https://votre-backend-url.com/api/services
```

**Réponses attendues:**
- `200 OK` avec des données JSON
- `404 Not Found` = routes non configurées
- `503 Service Unavailable` = backend en veille (Render free tier)

---

## 📝 Configuration avec Neon (Base de Données)

Puisque vous utilisez **Neon** pour la base de données:

### Backend Configuration

Dans votre plateforme de déploiement backend, configurez:

```env
# Database (Neon)
DATABASE_URL=postgresql://user:password@ep-xxx.region.neon.tech/dbname?sslmode=require

# CORS (Frontend Vercel)
CORS_ORIGIN=https://urban-beauty.vercel.app

# JWT
JWT_SECRET=votre-secret-super-long-et-securise
JWT_EXPIRES_IN=7d

# Node Environment
NODE_ENV=production
```

### Frontend Configuration (Vercel)

Dans votre dashboard Vercel, configurez:

```env
# API URL (votre backend)
NEXT_PUBLIC_API_URL=https://votre-backend-url.com

# Firebase (optionnel mais recommandé)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCGVYzNfAxMi8FIyJcQHFCdsEma1sh7ui8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=urbanbeauty-15ac0.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=urbanbeauty-15ac0
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=urbanbeauty-15ac0.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=491829409330
NEXT_PUBLIC_FIREBASE_APP_ID=1:491829409330:web:4e38abc40ca08abc86ae2b
```

---

## 🔄 Étapes de Résolution

1. **Identifier où est déployé votre backend**
   - Render? Railway? Vercel? Autre?
   - Quelle est l'URL exacte?

2. **Vérifier les variables d'environnement**
   - Backend: `CORS_ORIGIN` doit inclure l'URL Vercel
   - Frontend: `NEXT_PUBLIC_API_URL` doit pointer vers le backend

3. **Tester le backend directement**
   - Utilisez `curl` ou Postman pour tester les routes
   - Vérifiez que les routes `/api/products` et `/api/services` existent

4. **Redéployer après modifications**
   - Backend: Redéployer après modification de `CORS_ORIGIN`
   - Frontend: Redéployer après modification de `NEXT_PUBLIC_API_URL`

5. **Vérifier les logs**
   - Backend: Vérifier les logs pour voir les erreurs CORS
   - Frontend: Vérifier la console du navigateur pour les erreurs détaillées

---

## 🚨 Erreurs Courantes

### "CORS header 'Access-Control-Allow-Origin' is missing"
**Cause:** `CORS_ORIGIN` dans le backend ne correspond pas à l'URL du frontend
**Solution:** Mettre à jour `CORS_ORIGIN` avec l'URL exacte de Vercel (sans slash final)

### "404 Not Found" sur les routes API
**Cause:** Routes backend non configurées ou préfixe `/api` manquant
**Solution:** Vérifier que `app.setGlobalPrefix('api')` est dans `main.ts`

### "503 Service Unavailable"
**Cause:** Backend en veille (Render free tier) ou redémarrage
**Solution:** Attendre 30-60 secondes ou réveiller manuellement le service

---

## 📞 Support

Si les problèmes persistent:

1. Vérifiez les logs du backend (Render/Railway dashboard)
2. Vérifiez la console du navigateur pour les erreurs détaillées
3. Testez les routes directement avec `curl`
4. Vérifiez que toutes les variables d'environnement sont correctement configurées

---

## ✅ Checklist de Vérification

- [ ] Backend déployé et accessible
- [ ] `CORS_ORIGIN` configuré avec l'URL Vercel exacte
- [ ] `NEXT_PUBLIC_API_URL` configuré avec l'URL backend exacte
- [ ] Routes `/api/products` et `/api/services` testées et fonctionnelles
- [ ] Backend redéployé après modification de CORS
- [ ] Frontend redéployé après modification de l'URL API
- [ ] Logs vérifiés pour identifier les erreurs restantes
