import { useEffect, useState } from 'react';
import { sellersApi } from '../../api/sellers.api';
import { formatPrice } from '../../utils/formatPrice';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wallet,
  Clock,
} from 'lucide-react';

export default function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await sellersApi.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-stone-400">
        Chargement...
      </div>
    );
  }
  if (!stats) return <div className="text-red-500">Erreur de chargement</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Dashboard Vendeur</h1>
        <p className="text-sm sm:text-base text-stone-500 mt-1">Vue d'ensemble de vos produits et performances</p>
      </div>

      {/* Vue d'ensemble produits */}
      <section>
        <h2 className="text-base sm:text-lg font-semibold text-stone-800 mb-3 sm:mb-4">Mes Produits</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Total produits" value={stats.overview.totalProducts} Icon={Package} color="gray" />
          <StatCard title="Actifs" value={stats.overview.activeProducts} Icon={CheckCircle2} color="green" />
          <StatCard title="Stock bas" value={stats.overview.lowStockProducts} Icon={AlertTriangle} color="yellow" />
          <StatCard title="Rupture" value={stats.overview.outOfStockProducts} Icon={XCircle} color="red" />
        </div>
      </section>

      {/* Vue d'ensemble chiffre d'affaires */}
      <section>
        <h2 className="text-base sm:text-lg font-semibold text-stone-800 mb-3 sm:mb-4">Chiffre d'Affaires</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <StatCard
            title="CA Total"
            value={formatPrice(stats.revenue.total)}
            Icon={Wallet}
            color="blue"
          />
          <StatCard
            title="CA En attente"
            value={formatPrice(stats.revenue.pending)}
            Icon={Clock}
            color="yellow"
          />
        </div>
      </section>

      {/* Top produits */}
      {stats.topProducts.length > 0 && (
        <section>
          <h2 className="text-base sm:text-lg font-semibold text-stone-800 mb-3 sm:mb-4">Top Produits</h2>

          {/* Vue tableau (sm et plus) */}
          <div className="hidden sm:block bg-white rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">Produit</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-stone-600">Ventes</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-stone-600">CA</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-stone-600">Stock</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((product, idx) => (
                  <tr key={product.productId} className="border-t border-stone-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-stone-300">#{idx + 1}</span>
                        <span className="font-medium text-stone-800">{product.productName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-stone-600">{product.sales}</td>
                    <td className="px-4 py-3 text-right font-medium text-stone-800">
                      {formatPrice(product.revenue)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={product.stock <= 5 ? 'text-red-600 font-medium' : 'text-stone-600'}>
                        {product.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vue cartes (mobile) */}
          <div className="sm:hidden space-y-2">
            {stats.topProducts.map((product, idx) => (
              <div
                key={product.productId}
                className="bg-white rounded-xl border border-stone-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="text-base font-bold text-stone-300 shrink-0">#{idx + 1}</span>
                    <span className="font-medium text-stone-800 truncate">{product.productName}</span>
                  </div>
                  <span
                    className={`text-xs font-medium shrink-0 ${
                      product.stock <= 5 ? 'text-red-600' : 'text-stone-500'
                    }`}
                  >
                    {product.stock} en stock
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100 text-sm">
                  <span className="text-stone-500">{product.sales} ventes</span>
                  <span className="font-semibold text-stone-800">{formatPrice(product.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {stats.topProducts.length === 0 && (
        <div className="text-center py-12 text-stone-400">
          <p className="text-base sm:text-lg">Aucun produit pour le moment</p>
          <p className="text-sm mt-2">Commencez par ajouter vos premiers produits</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, Icon, color = 'gray' }) {
  const colorClasses = {
    gray: 'bg-stone-100 text-stone-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl p-4 sm:p-6`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium opacity-80 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold mt-1">{value}</p>
        </div>
        <Icon size={26} strokeWidth={1.75} className="shrink-0 opacity-80" />
      </div>
    </div>
  );
}
