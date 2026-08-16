import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { productsApi } from '../../../api/products.api';
import { STORE_ID } from '../../../utils/constants';
import { formatPrice } from '../../../utils/formatPrice';

const COLOR_SWATCHES = {
  noir: '#1c1917', blanc: '#ffffff', rouge: '#e11d48', bleu: '#2563eb',
  vert: '#16a34a', jaune: '#eab308', rose: '#ec4899', gris: '#78716c',
  beige: '#d6c7a1', marron: '#78350f', orange: '#f97316', violet: '#7c3aed',
};

export default function FilterPanel({ filters, setFilters, toggleArrayValue, categories }) {
  const { data: options } = useQuery({
    queryKey: ['product-filters', { category: filters.category, search: filters.search, storeId: STORE_ID }],
    queryFn: () =>
      productsApi.getFilters({ category: filters.category, search: filters.search, storeId: STORE_ID }).then((r) => r.data),
  });

  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);
  useEffect(() => { setMinPrice(filters.minPrice); setMaxPrice(filters.maxPrice); }, [filters.minPrice, filters.maxPrice]);

  const applyPrice = () => setFilters({ minPrice, maxPrice });

  return (
    <div className="space-y-6">

      <div>
        <h3 className="text-sm font-semibold text-stone-800 mb-3">Catégorie</h3>
        <div className="space-y-1">
          <button
            onClick={() => setFilters({ category: '' })}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !filters.category ? 'bg-rose-50 text-rose-600 font-medium' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            Toutes les catégories
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilters({ category: cat.slug })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.category === cat.slug ? 'bg-rose-50 text-rose-600 font-medium' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {options && options.priceMax > 0 && (
        <div className="border-t border-stone-100 pt-5">
          <h3 className="text-sm font-semibold text-stone-800 mb-3">Prix</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={applyPrice}
              placeholder={String(options.priceMin)}
              className="w-full border border-stone-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rose-300"
            />
            <span className="text-stone-300">–</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={applyPrice}
              placeholder={String(options.priceMax)}
              className="w-full border border-stone-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
          <p className="text-xs text-stone-400 mt-1.5">
            {formatPrice(options.priceMin)} – {formatPrice(options.priceMax)}
          </p>
        </div>
      )}

      {options?.sizes?.length > 0 && (
        <div className="border-t border-stone-100 pt-5">
          <h3 className="text-sm font-semibold text-stone-800 mb-3">Taille</h3>
          <div className="flex flex-wrap gap-2">
            {options.sizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleArrayValue('size', size)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filters.size.includes(size)
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

      {options?.colors?.length > 0 && (
        <div className="border-t border-stone-100 pt-5">
          <h3 className="text-sm font-semibold text-stone-800 mb-3">Couleur</h3>
          <div className="flex flex-wrap gap-2.5">
            {options.colors.map((color) => {
              const active = filters.color.includes(color);
              const hex = COLOR_SWATCHES[color.toLowerCase()];
              return (
                <button
                  key={color}
                  onClick={() => toggleArrayValue('color', color)}
                  title={color}
                  className="relative w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: hex || '#e7e5e4',
                    borderColor: active ? '#0c0a09' : '#e7e5e4',
                  }}
                >
                  {active && (
                    <Check
                      size={14}
                      className={hex && ['#ffffff', '#eab308', '#d6c7a1'].includes(hex) ? 'text-stone-900' : 'text-white'}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-stone-100 pt-5">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-stone-700">En stock uniquement</span>
          <button
            type="button"
            onClick={() => setFilters({ inStock: !filters.inStock })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${filters.inStock ? 'bg-rose-500' : 'bg-stone-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${filters.inStock ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </label>
      </div>
    </div>
  );
}