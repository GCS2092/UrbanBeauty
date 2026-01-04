// ============================================
// SYSTÈME DE DEVISE - BASE EN FRANC CFA (XOF)
// ============================================
// Les prix sont stockés en Franc CFA dans la base de données
// La conversion vers EUR se fait uniquement côté client pour l'affichage

// Taux de change XOF vers EUR
// 1 EUR = 655.957 XOF (taux fixe zone CFA)
const XOF_TO_EUR_RATE = 1 / 655.957; // ≈ 0.00152449

export type Currency = 'EUR' | 'XOF';

export interface CurrencyConfig {
  symbol: string;
  code: string;
  name: string;
  rateFromXOF: number; // Taux de conversion depuis XOF
}

export const currencies: Record<Currency, CurrencyConfig> = {
  XOF: {
    symbol: 'FCFA',
    code: 'XOF',
    name: 'Franc CFA',
    rateFromXOF: 1, // Base
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    name: 'Euro',
    rateFromXOF: XOF_TO_EUR_RATE,
  },
};

/**
 * Convertit un montant depuis XOF (base) vers une autre devise
 * @param amountInXOF - Montant en Franc CFA (devise de base)
 * @param to - Devise cible
 */
export function convertFromXOF(amountInXOF: number, to: Currency): number {
  if (to === 'XOF') return amountInXOF;
  return amountInXOF * currencies[to].rateFromXOF;
}

/**
 * Convertit un montant d'une devise vers XOF (base)
 * @param amount - Montant dans la devise source
 * @param from - Devise source
 */
export function convertToXOF(amount: number, from: Currency): number {
  if (from === 'XOF') return amount;
  return amount / currencies[from].rateFromXOF;
}

/**
 * Formate un montant avec la devise
 * @param amountInXOF - Montant en Franc CFA (base)
 * @param currency - Devise d'affichage souhaitée
 */
export function formatCurrency(amountInXOF: number, currency: Currency = 'XOF'): string {
  const config = currencies[currency];
  const convertedAmount = convertFromXOF(amountInXOF, currency);
  
  if (currency === 'XOF') {
    // Pour le franc CFA, arrondir à l'entier et formater avec des espaces
    const rounded = Math.round(convertedAmount);
    return `${rounded.toLocaleString('fr-FR')} ${config.symbol}`;
  }
  
  // Pour l'euro, 2 décimales
  return `${convertedAmount.toFixed(2)} ${config.symbol}`;
}

/**
 * Formate un montant avec double affichage (pour les vendeurs/coiffeuses)
 * Affiche le montant en XOF avec l'équivalent dans la devise du client
 * @param amountInXOF - Montant en Franc CFA (base)
 * @param clientCurrency - Devise choisie par le client (optionnel)
 */
export function formatCurrencyDual(amountInXOF: number, clientCurrency?: Currency): string {
  const xofFormatted = formatCurrency(amountInXOF, 'XOF');
  
  // Si pas de devise client ou si c'est déjà XOF, retourner juste XOF
  if (!clientCurrency || clientCurrency === 'XOF') {
    return xofFormatted;
  }
  
  // Afficher les deux : XOF principal + devise client entre parenthèses
  const clientFormatted = formatCurrency(amountInXOF, clientCurrency);
  return `${xofFormatted} (≈ ${clientFormatted})`;
}

/**
 * Formate un montant avec transcription en lettres (pour XOF)
 * @param amountInXOF - Montant en Franc CFA (base)
 * @param currency - Devise d'affichage souhaitée
 */
export function formatCurrencyWithText(amountInXOF: number, currency: Currency = 'XOF'): string {
  const formatted = formatCurrency(amountInXOF, currency);
  
  if (currency === 'XOF') {
    const rounded = Math.round(amountInXOF);
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
 * Récupère la devise sélectionnée par l'utilisateur (stockée dans localStorage)
 * Par défaut : XOF (Franc CFA)
 */
export function getSelectedCurrency(): Currency {
  if (typeof window === 'undefined') return 'XOF';
  const stored = localStorage.getItem('currency');
  return (stored === 'XOF' || stored === 'EUR') ? stored : 'XOF';
}

/**
 * Définit la devise préférée de l'utilisateur
 */
export function setSelectedCurrency(currency: Currency): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('currency', currency);
}

/**
 * Vérifie si l'utilisateur peut changer de devise (uniquement les clients)
 * Les vendeurs, coiffeuses et admins voient toujours en XOF
 */
export function canChangeCurrency(userRole?: string): boolean {
  if (!userRole) return true; // Non connecté = peut changer
  return userRole === 'CLIENT';
}

/**
 * Retourne la devise à utiliser selon le rôle
 * - CLIENT ou non connecté : devise choisie par l'utilisateur
 * - VENDEUR/COIFFEUSE/MANICURISTE/ADMIN : toujours XOF
 */
export function getCurrencyForRole(userRole?: string): Currency {
  if (!userRole || userRole === 'CLIENT') {
    return getSelectedCurrency();
  }
  return 'XOF'; // Vendeurs, coiffeuses et admins voient toujours en CFA
}

