# Boutique Mode — Architecture complète du projet

---

## Stack technique

| Couche | Technologie | Rôle |
|---|---|---|
| Frontend | React 18 + Vite | SPA, UI |
| Styling | Tailwind CSS v3 | Design system |
| State global | Zustand | Panier, auth, UI |
| Routeur | React Router v6 | Navigation SPA |
| Requêtes API | TanStack Query v5 | Cache, fetching, mutations |
| Formulaires | React Hook Form + Zod | Validation |
| Backend | Node.js + Express | REST API |
| ORM | Prisma | Modèles, migrations |
| Base de données | PostgreSQL | Données persistantes |
| Auth | JWT + bcrypt | Authentification |
| Sécurité | Helmet + express-rate-limit + CORS | Hardening API |
| Images | Cloudinary | Stockage + CDN images |
| Upload | Multer + Cloudinary SDK | Middleware upload |
| Email | Nodemailer + Gmail SMTP | Confirmations, suivi |
| Variables env | dotenv | Config secrets |

---

## Arborescence complète

```
boutique-mode/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           ← Schéma PostgreSQL + modèles
│   │   └── migrations/             ← Fichiers de migration auto-générés
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js         ← Instance Prisma Client
│   │   │   ├── cloudinary.js       ← Config SDK Cloudinary
│   │   │   └── email.js            ← Config Nodemailer
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js      ← Vérifie JWT, injecte req.user
│   │   │   ├── admin.middleware.js     ← Vérifie rôle ADMIN
│   │   │   ├── upload.middleware.js    ← Multer + validation fichiers
│   │   │   ├── rateLimit.middleware.js ← Limite les requêtes abusives
│   │   │   ├── validation.middleware.js← Valide les payloads JSON
│   │   │   ├── logger.middleware.js    ← Logger requêtes et erreurs
│   │   │   └── error.middleware.js     ← Handler global d'erreurs
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   └── auth.service.js
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── users.routes.js
│   │   │   │   ├── users.controller.js
│   │   │   │   └── users.service.js
│   │   │   │
│   │   │   ├── products/
│   │   │   │   ├── products.routes.js
│   │   │   │   ├── products.controller.js
│   │   │   │   └── products.service.js
│   │   │   │
│   │   │   ├── categories/
│   │   │   │   ├── categories.routes.js
│   │   │   │   ├── categories.controller.js
│   │   │   │   └── categories.service.js
│   │   │   │
│   │   │   ├── orders/
│   │   │   │   ├── orders.routes.js
│   │   │   │   ├── orders.controller.js
│   │   │   │   └── orders.service.js
│   │   │   │
│   │   │   ├── cart/
│   │   │   │   ├── cart.routes.js
│   │   │   │   ├── cart.controller.js
│   │   │   │   └── cart.service.js
│   │   │   │
│   │   │   ├── addresses/
│   │   │   │   ├── addresses.routes.js
│   │   │   │   ├── addresses.controller.js
│   │   │   │   └── addresses.service.js
│   │   │   │
│   │   │   └── upload/
│   │   │       ├── upload.routes.js
│   │   │       └── upload.controller.js
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.utils.js         ← Générer/vérifier tokens
│   │   │   ├── email.utils.js       ← Templates emails transactionnels
│   │   │   ├── order.utils.js       ← Génération numéro de commande
│   │   │   ├── pagination.utils.js  ← Helper pagination générique
│   │   │   ├── logger.utils.js      ← Logger structuré / niveaux
│   │   │   └── validation.utils.js  ← Schémas et règles partagés
│   │   │
│   │   └── app.js                  ← Express app, middlewares globaux, routes
│   │
│   ├── server.js                   ← Point d'entrée, écoute port
│   ├── .env                        ← Variables d'environnement (non committé)
│   ├── .env.example                ← Template des variables requises
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── favicon.svg
    │
    ├── src/
    │   ├── assets/
    │   │   └── logo.svg
    │   │
    │   ├── components/
    │   │   ├── ui/                 ← Composants atomiques réutilisables
    │   │   │   ├── Button.jsx
    │   │   │   ├── Input.jsx
    │   │   │   ├── Badge.jsx
    │   │   │   ├── Modal.jsx
    │   │   │   ├── Spinner.jsx
    │   │   │   ├── Toast.jsx
    │   │   │   └── Pagination.jsx
    │   │   │
    │   │   ├── layout/
    │   │   │   ├── Navbar.jsx      ← Logo, nav, panier, compte
    │   │   │   ├── Footer.jsx
    │   │   │   ├── AdminLayout.jsx ← Sidebar admin
    │   │   │   └── ProtectedRoute.jsx
    │   │   │
    │   │   ├── product/
    │   │   │   ├── ProductCard.jsx     ← Carte catalogue
    │   │   │   ├── ProductGrid.jsx     ← Grille avec skeleton
    │   │   │   ├── ProductFilters.jsx  ← Filtres latéraux
    │   │   │   ├── SizeSelector.jsx    ← Sélection taille
    │   │   │   ├── ColorSelector.jsx   ← Sélection couleur
    │   │   │   └── ImageGallery.jsx    ← Galerie images produit
    │   │   │
    │   │   ├── cart/
    │   │   │   ├── CartDrawer.jsx      ← Panier latéral (slide-in)
    │   │   │   ├── CartItem.jsx
    │   │   │   └── CartSummary.jsx     ← Sous-total, livraison, total
    │   │   │
    │   │   ├── order/
    │   │   │   ├── OrderTimeline.jsx   ← Timeline visuelle suivi commande
    │   │   │   ├── OrderCard.jsx       ← Carte résumé commande
    │   │   │   └── OrderStatusBadge.jsx
    │   │   │
    │   │   └── checkout/
    │   │       ├── AddressForm.jsx
    │   │       └── PaymentSelector.jsx ← Choix livraison / Mobile Money
    │   │
    │   ├── pages/
    │   │   ├── public/
    │   │   │   ├── HomePage.jsx
    │   │   │   ├── CatalogPage.jsx
    │   │   │   ├── ProductPage.jsx
    │   │   │   ├── CartPage.jsx
    │   │   │   ├── CheckoutPage.jsx
    │   │   │   ├── OrderConfirmationPage.jsx
    │   │   │   ├── OrderTrackingPage.jsx   ← Accessible sans compte
    │   │   │   ├── LoginPage.jsx
    │   │   │   ├── RegisterPage.jsx
    │   │   │   └── NotFoundPage.jsx
    │   │   │
    │   │   └── account/
    │   │       ├── AccountLayout.jsx
    │   │       ├── DashboardPage.jsx
    │   │       ├── OrdersPage.jsx
    │   │       ├── OrderDetailPage.jsx
    │   │       ├── ProfilePage.jsx
    │   │       └── AddressesPage.jsx
    │   │
    │   ├── admin/
    │   │   ├── DashboardAdmin.jsx      ← Stats, ventes, commandes récentes
    │   │   ├── ProductsAdmin.jsx       ← Liste produits + CRUD
    │   │   ├── ProductFormAdmin.jsx    ← Créer / modifier produit + upload images
    │   │   ├── CategoriesAdmin.jsx
    │   │   ├── OrdersAdmin.jsx         ← Liste toutes commandes + filtres statut
    │   │   └── OrderDetailAdmin.jsx    ← Voir détail + changer statut commande
    │   │
    │   ├── store/
    │   │   ├── cartStore.js        ← Zustand : items, quantités, total
    │   │   ├── authStore.js        ← Zustand : user, token, isAuthenticated
    │   │   └── uiStore.js          ← Zustand : modals, toasts, drawer ouvert
    │   │
    │   ├── hooks/
    │   │   ├── useProducts.js      ← TanStack Query : fetch produits
    │   │   ├── useProduct.js       ← TanStack Query : fetch 1 produit
    │   │   ├── useOrders.js        ← TanStack Query : commandes client
    │   │   ├── useOrderTracking.js ← Polling statut commande
    │   │   └── useAuth.js          ← Login, register, logout
    │   │
    │   ├── api/
    │   │   ├── client.js           ← Axios instance + intercepteurs JWT
    │   │   ├── products.api.js
    │   │   ├── orders.api.js
    │   │   ├── auth.api.js
    │   │   ├── cart.api.js
    │   │   └── users.api.js
    │   │
    │   ├── utils/
    │   │   ├── formatPrice.js      ← Formatage FCFA / XOF
    │   │   ├── orderStatus.js      ← Labels et couleurs des statuts
    │   │   └── validators.js       ← Schémas Zod partagés
    │   │
    │   ├── App.jsx                 ← Router principal
    │   ├── main.jsx                ← Point d'entrée React
    │   └── index.css               ← Tailwind directives
    │
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## Schéma PostgreSQL (Prisma)

### Modèles et relations

```
User
  id, email, password, firstName, lastName, phone
  role: CUSTOMER | ADMIN
  → addresses[]
  → orders[]

