# 📦 Guide de Configuration Vercel Blob Storage

## 📋 Vue d'ensemble

Ce projet supporte maintenant **Vercel Blob Storage** pour le stockage des images. Vous pouvez utiliser Vercel Blob Storage en remplacement ou en complément de Cloudinary.

---

## 🎯 Avantages de Vercel Blob Storage

- ✅ **Intégration native** avec Vercel
- ✅ **CDN global** pour des performances optimales
- ✅ **Simple à configurer** - juste un token
- ✅ **Gratuit** jusqu'à 1 GB de stockage
- ✅ **API simple** et intuitive

---

## 🔧 Configuration

### 1. Obtenir le Token Vercel Blob

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Storage**
4. Cliquez sur **Create Database** → **Blob**
5. Une fois créé, allez dans **Settings** du Blob
6. Copiez le **Token** (BLOB_READ_WRITE_TOKEN)

### 2. Variables d'environnement

Ajoutez les variables suivantes dans votre fichier `.env` ou dans les variables d'environnement de votre plateforme de déploiement :

```env
# Vercel Blob Storage (Optionnel - si vous voulez l'utiliser)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxxxxxxxxxxxxxxxxxx

# Provider de stockage (Optionnel)
# Options: 'cloudinary' | 'vercel-blob' | 'auto'
# Si non défini, le système détecte automatiquement
STORAGE_PROVIDER=vercel-blob
```

**Pour Render.com :**
1. Allez dans votre service sur Render
2. **Environment** → **Add Environment Variable**
3. Ajoutez `BLOB_READ_WRITE_TOKEN` avec votre token
4. (Optionnel) Ajoutez `STORAGE_PROVIDER=vercel-blob`

**Pour Vercel :**
1. Allez dans votre projet sur Vercel
2. **Settings** → **Environment Variables**
3. Ajoutez `BLOB_READ_WRITE_TOKEN` avec votre token
4. (Optionnel) Ajoutez `STORAGE_PROVIDER=vercel-blob`

---

## 🚀 Utilisation

### Mode Auto (Recommandé)

Si vous ne définissez pas `STORAGE_PROVIDER`, le système détecte automatiquement :
- Si `BLOB_READ_WRITE_TOKEN` est configuré → utilise **Vercel Blob**
- Sinon → utilise **Cloudinary** (si configuré)

### Mode Manuel

Définissez `STORAGE_PROVIDER` pour forcer l'utilisation d'un provider spécifique :

```env
STORAGE_PROVIDER=vercel-blob  # Force Vercel Blob
STORAGE_PROVIDER=cloudinary   # Force Cloudinary
```

---

## 📤 Upload d'images

L'API reste la même, le système choisit automatiquement le provider :

```typescript
POST /api/upload/image
Content-Type: multipart/form-data

FormData:
  - file: [fichier image]
```

**Réponse :**
```json
{
  "url": "https://[hash].public.blob.vercel-storage.com/urbanbeauty/[filename]",
  "publicId": "urbanbeauty/[filename]",
  "provider": "vercel-blob"
}
```

---

## 🗂️ Structure des fichiers

Les fichiers sont organisés dans le dossier `urbanbeauty/` sur Vercel Blob :

```
urbanbeauty/
  ├── [uuid].jpg
  ├── [uuid].png
  └── ...
```

---

## 🔄 Migration depuis Cloudinary

Si vous voulez migrer de Cloudinary vers Vercel Blob :

1. **Configurez Vercel Blob** (voir section Configuration)
2. **Définissez le provider** :
   ```env
   STORAGE_PROVIDER=vercel-blob
   ```
3. **Redéployez** votre application
4. Les nouveaux uploads utiliseront Vercel Blob

**Note :** Les anciennes images sur Cloudinary continueront de fonctionner. Seuls les nouveaux uploads utiliseront Vercel Blob.

---

## 🗑️ Suppression de fichiers

Le service détecte automatiquement le provider depuis l'URL :

```typescript
// Dans votre service
await uploadService.deleteFile(imageUrl);
```

Le système détecte automatiquement si l'URL est de Vercel Blob ou Cloudinary.

---

## 📊 Comparaison Cloudinary vs Vercel Blob

| Fonctionnalité | Cloudinary | Vercel Blob |
|---------------|------------|-------------|
| **Stockage** | ✅ | ✅ |
| **CDN** | ✅ | ✅ |
| **Optimisation d'images** | ✅ Avancée | ⚠️ Basique |
| **Transformations** | ✅ Oui | ❌ Non |
| **Gratuit** | ⚠️ Limité | ✅ 1 GB |
| **Intégration Vercel** | ❌ | ✅ Native |

**Recommandation :**
- **Vercel Blob** : Si vous déployez sur Vercel et n'avez pas besoin de transformations d'images avancées
- **Cloudinary** : Si vous avez besoin d'optimisation et transformations d'images avancées

---

## 🧪 Test de configuration

Pour vérifier que Vercel Blob est bien configuré :

1. **Vérifiez les logs au démarrage** :
   ```
   ✅ Vercel Blob Storage configuré
   ```

2. **Testez un upload** :
   ```bash
   curl -X POST http://localhost:3000/api/upload/image \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test-image.jpg"
   ```

3. **Vérifiez la réponse** :
   ```json
   {
     "url": "https://...blob.vercel-storage.com/...",
     "provider": "vercel-blob"
   }
   ```

---

## 🐛 Dépannage

### Erreur : "Vercel Blob Storage n'est pas configuré"

**Solution :**
1. Vérifiez que `BLOB_READ_WRITE_TOKEN` est défini
2. Vérifiez que le token est valide
3. Redémarrez l'application

### Erreur : "Invalid token"

**Solution :**
1. Vérifiez que vous utilisez le bon token (BLOB_READ_WRITE_TOKEN)
2. Régénérez le token dans Vercel Dashboard si nécessaire

### Les images ne s'affichent pas

**Solution :**
1. Vérifiez que le conteneur Blob est créé dans Vercel
2. Vérifiez que les URLs sont accessibles publiquement
3. Vérifiez les permissions du conteneur (doit être "public")

---

## 📝 Notes importantes

1. **Token de sécurité** : Ne commitez jamais le `BLOB_READ_WRITE_TOKEN` dans votre code
2. **Limites** : Vercel Blob gratuit = 1 GB de stockage
3. **Performance** : Les fichiers sont servis via le CDN global de Vercel
4. **Backup** : Assurez-vous d'avoir un backup de vos images importantes

---

## 🔗 Ressources

- [Documentation Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- [API Reference](https://vercel.com/docs/storage/vercel-blob/using-the-sdk)
- [Pricing](https://vercel.com/pricing)

---

## ✅ Résumé

**Configuration minimale :**
```env
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxxxxxxxxxxxxxxxxxx
```

**C'est tout !** Le système détecte automatiquement Vercel Blob et l'utilise pour les uploads.

