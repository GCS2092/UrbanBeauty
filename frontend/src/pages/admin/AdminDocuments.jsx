import { FileSpreadsheet, FileText, Package, Download } from 'lucide-react';
import { toast } from 'sonner';
import ReportDownloader from '../../components/admin/ReportDownloader';
import ProductImportExport from '../../components/admin/ProductImportExport';
import StoreFilter from '../../components/admin/StoreFilter';
import { useAdminStoreFilter } from '../../hooks/useAdminStoreFilter';
import { adminApi } from '../../api/admin.api';

// Adapte l'API showToast(msg, type) attendue par ProductImportExport
// au toast de sonner déjà utilisé partout ailleurs dans l'admin.
function showToast(message, type = 'success') {
  if (type === 'error') toast.error(message);
  else toast.success(message);
}

export default function AdminDocuments() {
  const [storeFilter, setStoreFilter] = useAdminStoreFilter();

  const handleExportInvoices = async () => {
    try {
      await adminApi.exportInvoicesExcel(storeFilter ? { storeId: storeFilter } : {});
      toast.success('Export des factures téléchargé');
    } catch (e) {
      toast.error(e.message || "Erreur lors de l'export des factures");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents & Rapports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Génère et envoie tous les documents de gestion en un seul endroit
          </p>
        </div>
        <StoreFilter value={storeFilter} onChange={(v) => setStoreFilter(v || '')} />
      </div>

      {/* Rapport de gestion — PDF + envoi email (inclut le stock bas) */}
      <ReportDownloader storeId={storeFilter} />

      {!storeFilter && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Sélectionne une boutique en haut à droite pour générer le rapport de gestion.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Factures */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <FileText size={15} className="text-blue-500" />
            <h2 className="font-semibold text-gray-900 text-sm">Factures</h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            <p className="text-xs text-gray-500">
              Exporte toutes les factures (période, statut, montants) dans un fichier Excel.
            </p>
            <button
              onClick={handleExportInvoices}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
            >
              <Download size={14} />
              Exporter les factures (Excel)
            </button>
          </div>
        </div>

        {/* Produits — import/export Excel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Package size={15} className="text-emerald-500" />
            <h2 className="font-semibold text-gray-900 text-sm">Catalogue produits</h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            <p className="text-xs text-gray-500">
              Télécharge un template, importe un fichier Excel, ou exporte le catalogue actuel.
            </p>
            <ProductImportExport onImportSuccess={() => {}} showToast={showToast} />
          </div>
        </div>
      </div>

      {/* Rappel du comportement automatique déjà actif */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <FileSpreadsheet size={15} className="text-gray-400" />
          <h2 className="font-semibold text-gray-900 text-sm">Automatisations déjà actives</h2>
        </div>
        <ul className="text-xs text-gray-500 space-y-1.5 list-disc list-inside">
          <li>Rapport de gestion mensuel envoyé automatiquement par email le 1er de chaque mois à 8h (inclut les alertes de stock bas)</li>
          <li>Ce rapport peut aussi être généré manuellement à tout moment ci-dessus, pour n'importe quelle période</li>
        </ul>
      </div>
    </div>
  );
}