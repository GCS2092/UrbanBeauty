'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useMaintenanceSettings, useUpdateMaintenanceSettings } from '@/hooks/useMaintenance';
import { useNotifications } from '@/components/admin/NotificationProvider';
import {
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

function MaintenanceContent() {
  const { data: settings, isLoading } = useMaintenanceSettings();
  const { mutate: updateSettings, isPending } = useUpdateMaintenanceSettings();
  const notifications = useNotifications();

  const [formData, setFormData] = useState({
    isBookingDisabled: false,
    bookingMessage: '',
    isChatDisabled: false,
    chatMessage: '',
    isPrestatairesDisabled: false,
    prestatairesMessage: '',
    isAuthDisabled: false,
    authMessage: '',
  });

  // Initialiser le formulaire avec les données existantes
  if (settings && !formData.bookingMessage && settings.bookingMessage) {
    setFormData({
      isBookingDisabled: settings.isBookingDisabled,
      bookingMessage: settings.bookingMessage || '',
      isChatDisabled: settings.isChatDisabled,
      chatMessage: settings.chatMessage || '',
      isPrestatairesDisabled: settings.isPrestatairesDisabled,
      prestatairesMessage: settings.prestatairesMessage || '',
      isAuthDisabled: settings.isAuthDisabled,
      authMessage: settings.authMessage || '',
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateSettings(formData, {
      onSuccess: () => {
        notifications.success('Paramètres mis à jour', 'Les paramètres de maintenance ont été mis à jour avec succès');
      },
      onError: (error: any) => {
        notifications.error('Erreur', error?.response?.data?.message || 'Une erreur est survenue');
      },
    });
  };

  const toggleFeature = (feature: keyof typeof formData) => {
    setFormData((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paramètres de Maintenance
          </h1>
          <p className="text-gray-600">
            Gérez l'accès aux fonctionnalités de la plateforme et personnalisez les messages affichés aux utilisateurs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Réservations */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Prise de rendez-vous</h3>
                  <p className="text-sm text-gray-500">Bloquer la création de nouvelles réservations</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleFeature('isBookingDisabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isBookingDisabled ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isBookingDisabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {formData.isBookingDisabled && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message personnalisé (optionnel)
                </label>
                <textarea
                  value={formData.bookingMessage}
                  onChange={(e) => setFormData({ ...formData, bookingMessage: e.target.value })}
                  placeholder="Ex: La prise de rendez-vous est temporairement désactivée pour maintenance. Veuillez réessayer plus tard."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Chat avec les prestataires</h3>
                  <p className="text-sm text-gray-500">Bloquer les conversations avec les prestataires</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleFeature('isChatDisabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isChatDisabled ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isChatDisabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {formData.isChatDisabled && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message personnalisé (optionnel)
                </label>
                <textarea
                  value={formData.chatMessage}
                  onChange={(e) => setFormData({ ...formData, chatMessage: e.target.value })}
                  placeholder="Ex: Le chat est temporairement indisponible. Contactez-nous par email à contact@urbanbeauty.com"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Section Prestataires */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <UserGroupIcon className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Section Prestataires</h3>
                  <p className="text-sm text-gray-500">Bloquer l'accès à la section prestataires</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleFeature('isPrestatairesDisabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isPrestatairesDisabled ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isPrestatairesDisabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {formData.isPrestatairesDisabled && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message personnalisé (optionnel)
                </label>
                <textarea
                  value={formData.prestatairesMessage}
                  onChange={(e) => setFormData({ ...formData, prestatairesMessage: e.target.value })}
                  placeholder="Ex: La section prestataires est temporairement indisponible."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Authentification */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <LockClosedIcon className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Connexion et Inscription</h3>
                  <p className="text-sm text-gray-500">Bloquer la connexion et l'inscription des utilisateurs</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleFeature('isAuthDisabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isAuthDisabled ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isAuthDisabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {formData.isAuthDisabled && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message personnalisé (optionnel)
                </label>
                <textarea
                  value={formData.authMessage}
                  onChange={(e) => setFormData({ ...formData, authMessage: e.target.value })}
                  placeholder="Ex: L'inscription est temporairement fermée. Les utilisateurs existants peuvent toujours se connecter."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  return (
    <ProtectedRoute requiredRole={['ADMIN']}>
      <MaintenanceContent />
    </ProtectedRoute>
  );
}

