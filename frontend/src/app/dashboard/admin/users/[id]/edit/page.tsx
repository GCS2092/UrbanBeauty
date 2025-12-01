'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useUser } from '@/hooks/useUsers';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

function EditUserForm({ userId }: { userId: string }) {
  const router = useRouter();
  const { data: user, isLoading: loadingUser } = useUser(userId);
  const notifications = useNotifications();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CLIENT' as 'CLIENT' | 'COIFFEUSE' | 'VENDEUSE' | 'ADMIN',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        phone: user.profile?.phone || '',
        role: user.role,
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (data: { email?: string; firstName?: string; lastName?: string; phone?: string; role?: string }) => {
      // Mettre à jour le profil si nécessaire
      if (data.firstName !== undefined || data.lastName !== undefined || data.phone !== undefined) {
        await api.patch(`/api/users/${userId}/profile`, {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        });
      }
      
      // Mettre à jour le rôle si nécessaire
      if (data.role && data.role !== user?.role) {
        await api.patch(`/api/users/${userId}/role`, { role: data.role });
      }

      // Note: L'email ne peut pas être modifié directement via l'API actuelle
      // Il faudrait créer un endpoint spécifique pour ça
      
      return { success: true };
    },
    onSuccess: () => {
      notifications.success('Utilisateur modifié', 'L\'utilisateur a été modifié avec succès');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      router.push('/dashboard/admin/users');
    },
    onError: (error: any) => {
      notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la modification');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Utilisateur introuvable</p>
          <Link href="/dashboard/admin/users" className="text-pink-600 hover:text-pink-700 mt-4 inline-block">
            Retour aux utilisateurs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Link
          href="/dashboard/admin/users"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-4 sm:mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux utilisateurs
        </Link>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
          Modifier l'utilisateur
        </h1>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (lecture seule) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">L'email ne peut pas être modifié</p>
            </div>

            {/* Rôle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="CLIENT">Client</option>
                <option value="COIFFEUSE">Coiffeuse</option>
                <option value="VENDEUSE">Vendeuse</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive !== false ? 'Actif' : 'Bloqué'}
                </span>
                {user.blockReason && (
                  <span className="text-sm text-gray-500">
                    Raison: {user.blockReason}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Pour modifier le statut, utilisez les actions dans la liste des utilisateurs
              </p>
            </div>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href="/dashboard/admin/users"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditUserPage() {
  const params = useParams();
  const userId = params?.id as string;

  return (
    <ProtectedRoute requiredRole="ADMIN">
      {userId && <EditUserForm userId={userId} />}
    </ProtectedRoute>
  );
}

