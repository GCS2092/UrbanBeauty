'use client';

import Link from 'next/link';
import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon, CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '@/components/admin/NotificationProvider';
import api from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface HairStyleRequest {
  id: string;
  lookbookItemName?: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  hairStyleType: string;
  numberOfBraids?: number;
  braidType?: string;
  numberOfPackages?: number;
  preferredTime?: string;
  preferredDate?: string;
  additionalDetails?: string;
  status: string;
  createdAt: string;
}

function HairStyleRequestsContent() {
  const notifications = useNotifications();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery<HairStyleRequest[]>({
    queryKey: ['hair-style-requests'],
    queryFn: async () => {
      const response = await api.get('/api/hair-style-requests');
      return response.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.put(`/api/hair-style-requests/${id}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hair-style-requests'] });
      notifications.success('Statut mis à jour', 'Le statut de la demande a été mis à jour');
    },
    onError: (error: any) => {
      notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const myRequests = requests.filter(r => r.status !== 'PENDING');

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      REJECTED: 'Refusée',
      COMPLETED: 'Terminée',
    };
    return labels[status as keyof typeof labels] || status;
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
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Demandes de coiffure</h1>

        {/* Demandes en attente */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Demandes disponibles ({pendingRequests.length})
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.hairStyleType}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Client: {request.clientName} • {request.clientPhone}
                      </p>
                      {request.clientEmail && (
                        <p className="text-sm text-gray-600">{request.clientEmail}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {request.numberOfBraids && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Nombre de mèches</p>
                        <p className="text-sm text-gray-600">{request.numberOfBraids}</p>
                      </div>
                    )}
                    {request.braidType && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Type de mèches</p>
                        <p className="text-sm text-gray-600">{request.braidType}</p>
                      </div>
                    )}
                    {request.numberOfPackages && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Nombre de paquets</p>
                        <p className="text-sm text-gray-600">{request.numberOfPackages}</p>
                      </div>
                    )}
                    {request.preferredDate && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Date souhaitée</p>
                        <p className="text-sm text-gray-600">
                          {new Date(request.preferredDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                    {request.preferredTime && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Heure souhaitée</p>
                        <p className="text-sm text-gray-600">
                          {new Date(request.preferredTime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {request.additionalDetails && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Détails supplémentaires</p>
                      <p className="text-sm text-gray-600">{request.additionalDetails}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus.mutate({ id: request.id, status: 'CONFIRMED' })}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckIcon className="h-5 w-5" />
                      Accepter
                    </button>
                    <button
                      onClick={() => updateStatus.mutate({ id: request.id, status: 'REJECTED' })}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mes demandes */}
        {myRequests.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mes demandes ({myRequests.length})</h2>
            <div className="grid grid-cols-1 gap-4">
              {myRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.hairStyleType}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Client: {request.clientName} • {request.clientPhone}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {request.numberOfBraids && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Nombre de mèches</p>
                        <p className="text-sm text-gray-600">{request.numberOfBraids}</p>
                      </div>
                    )}
                    {request.preferredDate && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Date</p>
                        <p className="text-sm text-gray-600">
                          {new Date(request.preferredDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                  </div>

                  {request.status === 'CONFIRMED' && (
                    <button
                      onClick={() => updateStatus.mutate({ id: request.id, status: 'COMPLETED' })}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CheckIcon className="h-5 w-5" />
                      Marquer comme terminée
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {requests.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune demande de coiffure pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HairStyleRequestsPage() {
  return (
    <ProtectedRoute requiredRole="COIFFEUSE">
      <HairStyleRequestsContent />
    </ProtectedRoute>
  );
}

