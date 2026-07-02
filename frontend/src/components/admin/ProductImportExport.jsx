import { useState, useRef } from 'react';
import { productsApi } from '../../api/products.api';

// ─── Panneau de rapport après import ────────────────────────────────
function ImportReport({ report, onClose }) {
  const hasErrors = report.errors?.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Rapport d'import</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Résumé chiffré */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-gray-50 rounded-lg py-3">
              <div className="text-xl font-bold text-gray-900">{report.total}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Lignes lues</div>
            </div>
            <div className="bg-emerald-50 rounded-lg py-3">
              <div className="text-xl font-bold text-emerald-700">{report.created}</div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Créés</div>
            </div>
            <div className="bg-blue-50 rounded-lg py-3">
              <div className="text-xl font-bold text-blue-700">{report.updated}</div>
              <div className="text-[11px] text-blue-600 mt-0.5">Mis à jour</div>
            </div>
            <div className="bg-red-50 rounded-lg py-3">
              <div className="text-xl font-bold text-red-700">{report.skipped}</div>
              <div className="text-[11px] text-red-600 mt-0.5">Ignorés</div>
            </div>
          </div>

          {/* Liste des erreurs, ligne par ligne */}
          {hasErrors && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Détail des {report.errors.length} ligne{report.errors.length > 1 ? 's' : ''} ignorée{report.errors.length > 1 ? 's' : ''} :
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {report.errors.map((e, i) => (
                  <div key={i} className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <p className="text-xs font-medium text-red-800">
                      Ligne {e.row} — {e.name}
                    </p>
                    <ul className="text-xs text-red-600 list-disc list-inside mt-1 space-y-0.5">
                      {e.errors.map((msg, j) => <li key={j}>{msg}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Corrigez ces lignes dans le fichier Excel et réimportez — seules ces lignes seront retraitées, les autres ne seront pas dupliquées.
              </p>
            </div>
          )}

          {!hasErrors && report.total > 0 && (
            <div className="text-center text-sm text-emerald-700 bg-emerald-50 rounded-lg py-3">
              Tout le fichier a été importé sans erreur ✓
            </div>
          )}
        </div>

        <div className="p-6 pt-0">
          <button onClick={onClose}
            className="w-full bg-black text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal : 3 boutons (template / export / import) ──
export default function ProductImportExport({ onImportSuccess, showToast }) {
  const fileInputRef = useRef(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [report, setReport] = useState(null);

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      await productsApi.downloadTemplate();
    } catch (e) {
      showToast?.(e.message, 'error');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await productsApi.exportExcel();
    } catch (e) {
      showToast?.(e.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permet de resélectionner le même fichier plus tard
    if (!file) return;

    setImporting(true);
    try {
      const res = await productsApi.importExcel(file);
      setReport(res.data);
      onImportSuccess?.(); // rafraîchit la liste des produits côté page parente
      if (res.data.errors?.length === 0) {
        showToast?.(`${res.data.created} créé(s), ${res.data.updated} mis à jour ✓`);
      }
    } catch (err) {
      showToast?.(err.message || err.response?.data?.message || "Échec de l'import", 'error');
    } finally {
      setImporting(false);
    }
  };

  const btnBase = 'flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileSelected}
      />

      <button
        type="button"
        onClick={handleDownloadTemplate}
        disabled={downloadingTemplate}
        className={`${btnBase} border-gray-200 text-gray-600 hover:bg-gray-50`}
        title="Télécharger un fichier Excel vierge avec les colonnes attendues"
      >
        {downloadingTemplate ? 'Téléchargement...' : '📄 Template'}
      </button>

      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className={`${btnBase} border-gray-200 text-gray-600 hover:bg-gray-50`}
        title="Exporter le catalogue actuel en Excel"
      >
        {exporting ? 'Export...' : '⬇️ Exporter'}
      </button>

      <button
        type="button"
        onClick={handleImportClick}
        disabled={importing}
        className={`${btnBase} border-gray-900 bg-gray-900 text-white hover:bg-gray-700`}
        title="Importer des produits depuis un fichier Excel"
      >
        {importing ? 'Import en cours...' : '⬆️ Importer Excel'}
      </button>

      {report && <ImportReport report={report} onClose={() => setReport(null)} />}
    </div>
  );
}