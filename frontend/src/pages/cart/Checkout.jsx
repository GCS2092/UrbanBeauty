import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, MapPin, CreditCard, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { addressesApi } from '../../api/addresses.api';
import { couponsApi } from '../../api/coupons.api';
import { ordersApi } from '../../api/orders.api';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import { formatPrice } from '../../utils/formatPrice';
import { PAYMENT_METHOD_LABELS } from '../../utils/constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toast } from 'sonner';

const schema = z.object({
  fullName: z.string().min(2, 'Nom requis'),
  phone: z.string().min(6, 'Telephone requis'),
  street: z.string().min(3, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  country: z.string().min(2, 'Pays requis'),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'MOBILE_MONEY']),
  notes: z.string().optional(),
  guestEmail: z.string().email('Email invalide').optional().or(z.literal('')),
});

const SHIPPING_COST = 2000;

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { cart, getTotalPrice, clearCart } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressesApi.getAll().then((r) => r.data),
    enabled: !!user,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: 'CASH_ON_DELIVERY', country: 'Senegal' },
  });

  const paymentMethod = watch('paymentMethod');
  const subtotal = getTotalPrice();
  const discount = coupon
    ? coupon.type === 'PERCENTAGE'
      ? Math.round(subtotal * coupon.value / 100)
      : coupon.value
    : 0;
  const total = subtotal + SHIPPING_COST - discount;

  const fillFromAddress = (addr) => {
    setValue('fullName', addr.fullName);
    setValue('phone', addr.phone);
    setValue('street', addr.street);
    setValue('city', addr.city);
    setValue('country', addr.country);
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const { data } = await couponsApi.validate(couponCode);
      setCoupon(data);
      toast.success(`Coupon applique : -${data.type === 'PERCENTAGE' ? data.value + '%' : formatPrice(data.value)}`);
    } catch (err) {
      toast.error(err.message || 'Coupon invalide');
      setCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: (data) => ordersApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      clearCart(user?.id);
      toast.success('Commande passee avec succes !');
      navigate(`/orders/${res.data.orderNumber}`);
    },
    onError: (err) => toast.error(err.message || 'Erreur lors de la commande'),
  });

  const onSubmit = (formData) => {
    if (!cart?.items?.length) return toast.error('Votre panier est vide');
    placeOrder({
      items: cart.items.map((item) => ({
        productId: item.product.id,
        variantId: item.variant?.id || null,
        productName: item.product.name,
        variantLabel: item.variant ? `${item.variant.size} - ${item.variant.color}` : null,
        price: item.product.price,
        quantity: item.quantity,
      })),
      paymentMethod: formData.paymentMethod,
      shippingAddress: {
        fullName: formData.fullName,
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        country: formData.country,
      },
      shippingCost: SHIPPING_COST,
      notes: formData.notes,
      couponId: coupon?.id || null,
      guestEmail: !user ? formData.guestEmail : undefined,
      guestName: !user ? formData.fullName : undefined,
      guestPhone: !user ? formData.phone : undefined,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-700 mb-6 transition-colors">
        <ChevronLeft size={16} /> Retour au panier
      </Link>

      <h1 className="text-3xl font-bold text-stone-800 mb-8">Finaliser la commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Formulaire */}
        <div className="lg:col-span-2 space-y-6">

          {/* Adresses sauvegardees */}
          {addresses?.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <h2 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
                <MapPin size={17} className="text-rose-400" /> Mes adresses
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => fillFromAddress(addr)}
                    className="text-left p-3 rounded-xl border border-stone-200 hover:border-rose-300 hover:bg-rose-50/50 transition-colors"
                  >
                    <p className="font-medium text-stone-800 text-sm">{addr.label}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{addr.street}, {addr.city}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Email invité */}
          {!user && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-3">
              <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                Email de confirmation
              </h2>
              <Input
                label="Email (pour suivre votre commande)"
                placeholder="votre@email.com"
                error={errors.guestEmail?.message}
                {...register('guestEmail')}
              />
              <p className="text-xs text-stone-400">
                Vous pourrez retrouver vos commandes en vous connectant avec cet email.
              </p>
            </div>
          )}

          {/* Adresse livraison */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-4">
            <h2 className="font-semibold text-stone-800 flex items-center gap-2">
              <Truck size={17} className="text-rose-400" /> Adresse de livraison
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nom complet" placeholder="Marie Dupont" error={errors.fullName?.message} {...register('fullName')} />
              <Input label="Telephone" placeholder="+221 77 000 00 00" error={errors.phone?.message} {...register('phone')} />
            </div>
            <Input label="Adresse" placeholder="123 Rue de la Paix" error={errors.street?.message} {...register('street')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Ville" placeholder="Dakar" error={errors.city?.message} {...register('city')} />
              <Input label="Pays" placeholder="Senegal" error={errors.country?.message} {...register('country')} />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1.5">Notes (optionnel)</label>
              <textarea
                {...register('notes')}
                rows={2}
                placeholder="Instructions de livraison..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-rose-300 resize-none"
              />
            </div>
          </div>

          {/* Paiement */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-3">
            <h2 className="font-semibold text-stone-800 flex items-center gap-2">
              <CreditCard size={17} className="text-rose-400" /> Mode de paiement
            </h2>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
              <label key={value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${paymentMethod === value ? 'border-rose-400 bg-rose-50/50' : 'border-stone-200 hover:border-stone-300'}`}>
                <input type="radio" value={value} {...register('paymentMethod')} className="accent-rose-500" />
                <span className="text-sm font-medium text-stone-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Recap commande */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-4">
            <h2 className="font-semibold text-stone-800">Votre commande</h2>

            <div className="space-y-3 max-h-52 overflow-y-auto">
              {cart?.items?.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-stone-50 overflow-hidden shrink-0">
                    {item.product.images?.[0] ? (
                      <img src={item.product.images.find((i) => i.isMain)?.url || item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center">?</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-800 truncate">{item.product.name}</p>
                    <p className="text-xs text-stone-400">x{item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold text-stone-800">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 pt-2 border-t border-stone-100">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Code promo"
                className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-rose-300"
              />
              <Button variant="outline" size="sm" loading={validatingCoupon} onClick={handleValidateCoupon}>
                Appliquer
              </Button>
            </div>

            <div className="space-y-2 text-sm border-t border-stone-100 pt-3">
              <div className="flex justify-between text-stone-600">
                <span>Sous-total</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Livraison</span><span>{formatPrice(SHIPPING_COST)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Reduction</span><span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-100 text-base">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>

            <Button className="w-full" size="lg" loading={isPending} onClick={handleSubmit(onSubmit)}>
              Confirmer la commande
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}