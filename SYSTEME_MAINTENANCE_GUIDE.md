# 🔧 Guide du Système de Maintenance - UrbanBeauty

## 📋 Vue d'ensemble

Le système de maintenance permet à l'administrateur de bloquer temporairement certaines fonctionnalités de la plateforme avec des messages personnalisables. C'est très utile pour :
- Maintenance technique
- Tests de nouvelles fonctionnalités
- Gestion de la charge
- Communication avec les utilisateurs

## 🎯 Fonctionnalités Bloquables

### 1. **Prise de rendez-vous** 📅
- Bloque la création de nouvelles réservations
- Message personnalisable affiché aux utilisateurs
- Vérification côté backend et frontend

### 2. **Chat avec les prestataires** 💬
- Bloque la création de conversations et l'envoi de messages
- Message personnalisable
- Protection complète de la fonctionnalité chat

### 3. **Section Prestataires** 👥
- Bloque l'accès à la section prestataires
- Message personnalisable
- À implémenter dans la page `/prestataires`

### 4. **Connexion et Inscription** 🔐
- Bloque la connexion et l'inscription des nouveaux utilisateurs
- Message personnalisable
- Les utilisateurs existants peuvent toujours se connecter (si non bloqués individuellement)

## 🏗️ Architecture

### Backend

**Modèle Prisma :**
```prisma
model MaintenanceSettings {
  id                    String   @id @default(uuid())
  isBookingDisabled     Boolean  @default(false)
  bookingMessage        String?
  isChatDisabled        Boolean  @default(false)
  chatMessage           String?
  isPrestatairesDisabled Boolean @default(false)
  prestatairesMessage   String?
  isAuthDisabled        Boolean  @default(false)
  authMessage           String?
  updatedBy             String?
  updatedAt             DateTime @default(now()) @updatedAt
  createdAt             DateTime @default(now())
}
```

**Module :** `backend/src/modules/maintenance/`
- `maintenance.service.ts` - Logique métier
- `maintenance.controller.ts` - Endpoints API
- `maintenance.module.ts` - Module NestJS

**Endpoints API :**
- `GET /api/maintenance/settings` - Récupérer les paramètres (admin uniquement)
- `PUT /api/maintenance/settings` - Mettre à jour les paramètres (admin uniquement)
- `GET /api/maintenance/check/booking` - Vérifier l'état des réservations (public)
- `GET /api/maintenance/check/chat` - Vérifier l'état du chat (public)
- `GET /api/maintenance/check/prestataires` - Vérifier l'état des prestataires (public)
- `GET /api/maintenance/check/auth` - Vérifier l'état de l'authentification (public)

**Vérifications intégrées :**
- ✅ `BookingsController.create()` - Vérifie avant de créer une réservation
- ✅ `ChatController.createConversation()` - Vérifie avant de créer une conversation
- ✅ `ChatController.sendMessage()` - Vérifie avant d'envoyer un message
- ✅ `AuthController.register()` - Vérifie avant l'inscription
- ✅ `AuthController.login()` - Vérifie avant la connexion

### Frontend

**Service :** `frontend/src/services/maintenance.service.ts`
**Hooks :** `frontend/src/hooks/useMaintenance.ts`
**Composant :** `frontend/src/components/maintenance/MaintenanceBanner.tsx`
**Page Admin :** `frontend/src/app/dashboard/admin/maintenance/page.tsx`

**Intégrations :**
- ✅ Page de service (`/services/[id]`) - Affiche le banner si les réservations sont bloquées
- ⏳ Page de chat (`/dashboard/chat`) - À implémenter
- ⏳ Page prestataires (`/prestataires`) - À implémenter
- ⏳ Pages auth (`/auth/login`, `/auth/register`) - À implémenter

## 📝 Utilisation

### Pour l'Administrateur

1. **Accéder aux paramètres de maintenance :**
   - Aller sur `/dashboard/admin/maintenance`
   - Ou cliquer sur "Maintenance" dans le dashboard admin

2. **Bloquer une fonctionnalité :**
   - Activer le toggle pour la fonctionnalité souhaitée
   - Optionnellement, ajouter un message personnalisé
   - Cliquer sur "Enregistrer les paramètres"

