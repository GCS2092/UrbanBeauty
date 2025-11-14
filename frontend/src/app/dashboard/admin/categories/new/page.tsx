'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCreateCategory, useCategories } from '@/hooks/useCategories';
import { useNotifications } from '@/components/admin/NotificationProvider';

function NewCategoryForm() {
  const router = useRouter();
  const { mutate: createCategory, isPending } = useCreateCategory();
  const { data: categories = [] } = useCategories();
  const notifications = useNotifications();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true,
    order: '',
    parentId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createCategory(
      {
        name: formData.name,
        description: formData.description || undefined,
        image: formData.image || undefined,
        isActive: formData.isActive,
        order: formData.order ? parseInt(formData.order) : undefined,
        parentId: formData.parentId || undefined,
      },
      {
        onSuccess: () => {
          notifications.success('Catégorie créée', 'La catégorie a été créée avec succès');
          router.push('/dashboard/admin/categories');
        },
        onError: (error: any) => {
          notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la création de la catégorie');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard/admin/categories"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux catégories
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Nouvelle Catégorie</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la catégorie *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              URL de l'image
            </label>
            <input
              type="url"
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                Ordre d'affichage
              </label>
              <input
                type="number"
                id="order"
                min="0"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie parente
              </label>
              <select
                id="parentId"
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                <option value="">Aucune (catégorie principale)</option>
                {categories
                  .filter(cat => cat.id !== formData.parentId)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Catégorie active
            </label>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link
              href="/dashboard/admin/categories"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Création...' : 'Créer la catégorie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewCategoryPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <NewCategoryForm />
    </ProtectedRoute>
  );
}

