'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCreateProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useNotifications } from '@/components/admin/NotificationProvider';
import ImageUploader from '@/components/admin/ImageUploader';

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
    brand: '',
    sku: '',
    volume: '',
    ingredients: '',
    skinType: '',
    lowStockThreshold: '10',
  });
  const [images, setImages] = useState<Array<{ url: string; type: 'URL' | 'UPLOADED' }>>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createProduct(
      {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
        categoryId: formData.categoryId,
        images: images.length > 0 ? images : undefined,
        brand: formData.brand || undefined,
        sku: formData.sku || undefined,
        volume: formData.volume || undefined,
        ingredients: formData.ingredients || undefined,
        skinType: formData.skinType || undefined,
      },
      {
        onSuccess: () => {
          notifications.success('Produit créé', 'Le produit a été créé avec succès');
          router.push('/dashboard/products');
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
          href="/dashboard/products"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Prix (€) *
              </label>
              <input
                type="number"
                id="price"
                required
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div>
              <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700 mb-2">
                Seuil d'alerte stock
              </label>
              <input
                type="number"
                id="lowStockThreshold"
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                Marque
              </label>
              <input
                type="text"
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                SKU (Référence)
              </label>
              <input
                type="text"
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-2">
                Volume/Format
              </label>
              <input
                type="text"
                id="volume"
                placeholder="ex: 250ml, 50g"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="skinType" className="block text-sm font-medium text-gray-700 mb-2">
                Type de peau
              </label>
              <input
                type="text"
                id="skinType"
                placeholder="ex: Tous types, Sensible, Grasse"
                value={formData.skinType}
                onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
              Ingrédients
            </label>
            <textarea
              id="ingredients"
              rows={3}
              placeholder="Liste des ingrédients principaux"
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images du produit
            </label>
            <ImageUploader
              images={images}
              onChange={setImages}
              maxImages={5}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              href="/dashboard/products"
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    <ProtectedRoute requiredRole="VENDEUSE">
      <NewProductForm />
    </ProtectedRoute>
  );
}

