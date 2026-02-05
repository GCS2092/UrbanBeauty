'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

type Role = 'CLIENT' | 'COIFFEUSE' | 'MANICURISTE' | 'VENDEUSE' | 'ADMIN';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role | Array<Role>;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (!isLoading && isAuthenticated && requiredRole) {
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      const userRole = user?.role as Role | undefined;
      if (!userRole || !allowedRoles.includes(userRole)) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, isHydrated, user, requiredRole, router]);

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userRole = user?.role as Role | undefined;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Acc?s refus?. Vous n&apos;avez pas les permissions n?cessaires.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
