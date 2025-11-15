# Migrations à appliquer sur Render

## 📋 Migrations en attente

Deux migrations doivent être appliquées sur Render :

1. **20250116000000_add_reviews_and_updates** - Système de reviews et mises à jour
2. **20250116000001_add_tracking_code** - Ajout du code de suivi pour les commandes

## 🚀 Commandes à exécuter sur Render

### Option 1 : Via le Shell Render (recommandé)

1. Connectez-vous au Shell Render de votre service backend
2. Exécutez les commandes suivantes :

```bash
# Aller dans le répertoire backend
cd ~/project/src/backend

# Récupérer le dernier code
git pull origin main

# Appliquer toutes les migrations en attente
npx prisma migrate deploy
```

### Option 2 : Via le Build Command Render

Si vous préférez que les migrations s'appliquent automatiquement lors du déploiement, ajoutez cette commande dans les **Build Command** de Render :

```bash
cd src/backend && npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

## ✅ Vérification

Après l'application des migrations, vérifiez que tout fonctionne :

```bash
# Vérifier le statut des migrations
npx prisma migrate status

# Devrait afficher : "No pending migrations to apply"
```

## 📝 Détails des migrations

### Migration 1: add_reviews_and_updates
- Ajoute les champs `providerReply` et `providerReplyAt` à la table `Review`
- Crée la table `ReviewHelpful` pour les votes utiles
- Ajoute les champs `rating`, `averageRating`, `reviewCount` aux tables `Product` et `Service`
- Ajoute le champ `providerId` à la table `HairStyleRequest`

### Migration 2: add_tracking_code
- Ajoute le champ `trackingCode` à la table `Order`
- Crée un index unique sur `trackingCode`
- Génère automatiquement des codes de suivi pour les commandes existantes (format: UB-ABC123)

## ⚠️ Important

- Les migrations sont **idempotentes** (utilisent `IF NOT EXISTS` et `IF EXISTS`)
- Elles peuvent être exécutées plusieurs fois sans problème
- Les commandes existantes recevront automatiquement un code de suivi

