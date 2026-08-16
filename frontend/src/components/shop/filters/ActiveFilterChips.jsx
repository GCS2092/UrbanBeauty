import { X } from 'lucide-react';

export default function ActiveFilterChips({ filters, setFilters, toggleArrayValue, resetAll, categories }) {
  const chips = [];

  if (filters.category) {
    const cat = categories?.find((c) => c.slug === filters.category);
    chips.push({ label: cat?.name || filters.category, onRemove: () => setFilters({ category: '' }) });
  }
  if (filters.minPrice || filters.maxPrice) {
    chips.push({
      label: `${filters.minPrice || '0'} – ${filters.maxPrice || '∞'} FCFA`,
      onRemove: () => setFilters({ minPrice: '', maxPrice: '' }),
    });
  }
  filters.size.forEach((s) => chips.push({ label: `Taille ${s}`, onRemove: () => toggleArrayValue('size', s) }));
  filters.color.forEach((c) => chips.push({ label: c, onRemove: () => toggleArrayValue('color', c) }));
  if (filters.inStock) chips.push({ label: 'En stock', onRemove: () => setFilters({ inStock: false }) });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={chip.onRemove}
          className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
        >
          {chip.label}
          <X size={12} />
        </button>
      ))}
      <button onClick={resetAll} className="text-xs text-rose-500 hover:text-rose-600 font-medium px-2">
        Tout réinitialiser
      </button>
    </div>
  );
}