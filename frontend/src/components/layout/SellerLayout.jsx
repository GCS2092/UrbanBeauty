import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

export default function SellerLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { path: '/seller', label: 'Dashboard', Icon: LayoutDashboard },
    { path: '/seller/products', label: 'Mes produits', Icon: Package },
    { path: '/seller/orders', label: 'Commandes', Icon: ShoppingCart },
    { path: '/seller/stock', label: 'Stock', Icon: ClipboardList },
    { path: '/seller/settings', label: 'Paramètres', Icon: Settings },
  ];

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || '?';

  const NavLinks = () => (
    <nav className="flex-1 p-4 space-y-1">
      {menuItems.map(({ path, label, Icon }) => {
        const active = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              active
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <Icon size={18} strokeWidth={2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const ProfileBlock = () => (
    <div className="p-4 border-t border-stone-800">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 shrink-0 rounded-full bg-rose-600 flex items-center justify-center text-sm font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-stone-400 truncate">{user?.email}</p>
        </div>
      </div>
      <button
        onClick={logout}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-stone-300 hover:bg-stone-800 hover:text-white rounded-lg transition-colors"
      >
        <LogOut size={16} />
        Déconnexion
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 lg:flex lg:bg-stone-950">
      {/* Top bar mobile */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-stone-950 text-white">
        <div>
          <h1 className="text-base font-bold leading-none">UrbanBeauty</h1>
          <p className="text-[11px] text-stone-400 mt-0.5">Espace Vendeur</p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Ouvrir le menu"
          className="p-2 -mr-2 rounded-lg hover:bg-stone-800"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Overlay mobile */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar : tiroir sur mobile, fixe sur desktop */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 bg-stone-900 text-white flex flex-col transform transition-transform duration-200 ease-out
          ${drawerOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-6 border-b border-stone-800">
          <div>
            <h1 className="text-xl font-bold">UrbanBeauty</h1>
            <p className="text-sm text-stone-400 mt-1">Espace Vendeur</p>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Fermer le menu"
            className="lg:hidden p-1 rounded-lg hover:bg-stone-800"
          >
            <X size={20} />
          </button>
        </div>

        <NavLinks />
        <ProfileBlock />
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 min-w-0 lg:overflow-auto bg-stone-50 lg:rounded-tl-2xl lg:rounded-bl-2xl">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
