'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  TagIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { Category } from '@/services/categories.service';

function CategoriesContent() {
  const { data: categories = [], isLoading } = useCategories();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();
  const notifications = useNotifications();

  // Toutes les catégories
  const allCategories = categories as Category[];

  // États
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editCategory, setEditCategory] = useState({ name: '', description: '' });

  const handleCreate = () => {
    if (!newCategory.name.trim()) {
      notifications.error('Erreur', 'Le nom de la catégorie est requis');
      return;
    }

    createCategory(
      { name: newCategory.name, description: newCategory.description },
      {
        onSuccess: () => {
          notifications.success('Catégorie créée', 'La catégorie a été ajoutée');
          setNewCategory({ name: '', description: '' });
          setIsAdding(false);
        },
        onError: () => {
          notifications.error('Erreur', 'Impossible de créer la catégorie');
        },
      }
    );
  };

  const handleUpdate = (id: string) => {
    if (!editCategory.name.trim()) {
      notifications.error('Erreur', 'Le nom de la catégorie est requis');
      return;
    }

    updateCategory(
      { id, data: { name: editCategory.name, description: editCategory.description } },
      {
        onSuccess: () => {
          notifications.success('Catégorie modifiée', 'Les modifications ont été enregistrées');
          setEditingId(null);
        },
        onError: () => {
          notifications.error('Erreur', 'Impossible de modifier la catégorie');
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteCategory(id, {
      onSuccess: () => {
        notifications.success('Catégorie supprimée', 'La catégorie a été supprimée');
        setDeleteConfirmId(null);
      },
      onError: () => {
        notifications.error('Erreur', 'Impossible de supprimer la catégorie. Elle contient peut-être des services.');
      },
    });
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditCategory({ name: category.name, description: category.description || '' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Catégories</h1>
                <p className="text-xs text-gray-500">{allCategories.length} catégorie(s)</p>
              </div>
            </div>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium"
              >
                <PlusIcon className="h-4 w-4" />
                Ajouter
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Add new category form */}
        {isAdding && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TagIcon className="h-5 w-5 text-purple-600" />
              Nouvelle catégorie
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nom de la catégorie *"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <input
                type="text"
                placeholder="Description (optionnel)"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewCategory({ name: '', description: '' });
                  }}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium text-sm disabled:opacity-50"
                >
                  {isCreating ? 'Création...' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Categories list */}
        {allCategories.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <TagIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune catégorie</h3>
            <p className="text-sm text-gray-500 mb-4">
              Créez des catégories pour organiser vos services
            </p>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium"
              >
                Créer ma première catégorie
              </button>
            )}
          </div>
        ) : (
          allCategories.map((category) => (
            <div 
              key={category.id} 
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              {editingId === category.id ? (
                // Edit mode
                <div className="p-4">
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nom de la catégorie *"
                      value={editCategory.name}
                      onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Description (optionnel)"
                      value={editCategory.description}
                      onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => handleUpdate(category.id)}
                        disabled={isUpdating}
                        className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium text-sm disabled:opacity-50"
                      >
                        {isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : deleteConfirmId === category.id ? (
                // Delete confirmation
                <div className="p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    Supprimer <strong>"{category.name}"</strong> ?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm"
                    >
                      Non
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={isDeleting}
                      className="flex-1 py-2 bg-red-600 text-white rounded-xl font-medium text-sm disabled:opacity-50"
                    >
                      {isDeleting ? 'Suppression...' : 'Oui, supprimer'}
                    </button>
                  </div>
                </div>
              ) : (
                // Normal view
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                      <TagIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{category.name}</p>
                      {category.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(category)}
                      className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(category.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <ProtectedRoute requiredRole={['COIFFEUSE', 'ADMIN']}>
      <CategoriesContent />
    </ProtectedRoute>
  );
}

