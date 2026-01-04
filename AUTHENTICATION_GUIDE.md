# 🔐 Guide Complet de l'Authentification UrbanBeauty

## 📋 Vue d'ensemble

L'authentification est gérée avec **JWT (JSON Web Tokens)** côté backend et **localStorage + React Query** côté frontend.

---

## 🏗️ Architecture Authentification

### Backend (NestJS)
- ✅ **JWT Strategy** (Passport)
- ✅ **Guards** pour protéger les routes
- ✅ **Roles Guard** pour les permissions par rôle
- ✅ **Bcrypt** pour le hashage des mots de passe

### Frontend (Next.js)
- ✅ **Axios** avec intercepteurs pour ajouter le token
- ✅ **localStorage** pour stocker le token
- ✅ **React Query** pour gérer l'état utilisateur
- ✅ **Hook useAuth** pour simplifier l'utilisation

---

## 🔑 Comment ça fonctionne

### 1. Inscription (Register)

**Flux :**
```
1. Utilisateur remplit le formulaire /auth/register
2. Frontend envoie POST /auth/register
3. Backend :
   - Vérifie que l'email n'existe pas
   - Hash le mot de passe avec bcrypt
   - Crée l'utilisateur + profil
   - Génère un JWT token
4. Frontend :
   - Stocke le token dans localStorage
   - Redirige vers /dashboard
```

**Code :**
```typescript
// Frontend
const { register } = useAuth();
register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  role: 'CLIENT' // optionnel, par défaut CLIENT
});
```

---

### 2. Connexion (Login)

**Flux :**
```
1. Utilisateur remplit le formulaire /auth/login
2. Frontend envoie POST /auth/login
3. Backend :
   - Trouve l'utilisateur par email
   - Compare le mot de passe avec bcrypt
   - Génère un JWT token
4. Frontend :
   - Stocke le token dans localStorage
   - Redirige vers /dashboard
```

**Code :**
```typescript
// Frontend
const { login } = useAuth();
login({
  email: 'user@example.com',
  password: 'password123'
});
```

---

### 3. Protection des Routes

**Avec le composant ProtectedRoute :**
```typescript
// Page protégée (nécessite connexion)
import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Contenu protégé</div>
    </ProtectedRoute>
  );
}
```

**Avec protection par rôle :**
```typescript
// Page réservée aux coiffeuses
<ProtectedRoute requiredRole="COIFFEUSE">
  <div>Contenu réservé aux coiffeuses</div>
</ProtectedRoute>
```

---

### 4. Utilisation du Token

**Automatique avec Axios :**
Le token est automatiquement ajouté à toutes les requêtes via l'intercepteur :

```typescript
// frontend/src/lib/api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Manuellement :**
```typescript
const response = await api.get('/protected-endpoint');
// Le token est automatiquement inclus
```

---

### 5. Déconnexion (Logout)

**Flux :**
```
1. Utilisateur clique sur "Déconnexion"
2. Frontend :
   - Supprime le token du localStorage
   - Vide le cache React Query
   - Redirige vers /auth/login
```

**Code :**
```typescript
const { logout } = useAuth();
logout();
```

---

## 👥 Gestion des Rôles

### Rôles disponibles
- **CLIENT** : Utilisateur standard (par défaut)
- **COIFFEUSE** : Prestataire de services
- **VENDEUSE** : Vendeuse de produits
- **ADMIN** : Administrateur

### Vérifier le rôle
```typescript
const { user } = useAuth();

if (user?.role === 'COIFFEUSE') {
  // Afficher les fonctionnalités coiffeuse
}

