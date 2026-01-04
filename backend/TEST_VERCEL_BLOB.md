# 🧪 Test de Vercel Blob Storage après déploiement

## ✅ Étapes de vérification

### 1. Vérifier les logs de déploiement

Sur Render Dashboard :
1. Allez dans votre service backend
2. Cliquez sur l'onglet **Logs**
3. Cherchez le message :
   ```
   ✅ Vercel Blob Storage configuré
   ```

Si vous voyez ce message, Vercel Blob est bien configuré ! ✅

Si vous voyez :
   ```
   ⚠️ Vercel Blob Storage n'est pas configuré. BLOB_READ_WRITE_TOKEN manquant.
   ```
   → Vérifiez que la variable d'environnement est bien définie sur Render.

---

### 2. Vérifier que l'application démarre correctement

Dans les logs, vérifiez que :
- ✅ L'application démarre sans erreur
- ✅ Pas d'erreur liée à `@vercel/blob`
- ✅ Le port est bien écouté (généralement 3000 ou celui configuré)

---

### 3. Tester l'upload d'image

#### Option A : Via l'interface admin (Recommandé)

1. **Connectez-vous** à votre application
2. Allez dans la section **Admin** ou **Produits**
3. Essayez d'**uploader une image** pour un produit
4. Vérifiez que :
   - ✅ L'upload fonctionne
   - ✅ L'image s'affiche correctement
   - ✅ L'URL retournée contient `blob.vercel-storage.com`

#### Option B : Via l'API (cURL)

```bash
# Remplacez YOUR_JWT_TOKEN par votre token d'authentification
# Remplacez YOUR_RENDER_URL par l'URL de votre backend Render

curl -X POST https://YOUR_RENDER_URL/api/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@chemin/vers/votre/image.jpg"
```

**Réponse attendue :**
```json
{
  "url": "https://[hash].public.blob.vercel-storage.com/urbanbeauty/[uuid].jpg",
  "publicId": "urbanbeauty/[uuid].jpg",
  "provider": "vercel-blob"
}
```

Si vous voyez `"provider": "vercel-blob"`, c'est que ça fonctionne ! ✅

---

### 4. Vérifier l'URL de l'image

L'URL retournée devrait ressembler à :
```
https://[hash].public.blob.vercel-storage.com/urbanbeauty/[filename]
```

**Testez l'URL directement dans votre navigateur** :
- ✅ L'image doit s'afficher
- ✅ L'URL doit être accessible publiquement

---

### 5. Vérifier dans Vercel Dashboard

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Storage** → **Blob**
4. Vous devriez voir vos fichiers uploadés dans le dossier `urbanbeauty/`

---

## 🐛 Dépannage

### Problème : "Vercel Blob Storage n'est pas configuré"

**Solution :**
1. Vérifiez sur Render :
   - **Environment** → Vérifiez que `BLOB_READ_WRITE_TOKEN` existe
   - Vérifiez que la valeur est correcte (commence par `vercel_blob_`)
2. Redéployez le service après avoir ajouté/modifié la variable

### Problème : Erreur "Invalid token"

**Solution :**
1. Vérifiez que le token est correct dans Vercel Dashboard
2. Régénérez le token si nécessaire
3. Mettez à jour la variable sur Render
4. Redéployez

### Problème : L'upload échoue avec une erreur

**Vérifiez les logs Render** pour voir l'erreur exacte :
- Erreur de connexion → Vérifiez le token
- Erreur de permissions → Vérifiez que le Blob est public
- Erreur de format → Vérifiez que c'est bien une image (jpg, png, gif, webp)

### Problème : L'image ne s'affiche pas

**Solution :**
1. Vérifiez que l'URL est accessible (ouvrez-la dans un navigateur)
2. Vérifiez que le Blob est configuré en "public" dans Vercel
3. Vérifiez les CORS si nécessaire

---

## ✅ Checklist de vérification

- [ ] Les logs montrent "✅ Vercel Blob Storage configuré"
- [ ] L'application démarre sans erreur
- [ ] L'upload d'image fonctionne
- [ ] L'URL retournée contient `blob.vercel-storage.com`
- [ ] Le provider retourné est `"vercel-blob"`
- [ ] L'image est accessible via l'URL
- [ ] Les fichiers apparaissent dans Vercel Dashboard

---

## 🎉 Si tout fonctionne

Félicitations ! Vercel Blob Storage est maintenant configuré et fonctionnel. 

**Prochaines étapes :**
- Les nouveaux uploads utiliseront automatiquement Vercel Blob
- Les anciennes images sur Cloudinary continueront de fonctionner
- Vous pouvez maintenant uploader des images via l'interface admin

---

## 📝 Notes

- **Premier upload** : Le dossier `urbanbeauty/` sera créé automatiquement
- **Performance** : Les images sont servies via le CDN global de Vercel
- **Stockage** : Vérifiez votre utilisation dans Vercel Dashboard (1 GB gratuit)