3. **Exemple de messages :**
   - **Réservations :** "La prise de rendez-vous est temporairement désactivée pour maintenance. Veuillez réessayer plus tard."
   - **Chat :** "Le chat est temporairement indisponible. Contactez-nous par email à contact@urbanbeauty.com"
   - **Prestataires :** "La section prestataires est temporairement indisponible."
   - **Auth :** "L'inscription est temporairement fermée. Les utilisateurs existants peuvent toujours se connecter."

### Pour les Développeurs

**Vérifier l'état d'une fonctionnalité :**
```typescript
import { useCheckBooking } from '@/hooks/useMaintenance';

function MyComponent() {
  const { data: bookingStatus } = useCheckBooking();
  
  if (bookingStatus?.disabled) {
    return <MaintenanceBanner message={bookingStatus.message} />;
  }
  
  // Afficher le formulaire normal
}
```

**Afficher un banner de maintenance :**
```typescript
import MaintenanceBanner from '@/components/maintenance/MaintenanceBanner';

<MaintenanceBanner
  message="La fonctionnalité est temporairement indisponible"
  variant="error" // ou "warning"
  onClose={() => setShowBanner(false)} // optionnel
/>
```

## 🔄 Prochaines Étapes

### À Implémenter

1. **Page Prestataires** (`/prestataires`)
   - Vérifier `useCheckPrestataires()`
   - Afficher le banner si désactivé
   - Masquer le contenu si désactivé

2. **Pages Auth** (`/auth/login`, `/auth/register`)
   - Vérifier `useCheckAuth()`
   - Afficher le message personnalisé
   - Désactiver les formulaires

3. **Page Chat** (`/dashboard/chat`)
   - Vérifier `useCheckChat()`
   - Afficher le banner
   - Désactiver l'envoi de messages

4. **Améliorations**
   - Historique des changements de maintenance
   - Programmation de la maintenance (début/fin automatique)
   - Notifications aux utilisateurs avant la maintenance

## ⚠️ Notes Importantes

- Les vérifications backend sont **obligatoires** pour la sécurité
- Les vérifications frontend sont pour l'**UX** (affichage des messages)
- Les messages personnalisés sont **optionnels** mais recommandés
- L'admin peut toujours accéder à toutes les fonctionnalités (non bloqué par le système de maintenance)

## 🧪 Tests

Pour tester le système :

1. **Activer la maintenance des réservations :**
   - Aller sur `/dashboard/admin/maintenance`
   - Activer "Prise de rendez-vous"
   - Ajouter un message personnalisé
   - Enregistrer

2. **Tester côté utilisateur :**
   - Aller sur une page de service
   - Vérifier que le banner s'affiche
   - Essayer de créer une réservation (doit échouer avec le message)

3. **Vérifier côté backend :**
   - Faire une requête POST `/api/bookings`
   - Doit retourner 503 Service Unavailable avec le message

## 📚 Fichiers Créés/Modifiés

### Backend
- ✅ `backend/prisma/schema.prisma` - Modèle MaintenanceSettings
- ✅ `backend/src/modules/maintenance/` - Module complet
- ✅ `backend/src/modules/bookings/controllers/bookings.controller.ts` - Vérification ajoutée
- ✅ `backend/src/modules/chat/controllers/chat.controller.ts` - Vérifications ajoutées
- ✅ `backend/src/modules/auth/controllers/auth.controller.ts` - Vérifications ajoutées

### Frontend
- ✅ `frontend/src/services/maintenance.service.ts`
- ✅ `frontend/src/hooks/useMaintenance.ts`
- ✅ `frontend/src/components/maintenance/MaintenanceBanner.tsx`
- ✅ `frontend/src/app/dashboard/admin/maintenance/page.tsx`
- ✅ `frontend/src/app/dashboard/admin/page.tsx` - Lien ajouté
- ✅ `frontend/src/app/services/[id]/page.tsx` - Intégration ajoutée

## ✅ Statut

- ✅ Modèle de données créé
- ✅ Backend complet (service, contrôleur, module)
- ✅ Vérifications backend intégrées
- ✅ Interface admin créée
- ✅ Service et hooks frontend créés
- ✅ Composant MaintenanceBanner créé
- ✅ Intégration dans la page de service
- ⏳ Intégration dans les pages auth (à faire)
- ⏳ Intégration dans la page chat (à faire)
- ⏳ Intégration dans la page prestataires (à faire)

---

**Le système est fonctionnel et prêt à être utilisé !** 🎉