Address
  id, userId, label, fullName, phone, street, city, country
  isDefault: boolean

Category
  id, name, slug, imageUrl
  → products[]

Product
  id, name, slug, description, price, comparePrice
  stock: Int
  isActive: boolean
  categoryId
  → images[]          (ProductImage)
  → variants[]        (ProductVariant)

ProductImage
  id, productId, url, publicId (Cloudinary), position, isMain

ProductVariant
  id, productId, size, color, stock
  (combinaison unique size+color par produit)

Cart
  id, userId (nullable → panier anonyme via localStorage)
  anonymousId (nullable → identifiant local pour panier invité)
  → items[]

CartItem
  id, cartId, productId, variantId, quantity

Order
  id, orderNumber (ex: CMD-2024-00042)
  userId (nullable → commande sans compte)
  guestEmail (nullable → email invité nécessaire pour le suivi public)
  guestPhone (nullable → téléphone invité)
  guestName (nullable → nom invité)
  status: PENDING | CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED
  paymentMethod: CASH_ON_DELIVERY | MOBILE_MONEY
  paymentStatus: PENDING | PARTIAL | PAID
  subtotal, shippingCost, total
  shippingAddress (JSON snapshot)
  notes
  createdAt, updatedAt
  → items[]           (OrderItem)
  → tracking[]        (OrderTracking)

