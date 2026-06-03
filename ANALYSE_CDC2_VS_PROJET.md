# Analyse comparative — Cahier des charges v2 vs projet UrbanBeauty

**Date :** 3 juin 2026  
**Sources :** `cahierDeCharge2`, code actuel (`backend/`, `frontend/`, `prisma/schema.prisma`)

---

## 1. Résumé exécutif

Le **cahier des charges v2** décrit une **plateforme de gestion multi-boutiques** (2 à 5 points de vente, stock central, cloisonnement des données, facturation légale, chaîne métier atomique). Le **projet actuel** est une **boutique e-commerce mono-entité** (catalogue, panier, commandes en ligne, back-office admin) avec une couche comptabilité/stock **partiellement branchée**.

| Dimension | Cahier v2 | Projet actuel | Écart |
|-----------|-----------|---------------|-------|
| Modèle métier | ERP multi-boutiques | E-commerce + admin | **Majeur** |
| Rôles | 6+ profils + rattachement boutique | `CUSTOMER` \| `ADMIN` | **Majeur** |
| Factures | Module dédié, numérotation légale | Absent | **Bloquant** (CDC) |
| Stock | Central + réservations + transferts | Stock produit/variante, pas de réservation | **Bloquant** (multi-boutiques) |
| Cohérence commande | Transaction atomique multi-modules | Mises à jour séparées, sans `$transaction` | **Bloquant** |
| Livraisons / livreurs | Module dédié | Suivi statut commande uniquement | **Important** |
| Notifications | WhatsApp/SMS automatiques | Email (souvent désactivé) + WhatsApp manuel au checkout | **Partiel** |

**Conclusion :** le socle e-commerce est **réutilisable** ; la v2 impose une **refonte architecturale** (multi-boutiques + facturation + orchestration métier) avant d’enrichir les modules avancés.

---

## 2. Ce qui existe déjà et est aligné (à consolider)

| Exigence CDC2 | État projet | Action recommandée |
|---------------|-------------|-------------------|
| Catalogue produits (nom, prix, catégories, images) | `Product`, `Category`, `ProductImage`, Cloudinary | Vérifier champs financiers (prix d’achat, marge auto) |
| Commandes + cycle de statuts | `Order`, `OrderStatus`, `OrderTracking` | Aligner libellés CDC (Brouillon → Clôturée) si besoin métier |
| Commande invité | `guestEmail`, `guestPhone`, `guestName` | OK |
| Paiement COD / Mobile Money | `PaymentMethod`, `PaymentStatus`, `Payment` | OK pour la boutique en ligne |
| Coupons / remises | `Coupon`, appliqué au checkout | Enrichir selon section 25 (par boutique) plus tard |
| Panier + checkout | `Cart`, `CartItem`, pages cart/checkout | OK |
| Admin commandes + pagination | `orders.admin.controller`, `parsePagination` sur une route | Étendre filtres (client, date, statut…) |
| Mouvements de stock (modèle) | `StockMovement`, `Supplier`, UI `AdminAccounting` | **Automatiser** à la validation paiement/commande |
| Fournisseurs (fiches) | `Supplier` + saisie manuelle entrées stock | Compléter bons de commande fournisseur (section 23) plus tard |
| Dépenses | `Expense` + catégories | OK base compta |
| Tableau de bord admin | `Dashboard.jsx` (CA, commandes, stock bas) | Ajouter filtre boutique quand multi-boutiques exist |
| Paramètres (dont WhatsApp) | `Setting`, `whatsapp_number` | OK pour lien manuel |
| Sécurité de base | JWT, Helmet, rate limit, CORS | Compléter expiration session, 2FA (priorité 5) |
| `pdfkit` dans les dépendances | Installé, **non utilisé** dans le code | Base pour factures PDF |

---

## 3. Points critiques (bloquants selon le CDC2)

Ces éléments sont marqués **[🚨 BLOQUANT]** dans le cahier. Sans eux, la plateforme v2 **ne peut pas être exploitée** en multi-boutiques ou en conformité comptable.

### 3.1 Architecture multi-boutiques (section 0) — **absent**

**CDC2 :** modèle `Boutique`, utilisateurs rattachés, permissions, commandes/factures/rapports par boutique, stock central partagé, transferts inter-boutiques.

**Projet :** aucun modèle `Store` / `shopId` ; une seule entité implicite.

**Impact :** toute la v2 repose sur ce socle (filtres, KPI, exports, taxes par boutique).

**Faisabilité :** faisable, mais c’est la **plus grosse migration** (schéma Prisma + middleware `shopId` sur toutes les requêtes + seed boutiques).

---

### 3.2 Cloisonnement et rôles (sections 0.5, 15) — **insuffisant**

