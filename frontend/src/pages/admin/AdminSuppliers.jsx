import { useState, useEffect, useMemo } from "react";
import useAuthStore from "../../store/authStore";
import { API_URL } from "../../utils/constants";

export default function AdminSuppliers() {
  const { token } = useAuthStore();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  // ── Modal Créer / Modifier fournisseur ──
  const [formModal, setFormModal] = useState(null); // 'create' | 'edit' | null
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ── Panneau assignation produits ──
  const [assignSupplier, setAssignSupplier] = useState(null); // fournisseur ouvert
  const [assignedSearch, setAssignedSearch] = useState("");
  const [availableSearch, setAvailableSearch] = useState("");
  const [movingId, setMovingId] = useState(null);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [supRes, prodRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/accounting/suppliers/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/products/admin/all?limit=1000`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const supData = await supRes.json();
      const prodData = await prodRes.json();
      setSuppliers(Array.isArray(supData) ? supData : supData.data || []);
      setProducts(Array.isArray(prodData) ? prodData : prodData.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ── Compteur de produits par fournisseur ──
  const countFor = (supplierId) =>
    products.filter((p) => p.supplierId === supplierId).length;

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ══════════════════════════════════════════════════════════
  // CRUD Fournisseur
  // ══════════════════════════════════════════════════════════
  const openCreate = () => {
    setForm({ name: "", email: "", phone: "", address: "" });
    setSelectedSupplier(null);
    setFieldErrors({});
    setFormModal("create");
  };

  const openEdit = (s) => {
    setForm({
      name: s.name || "",
      email: s.email || "",
      phone: s.phone || "",
      address: s.address || "",
    });
    setSelectedSupplier(s);
    setFieldErrors({});
    setFormModal("edit");
  };

  const closeFormModal = () => {
    setFormModal(null);
    setSelectedSupplier(null);
    setFieldErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Le nom est obligatoire";
    return errors;
  };

  const handleSubmitSupplier = async (e) => {
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
        ? `${API_URL}/api/admin/accounting/suppliers/${selectedSupplier.id}`
        : `${API_URL}/api/admin/accounting/suppliers`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers,
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || "Erreur serveur");
      }
      await fetchAll();
      closeFormModal();
      showToast(isEdit ? "Fournisseur modifié ✓" : "Fournisseur créé ✓");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (s) => {
    try {
      const res = await fetch(
        `${API_URL}/api/admin/accounting/suppliers/${s.id}/toggle`,
        { method: "PATCH", headers },
      );
      if (!res.ok) throw new Error("Erreur lors du changement de statut");
      await fetchAll();
      showToast(s.isActive ? "Fournisseur désactivé" : "Fournisseur activé ✓");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  // ══════════════════════════════════════════════════════════
  // Assignation produits ↔ fournisseur
  // ══════════════════════════════════════════════════════════
  const openAssignPanel = (s) => {
    setAssignSupplier(s);
    setAssignedSearch("");
    setAvailableSearch("");
  };
  const closeAssignPanel = () => setAssignSupplier(null);

  const assignedProducts = useMemo(() => {
    if (!assignSupplier) return [];
    return products
      .filter((p) => p.supplierId === assignSupplier.id)
      .filter((p) => p.name.toLowerCase().includes(assignedSearch.toLowerCase()));
  }, [products, assignSupplier, assignedSearch]);

  const availableProducts = useMemo(() => {
    if (!assignSupplier) return [];
    return products
      .filter((p) => p.supplierId !== assignSupplier.id)
      .filter((p) => p.name.toLowerCase().includes(availableSearch.toLowerCase()));
  }, [products, assignSupplier, availableSearch]);

  const moveProduct = async (product, newSupplierId) => {
    setMovingId(product.id);
    try {
      const res = await fetch(`${API_URL}/api/products/${product.id}/supplier`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ supplierId: newSupplierId }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'assignation");
      // ── Mise à jour optimiste locale, pas besoin de tout recharger ──
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, supplierId: newSupplierId } : p)),
      );
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredSuppliers.length} fournisseur{filteredSuppliers.length !== 1 ? "s" : ""} —
            usage interne uniquement, jamais visible côté client
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <span className="text-lg leading-none">+</span> Nouveau fournisseur
        </button>
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un fournisseur..."
          className="w-full max-w-sm border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
          {error} —{" "}
          <button onClick={fetchAll} className="underline font-medium">
            Réessayer
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            Chargement...
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">📦</div>
            <p className="font-medium">Aucun fournisseur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3">Fournisseur</th>
                  <th className="px-6 py-3">Téléphone</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Adresse</th>
                  <th className="px-6 py-3">Produits assignés</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {s.phone || <span className="text-gray-300 italic">—</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {s.email || <span className="text-gray-300 italic">—</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">
                      {s.address || <span className="text-gray-300 italic">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openAssignPanel(s)}
                        className="text-xs px-2.5 py-1 rounded-full font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                      >
                        {countFor(s.id)} produit{countFor(s.id) !== 1 ? "s" : ""} — Gérer
                      </button>
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

      {/* ── Modal Créer / Modifier fournisseur ── */}
      {(formModal === "create" || formModal === "edit") && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {formModal === "create" ? "Nouveau fournisseur" : "Modifier le fournisseur"}
              </h2>
              <button
                onClick={closeFormModal}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSupplier} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="ex : Fournisseur Dakar Textile"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
                    fieldErrors.name
                      ? "border-red-400 focus:ring-red-200 bg-red-50"
                      : "border-gray-200 focus:ring-black/20"
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>
                )}
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="fournisseur@exemple.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Adresse du fournisseur..."
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

      {/* ── Panneau assignation produits ↔ fournisseur ── */}
      {assignSupplier && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Produits — {assignSupplier.name}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Un produit ne peut appartenir qu'à un seul fournisseur à la fois
                </p>
              </div>
              <button
                onClick={closeAssignPanel}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {/* Colonne : produits assignés */}
              <div className="flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Assignés ({assignedProducts.length})
                  </h3>
                </div>
                <input
                  value={assignedSearch}
                  onChange={(e) => setAssignedSearch(e.target.value)}
                  placeholder="Filtrer..."
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-black/20"
                />
                <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                  {assignedProducts.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8">
                      Aucun produit assigné
                    </p>
                  ) : (
                    assignedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                      >
                        <span className="text-sm text-gray-800 truncate">{p.name}</span>
                        <button
                          onClick={() => moveProduct(p, null)}
                          disabled={movingId === p.id}
                          className="text-xs px-2 py-1 rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors shrink-0 ml-2 disabled:opacity-50"
                        >
                          {movingId === p.id ? "..." : "← Retirer"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Colonne : produits disponibles */}
              <div className="flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Disponibles ({availableProducts.length})
                  </h3>
                </div>
                <input
                  value={availableSearch}
                  onChange={(e) => setAvailableSearch(e.target.value)}
                  placeholder="Filtrer..."
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-black/20"
                />
                <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                  {availableProducts.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8">
                      Aucun produit disponible
                    </p>
                  ) : (
                    availableProducts.map((p) => {
                      const currentSupplier = suppliers.find((s) => s.id === p.supplierId);
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                        >
                          <div className="min-w-0">
                            <div className="text-sm text-gray-800 truncate">{p.name}</div>
                            {currentSupplier && (
                              <div className="text-[10px] text-amber-600 truncate">
                                Actuellement : {currentSupplier.name}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => moveProduct(p, assignSupplier.id)}
                            disabled={movingId === p.id}
                            className="text-xs px-2 py-1 rounded-md border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0 ml-2 disabled:opacity-50"
                          >
                            {movingId === p.id ? "..." : "Assigner →"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={closeAssignPanel}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Terminé
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}