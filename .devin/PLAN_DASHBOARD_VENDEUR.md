# Plan fonctionnel — Dashboard vendeur UrbanBeauty

*Volet fournisseur mis de côté pour l'instant. Ce document se concentre uniquement sur le rôle vendeur.*

---

## 1. Objectif général

Donner à chaque vendeur un espace autonome où il peut gérer ses produits, suivre ses commandes, échanger avec ses clients et suivre ses revenus — sans jamais accéder aux données des autres vendeurs. L'admin garde un contrôle global : validation, blocage, gestion des litiges.

---

## 2. Devenir vendeur

Avant même de parler du dashboard, il faut un point d'entrée clair.

- **Candidature** : la personne remplit un formulaire (nom de la boutique, description, contact, éventuellement un document d'identité ou registre de commerce selon le niveau de sérieux voulu)
- **Statut du compte pendant l'examen** : `EN_ATTENTE` — la personne ne peut pas encore accéder au dashboard
- **Décision admin** : approuvé → le compte passe vendeur actif ; refusé → notification avec raison
- Ce processus évite les faux comptes vendeurs créés à la volée et donne à l'admin un premier niveau de filtrage avant même de parler de produits

---

## 3. Statut du compte vendeur (pas seulement des produits)

C'était un point manquant dans la première version : il faut un statut sur le **vendeur lui-même**, distinct du statut de chaque produit.

- `ACTIF` — fonctionnement normal
- `SUSPENDU` — temporaire, décidé par l'admin (ex : litige en cours, comportement suspect)
- `BLOQUÉ` — définitif ou de longue durée

**Effet en cascade** : dès qu'un vendeur passe en suspendu ou bloqué, **tous ses produits publiés disparaissent automatiquement du site**, sans que l'admin ait à les rejeter un par un. Son dashboard devient accessible en lecture seule (il peut voir ses commandes en cours pour les honorer, mais ne peut plus rien publier de nouveau).

Un historique des raisons de blocage/suspension est conservé, consultable par l'admin, pour la traçabilité en cas de contestation.

---

## 4. Gestion des produits (le cœur du dashboard)

**Ajout d'un produit**
- Nom, description, prix, catégorie, stock
- Upload de plusieurs images, réorganisables, avec une image principale
- Gestion de variantes (couleur, taille, contenance, etc.)

**Cycle de vie d'un produit**
1. **Brouillon** — le vendeur travaille dessus, rien n'est visible
2. **Soumis / en attente** — envoyé pour validation admin
3. **Publié** — visible sur le site général
4. **Rejeté** — avec raison explicite communiquée au vendeur, qui peut corriger et resoumettre
5. **Rupture de stock** — bascule **automatique** dès que le stock atteint 0, et retour automatique en publié dès que le stock est réapprovisionné (pas besoin de repasser par une validation admin pour ça)

**Vue vendeur**
- Liste de tous ses produits avec filtre par statut
- Aperçu "vue client" pour voir à quoi ressemblera la fiche produit avant publication
- Historique des modifications (utile en cas de litige ou de question de l'admin)

---

## 5. Visibilité sur le site général

C'était ta demande de départ, donc je la mets en avant plutôt qu'en "bonus futur" :

- Chaque produit publié apparaît dans le catalogue général, mélangé aux autres vendeurs
- Chaque fiche produit affiche clairement "Vendu par [Nom boutique]"
- **Page boutique publique** dédiée à chaque vendeur : logo, description, tous ses produits regroupés, note moyenne de la boutique (en plus de la note par produit), éventuellement délai de livraison habituel
- Cette page boutique est ce qui donne une vraie identité au vendeur sur la plateforme, plutôt que d'être noyé dans le catalogue

---

## 6. Commandes

- Liste des commandes contenant les produits du vendeur, avec statut (en attente, confirmée, expédiée, livrée, annulée)
- **Confidentialité** : le vendeur voit ce qu'il faut pour traiter la commande (nom, ville, adresse de livraison) mais pas nécessairement l'email et le téléphone bruts du client — l'échange direct passe plutôt par une messagerie interne pour éviter la revente de contacts ou le contournement de la plateforme
- Gestion des retours et remboursements, avec un vrai statut de suivi

---

## 7. Avis clients

- Liste des avis par produit + note moyenne globale de la boutique
- **Le vendeur peut répondre publiquement à un avis** (pas seulement le consulter) — c'est important commercialement, un client qui voit une réponse a plus confiance
- Possibilité de signaler un avis abusif à l'admin pour modération

---

## 8. Statistiques

- Vues par produit, taux de conversion
- Ventes par période (jour / semaine / mois), meilleurs produits
- Chiffre d'affaires généré

---

## 9. Volet financier (absent du premier plan, à ne pas négliger)

C'est le point le plus sensible d'une marketplace et il ne peut pas être improvisé après coup.

- **Portefeuille vendeur** : solde disponible, solde en attente (commandes pas encore confirmées livrées), historique des versements
- **Commission plateforme** : clairement affichée — "Prix de vente – commission = ce que vous touchez"
- **Cycle de paiement** : à définir (après livraison confirmée ? versement hebdomadaire/mensuel ?)
- **Demande de retrait** : le vendeur initie un retrait vers son compte bancaire/mobile money

Même une version simple (juste un tableau de bord "argent gagné / en attente / versé") vaut mieux que rien au lancement.

---

## 10. Messagerie et notifications

- Messagerie directe vendeur ↔ client (évite l'échange de coordonnées personnelles)
- Notifications : nouvelle commande, produit approuvé/rejeté, nouvel avis, alerte stock bas, changement de statut du compte

---

## 11. Gestion des litiges

Un point absent du premier plan : que se passe-t-il si un client n'a pas reçu son colis, ou reçoit un produit endommagé ?

- Le client (ou le vendeur) peut ouvrir un litige lié à une commande
- Statut du litige : ouvert / en cours d'examen / résolu
- L'admin arbitre et peut décider d'un remboursement, d'un avertissement au vendeur, etc.

Sans ce flux, ces situations se règlent en dehors de la plateforme — ce qui est mauvais pour la confiance et pour la donnée.

---

## 12. Paramètres boutique

- Logo, nom, description, coordonnées
- Informations bancaires / mobile money pour les paiements
- Documents de vérification (si KYC choisi)

---

## Résumé — Ce qui change par rapport au premier plan

| Ajouté / renforcé | Pourquoi |
|---|---|
| Statut du compte vendeur (pas que produit) + blocage en cascade | C'était ta demande initiale, elle manquait |
| Processus de candidature vendeur | Évite les faux comptes, filtre en amont |
| Page boutique publique | Remontée en priorité, pas en "futur" |
| Portefeuille / paiement vendeur | Absent du premier plan, pourtant central |
| Confidentialité des données client | Le premier plan exposait email/tel bruts |
| Réponse aux avis | Le premier plan permettait seulement de "voir" |
| Transition automatique stock ↔ rupture | Évite un travail manuel inutile pour le vendeur |
| Gestion des litiges | Aucun flux structuré n'existait |

---

## Prochaine étape possible

Une fois ce concept validé, on peut soit :
1. Prioriser ce qui va dans une v1 (MVP) vs ce qui peut attendre une v2
2. Repartir sur la traduction technique de ces ajouts (schéma de données, endpoints, etc.)