**CDC2 :** Administrateur global, gestionnaire par boutique, comptable, commercial, magasinier, livreur ; accès strict par boutique.

**Projet :** enum `Role { CUSTOMER, ADMIN }` ; middleware `isAdmin` uniquement.

```355:358:backend/prisma/schema.prisma
enum Role {
  CUSTOMER
  ADMIN
}
```

**Impact :** faille de confidentialité dès qu’il y a plusieurs équipes ou boutiques.

**Faisabilité :** après modèle `Boutique`, ajouter `UserStore` (many-to-many) + guards `requireShopAccess(shopId)`.

---

### 3.3 Chaîne atomique commande → stock → facture → compta (sections 2, 8, 19) — **incomplète / incohérente**

**CDC2 :** une validation = tout ou rien (`prisma.$transaction`).

**Projet actuel :**

| Étape | Attendu CDC2 | Réel |
|-------|--------------|------|
| Création commande | Réservation stock | Vérification stock seulement, **pas de réservation** |
| Validation | Décrément + mouvement `OUT_SALE` + facture + écriture compta | Décrément stock **uniquement** quand `paymentStatus` passe à `PAID` (`orders.admin.controller`) |
| Mouvement stock vente | Automatique lié à `orderId` | `StockMovement` créé **manuellement** depuis la compta, pas à la vente |
| Facture | Génération auto | **Aucun modèle `Invoice`** |
| Transaction DB | Atomique | Opérations **séquentielles sans** `$transaction` |

```64:68:backend/src/modules/orders/orders.admin.controller.js
    if (!wasPaid && willBePaid) {
      await decrementStock(existingOrder.items);
    } else if (wasPaid && willBeRejected) {
      await incrementStock(existingOrder.items);
    }
```

`changeOrderStatus` ne touche **pas** au stock (sauf annulation si déjà payé, logique limitée).

**Impact :** ventes fantômes possibles ; compta COGS basée sur `OUT_SALE` **fausse** si les mouvements ne sont pas créés à la vente ; pas de facture légale.

**Faisabilité :** **priorité 1** sur l’existant mono-boutique : une fonction `confirmOrderPayment(orderId)` en `$transaction` (stock + mouvement + facture + snapshot compta).

---

### 3.4 Réservation / concurrence stock (sections 0.2, 6) — **absent**

**CDC2 :** réservation à la création de commande ; stock affiché = central − réservations.

**Projet :** `product.stock` et `variant.stock` ; deux ventes simultanées peuvent passer le contrôle au `createOrder` puis échouer ou créer du négatif à la validation.

**Faisabilité :** colonnes `reservedQty` sur produit/variante **ou** table `StockReservation` ; verrou pessimiste / `UPDATE ... WHERE stock >= qty` dans la transaction.

---

### 3.5 Module factures (section 3) — **absent**

**CDC2 :** génération auto, numérotation `FA-2026-0001` (éventuellement par boutique), PDF, lien commande/client, pas de doublons.

**Projet :** pas de table `Invoice` ; `pdfkit` non branché.

**Impact :** blocage légal et comptable pour remise client.

**Faisabilité :** **priorité 1** après stabilisation du flux commande ; `pdfkit` déjà présent.

---

### 3.6 Journal d’audit (section 14) — **absent**

**CDC2 :** registre immuable (qui, quand, ancienne/nouvelle valeur, IP, boutique).

**Projet :** logs Winston requêtes seulement, pas d’audit métier.

**Faisabilité :** table `AuditLog` + middleware/hooks sur mutations sensibles — effort modéré, **fort ROI**.

---

### 3.7 Numérotation et intégrité factures / avoirs (sections 3, 21) — **N/A**

Sans module facture/avoir, règle CDC2 non applicable.

---

## 4. Écarts importants (non bloquants immédiatement en mono-boutique)

| Module CDC2 | Projet | Priorité suggérée |
|-------------|--------|-------------------|
| Livraisons avancées + livreurs (§10) | `OrderTracking` + statuts | P3 |
| Retours et avoirs (§21) | Annulation partielle stock si payé | P2 |
| Paiements / encaissements (§24) | `Payment` basique, pas de rapprochement facture | P2 |
| Documents & exports centralisés (§4) | Pas d’espace dédié ; pas d’export Excel factures | P3 |
| Recherche globale (§12) | Recherche produits shop seulement | P3 |
| Import produits intelligent (§9) | Absent | P4 |
| Alertes intelligentes (§16) | Alerte stock bas dashboard + `lowStockAlert` | P2–P3 |
| KPI multi-boutiques (§17) | Dashboard mono-entité, graphiques partiellement factices | P3 |
| Taxes par boutique (§5) | Absent | P2 avec multi-boutiques |
| Sauvegardes / restauration (§13) | Infra, pas dans l’app | P5 (ops) |
| 2FA, messages erreur métier (§19) | Messages API basiques | P5 |
| Intégrations WhatsApp API, SMS, pg-boss (CDC1 / §18) | Lien `wa.me` manuel | P4 |

