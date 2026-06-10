# Historique de suivi — UrbanBeauty vs Cahier des charges v2/v3

**Dernière mise à jour :** 10 juin 2026 (session conformité complète)  
**Référence :** `cahierDeCharge2`, `ANALYSE_CDC2_VS_PROJET.md`

---

## Livré — session 10 juin 2026 (multi-boutiques + compléments CDC)

| Élément | Détail |
|--------|--------|
| **Architecture multi-boutiques** | Modèles `Store`, `UserStore`, `storeId` sur commandes/factures/mouvements/dépenses/audit |
| **Boutique principale** | Seed `UBT` — UrbanBeauty Siège (`clmainstore000000000001`) |
| **Migration** | `20260610000000_multi_stores_foundation` |
| **API boutiques** | `GET/POST/PATCH /api/admin/stores`, assignation utilisateur |
| **Cloisonnement** | Middleware `loadStoreContext`, filtre `storeId` commandes/factures |
| **Remise boutique** | `discountRate` sur Store → `storeDiscount` sur commande/facture |
| **Taxes boutique** | `taxRate` appliqué à la génération facture |
| **Devise** | Champ `currency` + `exchangeRate` sur Store (XOF par défaut) |
| **Numérotation factures** | Format `FA-{CODE}-{AAAA}-{NNNN}` par boutique |
| **Expiration réservations** | Cron horaire — brouillons WhatsApp (`DRAFT`) + alertes admin |
| **Commandes WhatsApp** | Statut `DRAFT`, boutons panier (commande + info), validation/rejet admin |
| **Transferts inter-boutiques** | API `StockTransfer` + mouvements `TRANSFER_OUT/IN` |
| **Avoirs** | API `CreditNote` format `AV-{CODE}-{AAAA}-{NNNN}` |
| **UI admin** | Page Boutiques, filtre boutique Dashboard/Commandes/Factures |
| **Paramètres** | `reservation_expiry_hours` (défaut 24h) |

---

## Matrice de conformité (état actuel)

| § | Thème | Statut | Commentaire |
|---|--------|--------|-------------|
| 0 | Multi-boutiques | ✅/🔧 | Fondation en place ; UI transferts à compléter |
| 1 | Tableau de bord | 🔧 | Filtre boutique OK ; drill-down périodes manquant |
| 2 | Commandes | ✅/🔧 | Atomique, réservations, WhatsApp, historique ; livreur absent |
| 3 | Factures | ✅ | PDF, Excel, numérotation légale par boutique |
| 4 | Documents centralisés | ❌ | Espace dédié non créé |
| 5 | Comptabilité | 🔧 | Auto via ventes ; vue par boutique partielle |
| 6 | Stocks | ✅/🔧 | Central + réservations + transferts API |
| 7 | Produits | ✅ | CRUD OK ; KPI produit limités |
| 8 | Cohérence globale | ✅ | `$transaction` sur paiement/statuts |
| 9 | Import produits | ❌ | |
| 10 | Livraisons / livreurs | ❌ | |
| 11 | WhatsApp | ✅/🔧 | wa.me panier + admin ; pas de templates paramétrables |
| 12 | Recherche globale | ❌ | |
| 13 | Pagination | ✅/🔧 | Commandes/factures paginées |
| 14 | Audit | ✅ | Journal + page admin |
| 15 | Rôles | 🔧 | `UserStore` + rôles staff enum ; guard UI partiel |
| 16 | Alertes | 🔧 | Stock bas + expiration brouillons |
| 17 | KPI | 🔧 | Dashboard basique |
| 18–26 | Intégrations / perf | ❌/🔧 | Phase 5 |

Légende : ✅ conforme · 🔧 partiel · ❌ absent

---

## Prochaines étapes recommandées (ordre CDC)

1. UI transferts inter-boutiques + PDF bon de transfert  
2. Espace « Documents & Exports » centralisé (§4)  
3. Module livreurs + livraisons (§10)  
4. Recherche globale (§12)  
5. Import produits intelligent (§9)  
6. Rôles staff complets + 2FA (§15, §19)  

---

## Commandes migration (autre poste)

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

---

## Journal des sessions

| Date | Action |
|------|--------|
| 2026-06-03 | Fondations : réservations, transactions, factures, audit |
| 2026-06-10 | Multi-boutiques, expiration réservations, WhatsApp admin, transferts, avoirs |
