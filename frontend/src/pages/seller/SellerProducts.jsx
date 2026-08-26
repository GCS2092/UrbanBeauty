import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sellersApi } from '../../api/sellers.api';

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

  if (loading) return <div className="text-stone-500">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Mes produits</h1>
          <p className="text-stone-500 mt-1">Gérez votre catalogue de produits</p>
        </div>
        <Link
          to="/seller/products/new"
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
        >
          + Nouveau produit
        </Link>
      </div>

      {/* Filtre par statut */}
      <div className="flex items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="">Tous les statuts</option>
          <option value="DRAFT">Brouillons</option>
          <option value="PUBLISHED">Publiés</option>
          <option value="OUT_OF_STOCK">Rupture de stock</option>
        </select>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <p className="text-lg">Aucun produit pour le moment</p>
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
    <div className="bg-white border border-stone-200 rounded-xl p-4 flex gap-4">
      {mainImage && (
        <img
          src={mainImage.url}
          alt={product.name}
          className="w-24 h-24 object-cover rounded-lg"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}

      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-stone-800">{product.name}</h3>
            <p className="text-sm text-stone-500">{product.category?.name}</p>
          </div>
          <span className={`px-2 py-1 text-xs rounded ${STATUS_COLORS[product.status] || 'bg-gray-100 text-gray-700'}`}>
            {STATUS_LABELS[product.status] || product.status}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-4 text-sm">
          <span className="font-medium text-stone-800">
            {new Intl.NumberFormat('fr-FR').format(product.price)} FCFA
          </span>
          <span className="text-stone-500">Stock: {product.stock}</span>
          <span className="text-stone-500">
            Commandé: {product._count.orderItems} fois
          </span>
        </div>

        {!product.isActive && (
          <span className="inline-block mt-2 px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded">
            Inactif
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Link
          to={`/seller/products/${product.id}/edit`}
          className="px-3 py-1.5 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
        >
          Modifier
        </Link>

        {/* Actions de statut */}
        {product.status === 'DRAFT' && (
          <button
            onClick={() => onStatusChange(product.id, 'PUBLISHED')}
            className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Publier
          </button>
        )}
        {product.status === 'PUBLISHED' && (
          <button
            onClick={() => onStatusChange(product.id, 'DRAFT')}
            className="px-3 py-1.5 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Mettre en brouillon
          </button>
        )}

        <button
          onClick={() => onDelete(product.id)}
          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
