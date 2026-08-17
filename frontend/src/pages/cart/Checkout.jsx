import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, MapPin, CreditCard, Truck, Gift, AlertCircle, Copy, CheckCircle2, ShieldCheck, Lock, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { addressesApi } from '../../api/addresses.api';
import { couponsApi } from '../../api/coupons.api';
import { ordersApi } from '../../api/orders.api';
import { paymentsApi } from '../../api/payments.api';
import { settingsApi } from '../../api/settings.api';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import { formatPrice } from '../../utils/formatPrice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PaymentModal from '../../components/checkout/PaymentModal';
import { toast } from 'sonner';
import { STORE_ID } from '../../utils/constants';

// --- Seuil de livraison gratuite (nombre de pièces) ---
const FREE_SHIPPING_THRESHOLD = 5;

// --- Destinations ---
const DESTINATIONS = [
  {
    value: 'SENEGAL',
    label: 'Sénégal (Dakar)',
    description: 'Frais communiqués via WhatsApp',
    shippingFixed: null,
    flag: '🇸🇳',
    isLocal: true,
  },
  {
    value: 'CONGO_EXPRESS',
    label: 'Congo — Express',
    description: 'Livraison rapide, délai réduit',
    flag: '🇨🇬',
    isLocal: false,
  },
  {
    value: 'CONGO_GROUPAGE',
    label: 'Congo — Groupage',
    description: 'Livraison avec les autres commandes + cadeau offert',
    flag: '🇨🇬',
    hasGift: true,
    isLocal: false,
  },
];

// --- Modes de paiement selon destination ---
function getAvailablePaymentMethods(destination) {
  const dest = DESTINATIONS.find((d) => d.value === destination);
  if (dest?.isLocal) {
    return ['CASH_ON_DELIVERY', 'MOBILE_MONEY'];
  }
  return ['MOBILE_MONEY'];
}

const PAYMENT_METHOD_INFO = {
  CASH_ON_DELIVERY: {
    label: 'Paiement à la livraison',
    description: 'Payez en espèces à la réception de votre colis',
    icon: '💵',
  },
  MOBILE_MONEY: {
    label: 'Mobile Money',
    description: 'Wave, Orange Money, Free Money',
    icon: '📱',
  },
};

