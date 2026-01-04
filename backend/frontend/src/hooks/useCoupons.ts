'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { couponsService, ValidateCouponDto } from '@/services/coupons.service';

export function useCoupons() {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: () => couponsService.getAll(),
  });
}

export function useCoupon(id: string) {
  return useQuery({
    queryKey: ['coupons', id],
    queryFn: () => couponsService.getById(id),
    enabled: !!id && id !== '',
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (data: ValidateCouponDto) => couponsService.validate(data),
  });
}

