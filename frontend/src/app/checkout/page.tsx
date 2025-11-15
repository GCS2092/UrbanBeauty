'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon, TagIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cart.store';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { useCreateOrder } from '@/hooks/useOrders';
import { couponsService } from '@/services/coupons.service';
import { formatCurrency, getSelectedCurrency, convertCurrency } from '@/utils/currency';

function CheckoutContent() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuth();
  const { mutate: createOrder, isPending: isSubmitting } = useCreateOrder();
  const notifications = useNotifications();
  const currency = getSelectedCurrency();

  // Rediriger les admins (ils ne peuvent pas commander)
  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      router.push('/dashboard/admin');
    }
  }, [isAuthenticated, user?.role, router]);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    billingAddress: '',
    notes: '',
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        customerName: `${user.profile.firstName} ${user.profile.lastName}`,
        customerEmail: user.email || '',
        customerPhone: user.profile.phone || '',
        shippingAddress: user.profile.address || '',
        billingAddress: user.profile.address || '',
        notes: '',
      });
    }
  }, [user]);

  const subtotal = getTotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal - discount + shipping;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      notifications.error('Code requis', 'Veuillez entrer un code coupon');
      return;
    }

    try {
      const { coupon, discount } = await couponsService.validate({
        code: couponCode,
        totalAmount: subtotal,
        userId: user?.id,
      });

      setDiscount(discount);
      setAppliedCoupon({ code: coupon.code, discount });
      notifications.success('Coupon appliqué', `Vous bénéficiez de ${formatCurrency(discount, currency)} de réduction !`);
    } catch (error: any) {
      notifications.error('Coupon invalide', error?.response?.data?.message || 'Le code coupon n\'est pas valide');
      setCouponCode('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const orderItems = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const orderData = {
      ...formData,
      items: orderItems,
      couponCode: appliedCoupon?.code,
      shippingCost: subtotal > 50 ? 0 : 5.99,
    };

    createOrder(orderData, {
      onSuccess: (newOrder) => {
        notifications.success('Commande passée', `Votre commande #${newOrder.orderNumber} a été enregistrée !`);
        clearCart();
        router.push(`/order-success?orderNumber=${newOrder.orderNumber}`);
      },
      onError: (error: any) => {
        notifications.error('Erreur de commande', error?.response?.data?.message || 'Une erreur est survenue lors de la commande.');
      },
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Votre panier est vide</p>
          <Link href="/products" className="text-pink-600 hover:text-pink-700">
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/cart"
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour au panier
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Finaliser votre commande</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations de livraison</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse de livraison *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.shippingAddress}
                      onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                      placeholder="Rue, numéro, code postal, ville"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse de facturation (optionnel)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.billingAddress}
                      onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                      placeholder="Identique à l'adresse de livraison si laissé vide"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optionnel)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                      placeholder="Instructions spéciales pour la livraison"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Méthode de paiement</h2>
                <div className="border border-gray-300 rounded-lg p-4 flex items-center gap-3">
                  <CreditCardIcon className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Paiement à la livraison</p>
                    <p className="text-sm text-gray-600">Vous paierez lors de la réception de votre commande</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Traitement...' : 'Confirmer la commande'}
              </button>
            </form>
          </div>

          {/* Résumé */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Résumé</h2>

              {/* Articles */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.image ? (
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">✨</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-600">Qté: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.price * item.quantity, currency)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Code coupon */}
              {!appliedCoupon && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code promo
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="WELCOME10"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <TagIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {appliedCoupon && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-800">
                      Coupon {appliedCoupon.code} appliqué
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setDiscount(0);
                        setCouponCode('');
                      }}
                      className="text-green-600 hover:text-green-700 text-sm"
                    >
                      Retirer
                    </button>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    -{formatCurrency(appliedCoupon.discount, currency)}
                  </p>
                </div>
              )}

              <div className="space-y-2 mb-4 border-t pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span>
                    <span>-{formatCurrency(discount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span>{shipping === 0 ? 'Gratuite' : formatCurrency(shipping, currency)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(total, currency)}</span>
                </div>
              </div>

              {subtotal < 50 && (
                <p className="text-xs text-gray-500 mb-4 text-center">
                  Ajoutez {formatCurrency(50 - subtotal, currency)} pour la livraison gratuite
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  // Permettre l'accès aux invités (non authentifiés) et aux utilisateurs authentifiés
  return <CheckoutContent />;
}

