import { X } from 'lucide-react';
import FilterPanel from './FilterPanel';

export default function FilterDrawer({ open, onClose, ...panelProps }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 shrink-0">
          <h2 className="font-semibold text-stone-800">Filtres</h2>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 flex-1">
          <FilterPanel {...panelProps} />
        </div>
        <div className="p-4 border-t border-stone-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-stone-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-stone-800 transition-colors"
          >
            Voir les résultats
          </button>
        </div>
      </div>
    </div>
  );
}