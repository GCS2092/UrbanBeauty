import { useState, useMemo } from 'react';
import {
  FileBarChart, Download, Mail, Calendar, TrendingUp, ShoppingBag,
  Users, Package, Wallet, AlertTriangle, Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../api/admin.api';
import StoreFilter from '../../components/admin/StoreFilter';

function toISODate(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function getPresetRange(preset) {
  const now = new Date();
  const today = toISODate(now);

  switch (preset) {
    case 'today':
      return { from: today, to: today };
    case 'week': {
      const day = now.getDay() || 7; // lundi = 1 ... dimanche = 7
      const monday = new Date(now);
      monday.setDate(now.getDate() - day + 1);
      return { from: toISODate(monday), to: today };
    }
    case 'month':
      return { from: today.slice(0, 8) + '01', to: today };
    case 'lastMonth': {
      const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastOfPrevMonth = new Date(firstOfThisMonth - 1);
      const firstOfPrevMonth = new Date(lastOfPrevMonth.getFullYear(), lastOfPrevMonth.getMonth(), 1);
      return { from: toISODate(firstOfPrevMonth), to: toISODate(lastOfPrevMonth) };
    }
    case 'year':
      return { from: `${now.getFullYear()}-01-01`, to: today };
    default:
      return { from: today.slice(0, 8) + '01', to: today };
  }
}

const PRESETS = [
  { key: 'today',     label: "Aujourd'hui" },
  { key: 'week',      label: 'Cette semaine' },
  { key: 'month',     label: 'Ce mois-ci' },
  { key: 'lastMonth', label: 'Mois dernier' },
  { key: 'year',       label: 'Cette année' },
];

const SECTIONS = [
  { icon: TrendingUp,    label: "Chiffre d'affaires & bénéfice estimé", color: 'bg-rose-100 text-rose-600' },
  { icon: ShoppingBag,   label: 'Commandes par statut',                 color: 'bg-violet-100 text-violet-600' },
  { icon: Users,         label: 'Top 5 clients',                        color: 'bg-blue-100 text-blue-600' },
  { icon: Package,       label: 'Top 5 produits vendus',                color: 'bg-emerald-100 text-emerald-600' },
  { icon: AlertTriangle, label: 'État du stock & alertes',              color: 'bg-amber-100 text-amber-600' },
  { icon: Wallet,        label: 'Dépenses par catégorie',               color: 'bg-stone-200 text-stone-600' },
];

export default function AdminReports() {
  const [storeId, setStoreId] = useState('');
  const [activePreset, setActivePreset] = useState('month');
  const [{ from, to }, setRange] = useState(() => getPresetRange('month'));
  const [email, setEmail] = useState('');
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  const periodLabel = useMemo(() => {
    if (!from || !to) return '';
    const fmt = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    return from === to ? fmt(from) : `${fmt(from)} → ${fmt(to)}`;
  }, [from, to]);

  const applyPreset = (key) => {
    setActivePreset(key);
    setRange(getPresetRange(key));
  };

  const handleManualChange = (field) => (value) => {
    setActivePreset(null);
    setRange((r) => ({ ...r, [field]: value }));
  };

  const requireStore = () => {
    if (!storeId) {
      toast.error('Sélectionnez une boutique pour générer le rapport');
      return false;
    }
    return true;
  };

  const handleDownload = async () => {
    if (!requireStore()) return;
    setLoadingPdf(true);
    try {
      await adminApi.downloadReport({ storeId, from, to }, `rapport-${from}-${to}.pdf`);
      toast.success('Rapport téléchargé');
    } catch (e) {
      toast.error(e.message || 'Erreur lors de la génération du rapport');
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleSendEmail = async () => {
    if (!requireStore()) return;
    setLoadingEmail(true);
    try {
      const { data } = await adminApi.sendReportEmail({
        storeId, from, to,
        ...(email && { email }),
      });
      toast.success(data.message || 'Rapport envoyé par email');
    } catch (e) {
      toast.error(e.message || "Erreur lors de l'envoi du rapport");
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-6 lg:p-8">

      <div className="mb-8 pl-12 lg:pl-0">
        <div className="flex items-center gap-2 mb-1">
          <FileBarChart size={16} className="text-rose-500" />
          <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">Pilotage</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Rapports</h1>
        <p className="text-stone-500 text-sm mt-1">
          Téléchargez ou envoyez par email un rapport complet : commandes, clients, stock, produits et comptabilité
        </p>
      </div>

      <div className="max-w-3xl space-y-5">

        {/* Boutique + période */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-stone-700">Boutique</label>
            <StoreFilter value={storeId} onChange={setStoreId} className="w-full sm:w-auto" />
            {!storeId && (
              <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                <Info size={12} /> Une boutique précise doit être sélectionnée
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700 flex items-center gap-1.5">
              <Calendar size={14} /> Période
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => applyPreset(p.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    activePreset === p.key
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-end gap-3 pt-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">Du</label>
                <input
                  type="date"
                  value={from}
                  max={to}
                  onChange={(e) => handleManualChange('from')(e.target.value)}
                  className="text-sm px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">Au</label>
                <input
                  type="date"
                  value={to}
                  min={from}
                  onChange={(e) => handleManualChange('to')(e.target.value)}
                  className="text-sm px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <span className="text-xs text-stone-400 pb-2">{periodLabel}</span>
            </div>
          </div>
        </div>

        {/* Contenu du rapport */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6">
          <h2 className="font-semibold text-stone-900 text-sm mb-4">Ce que contient le rapport</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SECTIONS.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={14} />
                </div>
                <span className="text-sm text-stone-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 space-y-4">
          <h2 className="font-semibold text-stone-900 text-sm">Recevoir le rapport</h2>

          <button
            onClick={handleDownload}
            disabled={loadingPdf}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-semibold transition-colors shadow-sm"
          >
            {loadingPdf
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Génération…</>
              : <><Download size={18} /> Télécharger le PDF</>}
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-stone-100" />
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">ou</span>
            <div className="h-px flex-1 bg-stone-100" />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email destinataire (optionnel — admin par défaut)"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-rose-300 transition-shadow"
            />
            <button
              onClick={handleSendEmail}
              disabled={loadingEmail}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-60 text-stone-700 text-sm font-medium transition-colors whitespace-nowrap"
            >
              {loadingEmail
                ? <><div className="w-3.5 h-3.5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" /> Envoi…</>
                : <><Mail size={14} /> Envoyer par email</>}
            </button>
          </div>

          <p className="text-xs text-stone-400 flex items-start gap-1.5 pt-1">
            <Info size={12} className="mt-0.5 shrink-0" />
            Un rapport mensuel est aussi envoyé automatiquement le 1er de chaque mois à l'email administrateur, pour chaque boutique active.
          </p>
        </div>

      </div>
    </div>
  );
}