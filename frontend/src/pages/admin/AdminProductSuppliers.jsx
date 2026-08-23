import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Network, Search, ChevronDown, ChevronUp, X, Check,
  Truck, Layers, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { productSuppliersApi } from '../../api/product-suppliers.api';
import { accountingApi } from '../../api/accounting.api';
import { categoriesApi } from '../../api/categories.api';

const BULK_MODES = [
  { value: 'add',     label: 'Ajouter aux produits sélectionnés' },
  { value: 'remove',  label: 'Retirer des produits sélectionnés' },
  { value: 'replace', label: 'Remplacer les fournisseurs (vide = aucun)' },
];

function SupplierPicker({ suppliers, selectedIds, onToggle, disabled }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-gray-300 text-xs text-gray-600 hover:border-gray-400 hover:text-gray-800 disabled:opacity-50"
      >
        <Truck size={12} />
        Lier un fournisseur
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-64 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {suppliers.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-500">Aucun fournisseur actif.</p>
            ) : suppliers.map((supplier) => {
              const checked = selectedIds.includes(supplier.id);
              return (
                <button
                  key={supplier.id}
                  type="button"
                  onClick={() => onToggle(supplier.id)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  <span className="truncate">
                    {supplier.name}
                    {supplier.phone && <span className="block text-[11px] text-gray-400">{supplier.phone}</span>}
                  </span>
                  {checked && <Check size={14} className="text-emerald-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ProductRow({ product, suppliers, selected, onSelect, onChangeSuppliers, saving }) {
  const linkedIds = product.suppliers.map((s) => s.id);

  const toggleSupplier = (supplierId) => {
    const next = linkedIds.includes(supplierId)
      ? linkedIds.filter((id) => id !== supplierId)
      : [...linkedIds, supplierId];
    onChangeSuppliers(product.id, next);
  };

  return (
    <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(product.id)}
          className="mt-1 h-4 w-4 rounded border-gray-300"
        />
        <div>
          <p className="text-sm font-medium text-gray-900">{product.name}</p>
          <p className="text-xs text-gray-400">
            {product.isActive ? 'Actif' : 'Inactif'} · stock {product.stock}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {product.suppliers.length === 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700">
            <AlertTriangle size={12} />
            Aucun fournisseur
          </span>
        )}
        {product.suppliers.map((supplier) => (
          <span
            key={supplier.id}
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
            title={supplier.phone || ''}
          >
            {supplier.name}
            <button
              type="button"
              disabled={saving}
              onClick={() => toggleSupplier(supplier.id)}
              className="text-gray-400 hover:text-red-500 disabled:opacity-50"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <SupplierPicker
          suppliers={suppliers}
          selectedIds={linkedIds}
          onToggle={toggleSupplier}
          disabled={saving}
        />
      </div>
    </div>
  );
}

export default function AdminProductSuppliers() {
  const qc = useQueryClient();
  const [search, setSearch]             = useState('');
  const [categoryId, setCategoryId]     = useState('');
  const [supplierId, setSupplierId]     = useState('');
  const [unassigned, setUnassigned]     = useState(false);
  const [collapsed, setCollapsed]       = useState({});
  const [selectedIds, setSelectedIds]   = useState([]);
  const [bulkMode, setBulkMode]         = useState('add');
  const [bulkSuppliers, setBulkSuppliers] = useState([]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['product-suppliers', search, categoryId, supplierId, unassigned],
    queryFn: () =>
      productSuppliersApi
        .getProducts({
          search: search || undefined,
          categoryId: categoryId || undefined,
          supplierId: supplierId || undefined,
          unassigned: unassigned ? 'true' : undefined,
        })
        .then((r) => r.data),
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers-active'],
    queryFn: () => accountingApi.getSuppliers().then((r) => r.data),
  });

  const { data: categoriesRaw = [] } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => categoriesApi.getAll().then((r) => (Array.isArray(r.data) ? r.data : r.data?.data || [])),
  });

  const setSuppliersMutation = useMutation({
    mutationFn: ({ productId, supplierIds }) => productSuppliersApi.setSuppliers(productId, supplierIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-suppliers'] });
      toast.success('Fournisseurs mis à jour');
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Erreur lors de la mise à jour'),
  });

  const bulkMutation = useMutation({
    mutationFn: (data) => productSuppliersApi.bulkUpdate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product-suppliers'] });
      setSelectedIds([]);
      setBulkSuppliers([]);
      toast.success('Association de masse appliquée');
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Erreur lors de l’application'),
  });

  const grouped = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      const key = product.category?.id || 'none';
      if (!map.has(key)) {
        map.set(key, { id: key, name: product.category?.name || 'Sans catégorie', products: [] });
      }
      map.get(key).products.push(product);
    });
    return [...map.values()];
  }, [products]);

  const withoutSupplier = products.filter((p) => p.suppliers.length === 0).length;

  const toggleProductSelection = (productId) => {
    setSelectedIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]);
  };

  const toggleCategorySelection = (categoryProducts) => {
    const ids = categoryProducts.map((p) => p.id);
    const allSelected = ids.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSelected ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  };

  const applyBulk = () => {
    if (selectedIds.length === 0) return toast.error('Sélectionnez au moins un produit');
    if (bulkMode !== 'replace' && bulkSuppliers.length === 0) {
      return toast.error('Sélectionnez au moins un fournisseur');
    }
    bulkMutation.mutate({ productIds: selectedIds, supplierIds: bulkSuppliers, mode: bulkMode });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Network size={20} />
          Produits ↔ Fournisseurs
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Reliez chaque produit à zéro, un ou plusieurs fournisseurs. Ces informations restent internes :
          elles n’apparaissent jamais sur la boutique ni dans les emails clients.
        </p>
      </div>

      <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit…"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm"
          />
        </div>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Toutes les catégories</option>
          {categoriesRaw.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>

        <select
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Tous les fournisseurs</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={unassigned}
            onChange={(e) => setUnassigned(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Sans fournisseur uniquement
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <span className="inline-flex items-center gap-1"><Layers size={14} /> {products.length} produit(s)</span>
        <span className="inline-flex items-center gap-1 text-amber-700">
          <AlertTriangle size={14} /> {withoutSupplier} sans fournisseur
        </span>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-900/10 bg-gray-900 p-4 text-white">
          <span className="text-sm font-medium">{selectedIds.length} produit(s) sélectionné(s)</span>

          <select
            value={bulkMode}
            onChange={(e) => setBulkMode(e.target.value)}
            className="rounded-lg border border-white/20 bg-gray-800 px-3 py-2 text-sm"
          >
            {BULK_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>{mode.label}</option>
            ))}
          </select>

          <select
            multiple
            value={bulkSuppliers}
            onChange={(e) => setBulkSuppliers([...e.target.selectedOptions].map((o) => o.value))}
            className="min-w-[200px] rounded-lg border border-white/20 bg-gray-800 px-3 py-2 text-sm"
          >
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={applyBulk}
            disabled={bulkMutation.isPending}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 disabled:opacity-60"
          >
            Appliquer
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-sm text-white/70 hover:text-white"
          >
            Annuler la sélection
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">Chargement…</p>
      ) : grouped.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun produit ne correspond aux filtres.</p>
      ) : grouped.map((category) => {
        const isCollapsed = collapsed[category.id];
        return (
          <div key={category.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between gap-3 bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={category.products.every((p) => selectedIds.includes(p.id))}
                  onChange={() => toggleCategorySelection(category.products)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <h2 className="text-sm font-semibold text-gray-900">{category.name}</h2>
                <span className="text-xs text-gray-500">{category.products.length} produit(s)</span>
              </div>
              <button
                type="button"
                onClick={() => setCollapsed((prev) => ({ ...prev, [category.id]: !prev[category.id] }))}
                className="text-gray-400 hover:text-gray-700"
              >
                {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>

            {!isCollapsed && category.products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                suppliers={suppliers}
                selected={selectedIds.includes(product.id)}
                onSelect={toggleProductSelection}
                saving={setSuppliersMutation.isPending}
                onChangeSuppliers={(productId, supplierIds) =>
                  setSuppliersMutation.mutate({ productId, supplierIds })}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
