import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

// Types pour les analytiques Coiffeuse
export interface ProviderAnalytics {
  revenue: {
    total: number;
    thisMonth: number;
    thisWeek: number;
    today: number;
    lastMonth: number;
    growth: number;
  };
  bookings: {
    total: number;
    completed: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    todayCount: number;
    weekCount: number;
    monthCount: number;
    cancellationRate: number;
  };
  services: {
    total: number;
    active: number;
    averageRating: number;
    totalReviews: number;
    topService: {
      id: string;
      name: string;
      bookingsCount: number;
      revenue: number;
    } | null;
    topServices: Array<{
      id: string;
      name: string;
      bookingsCount: number;
      revenue: number;
    }>;
  };
  chartData: {
    last7Days: Array<{
      date: string;
      bookings: number;
      revenue: number;
    }>;
  };
}

// Types pour les analytiques Vendeuse
export interface SellerAnalytics {
  revenue: {
    total: number;
    thisMonth: number;
    thisWeek: number;
    today: number;
    lastMonth: number;
    growth: number;
  };
  orders: {
    total: number;
    delivered: number;
    shipped: number;
    processing: number;
    pending: number;
    cancelled: number;
    todayCount: number;
    weekCount: number;
    monthCount: number;
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
    averageRating: number;
    totalReviews: number;
    topProduct: {
      id: string;
      name: string;
      salesCount: number;
      revenue: number;
    } | null;
    topProducts: Array<{
      id: string;
      name: string;
      salesCount: number;
      revenue: number;
    }>;
  };
  chartData: {
    last7Days: Array<{
      date: string;
      orders: number;
      revenue: number;
    }>;
  };
}

/**
 * Hook pour récupérer les analytiques d'une coiffeuse
 */
export function useProviderAnalytics(options?: { enabled?: boolean }) {
  return useQuery<ProviderAnalytics>({
    queryKey: ['analytics', 'provider'],
    queryFn: async () => {
      const response = await api.get('/api/analytics/provider');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    enabled: options?.enabled !== false, // Par défaut enabled, sauf si explicitement false
  });
}

/**
 * Hook pour récupérer les analytiques d'une vendeuse
 */
export function useSellerAnalytics(options?: { enabled?: boolean }) {
  return useQuery<SellerAnalytics>({
    queryKey: ['analytics', 'seller'],
    queryFn: async () => {
      const response = await api.get('/api/analytics/seller');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    enabled: options?.enabled !== false, // Par défaut enabled, sauf si explicitement false
  });
}

/**
 * Hook générique qui récupère les analytiques selon le rôle
 */
export function useMyAnalytics() {
  return useQuery<ProviderAnalytics | SellerAnalytics>({
    queryKey: ['analytics', 'me'],
    queryFn: async () => {
      const response = await api.get('/api/analytics/me');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

