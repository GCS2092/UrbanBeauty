# Guide de Configuration Firebase Cloud Messaging (FCM)

## 📍 Où mettre vos clés Firebase

### Backend (Render) - Variables d'environnement

Dans votre dashboard Render, ajoutez ces variables d'environnement pour votre service backend :

```
FIREBASE_PROJECT_ID=votre-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE_ICI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@votre-project.iam.gserviceaccount.com
```

**Important pour FIREBASE_PRIVATE_KEY :**
- Copiez TOUTE la clé privée depuis votre fichier JSON (champ `private_key`)
- Incluez les lignes `-----BEGIN PRIVATE KEY-----` et `-----END PRIVATE KEY-----`
- Remplacez les `\n` réels par `\n` (le caractère d'échappement)
- Ou mettez toute la clé sur une seule ligne avec `\n` entre les lignes

**Exemple :**
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n...votre clé complète...\n-----END PRIVATE KEY-----\n"
```

### Frontend (Vercel) - Variables d'environnement

Dans votre dashboard Vercel, ajoutez ces variables d'environnement :

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BGx...
```

## 🔑 Où trouver ces valeurs

### 1. Configuration Firebase (Frontend)
1. Allez sur https://console.firebase.google.com/
2. Sélectionnez votre projet
3. Cliquez sur l'icône ⚙️ (Paramètres) → Paramètres du projet
4. Dans l'onglet "Vos applications", trouvez votre app Web
5. Copiez toutes les valeurs de `firebaseConfig`

### 2. Clé VAPID
1. Firebase Console → Paramètres du projet → Cloud Messaging
2. Onglet "Web Push certificates"
3. Si vous n'avez pas de clé, cliquez sur "Générer une paire de clés"
4. Copiez la "Key pair" (clé publique) → c'est votre `VAPID_KEY`

### 3. Service Account (Backend)
1. Firebase Console → Paramètres du projet → Comptes de service
2. Onglet "Comptes de service"
3. Cliquez sur "Générer une nouvelle clé privée"
4. Téléchargez le fichier JSON
5. Dans ce fichier JSON, vous trouverez :
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (toute la clé avec les `\n`)
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

## 📝 Mise à jour du Service Worker

**Fichier : `frontend/public/firebase-messaging-sw.js`**

Remplacez les valeurs `VOTRE_*` par vos vraies valeurs de configuration Firebase :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...", // Votre vraie API key
  authDomain: "votre-project.firebaseapp.com",
  projectId: "votre-project-id",
  storageBucket: "votre-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
};
```

## ✅ Vérification

1. **Backend** : Vérifiez les logs Render - vous devriez voir "✅ Firebase Admin initialized successfully"
2. **Frontend** : Ouvrez la console du navigateur - vous devriez voir "FCM Token obtained: ..."
3. **Test** : Connectez-vous et vérifiez que le token est enregistré

## 🚀 Utilisation

Les notifications seront automatiquement envoyées lors de :
- Création de commande
- Mise à jour de commande
- Création de réservation
- Mise à jour de réservation

Vous pouvez aussi envoyer manuellement depuis le dashboard admin (à implémenter si besoin).

## 📱 Permissions navigateur

Les utilisateurs devront autoriser les notifications dans leur navigateur. Le système demandera automatiquement la permission lors de la première connexion.

