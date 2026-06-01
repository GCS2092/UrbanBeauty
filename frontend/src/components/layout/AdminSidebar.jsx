import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag,
  Tag, Ticket, Users, LogOut, Menu, X, Sparkles,
  CreditCard, Settings, BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Produits', icon: Package },
  { to: '/admin/orders', label: 'Commandes', icon: ShoppingBag },
  { to: '/admin/payments', label: 'Paiements', icon: CreditCard },
  { to: '/admin/accounting', label: 'Comptabilité', icon: BookOpen }, // ✅ NOUVEAU
  { to: '/admin/categories', label: 'Catégories', icon: Tag },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/users', label: 'Utilisateurs', icon: Users },
  { to: '/admin/settings', label: 'Paramètres', icon: Settings },
];

export default function AdminSidebar() {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            Urban<span className="text-rose-400">Beauty</span>
          </span>
        </Link>
        <div className="mt-1 ml-10">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">Administration</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                  : 'text-stone-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  isActive ? 'bg-rose-500 shadow-lg shadow-rose-500/30' : 'bg-white/5 group-hover:bg-white/10'
                }`}>
                  <Icon size={14} />
                </div>
                <span>{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="group flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-stone-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-200"
        >
          <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-red-500/20 flex items-center justify-center transition-all">
            <LogOut size={14} />
          </div>
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white shadow-lg border border-white/10"
      >
        <Menu size={18} />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-stone-950 border-r border-white/10 transform transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-stone-400 hover:text-white"
        >
          <X size={15} />
        </button>
        <SidebarContent />
      </aside>

      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-stone-950 border-r border-white/10 sticky top-0 shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}