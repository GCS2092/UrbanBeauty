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
import { formatCurrency, getCurrencyForRole, Currency } from '@/utils/currency';
import CurrencySelector from '@/components/shared/CurrencySelector';

function CartPageContent() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuth();
  
  // Rediriger les admins
  if (user?.role === 'ADMIN') {
    router.push('/dashboard/admin');
    return null;
  }
  const notifications = useNotifications();
  // Clients voient dans leur devise choisie
  const currency = getCurrencyForRole(user?.role);
  
  const [checkoutMode, setCheckoutMode] = useState<'choice' | 'register' | 'guest' | 'checkout'>('choice');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  
  const subtotal = getTotal();
  const shipping = subtotal > 50 ? 0 : 5.99; // Livraison gratuite au-dessus de 50€
  const total = subtotal - discount + shipping;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      notifications.warning('Code requis', 'Veuillez entrer un code promo');
      return;
    }

    try {
      const coupon = await couponsService.validate({ code: couponCode, totalAmount: subtotal });
      if (coupon.valid) {
        setAppliedCoupon(coupon);
        setDiscount(coupon.discount);
        notifications.success('Code appliqué', `Réduction de ${coupon.discount}€ appliquée`);
      } else {
        notifications.error('Code invalide', 'Ce code promo n\'est pas valide');
      }
    } catch (error: any) {
      notifications.error('Erreur', error?.response?.data?.message || 'Erreur lors de la validation du code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
    notifications.info('Code retiré', 'Le code promo a été retiré');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <Link 
            href="/products" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-8"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Retour aux produits
          </Link>
          <div className="text-center">
            <span className="text-6xl mb-4 block">🛒</span>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Votre panier est vide</h1>
            <p className="text-gray-600 mb-8">Découvrez nos produits et services</p>
            <Link
              href="/products"
              className="inline-block bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              Voir les produits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/products" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Retour aux produits
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item: any) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-6 flex flex-col sm:flex-row gap-4">
                {/* Image */}
                <div className="relative w-full sm:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">✨</span>
                    </div>
                  )}
                </div>

                {/* Détails */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-pink-600 font-semibold">{formatCurrency(item.price, currency)}</p>
                  </div>

                  {/* Quantité et actions */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        className="p-2 hover:bg-gray-100 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <MinusIcon className="h-4 w-4 text-gray-600" />
                      </button>
                      <span className="px-4 py-2 text-sm font-medium text-gray-900 min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                        disabled={item.quantity >= item.stock}
                      >
                        <PlusIcon className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer du panier"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Prix total pour cet article */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(item.price * item.quantity, currency)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé et checkout */}
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

              {/* Code promo */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Code promo"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      onClick={handleRemoveCoupon}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Retirer
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
                    >
                      <TagIcon className="h-5 w-5" />
                      Appliquer
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="mt-2 text-sm text-green-600">
                    Code {appliedCoupon.coupon.code} appliqué : -{appliedCoupon.discount}€
                  </p>
                )}
              </div>

              {/* Sélecteur de devise */}
              <div className="mb-6">
                <CurrencySelector />
              </div>

              {/* Mode de checkout */}
              {checkoutMode === 'choice' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    {isAuthenticated 
                      ? 'Vous pouvez passer commande directement ou continuer en tant qu\'invité'
                      : 'Créez un compte pour bénéficier de réductions ou commandez en tant qu\'invité'}
                  </p>
                  {!isAuthenticated && (
                    <button
                      onClick={() => setCheckoutMode('register')}
                      className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                    >
                      Créer un compte et commander
                    </button>
                  )}
                  <button
                    onClick={() => setCheckoutMode('guest')}
                    className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Commander en tant qu'invité
                  </button>
                  {isAuthenticated && (
                    <button
                      onClick={() => router.push('/checkout')}
                      className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                    >
                      Passer la commande
                    </button>
                  )}
                </div>
              )}

              {checkoutMode === 'register' && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-900">Créer un compte</p>
                  <Link
                    href={`/auth/register?redirect=${encodeURIComponent('/checkout')}`}
                    className="block w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors text-center"
                  >
                    S'inscrire
                  </Link>
                  <button
                    onClick={() => setCheckoutMode('choice')}
                    className="w-full text-gray-600 hover:text-gray-700 text-sm"
                  >
                    ← Retour
                  </button>
                </div>
              )}

              {checkoutMode === 'guest' && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-900">Commande en tant qu'invité</p>
                  <button
                    onClick={() => router.push('/checkout')}
                    className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                  >
                    Continuer
                  </button>
                  <button
                    onClick={() => setCheckoutMode('choice')}
                    className="w-full text-gray-600 hover:text-gray-700 text-sm"
                  >
                    ← Retour
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return <CartPageContent />;
}
