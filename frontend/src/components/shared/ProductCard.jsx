import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import { toast } from 'sonner';

export default function ProductCard({ product }) {
  const { user, isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();

  const mainImage = product.images?.find((i) => i.isMain) || product.images?.[0];
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      await addItem(user?.id, { productId: product.id, quantity: 1 });
      toast.success('Ajouté au panier !');
    } catch {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-md transition-all duration-300">

        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-stone-50">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">???</div>
          )}

          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{Math.round((1 - product.price / product.comparePrice) * 100)}%
            </span>
          )}

          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow hover:bg-rose-500 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
          >
            <ShoppingBag size={16} />
          </button>
        </div>

        {/* Infos */}
        <div className="p-3">
          <p className="text-xs text-stone-400 mb-0.5">{product.category?.name}</p>
          <h3 className="text-sm font-medium text-stone-800 line-clamp-1 mb-1">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900 text-sm">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
