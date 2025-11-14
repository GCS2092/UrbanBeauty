'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  createdAt: string;
}

function AdminCouponsContent() {
  const notifications = useNotifications();
  const queryClient = useQueryClient();

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: async () => {
      const response = await api.get('/api/coupons');
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/coupons/${id}`);
    },
    onSuccess: () => {
      notifications.success('Coupon supprimé', 'Le coupon a été supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
    onError: (error: any) => {
      notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le coupon "${code}" ?`)) {
      deleteMutation.mutate(id);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Retour à l'administration
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Gestion des Coupons</h1>
          </div>
          <Link
            href="/dashboard/admin/coupons/new"
            className="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Créer un coupon
          </Link>
        </div>

        {coupons.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">🎟️</span>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Aucun coupon</h2>
            <p className="text-gray-600 mb-6">Commencez par créer votre premier coupon</p>
            <Link
              href="/dashboard/admin/coupons/new"
              className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              Créer un coupon
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{coupon.code}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {coupon.discountType === 'PERCENTAGE' ? 'Pourcentage' : 'Montant fixe'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {coupon.discountType === 'PERCENTAGE' 
                            ? `${coupon.discountValue}%`
                            : `${coupon.discountValue.toFixed(2)} €`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <div>Du {format(new Date(coupon.validFrom), 'dd MMM yyyy', { locale: fr })}</div>
                          <div>Au {format(new Date(coupon.validUntil), 'dd MMM yyyy', { locale: fr })}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {coupon.usageCount} / {coupon.usageLimit || '∞'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {coupon.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/admin/coupons/${coupon.id}/edit`}
                            className="text-pink-600 hover:text-pink-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(coupon.id, coupon.code)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminCouponsPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminCouponsContent />
    </ProtectedRoute>
  );
}

