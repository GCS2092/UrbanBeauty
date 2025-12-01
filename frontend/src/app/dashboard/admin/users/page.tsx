'use client';

import Link from 'next/link';
import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon, PencilIcon, ShieldCheckIcon, PlusIcon, TrashIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useUsers, useUpdateUserRole, useCreateUser, useUpdateUserStatus, useDeleteUser } from '@/hooks/useUsers';
import { useNotifications } from '@/components/admin/NotificationProvider';

function AdminUsersContent() {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState<{ id: string; name: string } | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    role: 'CLIENT' as 'CLIENT' | 'COIFFEUSE' | 'MANICURISTE' | 'VENDEUSE' | 'ADMIN',
    firstName: '',
    lastName: '',
    phone: '',
  });
  
  const { data: users = [], isLoading, error } = useUsers(selectedRole || undefined);
  const { mutate: updateRole } = useUpdateUserRole();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateStatus } = useUpdateUserStatus();
  const { mutate: deleteUser } = useDeleteUser();
  const notifications = useNotifications();

  const handleCreate = () => {
    if (!createForm.email) {
      notifications.error('Champ requis', 'L\'email est obligatoire');
      return;
    }

    createUser(createForm, {
      onSuccess: () => {
        notifications.success('Utilisateur créé', 'L\'utilisateur a été créé avec succès');
        setShowCreateModal(false);
        setCreateForm({
          email: '',
          password: '',
          role: 'CLIENT',
          firstName: '',
          lastName: '',
          phone: '',
        });
      },
      onError: (error: any) => {
        notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la création');
      },
    });
  };

  const handleToggleStatus = (userId: string, currentStatus: boolean, userName: string) => {
    // Si on veut bloquer, ouvrir le modal pour saisir le message
    if (currentStatus) {
      setUserToBlock({ id: userId, name: userName });
      setBlockReason('');
      setShowBlockModal(true);
    } else {
      // Si on veut débloquer, procéder directement
      updateStatus(
        { id: userId, isActive: true },
        {
          onSuccess: () => {
            notifications.success('Utilisateur débloqué', 'L\'utilisateur a été débloqué avec succès');
          },
          onError: (error: any) => {
            notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la modification');
          },
        }
      );
    }
  };

  const handleConfirmBlock = () => {
    if (!userToBlock) return;
    
    updateStatus(
      { id: userToBlock.id, isActive: false, blockReason: blockReason.trim() || undefined },
      {
        onSuccess: () => {
          notifications.success('Utilisateur bloqué', 'L\'utilisateur a été bloqué avec succès');
          setShowBlockModal(false);
          setUserToBlock(null);
          setBlockReason('');
        },
        onError: (error: any) => {
          notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors du blocage');
        },
      }
    );
  };

  const handleDelete = (userId: string, userName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ? Cette action est irréversible.`)) {
      deleteUser(userId, {
        onSuccess: () => {
          notifications.success('Utilisateur supprimé', 'L\'utilisateur a été supprimé avec succès');
        },
        onError: (error: any) => {
          notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la suppression');
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-4 sm:mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour à l'administration
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
            >
              <option value="">Tous les rôles</option>
              <option value="CLIENT">Clients</option>
              <option value="COIFFEUSE">Coiffeuses</option>
              <option value="MANICURISTE">Manicuristes</option>
              <option value="VENDEUSE">Vendeuses</option>
              <option value="ADMIN">Admins</option>
            </select>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors active:scale-[0.98] text-sm sm:text-base"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Créer un utilisateur</span>
              <span className="sm:hidden">Créer</span>
            </button>
          </div>
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Email
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Téléphone
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.profile?.firstName} {user.profile?.lastName}
                        </div>
                        <div className="text-xs text-gray-500 sm:hidden mt-1">{user.email}</div>
                        <div className="text-xs text-gray-500 md:hidden mt-1">{user.profile?.phone || 'N/A'}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className="text-sm text-gray-900">{user.email}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'COIFFEUSE' ? 'bg-pink-100 text-pink-800' :
                          user.role === 'VENDEUSE' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <span className="text-sm text-gray-900">{user.profile?.phone || 'N/A'}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive !== false ? 'Actif' : 'Bloqué'}
                          </span>
                          {user.blockReason && (
                            <span className="text-xs text-gray-500 max-w-[200px] truncate" title={user.blockReason}>
                              {user.blockReason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                          <Link
                            href={`/dashboard/admin/users/${user.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Modifier"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <select
                            value={user.role}
                            onChange={(e) => {
                              const newRole = e.target.value;
                              if (['CLIENT', 'COIFFEUSE', 'MANICURISTE', 'VENDEUSE', 'ADMIN'].includes(newRole)) {
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
                            className="text-xs sm:text-sm px-2 py-1 border border-gray-300 rounded-md text-purple-600 hover:text-purple-900 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                            title="Modifier le rôle"
                          >
                            <option value="CLIENT">CLIENT</option>
                            <option value="COIFFEUSE">COIFFEUSE</option>
                            <option value="MANICURISTE">MANICURISTE</option>
                            <option value="VENDEUSE">VENDEUSE</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <button
                            className={user.isActive !== false ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                            onClick={() => handleToggleStatus(user.id, user.isActive !== false, `${user.profile?.firstName} ${user.profile?.lastName}` || user.email)}
                            title={user.isActive !== false ? 'Bloquer' : 'Débloquer'}
                          >
                            {user.isActive !== false ? (
                              <XMarkIcon className="h-5 w-5" />
                            ) : (
                              <CheckIcon className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDelete(user.id, `${user.profile?.firstName} ${user.profile?.lastName}` || user.email)}
                            title="Supprimer"
                          >
                            <TrashIcon className="h-5 w-5" />
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

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Créer un utilisateur</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe <span className="text-gray-500 text-xs">(optionnel - "password" par défaut)</span>
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Laissez vide pour utiliser 'password' par défaut"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Si laissé vide, l'utilisateur devra changer son mot de passe à la première connexion
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="CLIENT">Client</option>
                  <option value="COIFFEUSE">Coiffeuse</option>
                  <option value="MANICURISTE">Manicuriste</option>
                  <option value="VENDEUSE">Vendeuse</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de blocage */}
      {showBlockModal && userToBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Bloquer l'utilisateur</h2>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setUserToBlock(null);
                  setBlockReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Vous êtes sur le point de bloquer <span className="font-semibold">{userToBlock.name}</span>.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif du blocage <span className="text-gray-500">(optionnel mais recommandé)</span>
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ex: Comportement inapproprié, violation des règles, etc."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Ce message sera visible par l'utilisateur lorsqu'il tentera de se connecter.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setUserToBlock(null);
                  setBlockReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmBlock}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Bloquer
              </button>
            </div>
          </div>
        </div>
      )}
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

