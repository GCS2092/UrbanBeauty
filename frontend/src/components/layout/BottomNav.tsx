'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  HomeIcon,
  CalendarDaysIcon,
  ScissorsIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CubeIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  ScissorsIcon as ScissorsIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  UserIcon as UserIconSolid,
  CubeIcon as CubeIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  SparklesIcon as SparklesIconSolid,
} from '@heroicons/react/24/solid';

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
      <div className="h-20 md:hidden" />
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = active ? item.iconActive : item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-2 px-1 relative transition-all duration-200 touch-manipulation ${
                  active 
                    ? 'text-pink-600' 
                    : 'text-gray-500 hover:text-gray-700 active:text-pink-600'
                }`}
              >
                <div className={`relative ${active ? 'scale-110' : ''} transition-transform duration-200`}>
                  <Icon className="h-6 w-6" />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-pink-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Add safe-area-bottom support */}
      <style jsx global>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
      `}</style>
    </>
  );
}

