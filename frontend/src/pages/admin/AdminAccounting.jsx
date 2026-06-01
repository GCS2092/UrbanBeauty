// frontend/src/pages/admin/AdminAccounting.jsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { toast } from 'sonner';
import { accountingApi } from '../../api/accounting.api';

// ─── Utilitaires ───────────────────────────────────────────────
const fmt = (amount) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(
    (amount || 0) / 100
  );

const pct = (v) => `${v ?? '—'}%`;

const EXPENSE_CATEGORIES = [
  { value: 'STOCK_PURCHASE', label: 'Achat stock' },
  { value: 'SHIPPING', label: 'Livraison / transport' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'PACKAGING', label: 'Emballages' },
  { value: 'SALARY', label: 'Salaires' },
  { value: 'RENT', label: 'Loyer' },
  { value: 'UTILITIES', label: 'Charges (eau, élec…)' },
  { value: 'OTHER', label: 'Autres' },
];

const MOVEMENT_TYPES = [
  { value: 'IN', label: 'Entrée stock', color: 'text-green-600' },
  { value: 'OUT_SALE', label: 'Vente', color: 'text-blue-600' },
  { value: 'OUT_LOSS', label: 'Perte / casse', color: 'text-red-600' },
  { value: 'OUT_RETURN', label: 'Retour fournisseur', color: 'text-orange-600' },
  { value: 'ADJUSTMENT', label: 'Ajustement', color: 'text-purple-600' },
  { value: 'RETURN_IN', label: 'Retour client', color: 'text-teal-600' },
];

const PIE_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6'];