OrderItem
  id, orderId, productId, variantId
  productName, variantLabel (snapshots au moment de la commande)
  price, quantity, subtotal

OrderTracking
  id, orderId
  status: PENDING | CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED
  message           ← texte personnalisé ex: "Votre colis est en route"
  location          ← optionnel ex: "Entrepôt Dakar"
  createdAt         ← horodatage précis pour la timeline
```

---

## Pages — rôle et données

### Pages publiques

| Page | Route | Rôle | Données |
|---|---|---|---|
| HomePage | `/` | Hero, nouveautés, catégories vedettes, promotions | produits featured, catégories |
| CatalogPage | `/catalogue` | Liste produits, filtres, recherche, tri, pagination | produits (filtres: categorie, taille, couleur, prix) |
| ProductPage | `/produits/:slug` | Détail produit, galerie images, choix taille/couleur, stock, ajout panier | 1 produit + variants |
| CartPage | `/panier` | Récapitulatif panier, modifier quantités, supprimer, total | cartStore (local) |
| CheckoutPage | `/commande` | Adresse livraison, choix paiement, récap final | cartStore + user addresses |
| OrderConfirmationPage | `/commande/confirmation/:orderNumber` | Résumé commande passée, numéro, instructions paiement Mobile Money si applicable | 1 order |
| OrderTrackingPage | `/suivi/:orderNumber` | Timeline visuelle du statut, étapes horodatées, infos livraison — **sans connexion requise** | order + tracking events |
| LoginPage | `/connexion` | Formulaire connexion | — |
| RegisterPage | `/inscription` | Formulaire inscription | — |

### Espace client (connecté)

| Page | Route | Rôle |
|---|---|---|
| DashboardPage | `/compte` | Résumé : dernière commande, infos profil |
| OrdersPage | `/compte/commandes` | Historique toutes commandes avec statuts |
| OrderDetailPage | `/compte/commandes/:id` | Détail + timeline suivi |
| ProfilePage | `/compte/profil` | Modifier nom, email, téléphone, mot de passe |
| AddressesPage | `/compte/adresses` | Gérer adresses de livraison |

### Admin (rôle ADMIN requis)

| Page | Route | Rôle |
|---|---|---|
| DashboardAdmin | `/admin` | KPIs : CA, nb commandes, produits en rupture |
| ProductsAdmin | `/admin/produits` | Table produits, recherche, activer/désactiver |
| ProductFormAdmin | `/admin/produits/nouveau` & `/:id/modifier` | CRUD produit, upload multi-images Cloudinary, gestion variants |
| CategoriesAdmin | `/admin/categories` | CRUD catégories |
| OrdersAdmin | `/admin/commandes` | Toutes commandes, filtres par statut/date, export |
| OrderDetailAdmin | `/admin/commandes/:id` | Voir détail, **changer statut** (déclenche email + nouveau tracking event) |

---

## API REST — endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Produits
```
GET    /api/products              ← ?page, limit, category, size, color, minPrice, maxPrice, sort, search
GET    /api/products/:slug
POST   /api/products              [ADMIN]
PUT    /api/products/:id          [ADMIN]
DELETE /api/products/:id          [ADMIN]
```

### Catégories
```
GET    /api/categories
POST   /api/categories            [ADMIN]
PUT    /api/categories/:id        [ADMIN]
DELETE /api/categories/:id        [ADMIN]
```

### Panier
```
GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/:itemId
DELETE /api/cart/items/:itemId
DELETE /api/cart
```

### Commandes
```
POST   /api/orders                ← Créer commande depuis panier
GET    /api/orders                [AUTH] ← commandes du client connecté
GET    /api/orders/:orderNumber   ← public (suivi sans compte)
PUT    /api/orders/:id/status     [ADMIN] ← change statut + crée tracking event
GET    /api/orders/admin/all      [ADMIN] ← toutes commandes + filtres
```

### Adresses
```
GET    /api/addresses             [AUTH]
POST   /api/addresses             [AUTH]
PUT    /api/addresses/:id         [AUTH]
DELETE /api/addresses/:id         [AUTH]
```

### Upload
```
POST   /api/upload/image          [ADMIN] ← upload vers Cloudinary, retourne url + publicId
DELETE /api/upload/image/:publicId [ADMIN]
```

## Checkout avec ou sans compte
- Le checkout se fait sur une même page `/commande`.
- Les clients connectés disposent d’adresses sauvegardées, d’un historique de commandes et d’une expérience de commande plus rapide.
- Les clients invités peuvent commander sans compte en fournissant un email, un téléphone et une adresse de livraison.
- La commande invitée crée un `Order` avec `userId=null` et des champs `guestEmail`, `guestPhone`, `guestName`.
- L’accès au suivi invité se fait via `/suivi/:orderNumber` avec un lien envoyé par email.
- Après paiement/confirmation, un message propose à l’invité de créer un compte pour retrouver ses futures commandes.

### Différences invité vs compte
- Avec compte
  - historique de commandes dans `/compte/commandes`
  - sauvegarde et réutilisation des adresses
  - suivi des commandes lié à l’utilisateur
  - possibilité de modifier profil et mot de passe
  - panier synchronisé entre sessions une fois connecté
- Sans compte
  - commande traitée comme invitée
  - aucune page d’historique personnelle
  - suivi possible uniquement via le numéro de commande public et l’email invité
  - panier stocké localement et éventuellement fusionné si le client se connecte avant commande
  - informations non sauvegardées dans un espace client

### Contraintes techniques à prévoir
- Le panier invité est conservé dans `localStorage` et possède un `anonymousId` côté backend pour la synchronisation si nécessaire.
- Si un visiteur invité se connecte avant la validation, le panier local doit être fusionné avec le panier du compte existant.
- L’endpoint `POST /api/orders` doit fonctionner en mode authentifié ou non authentifié.
- L’endpoint `GET /api/orders` reste réservé aux clients authentifiés.
- Les emails de confirmation sont envoyés dans les deux cas, mais le message invité précise que le suivi est public.

---

## Backend optimisation, sécurité et qualité

### Pagination
- Les endpoints de liste doivent accepter `page`, `limit` et/ou `cursor`.
- Renvoi des métadonnées : `total`, `page`, `pageSize`, `totalPages`.
- Utiliser `skip`/`take` ou curseur Prisma pour les collections volumineuses.
- S’applique à : produits, commandes admin, catégories, etc.

### Rate limiting
- Protéger les routes sensibles avec `express-rate-limit`.
- Limiter les tentatives sur : `/api/auth/login`, `/api/auth/register`, `/api/orders`, `/api/upload/image`.
- Appliquer des règles différentes selon le type d’endpoint (auth, public, admin).

### Validation stricte
- Valider toutes les entrées côté backend avec `express-validator` ou des schémas Zod.
- Refuser les requêtes qui ne respectent pas les formats attendus.
- Vérifier les types de fichiers, les tailles et les champs obligatoires.

### Logs et erreurs
- Logger les requêtes entrantes, les codes de réponse et les erreurs serveur.
- Utiliser `morgan` ou `pino`/`winston` pour avoir des logs structurés.
- Centraliser la gestion des erreurs via un middleware global.
- Remonter les erreurs métiers et les erreurs Prisma de manière lisible.

### Monitoring et santé
- Ajouter un endpoint `GET /api/health` ou `GET /api/status`.
- Prévoir des métriques basiques : uptime, nombre de requêtes, erreurs.
- Planifier l’ajout d’un APM ou d’un outil de monitoring en production.

### Caching et performances
- Cacher les réponses publiques peu volatiles (produits, catégories).
- Utiliser un cache mémoire / Redis si nécessaire.
- Limiter `include`/`select` dans Prisma pour ne récupérer que les champs utiles.

### Tests
- Prévoir des tests unitaires pour les services et utilities.
- Prévoir des tests d’intégration pour les routes critiques : auth, commandes, checkout.
- Ajouter un dossier `tests/` ou `__tests__/` selon la convention choisie.

---

## Variables d'environnement (.env)

```env
# Serveur
PORT=5000
NODE_ENV=development

# PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/boutique_mode"

# JWT
JWT_SECRET=ton_secret_tres_long_et_aleatoire
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ton.email@gmail.com
SMTP_PASS=ton_app_password_gmail

# Frontend URL (pour les liens dans les emails)
CLIENT_URL=http://localhost:5173

# Mobile Money (infos affichées au client, pas d'API)
MOMO_NUMBER=+221XXXXXXXXX
MOMO_NAME=Nom Boutique
MOMO_THRESHOLD=10000   ← montant à partir duquel on propose Mobile Money
```

---

## Logique paiement

```
total commande < MOMO_THRESHOLD  →  Paiement à la livraison uniquement
total commande ≥ MOMO_THRESHOLD  →  Les deux options proposées

Si Mobile Money choisi :
  - Page confirmation affiche : numéro, nom, montant à envoyer
  - Client envoie la moitié via Mobile Money avant livraison
  - Admin confirme réception → statut paymentStatus = PARTIAL
  - Reste payé à la livraison → statut = PAID
```

---

## Suivi de commande — statuts et timeline

```
PENDING      → Commande reçue, en attente de confirmation
CONFIRMED    → Commande confirmée par l'admin
PROCESSING   → En cours de préparation
SHIPPED      → Expédiée / en route
DELIVERED    → Livrée
CANCELLED    → Annulée
```

Chaque changement de statut par l'admin :
1. Crée un enregistrement `OrderTracking` avec message + horodatage
2. Envoie un email automatique au client
3. La page `/suivi/:orderNumber` affiche la timeline en temps réel

---

## Commandes d'initialisation

### 1. Créer la structure

```bash
mkdir boutique-mode && cd boutique-mode
mkdir backend frontend
```

### 2. Backend

```bash
cd backend
npm init -y
npm install express prisma @prisma/client dotenv bcryptjs jsonwebtoken \
  cors helmet morgan multer cloudinary multer-storage-cloudinary \
  nodemailer express-validator
