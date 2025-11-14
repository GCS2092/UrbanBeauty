# 🔧 Fix pour le problème de démarrage Render

## Problème
Le build réussit mais le démarrage échoue avec :
```
Error: Cannot find module '/opt/render/project/src/backend/dist/main'
```

## Solution

### Option 1 : Vérifier le Build Command (RECOMMANDÉ)

Dans Render, vérifiez que le **Build Command** est :
```bash
npm install && npx prisma generate && npm run build
```

**Important** : Le `npx prisma generate` doit être inclus !

### Option 2 : Vérifier le Root Directory

Dans Render, vérifiez que le **Root Directory** est bien configuré à :
```
backend
```

### Option 3 : Vérifier le Start Command

Le **Start Command** doit être :
```bash
npm run start:prod
```

Et dans `package.json`, le script `start:prod` doit être :
```json
"start:prod": "node dist/main"
```

### Option 4 : Vérifier que le build crée bien dist/main.js

Si le problème persiste, vérifiez dans les logs de build que le fichier `dist/main.js` est bien créé.

## Vérification rapide

1. Allez sur Render Dashboard
2. Sélectionnez votre service backend
3. Allez dans **Settings**
4. Vérifiez :
   - **Root Directory** : `backend`
   - **Build Command** : `npm install && npx prisma generate && npm run build`
   - **Start Command** : `npm run start:prod`

## Si le problème persiste

Essayez de changer le **Start Command** pour utiliser le chemin absolu :
```bash
node backend/dist/main
```

Ou vérifiez les logs de build pour voir où le fichier `dist/main.js` est créé.

