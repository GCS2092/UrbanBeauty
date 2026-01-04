'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { ArrowLeftIcon, PhotoIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useCreateService } from '@/hooks/useServices';
import { useNotifications } from '@/components/admin/NotificationProvider';
import ImageUploader from '@/components/admin/ImageUploader';

function NewServiceForm() {
  const router = useRouter();
  const { mutate: createService, isPending } = useCreateService();
  const notifications = useNotifications();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    available: true,
  });
  const [images, setImages] = useState<Array<{ url: string; type: 'URL' | 'UPLOADED' }>>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createService(
      {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        available: formData.available,
        category: formData.category || undefined,
        images: images.length > 0 ? images.map((img, index) => ({
          url: img.url,
          type: img.type,
          order: index,
          isPrimary: index === 0,
        })) : undefined,
      },
      {
        onSuccess: () => {
          notifications.success('Service créé', 'Le service a été créé avec succès');
          router.push('/dashboard/services');
        },
        onError: (error: any) => {
          notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la création du service');
        },
      }
    );
  };

  // Catégories prédéfinies pour faciliter la saisie
  const categories = [
    'Tresses',
    'Tissage',
    'Crochet',
    'Locks',
    'Coupe',
    'Coloration',
    'Lissage',
    'Soin capillaire',
    'Coiffure mariage',
    'Autre'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-8">
      {/* Header fixe */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/services"
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Nouveau Service</h1>
              <p className="text-xs text-gray-500">Créez votre prestation</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
        {/* Nom du service */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
            Nom du service <span className="text-pink-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            placeholder="Ex: Tresses africaines"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-pink-500 text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Prix et Durée */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label htmlFor="price" className="block text-sm font-semibold text-gray-900 mb-2">
              Prix <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="price"
                required
                min="0"
                step="100"
                placeholder="5000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-pink-500 text-gray-900 placeholder-gray-400 pr-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                FCFA
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label htmlFor="duration" className="block text-sm font-semibold text-gray-900 mb-2">
              Durée <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="duration"
                required
                min="15"
                step="15"
                placeholder="60"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-pink-500 text-gray-900 placeholder-gray-400 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                min
              </span>
            </div>
          </div>
        </div>

        {/* Catégorie */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Catégorie
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all touch-manipulation ${
                  formData.category === cat
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-200'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Décrivez votre service en quelques mots..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-pink-500 text-gray-900 placeholder-gray-400 resize-none"
          />
        </div>

        {/* Disponibilité */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Service disponible</p>
              <p className="text-xs text-gray-500 mt-0.5">Les clients peuvent réserver</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, available: !formData.available })}
              className={`w-14 h-8 rounded-full transition-colors duration-200 ${
                formData.available ? 'bg-pink-500' : 'bg-gray-200'
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  formData.available ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Photos du service
          </label>
          <ImageUploader
            images={images}
            onChange={setImages}
            maxImages={5}
          />
        </div>

        {/* Boutons */}
        <div className="flex gap-3 pt-4">
          <Link
            href="/dashboard/services"
            className="flex-1 px-6 py-4 bg-gray-100 rounded-2xl text-gray-700 font-semibold text-center active:bg-gray-200 transition-colors touch-manipulation"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isPending || !formData.name || !formData.price || !formData.duration}
            className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg shadow-pink-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {isPending ? 'Création...' : 'Créer le service'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewServicePage() {
  return (
    <ProtectedRoute requiredRole={['COIFFEUSE', 'MANICURISTE']}>
      <NewServiceForm />
    </ProtectedRoute>
  );
}
