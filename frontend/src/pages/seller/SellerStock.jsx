import { useEffect, useState } from 'react';
import { sellersApi } from '../../api/sellers.api';

export default function SellerStock() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadStock();
  }, []);
  
  const loadStock = async () => {
    try {
      const { data } = await sellersApi.getStock();
      setStock(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div className="text-stone-500">Chargement...</div>;
  
  const statusCounts = {
    OK: stock.filter(p => p.status === 'OK').length,
    LOW_STOCK: stock.filter(p => p.status === 'LOW_STOCK').length,
    OUT_OF_STOCK: stock.filter(p => p.status === 'OUT_OF_STOCK').length,
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">État du Stock</h1>
        <p className="text-stone-500 mt-1">Surveillez vos niveaux de stock en temps réel</p>
      </div>
      
      {/* Résumé rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="OK" value={statusCounts.OK} icon="✅" color="green" />
        <StatCard title="Stock bas" value={statusCounts.LOW_STOCK} icon="⚠️" color="yellow" />
        <StatCard title="Rupture" value={statusCounts.OUT_OF_STOCK} icon="❌" color="red" />
      </div>
      
      {/* Liste détaillée */}
      {stock.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <p className="text-lg">Aucun produit pour le moment</p>
          <p className="text-sm mt-2">Ajoutez des produits pour voir leur état de stock</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stock.map((product) => (
            <StockCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function StockCard({ product }) {
  const statusColors = {
    OK: 'bg-green-100 text-green-700',
    LOW_STOCK: 'bg-yellow-100 text-yellow-700',
    OUT_OF_STOCK: 'bg-red-100 text-red-700',
  };
  
  const statusLabels = {
    OK: 'OK',
    LOW_STOCK: 'Stock bas',
    OUT_OF_STOCK: 'Rupture',
  };
  
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 flex gap-4">
      {product.mainImage && (
        <img 
          src={product.mainImage} 
          alt={product.name}
          className="w-20 h-20 object-cover rounded-lg"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-stone-800">{product.name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[product.status]}`}>
            {statusLabels[product.status]}
          </span>
        </div>
        
        <p className="text-sm text-stone-600 mt-1">
          Stock: <span className="font-medium text-stone-800">{product.stock}</span>
          {product.lowStockAlert > 0 && (
            <span className="text-stone-500 ml-2">(alerte à {product.lowStockAlert})</span>
          )}
        </p>
        
        {product.variants.length > 0 && (
          <div className="mt-2 space-y-1">
            {product.variants.map((variant, idx) => (
              <div key={idx} className="text-xs text-stone-500">
                {variant.size} / {variant.color}: {variant.stock}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color = 'gray' }) {
  const colorClasses = {
    gray: 'bg-stone-100 text-stone-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
  };
  
  return (
    <div className={`${colorClasses[color]} rounded-xl p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
