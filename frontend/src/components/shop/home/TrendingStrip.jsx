import { Link } from 'react-router-dom';
import { formatPrice } from '../../../utils/formatPrice';

export default function TrendingStrip({ products = [] }) {
  if (!products.length) return null;

  const items = [...products, ...products]; // duplication pour boucle infinie fluide

  return (
    <div className="relative z-10 mt-1">
      <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-stone-400 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 live-dot" />
        Tendance en ce moment
      </div>

      <div className="overflow-hidden -mx-1 px-1">
        <div className="flex gap-4 vitrine-track w-max">
          {items.map((p, i) => {
            const mainImage =
              p.images?.find((img) => img.isMain)?.url || p.images?.[0]?.url;
            return (
              <Link
                to={`/products/${p.slug}`}
                key={`${p.id}-${i}`}
                className="flex flex-col items-center gap-1.5 w-20 shrink-0"
              >
                <div className="relative w-20 h-20 rounded-2xl border-2 border-white shadow-lg shadow-rose-200/40 overflow-hidden bg-gradient-to-br from-rose-100 to-amber-100 ring-1 ring-stone-100">
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={p.name || ''}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-2xl">🛍️</span>
                  )}
                </div>
                <div className="text-center w-full">
                  <p className="text-[10px] font-medium text-stone-600 truncate w-full leading-tight">
                    {p.name}
                  </p>
                  {typeof p.price === 'number' && (
                    <p className="text-[10.5px] font-bold text-rose-500 leading-tight">
                      {formatPrice(p.price)}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}