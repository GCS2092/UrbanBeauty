import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Search, Package, User } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

export default function BottomNav() {
  const { isAuthenticated } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const location = useLocation();

  // N'affiche pas la barre sur checkout (expérience plein écran)
  const hidden = ['/checkout'].includes(location.pathname);
  if (hidden) return null;

  const navItems = [
    {
      to: '/',
      end: true,
      icon: Home,
      label: 'Accueil',
    },
    {
      to: '/products',
      icon: Search,
      label: 'Boutique',
    },
    {
      to: '/cart',
      icon: ShoppingBag,
      label: 'Panier',
      badge: getTotalItems() > 0 ? getTotalItems() : null,
    },
    ...(isAuthenticated
      ? [
          {
            to: '/orders',
            icon: Package,
            label: 'Commandes',
          },
          {
            to: '/account/profile',
            icon: User,
            label: 'Compte',
          },
        ]
      : [
          {
            to: '/login',
            icon: User,
            label: 'Connexion',
          },
        ]),
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-1 pt-2 pb-3">
        {navItems.map(({ to, end, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[52px] ${
                isActive ? 'text-rose-500' : 'text-stone-400 hover:text-stone-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Indicateur actif — petit trait rose au dessus de l'icône */}
                <span className={`block w-5 h-0.5 rounded-full mb-1 transition-all ${isActive ? 'bg-rose-500' : 'bg-transparent'}`} />

                <span className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  {badge && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5 leading-none">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-rose-500' : 'text-stone-400'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}