# Guide : Consulter les Logs sur Render

## 📋 Où trouver les logs sur Render

### 1. Via le Dashboard Render (Méthode principale)

1. **Connectez-vous** à https://dashboard.render.com
2. **Sélectionnez votre service** backend "UrbanBeauty"
3. Dans le menu de gauche, cliquez sur **"Logs"** ou **"Events"**

### 2. Types de logs disponibles

#### **Logs en temps réel**
- **Events** : Historique des événements (déploiements, builds, etc.)
- **Logs** : Logs en temps réel de l'application en cours d'exécution
- **Metrics** : Métriques de performance (CPU, mémoire, etc.)

#### **Logs de Build**
- Cliquez sur un déploiement spécifique dans **"Events"**
- Vous verrez les logs complets du build (installation, compilation, etc.)

#### **Logs Runtime**
- Dans l'onglet **"Logs"**, vous verrez :
  - Les logs de l'application (console.log, console.error)
  - Les erreurs de démarrage
  - Les erreurs runtime
  - Les requêtes HTTP

---

## 🔍 Comment filtrer les logs

### Filtrer par type
- **Erreurs** : Cherchez "error", "Error", "ERROR", "failed", "Failed"
- **Warnings** : Cherchez "warn", "warning", "WARN"
- **Build errors** : Regardez dans les événements de déploiement

### Recherche dans les logs
- Utilisez `Ctrl+F` (ou `Cmd+F` sur Mac) pour chercher un terme spécifique
- Exemples de recherches :
  - `Cannot find module`
  - `TypeError`
  - `Prisma`
  - `Database connection`
  - `500` (erreurs HTTP)

---

## 📊 Exemples de logs importants

### Logs de démarrage réussis
```
🚀 Server running on port 3000
✔ Generated Prisma Client
Database connection successful
```

### Logs d'erreur courants

#### Erreur de module manquant
```
Error: Cannot find module '/opt/render/project/src/backend/dist/main'
```

#### Erreur de base de données
```
Can't reach database server at `dpg-xxxxx.oregon-postgres.render.com:5432`
```

#### Erreur TypeScript
```
Type error: Property 'xxx' does not exist on type 'YYY'
```

#### Erreur Prisma
```
PrismaClientInitializationError
Invalid `prisma.xxx.upsert()` invocation
```

---

## 🛠️ Méthodes alternatives

### 1. Render CLI (si installé)
```bash
# Installer Render CLI
npm install -g render-cli

# Se connecter
render login

# Voir les logs
render logs <service-id>
```

### 2. API Render
- Utilisez l'API Render pour récupérer les logs programmatiquement
- Documentation : https://render.com/docs/api

### 3. Shell Render
- Allez dans **"Shell"** dans le dashboard
- Ouvrez un shell interactif pour déboguer directement
- Exécutez des commandes pour tester

---

## 🚨 Logs à surveiller

### Logs critiques
1. **Erreurs de démarrage** : L'application ne démarre pas
2. **Erreurs de base de données** : Problèmes de connexion Prisma
3. **Erreurs 500** : Erreurs serveur dans les requêtes
4. **Erreurs de build** : Échec de compilation TypeScript

### Logs d'avertissement
1. **Warnings Prisma** : Schéma non synchronisé
2. **Warnings CORS** : Problèmes de CORS
3. **Warnings de mémoire** : Utilisation mémoire élevée

---

## 📝 Configuration des logs dans votre application

### Backend (NestJS)

#### Ajouter des logs personnalisés
```typescript
// Dans main.ts ou vos services
import { Logger } from '@nestjs/common';

const logger = new Logger('App');

// Logs d'information
logger.log('Application démarrée');

// Logs d'erreur
logger.error('Erreur lors de la connexion à la base de données', error);

// Logs d'avertissement
logger.warn('Stock faible pour le produit X');
```

#### Logs avec contexte
```typescript
logger.log('Produit créé', 'ProductsService');
logger.error('Erreur lors de la création', error.stack, 'ProductsService');
```

### Variables d'environnement pour les logs
```env
# Niveau de log (development, production)
LOG_LEVEL=error

# Activer les logs détaillés
DEBUG=true
```

---

## 🔧 Dépannage avec les logs

### Problème : Application ne démarre pas
1. Allez dans **Events** → Dernier déploiement
2. Vérifiez les logs de build
3. Cherchez les erreurs TypeScript ou de compilation
4. Vérifiez les erreurs de démarrage dans **Logs**

### Problème : Erreurs 500
1. Allez dans **Logs**
2. Cherchez les erreurs au moment de la requête
3. Vérifiez les stack traces
4. Identifiez le module/service en cause

### Problème : Base de données
1. Cherchez "Prisma" ou "Database" dans les logs
2. Vérifiez la connexion dans **Environment** (variables d'environnement)
3. Testez la connexion via le Shell Render

---

## 📌 Liens utiles

- **Dashboard Render** : https://dashboard.render.com
- **Documentation Render Logs** : https://render.com/docs/logs
- **Documentation Render Troubleshooting** : https://render.com/docs/troubleshooting-deploys

---

## 💡 Astuces

1. **Logs en temps réel** : Les logs se mettent à jour automatiquement
2. **Export des logs** : Vous pouvez copier/coller les logs pour les analyser
3. **Notifications** : Configurez des alertes pour les erreurs critiques
4. **Logs historiques** : Les logs sont conservés pendant un certain temps

---

## 🎯 Checklist de vérification des logs

- [ ] Vérifier les logs de build après chaque déploiement
- [ ] Surveiller les logs runtime pour les erreurs
- [ ] Vérifier les métriques (CPU, mémoire) si l'application est lente
- [ ] Chercher les erreurs récurrentes
- [ ] Vérifier les logs de base de données si des requêtes échouent

