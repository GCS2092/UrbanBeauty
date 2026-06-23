import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag, Heart, Bell, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useUiStore from '../../store/uiStore';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const { mobileMenuOpen, openMobileMenu, closeMobileMenu } = useUiStore();
  const { logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/products', label: 'Boutique' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — texte pur, pas d'emoji pour éviter les problèmes d'encoding */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center shrink-0">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-stone-800">
              Son<span className="text-rose-400">Shop</span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-rose-500' : 'text-stone-600 hover:text-stone-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">

            {/* Panier — visible uniquement sur desktop */}
            <Link to="/cart" className="relative p-2 text-stone-600 hover:text-stone-900 transition-colors hidden md:block">
              <ShoppingBag size={20} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                {/* Wishlist — desktop seulement */}
                <Link to="/account/wishlist" className="p-2 text-stone-600 hover:text-rose-400 transition-colors hidden md:block">
                  <Heart size={20} />
                </Link>

                {/* Notifications — desktop seulement */}
                <Link to="/account/notifications" className="p-2 text-stone-600 hover:text-stone-900 transition-colors hidden md:block">
                  <Bell size={20} />
                </Link>

                {/* Profil dropdown — desktop seulement */}
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-stone-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-semibold text-sm">
                      {user?.firstName?.[0]?.toUpperCase()}
                    </div>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-stone-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="font-semibold text-stone-800 text-sm">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-stone-400">{user?.email}</p>
                      </div>
                      <Link to="/account/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors">
                        <User size={15} /> Mon profil
                      </Link>
                      <Link to="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors">
                        <ShoppingBag size={15} /> Mes commandes
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 transition-colors">
                          Dashboard Admin
                        </Link>
                      )}
                      <button onClick={() => { setProfileOpen(false); logout(); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors">
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors">
                <User size={15} /> Connexion
              </Link>
            )}

            {/* Menu hamburger mobile */}
            <button
              className="md:hidden p-2 text-stone-600"
              onClick={mobileMenuOpen ? closeMobileMenu : openMobileMenu}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-100 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `text-sm font-medium px-2 py-1 transition-colors ${
                    isActive ? 'text-rose-500' : 'text-stone-600'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}