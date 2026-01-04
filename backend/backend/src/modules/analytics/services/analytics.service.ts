import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

// Helper functions for date manipulation (avoiding date-fns dependency)
function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Monday is first day
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfWeek(date: Date): Date {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

function startOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  result.setHours(23, 59, 59, 999);
  return result;
}

function subMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
}

function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

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

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Analytiques pour une COIFFEUSE
   */
  async getProviderAnalytics(userId: string): Promise<ProviderAnalytics> {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Récupérer le profil du provider
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return this.emptyProviderAnalytics();
    }

    const providerId = profile.id;

    // Récupérer tous les services du provider
    const services = await this.prisma.service.findMany({
      where: { providerId },
      include: {
        bookings: {
          include: {
            payment: true,
          },
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    const serviceIds = services.map((s) => s.id);

    // Récupérer toutes les réservations
    const allBookings = await this.prisma.booking.findMany({
      where: { serviceId: { in: serviceIds } },
      include: {
        service: true,
        payment: true,
      },
    });

    // === CALCULS REVENUS ===
    const calculateRevenue = (bookings: typeof allBookings) => {
      return bookings
        .filter((b) => b.status === 'COMPLETED')
        .reduce((sum, b) => {
          if (b.payment && b.payment.status === 'COMPLETED') {
            return sum + b.payment.amount;
          }
          return sum + (b.service?.price || 0);
        }, 0);
    };

    const totalRevenue = calculateRevenue(allBookings);

    const thisMonthBookings = allBookings.filter((b) => {
      const date = new Date(b.date);
      return date >= monthStart && date <= monthEnd;
    });
    const thisMonthRevenue = calculateRevenue(thisMonthBookings);

    const thisWeekBookings = allBookings.filter((b) => {
      const date = new Date(b.date);
      return date >= weekStart && date <= weekEnd;
    });
    const thisWeekRevenue = calculateRevenue(thisWeekBookings);

    const todayBookings = allBookings.filter((b) => {
      const date = new Date(b.date);
      return date >= todayStart && date <= todayEnd;
    });
    const todayRevenue = calculateRevenue(todayBookings);

    const lastMonthBookings = allBookings.filter((b) => {
      const date = new Date(b.date);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });
    const lastMonthRevenue = calculateRevenue(lastMonthBookings);

    const growth =
      lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : thisMonthRevenue > 0
        ? 100
        : 0;

    // === CALCULS RÉSERVATIONS ===
    const completedCount = allBookings.filter((b) => b.status === 'COMPLETED').length;
    const confirmedCount = allBookings.filter((b) => b.status === 'CONFIRMED').length;
    const pendingCount = allBookings.filter((b) => b.status === 'PENDING').length;
    const cancelledCount = allBookings.filter((b) => b.status === 'CANCELLED').length;
    const cancellationRate =
      allBookings.length > 0 ? Math.round((cancelledCount / allBookings.length) * 100) : 0;

    // === CALCULS SERVICES ===
    const activeServices = services.filter((s) => s.available).length;
    const allRatings = services.filter((s) => s.averageRating && s.averageRating > 0);
    const averageRating =
      allRatings.length > 0
        ? Math.round(
            (allRatings.reduce((sum, s) => sum + (s.averageRating || 0), 0) / allRatings.length) * 10
          ) / 10
        : 0;
    const totalReviews = services.reduce((sum, s) => sum + (s._count?.reviews || 0), 0);

    // Top services (top 5)
    const servicesWithRevenue = services.map((s) => {
      const serviceBookings = allBookings.filter(
        (b) => b.serviceId === s.id && b.status === 'COMPLETED'
      );
      const revenue = serviceBookings.reduce((sum, b) => sum + (s.price || 0), 0);
      return {
        id: s.id,
        name: s.name,
        bookingsCount: serviceBookings.length,
        revenue,
      };
    });
    const sortedServices = servicesWithRevenue.sort((a, b) => b.bookingsCount - a.bookingsCount);
    const topService = sortedServices.length > 0 ? sortedServices[0] : null;
    const topServices = sortedServices.slice(0, 5);

    // === DONNÉES GRAPHIQUE (7 derniers jours) ===
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const dayBookings = allBookings.filter((b) => {
        const bDate = new Date(b.date);
        return bDate >= dayStart && bDate <= dayEnd;
      });

      return {
        date: formatDate(date),
        bookings: dayBookings.length,
        revenue: calculateRevenue(dayBookings),
      };
    });

    return {
      revenue: {
        total: Math.round(totalRevenue),
        thisMonth: Math.round(thisMonthRevenue),
        thisWeek: Math.round(thisWeekRevenue),
        today: Math.round(todayRevenue),
        lastMonth: Math.round(lastMonthRevenue),
        growth,
      },
      bookings: {
        total: allBookings.length,
        completed: completedCount,
        confirmed: confirmedCount,
        pending: pendingCount,
        cancelled: cancelledCount,
        todayCount: todayBookings.length,
        weekCount: thisWeekBookings.length,
        monthCount: thisMonthBookings.length,
        cancellationRate,
      },
      services: {
        total: services.length,
        active: activeServices,
        averageRating,
        totalReviews,
        topService,
        topServices,
      },
      chartData: {
        last7Days,
      },
    };
  }

  /**
   * Analytiques pour une VENDEUSE
   */
  async getSellerAnalytics(userId: string): Promise<SellerAnalytics> {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Récupérer tous les produits du vendeur
    const products = await this.prisma.product.findMany({
      where: { sellerId: userId },
      include: {
        orders: {
          include: {
            order: true,
          },
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    const productIds = products.map((p) => p.id);

    // Récupérer toutes les commandes contenant des produits du vendeur
    const orderItems = await this.prisma.orderItem.findMany({
      where: { productId: { in: productIds } },
      include: {
        order: {
          include: {
            payment: true,
          },
        },
        product: true,
      },
    });

    // Grouper par commande unique
    const orderMap = new Map<string, typeof orderItems>();
    orderItems.forEach((item) => {
      const existing = orderMap.get(item.orderId) || [];
      existing.push(item);
      orderMap.set(item.orderId, existing);
    });

    // === CALCULS REVENUS ===
    const calculateRevenue = (items: typeof orderItems, statuses: string[]) => {
      return items
        .filter((item) => statuses.includes(item.order.status))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const completedStatuses = ['DELIVERED', 'SHIPPED', 'PAID'];
    const totalRevenue = calculateRevenue(orderItems, completedStatuses);

    const thisMonthItems = orderItems.filter((item) => {
      const date = new Date(item.order.createdAt);
      return date >= monthStart && date <= monthEnd;
    });
    const thisMonthRevenue = calculateRevenue(thisMonthItems, completedStatuses);

    const thisWeekItems = orderItems.filter((item) => {
      const date = new Date(item.order.createdAt);
      return date >= weekStart && date <= weekEnd;
    });
    const thisWeekRevenue = calculateRevenue(thisWeekItems, completedStatuses);

    const todayItems = orderItems.filter((item) => {
      const date = new Date(item.order.createdAt);
      return date >= todayStart && date <= todayEnd;
    });
    const todayRevenue = calculateRevenue(todayItems, completedStatuses);

    const lastMonthItems = orderItems.filter((item) => {
      const date = new Date(item.order.createdAt);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });
    const lastMonthRevenue = calculateRevenue(lastMonthItems, completedStatuses);

    const growth =
      lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : thisMonthRevenue > 0
        ? 100
        : 0;

    // === CALCULS COMMANDES ===
    const uniqueOrders = Array.from(orderMap.keys()).map((orderId) => {
      const items = orderMap.get(orderId)!;
      return items[0].order;
    });

    const deliveredCount = uniqueOrders.filter((o) => o.status === 'DELIVERED').length;
    const shippedCount = uniqueOrders.filter((o) => o.status === 'SHIPPED').length;
    const processingCount = uniqueOrders.filter((o) => o.status === 'PROCESSING').length;
    const pendingCount = uniqueOrders.filter((o) => o.status === 'PENDING').length;
    const cancelledCount = uniqueOrders.filter((o) => o.status === 'CANCELLED').length;

    const todayOrders = uniqueOrders.filter((o) => {
      const date = new Date(o.createdAt);
      return date >= todayStart && date <= todayEnd;
    });

    const weekOrders = uniqueOrders.filter((o) => {
      const date = new Date(o.createdAt);
      return date >= weekStart && date <= weekEnd;
    });

    const monthOrders = uniqueOrders.filter((o) => {
      const date = new Date(o.createdAt);
      return date >= monthStart && date <= monthEnd;
    });

    // === CALCULS PRODUITS ===
    const activeProducts = products.filter((p) => p.isActive).length;
    const lowStockProducts = products.filter(
      (p) => p.isActive && p.stock <= (p.lowStockThreshold || 10) && p.stock > 0
    ).length;
    const outOfStockProducts = products.filter((p) => p.isActive && p.stock === 0).length;

    const productsWithRating = products.filter((p) => p.averageRating && p.averageRating > 0);
    const averageRating =
      productsWithRating.length > 0
        ? Math.round(
            (productsWithRating.reduce((sum, p) => sum + (p.averageRating || 0), 0) /
              productsWithRating.length) *
              10
          ) / 10
        : 0;
    const totalReviews = products.reduce((sum, p) => sum + (p._count?.reviews || 0), 0);

    // Top produits (top 5)
    const productsWithRevenue = products.map((p) => {
      const productItems = orderItems.filter(
        (item) => item.productId === p.id && completedStatuses.includes(item.order.status)
      );
      const revenue = productItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const salesCount = productItems.reduce((sum, item) => sum + item.quantity, 0);
      return {
        id: p.id,
        name: p.name,
        salesCount,
        revenue,
      };
    });
    const sortedProducts = productsWithRevenue.sort((a, b) => b.salesCount - a.salesCount);
    const topProduct = sortedProducts.length > 0 ? sortedProducts[0] : null;
    const topProducts = sortedProducts.slice(0, 5);

    // === DONNÉES GRAPHIQUE (7 derniers jours) ===
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const dayItems = orderItems.filter((item) => {
        const oDate = new Date(item.order.createdAt);
        return oDate >= dayStart && oDate <= dayEnd;
      });

      const dayOrderIds = new Set(dayItems.map((item) => item.orderId));

      return {
        date: formatDate(date),
        orders: dayOrderIds.size,
        revenue: calculateRevenue(dayItems, completedStatuses),
      };
    });

    return {
      revenue: {
        total: Math.round(totalRevenue),
        thisMonth: Math.round(thisMonthRevenue),
        thisWeek: Math.round(thisWeekRevenue),
        today: Math.round(todayRevenue),
        lastMonth: Math.round(lastMonthRevenue),
        growth,
      },
      orders: {
        total: uniqueOrders.length,
        delivered: deliveredCount,
        shipped: shippedCount,
        processing: processingCount,
        pending: pendingCount,
        cancelled: cancelledCount,
        todayCount: todayOrders.length,
        weekCount: weekOrders.length,
        monthCount: monthOrders.length,
      },
      products: {
        total: products.length,
        active: activeProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        averageRating,
        totalReviews,
        topProduct,
        topProducts,
      },
      chartData: {
        last7Days,
      },
    };
  }

  private emptyProviderAnalytics(): ProviderAnalytics {
    return {
      revenue: {
        total: 0,
        thisMonth: 0,
        thisWeek: 0,
        today: 0,
        lastMonth: 0,
        growth: 0,
      },
      bookings: {
        total: 0,
        completed: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
        todayCount: 0,
        weekCount: 0,
        monthCount: 0,
        cancellationRate: 0,
      },
      services: {
        total: 0,
        active: 0,
        averageRating: 0,
        totalReviews: 0,
        topService: null,
        topServices: [],
      },
      chartData: {
        last7Days: [],
      },
    };
  }
}
