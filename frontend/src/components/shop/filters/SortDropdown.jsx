const SORT_OPTIONS = [
  { value: 'newest', label: 'Nouveautés' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'name_asc', label: 'Nom A-Z' },
];

export default function SortDropdown({ value, onChange, className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border border-stone-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-rose-300 ${className}`}
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}