---

## 5. Matrice de conformité par section CDC2

| § | Thème | Statut | Commentaire |
|---|--------|--------|-------------|
| 0 | Multi-boutiques | ❌ | Fondation manquante |
| 1 | Tableau de bord | 🔧 | Existe, sans filtre boutique ni drill-down période |
| 2 | Commandes | 🔧 | CRUD + statuts ; pas atomique, pas boutique, pas historique statut détaillé |
| 3 | Factures | ❌ | À créer |
| 4 | Documents / exports | ❌ | |
| 5 | Comptabilité | 🔧 | Dashboard + mouvements manuels ; pas alimentée auto par chaque vente |
| 6 | Stocks | 🔧 | Stock produit OK ; pas réservation/transfert |
| 7 | Produits | ✅/🔧 | CRUD OK ; KPI produit limités |
| 8 | Cohérence globale | ❌ | Orchestrateur métier absent |
| 9 | Import produits | ❌ | |
| 10 | Livraisons | ❌ | |
| 11 | Notifications | 🔧 | In-app + WhatsApp manuel |
| 12 | Recherche / filtres | 🔧 | Filtres admin limités |
| 13 | Pagination / backup | 🔧/❌ | Pagination partielle |
| 14 | Audit | ❌ | |
| 15 | Rôles | 🔧 | Binaire ADMIN/CUSTOMER |
| 16 | Alertes | 🔧 | Stock bas seulement |
| 17 | KPI | 🔧 | |
| 18 | Intégrations | ❌ | |
| 19 | Sécurité / fiabilité | 🔧 | |
| 20 | Architecture métier | ❌ | |
| 21 | Retours / avoirs | ❌ | |
| 22 | Clients | 🔧 | Users + commandes ; pas fiche CRM enrichie |
| 23 | Fournisseurs / achats | 🔧 | Fiche fournisseur, pas bon de commande |
| 24 | Paiements | 🔧 | |
| 25 | Promotions | 🔧 | Coupons existants |
| 26 | Performance | 🔧 | Pagination admin ; pas de cache/archivage |

Légende : ✅ conforme · 🔧 partiel · ❌ absent

---

## 6. Approche recommandée (faisable, par phases)

Ordre aligné sur la **synthèse des priorités** du cahier (§ fin document) et sur l’état réel du repo.

### Phase 0 — Fondations multi-boutiques (3–4 semaines)

**Objectif :** rendre le CDC2 tenable sans tout réécrire.

1. Modèles Prisma : `Store` (code, nom, adresse, taxRate, isMain), `UserStore`, `storeId` sur `Order`, `StockMovement`, `Expense`, futur `Invoice`.
2. Middleware : injection `req.storeIds` selon rôle ; admin global = toutes les boutiques ; gestionnaire = ses boutiques.
3. Boutique principale (`isMain`) : peut créer/voir consolidé (comme demandé dans le CDC).
4. Filtre `?storeId=` sur API admin + UI (select en haut du dashboard).

**Ne pas démarrer** les transferts inter-boutiques avant que le cloisonnement soit testé (tests d’accès cross-boutique).

---

### Phase 1 — Fiabiliser l’existant mono-entité (1–2 semaines)

Avant ou en parallèle léger de la phase 0 si vous restez une seule boutique temporairement :

1. **`confirmPayment` atomique** (`prisma.$transaction`) :
   - `decrementStock` (avec lock),
   - `stockMovement.create` type `OUT_SALE` + `orderId` + `unitCost` depuis `purchasePrice`,
   - création `Invoice` + numéro séquentiel (table `InvoiceSequence`),
   - mise à jour `paymentStatus` / `status`.
2. **Réservation** : à `createOrder`, incrémenter `reservedQty` ou créer réservation ; libérer si annulation/timeout.
3. **Historique statuts commande** : table `OrderStatusHistory` (userId, motif, timestamp).
4. **Messages d’erreur** : mapper erreurs Prisma → français métier (§19).

---

### Phase 2 — Facturation et compta cohérente (1–2 semaines)

1. Module `invoices` (API + PDF via `pdfkit`).
2. Contenu obligatoire CDC (entreprise depuis `Setting`, client, lignes, taxes, réf. commande).
3. Lien facture ↔ commande ↔ client (navigation UI).
4. Export PDF ; Excel en P3.

---

### Phase 3 — Multi-boutiques opérationnel (2–3 semaines)

