import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Heart, Star, ChevronLeft, Minus, Plus } from 'lucide-react';
import { productsApi } from '../../api/products.api';
import { reviewsApi } from '../../api/reviews.api';
import { wishlistApi } from '../../api/wishlist.api';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import { formatPrice } from '../../utils/formatPrice';
import Button from '../../components/ui/Button';
import ReviewCard from '../../components/shared/ReviewCard';
import ReviewForm from '../../components/shared/ReviewForm';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImg, setMainImg] = useState(0);
  const [addingCart, setAddingCart] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getBySlug(slug).then((r) => r.data),
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', product?.id],
    queryFn: () => reviewsApi.getByProduct(product.id).then((r) => r.data),
    enabled: !!product?.id,
  });

  const avgRating = reviews?.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleAddToCart = async () => {
    setAddingCart(true);
    try {
      await addItem(user?.id, {
        productId: product.id,
        variantId: selectedVariant?.id || null,
        quantity,
      });
      toast.success('Ajouté au panier !');
    } catch {
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setAddingCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) return toast.error('Connectez-vous pour ajouter aux favoris');
    try {
      await wishlistApi.add(product.id);
      toast.success('Ajouté aux favoris !');
    } catch {
      toast.error('Déjà dans vos favoris');
    }
  };

  if (isLoading) return (
    <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  );

  if (!product) return (
    <div className="text-center py-24 text-stone-400">Produit introuvable</div>
  );

  const images = product.images?.sort((a, b) => a.position - b.position) || [];
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const sizes = [...new Set(product.variants?.map((v) => v.size))];
  const colors = [...new Set(product.variants?.map((v) => v.color))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-700 mb-6 transition-colors">
        <ChevronLeft size={16} /> Retour à la boutique
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square bg-stone-50 rounded-2xl overflow-hidden">
            {images[mainImg] ? (
              <img src={images[mainImg].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🛍️</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setMainImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    i === mainImg ? 'border-rose-400' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="space-y-5">
          <div>
            <p className="text-sm text-rose-400 font-medium mb-1">{product.category?.name}</p>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">{product.name}</h1>
            {avgRating && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} className={i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'} />
                  ))}
                </div>
                <span className="text-sm text-stone-500">{avgRating} ({reviews.length} avis)</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-stone-900">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-lg text-stone-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
            {hasDiscount && (
              <span className="bg-rose-100 text-rose-600 text-sm font-bold px-2 py-0.5 rounded-full">
                -{Math.round((1 - product.price / product.comparePrice) * 100)}%
              </span>
            )}
          </div>

          <p className="text-stone-500 leading-relaxed">{product.description}</p>

          {/* Variantes taille */}
          {sizes.length > 0 && (
            <div>
              <p className="text-sm font-medium text-stone-700 mb-2">Taille</p>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedVariant(product.variants.find((v) => v.size === size))}
                    className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors ${
                      selectedVariant?.size === size
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'border-stone-200 text-stone-600 hover:border-stone-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantité */}
          <div>
            <p className="text-sm font-medium text-stone-700 mb-2">Quantité</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-semibold text-stone-800">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
              >
                <Plus size={14} />
              </button>
              <span className="text-xs text-stone-400 ml-1">{product.stock} en stock</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              size="lg"
              loading={addingCart}
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              <ShoppingBag size={18} />
              {product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
            </Button>
            <button
              onClick={handleWishlist}
              className="w-12 h-12 rounded-xl border border-stone-200 flex items-center justify-center text-stone-400 hover:text-rose-500 hover:border-rose-200 transition-colors"
            >
              <Heart size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Avis */}
      <div className="border-t border-stone-100 pt-10">
        <h2 className="text-2xl font-bold text-stone-800 mb-6">
          Avis clients {reviews?.length ? `(${reviews.length})` : ''}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {reviews?.length ? (
              reviews.map((r) => <ReviewCard key={r.id} review={r} />)
            ) : (
              <p className="text-stone-400 text-sm">Aucun avis pour l'instant. Soyez le premier !</p>
            )}
          </div>
          {isAuthenticated && (
            <div>
              <ReviewForm productId={product.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}