// Taux de change EUR vers XOF (Franc CFA)
// 1 EUR = 655.957 XOF (taux approximatif, à mettre à jour régulièrement)
const EUR_TO_XOF_RATE = 655.957;

export type Currency = 'EUR' | 'XOF';

export interface CurrencyConfig {
  symbol: string;
  code: string;
  name: string;
  rate: number;
}

export const currencies: Record<Currency, CurrencyConfig> = {
  EUR: {
    symbol: '€',
    code: 'EUR',
    name: 'Euro',
    rate: 1,
  },
  XOF: {
    symbol: 'FCFA',
    code: 'XOF',
    name: 'Franc CFA',
    rate: EUR_TO_XOF_RATE,
  },
};

/**
 * Convertit un montant d'une devise à une autre
 */
export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  
  // Convertir vers EUR d'abord si nécessaire
  const amountInEUR = from === 'EUR' ? amount : amount / currencies[from].rate;
  
  // Convertir vers la devise cible
  return to === 'EUR' ? amountInEUR : amountInEUR * currencies[to].rate;
}

/**
 * Formate un montant avec la devise
 */
export function formatCurrency(amount: number, currency: Currency = 'EUR'): string {
  const config = currencies[currency];
  const convertedAmount = currency === 'EUR' ? amount : convertCurrency(amount, 'EUR', currency);
  
  if (currency === 'XOF') {
    // Pour le franc CFA, arrondir à l'entier et formater avec des espaces
    const rounded = Math.round(convertedAmount);
    return `${rounded.toLocaleString('fr-FR')} ${config.symbol}`;
  }
  
  // Pour l'euro, 2 décimales
  return `${convertedAmount.toFixed(2)} ${config.symbol}`;
}

/**
 * Formate un montant avec transcription en lettres (pour XOF)
 */
export function formatCurrencyWithText(amount: number, currency: Currency = 'EUR'): string {
  const formatted = formatCurrency(amount, currency);
  
  if (currency === 'XOF') {
    const convertedAmount = convertCurrency(amount, 'EUR', 'XOF');
    const rounded = Math.round(convertedAmount);
    const text = numberToWords(rounded);
    return `${formatted} (${text})`;
  }
  
  return formatted;
}

/**
 * Convertit un nombre en lettres (français)
 */
function numberToWords(num: number): string {
  if (num === 0) return 'zéro';
  
  const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    if (ten === 7 || ten === 9) {
      return `${tens[ten]}-${teens[one]}`;
    }
    if (one === 0) return tens[ten];
    if (one === 1 && ten !== 8) return `${tens[ten]}-et-un`;
    return `${tens[ten]}-${ones[one]}`;
  }
  
  // Pour les nombres plus grands, on simplifie
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    if (hundred === 1) {
      return remainder === 0 ? 'cent' : `cent ${numberToWords(remainder)}`;
    }
    return remainder === 0 
      ? `${ones[hundred]} cents` 
      : `${ones[hundred]} cents ${numberToWords(remainder)}`;
  }
  
  // Pour les milliers et plus, on utilise une approche simplifiée
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    if (thousand === 1) {
      return remainder === 0 ? 'mille' : `mille ${numberToWords(remainder)}`;
    }
    return remainder === 0
      ? `${numberToWords(thousand)} mille`
      : `${numberToWords(thousand)} mille ${numberToWords(remainder)}`;
  }
  
  // Pour les millions
  const million = Math.floor(num / 1000000);
  const remainder = num % 1000000;
  if (million === 1) {
    return remainder === 0 ? 'un million' : `un million ${numberToWords(remainder)}`;
  }
  return remainder === 0
    ? `${numberToWords(million)} millions`
    : `${numberToWords(million)} millions ${numberToWords(remainder)}`;
}

/**
 * Hook pour gérer la devise sélectionnée (stockée dans localStorage)
 */
export function getSelectedCurrency(): Currency {
  if (typeof window === 'undefined') return 'EUR';
  const stored = localStorage.getItem('currency');
  return (stored === 'XOF' || stored === 'EUR') ? stored : 'EUR';
}

export function setSelectedCurrency(currency: Currency): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('currency', currency);
}

