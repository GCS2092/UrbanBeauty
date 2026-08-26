import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SellerLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const menuItems = [
    { path: '/seller', label: 'Dashboard', icon: '📊' },
    { path: '/seller/products', label: 'Mes produits', icon: '📦' },
    { path: '/seller/orders', label: 'Commandes', icon: '🛒' },
    { path: '/seller/stock', label: 'Stock', icon: '📋' },
    { path: '/seller/settings', label: 'Paramètres', icon: '⚙️' },
  ];
  
  return (
    <div className="flex min-h-screen bg-stone-950">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-white flex flex-col">
        <div className="p-6 border-b border-stone-800">
          <h1 className="text-xl font-bold">UrbanBeauty</h1>
          <p className="text-sm text-stone-400 mt-1">Espace Vendeur</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-rose-600 text-white'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-stone-800">
          <div className="mb-4">
            <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-stone-400">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-sm text-stone-300 hover:bg-stone-800 hover:text-white rounded-lg transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto bg-stone-50 lg:rounded-tl-2xl lg:rounded-bl-2xl">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
