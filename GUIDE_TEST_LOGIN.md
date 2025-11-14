# 🔐 Guide Complet : Tester le Login

## 📋 Comment le Login Fonctionne

### Flux Complet

```
1. Utilisateur remplit le formulaire /auth/login
   ↓
2. Frontend envoie POST /auth/login avec email + password
   ↓
3. Backend :
   - Trouve l'utilisateur par email dans la base de données
   - Compare le mot de passe avec bcrypt (hashé)
   - Si OK → Génère un JWT token
   - Retourne le token + infos utilisateur
   ↓
4. Frontend :
   - Stocke le token dans localStorage
   - Redirige vers /dashboard
```

---

## 🚨 IMPORTANT : Vous devez d'abord créer un utilisateur !

**Vous ne pouvez pas vous connecter si vous n'avez pas de compte !**

### Solution : Créer un compte d'abord

**Option 1 : Via le Frontend (Recommandé)**
1. Aller sur votre site Vercel : `https://votre-site.vercel.app`
2. Cliquer sur "Connexion" → "S'inscrire"
3. Remplir le formulaire :
   - Email : `test@example.com`
   - Mot de passe : `password123`
   - Prénom : `Test`
   - Nom : `User`
4. Cliquer sur "S'inscrire"
5. Vous êtes automatiquement connecté et redirigé vers `/dashboard`

**Option 2 : Via l'API directement (Postman/Thunder Client)**
Voir section "Tester avec Postman/Thunder Client" ci-dessous

---

## 🧪 Comment Tester le Login

### Méthode 1 : Via le Frontend (Le plus simple) ⭐

1. **Créer un compte d'abord**
   - Aller sur `/auth/register`
   - Remplir le formulaire
   - Cliquer sur "S'inscrire"

2. **Se connecter**
   - Aller sur `/auth/login`
   - Entrer l'email et le mot de passe
   - Cliquer sur "Se connecter"
   - Vous êtes redirigé vers `/dashboard`

---

### Méthode 2 : Via Postman/Thunder Client

#### Étape 1 : Créer un utilisateur (Register)

**URL :** `https://urbanbeauty.onrender.com/auth/register`

**Méthode :** `POST`

**Headers :**
```
Content-Type: application/json
```

**Body (JSON) :**
```json
{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User",
  "phone": "+33612345678"
}
```

**Réponse attendue (201) :**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "role": "CLIENT",
    "profile": {
      "firstName": "Test",
      "lastName": "User",
      "avatar": null
    }
  }
}
```

#### Étape 2 : Se connecter (Login)

**URL :** `https://urbanbeauty.onrender.com/auth/login`

**Méthode :** `POST`

**Headers :**
```
Content-Type: application/json
```

**Body (JSON) :**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Réponse attendue (200) :**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "role": "CLIENT",
    "profile": {
      "firstName": "Test",
      "lastName": "User",
      "avatar": null
    }
  }
}
```

#### Étape 3 : Tester une route protégée

**URL :** `https://urbanbeauty.onrender.com/auth/me`

**Méthode :** `GET`

**Headers :**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
(Remplacez par le token reçu à l'étape 2)

**Réponse attendue (200) :**
```json
{
  "id": "uuid",
  "email": "test@example.com",
  "role": "CLIENT",
  "profile": {
    "id": "uuid",
    "firstName": "Test",
    "lastName": "User",
    ...
  }
}
```

---

### Méthode 3 : Via curl (Terminal)

#### Créer un utilisateur
```bash
curl -X POST https://urbanbeauty.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### Se connecter
```bash
curl -X POST https://urbanbeauty.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Tester route protégée (remplacer TOKEN)
```bash
curl -X GET https://urbanbeauty.onrender.com/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## 🎯 Test Rapide : Créer un Utilisateur de Test

### Via le Frontend (Recommandé)

1. Ouvrir votre site : `https://votre-site.vercel.app`
2. Cliquer sur l'icône utilisateur (en haut à droite)
3. Cliquer sur "S'inscrire" ou aller sur `/auth/register`
4. Remplir :
   ```
   Email : admin@urbanbeauty.com
   Mot de passe : admin123
   Prénom : Admin
   Nom : User
   ```
5. Cliquer sur "S'inscrire"
6. ✅ Vous êtes connecté !

---

## 🔍 Vérifier que ça fonctionne

### 1. Vérifier le token dans le navigateur

1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet "Application" (Chrome) ou "Storage" (Firefox)
3. Cliquer sur "Local Storage"
4. Vous devriez voir `access_token` avec une valeur

### 2. Vérifier la connexion

1. Aller sur `/dashboard`
2. Vous devriez voir "Bienvenue [Votre Prénom] !"
3. Le Header devrait afficher un menu utilisateur (pas le bouton "Connexion")

### 3. Tester une requête protégée

Dans la console du navigateur (F12) :
```javascript
// Le token est automatiquement inclus
fetch('https://urbanbeauty.onrender.com/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
})
.then(r => r.json())
.then(console.log)
```

---

## 🐛 Dépannage

### Erreur : "Email ou mot de passe incorrect"

**Causes possibles :**
1. L'utilisateur n'existe pas → Créer un compte d'abord
2. Le mot de passe est incorrect → Vérifier le mot de passe
3. L'email est incorrect → Vérifier l'email

**Solution :**
- Créer un nouveau compte via `/auth/register`

### Erreur : "Cet email est déjà utilisé"

**Cause :** Vous essayez de créer un compte avec un email existant

**Solution :**
- Utiliser un autre email
- Ou se connecter avec l'email existant

### Erreur : "Unauthorized" sur `/auth/me`

**Cause :** Le token est invalide ou expiré

**Solution :**
- Se reconnecter via `/auth/login`
- Le nouveau token sera stocké automatiquement

### Le token n'est pas stocké

**Vérifier :**
1. Ouvrir DevTools → Application → Local Storage
2. Chercher `access_token`
3. Si absent, vérifier la console pour des erreurs

---

## 📝 Exemple Complet de Test

### Scénario : Créer un compte et se connecter

1. **Aller sur le site** : `https://votre-site.vercel.app`

2. **Créer un compte**
   - Cliquer sur "Connexion" → "S'inscrire"
   - Email : `marie.coiffeuse@example.com`
   - Mot de passe : `marie123`
   - Prénom : `Marie`
   - Nom : `Dupont`
   - Rôle : Laisser par défaut (CLIENT) ou choisir COIFFEUSE
   - Cliquer sur "S'inscrire"
   - ✅ Redirection automatique vers `/dashboard`

3. **Se déconnecter** (pour tester le login)
   - Cliquer sur l'icône utilisateur
   - Cliquer sur "Déconnexion"
   - ✅ Redirection vers `/auth/login`

4. **Se reconnecter**
   - Email : `marie.coiffeuse@example.com`
   - Mot de passe : `marie123`
   - Cliquer sur "Se connecter"
   - ✅ Redirection vers `/dashboard`

---

## ✅ Checklist de Test

- [ ] Créer un compte via `/auth/register`
- [ ] Vérifier la redirection vers `/dashboard`
- [ ] Vérifier le token dans localStorage
- [ ] Se déconnecter
- [ ] Se reconnecter via `/auth/login`
- [ ] Vérifier l'accès aux pages protégées
- [ ] Tester avec Postman/Thunder Client (optionnel)

---

## 🎓 Résumé

**Pour tester le login :**
1. ✅ **Créer un compte d'abord** via `/auth/register`
2. ✅ **Se connecter** via `/auth/login`
3. ✅ Le token est stocké automatiquement
4. ✅ Vous êtes redirigé vers `/dashboard`

**C'est tout !** 🎉

