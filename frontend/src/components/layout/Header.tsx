'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBagIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cart.store';
import CurrencySelector from '@/components/shared/CurrencySelector';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';

function CartBadge() {
  const itemCount = useCartStore((state) => state.getItemCount());
  
  if (itemCount === 0) return null;
  
  return (
    <span className="absolute top-0 right-0 h-4 w-4 bg-pink-600 text-white text-xs rounded-full flex items-center justify-center">
      {itemCount > 9 ? '9+' : itemCount}
    </span>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Redirige selon le rôle */}
          <div className="flex items-center">
            <Link 
              href={
                isAuthenticated 
                  ? user?.role === 'ADMIN' 
                    ? '/dashboard/admin'
                    : '/dashboard'
                  : '/'
              } 
              className="flex items-center space-x-2"
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                UrbanBeauty
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Masquer pour les utilisateurs connectés */}
          {!isAuthenticated && (
            <div className="hidden md:flex md:items-center md:space-x-8">
              <Link 
                href="/products" 
                className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Produits
              </Link>
              <Link 
                href="/services" 
                className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/lookbook" 
                className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Lookbook
              </Link>
              <Link 
                href="/prestataires" 
                className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Prestataires
              </Link>
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Currency Selector */}
            <div className="hidden sm:block">
              <CurrencySelector />
            </div>
            
            {/* Mes commandes - Accessible à tous */}
            <Link
              href={isAuthenticated ? "/dashboard/orders" : "/orders/track"}
              className="hidden sm:flex items-center gap-1 p-2 text-gray-600 hover:text-pink-600 transition-colors"
              title={isAuthenticated ? "Mes commandes" : "Suivre ma commande"}
            >
              <ClipboardDocumentListIcon className="h-5 w-5" />
              <span className="text-sm font-medium hidden lg:inline">
                {isAuthenticated ? "Mes commandes" : "Suivre commande"}
              </span>
            </Link>

            {/* Search */}
            <button className="hidden sm:block p-2 text-gray-600 hover:text-pink-600 transition-colors">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <div className="hidden sm:block">
                <NotificationsPanel />
              </div>
            )}

            {/* User */}
            {isAuthenticated ? (
              <div className="hidden sm:block relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-pink-600 transition-colors"
                >
                  <UserIcon className="h-5 w-5" />
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Tableau de bord
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Mon profil
                    </Link>
                    {(user?.role === 'COIFFEUSE' || user?.role === 'MANICURISTE') && (
                      <Link
                        href="/dashboard/services"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Mes services
                      </Link>
                    )}
                    {user?.role === 'VENDEUSE' && (
                      <Link
                        href="/dashboard/products"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Mes produits
                      </Link>
                    )}
                    {user?.role === 'ADMIN' && (
                      <Link
                        href="/dashboard/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-semibold text-pink-600"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Administration
                      </Link>
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="hidden sm:block p-2 text-gray-600 hover:text-pink-600 transition-colors">
                <UserIcon className="h-5 w-5" />
              </Link>
            )}

            {/* Cart - Visible uniquement pour les clients et non-connectés */}
            {(!isAuthenticated || user?.role === 'CLIENT') && (
              <Link href="/cart" className="relative p-2 text-gray-600 hover:text-pink-600 transition-colors">
                <ShoppingBagIcon className="h-5 w-5" />
                <CartBadge />
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu - Masquer navigation publique pour utilisateurs connectés */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-2">
            {!isAuthenticated && (
              <>
                <Link 
                  href="/products" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Produits
                </Link>
                <Link 
                  href="/services" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link 
                  href="/lookbook" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Lookbook
                </Link>
                <Link 
                  href="/prestataires" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Prestataires
                </Link>
                <Link 
                  href="/orders/track" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Suivre ma commande
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
                <Link 
                  href="/dashboard/orders" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mes commandes
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link 
                href="/auth/login" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Connexion
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

