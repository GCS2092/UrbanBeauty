import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';

export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    size: (searchParams.get('size') || '').split(',').filter(Boolean),
    color: (searchParams.get('color') || '').split(',').filter(Boolean),
    inStock: searchParams.get('inStock') === 'true',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page') || 1),
  }), [searchParams]);

  const setFilters = useCallback((patch) => {
    const p = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) p.set(key, value.join(','));
        else p.delete(key);
      } else if (value === '' || value === false || value === null || value === undefined) {
        p.delete(key);
      } else {
        p.set(key, value);
      }
    });
    p.delete('page');
    setSearchParams(p);
  }, [searchParams, setSearchParams]);

  const toggleArrayValue = useCallback((key, value) => {
    const current = (searchParams.get(key) || '').split(',').filter(Boolean);
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFilters({ [key]: next });
  }, [searchParams, setFilters]);

  const setPage = useCallback((page) => {
    const p = new URLSearchParams(searchParams);
    p.set('page', page);
    setSearchParams(p);
  }, [searchParams, setSearchParams]);

  const resetAll = useCallback(() => {
    const p = new URLSearchParams();
    if (filters.search) p.set('search', filters.search);
    setSearchParams(p);
  }, [filters.search, setSearchParams]);

  const activeCount =
    (filters.category ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    filters.size.length +
    filters.color.length +
    (filters.inStock ? 1 : 0);

  return { filters, setFilters, toggleArrayValue, setPage, resetAll, activeCount };
}