'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useServices } from '@/hooks/useServices';
import Image from 'next/image';

function AdminServicesContent() {
  const { data: services = [], isLoading, error } = useServices();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erreur lors du chargement des services</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Retour à l'administration
          </Link>
          <Link
            href="/dashboard/admin/services/new"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouveau service
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Gestion des Services</h1>

        {/* Tableau des services */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prestataire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée
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
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-16 w-16 relative rounded-lg overflow-hidden bg-gray-100">
                        {service.images?.[0]?.url ? (
                          <Image
                            src={service.images[0].url}
                            alt={service.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-2xl">💇‍♀️</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.category || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {service.provider ? `${service.provider.firstName} ${service.provider.lastName}` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.price.toFixed(2)} €</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{service.duration} min</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        service.available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.available ? 'Disponible' : 'Indisponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/dashboard/admin/services/${service.id}/edit`}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => {
                            if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
                              // TODO: Implémenter la suppression
                              console.log('Supprimer service:', service.id);
                            }
                          }}
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

        {services.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">💇‍♀️</span>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Aucun service</h2>
            <p className="text-gray-600 mb-6">Commencez par ajouter votre premier service</p>
            <Link
              href="/dashboard/admin/services/new"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              + Ajouter un service
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminServicesPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminServicesContent />
    </ProtectedRoute>
  );
}

