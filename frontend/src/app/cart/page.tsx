'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon, TrashIcon, PlusIcon, MinusIcon, TagIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cart.store';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { couponsService } from '@/services/coupons.service';
import { ordersService } from '@/services/orders.service';
import { formatCurrency, getSelectedCurrency } from '@/utils/currency';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuth();
  const notifications = useNotifications();
  const currency = getSelectedCurrency();
  
  const [checkoutMode, setCheckoutMode] = useState<'choice' | 'register' | 'guest' | 'checkout'>('choice');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  
  const subtotal = getTotal();
  const shipping = subtotal > 50 ? 0 : 5.99; // Livraison gratuite au-dessus de 50€
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

  const handleCheckout = () => {
    if (items.length === 0) {
      notifications.error('Panier vide', 'Votre panier est vide');
      return;
    }

    if (isAuthenticated) {
      router.push('/checkout');
    } else {
      setCheckoutMode('choice');
    }
  };

  const handleGuestCheckout = () => {
    if (items.length === 0) {
      notifications.error('Panier vide', 'Votre panier est vide');
      return;
    }
    setCheckoutMode('guest');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Continuer les achats
          </Link>

          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <span className="text-6xl mb-4 block">🛒</span>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Votre panier est vide</h2>
            <p className="text-gray-600 mb-6">Ajoutez des produits pour commencer vos achats</p>
            <Link
              href="/products"
              className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              Découvrir les produits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Écran de choix : inscription ou commande guest
  if (checkoutMode === 'choice' && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Continuer les achats
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">Finaliser votre commande</h1>

          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-6 mb-8 border-2 border-pink-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">🎁 Bénéficiez de réductions exclusives !</h2>
            <p className="text-gray-700 mb-4">
              En créant un compte, vous bénéficierez automatiquement de <strong>10% de réduction</strong> sur votre première commande 
              et accéderez à des offres spéciales réservées aux membres.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/register"
                className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors text-center"
              >
                Créer un compte (Recommandé)
              </Link>
              <button
                onClick={handleGuestCheckout}
                className="flex-1 bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-gray-300"
              >
                Commander sans compte
              </button>
            </div>
          </div>

          {/* Résumé du panier */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé de votre panier</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{item.name} x{item.quantity}</span>
                  <span className="font-medium">{formatCurrency(item.price * item.quantity, currency)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulaire de livraison pour guest
  if (checkoutMode === 'guest' && !isAuthenticated) {
    return (
      <GuestCheckoutForm 
        items={items}
        subtotal={subtotal}
        shipping={shipping}
        discount={discount}
        total={total}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onBack={() => setCheckoutMode('choice')}
      />
    );
  }

  // Panier normal pour utilisateurs connectés ou après choix
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Continuer les achats
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4">
                {item.image ? (
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">{formatCurrency(item.price, currency)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-2 hover:bg-gray-50"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 text-gray-900 font-medium min-w-[3rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-gray-900 font-medium w-20 text-right">
                    {formatCurrency(item.price * item.quantity, currency)}
                  </span>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Résumé</h2>
              
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                    />
                    <button
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

              <div className="space-y-2 mb-4">
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

              <button
                onClick={handleCheckout}
                className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
              >
                Passer la commande
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour le formulaire de livraison guest
function GuestCheckoutForm({
  items,
  subtotal,
  shipping,
  discount,
  total,
  couponCode,
  setCouponCode,
  appliedCoupon,
  onApplyCoupon,
  onBack,
}: any) {
  const router = useRouter();
  const notifications = useNotifications();
  const currency = getSelectedCurrency();
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    billingAddress: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderItems = items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const orderData = {
        ...formData,
        items: orderItems,
        couponCode: appliedCoupon?.code,
      };

      const newOrder = await ordersService.create(orderData);
      notifications.success('Commande passée', `Votre commande #${newOrder.orderNumber} a été enregistrée !`);
      useCartStore.getState().clearCart();
      router.push(`/order-success?orderId=${newOrder.id}`);
    } catch (error: any) {
      notifications.error('Erreur de commande', error?.response?.data?.message || 'Une erreur est survenue lors de la commande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Informations de livraison</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
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

              <div className="grid grid-cols-2 gap-4">
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Traitement...' : 'Confirmer la commande'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h3>
              <div className="space-y-2 mb-4">
                {items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} x{item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity, currency)}</span>
                  </div>
                ))}
                <div className="border-t pt-2">
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
                    <div className="flex justify-between font-semibold text-lg mt-2">
                      <span>Total</span>
                      <span>{formatCurrency(total, currency)}</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
