import { formatPrice } from './formatPrice';

export const FREE_SHIPPING_ITEM_THRESHOLD = 5;

export const DESTINATION_LABELS = {
  SENEGAL: 'Sénégal (Dakar)',
  CONGO_EXPRESS: 'Congo — Express',
  CONGO_GROUPAGE: 'Congo — Groupage',
};

/**
 * Tente de convertir une valeur en nombre.
 * Retourne null si ce n'est pas un nombre valide.
 */
function tryParseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function getShippingCost(destination, settings, { itemCount = 0, subtotal = 0 } = {}) {
  if (!destination || destination === 'SENEGAL') {
    const fee = Number(settings?.delivery_fee || 2000);
    const threshold = Number(settings?.free_delivery_threshold || 50000);
    if (subtotal >= threshold) return 0;
    return fee;
  }

  // Livraison gratuite si ≥ 5 articles (sauf Express)
  if (itemCount >= FREE_SHIPPING_ITEM_THRESHOLD && destination !== 'CONGO_EXPRESS') {
    return 0;
  }

  if (destination === 'CONGO_EXPRESS') {
    return 0;
  }

  if (destination === 'CONGO_GROUPAGE') {
    const parsed = tryParseNumber(settings?.congo_groupage_rate);
    return parsed !== null ? parsed : 0;
  }

  return 0;
}

export function isExpressContactRequired(destination) {
  return destination === 'CONGO_EXPRESS';
}

/**
 * Affiche le tarif de livraison.
 * - Si c'est un nombre → formatPrice
 * - Si c'est du texte → affiche le texte tel quel
 */
export function getShippingDisplayText(destination, shippingCost, settings = {}) {
  // Express
  if (destination === 'CONGO_EXPRESS') {
    const custom = settings?.congo_express_rate?.trim();
    if (custom && tryParseNumber(custom) === null) {
      return custom;
    }
    return 'Nous contacter pour en savoir plus';
  }

  if (shippingCost === 0) {
    return 'Gratuite';
  }

  // Groupage
  if (destination === 'CONGO_GROUPAGE') {
    const raw = settings?.congo_groupage_rate?.trim();
    if (raw && tryParseNumber(raw) === null) {
      return raw;
    }
  }

  return formatPrice(shippingCost);
}

export function getDestinationLabel(destination) {
  return DESTINATION_LABELS[destination] || destination || '';
}

export function computeOrderTotal(subtotal, shippingCost, discount = 0, storeDiscount = 0) {
  return subtotal + shippingCost - discount - storeDiscount;
}