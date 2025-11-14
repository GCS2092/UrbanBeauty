import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-4">
              UrbanBeauty
            </h3>
            <p className="text-gray-400 text-sm">
              Votre plateforme beauté tout-en-un. Produits, services et inspiration.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/products" className="hover:text-pink-400 transition-colors">Produits</Link></li>
              <li><Link href="/services" className="hover:text-pink-400 transition-colors">Services</Link></li>
              <li><Link href="/lookbook" className="hover:text-pink-400 transition-colors">Lookbook</Link></li>
              <li><Link href="/prestataires" className="hover:text-pink-400 transition-colors">Prestataires</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/contact" className="hover:text-pink-400 transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-pink-400 transition-colors">FAQ</Link></li>
              <li><Link href="/about" className="hover:text-pink-400 transition-colors">À propos</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Suivez-nous</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">TikTok</a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">Facebook</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 UrbanBeauty. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

