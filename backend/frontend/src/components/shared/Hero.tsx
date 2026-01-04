import Link from 'next/link';
import { SparklesIcon, ScissorsIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmY2U3ZjEiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzMCIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-pink-200/30 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-rose-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-orange-200/30 rounded-full blur-lg animate-pulse delay-500"></div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          {/* Icon decoration */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-pink-200/50 rounded-full blur-2xl"></div>
              <div className="relative bg-gradient-to-br from-pink-500 to-rose-500 p-4 rounded-full shadow-lg">
                <SparklesIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Votre beauté,
            <span className="block bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              notre passion
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Découvrez une sélection exclusive de produits cosmétiques, réservez vos services de coiffure 
            et trouvez l'inspiration dans notre lookbook.
          </p>
          
          {/* Feature icons */}
          <div className="mt-8 flex items-center justify-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <ShoppingBagIcon className="h-5 w-5 text-pink-600" />
              <span className="text-sm">Produits</span>
            </div>
            <div className="flex items-center gap-2">
              <ScissorsIcon className="h-5 w-5 text-pink-600" />
              <span className="text-sm">Services</span>
            </div>
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-pink-600" />
              <span className="text-sm">Lookbook</span>
            </div>
          </div>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
            <Link
              href="/products"
              className="w-full sm:w-auto rounded-full bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/50 hover:shadow-xl hover:shadow-pink-500/50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Découvrir les produits
            </Link>
            <Link
              href="/services"
              className="w-full sm:w-auto text-sm font-semibold leading-6 text-gray-900 hover:text-pink-600 transition-colors flex items-center justify-center gap-2"
            >
              Réserver un service <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