// --- Composant numéros Mobile Money ---
// ✅ Conservé dans le code (réutilisable ailleurs, ex. Sénégal) mais plus affiché
// automatiquement pour les destinations Congo — voir CongoPaymentNotice ci-dessous.
function MobileMoneyNumbers({ settings }) {
  const [copied, setCopied] = useState(null);

  const numbers = [
    { key: 'wave_number', label: 'Wave', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { key: 'orange_money_number', label: 'Orange Money', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { key: 'free_money_number', label: 'Free Money', color: 'bg-green-50 text-green-700 border-green-200' },
  ].filter((n) => settings?.[n.key]);

  if (!numbers.length) return null;

  const handleCopy = (number, label) => {
    navigator.clipboard.writeText(number);
    setCopied(label);
    toast.success(`Numéro ${label} copié !`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium text-stone-600">Envoyez le paiement à :</p>
      {numbers.map(({ key, label, color }) => (
        <div key={key} className={`flex items-center justify-between p-2.5 rounded-xl border ${color}`}>
          <div>
            <p className="text-xs font-medium opacity-70">{label}</p>
            <p className="font-semibold text-sm tracking-wide">{settings[key]}</p>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(settings[key], label)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/70 hover:bg-white transition-colors text-xs font-medium"
          >
            {copied === label ? <CheckCircle2 size={12} /> : <Copy size={12} />}
            {copied === label ? 'Copié !' : 'Copier'}
          </button>
        </div>
      ))}
      {settings?.payment_instructions && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2.5 leading-relaxed">
          {settings.payment_instructions}
        </p>
      )}
    </div>
  );
}

// --- ✅ Message affiché à la place des numéros pour les destinations Congo ---
// Explique au client qu'un paiement Mobile Money est requis avant expédition,
// et lui propose de contacter directement le numéro WhatsApp de la boutique
// pour valider sa commande et effectuer le paiement.
function CongoPaymentNotice({ settings }) {
  const whatsappNumber = (settings?.whatsapp_number || '').replace(/\D/g, '');

  const handleContact = () => {
    if (!whatsappNumber) {
      toast.error('Numéro WhatsApp non configuré.');
      return;
    }
    const msg = encodeURIComponent(
      "Bonjour, je souhaite procéder au paiement Mobile Money pour valider ma commande vers le Congo."
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank');
  };

  return (
    <div className="mt-3 flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl p-3">
      <AlertCircle size={15} className="text-blue-500 mt-0.5 shrink-0" />
      <div className="flex-1 space-y-2">
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Paiement requis pour confirmer votre commande.</strong>{' '}
          Pour les livraisons Congo, veuillez procéder au paiement Mobile Money
          afin de sécuriser et confirmer votre commande avant expédition.
        </p>
        <button
          type="button"
          onClick={handleContact}
          className="flex items-center justify-center gap-2 w-full text-xs font-semibold text-white bg-[#25D366] hover:bg-[#1ebe5d] rounded-lg py-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Contacter le service pour payer et valider ma commande
        </button>
      </div>
    </div>
  );
}

// --- WhatsApp message builder ---
const buildWhatsAppMessage = ({ cart, formData, subtotal, shippingCost, discount, total, coupon, orderNumber, destination, settings }) => {
  const lines = [];
  const dest = DESTINATIONS.find((d) => d.value === destination);

  lines.push(`*Nouvelle commande SonShop*`);
  lines.push(`Ref: *${orderNumber}*`);
  lines.push('');
  lines.push('*Articles :*');

  cart.items.forEach((item) => {
    const variantLabel = item.variant ? ` (${item.variant.size} - ${item.variant.color})` : '';
    lines.push(`- ${item.product.name}${variantLabel} x${item.quantity} -- ${formatPrice(item.product.price * item.quantity)}`);
  });

  lines.push('');
  lines.push('*Récapitulatif :*');
  lines.push(`Sous-total : ${formatPrice(subtotal)}`);

  if (destination === 'SENEGAL') {
    lines.push(`Livraison Sénégal : à confirmer`);
  } else {
    lines.push(`Livraison (${dest?.label}) : ${formatPrice(shippingCost)}`);
  }

  if (discount > 0) {
    lines.push(`Réduction${coupon ? ` (${coupon.code})` : ''} : -${formatPrice(discount)}`);
  }

  if (destination === 'SENEGAL') {
    lines.push(`*Total (hors livraison) : ${formatPrice(total - shippingCost)}*`);
  } else {
    lines.push(`*Total : ${formatPrice(total)}*`);
  }

  if (destination === 'CONGO_GROUPAGE') {
    const gift = settings?.congo_groupage_gift || 'un cadeau surprise';
    lines.push('');
    lines.push(`🎁 *Cadeau offert :* ${gift} (pour remercier votre patience)`);
  }

  lines.push('');
  lines.push('*Livraison :*');
  lines.push(`Destination : ${dest?.label || destination}`);
  lines.push(`Nom : ${formData.fullName}`);
  lines.push(`Tél : ${formData.phone}`);
  lines.push(`Adresse : ${formData.street}, ${formData.city}`);
  lines.push('');
  lines.push(`Paiement : ${formData.paymentMethod === 'MOBILE_MONEY' ? 'Mobile Money' : 'À la livraison'}`);

  if (formData.notes) {
    lines.push('');
    lines.push(`Notes : ${formData.notes}`);
  }

  return encodeURIComponent(lines.join('\n'));
};

// --- Schema ---
const schema = z.object({
  fullName: z.string().min(2, 'Nom requis'),
  phone: z.string().min(6, 'Téléphone requis'),
  street: z.string().min(3, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  destination: z.enum(['SENEGAL', 'CONGO_EXPRESS', 'CONGO_GROUPAGE']),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'MOBILE_MONEY']),
  notes: z.string().optional(),
  guestEmail: z.string().email('Email invalide').optional().or(z.literal('')),
});

// --- Composant principal ---
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
  const [deliverToOther, setDeliverToOther] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false); // ✅ nouveau : force l'affichage du formulaire

  // ✅ CinetPay : mode courant et commande déjà créée (pour éviter les doublons en fallback)
  const [paymentMode, setPaymentMode] = useState('idle'); // 'idle' | 'redirecting' | 'fallback'
  const [createdOrder, setCreatedOrder] = useState(null);

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressesApi.getAll().then((r) => r.data),
    enabled: !!user,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getPublic().then((r) => r.data),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentMethod: 'CASH_ON_DELIVERY',
      destination: 'SENEGAL',
    },
  });

  const paymentMethod = watch('paymentMethod');
  const destination = watch('destination');

  const fillFromAddress = (addr) => {
    setValue('fullName', addr.fullName);
    setValue('phone', addr.phone);
    setValue('street', addr.street);
    setValue('city', addr.city);
  };

  // ✅ Adresse par défaut du compte (ou la première dispo)
  const defaultAddress = addresses?.find((a) => a.isDefault) || addresses?.[0];

  // ✅ L'adresse par défaut contient-elle tout le nécessaire ?
  const isAddressComplete = !!(
    defaultAddress?.fullName &&
    defaultAddress?.phone &&
    defaultAddress?.street &&
    defaultAddress?.city
  );

  // ✅ Faut-il afficher le formulaire complet, ou juste le récap en lecture ?
  //    - invité               → toujours le formulaire
  //    - "pour un autre"      → toujours le formulaire (vide)
  //    - adresse incomplète   → toujours le formulaire (pré-rempli avec ce qu'on a)
  //    - "Modifier" cliqué    → formulaire, tant qu'on n'a pas annulé
  const showForm = !user || deliverToOther || !isAddressComplete || editingAddress;

  // ✅ Pré-remplissage automatique pour un client connecté
  useEffect(() => {
    if (!user || deliverToOther) return;

    if (defaultAddress) {
      fillFromAddress(defaultAddress);
    } else {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
      if (fullName) setValue('fullName', fullName);
      if (user.phone) setValue('phone', user.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, addresses, deliverToOther]);

  const handleDestinationChange = (value) => {
    setValue('destination', value);
    const availableMethods = getAvailablePaymentMethods(value);
    if (!availableMethods.includes(paymentMethod)) {
      setValue('paymentMethod', 'MOBILE_MONEY');
    }
  };

  const availablePaymentMethods = getAvailablePaymentMethods(destination);
  const isInternational = !DESTINATIONS.find((d) => d.value === destination)?.isLocal;

  // ✅ Quantité totale d'articles dans le panier — utilisée pour la livraison gratuite
  const totalQuantity = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const qualifiesForFreeShipping = totalQuantity >= FREE_SHIPPING_THRESHOLD;

  // ✅ Le coût réellement appliqué tient maintenant compte du seuil de gratuité
  //    (avant, seul l'affichage pouvait laisser penser à une gratuité sans que
  //    le total payé ne change réellement)
  const getShippingCost = () => {
    if (destination === 'SENEGAL') return 0;
    if (qualifiesForFreeShipping) return 0;
    if (destination === 'CONGO_EXPRESS') return Number(settings?.congo_express_rate || 15000);
    if (destination === 'CONGO_GROUPAGE') return Number(settings?.congo_groupage_rate || 8000);
    return 0;
  };

  const shippingCost = getShippingCost();
  const selectedDest = DESTINATIONS.find((d) => d.value === destination);
  const subtotal = getTotalPrice();
  const discount = coupon
    ? coupon.type === 'PERCENTAGE'
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value
    : 0;
  const total = subtotal + shippingCost - discount;

  const depositThreshold = Number(settings?.deposit_threshold || 0);
  const depositPercent = Number(settings?.deposit_percent || 30);
  const requiresDeposit =
    destination === 'SENEGAL' &&
    paymentMethod === 'CASH_ON_DELIVERY' &&
    depositThreshold > 0 &&
    subtotal >= depositThreshold;
  const depositAmount = requiresDeposit ? Math.ceil((subtotal * depositPercent) / 100) : 0;

  const buildOrderPayload = (formData) => ({
    storeId: STORE_ID,
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
      country: selectedDest?.label || formData.destination,
    },
    shippingCost,
    notes: formData.notes,
    couponId: coupon?.id || null,
    guestEmail: !user ? formData.guestEmail : undefined,
    guestName: !user ? formData.fullName : undefined,
    guestPhone: formData.phone,
    destination: formData.destination,
  });

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const { data } = await couponsApi.validate(couponCode, subtotal, STORE_ID);
      setCoupon(data.coupon);
      toast.success(
        `Coupon appliqué : -${data.coupon.type === 'PERCENTAGE' ? data.coupon.value + '%' : formatPrice(data.discount)}`
      );
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
      setShowPaymentModal(false);
      toast.success('Commande passée avec succès !');

      if (user && !user.phone) {
        setTimeout(() => {
          toast.info('💡 Enregistrez votre numéro dans vos paramètres pour commander plus vite !', {
            duration: 6000,
            action: {
              label: 'Mes paramètres',
              onClick: () => navigate('/account/settings'),
            },
          });
        }, 1500);
      }

      navigate(`/orders/${res.data.orderNumber}`);
    },
    onError: (err) => {
      toast.error(err.message || 'Erreur lors de la commande');
    },
  });

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
        shippingCost,
        discount,
        total,
        coupon,
        orderNumber,
        destination,
        settings,
      });
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
      setWhatsappSent(true);
      toast.success('Commande enregistrée ! Envoyez le message WhatsApp pour confirmer.');
    },
    onError: (err) => {
      toast.error(err.message || 'Erreur lors de la création de la commande');
    },
  });

  // ✅ Tentative de paiement automatique CinetPay, avec bascule vers le flow manuel en cas d'échec
  const { mutate: placeOrderWithCinetpay, isPending: isPendingCinetpay } = useMutation({
    mutationFn: async (data) => {
      const { data: order } = await ordersApi.create(data);
      setCreatedOrder(order);
      const { data: payment } = await paymentsApi.initier(order.id);
      return { order, payment };
    },
    onSuccess: ({ payment }) => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      clearCart(user?.id);
      // Redirection vers la page de paiement sécurisée CinetPay
      window.location.href = payment.paymentUrl;
    },
    onError: (err) => {
      // CinetPay indisponible (compte non validé, réseau, etc.) → on bascule sur le flow manuel.
      // La commande a peut-être déjà été créée (createdOrder) : on la réutilise, pas de doublon.
      console.error('CinetPay indisponible, bascule manuelle:', err.message);
      toast.info('Paiement automatique indisponible pour le moment. Utilisez le paiement manuel ci-dessous.');
      setPaymentMode('fallback');
      setShowPaymentModal(true);
    },
  });

  const onSubmit = (formData) => {
    if (!cart?.items?.length) return toast.error('Votre panier est vide');
    if (formData.paymentMethod === 'MOBILE_MONEY') {
      setPendingOrderData(buildOrderPayload(formData));
      setPaymentMode('redirecting');
      placeOrderWithCinetpay(buildOrderPayload(formData));
      return;
    }
    placeOrder(buildOrderPayload(formData));
  };

  const onWhatsAppInfo = (formData) => {
    if (!cart?.items?.length) return toast.error('Votre panier est vide');
    const whatsappNumber = (settings?.whatsapp_number || '').replace(/\D/g, '');
    if (!whatsappNumber) { toast.error('Numéro WhatsApp non configuré.'); return; }
    const dest = DESTINATIONS.find((d) => d.value === formData.destination);
    const lines = [
      "Bonjour, j'aimerais avoir des informations sur les produits suivants :",
      '',
      ...cart.items.map((item) => {
        const v = item.variant ? ` (${item.variant.size} - ${item.variant.color})` : '';
        return `- ${item.product.name}${v} x${item.quantity}`;
      }),
      '',
      `Destination souhaitée : ${dest?.label || formData.destination}`,
      `Total estimé (sans livraison) : ${formatPrice(subtotal)}`,
    ];
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
  };

  const onWhatsAppOrder = (formData) => {
    if (!cart?.items?.length) return toast.error('Votre panier est vide');
    const whatsappNumber = (settings?.whatsapp_number || '').replace(/\D/g, '');
    if (!whatsappNumber) { toast.error('Numéro WhatsApp non configuré.'); return; }
    const payload = buildOrderPayload(formData);
    placeDraftOrder({ ...payload, _formData: formData });
  };

  // ✅ Confirmation du flow manuel (fallback). Si une commande a déjà été créée
  // lors de la tentative CinetPay, on la réutilise au lieu d'en créer une nouvelle.
  const handleConfirmPayment = () => {
    if (createdOrder) {
      setShowPaymentModal(false);
      toast.success('Commande enregistrée, en attente de vérification manuelle.');
      navigate(`/orders/${createdOrder.orderNumber}`);
      return;
    }
    if (pendingOrderData) placeOrder(pendingOrderData);
  };

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
        mode={paymentMode}
      />

      {/* ✅ Écran de redirection pendant la tentative de paiement CinetPay */}
      {paymentMode === 'redirecting' && isPendingCinetpay && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-[3px] border-rose-200 border-t-rose-500 rounded-full animate-spin" />
            <p className="text-sm text-stone-600">Redirection vers le paiement sécurisé...</p>
          </div>
        </div>
      )}

      <Link
        to="/cart"
        className="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-700 mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Retour au panier
      </Link>

      {/* Barre de progression */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">1</div>
          <span className="text-sm font-medium text-stone-700 hidden sm:block">Panier</span>
        </div>
        <div className="flex-1 h-px bg-rose-200 max-w-[40px]" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">2</div>
          <span className="text-sm font-medium text-rose-500 hidden sm:block">Livraison & paiement</span>
        </div>
        <div className="flex-1 h-px bg-stone-200 max-w-[40px]" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-400 text-xs font-bold flex items-center justify-center">3</div>
          <span className="text-sm text-stone-400 hidden sm:block">Confirmation</span>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-stone-800 mb-8">Finaliser la commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Formulaire */}
        <div className="lg:col-span-2 space-y-6">

          {/* ✅ Toggle "Moi-même" / "Pour quelqu'un d'autre" (clients connectés uniquement) */}
          {user && (
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <h2 className="font-semibold text-stone-800 mb-3">Livrer à</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeliverToOther(false);
                    setEditingAddress(false); // ✅ revient au récap si l'adresse est complète
                  }}
                  className={`p-3.5 rounded-xl border text-sm font-medium transition-colors ${
                    !deliverToOther
                      ? 'border-rose-400 bg-rose-50/50 text-rose-600'
                      : 'border-stone-200 text-stone-500 hover:border-stone-300'
                  }`}
                >
                  Moi-même
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeliverToOther(true);
                    setEditingAddress(true); // ✅ force le formulaire vide
                    setValue('fullName', '');
                    setValue('phone', '');
                    setValue('street', '');
                    setValue('city', '');
                  }}
                  className={`p-3.5 rounded-xl border text-sm font-medium transition-colors ${
                    deliverToOther
                      ? 'border-rose-400 bg-rose-50/50 text-rose-600'
                      : 'border-stone-200 text-stone-500 hover:border-stone-300'
                  }`}
                >
                  Pour quelqu'un d'autre
                </button>
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

          {/* Destination */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-3">
            <h2 className="font-semibold text-stone-800 flex items-center gap-2">
              <Truck size={17} className="text-rose-400" /> Destination
            </h2>
            <div className="space-y-2">
              {DESTINATIONS.map((dest) => (
                <label
                  key={dest.value}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    destination === dest.value
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={dest.value}
                    checked={destination === dest.value}
                    onChange={() => handleDestinationChange(dest.value)}
                    className="accent-rose-500 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{dest.flag}</span>
                      <span className="text-sm font-semibold text-stone-800">{dest.label}</span>
                      {dest.hasGift && (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          <Gift size={10} /> Cadeau inclus
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">{dest.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {dest.value === 'SENEGAL' ? (
                      <span className="text-xs text-stone-400 italic">Via WhatsApp</span>
                    ) : qualifiesForFreeShipping ? (
                      <span className="text-xs font-semibold text-green-600">Gratuite</span>
                    ) : (
                      <span className="text-sm font-semibold text-stone-700">
                        {formatPrice(Number(settings?.[dest.value === 'CONGO_EXPRESS' ? 'congo_express_rate' : 'congo_groupage_rate'] || (dest.value === 'CONGO_EXPRESS' ? 15000 : 8000)))}
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {destination === 'CONGO_GROUPAGE' && (
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <Gift size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Cadeau offert !</strong> Pour vous remercier de votre patience,
                  un {settings?.congo_groupage_gift || 'cadeau surprise'} sera glissé dans votre colis.
                  <br />
                  Aucune quantité minimale n'est requise : votre colis est simplement regroupé
                  avec d'autres commandes pour réduire les frais de livraison.
                </p>
              </div>
            )}

            {/* ✅ Bouton contact WhatsApp pour la destination Congo Express */}
            {destination === 'CONGO_EXPRESS' && (
              <button
                type="button"
                onClick={() => {
                  const whatsappNumber = (settings?.whatsapp_number || '').replace(/\D/g, '');
                  if (!whatsappNumber) { toast.error('Numéro WhatsApp non configuré.'); return; }
                  const msg = encodeURIComponent("Bonjour, j'ai une question concernant la livraison Congo Express.");
                  window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank');
                }}
                className="w-full flex items-center justify-center gap-2 text-xs font-medium text-[#128C7E] border border-[#25D366] rounded-xl py-2 hover:bg-green-50 transition-colors"
              >
                Nous contacter au sujet de cette livraison
              </button>
            )}
          </div>

          {/* ✅ Adresse : récap en lecture (si tout est déjà connu) OU formulaire complet */}
          {!showForm ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                  <MapPin size={17} className="text-rose-400" /> Livraison à
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingAddress(true)}
                  className="flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600 font-medium"
                >
                  <Pencil size={13} /> Modifier
                </button>
              </div>
              <p className="text-sm font-medium text-stone-800">{watch('fullName')}</p>
              <p className="text-sm text-stone-500">{watch('phone')}</p>
              <p className="text-sm text-stone-500">{watch('street')}, {watch('city')}</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-stone-800 flex items-center gap-2">
                  <MapPin size={17} className="text-rose-400" /> Adresse de livraison
                </h2>
                {user && !deliverToOther && isAddressComplete && (
                  <button
                    type="button"
                    onClick={() => setEditingAddress(false)}
                    className="text-sm text-stone-400 hover:text-stone-600"
                  >
                    Annuler
                  </button>
                )}
              </div>

              {/* Sélecteur d'adresses enregistrées — visible seulement en mode "Moi-même" */}
              {!deliverToOther && addresses?.length > 0 && (
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
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nom complet"
                  placeholder="Marie Dupont"
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />
                <Input
                  label="Téléphone"
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
              <Input
                label="Ville"
                placeholder={destination === 'SENEGAL' ? 'Dakar' : 'Brazzaville'}
                error={errors.city?.message}
                {...register('city')}
              />
              <div>
                <label className="text-sm font-medium text-stone-700 block mb-1.5">
                  Notes (optionnel)
                </label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="Instructions de livraison..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-base outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 resize-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Mode de paiement */}
          <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-3">
            <h2 className="font-semibold text-stone-800 flex items-center gap-2">
              <CreditCard size={17} className="text-rose-400" /> Mode de paiement
            </h2>

            {isInternational && (
              <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl p-3">
                <AlertCircle size={15} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Pour les commandes internationales, le <strong>paiement intégral est requis avant expédition</strong>.
                  Le paiement à la livraison n'est pas disponible.
                </p>
              </div>
            )}

            <div className="space-y-2">
              {availablePaymentMethods.map((method) => {
                const info = PAYMENT_METHOD_INFO[method];
                const isSelected = paymentMethod === method;
                return (
                  <label
                    key={method}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-rose-400 bg-rose-50/50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={method}
                      {...register('paymentMethod')}
                      className="accent-rose-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{info.icon}</span>
                        <span className="text-sm font-medium text-stone-700">{info.label}</span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">{info.description}</p>

                      {/* ✅ Pour le Congo, on n'affiche plus les numéros Mobile Money
                          directement : on invite le client à contacter le service
                          pour payer et valider sa commande. */}
                      {method === 'MOBILE_MONEY' && isSelected && isInternational && (
                        <CongoPaymentNotice settings={settings} />
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {requiresDeposit && (
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <AlertCircle size={15} className="text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-700 leading-relaxed space-y-1">
                  <p>
                    <strong>Acompte requis pour cette commande.</strong>{' '}
                    Un acompte de {depositPercent}% ({formatPrice(depositAmount)}) vous sera demandé
                    par téléphone ou WhatsApp avant l'expédition.
                  </p>
                  <p>Le solde ({formatPrice(subtotal - depositAmount)}) sera réglé à la livraison.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Récap commande */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-4">
            <h2 className="font-semibold text-stone-800">Votre commande</h2>

            <div className="space-y-3 max-h-52 overflow-y-auto">
              {cart?.items?.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-stone-50 overflow-hidden shrink-0">
                    {item.product.images?.[0] ? (
                      <img
                        src={item.product.images.find((i) => i.isMain)?.url || item.product.images[0].url}
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
                className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-base outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition-all"
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
                <span>Livraison {selectedDest && `(${selectedDest.label})`}</span>
                <span>
                  {destination === 'SENEGAL'
                    ? <span className="text-xs italic text-stone-400">Via WhatsApp</span>
                    : qualifiesForFreeShipping
                      ? <span className="text-xs font-semibold text-green-600">Gratuite</span>
                      : formatPrice(shippingCost)
                  }
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction</span><span>-{formatPrice(discount)}</span>
                </div>
              )}
              {destination === 'CONGO_GROUPAGE' && (
                <div className="flex justify-between text-amber-600">
                  <span className="flex items-center gap-1"><Gift size={12} /> Cadeau offert</span>
                  <span className="text-xs font-medium">Inclus 🎁</span>
                </div>
              )}
              {requiresDeposit && (
                <div className="flex justify-between text-amber-600 text-xs">
                  <span>Acompte ({depositPercent}%)</span>
                  <span>{formatPrice(depositAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-100 text-base">
                <span>Total</span>
                <span>
                  {destination === 'SENEGAL'
                    ? `${formatPrice(subtotal - discount)} + livraison`
                    : formatPrice(total)
                  }
                </span>
              </div>
            </div>

            {/* Rassurance */}
            <div className="flex items-center justify-center gap-4 text-xs text-stone-400 py-1 border-t border-stone-100 pt-3">
              <span className="flex items-center gap-1"><Lock size={11} /> Paiement sécurisé</span>
              <span className="flex items-center gap-1"><ShieldCheck size={11} /> Données protégées</span>
              <span className="flex items-center gap-1"><Truck size={11} /> Livraison suivie</span>
            </div>

            {/* Bouton commande */}
            <Button
              className="w-full"
              size="lg"
              loading={isPending || isPendingCinetpay}
              onClick={handleSubmit(onSubmit)}
            >
              {paymentMethod === 'MOBILE_MONEY' ? 'Payer par Mobile Money' : 'Confirmer la commande'}
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-stone-100" />
              <span className="text-xs text-stone-400">ou</span>
              <div className="flex-1 h-px bg-stone-100" />
            </div>

            {/* Boutons WhatsApp */}
            {whatsappSent ? (
              <div className="w-full rounded-2xl bg-green-50 border border-green-200 p-4 text-center space-y-2">
                <p className="text-sm font-semibold text-green-700">Message WhatsApp ouvert !</p>
                <p className="text-xs text-green-600">
                  Votre commande est enregistrée en brouillon. Elle sera confirmée dès que vous
                  aurez envoyé le message et que nous l'aurons validée.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
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
                  Valider ma commande via WhatsApp
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(onWhatsAppInfo)}
                  className="w-full flex items-center justify-center gap-2 border border-[#25D366] text-[#128C7E] hover:bg-green-50 font-medium text-sm py-3 rounded-2xl transition-colors"
                >
                  Demander des informations via WhatsApp
                </button>
              </div>
            )}

            <p className="text-xs text-stone-400 text-center">
              La commande sera enregistrée et un message pré-rempli s'ouvrira dans WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}