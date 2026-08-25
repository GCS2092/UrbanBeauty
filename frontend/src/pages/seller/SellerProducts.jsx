import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sellersApi } from '../../api/sellers.api';
import { productsApi } from '../../api/products.api';

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadProducts();
  }, []);
  
  const loadProducts = async () => {
    try {
      const { data } = await sellersApi.getProducts();
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
      await productsApi.delete(id);
      loadProducts();
    } catch (err) {
      alert('Erreur de suppression');
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
          to="/admin/products/new"
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
        >
          + Nouveau produit
        </Link>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onDelete }) {
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
        <h3 className="font-semibold text-stone-800">{product.name}</h3>
        <p className="text-sm text-stone-500">{product.category?.name}</p>
        
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
          to={`/admin/products/${product.id}/edit`}
          className="px-3 py-1.5 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
        >
          Modifier
        </Link>
        
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
