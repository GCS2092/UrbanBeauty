'use client';

import Link from 'next/link';
import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { CheckIcon, XMarkIcon, CalendarIcon, PhoneIcon, EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useNotifications } from '@/components/admin/NotificationProvider';
import api from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all');

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

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; icon: React.ComponentType<any>; label: string }> = {
      PENDING: { color: 'text-orange-600', bg: 'bg-orange-100', icon: ClockIcon, label: 'En attente' },
      CONFIRMED: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircleIcon, label: 'Acceptée' },
      REJECTED: { color: 'text-red-600', bg: 'bg-red-100', icon: XCircleIcon, label: 'Refusée' },
      COMPLETED: { color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircleIcon, label: 'Terminée' },
    };
    return configs[status] || configs.PENDING;
  };

  // Filtrage
  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.status === 'PENDING';
    if (filter === 'confirmed') return r.status === 'CONFIRMED';
    if (filter === 'rejected') return r.status === 'REJECTED';
    return true;
  });

  // Tri par date
  const sortedRequests = [...filteredRequests].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-4">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Demandes Coiffure</h1>
              <p className="text-xs text-gray-500">
                {requests.length} demande{requests.length > 1 ? 's' : ''}
                {pendingCount > 0 && (
                  <span className="text-orange-600 ml-2 font-medium">• {pendingCount} nouvelle{pendingCount > 1 ? 's' : ''}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { key: 'all', label: 'Toutes' },
            { key: 'pending', label: 'Nouvelles', count: pendingCount },
            { key: 'confirmed', label: 'Acceptées' },
            { key: 'rejected', label: 'Refusées' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all touch-manipulation relative ${
                filter === f.key
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                  : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }`}
            >
              {f.label}
              {f.key === 'pending' && pendingCount > 0 && filter !== 'pending' && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {sortedRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="h-10 w-10 text-amber-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Aucune demande</h2>
            <p className="text-sm text-gray-500">
              {filter !== 'all' 
                ? `Aucune demande ${filter === 'pending' ? 'en attente' : filter === 'confirmed' ? 'acceptée' : 'refusée'}`
                : "Vous n'avez pas encore reçu de demande de coiffure"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRequests.map((request) => {
              const statusConfig = getStatusConfig(request.status);
              const StatusIcon = statusConfig.icon;
              const isPending = request.status === 'PENDING';

              return (
                <div 
                  key={request.id} 
                  className={`bg-white rounded-2xl shadow-sm overflow-hidden ${
                    isPending ? 'ring-2 ring-amber-400 ring-offset-2' : ''
                  }`}
                >
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{request.hairStyleType}</h3>
                        <p className="text-sm text-gray-600 mt-0.5">{request.clientName}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Détails */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {request.numberOfBraids && (
                        <div className="bg-gray-50 rounded-xl p-2.5">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Mèches</p>
                          <p className="text-sm font-semibold text-gray-900">{request.numberOfBraids}</p>
                        </div>
                      )}
                      {request.braidType && (
                        <div className="bg-gray-50 rounded-xl p-2.5">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Type</p>
                          <p className="text-sm font-semibold text-gray-900">{request.braidType}</p>
                        </div>
                      )}
                      {request.numberOfPackages && (
                        <div className="bg-gray-50 rounded-xl p-2.5">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Paquets</p>
                          <p className="text-sm font-semibold text-gray-900">{request.numberOfPackages}</p>
                        </div>
                      )}
                      {request.preferredDate && (
                        <div className="bg-gray-50 rounded-xl p-2.5">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Date souhaitée</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {format(new Date(request.preferredDate), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Contact */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <a 
                        href={`tel:${request.clientPhone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium active:bg-green-100 transition-colors touch-manipulation"
                      >
                        <PhoneIcon className="h-4 w-4" />
                        Appeler
                      </a>
                      {request.clientEmail && (
                        <a 
                          href={`mailto:${request.clientEmail}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium active:bg-blue-100 transition-colors touch-manipulation"
                        >
                          <EnvelopeIcon className="h-4 w-4" />
                          Email
                        </a>
                      )}
                    </div>

                    {request.additionalDetails && (
                      <div className="bg-amber-50 rounded-xl p-3 mb-3">
                        <p className="text-xs font-medium text-amber-800 mb-1">Note du client</p>
                        <p className="text-sm text-amber-700">{request.additionalDetails}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {isPending && (
                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => updateStatus.mutate({ id: request.id, status: 'CONFIRMED' })}
                          disabled={updateStatus.isPending}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-semibold active:bg-green-600 transition-colors touch-manipulation disabled:opacity-50"
                        >
                          <CheckIcon className="h-5 w-5" />
                          Accepter
                        </button>
                        <button
                          onClick={() => updateStatus.mutate({ id: request.id, status: 'REJECTED' })}
                          disabled={updateStatus.isPending}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold active:bg-red-600 transition-colors touch-manipulation disabled:opacity-50"
                        >
                          <XMarkIcon className="h-5 w-5" />
                          Refuser
                        </button>
                      </div>
                    )}

                    {request.status === 'CONFIRMED' && (
                      <div className="pt-2 border-t border-gray-100">
                        <button
                          onClick={() => updateStatus.mutate({ id: request.id, status: 'COMPLETED' })}
                          disabled={updateStatus.isPending}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-semibold active:bg-blue-600 transition-colors touch-manipulation disabled:opacity-50"
                        >
                          <CheckIcon className="h-5 w-5" />
                          Marquer terminée
                        </button>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400 text-center">
                        Reçue le {format(new Date(request.createdAt), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
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