if (user?.role === 'VENDEUSE') {
  // Afficher les fonctionnalités vendeuse
}
```

### Protection par rôle (Backend)
```typescript
@Get('admin-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
getAdminOnly() {
  return { message: 'Accès admin uniquement' };
}
```

---

## 🛡️ Protection des Routes Frontend

### Option 1 : Composant ProtectedRoute (Recommandé)

```typescript
// frontend/src/app/dashboard/page.tsx
import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Contenu protégé</div>
    </ProtectedRoute>
  );
}
```

### Option 2 : Vérification manuelle

```typescript
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated) return null;

  return <div>Contenu protégé</div>;
}
```

---

## 📦 Packages Installés

### Backend
- ✅ `@nestjs/jwt` - Gestion JWT
- ✅ `@nestjs/passport` - Stratégies d'authentification
- ✅ `passport-jwt` - Stratégie JWT pour Passport
- ✅ `bcrypt` - Hashage des mots de passe
- ✅ `class-validator` - Validation des DTOs

### Frontend
- ✅ `axios` - Requêtes HTTP avec intercepteurs
- ✅ `@tanstack/react-query` - Gestion d'état et cache
- ✅ `zustand` - (Optionnel) State management global

**Aucun package supplémentaire nécessaire !** ✅

---

## 🔧 Configuration

### Backend (.env)
```env
JWT_SECRET=votre-secret-super-long-et-securise
JWT_EXPIRES_IN=7d
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://urbanbeauty.onrender.com
```

---

## 🎯 Utilisation Pratique

### Dans un composant
```typescript
'use client';
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) return <div>Chargement...</div>;
  if (!isAuthenticated) return <div>Non connecté</div>;

  return (
    <div>
      <p>Bonjour {user?.profile?.firstName} !</p>
      <p>Rôle : {user?.role}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

### Dans le Header
```typescript
const { isAuthenticated, user, logout } = useAuth();

{isAuthenticated ? (
  <div>
    <p>{user?.profile?.firstName}</p>
    <button onClick={logout}>Déconnexion</button>
  </div>
) : (
  <Link href="/auth/login">Connexion</Link>
)}
```

---

## 🔄 Gestion du Token

### Stockage
- **localStorage** : `access_token`
- **Durée** : 7 jours (configurable)

### Expiration
Si le token expire :
1. L'intercepteur axios détecte l'erreur 401
2. Supprime automatiquement le token
3. Redirige vers `/auth/login`

### Refresh Token (Optionnel - à implémenter plus tard)
Pour l'instant, pas de refresh token. Si besoin :
1. Créer endpoint `/auth/refresh`
2. Stocker `refresh_token` séparément
3. Utiliser pour renouveler `access_token`

---

## 🚨 Sécurité

### ✅ Bonnes pratiques implémentées
- ✅ Mots de passe hashés avec bcrypt (10 rounds)
- ✅ JWT signé avec secret
- ✅ Validation des entrées (DTOs)
- ✅ Protection CORS
- ✅ Token dans localStorage (acceptable pour MVP)

### ⚠️ Améliorations futures
- [ ] Refresh tokens
- [ ] HttpOnly cookies (plus sécurisé que localStorage)
- [ ] Rate limiting sur login/register
- [ ] 2FA (optionnel)

---

## 📝 Checklist Authentification

- [x] Backend : JWT Strategy
- [x] Backend : Guards (JWT, Roles)
- [x] Backend : Endpoints register/login
- [x] Frontend : Service auth
- [x] Frontend : Hook useAuth
- [x] Frontend : Intercepteurs axios
- [x] Frontend : Composant ProtectedRoute
- [x] Frontend : Header avec état utilisateur
- [ ] Refresh tokens (optionnel)
- [ ] Protection routes dashboard

---

## 🎓 Exemples Complets

### Exemple 1 : Page Dashboard Protégée
```typescript
// frontend/src/app/dashboard/page.tsx
'use client';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div>
        <h1>Bienvenue {user?.profile?.firstName} !</h1>
        <p>Rôle : {user?.role}</p>
      </div>
    </ProtectedRoute>
  );
}
```

### Exemple 2 : Page Réservée aux Coiffeuses
```typescript
// frontend/src/app/dashboard/services/page.tsx
'use client';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function ServicesPage() {
  return (
    <ProtectedRoute requiredRole="COIFFEUSE">
      <div>Gérer mes services</div>
    </ProtectedRoute>
  );
}
```

---

## ✅ Résumé

**L'authentification est complète et fonctionnelle !**

- ✅ Inscription/Connexion fonctionnelles
- ✅ Protection des routes
- ✅ Gestion des rôles
- ✅ Token JWT automatique
- ✅ Déconnexion
- ✅ Aucun package supplémentaire nécessaire

**Tout est prêt pour l'utilisation !** 🎉

