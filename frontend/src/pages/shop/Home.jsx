import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles, Truck, ShieldCheck } from 'lucide-react';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import ProductGrid from '../../components/shared/ProductGrid';
import Button from '../../components/ui/Button';

const perks = [
  { icon: Truck, label: 'Livraison rapide', desc: 'Partout au Sénégal' },
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
              <Sparkles size={12} /> Nouvelle collection disponible
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight mb-4">
              La beauté <br />
              <span className="text-rose-400">à portée de main</span>
            </h1>
            <p className="text-stone-500 text-lg mb-8 leading-relaxed">
              Découvrez notre sélection de produits beauté authentiques,
              livrés directement chez vous.
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

        {/* Décorations */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* Perks */}
      <section className="border-y border-stone-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {perks.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-400 shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-stone-800 text-sm">{label}</p>
                  <p className="text-xs text-stone-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catégories */}
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
                  <div className="w-full h-full flex items-center justify-center text-4xl">🏷️</div>
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
