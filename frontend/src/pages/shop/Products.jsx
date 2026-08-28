import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import { STORE_ID } from '../../utils/constants';
import ProductGrid from '../../components/shared/ProductGrid';
import Pagination from '../../components/shared/Pagination';
import { useMeta } from '../../hooks/useMeta';
import { useProductFilters } from '../../hooks/useProductFilters';
import FilterPanel from '../../components/shop/filters/FilterPanel';
import FilterDrawer from '../../components/shop/filters/FilterDrawer';
import SortDropdown from '../../components/shop/filters/SortDropdown';
import ActiveFilterChips from '../../components/shop/filters/ActiveFilterChips';

export default function Products() {
  const { filters, setFilters, toggleArrayValue, setPage, resetAll, activeCount } = useProductFilters();
  const [search, setSearch] = useState(filters.search);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['products', { ...filters, storeId: STORE_ID }],
    queryFn: () =>
      productsApi
        .getAll({
          page: filters.page,
          limit: 12,
          category: filters.category,
          search: filters.search,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          size: filters.size.join(','),
          color: filters.color.join(','),
          inStock: filters.inStock,
          sort: filters.sort,
          storeId: STORE_ID,
        })
        .then((r) => r.data),
    keepPreviousData: true,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', { storeId: STORE_ID }],
    queryFn: () => categoriesApi.getAll({ storeId: STORE_ID }).then((r) => r.data),
  });

  const activeCategory = categories?.find((c) => c.slug === filters.category);
  const metaTitle = activeCategory ? `${activeCategory.name} — Boutique` : 'Boutique';
  const metaDescription = activeCategory
    ? `Découvrez notre sélection ${activeCategory.name.toLowerCase()} chez SonShop. Livraison rapide partout au Sénégal.`
    : 'Découvrez tout le catalogue SonShop : vêtements, accessoires, chaussures et plus. Livraison rapide partout au Sénégal.';
  const isFiltered = Boolean(filters.search) || filters.page > 1 || activeCount > 0;
  const canonicalUrl = filters.category
  ? `https://www.sonshop.beauty/products/?category=${filters.category}`
  : 'https://www.sonshop.beauty/products/';
  useMeta({ title: metaTitle, description: metaDescription, url: canonicalUrl, noindex: isFiltered });

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ search });
  };

  const products = data?.data || data || [];
  const totalPages = data?.totalPages || 1;

  const panelProps = { filters, setFilters, toggleArrayValue, categories };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-800 mb-1">Boutique</h1>
        <p className="text-stone-400 text-sm">
          {data?.total ? `${data.total} produits disponibles` : 'Découvrez notre catalogue'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
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

        <div className="flex gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden relative flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            <SlidersHorizontal size={15} /> Filtrer
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
          <SortDropdown value={filters.sort} onChange={(sort) => setFilters({ sort })} />
        </div>
      </div>

      <ActiveFilterChips
        filters={filters}
        setFilters={setFilters}
        toggleArrayValue={toggleArrayValue}
        resetAll={resetAll}
        categories={categories}
      />

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
        <aside className="hidden md:block">
          <FilterPanel {...panelProps} />
        </aside>

        <div>
          <ProductGrid products={products} loading={isLoading} />
          <Pagination page={filters.page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} {...panelProps} />
    </div>
  );
}