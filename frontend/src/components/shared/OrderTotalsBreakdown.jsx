import { formatPrice } from '../../utils/formatPrice';
import { getShippingDisplayText, getDestinationLabel } from '../../utils/shipping';

export default function OrderTotalsBreakdown({
  subtotal,
  shippingCost,
  discount = 0,
  storeDiscount = 0,
  total,
  destination,
  shippingLabel,
  className = '',
}) {
  const destLabel = destination ? getDestinationLabel(destination) : null;
  const shippingText = shippingLabel ?? getShippingDisplayText(destination, shippingCost);
  const isExpressContact = destination === 'CONGO_EXPRESS';

  return (
    <div className={`space-y-2 text-sm ${className}`}>
      <div className="flex justify-between text-stone-500">
        <span>Sous-total</span>
        <span>{formatPrice(subtotal)}</span>
      </div>

      <div className="flex justify-between text-stone-500 gap-3">
        <span className="shrink-0">
          Livraison{destLabel ? ` (${destLabel})` : ''}
        </span>
        <span
          className={`text-right ${
            isExpressContact
              ? 'text-xs font-semibold text-blue-600 max-w-[55%]'
              : ''
          }`}
        >
          {shippingText}
        </span>
      </div>

      {discount > 0 && (
        <div className="flex justify-between text-green-600 font-medium">
          <span>Réduction</span>
          <span>-{formatPrice(discount)}</span>
        </div>
      )}

      {storeDiscount > 0 && (
        <div className="flex justify-between text-green-600 font-medium">
          <span>Remise boutique</span>
          <span>-{formatPrice(storeDiscount)}</span>
        </div>
      )}

      <div className="flex justify-between font-bold text-stone-900 pt-3 border-t border-stone-100 text-base">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}
