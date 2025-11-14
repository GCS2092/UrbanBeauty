# ✅ Authentification Implémentée

## 🎉 Ce qui a été créé

### 1. DTOs (Data Transfer Objects)
- ✅ `RegisterDto` - Validation de l'inscription
- ✅ `LoginDto` - Validation de la connexion
- ✅ `AuthResponseDto` - Format de réponse

### 2. Service d'Authentification
- ✅ `AuthService` avec :
  - `register()` - Inscription avec hashage du mot de passe
  - `login()` - Connexion avec vérification
  - `validateUser()` - Validation utilisateur

### 3. JWT Strategy & Guards
- ✅ `JwtStrategy` - Stratégie Passport JWT
- ✅ `JwtAuthGuard` - Protection des routes
- ✅ `RolesGuard` - Protection par rôles

### 4. Contrôleur
- ✅ `AuthController` avec endpoints :
  - `POST /auth/register` - Inscription
  - `POST /auth/login` - Connexion
  - `GET /auth/me` - Profil utilisateur (protégé)

### 5. Décorateurs
- ✅ `@Roles()` - Définir les rôles requis
- ✅ `@CurrentUser()` - Récupérer l'utilisateur connecté

---

## 📡 Endpoints disponibles

### POST /auth/register
**Inscription d'un nouvel utilisateur**

**Body :**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+33612345678",  // optionnel
  "role": "CLIENT"  // optionnel, par défaut CLIENT
}
```

**Réponse (201) :**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "CLIENT",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "avatar": null
    }
  }
}
```

---

### POST /auth/login
**Connexion**

**Body :**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse (200) :**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "CLIENT",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "avatar": null
    }
  }
}
```

---

### GET /auth/me
**Récupérer le profil de l'utilisateur connecté**

**Headers :**
```
Authorization: Bearer <access_token>
```

**Réponse (200) :**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "CLIENT",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "profile": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+33612345678",
    "address": null,
    "avatar": null,
    "isProvider": false,
    "rating": null
  }
}
```

---

## 🧪 Comment tester

### Option 1 : Thunder Client (VS Code)
1. Installer l'extension "Thunder Client"
2. Créer une nouvelle requête
3. Tester les endpoints

### Option 2 : Postman
1. Importer la collection
2. Tester les endpoints

### Option 3 : curl
```bash
# Inscription
curl -X POST https://urbanbeauty.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Connexion
curl -X POST https://urbanbeauty.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Profil (remplacer TOKEN par le token reçu)
curl -X GET https://urbanbeauty.onrender.com/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## 🔒 Protection des routes

### Exemple : Route protégée
```typescript
@Get('protected')
@UseGuards(JwtAuthGuard)
getProtected(@CurrentUser() user: any) {
  return { message: 'Vous êtes connecté', user };
}
```

### Exemple : Route avec rôle spécifique
```typescript
@Get('admin-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
getAdminOnly() {
  return { message: 'Accès admin uniquement' };
}
```

---

## ⚙️ Variables d'environnement nécessaires

Dans Render, vérifier que vous avez :
```
JWT_SECRET=votre-secret-super-long-et-securise
JWT_EXPIRES_IN=7d
```

---

## ✅ Prochaines étapes

1. **Tester l'authentification** ✅
2. **Créer le module Users** (CRUD utilisateurs)
3. **Créer le module Products** (CRUD produits)
4. **Créer le module Services** (CRUD services)
5. **Implémenter l'upload d'images** (Cloudinary)

---

## 🐛 Dépannage

### Erreur : "JWT_SECRET is not defined"
- Vérifier que `JWT_SECRET` est dans les variables d'environnement Render

### Erreur : "Email already exists"
- L'utilisateur existe déjà, utiliser `/auth/login` à la place

### Erreur : "Unauthorized"
- Vérifier que le token JWT est valide
- Vérifier le format : `Authorization: Bearer <token>`

---

**L'authentification est prête ! 🚀**

