'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  StarIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import {
  useShippingAddresses,
  useCreateShippingAddress,
  useUpdateShippingAddress,
  useDeleteShippingAddress,
  useSetDefaultShippingAddress,
} from '@/hooks/useShippingAddresses';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { ShippingAddress } from '@/services/shipping-addresses.service';

const LABEL_ICONS: Record<string, React.ReactNode> = {
  'Maison': <HomeIcon className="h-5 w-5" />,
  'Bureau': <BuildingOfficeIcon className="h-5 w-5" />,
  'Autre': <MapPinIcon className="h-5 w-5" />,
};

function AddressesContent() {
  const { data: addresses = [], isLoading } = useShippingAddresses();
  const { mutate: createAddress, isPending: isCreating } = useCreateShippingAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateShippingAddress();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteShippingAddress();
  const { mutate: setDefault } = useSetDefaultShippingAddress();
  const notifications = useNotifications();

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: 'Maison',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Cameroun',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.address.trim() || !formData.city.trim()) {
      notifications.warning('Erreur', 'Veuillez remplir les champs obligatoires');
      return;
    }

    if (editingAddress) {
      updateAddress(
        {
          id: editingAddress.id,
          dto: formData,
        },
        {
          onSuccess: () => {
            notifications.success('Modifié', 'Adresse mise à jour');
            resetForm();
          },
          onError: (error: any) => {
            notifications.error('Erreur', error.response?.data?.message || 'Erreur');
          },
        }
      );
    } else {
      createAddress(formData, {
        onSuccess: () => {
          notifications.success('Ajouté', 'Nouvelle adresse enregistrée');
          resetForm();
        },
        onError: (error: any) => {
          notifications.error('Erreur', error.response?.data?.message || 'Erreur');
        },
      });
    }
  };

  const resetForm = () => {
    setFormData({
      label: 'Maison',
      fullName: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'Cameroun',
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleEdit = (addr: ShippingAddress) => {
    setEditingAddress(addr);
    setFormData({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone || '',
      address: addr.address,
      city: addr.city,
      postalCode: addr.postalCode || '',
      country: addr.country,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteAddress(id, {
      onSuccess: () => {
        notifications.success('Supprimé', 'Adresse supprimée');
        setDeleteConfirm(null);
      },
    });
  };

  const handleSetDefault = (id: string) => {
    setDefault(id, {
      onSuccess: () => {
        notifications.success('Défaut', 'Adresse par défaut mise à jour');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-pink-600" />
                  Mes Adresses
                </h1>
                <p className="text-xs text-gray-500">{addresses.length}/10 adresses</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              disabled={addresses.length >= 10}
              className="p-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="px-4 py-4 space-y-4">
        {/* Message si vide */}
        {addresses.length === 0 && !showForm && (
          <div className="bg-white rounded-2xl p-8 text-center">
            <MapPinIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Aucune adresse</h2>
            <p className="text-sm text-gray-500 mb-6">
              Enregistrez vos adresses de livraison pour passer commande plus rapidement
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-pink-600 text-white rounded-xl font-medium text-sm"
            >
              Ajouter une adresse
            </button>
          </div>
        )}

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">
              {editingAddress ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'adresse
                </label>
                <div className="flex gap-2">
                  {['Maison', 'Bureau', 'Autre'].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setFormData({ ...formData, label })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        formData.label === label
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {LABEL_ICONS[label]}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nom complet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Prénom et nom du destinataire"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+237 6XX XXX XXX"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse complète *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Numéro, rue, quartier..."
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Ville */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Douala, Yaoundé..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="BP XXX"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 py-2.5 bg-pink-600 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {isCreating || isUpdating ? '...' : editingAddress ? 'Modifier' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des adresses */}
        {addresses.length > 0 && (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-colors ${
                  addr.isDefault ? 'border-pink-500' : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-gray-100 rounded-lg text-gray-600">
                      {LABEL_ICONS[addr.label] || <MapPinIcon className="h-5 w-5" />}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        {addr.label}
                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-pink-100 text-pink-700 text-[10px] rounded-full font-medium">
                            <StarIconSolid className="h-3 w-3" />
                            Défaut
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">{addr.fullName}</p>
                    </div>
                  </div>
                </div>

                <div className="ml-11 space-y-1 text-sm text-gray-600">
                  <p>{addr.address}</p>
                  <p>{addr.city}{addr.postalCode && `, ${addr.postalCode}`}</p>
                  {addr.phone && (
                    <p className="text-pink-600">{addr.phone}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 ml-11">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-pink-600 bg-pink-50 rounded-lg hover:bg-pink-100"
                    >
                      <StarIcon className="h-3.5 w-3.5" />
                      Défaut
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(addr)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <PencilIcon className="h-3.5 w-3.5" />
                    Modifier
                  </button>
                  {deleteConfirm === addr.id ? (
                    <>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        disabled={isDeleting}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(addr.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AddressesPage() {
  return (
    <ProtectedRoute>
      <AddressesContent />
    </ProtectedRoute>
  );
}

