import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Brand - Compact */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-2">
            UrbanBeauty
          </h3>
          <p className="text-gray-400 text-xs max-w-xs mx-auto">
            Votre plateforme beauté tout-en-un
          </p>
        </div>

        {/* Links - 2 lignes alignées */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm mb-6">
          <Link href="/products" className="text-gray-400 hover:text-pink-400 transition-colors">
            Produits
          </Link>
          <Link href="/services" className="text-gray-400 hover:text-pink-400 transition-colors">
            Services
          </Link>
          <Link href="/lookbook" className="text-gray-400 hover:text-pink-400 transition-colors">
            Lookbook
          </Link>
          <Link href="/prestataires" className="text-gray-400 hover:text-pink-400 transition-colors">
            Prestataires
          </Link>
        </div>

        {/* Support links - 1 ligne */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm mb-6">
          <Link href="/contact" className="text-gray-400 hover:text-pink-400 transition-colors">
            Contact
          </Link>
          <Link href="/faq" className="text-gray-400 hover:text-pink-400 transition-colors">
            FAQ
          </Link>
          <Link href="/about" className="text-gray-400 hover:text-pink-400 transition-colors">
            À propos
          </Link>
        </div>

        {/* Social - 1 ligne */}
        <div className="flex justify-center gap-6 mb-6">
          <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
            Instagram
          </a>
          <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
            TikTok
          </a>
          <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
            Facebook
          </a>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          <p>&copy; 2025 UrbanBeauty. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
