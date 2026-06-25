import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import { STORE_ID } from '../../utils/constants';
import ProductGrid from '../../components/shared/ProductGrid';
import Pagination from '../../components/shared/Pagination';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const page = Number(searchParams.get('page') || 1);
  const category = searchParams.get('category') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, category, search, storeId: STORE_ID }],
    queryFn: () =>
      productsApi
        .getAll({ page, limit: 12, category, search, storeId: STORE_ID })
        .then((r) => r.data),
    keepPreviousData: true,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', { storeId: STORE_ID }],
    queryFn: () => categoriesApi.getAll({ storeId: STORE_ID }).then((r) => r.data),
  });

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setParam('search', search);
  };

  const products = data?.data || data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 mb-1">Boutique</h1>
        <p className="text-stone-400 text-sm">
          {data?.total ? `${data.total} produits disponibles` : 'Découvrez notre catalogue'}
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors">
            Chercher
          </button>
        </form>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setParam('category', '')}
            className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
              !category ? 'bg-rose-500 text-white border-rose-500' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Tous
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setParam('category', cat.slug)}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                category === cat.slug ? 'bg-rose-500 text-white border-rose-500' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grille */}
      <ProductGrid products={products} loading={isLoading} />

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => {
          const params = new URLSearchParams(searchParams);
          params.set('page', p);
          setSearchParams(params);
        }}
      />
    </div>
  );
}
