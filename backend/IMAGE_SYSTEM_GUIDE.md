# 🖼️ Guide du Système d'Images UrbanBeauty

## 📋 Vue d'ensemble

Le système d'images supporte **deux méthodes** pour ajouter des images :
1. **URL** - Image depuis un lien externe (Unsplash, Cloudinary, etc.)
2. **UPLOADED** - Image téléversée sur Cloudinary

---

## 🎯 Comment ça fonctionne

### Modèle Image

```prisma
model Image {
  id          String    @id @default(uuid())
  url         String    // URL de l'image (téléversée ou externe)
  type        ImageType // UPLOADED ou URL
  alt         String?   // Texte alternatif
  title       String?   // Titre de l'image
  order       Int?      // Ordre d'affichage
  isPrimary   Boolean   @default(false) // Image principale
  productId   String?   // Pour les images de produits
  serviceId   String?   // Pour les images de services
  portfolioId String?   // Pour les images de portfolio
}
```

### Types d'Images

```prisma
enum ImageType {
  UPLOADED  // Image téléversée sur Cloudinary
  URL       // Image depuis une URL externe
}
```

---

## 📸 Méthode 1 : Ajouter une Image par URL

### Avantages
- ✅ Rapide et simple
- ✅ Pas besoin de stockage
- ✅ Idéal pour les images de test/démo

### Utilisation

**Dans le seed (exemple) :**
```typescript
images: {
  create: [
    {
      url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
      type: 'URL',
      alt: 'Masque Hydratant Intensif',
      title: 'Masque Hydratant Intensif - UrbanBeauty',
      order: 0,
      isPrimary: true,
    },
  ],
}
```

**Via l'API (à implémenter) :**
```typescript
POST /api/images
{
  "url": "https://example.com/image.jpg",
  "type": "URL",
  "productId": "product-id",
  "alt": "Description de l'image",
  "isPrimary": true
}
```

---

## 📤 Méthode 2 : Uploader une Image

### Avantages
- ✅ Contrôle total sur les images
- ✅ Optimisation automatique (Cloudinary)
- ✅ Pas de dépendance externe

### Utilisation

**Via l'API (à implémenter) :**
```typescript
POST /api/images/upload
Content-Type: multipart/form-data

FormData:
  - file: [fichier image]
  - productId: "product-id" (optionnel)
  - serviceId: "service-id" (optionnel)
  - alt: "Description" (optionnel)
  - isPrimary: true (optionnel)
```

**Réponse :**
```json
{
  "id": "image-id",
  "url": "https://res.cloudinary.com/.../image.jpg",
  "type": "UPLOADED",
  "alt": "Description",
  "isPrimary": true
}
```

---

## 🎨 Images dans le Seed

### Produits

Le seed inclut maintenant des **belles images** depuis Unsplash pour :

1. **Masque Hydratant Intensif** - 2 images
2. **Sérum Vitamine C** - 2 images
3. **Shampooing Réparateur** - 2 images
4. **Huile Capillaire Nourrissante** - 2 images

### Services

1. **Tresses Africaines** - 2 images
2. **Pose de Perruque** - 2 images
3. **Locks Entretien** - 2 images

### Catégories

Toutes les catégories ont maintenant une image :
- Soin Visage
- Soin Cheveux
- Soin Corps
- Maquillage

---

## 🔧 Configuration Cloudinary (Pour Uploads)

### Variables d'environnement

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Installation

```bash
npm install cloudinary @nestjs/cloudinary
```

---

## 📝 Exemples d'Utilisation

### Créer un produit avec images URL

```typescript
const product = await prisma.product.create({
  data: {
    name: 'Nouveau Produit',
    slug: 'nouveau-produit',
    // ... autres champs
    images: {
      create: [
        {
          url: 'https://images.unsplash.com/photo-...',
          type: 'URL',
          alt: 'Nouveau Produit',
          isPrimary: true,
          order: 0,
        },
        {
          url: 'https://images.unsplash.com/photo-...',
          type: 'URL',
          alt: 'Nouveau Produit - Vue 2',
          isPrimary: false,
          order: 1,
        },
      ],
    },
  },
});
```

### Ajouter une image à un produit existant

```typescript
await prisma.image.create({
  data: {
    url: 'https://images.unsplash.com/photo-...',
    type: 'URL',
    productId: 'product-id',
    alt: 'Nouvelle image',
    isPrimary: false,
    order: 2,
  },
});
```

### Récupérer les images d'un produit

```typescript
const product = await prisma.product.findUnique({
  where: { id: 'product-id' },
  include: {
    images: {
      orderBy: { order: 'asc' },
    },
  },
});

// Image principale
const primaryImage = product.images.find(img => img.isPrimary);
```

---

## 🎯 Bonnes Pratiques

### 1. Image Principale
- Toujours définir une image principale (`isPrimary: true`)
- Utiliser `order: 0` pour l'image principale

### 2. Ordre des Images
- Utiliser `order` pour contrôler l'affichage
- Commencer à 0 pour la première image

### 3. Alt Text
- Toujours fournir un `alt` descriptif
- Important pour l'accessibilité et le SEO

### 4. URLs Externes
- Utiliser des URLs HTTPS
- Vérifier que les images sont accessibles
- Utiliser des services fiables (Unsplash, Cloudinary, etc.)

### 5. Optimisation
- Pour les uploads, utiliser Cloudinary pour l'optimisation automatique
- Pour les URLs, utiliser des paramètres de taille (ex: `?w=800&q=80`)

---

## 🔍 Sources d'Images Recommandées

### Gratuites (Libres d'utilisation)
- **Unsplash** : https://unsplash.com
- **Pexels** : https://pexels.com
- **Pixabay** : https://pixabay.com

### Stockage Cloud
- **Cloudinary** : https://cloudinary.com (recommandé)
- **AWS S3** : https://aws.amazon.com/s3
- **Imgur** : https://imgur.com

---

## ✅ Résumé

**Le système d'images est maintenant complet :**

1. ✅ Support des URLs externes (Unsplash)
2. ✅ Support des uploads (Cloudinary - à configurer)
3. ✅ Images dans le seed pour produits et services
4. ✅ Images pour les catégories
5. ✅ Métadonnées (alt, title, order, isPrimary)

**Pour tester :**
```bash
cd backend
npm run prisma:seed
```

Tous les produits et services auront maintenant de belles images ! 🎨

