'use client';

import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
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
  const { mutate: deleteService } = useDeleteService();

  // Filtrer les services de la coiffeuse
  // Note: Le backend retourne tous les services, mais on peut les filtrer côté frontend
  // Le backend vérifiera les permissions lors de la modification/suppression
  const myServices = services;

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      deleteService(id, {
        onSuccess: () => {
          notifications.success('Service supprimé', 'Le service a été supprimé avec succès');
        },
        onError: (error: any) => {
          notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la suppression');
        },
      });
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
              href="/dashboard" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Mes Services</h1>
          </div>
          <Link
            href="/dashboard/services/new"
            className="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Ajouter un service
          </Link>
        </div>

        {myServices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">💇‍♀️</span>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Aucun service</h2>
            <p className="text-gray-600 mb-6">Commencez par ajouter votre premier service</p>
            <Link
              href="/dashboard/services/new"
              className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              Ajouter un service
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myServices.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {service.images?.[0]?.url ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={service.images[0].url}
                      alt={service.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <span className="text-4xl">💇‍♀️</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{service.category}</p>
                  <p className="text-lg font-bold text-pink-600 mb-2">{formatCurrency(service.price, currency)}</p>
                  <p className="text-xs text-gray-500 mb-4">Durée: {service.duration} min</p>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/services/${service.id}/edit`}
                      className="flex-1 text-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4 inline mr-1" />
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(service.id, service.name)}
                      className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 inline mr-1" />
                      Supprimer
                    </button>
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
    <ProtectedRoute requiredRole="COIFFEUSE">
      <ServicesPageContent />
    </ProtectedRoute>
  );
}

