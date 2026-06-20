import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles, Truck, ShieldCheck, Tag } from 'lucide-react';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import ProductGrid from '../../components/shared/ProductGrid';
import Button from '../../components/ui/Button';

const perks = [
  { icon: Truck, label: 'Livraison & export', desc: 'Sénégal et international' },
  { icon: ShieldCheck, label: 'Produits authentiques', desc: '100% vérifiés' },
  { icon: Sparkles, label: 'Nouveautés chaque semaine', desc: 'Toujours tendance' },
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
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-rose-50 via-stone-50 to-amber-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <Sparkles size={12} /> SonShop – Nouvelle collection disponible
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight mb-4">
              Le style <br />
              <span className="text-rose-400">qui vous ressemble</span>
            </h1>
            <p className="text-stone-500 text-lg mb-8 leading-relaxed">
              Découvrez notre sélection de vêtements et accessoires authentiques,
              livrés partout au Sénégal et exportés à l'international.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/products">
                <Button size="lg">
                  Découvrir la boutique <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/products?featured=true">
                <Button size="lg" variant="outline">
                  Meilleures ventes
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorations */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* Perks */}
      <section className="border-y border-stone-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 sm:divide-x sm:divide-stone-100">
            {perks.map(({ icon: Icon, label, desc }, i) => (
              <div key={label} className={`flex items-center gap-2.5 ${i > 0 ? 'sm:pl-6' : ''} flex-1 min-w-0`}>
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-400 shrink-0">
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-stone-800 text-xs truncate">{label}</p>
                  <p className="text-[11px] text-stone-400 truncate">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-stone-800 mb-6">Catégories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group relative bg-stone-100 rounded-2xl overflow-hidden aspect-square hover:shadow-md transition-all"
              >
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <Tag size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <p className="absolute bottom-3 left-3 text-white font-semibold text-sm">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Produits vedettes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-stone-800">Produits vedettes</h2>
          <Link to="/products" className="text-sm text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        <ProductGrid products={productsData?.data || productsData} loading={loadingProducts} />
      </section>
    </div>
  );
}