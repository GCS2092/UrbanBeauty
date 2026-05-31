import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag,
  Tag, Ticket, Users, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Produits', icon: Package },
  { to: '/admin/orders', label: 'Commandes', icon: ShoppingBag },
  { to: '/admin/categories', label: 'Catégories', icon: Tag },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users },
];

export default function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-stone-900 flex flex-col">
      <div className="p-6 border-b border-stone-800">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">??</span>
          <span className="font-bold text-white">
            Urban<span className="text-rose-400">Beauty</span>
          </span>
        </Link>
        <p className="text-xs text-stone-500 mt-1">Administration</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-stone-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-stone-400 hover:bg-stone-800 hover:text-white transition-all"
        >
          <LogOut size={17} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
