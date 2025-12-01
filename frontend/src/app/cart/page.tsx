'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeftIcon, 
  TrashIcon, 
  PlusIcon, 
  MinusIcon, 
  TagIcon,
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useCartStore } from '@/store/cart.store';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/components/admin/NotificationProvider';
import { couponsService } from '@/services/coupons.service';
import { formatCurrency, getCurrencyForRole } from '@/utils/currency';

function CartPageContent() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuth();
  
  if (user?.role === 'ADMIN') {
    router.push('/dashboard/admin');
    return null;
  }

  const notifications = useNotifications();
  const currency = getCurrencyForRole(user?.role);
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  const subtotal = getTotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal - discount + shipping;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    try {
      const coupon = await couponsService.validate({ code: couponCode, totalAmount: subtotal });
      if (coupon.valid) {
        setAppliedCoupon(coupon);
        setDiscount(coupon.discount);
        notifications.success('Code appliqué', `-${formatCurrency(coupon.discount, currency)}`);
      } else {
        notifications.error('Code invalide', 'Ce code promo n\'est pas valide');
      }
    } catch {
      notifications.error('Erreur', 'Code promo invalide');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
  };

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-14">
              <Link href="/products" className="text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="ml-4 text-lg font-semibold text-gray-900">Panier</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-4 py-20">
          <ShoppingBagIcon className="h-20 w-20 text-gray-200 mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Votre panier est vide</h2>
          <p className="text-gray-500 text-sm mb-8 text-center">
            Découvrez nos produits et ajoutez-les à votre panier
          </p>
          <Link
            href="/products"
            className="px-8 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Voir les produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center">
              <Link href="/products" className="text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="ml-4 text-lg font-semibold text-gray-900">
                Panier <span className="text-gray-400 font-normal">({items.length})</span>
              </h1>
            </div>
            <button
              onClick={() => clearCart()}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Vider
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-7">
            {/* Delivery info */}
            <div className="bg-white rounded-xl p-4 mb-4 flex items-center gap-3">
              <TruckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {subtotal >= 50 
                    ? 'Livraison gratuite !' 
                    : `Plus que ${formatCurrency(50 - subtotal, currency)} pour la livraison gratuite`
                  }
                </p>
                {subtotal < 50 && (
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${Math.min((subtotal / 50) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-xl divide-y divide-gray-100">
              {items.map((item: any) => (
                <div key={item.id} className="p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBagIcon className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm font-bold text-gray-900 mb-3">
                        {formatCurrency(item.price, currency)}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        {/* Quantity */}
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                            disabled={item.quantity >= item.stock}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total - Desktop */}
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(item.price * item.quantity, currency)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-5 mt-6 lg:mt-0">
            <div className="bg-white rounded-xl p-6 sticky top-20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif</h3>
              
              {/* Coupon */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Code promo"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg border-0 text-sm focus:ring-2 focus:ring-gray-900 uppercase"
                      disabled={!!appliedCoupon}
                    />
                  </div>
                  {appliedCoupon ? (
                    <button
                      onClick={handleRemoveCoupon}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Retirer
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || isApplyingCoupon}
                      className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {isApplyingCoupon ? '...' : 'OK'}
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="mt-2 text-xs text-green-600">
                    Code {appliedCoupon.coupon.code} : -{formatCurrency(discount, currency)}
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total ({items.length} article{items.length > 1 ? 's' : ''})</span>
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
                  <span className={shipping === 0 ? 'text-green-600' : ''}>
                    {shipping === 0 ? 'Gratuite' : formatCurrency(shipping, currency)}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">{formatCurrency(total, currency)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => router.push('/checkout')}
                className="w-full mt-6 py-3.5 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                Passer la commande
                <ChevronRightIcon className="h-4 w-4" />
              </button>

              {/* Auth hint */}
              {!isAuthenticated && (
                <p className="mt-4 text-xs text-center text-gray-500">
                  <Link href="/auth/login" className="text-gray-900 font-medium hover:underline">
                    Connectez-vous
                  </Link>
                  {' '}pour un checkout plus rapide
                </p>
              )}

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheckIcon className="h-4 w-4" />
                    <span>Paiement sécurisé</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TruckIcon className="h-4 w-4" />
                    <span>Livraison rapide</span>
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

export default function CartPage() {
  return <CartPageContent />;
}
