import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { FaFacebook, FaTiktok, FaInstagram } from 'react-icons/fa';

const SOCIAL_LINKS = [
  { name: 'Facebook', url: 'https://www.facebook.com/share/17PicDQeZm/?mibextid=wwXIfr', icon: FaFacebook },
  { name: 'TikTok', url: 'https://www.tiktok.com/@sonshop221', icon: FaTiktok },
  { name: 'Instagram', url: 'https://www.instagram.com/sonshop221', icon: FaInstagram },
];

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 mt-auto border-t-2 border-rose-500/20 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-white text-lg">
                Son<span className="text-rose-400">Shop</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Vetements et accessoires en ligne. Produits authentiques, livraison rapide.
            </p>
            <Link
              to="/suivi"
              className="mt-4 inline-flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 hover:text-rose-200 text-sm font-medium px-3.5 py-2 rounded-xl transition-colors"
            >
              <Truck size={15} /> Suivre ma commande
            </Link>

            <div className="flex items-center gap-3 mt-5">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="w-9 h-9 rounded-full bg-stone-800 hover:bg-rose-500/20 text-stone-400 hover:text-rose-300 flex items-center justify-center transition-colors"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-3 gap-4 sm:gap-8">
            <div>
              <h4 className="text-rose-400 font-semibold mb-3 text-sm uppercase tracking-wider">Boutique</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products" className="hover:text-white transition-colors">Tous les produits</Link></li>
                <li><Link to="/cart" className="hover:text-white transition-colors">Mon panier</Link></li>
                <li><Link to="/orders" className="hover:text-white transition-colors">Mes commandes</Link></li>
                <li><Link to="/suivi" className="hover:text-white transition-colors">Suivre ma commande</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-rose-400 font-semibold mb-3 text-sm uppercase tracking-wider">Mon compte</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/account/profile" className="hover:text-white transition-colors">Profil</Link></li>
                <li><Link to="/account/addresses" className="hover:text-white transition-colors">Adresses</Link></li>
                <li><Link to="/account/wishlist" className="hover:text-white transition-colors">Favoris</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-rose-400 font-semibold mb-3 text-sm uppercase tracking-wider">Informations</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">A propos</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Nous contacter</Link></li>
                <li><Link to="/returns" className="hover:text-white transition-colors">Politique de retour</Link></li>
                <li><Link to="/cgv" className="hover:text-white transition-colors">Conditions generales de vente</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-6 text-xs text-center">
          (c) {new Date().getFullYear()} SonShop - Tous droits reserves
        </div>
      </div>
    </footer>
  );
}