# Historique de suivi â€” UrbanBeauty vs Cahier des charges v2

**DerniÃ¨re mise Ã  jour :** 3 juin 2026 (session 2 â€” Ã©tapes critiques)  
**RÃ©fÃ©rence analyse :** `ANALYSE_CDC2_VS_PROJET.md`

Ce fichier recense ce qui a Ã©tÃ© **livrÃ©**, ce qui est **en cours / partiel**, et ce qui reste **Ã  planifier**. Ã€ mettre Ã  jour Ã  chaque phase.

---

## LivrÃ© dans cette session (fondations sur lâ€™existant)

| Ã‰lÃ©ment | DÃ©tail | Fichiers / API |
|--------|--------|----------------|
| RÃ©servation stock | `reservedStock` sur produit/variante ; rÃ©servation Ã  la crÃ©ation de commande | `schema.prisma`, `stock.service.js`, `orders.service.js` |
| Paiement atomique | `prisma.$transaction` : stock, mouvement `OUT_SALE`, facture, historique, audit, paiement | `order-fulfillment.service.js`, `orders.admin.controller.js` |
| Factures (base) | ModÃ¨le `Invoice`, numÃ©rotation `FA-AAAA-NNNN`, crÃ©ation Ã  la validation du paiement | `invoice.utils.js`, migration |
| Historique statuts | `OrderStatusHistory` Ã  la crÃ©ation et Ã  chaque changement | `order-fulfillment.service.js` |
| Journal dâ€™audit (base) | `AuditLog` + API `GET /api/admin/audit` | `audit.service.js`, `audit.routes.js` |
| API factures (lecture) | `GET /api/admin/invoices`, `GET /api/admin/invoices/order/:orderId` | `invoices.routes.js` |
| Filtres commandes admin | statut, paiement, recherche | `orders.service.js` `buildOrdersWhere` |
| Erreurs mÃ©tier | Mapping erreurs Prisma courantes | `prisma-error.utils.js`, `error.middleware.js` |
| Frontend commandes | Filtres, facture, historique dans modal, `adminApi` | `AdminOrders.jsx` |
| Dashboard | URL API centralisÃ©e, stock bas = disponible rÃ©el | `Dashboard.jsx`, `constants.js` |
| Stock disponible compta | Alertes sur `stock - reservedStock` | `accounting.routes.js` |
| **Factures PDF** | GÃ©nÃ©ration `pdfkit`, tÃ©lÃ©chargement `GET /api/admin/invoices/:id/pdf` | `invoice-pdf.service.js` |
| **Page admin Factures** | Liste, filtres, pagination, tÃ©lÃ©chargement PDF | `AdminInvoices.jsx` |
| **Page admin Audit** | Liste journal avec filtres et pagination | `AdminAudit.jsx` |
| **Infos entreprise** | ParamÃ¨tres pour en-tÃªte factures (`company_*`) | `settings.service.js`, `AdminSettings.jsx` |
| **Stock produits admin** | Colonnes rÃ©el / rÃ©servÃ© / disponible | `AdminProducts.jsx` |
| **PDF depuis commandes** | Bouton tÃ©lÃ©chargement si facture existe | `AdminOrders.jsx` |

**Migration :** `backend/prisma/migrations/20260603120000_foundation_reservations_audit_invoices/`

**Migration appliquÃ©e** sur lâ€™environnement local le 2026-06-03 (`prisma migrate deploy` + `prisma generate`).

Sur un autre poste :
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

---

## Partiel â€” Ã  complÃ©ter ensuite

| Sujet | Ã‰tat actuel | Prochaine Ã©tape |
|-------|-------------|-----------------|
| Export Excel factures | PDF seulement | Export `.xlsx` (section 4) |
| Envoi facture auto | PDF tÃ©lÃ©chargeable | Email/WhatsApp Ã  la validation paiement |
| Journal dâ€™audit UI | API seulement | Page `/admin/audit` avec filtres |
| Annulation commande payÃ©e | Restauration stock + facture `CANCELLED` | Tests + avoirs (section 21) |
| Paiement `PARTIAL` | AcceptÃ© en API, pas de logique acompte | Tracer solde restant + alertes |
| Emails | Toujours best-effort si SMTP absent | Config production |
| Pagination commandes | `limit=100` fixe | Pagination UI comme sur Factures |

