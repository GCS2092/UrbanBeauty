'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCreateProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useNotifications } from '@/components/admin/NotificationProvider';

function NewProductForm() {
  const router = useRouter();
  const { mutate: createProduct, isPending } = useCreateProduct();
  const { data: categories = [] } = useCategories();
  const notifications = useNotifications();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrls: [''],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId) {
      notifications.error('Erreur', 'Veuillez sélectionner une catégorie');
      return;
    }

    // Filtrer les URLs vides et créer les images
    const images = formData.imageUrls
      .filter(url => url.trim() !== '')
      .map((url, index) => ({
        url: url.trim(),
        type: 'URL' as const,
        order: index,
        isPrimary: index === 0,
      }));

    if (images.length === 0) {
      notifications.error('Erreur', 'Veuillez ajouter au moins une image');
      return;
    }

    createProduct(
      {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: formData.categoryId,
        images,
      },
      {
        onSuccess: () => {
          notifications.success('Produit créé', 'Le produit a été créé avec succès');
          router.push('/dashboard/admin/products');
        },
        onError: (error: any) => {
          notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la création du produit');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard/admin/products"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux produits
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Nouveau Produit</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom du produit *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Prix (€) *
              </label>
              <input
                type="number"
                id="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                Stock *
              </label>
              <input
                type="number"
                id="stock"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              id="categoryId"
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images (URLs) *
            </label>
            <div className="space-y-2">
              {formData.imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...formData.imageUrls];
                      newUrls[index] = e.target.value;
                      setFormData({ ...formData, imageUrls: newUrls });
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                  />
                  {formData.imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newUrls = formData.imageUrls.filter((_, i) => i !== index);
                        setFormData({ ...formData, imageUrls: newUrls });
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, imageUrls: [...formData.imageUrls, ''] })}
                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                + Ajouter une autre image
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Ajoutez au moins une image URL. Vous pouvez ajouter plusieurs images.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link
              href="/dashboard/admin/products"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Création...' : 'Créer le produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <NewProductForm />
    </ProtectedRoute>
  );
}

