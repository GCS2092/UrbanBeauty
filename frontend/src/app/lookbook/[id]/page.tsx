'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/components/admin/NotificationProvider';
import api from '@/lib/api';

// Données d'exemple - à remplacer par des appels API
const lookbookItems: Record<string, { name: string; description: string; image?: string }> = {
  '1': { name: 'Tresses Box Braids', description: 'Tresses protectives élégantes et durables' },
  '2': { name: 'Perruque Naturelle', description: 'Perruque aux cheveux naturels' },
  '3': { name: 'Locks Entretien', description: 'Entretien et maintenance des locks' },
  '4': { name: 'Coiffure Événement', description: 'Coiffure spéciale pour vos événements' },
  '5': { name: 'Tresses Cornrows', description: 'Tresses tressées près du cuir chevelu' },
  '6': { name: 'Style Bohème', description: 'Style bohème et naturel' },
};

export default function LookbookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const notifications = useNotifications();
  const lookId = typeof params?.id === 'string' ? params.id : '';
  const look = lookbookItems[lookId];

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientName: user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : '',
    clientPhone: user?.profile?.phone || '',
    clientEmail: user?.email || '',
    hairStyleType: look?.name || '',
    numberOfBraids: '',
    braidType: '',
    numberOfPackages: '',
    preferredDate: '',
    preferredTime: '',
    additionalDetails: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientName || !formData.clientPhone) {
      notifications.error('Champs requis', 'Veuillez remplir au moins le nom et le numéro de téléphone');
      return;
    }

    try {
      await api.post('/api/hair-style-requests', {
        lookbookItemId: lookId,
        lookbookItemName: look?.name,
        ...formData,
        numberOfBraids: formData.numberOfBraids ? parseInt(formData.numberOfBraids) : null,
        numberOfPackages: formData.numberOfPackages ? parseInt(formData.numberOfPackages) : null,
        preferredTime: formData.preferredDate && formData.preferredTime 
          ? new Date(`${formData.preferredDate}T${formData.preferredTime}`).toISOString()
          : null,
        preferredDate: formData.preferredDate ? new Date(formData.preferredDate).toISOString() : null,
      });

      notifications.success('Demande envoyée', 'Votre demande de coiffure a été envoyée avec succès. Nous vous contacterons bientôt !');
      router.push('/lookbook');
    } catch (error: any) {
      notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de l\'envoi de la demande');
    }
  };

  if (!look) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Look introuvable</p>
          <Link href="/lookbook" className="text-pink-600 hover:text-pink-700 mt-4 inline-block">
            Retour au lookbook
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/lookbook" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour au lookbook
        </Link>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Image placeholder */}
          <div className="aspect-[4/3] bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
            <span className="text-8xl">✨</span>
          </div>

          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{look.name}</h1>
            <p className="text-gray-600 mb-8">{look.description}</p>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-pink-700 hover:to-rose-700 transition-all shadow-lg shadow-pink-500/50"
              >
                Je veux cette coiffure
              </button>
            ) : (
              <div className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Formulaire de demande</h2>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      ✕ Fermer
                    </button>
                  </div>

                {/* Informations personnelles */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro de téléphone *
                      </label>
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Détails de la coiffure */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails de la coiffure</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de coiffure
                      </label>
                      <input
                        type="text"
                        value={formData.hairStyleType}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de mèches
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.numberOfBraids}
                        onChange={(e) => setFormData({ ...formData, numberOfBraids: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                        placeholder="Ex: 100, 150, 200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de mèches
                      </label>
                      <select
                        value={formData.braidType}
                        onChange={(e) => setFormData({ ...formData, braidType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                      >
                        <option value="">Sélectionner un type</option>
                        <option value="Kanekalon">Kanekalon</option>
                        <option value="X-Pression">X-Pression</option>
                        <option value="Marley">Marley</option>
                        <option value="Synthetic">Synthétique</option>
                        <option value="Human Hair">Cheveux humains</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de paquets
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.numberOfPackages}
                        onChange={(e) => setFormData({ ...formData, numberOfPackages: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                        placeholder="Ex: 2, 3, 4"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date souhaitée
                      </label>
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Heure souhaitée
                      </label>
                      <input
                        type="time"
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Autres détails
                      </label>
                      <textarea
                        value={formData.additionalDetails}
                        onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                        placeholder="Décrivez vos préférences, longueur souhaitée, couleur, etc."
                      />
                    </div>
                  </div>
                </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-700 hover:to-rose-700 transition-all"
                    >
                      Envoyer la demande
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
