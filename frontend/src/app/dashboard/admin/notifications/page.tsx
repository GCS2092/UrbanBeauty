'use client';

import Link from 'next/link';
import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon, BellIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '@/components/admin/NotificationProvider';
import api from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

function AdminNotificationsContent() {
  const notifications = useNotifications();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    userId: '',
    topic: '',
    type: 'general',
  });

  const sendMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/notifications/send', data);
      return response.data;
    },
    onSuccess: () => {
      notifications.success('Notification envoyée', 'La notification a été envoyée avec succès');
      setFormData({
        title: '',
        body: '',
        userId: '',
        topic: '',
        type: 'general',
      });
    },
    onError: (error: any) => {
      notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de l\'envoi');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.body) {
      notifications.error('Champs requis', 'Le titre et le message sont obligatoires');
      return;
    }

    if (!formData.userId && !formData.topic) {
      notifications.error('Destinataire requis', 'Veuillez spécifier un utilisateur ou un topic');
      return;
    }

    sendMutation.mutate({
      title: formData.title,
      body: formData.body,
      userId: formData.userId || undefined,
      topic: formData.topic || undefined,
      data: {
        type: formData.type,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour à l'administration
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Envoyer une notification</h1>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                placeholder="Titre de la notification"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                required
                rows={4}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                placeholder="Contenu de la notification"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de notification
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              >
                <option value="general">Général</option>
                <option value="order">Commande</option>
                <option value="booking">Réservation</option>
                <option value="product">Produit</option>
                <option value="service">Service</option>
                <option value="message">Message</option>
              </select>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Destinataire</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Utilisateur (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value, topic: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    placeholder="ID de l'utilisateur"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Laissez vide si vous utilisez un topic
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OU</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value, userId: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    placeholder="Ex: all_users, clients, etc."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Envoyer à tous les utilisateurs abonnés à ce topic
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={sendMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              {sendMutation.isPending ? 'Envoi...' : 'Envoyer la notification'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminNotificationsPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminNotificationsContent />
    </ProtectedRoute>
  );
}

