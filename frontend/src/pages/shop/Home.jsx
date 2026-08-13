import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles, Truck, ShieldCheck } from 'lucide-react';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import { STORE_ID } from '../../utils/constants';
import Button from '../../components/ui/Button';
import CategoryMarquee from '../../components/shop/home/CategoryMarquee';
import ProductCarousel from '../../components/shop/home/ProductCarousel';
import TrendingStrip from '../../components/shop/home/TrendingStrip';
import heroImg from '../../assets/hero.png';

const perks = [
  { icon: Truck, label: 'Livraison & export', desc: 'Senegal et international' },
  { icon: ShieldCheck, label: 'Produits authentiques', desc: '100% verifies' },
  { icon: Sparkles, label: 'Nouveautes chaque semaine', desc: 'Toujours tendance' },
];

export default function Home() {
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', 'featured', { storeId: STORE_ID }],
    queryFn: () =>
      productsApi.getAll({ limit: 8, featured: true, storeId: STORE_ID }).then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', { storeId: STORE_ID }],
    queryFn: () => categoriesApi.getAll({ storeId: STORE_ID }).then((r) => r.data),
  });

  const products = productsData?.data || productsData || [];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-rose-50 via-stone-50 to-amber-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

            <div>
              <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <Sparkles size={12} /> SonShop - Nouvelle collection disponible
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight mb-4">
                Le style <br />
                <span className="text-rose-400">qui vous ressemble</span>
              </h1>
              <p className="text-stone-500 text-lg mb-8 leading-relaxed">
                Decouvrez notre selection de vetements et accessoires authentiques,
                livres partout au Senegal et exportes a l'international.
              </p>
              <div className="flex gap-3 flex-wrap mb-8">
                <Link to="/products">
                  <Button size="lg">
                    Decouvrir la boutique <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/products?featured=true">
                  <Button size="lg" variant="outline">
                    Meilleures ventes
                  </Button>
                </Link>
              </div>

              {/* Vitrine produits tendance qui defile - visible des l'ouverture */}
              <TrendingStrip products={products.slice(0, 8)} />
            </div>

            <div className="hidden md:block relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-rose-200/50">
                <img
                  src={heroImg}
                  alt="SonShop collection"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-500">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800">100% Authentique</p>
                  <p className="text-[11px] text-stone-400">Produits verifies</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="absolute top-10 right-10 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl pointer-events-none blob-breathe-a" />
        <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-amber-200/30 rounded-full blur-2xl pointer-events-none blob-breathe-b" />
      </section>

      <section className="border-y border-stone-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 sm:divide-x sm:divide-stone-100">
            {perks.map(({ icon: Icon, label, desc }, i) => (
              <div key={label} className={`flex items-center gap-3 ${i > 0 ? 'sm:pl-6' : ''} flex-1 min-w-0`}>
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-400 shrink-0">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-stone-800 text-sm truncate">{label}</p>
                  <p className="text-xs text-stone-400 truncate">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CategoryMarquee categories={categories || []} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-stone-800">Produits vedettes</h2>
          <Link to="/products" className="text-sm text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-100">
                <div className="aspect-square bg-stone-100 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-stone-100 rounded-full animate-pulse w-1/2" />
                  <div className="h-4 bg-stone-100 rounded-full animate-pulse w-3/4" />
                  <div className="h-4 bg-stone-100 rounded-full animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ProductCarousel products={products} />
        )}
      </section>
    </div>
  );
}