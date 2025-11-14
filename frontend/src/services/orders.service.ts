import api from '@/lib/api';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    images?: Array<{ url: string }>;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: string;
  billingAddress?: string;
  shippingMethod?: string;
  shippingCost: number;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  notes?: string;
  cancellationReason?: string;
  couponId?: string;
  coupon?: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
  };
  subtotal: number;
  discount: number;
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  payment?: {
    id: string;
    status: string;
  };
  user?: {
    id: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderDto {
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: string;
  billingAddress?: string;
  shippingMethod?: string;
  shippingCost?: number;
  notes?: string;
  couponCode?: string;
  items: CreateOrderItemDto[];
}

export const ordersService = {
  getAll: async (all?: boolean, seller?: boolean): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (all) params.append('all', 'true');
    if (seller) params.append('seller', 'true');
    const queryString = params.toString();
    const response = await api.get<Order[]>(`/api/orders${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/api/orders/${id}`);
    return response.data;
  },

  create: async (data: CreateOrderDto): Promise<Order> => {
    const response = await api.post<Order>('/api/orders', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Order>): Promise<Order> => {
    const response = await api.patch<Order>(`/api/orders/${id}`, data);
    return response.data;
  },
};

