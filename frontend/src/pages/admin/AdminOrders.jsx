import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';

const API_URL = 'http://localhost:5000';

const STATUS_LABELS = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700' },
  PROCESSING: { label: 'En traitement', color: 'bg-purple-100 text-purple-700' },
  SHIPPED: { label: 'Expédiée', color: 'bg-indigo-100 text-indigo-700' },
  DELIVERED: { label: 'Livrée', color: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-700' },
};

const formatDate = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
const formatPrice = (p) => `${Number(p).toLocaleString('fr-FR')} FCFA`;

export default function AdminOrders() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_URL}/api/orders/admin/all`, { headers });
      if (!res.ok) throw new Error('Erreur chargement');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data.data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const openStatusModal = (order) => {
    setSelected(order);
    setNewStatus(order.status);
    setStatusModal(true);
  };

  const handleStatusChange = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${selected.id}/status`, {
        method: 'PUT', headers, body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Erreur mise à jour');
      await fetchOrders();
      setStatusModal(false);
      showToast('Statut mis à jour');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-sm text-gray-500 mt-1">{orders.length} commande{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
          ↻ Actualiser
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
          {error} — <button onClick={fetchOrders} className="underline font-medium">Réessayer</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <svg className="animate-spin h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Chargement...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">📦</div>
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
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const s = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold text-gray-800">
                          {order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>

                      {/* ✅ Affiche user connecté OU guest */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {order.user
                            ? `${order.user.firstName} ${order.user.lastName}`
                            : order.guestName || '—'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {order.user?.email || order.guestEmail || ''}
                        </div>
                        <div className="text-xs text-gray-400">
                          {order.user?.phone || order.guestPhone || ''}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-600">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {formatPrice(order.total || order.totalAmount || 0)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.color}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openStatusModal(order)}
                          className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors font-medium"
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

      {statusModal && selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Changer le statut</h2>
              <button onClick={() => setStatusModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Commande <span className="font-mono font-semibold text-gray-800">
                {selected.orderNumber || selected.id.slice(0, 8).toUpperCase()}
              </span>
            </p>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 mb-4"
            >
              {Object.entries(STATUS_LABELS).map(([val, { label }]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setStatusModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleStatusChange}
                disabled={submitting}
                className="flex-1 bg-black text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                {submitting ? 'En cours...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}