npm install -D nodemon

npx prisma init
# → crée prisma/schema.prisma et .env avec DATABASE_URL
```

Modifier `package.json` scripts :
```json
"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js",
  "db:migrate": "prisma migrate dev",
  "db:generate": "prisma generate",
  "db:studio": "prisma studio",
  "db:seed": "node prisma/seed.js"
}
```

### 3. Frontend

```bash
cd ../frontend
npm create vite@latest . -- --template react
npm install
npm install react-router-dom zustand @tanstack/react-query axios \
  react-hook-form zod @hookform/resolvers lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 4. PostgreSQL — créer la base

```bash
psql -U postgres
CREATE DATABASE boutique_mode;
\q
```

### 5. Initialiser Prisma

```bash
cd backend
# Renseigner DATABASE_URL dans .env, puis :
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Lancer le projet

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

---

## Ordre de développement recommandé

```
1. Schema Prisma + migration PostgreSQL
2. Config Cloudinary + upload middleware
3. Auth (register, login, JWT middleware)
4. CRUD Produits + Categories (backend)
5. Upload images produits (Cloudinary)
6. Panier (logique backend + store Zustand frontend)
7. Checkout + création commande
8. Système de suivi (OrderTracking + timeline)
9. Emails transactionnels (Nodemailer)
10. Interface Admin
11. Espace client (compte, historique)
12. Page d'accueil + polissage UI
```
