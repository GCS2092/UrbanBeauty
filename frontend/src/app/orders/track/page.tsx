'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MagnifyingGlassIcon, ShoppingBagIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '@/components/admin/NotificationProvider';
import api from '@/lib/api';
import { formatCurrency, getSelectedCurrency } from '@/utils/currency';

interface Order {
  id: string;
  orderNumber: string;
  trackingCode: string;
  status: string;
  total: number;
  subtotal: number;
  discount: number;
  shippingCost: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      images: Array<{ url: string }>;
    };
  }>;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryDate?: string;
  trackingNumber?: string;
}

export default function TrackOrderPage() {
  const router = useRouter();
  const notifications = useNotifications();
  const currency = getSelectedCurrency();
  const [trackingCode, setTrackingCode] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingCode.trim()) {
      notifications.error('Code requis', 'Veuillez entrer un code de suivi');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.get(`/api/orders/track/${trackingCode.trim().toUpperCase()}`);
      setOrder(response.data);
      notifications.success('Commande trouvée', 'Votre commande a été trouvée avec succès');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Commande introuvable avec ce code');
      setOrder(null);
      notifications.error('Erreur', 'Aucune commande trouvée avec ce code de suivi');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      PROCESSING: { label: 'En traitement', color: 'bg-blue-100 text-blue-800', icon: ClockIcon },
      PAID: { label: 'Payée', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      SHIPPED: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800', icon: ShoppingBagIcon },
      DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: XCircleIcon },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      color: 'bg-gray-100 text-gray-800',
      icon: ClockIcon,
    };

    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Suivre ma commande</h1>
          <p className="text-gray-600">
            Entrez le code de suivi que vous avez reçu après votre commande
          </p>
        </div>

        {/* Formulaire de recherche */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="trackingCode" className="block text-sm font-medium text-gray-700 mb-2">
                Code de suivi
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="trackingCode"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  placeholder="Ex: UB-ABC123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent uppercase"
                  required
                />
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                💡 <strong>Astuce :</strong> Capturez une photo du code de suivi après votre paiement pour le retrouver facilement !
              </p>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Recherche...' : 'Rechercher'}
              </button>
            </div>
          </form>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Résultats */}
        {order && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Détails de la commande</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Commande #{order.orderNumber}
                </p>
              </div>
              {getStatusBadge(order.status)}
            </div>

            {/* Informations de livraison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Livraison à</h3>
                <p className="text-gray-900">{order.customerName}</p>
                <p className="text-gray-600 text-sm">{order.shippingAddress}</p>
                <p className="text-gray-600 text-sm">{order.customerEmail}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Informations</h3>
                <p className="text-gray-600 text-sm">
                  Date de commande : {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                </p>
                {order.estimatedDeliveryDate && (
                  <p className="text-gray-600 text-sm">
                    Livraison estimée : {new Date(order.estimatedDeliveryDate).toLocaleDateString('fr-FR')}
                  </p>
                )}
                {order.trackingNumber && (
                  <p className="text-gray-600 text-sm">
                    Numéro de suivi : {order.trackingNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Articles */}
            <div className="border-t pt-6 mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Articles commandés</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    {item.product.images && item.product.images.length > 0 && (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Quantité : {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(item.price * item.quantity, currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Résumé */}
            <div className="border-t pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatCurrency(order.subtotal, currency)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span>
                    <span>-{formatCurrency(order.discount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span>{order.shippingCost === 0 ? 'Gratuite' : formatCurrency(order.shippingCost, currency)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(order.total, currency)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lien vers la page d'accueil */}
        <div className="text-center mt-8">
          <Link href="/" className="text-pink-600 hover:text-pink-700 font-medium">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

