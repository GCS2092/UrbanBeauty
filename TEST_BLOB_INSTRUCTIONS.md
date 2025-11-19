# 🧪 Instructions pour tester Vercel Blob Storage

## ✅ Modifications effectuées

1. **Permissions retirées à l'ADMIN** :
   - ❌ ADMIN ne peut plus créer de produits (seulement VENDEUSE)
   - ❌ ADMIN ne peut plus créer de services (seulement COIFFEUSE)
   - ✅ ADMIN peut toujours modifier/supprimer tous les produits et services

2. **Script de test créé** : `backend/test-blob.ts`

---

## 🧪 Test Local (Optionnel)

Si vous voulez tester localement, créez un fichier `.env` dans `backend/` :

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxxxxxxxxxxxxxxxxxx
```

Puis exécutez :
```bash
cd backend
npm run test:blob
```

---

## 🚀 Test sur Render (Recommandé)

### Option 1 : Via le Shell Render

1. **Connectez-vous au Shell Render** de votre service backend
2. **Exécutez le test** :
   ```bash
   cd ~/project/src/backend
   npm run test:blob
   ```

### Option 2 : Via l'API (Test réel)

1. **Connectez-vous** à votre application
2. **Obtenez un token JWT** (via login)
3. **Testez l'upload d'image** via l'interface admin ou via l'API :

```bash
curl -X POST https://VOTRE_URL_RENDER/api/upload/image \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -F "file=@chemin/vers/image.jpg"
```

**Réponse attendue si Vercel Blob fonctionne :**
```json
{
  "url": "https://[hash].public.blob.vercel-storage.com/urbanbeauty/[uuid].jpg",
  "publicId": "urbanbeauty/[uuid].jpg",
  "provider": "vercel-blob"
}
```

---

## ✅ Vérifications à faire

### 1. Vérifier les logs Render

Dans les logs de démarrage, vous devriez voir :
```
✅ Vercel Blob Storage configuré
```

Si vous voyez :
```
⚠️ Vercel Blob Storage n'est pas configuré. BLOB_READ_WRITE_TOKEN manquant.
```
→ Vérifiez que la variable d'environnement est bien définie sur Render.

### 2. Tester l'upload via l'interface

1. Connectez-vous en tant que **VENDEUSE** ou **COIFFEUSE**
2. Essayez de créer un produit/service avec une image
3. Vérifiez que :
   - ✅ L'upload fonctionne
   - ✅ L'image s'affiche
   - ✅ L'URL contient `blob.vercel-storage.com`

### 3. Vérifier dans Vercel Dashboard

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. **Storage** → **Blob**
3. Vous devriez voir vos fichiers dans `urbanbeauty/`

---

## 🔍 Vérification des permissions

### Test : ADMIN ne peut plus créer

1. Connectez-vous en tant que **ADMIN**
2. Essayez de créer un produit → ❌ Devrait être refusé (403 Forbidden)
3. Essayez de créer un service → ❌ Devrait être refusé (403 Forbidden)
4. Essayez de modifier un produit/service → ✅ Devrait fonctionner

### Test : VENDEUSE peut créer des produits

1. Connectez-vous en tant que **VENDEUSE**
2. Créez un produit → ✅ Devrait fonctionner
3. Uploadez une image → ✅ Devrait utiliser Vercel Blob

### Test : COIFFEUSE peut créer des services

1. Connectez-vous en tant que **COIFFEUSE**
2. Créez un service → ✅ Devrait fonctionner
3. Uploadez une image → ✅ Devrait utiliser Vercel Blob

---

## 📝 Résumé des changements

### Produits (`POST /api/products`)
- **Avant** : `@Roles('VENDEUSE', 'ADMIN')`
- **Après** : `@Roles('VENDEUSE')` ✅
- **Résultat** : Seules les VENDEUSE peuvent créer des produits

### Services (`POST /api/services`)
- **Avant** : Pas de restriction (juste authentifié)
- **Après** : `@Roles('COIFFEUSE')` ✅
- **Résultat** : Seules les COIFFEUSE peuvent créer des services

### Modifications/Suppressions
- **ADMIN** peut toujours modifier/supprimer tous les produits et services ✅
- **VENDEUSE** peut modifier/supprimer leurs propres produits ✅
- **COIFFEUSE** peut modifier/supprimer leurs propres services ✅

---

## 🎯 Prochaines étapes

1. ✅ Redéployez sur Render (les changements sont déjà dans le code)
2. ✅ Testez l'upload d'image via l'interface
3. ✅ Vérifiez que l'URL contient `blob.vercel-storage.com`
4. ✅ Vérifiez que `"provider": "vercel-blob"` dans la réponse

---

## 🐛 Dépannage

### Erreur : "Vercel Blob Storage n'est pas configuré"
→ Vérifiez que `BLOB_READ_WRITE_TOKEN` est défini sur Render

### Erreur : "403 Forbidden" lors de la création
→ Normal ! ADMIN ne peut plus créer. Utilisez un compte VENDEUSE ou COIFFEUSE.

### L'image ne s'affiche pas
→ Vérifiez que le Blob est public dans Vercel Dashboard

---

**Tout est prêt ! Testez maintenant sur Render ! 🚀**

