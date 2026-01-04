'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useServices, useDeleteService } from '@/hooks/useServices';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { formatCurrency, getSelectedCurrency } from '@/utils/currency';
import Image from 'next/image';

function ServicesPageContent() {
  const { user } = useAuth();
  const { data: services = [], isLoading } = useServices();
  const notifications = useNotifications();
  const currency = getSelectedCurrency();
  const { mutate: deleteService, isPending: isDeleting } = useDeleteService();
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const myServices = services;

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = (id: string, name: string) => {
    deleteService(id, {
      onSuccess: () => {
        notifications.success('Service supprimé', 'Le service a été supprimé avec succès');
        setDeleteConfirmId(null);
      },
      onError: (error: any) => {
        notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la suppression');
        setDeleteConfirmId(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-4">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mes Services</h1>
              <p className="text-xs text-gray-500 mt-0.5">{myServices.length} service{myServices.length > 1 ? 's' : ''}</p>
            </div>
            <Link
              href="/dashboard/services/new"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-lg shadow-pink-200 active:scale-[0.98] transition-all touch-manipulation"
            >
              <PlusIcon className="h-5 w-5" />
              Ajouter
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {myServices.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">💇‍♀️</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Aucun service</h2>
            <p className="text-sm text-gray-500 mb-6">Commencez par ajouter votre premier service de coiffure</p>
            <Link
              href="/dashboard/services/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-pink-200 active:scale-[0.98] transition-all touch-manipulation"
            >
              <PlusIcon className="h-5 w-5" />
              Créer mon premier service
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myServices.map((service) => (
              <div 
                key={service.id} 
                className="bg-white rounded-2xl shadow-sm overflow-hidden active:scale-[0.99] transition-transform relative"
              >
                {/* Modal de confirmation de suppression */}
                {deleteConfirmId === service.id && (
                  <div className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center p-4 rounded-2xl">
                    <div className="bg-white rounded-2xl p-5 max-w-xs w-full text-center shadow-xl">
                      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrashIcon className="h-7 w-7 text-red-600" />
                      </div>
                      <p className="font-bold text-gray-900 mb-1">Supprimer ?</p>
                      <p className="text-xs text-gray-500 mb-4 line-clamp-2">"{service.name}"</p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          disabled={isDeleting}
                          className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl active:bg-gray-200 transition-colors touch-manipulation disabled:opacity-50"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteConfirm(service.id, service.name)}
                          disabled={isDeleting}
                          className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-500 rounded-xl active:bg-red-600 transition-colors touch-manipulation disabled:opacity-50"
                        >
                          {isDeleting ? '...' : 'Supprimer'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex">
                  {/* Image */}
                  <div className="w-28 h-28 flex-shrink-0 relative">
                    {service.images?.[0]?.url ? (
                      <Image
                        src={service.images[0].url}
                        alt={service.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                        <span className="text-3xl">💇‍♀️</span>
                      </div>
                    )}
                    {/* Badge disponibilité */}
                    {!service.available && (
                      <div className="absolute top-2 left-2 bg-gray-900/80 text-white text-[10px] px-2 py-0.5 rounded-full">
                        Indisponible
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{service.name}</h3>
                      {service.category && (
                        <p className="text-xs text-gray-500 mt-0.5">{service.category}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-pink-600 font-bold text-sm">
                          {formatCurrency(service.price, currency)}
                        </span>
                        <span className="flex items-center text-xs text-gray-400">
                          <ClockIcon className="h-3 w-3 mr-0.5" />
                          {service.duration}min
                        </span>
                      </div>
                      {service.averageRating && service.averageRating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <StarIcon className="h-3 w-3 text-yellow-400" />
                          <span className="text-xs text-gray-600">{service.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-2">
                      <Link
                        href={`/dashboard/services/${service.id}/edit`}
                        className="flex-1 text-center px-3 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg active:bg-gray-200 transition-colors touch-manipulation inline-flex items-center justify-center"
                      >
                        <PencilIcon className="h-3.5 w-3.5 mr-1" />
                        Modifier
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(service.id)}
                        className="px-3 py-2 text-xs font-medium bg-red-50 text-red-600 rounded-lg active:bg-red-100 transition-colors touch-manipulation inline-flex items-center justify-center"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <ProtectedRoute requiredRole={['COIFFEUSE', 'MANICURISTE']}>
      <ServicesPageContent />
    </ProtectedRoute>
  );
}
