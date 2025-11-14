'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

function AdminCategoriesContent() {
  // TODO: Créer un hook useCategories pour récupérer les catégories
  const categories = [
    { id: '1', name: 'Soin Visage', slug: 'soin-visage', isActive: true, productCount: 8 },
    { id: '2', name: 'Soin Cheveux', slug: 'soin-cheveux', isActive: true, productCount: 4 },
    { id: '3', name: 'Soin Corps', slug: 'soin-corps', isActive: true, productCount: 2 },
    { id: '4', name: 'Maquillage', slug: 'maquillage', isActive: true, productCount: 2 },
  ];

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
              <p className="text-sm text-gray-600 mb-4">{category.productCount} produits</p>
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
                      // TODO: Implémenter la suppression
                      console.log('Supprimer catégorie:', category.id);
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

