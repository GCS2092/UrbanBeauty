'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useNotifications } from '@/components/admin/NotificationProvider';

interface Coupon {
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
}

interface UpdateCouponDto {
  code?: string;
  description?: string;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  userLimit?: number;
  isActive?: boolean;
  applicableTo?: string;
}

function EditCouponForm({ couponId }: { couponId: string }) {
  const router = useRouter();
  const notifications = useNotifications();
  const queryClient = useQueryClient();

  const { data: coupon, isLoading } = useQuery<Coupon>({
    queryKey: ['coupons', couponId],
    queryFn: async () => {
      const response = await api.get(`/api/coupons/${couponId}`);
      return response.data;
    },
    enabled: !!couponId,
  });

  const [formData, setFormData] = useState<UpdateCouponDto>({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minPurchase: undefined,
    maxDiscount: undefined,
    validFrom: '',
    validUntil: '',
    usageLimit: undefined,
    userLimit: undefined,
    isActive: true,
    applicableTo: 'ALL',
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount,
        validFrom: coupon.validFrom.split('T')[0],
        validUntil: coupon.validUntil.split('T')[0],
        usageLimit: coupon.usageLimit,
        userLimit: coupon.userLimit,
        isActive: coupon.isActive,
        applicableTo: coupon.applicableTo || 'ALL',
      });
    }
  }, [coupon]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateCouponDto) => {
      const response = await api.patch(`/api/coupons/${couponId}`, data);
      return response.data;
    },
    onSuccess: () => {
      notifications.success('Coupon modifié', 'Le coupon a été modifié avec succès');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      router.push('/dashboard/admin/coupons');
    },
    onError: (error: any) => {
      notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la modification du coupon');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code?.trim()) {
      notifications.error('Erreur', 'Le code coupon est requis');
      return;
    }

    if (formData.discountValue && formData.discountValue <= 0) {
      notifications.error('Erreur', 'La valeur de réduction doit être supérieure à 0');
      return;
    }

    if (formData.validFrom && formData.validUntil && new Date(formData.validUntil) <= new Date(formData.validFrom)) {
      notifications.error('Erreur', 'La date de fin doit être postérieure à la date de début');
      return;
    }

    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Coupon introuvable</p>
          <Link href="/dashboard/admin/coupons" className="text-pink-600 hover:text-pink-700 mt-4 inline-block">
            Retour aux coupons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard/admin/coupons"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux coupons
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Modifier le Coupon</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Code coupon *
            </label>
            <input
              type="text"
              id="code"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 mb-2">
                Type de réduction *
              </label>
              <select
                id="discountType"
                required
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              >
                <option value="PERCENTAGE">Pourcentage (%)</option>
                <option value="FIXED">Montant fixe (€)</option>
              </select>
            </div>

            <div>
              <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 mb-2">
                Valeur de réduction *
              </label>
              <input
                type="number"
                id="discountValue"
                required
                min="0"
                step="0.01"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              />
            </div>
          </div>

          {formData.discountType === 'PERCENTAGE' && (
            <div>
              <label htmlFor="maxDiscount" className="block text-sm font-medium text-gray-700 mb-2">
                Réduction maximale (€)
              </label>
              <input
                type="number"
                id="maxDiscount"
                min="0"
                step="0.01"
                value={formData.maxDiscount || ''}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label htmlFor="minPurchase" className="block text-sm font-medium text-gray-700 mb-2">
              Achat minimum (€)
            </label>
            <input
              type="number"
              id="minPurchase"
              min="0"
              step="0.01"
              value={formData.minPurchase || ''}
              onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <input
                type="date"
                id="validFrom"
                required
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin *
              </label>
              <input
                type="date"
                id="validUntil"
                required
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700 mb-2">
                Limite d'utilisation globale
              </label>
              <input
                type="number"
                id="usageLimit"
                min="1"
                value={formData.usageLimit || ''}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Utilisations actuelles : {coupon.usageCount}</p>
            </div>

            <div>
              <label htmlFor="userLimit" className="block text-sm font-medium text-gray-700 mb-2">
                Limite par utilisateur
              </label>
              <input
                type="number"
                id="userLimit"
                min="1"
                value={formData.userLimit || ''}
                onChange={(e) => setFormData({ ...formData, userLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="applicableTo" className="block text-sm font-medium text-gray-700 mb-2">
              Applicable à
            </label>
            <select
              id="applicableTo"
              value={formData.applicableTo}
              onChange={(e) => setFormData({ ...formData, applicableTo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
            >
              <option value="ALL">Tous les produits et services</option>
              <option value="PRODUCTS">Produits uniquement</option>
              <option value="SERVICES">Services uniquement</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Coupon actif
            </label>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link
              href="/dashboard/admin/coupons"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? 'Modification...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditCouponPage() {
  const params = useParams();
  const couponId = typeof params?.id === 'string' ? params.id : '';

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <EditCouponForm couponId={couponId} />
    </ProtectedRoute>
  );
}

