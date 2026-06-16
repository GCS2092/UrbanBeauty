import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Zap, Shield, Star } from 'lucide-react';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import ProductGrid from '../../components/shared/ProductGrid';
import Button from '../../components/ui/Button';

const perks = [
  { icon: Zap,    label: 'Livraison rapide',       desc: 'Partout au Sénégal' },
  { icon: Shield, label: 'Produits authentiques',   desc: '100% vérifiés' },
  { icon: Star,   label: 'Nouveautés chaque semaine', desc: 'Toujours tendance' },
];

export default function Home() {
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsApi.getAll({ limit: 8, featured: true }).then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then((r) => r.data),
  });

  return (
    <div className="bg-white">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative bg-stone-950 overflow-hidden min-h-[85vh] flex items-center">

        {/* Fond géométrique décoratif */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-stone-800/40 to-transparent" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-20 w-72 h-72 bg-amber-400/10 rounded-full blur-2xl" />
          {/* Grid lines décoratives */}
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 w-full">
          <div className="max-w-2xl">

            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Nouvelle collection disponible
            </span>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
              Le style,{' '}
              <span className="relative inline-block">
                <span className="text-amber-400">sans compromis</span>
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-amber-400/40" />
              </span>
            </h1>

            <p className="text-stone-400 text-lg mb-10 leading-relaxed max-w-lg">
              Découvrez notre sélection de produits soigneusement choisis pour l'homme moderne.
              Qualité, style et authenticité — livrés directement chez vous.
            </p>

            <div className="flex gap-4 flex-wrap">
              <Link to="/products">
                <button className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold px-7 py-3.5 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-amber-500/20">
                  Découvrir la boutique
                  <ArrowRight size={16} />
                </button>
              </Link>
              <Link to="/products?featured=true">
                <button className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 active:scale-95 text-white font-semibold px-7 py-3.5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 text-sm">
                  Meilleures ventes
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-10 border-t border-white/10">
              {[
                { value: '500+', label: 'Produits' },
                { value: '2k+',  label: 'Clients satisfaits' },
                { value: '48h',  label: 'Livraison max' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-2xl font-black text-white">{value}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chevron bas */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30">
          <div className="w-px h-8 bg-white" />
          <div className="w-2 h-2 border-r border-b border-white rotate-45 -mt-1" />
        </div>
      </section>

      {/* ── PERKS ────────────────────────────────────────────── */}
      <section className="bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {perks.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{label}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATÉGORIES ───────────────────────────────────────── */}
      {categories?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Collections</p>
              <h2 className="text-3xl font-black text-stone-900 leading-tight">
                Explorez par catégorie
              </h2>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors"
            >
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {categories.slice(0, 4).map((cat, i) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className={`group relative rounded-2xl overflow-hidden ${
                  i === 0 ? 'sm:row-span-2 aspect-[3/4] sm:aspect-auto' : 'aspect-square'
                } bg-stone-100 hover:shadow-xl transition-all duration-300`}
              >
                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                    <span className="text-4xl">🏷️</span>
                  </div>
                )}
                {/* Overlay dégradé sombre */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
                {/* Badge catégorie */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-black text-base leading-tight">{cat.name}</p>
                  <p className="text-amber-400 text-xs font-semibold mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Voir la collection <ArrowRight size={10} />
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="sm:hidden mt-4 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors"
            >
              Voir toutes les catégories <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* ── PRODUITS VEDETTES ─────────────────────────────────── */}
      <section className="bg-stone-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Sélection</p>
              <h2 className="text-3xl font-black text-stone-900">
                Produits vedettes
              </h2>
            </div>
            <Link
              to="/products"
              className="flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors"
            >
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          <ProductGrid products={productsData?.data || productsData} loading={loadingProducts} />
        </div>
      </section>

      {/* ── BANNIÈRE CTA FINALE ───────────────────────────────── */}
      <section className="bg-stone-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3">SonShop</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Prêt à élever votre style ?
          </h2>
          <p className="text-stone-400 text-sm mb-8 max-w-md mx-auto">
            Des centaines de produits sélectionnés pour l'homme qui sait ce qu'il veut.
          </p>
          <Link to="/products">
            <button className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold px-8 py-4 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-amber-500/20">
              Explorer la boutique
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
}