import api from '@/lib/api';

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usageCount: number;
  userLimit?: number;
  isActive: boolean;
  applicableTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon: Coupon;
  discount: number;
}

export interface ValidateCouponDto {
  code: string;
  totalAmount?: number;
  userId?: string;
}

export const couponsService = {
  validate: async (data: ValidateCouponDto): Promise<ValidateCouponResponse> => {
    const response = await api.post<ValidateCouponResponse>('/api/coupons/validate', data);
    return response.data;
  },

  getAll: async (): Promise<Coupon[]> => {
    const response = await api.get<Coupon[]>('/api/coupons');
    return response.data;
  },

  getById: async (id: string): Promise<Coupon> => {
    const response = await api.get<Coupon>(`/api/coupons/${id}`);
    return response.data;
  },
};

