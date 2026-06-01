import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';

const API_URL = 'http://localhost:5000';
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function AdminUsers() {
  const { token } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/users/admin/all`, { headers });
      if (!res.ok) throw new Error('Erreur chargement utilisateurs');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter((u) => {
    const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const getInitials = (u) =>
    `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="self-start sm:self-auto flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          ↻ Actualiser
        </button>
      </div>

      {/* Recherche */}
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="w-full max-w-sm border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
        />
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
          {error} —{' '}
          <button onClick={fetchUsers} className="underline font-medium">
            Reessayer
          </button>
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <svg className="animate-spin h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">👥</div>
            <p className="font-medium">Aucun utilisateur trouve</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 sm:px-6 py-3">Utilisateur</th>
                  <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">Role</th>
                  <th className="px-4 sm:px-6 py-3 hidden md:table-cell">Telephone</th>
                  <th className="px-4 sm:px-6 py-3 hidden md:table-cell">Commandes</th>
                  <th className="px-4 sm:px-6 py-3 hidden lg:table-cell">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getInitials(u)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-xs text-gray-400 truncate">{u.email}</div>
                          {/* Role visible sur mobile */}
                          <span className={`sm:hidden inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                            {u.role || 'CUSTOMER'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role || 'CUSTOMER'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-gray-600 hidden md:table-cell">
                      {u.phone || '—'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-gray-600 hidden md:table-cell">
                      {u._count?.orders ?? 0}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-gray-600 hidden lg:table-cell">
                      {u.createdAt ? formatDate(u.createdAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}