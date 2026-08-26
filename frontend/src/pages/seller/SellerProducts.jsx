import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sellersApi } from '../../api/sellers.api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const STATUS_LABELS = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
  OUT_OF_STOCK: 'Rupture de stock'
};

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  OUT_OF_STOCK: 'bg-red-100 text-red-700'
};

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadProducts();
  }, [statusFilter]);

  const loadProducts = async () => {
    try {
      const { data } = await sellersApi.getProducts(statusFilter ? { status: statusFilter } : {});
      setProducts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;

    try {
      await sellersApi.deleteProduct(id);
      loadProducts();
    } catch (err) {
      alert('Erreur de suppression');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await sellersApi.updateProduct(id, { status: newStatus });
      loadProducts();
    } catch (err) {
      alert('Erreur lors du changement de statut');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-stone-400">
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Mes produits</h1>
          <p className="text-sm sm:text-base text-stone-500 mt-1">Gérez votre catalogue de produits</p>
        </div>
        <Link
          to="/seller/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium"
        >
          <Plus size={18} />
          Nouveau produit
        </Link>
      </div>

      {/* Filtre par statut */}
      <div className="flex items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="">Tous les statuts</option>
          <option value="DRAFT">Brouillons</option>
          <option value="PUBLISHED">Publiés</option>
          <option value="OUT_OF_STOCK">Rupture de stock</option>
        </select>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <p className="text-base sm:text-lg">Aucun produit pour le moment</p>
          <p className="text-sm mt-2">Commencez par ajouter votre premier produit</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onDelete, onStatusChange }) {
  const mainImage = product.images.find(img => img.isMain) || product.images[0];

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4">
      <div className="flex gap-4 sm:contents">
        {mainImage && (
          <img
            src={mainImage.url}
            alt={product.name}
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg shrink-0"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-stone-800 truncate">{product.name}</h3>
              <p className="text-sm text-stone-500 truncate">{product.category?.name}</p>
            </div>
            <span className={`shrink-0 px-2 py-1 text-xs rounded ${STATUS_COLORS[product.status] || 'bg-gray-100 text-gray-700'}`}>
              {STATUS_LABELS[product.status] || product.status}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="font-medium text-stone-800">
              {new Intl.NumberFormat('fr-FR').format(product.price)} FCFA
            </span>
            <span className="text-stone-500">Stock : {product.stock}</span>
            <span className="text-stone-500">
              Commandé {product._count.orderItems} fois
            </span>
          </div>

          {!product.isActive && (
            <span className="inline-block mt-2 px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded">
              Inactif
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-row sm:flex-col gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
        <Link
          to={`/seller/products/${product.id}/edit`}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors whitespace-nowrap"
        >
          <Pencil size={14} />
          Modifier
        </Link>

        {product.status === 'DRAFT' && (
          <button
            onClick={() => onStatusChange(product.id, 'PUBLISHED')}
            className="flex-1 sm:flex-none px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
          >
            Publier
          </button>
        )}
        {product.status === 'PUBLISHED' && (
          <button
            onClick={() => onStatusChange(product.id, 'DRAFT')}
            className="flex-1 sm:flex-none px-3 py-1.5 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors whitespace-nowrap"
          >
            Mettre en brouillon
          </button>
        )}

        <button
          onClick={() => onDelete(product.id)}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
        >
          <Trash2 size={14} />
          Supprimer
        </button>
      </div>
    </div>
  );
}
