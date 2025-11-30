'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  HomeIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CubeIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  UserIcon as UserIconSolid,
  CubeIcon as CubeIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  SparklesIcon as SparklesIconSolid,
} from '@heroicons/react/24/solid';

// Custom Scissors icon since heroicons doesn't have a solid version
const ScissorsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 1 1-5.196-3 3 3 0 0 1 5.196 3Zm1.536.887a2.165 2.165 0 0 1 1.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 1.199M7.848 15.75l1.536-.887m-1.536.887a3 3 0 1 1-5.196 3 3 3 0 0 1 5.196-3Zm1.536-.887a2.165 2.165 0 0 0 1.083-1.838c.005-.352.054-.695.14-1.025m-1.223 2.863 2.077-1.199m0-3.328a4.323 4.323 0 0 1 2.068-1.379l5.325-1.628a4.5 4.5 0 0 1 2.48-.044l.803.215-7.794 4.5m-2.882-1.664A4.33 4.33 0 0 0 10.607 12m3.736 0 7.794 4.5-.802.215a4.5 4.5 0 0 1-2.48-.043l-5.326-1.629a4.324 4.324 0 0 1-2.068-1.379M14.343 12l-2.882 1.664" />
  </svg>
);

const ScissorsIconSolid = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M8.128 9.155a3.751 3.751 0 1 1 .713-1.321l1.136.656a.75.75 0 0 1 .222 1.104l-.006.007a.75.75 0 0 1-1.032.157l-1.033-.596Zm-3.878-3a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm6.271 7.138a.75.75 0 0 1 .921-.053l.008.006a.75.75 0 0 1 .159 1.064l-.009.01a.75.75 0 0 1-1.032.159l-.009-.006a.75.75 0 0 1-.038-1.18Zm2.354-.279 5.59 3.228a4.5 4.5 0 0 0 2.48.044l.803-.215-7.794-4.5-1.08 1.443Zm-1.62 4.13a3.751 3.751 0 1 1-.713-1.321l1.136-.656a.75.75 0 0 1 1.032.157l.006.007a.75.75 0 0 1-.222 1.104l-1.136.656a3.79 3.79 0 0 1-.103.053Zm-3.127-1.989a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm10.741-8.702-5.59 3.228a4.5 4.5 0 0 0-1.785 1.677l-.038.058 7.793-4.5-.803-.215a4.5 4.5 0 0 0-2.48.044l.903-.292Z" clipRule="evenodd" />
  </svg>
);

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconActive: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Don't show for clients or admins
  if (!user || user.role === 'CLIENT' || user.role === 'ADMIN') {
    return null;
  }

  // Navigation items based on role
  const getNavItems = (): NavItem[] => {
    if (user.role === 'COIFFEUSE') {
      return [
        {
          href: '/dashboard',
          label: 'Accueil',
          icon: HomeIcon,
          iconActive: HomeIconSolid,
        },
        {
          href: '/dashboard/bookings',
          label: 'RDV',
          icon: CalendarDaysIcon,
          iconActive: CalendarDaysIconSolid,
        },
        {
          href: '/dashboard/services',
          label: 'Services',
          icon: ScissorsIcon,
          iconActive: ScissorsIconSolid,
        },
        {
          href: '/dashboard/hair-style-requests',
          label: 'Demandes',
          icon: SparklesIcon,
          iconActive: SparklesIconSolid,
        },
        {
          href: '/dashboard/chat',
          label: 'Messages',
          icon: ChatBubbleLeftRightIcon,
          iconActive: ChatBubbleLeftRightIconSolid,
        },
      ];
    }

    if (user.role === 'VENDEUSE') {
      return [
        {
          href: '/dashboard',
          label: 'Accueil',
          icon: HomeIcon,
          iconActive: HomeIconSolid,
        },
        {
          href: '/dashboard/orders',
          label: 'Commandes',
          icon: ShoppingBagIcon,
          iconActive: ShoppingBagIconSolid,
        },
        {
          href: '/dashboard/products',
          label: 'Produits',
          icon: CubeIcon,
          iconActive: CubeIconSolid,
        },
        {
          href: '/dashboard/chat',
          label: 'Messages',
          icon: ChatBubbleLeftRightIcon,
          iconActive: ChatBubbleLeftRightIconSolid,
        },
        {
          href: '/dashboard/profile',
          label: 'Profil',
          icon: UserIcon,
          iconActive: UserIconSolid,
        },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the nav */}
      <div className="h-[72px] md:hidden" />
      
      {/* Bottom Navigation - Style WhatsApp */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="grid grid-cols-5 h-[60px]">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = active ? item.iconActive : item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-0.5 relative touch-manipulation active:opacity-70 transition-opacity"
              >
                {/* Indicateur actif style WhatsApp (barre en haut) */}
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[3px] bg-pink-500 rounded-b-full" />
                )}
                
                {/* Icône */}
                <div className="relative">
                  <Icon className={`h-6 w-6 ${active ? 'text-pink-500' : 'text-gray-500'}`} />
                  
                  {/* Badge notification */}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                
                {/* Label */}
                <span className={`text-[11px] leading-tight ${
                  active 
                    ? 'text-pink-500 font-semibold' 
                    : 'text-gray-500 font-medium'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