// ─── Composants UI ─────────────────────────────────────────────
function KpiCard({ label, value, sub, color = 'gray', icon }) {
  const colors = {
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</span>
        {icon && <span className="text-lg opacity-60">{icon}</span>}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs mt-1 opacity-70">{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      {action}
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Page principale ────────────────────────────────────────────
export default function AdminAccounting() {
  const [tab, setTab] = useState('dashboard');
  const [period, setPeriod] = useState('month');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

  const qc = useQueryClient();

  // ── Queries
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['accounting-dashboard', period, year, month],
    queryFn: () => accountingApi.getDashboard({ period, year, month }).then((r) => r.data),
  });

  const { data: expenses } = useQuery({
    queryKey: ['accounting-expenses'],
    queryFn: () => accountingApi.getExpenses({ limit: 50 }).then((r) => r.data),
    enabled: tab === 'expenses',
  });

  const { data: stockMovements } = useQuery({
    queryKey: ['accounting-stock'],
    queryFn: () => accountingApi.getStockMovements({ limit: 50 }).then((r) => r.data),
    enabled: tab === 'stock',
  });

  const { data: margins } = useQuery({
    queryKey: ['accounting-margins'],
    queryFn: () => accountingApi.getProductMargins().then((r) => r.data),
    enabled: tab === 'margins',
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => accountingApi.getSuppliers().then((r) => r.data),
  });

  // ── Mutations
  const createExpenseMutation = useMutation({
    mutationFn: accountingApi.createExpense,
    onSuccess: () => {
      toast.success('Dépense enregistrée');
      qc.invalidateQueries(['accounting-expenses', 'accounting-dashboard']);
      setShowExpenseModal(false);
    },
    onError: () => toast.error('Erreur lors de l\'enregistrement'),
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: accountingApi.deleteExpense,
    onSuccess: () => {
      toast.success('Dépense supprimée');
      qc.invalidateQueries(['accounting-expenses', 'accounting-dashboard']);
    },
  });

  const createStockMutation = useMutation({
    mutationFn: accountingApi.createStockMovement,
    onSuccess: () => {
      toast.success('Mouvement de stock enregistré');
      qc.invalidateQueries(['accounting-stock', 'accounting-dashboard']);
      setShowStockModal(false);
    },
    onError: () => toast.error('Erreur lors de l\'enregistrement'),
  });

  // ── Handlers
  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      category: fd.get('category'),
      label: fd.get('label'),
      amount: Math.round(parseFloat(fd.get('amount')) * 100), // convertir en centimes
      date: fd.get('date'),
      supplierId: fd.get('supplierId') || null,
      reference: fd.get('reference') || null,
      notes: fd.get('notes') || null,
    };
    createExpenseMutation.mutate(data);
  };

  const handleStockSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const unitCostRaw = fd.get('unitCost');
    const data = {
      productId: fd.get('productId'),
      type: fd.get('type'),
      quantity: parseInt(fd.get('quantity'), 10),
      unitCost: unitCostRaw ? Math.round(parseFloat(unitCostRaw) * 100) : null,
      reason: fd.get('reason') || null,
      supplierId: fd.get('supplierId') || null,
      reference: fd.get('reference') || null,
    };
    createStockMutation.mutate(data);
  };

  const tabs = [
    { id: 'dashboard', label: '📊 Tableau de bord' },
    { id: 'expenses', label: '💸 Dépenses' },
    { id: 'stock', label: '📦 Stock' },
    { id: 'margins', label: '📈 Marges produits' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comptabilité</h1>
          <p className="text-sm text-gray-500 mt-0.5">Suivi financier, stock et bénéfices</p>
        </div>
        {/* Filtres période */}
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-white"
          >
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
            <option value="all">Tout</option>
          </select>
          {period === 'month' && (
            <>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="text-sm border rounded-lg px-3 py-1.5 bg-white"
              >
                {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'].map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="text-sm border rounded-lg px-3 py-1.5 bg-white"
              >
                {[2023, 2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: DASHBOARD ─────────────────────────── */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-20 text-gray-400">Chargement…</div>
          ) : dashboard ? (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Chiffre d'affaires" value={fmt(dashboard.revenue)} color="blue" icon="💰"
                  sub={`${dashboard.orderCount} commandes`} />
                <KpiCard label="Bénéfice brut" value={fmt(dashboard.grossProfit)}
                  color={dashboard.grossProfit >= 0 ? 'green' : 'red'} icon="📈"
                  sub={`Marge ${pct(dashboard.grossMargin)}`} />
                <KpiCard label="Dépenses" value={fmt(dashboard.expenses)} color="amber" icon="💸" />
                <KpiCard label="Bénéfice net" value={fmt(dashboard.netProfit)}
                  color={dashboard.netProfit >= 0 ? 'green' : 'red'} icon="✅"
                  sub="Après toutes dépenses" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <KpiCard label="Valeur stock (achat)" value={fmt(dashboard.stockValue)} color="purple" icon="📦"
                  sub={`Vente potentielle : ${fmt(dashboard.stockRetailValue)}`} />
                <KpiCard label="Marge potentielle stock" value={pct(dashboard.stockMargin)} color="teal" icon="📊" />
                <KpiCard label="Panier moyen" value={fmt(dashboard.avgOrderValue)} color="gray" icon="🛒" />
              </div>

              {/* Graphique CA 6 mois */}
              {dashboard.revenueChart && (
                <div className="bg-white rounded-xl border p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Évolution CA — 6 derniers mois</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={dashboard.revenueChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => fmt(v)} />
                      <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Dépenses par catégorie */}
              {dashboard.expensesByCategory?.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Dépenses par catégorie</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={dashboard.expensesByCategory.map((d) => ({
                            name: EXPENSE_CATEGORIES.find((c) => c.value === d.category)?.label || d.category,
                            value: d._sum.amount,
                          }))}
                          cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                          dataKey="value" nameKey="name"
                        >
                          {dashboard.expensesByCategory.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => fmt(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Alertes stock bas */}
                  <div className="bg-white rounded-xl border p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">⚠️ Alertes stock bas</h3>
                    {dashboard.lowStockProducts?.length === 0 ? (
                      <p className="text-sm text-gray-400">Aucune alerte</p>
                    ) : (
                      <div className="space-y-2">
                        {dashboard.lowStockProducts?.map((p) => (
                          <div key={p.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 truncate">{p.name}</span>
                            <span className={`font-semibold ml-2 ${p.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                              {p.stock === 0 ? 'Rupture' : `${p.stock} restants`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Résumé comptable */}
              <div className="bg-gray-50 rounded-xl border p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Résumé comptable de la période</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Chiffre d\'affaires (CA)', value: fmt(dashboard.revenue), class: 'text-gray-800' },
                    { label: '— Coût des marchandises vendues (CMV)', value: `- ${fmt(dashboard.cogs)}`, class: 'text-red-600' },
                    { label: '= Bénéfice brut', value: fmt(dashboard.grossProfit), class: 'font-semibold text-gray-800 border-t pt-1' },
                    { label: '— Dépenses opérationnelles', value: `- ${fmt(dashboard.expenses)}`, class: 'text-red-600' },
                    { label: '= Bénéfice net', value: fmt(dashboard.netProfit), class: `font-bold text-lg border-t pt-1 ${dashboard.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}` },
                  ].map((row, i) => (
                    <div key={i} className={`flex justify-between ${row.class}`}>
                      <span>{row.label}</span>
                      <span>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ── TAB: DÉPENSES ─────────────────────────── */}
      {tab === 'expenses' && (
        <div>
          <SectionHeader
            title="Dépenses"
            action={
              <button onClick={() => setShowExpenseModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                + Ajouter une dépense
              </button>
            }
          />
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  {['Date', 'Catégorie', 'Libellé', 'Fournisseur', 'Référence', 'Montant', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses?.expenses?.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{new Date(exp.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                        {EXPENSE_CATEGORIES.find((c) => c.value === exp.category)?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{exp.label}</td>
                    <td className="px-4 py-3 text-gray-500">{exp.supplier?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{exp.reference || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-red-600">{fmt(exp.amount)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteExpenseMutation.mutate(exp.id)}
                        className="text-gray-400 hover:text-red-500 text-xs">Supprimer</button>
                    </td>
                  </tr>
                ))}
                {!expenses?.expenses?.length && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Aucune dépense enregistrée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: STOCK ────────────────────────────── */}
      {tab === 'stock' && (
        <div>
          <SectionHeader
            title="Mouvements de stock"
            action={
              <button onClick={() => setShowStockModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                + Enregistrer un mouvement
              </button>
            }
          />
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  {['Date', 'Produit', 'Type', 'Quantité', 'Coût unitaire', 'Coût total', 'Motif'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stockMovements?.movements?.map((m) => {
                  const typeInfo = MOVEMENT_TYPES.find((t) => t.value === m.type);
                  const isIn = ['IN', 'RETURN_IN', 'ADJUSTMENT'].includes(m.type);
                  return (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{new Date(m.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3 text-gray-800 font-medium">{m.product?.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${typeInfo?.color}`}>{typeInfo?.label}</span>
                      </td>
                      <td className={`px-4 py-3 font-semibold ${isIn ? 'text-green-600' : 'text-red-600'}`}>
                        {isIn ? '+' : '-'}{m.quantity}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{m.unitCost ? fmt(m.unitCost) : '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{m.totalCost ? fmt(m.totalCost) : '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{m.reason || '—'}</td>
                    </tr>
                  );
                })}
                {!stockMovements?.movements?.length && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Aucun mouvement enregistré</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: MARGES ───────────────────────────── */}
      {tab === 'margins' && (
        <div>
          <SectionHeader title="Marges par produit" />
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  {['Produit', 'Catégorie', 'Prix vente', 'Prix achat', 'Stock', 'Valeur stock', 'Vendus', 'CA généré', 'Bén. brut', 'Marge'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {margins?.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800 font-medium max-w-[160px] truncate">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.category}</td>
                    <td className="px-4 py-3 text-gray-700">{fmt(p.price)}</td>
                    <td className="px-4 py-3 text-gray-500">{p.purchasePrice ? fmt(p.purchasePrice) : <span className="text-orange-400">Non défini</span>}</td>
                    <td className={`px-4 py-3 font-medium ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                      {p.stock}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{fmt(p.stockValue)}</td>
                    <td className="px-4 py-3 text-gray-600">{p.totalSold}</td>
                    <td className="px-4 py-3 text-gray-700">{fmt(p.totalRevenue)}</td>
                    <td className={`px-4 py-3 font-medium ${p.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {fmt(p.grossProfit)}
                    </td>
                    <td className="px-4 py-3">
                      {p.margin !== null ? (
                        <span className={`text-sm font-bold ${p.margin >= 30 ? 'text-green-600' : p.margin >= 10 ? 'text-amber-500' : 'text-red-500'}`}>
                          {p.margin}%
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
                {!margins?.length && (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">Aucun produit</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: Ajouter dépense ──────────────── */}
      <Modal open={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Enregistrer une dépense">
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
            <select name="category" required className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Sélectionner…</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Libellé *</label>
            <input name="label" required placeholder="Ex: Achat crèmes L'Oréal" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA) *</label>
              <input name="amount" type="number" min="0" step="1" required placeholder="0"
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
              <select name="supplierId" className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Aucun</option>
                {suppliers?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° facture</label>
              <input name="reference" placeholder="FAC-001" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowExpenseModal(false)}
              className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={createExpenseMutation.isPending}
              className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {createExpenseMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Mouvement de stock ───────────── */}
      <Modal open={showStockModal} onClose={() => setShowStockModal(false)} title="Enregistrer un mouvement de stock">
        <form onSubmit={handleStockSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produit *</label>
            <input name="productId" required placeholder="ID du produit"
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
            <p className="text-xs text-gray-400 mt-1">Copier l'ID depuis la page Produits</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de mouvement *</label>
              <select name="type" required className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Sélectionner…</option>
                {MOVEMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
              <input name="quantity" type="number" min="1" required className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix d'achat unitaire (FCFA)</label>
              <input name="unitCost" type="number" min="0" step="1" placeholder="Pour les entrées stock"
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
              <select name="supplierId" className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Aucun</option>
                {suppliers?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° facture / référence</label>
              <input name="reference" placeholder="FAC-001" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
              <input name="reason" placeholder="Ex: Réapprovisionnement mensuel"
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowStockModal(false)}
              className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={createStockMutation.isPending}
              className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {createStockMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}