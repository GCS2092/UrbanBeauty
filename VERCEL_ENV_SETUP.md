# 🔧 Configuration Variables d'Environnement Vercel

## Problème : Impossible d'ajouter la variable d'environnement

Si vous avez des erreurs comme "invalid characters" ou "digits" lors de la configuration dans Vercel, voici les solutions :

---

## ✅ Solution 1 : Configuration via l'interface Vercel

### Étapes détaillées :

1. **Aller sur votre projet Vercel**
   - Ouvrir [vercel.com/dashboard](https://vercel.com/dashboard)
   - Sélectionner votre projet **UrbanBeauty**

2. **Accéder aux Settings**
   - Cliquer sur **"Settings"** (en haut)
   - Cliquer sur **"Environment Variables"** (menu de gauche)

3. **Ajouter la variable**
   - Cliquer sur **"Add New"**
   - **Key** : `NEXT_PUBLIC_API_URL`
   - **Value** : `https://urbanbeauty.onrender.com`
   - **Environments** : Cocher **Production**, **Preview**, et **Development**
   - Cliquer sur **"Save"**

### ⚠️ Points importants :

- **Pas d'espaces** avant/après la valeur
- **Pas de guillemets** autour de la valeur
- **Pas de point-virgule** à la fin
- Utiliser **exactement** : `NEXT_PUBLIC_API_URL` (avec underscores, pas de tirets)

---

## ✅ Solution 2 : Configuration via Vercel CLI

Si l'interface ne fonctionne pas, utilisez la CLI :

### Installation Vercel CLI
```bash
npm install -g vercel
```

### Se connecter
```bash
vercel login
```

### Ajouter la variable
```bash
vercel env add NEXT_PUBLIC_API_URL production
```
Quand demandé, entrer : `https://urbanbeauty.onrender.com`

Répéter pour preview et development :
```bash
vercel env add NEXT_PUBLIC_API_URL preview
vercel env add NEXT_PUBLIC_API_URL development
```

### Redéployer
```bash
vercel --prod
```

---

## ✅ Solution 3 : Configuration via fichier `vercel.json`

Créer un fichier `vercel.json` à la racine du projet :

```json
{
  "env": {
    "NEXT_PUBLIC_API_URL": "https://urbanbeauty.onrender.com"
  }
}
```

⚠️ **Note** : Cette méthode est moins sécurisée car la variable est dans le code. Préférez les méthodes 1 ou 2.

---

## ✅ Solution 4 : Valeur par défaut dans le code

Si vous ne pouvez vraiment pas configurer la variable, le code utilise déjà une valeur par défaut :

Le fichier `frontend/src/lib/api.ts` contient :
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://urbanbeauty.onrender.com';
```

Donc même sans variable d'environnement, ça fonctionnera avec l'URL par défaut.

---

## 🔍 Vérification

### Vérifier que la variable est bien configurée :

1. Dans Vercel → Settings → Environment Variables
2. Vous devriez voir `NEXT_PUBLIC_API_URL` avec la valeur `https://urbanbeauty.onrender.com`

### Tester après redéploiement :

1. Redéployer le projet (Vercel le fait automatiquement après ajout de variable)
2. Ouvrir votre site Vercel
3. Ouvrir la console du navigateur (F12)
4. Vérifier qu'il n'y a pas d'erreurs CORS

---

## 🐛 Erreurs courantes et solutions

### Erreur : "Invalid characters"
- ✅ Vérifier qu'il n'y a pas d'espaces
- ✅ Vérifier qu'il n'y a pas de guillemets
- ✅ Copier-coller exactement : `https://urbanbeauty.onrender.com`

### Erreur : "Variable name must start with a letter"
- ✅ Vérifier que le nom commence bien par `NEXT_PUBLIC_`
- ✅ Pas de tirets dans le nom, seulement des underscores

### Erreur : "Value too long"
- ✅ Vérifier que l'URL est correcte
- ✅ Utiliser une URL courte si possible

---

## 📝 Checklist

- [ ] Variable `NEXT_PUBLIC_API_URL` ajoutée dans Vercel
- [ ] Valeur : `https://urbanbeauty.onrender.com` (sans guillemets)
- [ ] Environnements : Production, Preview, Development cochés
- [ ] Projet redéployé (automatique ou manuel)
- [ ] Test du site : pas d'erreurs dans la console

---

## 🚀 Après configuration

Une fois la variable configurée, Vercel redéploiera automatiquement. Si ce n'est pas le cas :

1. Aller dans **Deployments**
2. Cliquer sur les **3 points** du dernier déploiement
3. Cliquer sur **"Redeploy"**

Votre frontend devrait maintenant se connecter correctement au backend ! 🎉

