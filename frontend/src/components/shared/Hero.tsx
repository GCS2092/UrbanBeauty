import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmY2U3ZjEiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzMCIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
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
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/products"
              className="rounded-full bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/50 hover:shadow-xl hover:shadow-pink-500/50 transition-all duration-300"
            >
              Découvrir les produits
            </Link>
            <Link
              href="/services"
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-pink-600 transition-colors"
            >
              Réserver un service <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

