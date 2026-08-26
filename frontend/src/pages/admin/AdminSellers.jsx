import { useState, useEffect } from "react";
import useAuthStore from "../../store/authStore";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function AdminSellers() {
  const { token } = useAuthStore();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Modal Créer / Modifier vendeur
  const [formModal, setFormModal] = useState(null); // 'create' | 'edit' | null
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Modal détails vendeur
  const [detailsModal, setDetailsModal] = useState(null);
  const [sellerStats, setSellerStats] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchSellers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/sellers/admin/all`, { headers });
      if (!res.ok) throw new Error('Erreur chargement vendeurs');
      const data = await res.json();
      setSellers(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const filteredSellers = sellers.filter((s) => {
    const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    const email = (s.email || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const getInitials = (s) =>
    `${s.firstName?.[0] || ''}${s.lastName?.[0] || ''}`.toUpperCase() || '?';

  // ── CRUD Vendeur ─────────────────────────────────────────────────────
  const openCreate = () => {
    setForm({ firstName: "", lastName: "", email: "", phone: "", password: "" });
    setSelectedSeller(null);
    setFieldErrors({});
    setFormModal("create");
  };

  const openEdit = (s) => {
    setForm({
      firstName: s.firstName || "",
      lastName: s.lastName || "",
      email: s.email || "",
      phone: s.phone || "",
      password: ""
    });
    setSelectedSeller(s);
    setFieldErrors({});
    setFormModal("edit");
  };

  const closeFormModal = () => {
    setFormModal(null);
    setSelectedSeller(null);
    setFieldErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errors = {};
    if (!form.firstName.trim()) errors.firstName = "Le prénom est obligatoire";
    if (!form.lastName.trim()) errors.lastName = "Le nom est obligatoire";
    if (!form.email.trim()) errors.email = "L'email est obligatoire";
    if (formModal === "create" && !form.password) errors.password = "Le mot de passe est obligatoire";
    if (form.password && form.password.length < 6) errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    return errors;
  };

  const handleSubmitSeller = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setSubmitting(true);
    try {
      const isEdit = formModal === "edit";
      const url = isEdit
        ? `${API_URL}/api/sellers/admin/${selectedSeller.id}`
        : `${API_URL}/api/sellers/admin`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers,
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          ...(formModal === "create" && { password: form.password }),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || "Erreur serveur");
      }
      await fetchSellers();
      closeFormModal();
      toast.success(isEdit ? "Vendeur modifié ✓" : "Vendeur créé ✓");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (s) => {
    try {
      const res = await fetch(
        `${API_URL}/api/sellers/admin/${s.id}/toggle`,
        { method: "PATCH", headers },
      );
      if (!res.ok) throw new Error("Erreur lors du changement de statut");
      await fetchSellers();
      toast.success(s.isActive ? "Vendeur désactivé" : "Vendeur activé ✓");
    } catch (e) {
      toast.error(e.message);
    }
  };

  // ── Détails vendeur ───────────────────────────────────────────────────
  const openDetailsModal = async (s) => {
    setDetailsModal(s);
    setSellerStats(null);
    setSellerProducts([]);
    try {
      const [statsRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/api/sellers/admin/${s.id}/stats`, { headers }),
        fetch(`${API_URL}/api/sellers/admin/${s.id}/products`, { headers }),
      ]);
      const statsData = await statsRes.json();
      const productsData = await productsRes.json();
      setSellerStats(statsData);
      setSellerProducts(Array.isArray(productsData) ? productsData : productsData.data || []);
    } catch (e) {
      toast.error("Erreur chargement détails");
    }
  };

  const closeDetailsModal = () => {
    setDetailsModal(null);
    setSellerStats(null);
    setSellerProducts([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendeurs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredSellers.length} vendeur{filteredSellers.length !== 1 ? "s" : ""} —
            gestion des comptes vendeurs
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <span className="text-lg leading-none">+</span> Nouveau vendeur
        </button>
      </div>

      {/* Recherche */}
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un vendeur..."
          className="w-full max-w-sm border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
        />
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
          {error} —{" "}
          <button onClick={fetchSellers} className="underline font-medium">
            Réessayer
          </button>
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            Chargement...
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">👤</div>
            <p className="font-medium">Aucun vendeur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3">Vendeur</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Téléphone</th>
                  <th className="px-6 py-3">Produits</th>
                  <th className="px-6 py-3">Commandes</th>
                  <th className="px-6 py-3">Inscrit le</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSellers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getInitials(s)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {s.firstName} {s.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{s.email}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {s.phone || <span className="text-gray-300 italic">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-medium">{s._count?.sellerProducts || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-medium">{s._count?.orders || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {s.createdAt ? formatDate(s.createdAt) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {s.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetailsModal(s)}
                          className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors font-medium"
                        >
                          Détails
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors font-medium"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleToggleActive(s)}
                          className={`text-xs px-3 py-1.5 rounded-md border transition-colors font-medium ${
                            s.isActive
                              ? "border-red-200 text-red-600 hover:bg-red-50"
                              : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {s.isActive ? "Désactiver" : "Activer"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Créer / Modifier vendeur */}
      {(formModal === "create" || formModal === "edit") && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {formModal === "create" ? "Nouveau vendeur" : "Modifier le vendeur"}
              </h2>
              <button
                onClick={closeFormModal}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSeller} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
                      fieldErrors.firstName
                        ? "border-red-400 focus:ring-red-200 bg-red-50"
                        : "border-gray-200 focus:ring-black/20"
                    }`}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
                      fieldErrors.lastName
                        ? "border-red-400 focus:ring-red-200 bg-red-50"
                        : "border-gray-200 focus:ring-black/20"
                    }`}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
                    fieldErrors.email
                      ? "border-red-400 focus:ring-red-200 bg-red-50"
                      : "border-gray-200 focus:ring-black/20"
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {formModal === "create" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 caractères"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
                      fieldErrors.password
                        ? "border-red-400 focus:ring-red-200 bg-red-50"
                        : "border-gray-200 focus:ring-black/20"
                    }`}
                  />
                  {fieldErrors.password && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="ex : 77 123 45 67"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="flex-1 border border-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-black text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
                >
                  {submitting ? "En cours..." : formModal === "create" ? "Créer" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Détails vendeur */}
      {detailsModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Détails — {detailsModal.firstName} {detailsModal.lastName}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{detailsModal.email}</p>
              </div>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {sellerStats ? (
                <div className="space-y-6">
                  {/* Statistiques */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">{sellerStats.overview?.totalProducts || 0}</div>
                      <div className="text-xs text-gray-500">Total produits</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">{sellerStats.overview?.activeProducts || 0}</div>
                      <div className="text-xs text-gray-500">Produits actifs</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">{sellerStats.orders?.total || 0}</div>
                      <div className="text-xs text-gray-500">Total commandes</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">{(sellerStats.revenue?.total || 0).toLocaleString()} FCFA</div>
                      <div className="text-xs text-gray-500">Chiffre d'affaires</div>
                    </div>
                  </div>

                  {/* Produits */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Produits ({sellerProducts.length})</h3>
                    {sellerProducts.length === 0 ? (
                      <p className="text-sm text-gray-400">Aucun produit</p>
                    ) : (
                      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                        {sellerProducts.map((p) => (
                          <div key={p.id} className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                              {p.images?.[0]?.url && (
                                <img src={p.images[0].url} alt="" className="w-10 h-10 rounded object-cover" />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{p.name}</div>
                                <div className="text-xs text-gray-500">{p.price} FCFA • Stock: {p.stock}</div>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                            }`}>
                              {p.isActive ? "Actif" : "Inactif"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-20 text-gray-400">
                  Chargement des détails...
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}