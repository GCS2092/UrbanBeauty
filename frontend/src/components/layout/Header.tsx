'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBagIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                UrbanBeauty
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
              Produits
            </Link>
            <Link href="/services" className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
              Services
            </Link>
            <Link href="/lookbook" className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
              Lookbook
            </Link>
            <Link href="/prestataires" className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
              Prestataires
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="hidden sm:block p-2 text-gray-600 hover:text-pink-600 transition-colors">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* User */}
            <Link href="/auth/login" className="hidden sm:block p-2 text-gray-600 hover:text-pink-600 transition-colors">
              <UserIcon className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-pink-600 transition-colors">
              <ShoppingBagIcon className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-4 w-4 bg-pink-600 text-white text-xs rounded-full flex items-center justify-center">
                0
              </span>
            </Link>

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

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-2">
            <Link href="/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Produits
            </Link>
            <Link href="/services" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Services
            </Link>
            <Link href="/lookbook" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Lookbook
            </Link>
            <Link href="/prestataires" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Prestataires
            </Link>
            <Link href="/auth/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Connexion
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

