# UrbanBeauty ? Documentation Fonctionnelle

> Version: 2026-02-06

## 1) R?sum? produit
UrbanBeauty est une plateforme PWA mobile?first qui combine une marketplace de produits beaut? et une place de march? de services (coiffure, manucure, etc.).

Objectif: offrir une exp?rience unifi?e pour l?achat de produits, la prise de rendez?vous et la gestion des prestataires, avec back?office complet pour l?administration.

## 2) Parcours utilisateurs

### CLIENT
- S?inscrire / se connecter
- Consulter services et produits
- Ajouter au panier, commander
- R?server un service
- Laisser un avis
- G?rer profil et adresses de livraison

### COIFFEUSE / MANICURISTE
- G?rer services (CRUD)
- G?rer r?servations, cr?neaux
- Consulter analytics
- G?rer profil / portfolio

### VENDEUSE
- G?rer produits (CRUD)
- Traiter commandes
- Suivre analytics ventes

### ADMIN
- G?rer utilisateurs, cat?gories, produits, services
- Param?trer la plateforme
- Acc?der aux analytics globaux

## 3) R?les & autorisations
R?les: `CLIENT`, `COIFFEUSE`, `MANICURISTE`, `VENDEUSE`, `ADMIN`.

- Dashboards d?di?s par r?le.
- Le r?le est stock? dans `public.users` et/ou `auth.users`.
- Changement de r?le via dashboard admin ou DB.

## 4) Fonctionnalit?s cl?s
- Marketplace produits
- Services & r?servations
- Avis & notes
- Notifications
- Chat
- Coupons
- Analytics

## 5) Roadmap synth?tique
- Paiements complets (Stripe/Paystack/MTN)
- Optimisation offline & cache API
- UX mobile avanc?e
- Analytics avanc?s
