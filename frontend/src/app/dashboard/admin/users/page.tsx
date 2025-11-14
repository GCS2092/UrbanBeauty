'use client';

import Link from 'next/link';
import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon, PencilIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useUsers, useUpdateUserRole } from '@/hooks/useUsers';
import { useNotifications } from '@/components/admin/NotificationProvider';

function AdminUsersContent() {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { data: users = [], isLoading, error } = useUsers(selectedRole || undefined);
  const { mutate: updateRole } = useUpdateUserRole();
  const notifications = useNotifications();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour à l'administration
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="">Tous les rôles</option>
            <option value="CLIENT">Clients</option>
            <option value="COIFFEUSE">Coiffeuses</option>
            <option value="VENDEUSE">Vendeuses</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Erreur lors du chargement des utilisateurs</p>
          </div>
        )}

        {/* Tableau des utilisateurs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.profile?.firstName} {user.profile?.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{user.email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'COIFFEUSE' ? 'bg-pink-100 text-pink-800' :
                          user.role === 'VENDEUSE' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{user.profile?.phone || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/dashboard/admin/users/${user.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            className="text-purple-600 hover:text-purple-900"
                            onClick={() => {
                              const newRole = prompt(
                                `Modifier le rôle de ${user.profile?.firstName} ${user.profile?.lastName}\n\nRôle actuel: ${user.role}\n\nNouveaux rôles: CLIENT, COIFFEUSE, VENDEUSE, ADMIN`,
                                user.role
                              );
                              if (newRole && ['CLIENT', 'COIFFEUSE', 'VENDEUSE', 'ADMIN'].includes(newRole)) {
                                updateRole(
                                  { id: user.id, role: newRole as any },
                                  {
                                    onSuccess: () => {
                                      notifications.success('Rôle modifié', 'Le rôle a été modifié avec succès');
                                    },
                                    onError: (error: any) => {
                                      notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la modification du rôle');
                                    },
                                  }
                                );
                              }
                            }}
                          >
                            <ShieldCheckIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminUsersContent />
    </ProtectedRoute>
  );
}

