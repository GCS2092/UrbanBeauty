import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../api/admin.api';
import api from '../../api/axios';
import Pagination from '../../components/shared/Pagination';
import DateRangeFilter from '../../components/admin/DateRangeFilter';

const STATUS_LABELS = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700' },
  PROCESSING: { label: 'En traitement', color: 'bg-purple-100 text-purple-700' },
  SHIPPED: { label: 'Expédiée', color: 'bg-indigo-100 text-indigo-700' },
  DELIVERED: { label: 'Livrée', color: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-700' },
};

const PAYMENT_LABELS = {
  PENDING: 'Paiement en attente',
  PAID: 'Payé',
  PARTIAL: 'Partiel',
  REJECTED: 'Rejeté',
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
const formatPrice = (p) => `${Number(p).toLocaleString('fr-FR')} FCFA`;

const emptyFilters = {
  status: '',
  paymentStatus: '',
  search: '',
  from: '',
  to: '',
};

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(emptyFilters);
  const [selected, setSelected] = useState(null);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(null);

  const queryParams = {
    page,
    limit: 20,
    ...(filters.status && { status: filters.status }),
    ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
    ...(filters.search.trim() && { search: filters.search.trim() }),
    ...(filters.from && { from: filters.from }),
    ...(filters.to && { to: filters.to }),
  };

  const { data, isLoading, refetch, isFetching, error } = useQuery({
    queryKey: ['admin-orders', queryParams],
    queryFn: () => adminApi.getOrders(queryParams).then((r) => r.data),
  });

  const orders = data?.data || [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const openStatusModal = (order) => {
    setSelected(order);
    setNewStatus(order.status);
    setStatusMessage('');
    setStatusModal(true);
  };

  const handleDownloadInvoice = async (invoice) => {
    setDownloadingPdf(invoice.id);
    try {
      await adminApi.downloadInvoicePdf(invoice.id, invoice.invoiceNumber);
      toast.success('Facture téléchargée');
    } catch (e) {
      toast.error(e.message || 'Erreur');
    } finally {
      setDownloadingPdf(null);
    }
  };

  const handleStatusChange = async () => {
    setSubmitting(true);
    try {
      await api.put(`/api/orders/${selected.id}/status`, {
        status: newStatus,
        message: statusMessage || undefined,
      });
      await refetch();
      setStatusModal(false);
      toast.success('Statut mis à jour');
    } catch (e) {
      toast.error(e.message || 'Erreur mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 pl-12 lg:pl-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-sm text-gray-500 mt-1">{total} commande{total !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Actualiser
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-3">
        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            placeholder="N°, client, email, téléphone…"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <select
            value={filters.paymentStatus}
            onChange={(e) => updateFilter('paymentStatus', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tous les paiements</option>
            {Object.entries(PAYMENT_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <DateRangeFilter
          from={filters.from}
          to={filters.to}
          onFromChange={(v) => updateFilter('from', v)}
          onToChange={(v) => updateFilter('to', v)}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
          {error.message || 'Erreur chargement'} —{' '}
          <button onClick={() => refetch()} className="underline font-medium">Réessayer</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">Chargement…</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="font-medium">Aucune commande</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3">N° Commande</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Paiement</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3">Facture</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const s = STATUS_LABELS[order.status] || {
                    label: order.status,
                    color: 'bg-gray-100 text-gray-600',
                  };
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-gray-800">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {order.user
                            ? `${order.user.firstName} ${order.user.lastName}`
                            : order.guestName || '—'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {order.user?.email || order.guestEmail || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {formatPrice(order.total || 0)}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {PAYMENT_LABELS[order.paymentStatus] || order.paymentStatus}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.color}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {order.invoice ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-600">
                              {order.invoice.invoiceNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDownloadInvoice(order.invoice)}
                              disabled={downloadingPdf === order.invoice.id}
                              className="p-1 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-50"
                              title="Télécharger PDF"
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openStatusModal(order)}
                          className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 font-medium"
                        >
                          Changer statut
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {statusModal && selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Changer le statut</h2>
              <button
                onClick={() => setStatusModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Commande <span className="font-mono font-semibold">{selected.orderNumber}</span>
            </p>
            {selected.invoice && (
              <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 mb-3">
                Facture : {selected.invoice.invoiceNumber}
              </p>
            )}
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3"
            >
              {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <textarea
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              placeholder="Commentaire (optionnel)"
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4"
            />
            {selected.statusHistory?.length > 0 && (
              <div className="mb-4 border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Historique récent</p>
                <ul className="space-y-1 max-h-32 overflow-y-auto">
                  {selected.statusHistory.map((h) => (
                    <li key={h.id} className="text-xs text-gray-600">
                      {formatDate(h.createdAt)} — {h.fromStatus ? `${h.fromStatus} → ` : ''}
                      {h.toStatus}
                      {h.message && <span className="text-gray-400"> ({h.message})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setStatusModal(false)}
                className="flex-1 border border-gray-200 rounded-lg py-2 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleStatusChange}
                disabled={submitting}
                className="flex-1 bg-black text-white rounded-lg py-2 text-sm disabled:opacity-60"
              >
                {submitting ? 'En cours…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