---

## Non dÃ©marrÃ© â€” prioritÃ© CDC2 (Ã  planifier)

### PrioritÃ© 0 â€” Multi-boutiques (fondation CDC v2)
- [ ] ModÃ¨le `Store` / boutique principale
- [ ] `storeId` sur commandes, factures, mouvements, utilisateurs
- [ ] Cloisonnement API + middleware permissions
- [ ] Filtre boutique dashboard / listes / exports
- [ ] Transferts inter-boutiques

### PrioritÃ© 1 â€” Modules critiques restants
- [ ] Retours et avoirs (`AV-AAAA-NNNN`)
- [ ] Rapprochement paiement â†” facture (section 24)
- [ ] Taxes configurables par boutique (section 5)

### PrioritÃ© 2 â€” Enrichissement existant
- [ ] Tableau de bord : pÃ©riodes cliquables, KPI dÃ©taillÃ©s (Â§1, Â§17)
- [ ] Fiche client CRM (historique multi-boutique) (Â§22)
- [ ] Espace Â« Documents & exports Â» centralisÃ© (Â§4)
- [ ] Recherche globale (Â§12)
- [ ] Modification commande selon statut + validation admin (Â§2)

### PrioritÃ© 3 â€” Nouveaux modules
- [ ] Livreurs + espace livreur (Â§10)
- [ ] Notifications WhatsApp/SMS automatiques (Â§11) â€” aujourdâ€™hui lien manuel checkout
- [ ] Import/export produits intelligent (Â§9)
- [ ] Fournisseurs : bons de commande + rÃ©ceptions (Â§23)
- [ ] Promotions avancÃ©es par boutique (Â§25)
- [ ] Alertes intelligentes multi-seuils (Â§16)

### PrioritÃ© 4 â€” Technique / infra
- [ ] RÃ´les : gestionnaire, comptable, commercial, magasinier, livreur (Â§15)
- [ ] 2FA (Â§19)
- [ ] Sauvegardes / restauration applicatives (Â§13)
- [ ] IntÃ©grations externes : WhatsApp API, Africa's Talking, pg-boss, socket.io (CDC1 / Â§18)
- [ ] Archivage donnÃ©es + perf 50k+ lignes (Â§26)

---

## DÃ©cisions mÃ©tier en attente

| Question | Impact |
|----------|--------|
| Stock dÃ©clenchÃ© Ã  la commande ou au paiement ? | **Actuel :** rÃ©servation Ã  la commande, sortie stock au paiement `PAID` |
| Facture Ã  la commande ou au paiement ? | **Actuel :** Ã  la validation paiement `PAID` |
| Vente Ã  stock 0 ? | Non bloquÃ© explicitement (rÃ©servation empÃªche si disponible = 0) |
| Boutique e-commerce = boutique principale ? | Ã€ dÃ©finir avant multi-boutiques |

---

## Journal des sessions

| Date | Action |
|------|--------|
| 2026-06-03 | Analyse comparative `ANALYSE_CDC2_VS_PROJET.md` |
| 2026-06-03 | Fondations : rÃ©servations, transactions, factures base, audit, filtres admin |
| 2026-06-03 | Critiques : PDF factures, pages Factures + Audit, infos entreprise, stock admin |
| 2026-06-03 | Confort : pagination commandes, filtres date, export Excel factures |

---

## Notes techniques

- Les commandes **crÃ©Ã©es avant migration** nâ€™ont pas de rÃ©servation : la validation paiement gÃ¨re `reservedStock` avec plafond (`Math.min`).
- `decrementStock` / `incrementStock` legacy conservÃ©s mais la logique mÃ©tier passe par `order-fulfillment` + `stock.service` transactionnel.
- Voir `ANALYSE_CDC2_VS_PROJET.md` pour le dÃ©tail des Ã©carts et lâ€™ordre des phases 0â€“5.
