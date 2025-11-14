# 📋 Plan d'Implémentation Complète - UrbanBeauty

## 🎯 Objectifs

1. ✅ Système de panier fonctionnel
2. ✅ Choix inscription/commande guest avec formulaire livraison
3. ✅ Système de coupons/réductions
4. ✅ Dashboards complets pour tous les rôles
5. ✅ Toutes les fonctionnalités de A à Z

---

## 📦 Étape 1 : Panier (EN COURS)

### Frontend
- ✅ Store Zustand pour panier (`frontend/src/store/cart.store.ts`)
- ⏳ Intégration dans ProductCard et ProductDetailPage
- ⏳ Page panier complète avec choix inscription/guest
- ⏳ Formulaire livraison pour guests

### Backend
- ⏳ Module Orders (création, statuts)
- ⏳ Support commandes guest (userId nullable)

---

## 🎫 Étape 2 : Coupons

### Backend
- ⏳ Modèle Coupon dans Prisma ✅
- ⏳ Module Coupons (CRUD, validation)
- ⏳ Service validation coupons
- ⏳ Application réduction dans Orders

### Frontend
- ⏳ Champ code coupon dans panier
- ⏳ Application réduction
- ⏳ Affichage réduction dans résumé

---

## 📊 Étape 3 : Dashboards

### CLIENT
- ⏳ Dashboard principal
- ⏳ Mes commandes (liste, détails, suivi)
- ⏳ Mes réservations (liste, détails, annulation)
- ⏳ Mon profil (édition)
- ⏳ Historique des achats

### COIFFEUSE
- ⏳ Dashboard principal
- ⏳ Mes services (CRUD)
- ⏳ Mes réservations (calendrier, confirmation, annulation)
- ⏳ Statistiques (revenus, nombre de clients)
- ⏳ Mon profil/portfolio

### VENDEUSE
- ⏳ Dashboard principal
- ⏳ Mes produits (CRUD)
- ⏳ Mes commandes (liste, traitement)
- ⏳ Statistiques (ventes, revenus)
- ⏳ Gestion stock

### ADMIN
- ✅ Dashboard principal
- ✅ Gestion produits
- ✅ Gestion services
- ✅ Gestion catégories
- ✅ Gestion utilisateurs
- ⏳ Gestion commandes
- ⏳ Gestion réservations
- ⏳ Gestion coupons
- ⏳ Analytics complets

---

## 🚀 Priorités d'Implémentation

1. **URGENT** : Panier fonctionnel + ajout au panier
2. **URGENT** : Page panier avec choix inscription/guest
3. **URGENT** : Backend Orders + création commande
4. **IMPORTANT** : Backend Coupons + application
5. **IMPORTANT** : Dashboards CLIENT complet
6. **IMPORTANT** : Dashboards COIFFEUSE/VENDEUSE
7. **NORMAL** : Fonctionnalités avancées

---

## 📝 Notes

- Les commandes guest nécessitent userId nullable dans Order
- Les coupons doivent être validés avant application
- Tous les dashboards doivent être protégés par rôle
- Le panier doit persister dans localStorage

