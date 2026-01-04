'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import { useNotifications } from '@/components/admin/NotificationProvider';

function AdminCategoriesContent() {
  const router = useRouter();
  const { data: categories = [], isLoading, error } = useCategories();
  const { mutate: deleteCategory } = useDeleteCategory();
  const notifications = useNotifications();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erreur lors du chargement des catégories</p>
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
            href="/dashboard/admin/categories/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouvelle catégorie
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Gestion des Catégories</h1>

        {/* Grille de catégories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  category.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Slug: {category.slug}</p>
              {category.description && (
                <p className="text-sm text-gray-600 mb-2">{category.description}</p>
              )}
              <div className="flex items-center space-x-2">
                <Link
                  href={`/dashboard/admin/categories/${category.id}/edit`}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Modifier
                </Link>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
                      deleteCategory(category.id, {
                        onSuccess: () => {
                          notifications.success('Catégorie supprimée', 'La catégorie a été supprimée avec succès');
                        },
                        onError: (error: any) => {
                          notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la suppression');
                        },
                      });
                    }
                  }}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminCategoriesContent />
    </ProtectedRoute>
  );
}

