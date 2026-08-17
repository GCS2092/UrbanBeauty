import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import { optimizeImage } from '../../utils/optimizeImage';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../../api/settings.api';

export default function ProductCard({ product }) {
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);

  // Récupère le numéro WhatsApp depuis les settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getPublic().then((r) => r.data),
    staleTime: 5 * 60 * 1000, // cache 5 min
  });

  const images = product.images ?? [];
  const hasMultiple = images.length > 1;
  const currentImage = images[currentIndex];

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const isOutOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem(user?.id, { productId: product.id, quantity: 1 });
      toast.success('Ajouté au panier !');
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleWhatsAppInfo = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const whatsappNumber = (settings?.whatsapp_number || '').replace(/\D/g, '');
    if (!whatsappNumber) {
      toast.error('Numéro WhatsApp non configuré.');
      return;
    }

    const message = encodeURIComponent(
      `Bonjour, je souhaite avoir plus d'informations sur le produit : *${product.name}*`
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const prev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const next = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next(e) : prev(e);
  };

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-lg transition-all duration-300">

        {/* Zone image */}
        <div
          className="relative aspect-square overflow-hidden bg-stone-100"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {currentImage ? (
            <img
              src={optimizeImage(currentImage.url, { width: 500, quality: 75 })}
              alt={product.name}
              width="500"
              height="500"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-stone-300">
              🛍️
            </div>
          )}

          {hasMultiple && (
            <>
              <button
                onClick={prev}
                aria-label="Image précédente"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow
                           opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 z-10"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={next}
                aria-label="Image suivante"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow
                           opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 z-10"
              >
                <ChevronRight size={14} />
              </button>

              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-200 ${
                      i === currentIndex ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {isOutOfStock && (
              <span className="bg-stone-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Rupture
              </span>
            )}
            {lowStock && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                Plus que {product.stock} en stock
              </span>
            )}
          </div>

          {/* Boutons d'action (panier + WhatsApp) — espacés de part et d'autre */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10
                          opacity-100 md:opacity-0 md:group-hover:opacity-100
                          translate-y-0 md:translate-y-1 md:group-hover:translate-y-0
                          transition-all duration-200">

            {/* Bouton WhatsApp - Demander des infos */}
            <button
              onClick={handleWhatsAppInfo}
              aria-label="Demander des informations via WhatsApp"
              className="bg-[#25D366] text-white p-2.5 rounded-xl shadow-md
                         hover:bg-[#1ebe5d] active:scale-95 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </button>

            {/* Bouton Ajouter au panier */}
            {!isOutOfStock ? (
              <button
                onClick={handleAddToCart}
                aria-label="Ajouter au panier"
                className="bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-md
                           hover:bg-stone-900 hover:text-white active:scale-95 transition-all duration-200"
              >
                <ShoppingBag size={16} />
              </button>
            ) : (
              <span />
            )}
          </div>
        </div>

        {/* Infos */}
        <div className="p-3">
          <p className="text-xs text-stone-400 mb-0.5">{product.category?.name}</p>
          <h3 className="text-sm font-semibold text-stone-800 line-clamp-1 mb-1">{product.name}</h3>
          <div className="flex items-baseline gap-2 flex-nowrap overflow-hidden">
            <span className="font-bold text-stone-900 text-base whitespace-nowrap">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through whitespace-nowrap">{formatPrice(product.comparePrice)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}