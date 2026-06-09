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
import { settingsApi } from '../../api/settings.api';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import { formatPrice } from '../../utils/formatPrice';
import { PAYMENT_METHOD_LABELS } from '../../utils/constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PaymentModal from '../../components/checkout/PaymentModal';
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

// ---------------------------------------------------------------------------
// Helper — construit le message WhatsApp (sans emojis pour eviter l'encodage)
// ---------------------------------------------------------------------------
const buildWhatsAppMessage = ({ cart, formData, subtotal, discount, total, coupon, orderNumber }) => {
  const lines = [];

  lines.push(`*Nouvelle commande UrbanBeauty*`);
  lines.push(`Ref: *${orderNumber}*`);
  lines.push('');
  lines.push('*Articles :*');

  cart.items.forEach((item) => {
    const variantLabel = item.variant ? ` (${item.variant.size} - ${item.variant.color})` : '';
    lines.push(
      `- ${item.product.name}${variantLabel} x${item.quantity} -- ${formatPrice(item.product.price * item.quantity)}`
    );
  });

  lines.push('');
  lines.push('*Recapitulatif :*');
  lines.push(`Sous-total : ${formatPrice(subtotal)}`);
  lines.push(`Livraison : ${formatPrice(SHIPPING_COST)}`);
  if (discount > 0) {
    lines.push(`Reduction${coupon ? ` (${coupon.code})` : ''} : -${formatPrice(discount)}`);
  }
  lines.push(`*Total : ${formatPrice(total)}*`);

  lines.push('');
  lines.push('*Livraison :*');
  lines.push(`Nom : ${formData.fullName}`);
  lines.push(`Tel : ${formData.phone}`);
  lines.push(`Adresse : ${formData.street}, ${formData.city}, ${formData.country}`);

  lines.push('');
  lines.push(
    `Paiement : ${formData.paymentMethod === 'MOBILE_MONEY' ? 'Mobile Money' : 'A la livraison'}`
  );

  if (formData.notes) {
    lines.push('');
    lines.push(`Notes : ${formData.notes}`);
  }

  return encodeURIComponent(lines.join('\n'));
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { cart, getTotalPrice, clearCart } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);
  const [whatsappSent, setWhatsappSent] = useState(false);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressesApi.getAll().then((r) => r.data),
    enabled: !!user,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getPublic().then((r) => r.data),
  });

  // ── Form ─────────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: 'CASH_ON_DELIVERY', country: 'Senegal' },
  });

  const paymentMethod = watch('paymentMethod');

  // ── Totaux ───────────────────────────────────────────────────────────────
  const subtotal = getTotalPrice();
  const discount = coupon
    ? coupon.type === 'PERCENTAGE'
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value
    : 0;
  const total = subtotal + SHIPPING_COST - discount;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const fillFromAddress = (addr) => {
    setValue('fullName', addr.fullName);
    setValue('phone', addr.phone);
    setValue('street', addr.street);
    setValue('city', addr.city);
    setValue('country', addr.country);
  };

  const buildOrderPayload = (formData) => ({
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

  // ── Coupon ───────────────────────────────────────────────────────────────
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const { data } = await couponsApi.validate(couponCode, subtotal);
      setCoupon(data.coupon);
      toast.success(
        `Coupon applique : -${
          data.coupon.type === 'PERCENTAGE' ? data.coupon.value + '%' : formatPrice(data.discount)
        }`
      );
    } catch (err) {
      toast.error(err.message || 'Coupon invalide');
      setCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  // ── Mutation — commande normale ──────────────────────────────────────────
  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: (data) => ordersApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      clearCart(user?.id);
      setShowPaymentModal(false);
      toast.success('Commande passee avec succes !');
      navigate(`/orders/${res.data.orderNumber}`);
    },
    onError: (err) => {
      toast.error(err.message || 'Erreur lors de la commande');
    },
  });

  // ── Mutation — commande via WhatsApp (DRAFT) ─────────────────────────────
  const { mutate: placeDraftOrder, isPending: isDraftPending } = useMutation({
    mutationFn: (data) => ordersApi.create({ ...data, status: 'DRAFT' }),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      clearCart(user?.id);

      const orderNumber = res.data.orderNumber;
      const whatsappNumber = (settings?.whatsapp_number || '').replace(/\D/g, '');

      const message = buildWhatsAppMessage({
        cart,
        formData: variables._formData,
        subtotal,
        discount,
        total,
        coupon,
        orderNumber,
      });

      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
      setWhatsappSent(true);
      toast.success('Commande enregistree ! Envoyez le message WhatsApp pour confirmer.');
    },
    onError: (err) => {
      toast.error(err.message || 'Erreur lors de la creation de la commande');
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const onSubmit = (formData) => {
    if (!cart?.items?.length) return toast.error('Votre panier est vide');

    if (formData.paymentMethod === 'MOBILE_MONEY') {
      setPendingOrderData(buildOrderPayload(formData));
      setShowPaymentModal(true);
      return;
    }

    placeOrder(buildOrderPayload(formData));
  };

  const onWhatsAppOrder = (formData) => {
    if (!cart?.items?.length) return toast.error('Votre panier est vide');

    // Verification AVANT de creer la commande
    const whatsappNumber = (settings?.whatsapp_number || '').replace(/\D/g, '');
    if (!whatsappNumber) {
      toast.error('Numero WhatsApp non configure. Veuillez utiliser un autre mode de commande.');
      return;
    }

    const payload = buildOrderPayload(formData);
    placeDraftOrder({ ...payload, _formData: formData });
  };

  const handleConfirmPayment = () => {
    if (pendingOrderData) placeOrder(pendingOrderData);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleConfirmPayment}
        total={total}
        settings={settings}
        isPending={isPending}
        orderData={pendingOrderData}
      />

      <Link
        to="/cart"
        className="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-700 mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Retour au panier
      </Link>

      <h1 className="text-3xl font-bold text-stone-800 mb-8">Finaliser la commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Formulaire ── */}
        <div className="lg:col-span-2 space-y-6">

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

          {!user && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-3">
              <h2 className="font-semibold text-stone-800">Email de confirmation</h2>
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

          <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-4">
            <h2 className="font-semibold text-stone-800 flex items-center gap-2">
              <Truck size={17} className="text-rose-400" /> Adresse de livraison
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nom complet"
                placeholder="Marie Dupont"
                error={errors.fullName?.message}
                {...register('fullName')}
              />
              <Input
                label="Telephone"
                placeholder="+221 77 000 00 00"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
            <Input
              label="Adresse"
              placeholder="123 Rue de la Paix"
              error={errors.street?.message}
              {...register('street')}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Ville"
                placeholder="Dakar"
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label="Pays"
                placeholder="Senegal"
                error={errors.country?.message}
                {...register('country')}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1.5">
                Notes (optionnel)
              </label>
              <textarea
                {...register('notes')}
                rows={2}
                placeholder="Instructions de livraison..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-rose-300 resize-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-3">
            <h2 className="font-semibold text-stone-800 flex items-center gap-2">
              <CreditCard size={17} className="text-rose-400" /> Mode de paiement
            </h2>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
              <label
                key={value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  paymentMethod === value
                    ? 'border-rose-400 bg-rose-50/50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  value={value}
                  {...register('paymentMethod')}
                  className="accent-rose-500"
                />
                <span className="text-sm font-medium text-stone-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Recap commande ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-4">
            <h2 className="font-semibold text-stone-800">Votre commande</h2>

            <div className="space-y-3 max-h-52 overflow-y-auto">
              {cart?.items?.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-stone-50 overflow-hidden shrink-0">
                    {item.product.images?.[0] ? (
                      <img
                        src={
                          item.product.images.find((i) => i.isMain)?.url ||
                          item.product.images[0].url
                        }
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">?</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-800 truncate">{item.product.name}</p>
                    <p className="text-xs text-stone-400">x{item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold text-stone-800">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
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

            {/* Totaux */}
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

            {/* Bouton commande normale */}
            <Button
              className="w-full"
              size="lg"
              loading={isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {paymentMethod === 'MOBILE_MONEY' ? 'Payer par Mobile Money' : 'Confirmer la commande'}
            </Button>

            {/* Separateur */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-stone-100" />
              <span className="text-xs text-stone-400">ou</span>
              <div className="flex-1 h-px bg-stone-100" />
            </div>

            {/* Bouton WhatsApp */}
            {whatsappSent ? (
              <div className="w-full rounded-2xl bg-green-50 border border-green-200 p-4 text-center space-y-2">
                <p className="text-sm font-semibold text-green-700">Message WhatsApp ouvert !</p>
                <p className="text-xs text-green-600">
                  Votre commande est enregistree en brouillon. Elle sera confirmee des que vous
                  aurez envoye le message et que nous l'aurons valide.
                </p>
              </div>
            ) : (
              <button
                type="button"
                disabled={isDraftPending}
                onClick={handleSubmit(onWhatsAppOrder)}
                className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5d] disabled:opacity-60 text-white font-semibold text-sm py-3.5 rounded-2xl transition-colors"
              >
                {isDraftPending ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                )}
                Commander via WhatsApp
              </button>
            )}

            <p className="text-xs text-stone-400 text-center">
              La commande sera enregistree et un message pre-rempli s'ouvrira dans WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}