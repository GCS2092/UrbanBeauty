import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';

const API_URL = 'http://localhost:5000';
const formatPrice = (p) => `${Number(p).toLocaleString('fr-FR')} FCFA`;

export default function AdminProducts() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const emptyForm = { name: '', slug: '', description: '', price: '', comparePrice: '', stock: '', categoryId: '', isActive: true, isFeatured: false, imageUrl: '' };
  const [form, setForm] = useState(emptyForm);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3500); };

  const slugify = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch(`${API_URL}/api/products?limit=100`),
        fetch(`${API_URL}/api/categories`),
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      setProducts(Array.isArray(pData) ? pData : pData.data || []);
      setCategories(Array.isArray(cData) ? cData : cData.data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setForm(emptyForm); setSelected(null); setModal('create'); };
  const openEdit = (p) => {
    setForm({
      name: p.name, slug: p.slug, description: p.description || '',
      price: p.price, comparePrice: p.comparePrice || '',
      stock: p.stock, categoryId: p.categoryId || '',
      isActive: p.isActive ?? true, isFeatured: p.isFeatured ?? false,
      imageUrl: p.images?.find(i => i.isMain)?.url || p.images?.[0]?.url || '',
    });
    setSelected(p); setModal('edit');
  };
  const openDelete = (p) => { setSelected(p); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' ? { slug: slugify(value) } : {}),
    }));
  };

  const buildBody = () => ({
    name: form.name,
    slug: form.slug,
    description: form.description,
    price: Number(form.price),
    comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
    stock: Number(form.stock),
    ...(form.categoryId && { categoryId: form.categoryId }), // ✅ omis si vide
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    ...(form.imageUrl ? { images: [{ url: form.imageUrl, isMain: true, position: 0 }] } : {}),
  });

  const handleCreate = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/products`, { method: 'POST', headers, body: JSON.stringify(buildBody()) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Erreur'); }
      await fetchAll(); closeModal(); showToast('Produit créé');
    } catch (e) { showToast(e.message, 'error'); } finally { setSubmitting(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${selected.id}`, { method: 'PUT', headers, body: JSON.stringify(buildBody()) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Erreur'); }
      await fetchAll(); closeModal(); showToast('Produit modifié');
    } catch (e) { showToast(e.message, 'error'); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${selected.id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Erreur suppression');
      await fetchAll(); closeModal(); showToast('Produit supprimé');
    } catch (e) { showToast(e.message, 'error'); } finally { setSubmitting(false); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-gray-400 transition';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} produit{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          <span className="text-lg leading-none">+</span> Nouveau produit
        </button>
      </div>

      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..."
          className="w-full max-w-sm border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 bg-white" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">
          {error} — <button onClick={fetchAll} className="underline font-medium">Réessayer</button>
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
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">🛍️</div>
            <p className="font-medium">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3">Produit</th>
                  <th className="px-6 py-3">Catégorie</th>
                  <th className="px-6 py-3">Prix</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => {
                  const mainImage = p.images?.find(i => i.isMain)?.url || p.images?.[0]?.url;
                  const cat = categories.find(c => c.id === p.categoryId);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {mainImage ? (
                            <img src={mainImage} alt={p.name} className="h-10 w-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">N/A</div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{p.name}</div>
                            <div className="text-xs text-gray-400 font-mono">{p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{cat?.name || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{formatPrice(p.price)}</div>
                        {p.comparePrice && <div className="text-xs text-gray-400 line-through">{formatPrice(p.comparePrice)}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${p.stock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>{p.stock}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {p.isActive ? 'Actif' : 'Inactif'}
                          </span>
                          {p.isFeatured && <span className="px-2 py-0.5 rounded-full text-xs font-medium w-fit bg-amber-100 text-amber-700">Vedette</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(p)} className="text-xs px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors font-medium">Modifier</button>
                          <button onClick={() => openDelete(p)} className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium">Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{modal === 'create' ? 'Nouveau produit' : 'Modifier le produit'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <form onSubmit={modal === 'create' ? handleCreate : handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="Robe Wax Élégante" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input name="slug" value={form.slug} onChange={handleChange} placeholder="robe-wax-elegante" className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Description du produit..." className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA) <span className="text-red-500">*</span></label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" placeholder="25000" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix barré (FCFA)</label>
                  <input type="number" name="comparePrice" value={form.comparePrice} onChange={handleChange} min="0" placeholder="35000" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock <span className="text-red-500">*</span></label>
                  <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0" placeholder="20" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select name="categoryId" value={form.categoryId} onChange={handleChange} className={inputClass}>
                    <option value="">— Aucune —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image principale</label>
                <input type="url" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" className={inputClass} />
                {form.imageUrl && <img src={form.imageUrl} alt="preview" className="mt-2 h-16 w-16 rounded-lg object-cover border border-gray-200" onError={e => e.target.style.display = 'none'} />}
              </div>
              <div className="flex items-center justify-between py-1">
                <label className="text-sm font-medium text-gray-700">Produit actif</label>
                <button type="button" onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between py-1">
                <label className="text-sm font-medium text-gray-700">Produit en vedette</label>
                <button type="button" onClick={() => setForm(p => ({ ...p, isFeatured: !p.isFeatured }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isFeatured ? 'bg-amber-400' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 border border-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-black text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60">
                  {submitting ? 'En cours...' : modal === 'create' ? 'Créer' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'delete' && selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🗑️</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Supprimer le produit ?</h2>
            <p className="text-sm text-gray-500 mb-6"><span className="font-medium text-gray-700">"{selected.name}"</span> sera supprimé définitivement.</p>
            <div className="flex gap-3">
              <button onClick={closeModal} className="flex-1 border border-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition-colors">Annuler</button>
              <button onClick={handleDelete} disabled={submitting} className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60">
                {submitting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}