1. Stock central (déjà un seul `Product.stock` = compatible) + réservations cross-boutiques.
2. Transferts : `StockTransfer` (pending → validated) + bon PDF.
3. Taxes par boutique dans settings/admin.
4. Rapports par boutique + consolidé admin.

---

### Phase 4 — Modules métier (selon besoin business)

1. Journal d’audit (§14).  
2. Retours / avoirs (§21).  
3. Livreurs + espace livreur simplifié (§10).  
4. Paiements partiels / impayés liés aux factures (§24).  
5. Exports centralisés (§4).  

---

### Phase 5 — Intégrations et polish

WhatsApp Business API, SMS (Africa's Talking / Twilio), import Excel, 2FA, sauvegardes DB, cache listes, archivage commandes anciennes.

---

## 7. Décisions à trancher avec le métier (avant de coder)

Le CDC2 et l’ancien `Cahier De Charge` supposent des choix non codés dans le repo :

1. **Maître du stock** : uniquement le back-office ou aussi synchronisation WooCommerce/autre ?  
2. **Quelle boutique** reçoit les commandes du site web (boutique principale par défaut ?).  
3. **Vente à stock 0** : backorder ou blocage ?  
4. **Déclencheur stock** : à la commande, au paiement validé, ou à l’expédition ? (aujourd’hui : **paiement PAID**).  
5. **Facture** : à la commande confirmée ou au paiement ? (CDC2 : validation commande — à harmoniser avec COD).  
6. **Périmètre livreur** : interface mobile dédiée ou admin seulement pour la v1 ?

---

## 8. Risques techniques identifiés dans le code actuel

| Risque | Détail |
|--------|--------|
| Double stock produit + variante | `decrementStock` décrémente variante **et** produit → risque de double comptage si les deux stocks ne sont pas synchronisés métier |
| COGS compta | Dashboard utilise `OUT_SALE` agrégé alors que les ventes ne créent pas ces mouvements |
| Annulation stock | `changeOrderStatus` CANCELLED ne restaure le stock que si `paymentStatus === 'PAID'` |
| Dashboard | URL API en dur `localhost:5000` dans `Dashboard.jsx` |
| Email | Envoi SMTP best-effort, erreurs ignorées |
| Pas de module factures | Impossible de satisfaire §3 et §24 du CDC2 |

---

## 9. Synthèse : critique vs faisable

### Critique (à traiter en premier)

1. Modèle **multi-boutiques** + permissions.  
2. **Transactions atomiques** et orchestration vente.  
3. **Factures** légales + numérotation.  
4. **Réservations stock** + mouvements auto liés aux commandes.  
5. **Journal d’audit** pour actions sensibles.

### Faisable rapidement sur l’existant (quick wins)

- `$transaction` sur validation paiement.  
- Création auto `StockMovement` `OUT_SALE`.  
- `OrderStatusHistory`.  
- Utiliser `pdfkit` pour PDF facture.  
- Filtres commandes admin (date, statut, client).  
- Corriger URL API dashboard (env `VITE_API_URL`).

### Faisable mais plus tard / plus coûteux

- Transferts inter-boutiques, import intelligent, livreurs, WhatsApp API, 2FA, sauvegardes applicatives.

### Hors scope court terme (infra / produit)

- Scalabilité 50k commandes sans archivage, marketplace, intégrations comptables externes.

---

## 10. Estimation d’effort (indicatif)

| Phase | Contenu | Effort |
|-------|---------|--------|
| 0 | Multi-boutiques (schéma + API + UI filtres) | 15–25 j/h |
| 1 | Atomique + réservations + historique statuts | 8–12 j/h |
| 2 | Factures PDF + API | 8–10 j/h |
| 3 | Transferts + taxes boutique + rapports | 12–18 j/h |
| 4 | Audit, retours, livreurs, exports | 20–30 j/h |
| 5 | Intégrations messaging + import | 15–25 j/h |

*Ordre de grandeur pour 1 développeur full-stack familiarisé avec le repo.*

---

## 11. Fichiers clés du projet (référence)

| Domaine | Fichiers |
|---------|----------|
| Schéma données | `backend/prisma/schema.prisma` |
| Commandes | `backend/src/modules/orders/orders.service.js`, `orders.admin.controller.js` |
| Stock | `backend/src/modules/products/stock.service.js` |
| Comptabilité | `backend/src/modules/accounting/accounting.routes.js`, `frontend/.../AdminAccounting.jsx` |
| Admin UI | `frontend/src/pages/admin/*`, `AdminSidebar.jsx` |
| Auth / rôles | `backend/src/middlewares/auth.middleware.js` |
| Checkout WhatsApp | `frontend/src/components/checkout/PaymentModal.jsx` |

---

*Document généré par analyse du dépôt et du cahier des charges v2. À mettre à jour après chaque phase de livraison.*
