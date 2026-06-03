import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, Search, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../api/admin.api';
import Pagination from '../../components/shared/Pagination';
import DateRangeFilter from '../../components/admin/DateRangeFilter';

const formatPrice = (p) => `${Number(p || 0).toLocaleString('fr-FR')} FCFA`;
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const STATUS_STYLES = {
  GENERATED: 'bg-blue-50 text-blue-700',
  SENT: 'bg-indigo-50 text-indigo-700',
  PAID: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

const STATUS_LABELS = {
  GENERATED: 'Générée',
  SENT: 'Envoyée',
  PAID: 'Payée',
  CANCELLED: 'Annulée',
};

export default function AdminInvoices() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(null);
  const [exporting, setExporting] = useState(false);

  const filterParams = {
    page,
    limit: 20,
    ...(search.trim() && { search: search.trim() }),
    ...(status && { status }),
    ...(from && { from }),
    ...(to && { to }),
  };

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-invoices', filterParams],
    queryFn: () => adminApi.getInvoices(filterParams).then((r) => r.data),
  });

  const invoices = data?.data || [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handleDownload = async (invoice) => {
    setDownloading(invoice.id);
    try {
      await adminApi.downloadInvoicePdf(invoice.id, invoice.invoiceNumber);
      toast.success('Facture téléchargée');
    } catch (e) {
      toast.error(e.message || 'Erreur téléchargement');
    } finally {
      setDownloading(null);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const { page: _p, limit: _l, ...exportFilters } = filterParams;
      await adminApi.exportInvoicesExcel(exportFilters);
      toast.success('Export Excel téléchargé');
    } catch (e) {
      toast.error(e.message || 'Erreur export');
    } finally {
      setExporting(false);
    }
  };

  const clientName = (inv) => {
    const o = inv.order;
    if (!o) return '—';
    if (o.user) return `${o.user.firstName} ${o.user.lastName}`;
    return o.guestName || '—';
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 pl-12 lg:pl-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={16} className="text-rose-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">Comptabilité</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Factures</h1>
          <p className="text-stone-500 text-sm mt-1">{total} facture(s)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportExcel}
            disabled={exporting || total === 0}
            className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-100 disabled:opacity-50"
          >
            <FileSpreadsheet size={14} />
            {exporting ? 'Export…' : 'Export Excel'}
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 border border-stone-200 bg-white px-4 py-2 rounded-xl text-sm text-stone-600 hover:bg-stone-50"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Actualiser
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-6 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="N° facture, commande, client…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="border border-stone-200 rounded-xl px-3 py-2.5 text-sm"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <DateRangeFilter
          from={from}
          to={to}
          onFromChange={(v) => { setFrom(v); setPage(1); }}
          onToChange={(v) => { setTo(v); setPage(1); }}
        />
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 text-center text-stone-400">Chargement…</div>
        ) : invoices.length === 0 ? (
          <div className="py-20 text-center text-stone-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucune facture pour ces critères.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-left text-xs font-semibold text-stone-500 uppercase">
                  <th className="px-5 py-3">N° Facture</th>
                  <th className="px-5 py-3">Commande</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3 text-right">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-stone-50">
                    <td className="px-5 py-4 font-mono text-xs font-semibold">{inv.invoiceNumber}</td>
                    <td className="px-5 py-4 font-mono text-xs">{inv.order?.orderNumber || '—'}</td>
                    <td className="px-5 py-4">{clientName(inv)}</td>
                    <td className="px-5 py-4 text-stone-600">{formatDate(inv.issuedAt)}</td>
                    <td className="px-5 py-4 font-semibold">{formatPrice(inv.total)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          STATUS_STYLES[inv.status] || 'bg-stone-100'
                        }`}
                      >
                        {STATUS_LABELS[inv.status] || inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDownload(inv)}
                        disabled={downloading === inv.id}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 disabled:opacity-50"
                      >
                        <Download size={14} />
                        {downloading === inv.id ? '…' : 'PDF'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
