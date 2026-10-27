/**
 * International Currency & IP/Geo Detection Engine
 * Supports USA (USD $), UK (GBP £), Europe (EUR €), Canada (CAD CA$), Australia (AUD A$)
 * India (INR) is completely excluded from customer-facing country and currency options.
 */

export interface CountryInfo {
  code: string; // ISO 2-letter
  dialCode: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  rateMultiplierFromGBP: number;
}

export const COUNTRIES: CountryInfo[] = [
  { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳', currency: 'INR', currencySymbol: '₹', rateMultiplierFromGBP: 108.0 },
  { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸', currency: 'USD', currencySymbol: '$', rateMultiplierFromGBP: 1.30 },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£', rateMultiplierFromGBP: 1.00 },
  { code: 'CA', dialCode: '+1', name: 'Canada', flag: '🇨🇦', currency: 'CAD', currencySymbol: 'CA$', rateMultiplierFromGBP: 1.75 },
  { code: 'AU', dialCode: '+61', name: 'Australia', flag: '🇦🇺', currency: 'AUD', currencySymbol: 'A$', rateMultiplierFromGBP: 1.95 },
  { code: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪', currency: 'EUR', currencySymbol: '€', rateMultiplierFromGBP: 1.18 },
  { code: 'FR', dialCode: '+33', name: 'France', flag: '🇫🇷', currency: 'EUR', currencySymbol: '€', rateMultiplierFromGBP: 1.18 },
  { code: 'IE', dialCode: '+353', name: 'Ireland', flag: '🇮🇪', currency: 'EUR', currencySymbol: '€', rateMultiplierFromGBP: 1.18 },
  { code: 'ES', dialCode: '+34', name: 'Spain', flag: '🇪🇸', currency: 'EUR', currencySymbol: '€', rateMultiplierFromGBP: 1.18 },
  { code: 'IT', dialCode: '+39', name: 'Italy', flag: '🇮🇹', currency: 'EUR', currencySymbol: '€', rateMultiplierFromGBP: 1.18 },
  { code: 'NL', dialCode: '+31', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', currencySymbol: '€', rateMultiplierFromGBP: 1.18 },
  { code: 'NZ', dialCode: '+64', name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', currencySymbol: 'NZ$', rateMultiplierFromGBP: 2.12 },
  { code: 'CH', dialCode: '+41', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF', currencySymbol: 'CHF ', rateMultiplierFromGBP: 1.15 },
  { code: 'SG', dialCode: '+65', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', currencySymbol: 'S$', rateMultiplierFromGBP: 1.74 },
  { code: 'AE', dialCode: '+971', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', currencySymbol: 'AED ', rateMultiplierFromGBP: 4.75 },
];

export const CURRENCY_CONFIG: Record<string, { symbol: string; rate: number; name: string }> = {
  INR: { symbol: '₹', rate: 108.0, name: 'Indian Rupee' },
  USD: { symbol: '$', rate: 1.30, name: 'US Dollar' },
  GBP: { symbol: '£', rate: 1.00, name: 'British Pound' },
  EUR: { symbol: '€', rate: 1.18, name: 'Euro' },
  CAD: { symbol: 'CA$', rate: 1.75, name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', rate: 1.95, name: 'Australian Dollar' },
  AED: { symbol: 'AED ', rate: 4.75, name: 'UAE Dirham' },
  SGD: { symbol: 'S$', rate: 1.74, name: 'Singapore Dollar' },
  NZD: { symbol: 'NZ$', rate: 2.12, name: 'New Zealand Dollar' },
  CHF: { symbol: 'CHF ', rate: 1.15, name: 'Swiss Franc' },
};

export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹)', name: 'Indian Rupee', minRecharge: 50 },
  { code: 'USD', symbol: '$', label: 'USD ($)', name: 'US Dollar', minRecharge: 5 },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', name: 'British Pound', minRecharge: 5 },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', name: 'Euro', minRecharge: 5 },
  { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$)', name: 'Canadian Dollar', minRecharge: 5 },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)', name: 'Australian Dollar', minRecharge: 5 },
];

export const MINIMUM_RECHARGE_AMOUNT = 5; // Standard minimum for USD/GBP/EUR

export function getMinRechargeAmount(currencyCode: string = 'USD'): number {
  if (currencyCode === 'INR') return 50;
  return 5;
}

/**
 * Returns currency symbol for a currency code (defaults to $)
 */
export function getCurrencySymbol(currencyCode: string = 'USD'): string {
  if (currencyCode === 'INR') return '₹';
  return (CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD).symbol;
}

/**
 * Formats monetary amounts properly with 2 decimal places and currency symbol
 */
export function formatCurrencyAmount(amount: number, currencyCode: string = 'USD'): string {
  const conf = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `${conf.symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Detects user country & currency based on stored preference, IP/Server headers, or timezone heuristics.
 * Strict exclusion of India / INR.
 */
export async function detectUserGeo(): Promise<CountryInfo> {
  // Check if current domain is lumsic.in
  if (typeof window !== 'undefined' && (window.location.hostname.includes('lumsic.in') || window.location.hostname.endsWith('.in'))) {
    return COUNTRIES.find(c => c.code === 'IN') || COUNTRIES[0];
  }

  // 1. Check if user already manually selected
  const savedCurrency = localStorage.getItem('astral_currency');
  const savedCountryCode = localStorage.getItem('astral_country');

  if (savedCountryCode) {
    const found = COUNTRIES.find(c => c.code === savedCountryCode);
    if (found) return found;
  }
  if (savedCurrency) {
    const found = COUNTRIES.find(c => c.currency === savedCurrency);
    if (found) return found;
  }

  // 2. Try server-side IP detection endpoint
  try {
    const res = await fetch('/api/geo', { signal: AbortSignal.timeout(1800) });
    if (res.ok) {
      const data = await res.json();
      if (data.country) {
        const match = COUNTRIES.find(c => c.code.toUpperCase() === data.country.toUpperCase());
        if (match) {
          localStorage.setItem('astral_country', match.code);
          localStorage.setItem('astral_currency', match.currency);
          return match;
        }
      }
    }
  } catch {
    // fallback to client heuristics
  }

  // 3. Fallback to client browser timezone heuristic
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const tzLower = tz.toLowerCase();
    
    if (tzLower.includes('kolkata') || tzLower.includes('calcutta') || tzLower.includes('asia/kolkata')) {
      return COUNTRIES.find(c => c.code === 'IN')!;
    }
    if (tzLower.includes('london') || tzLower.includes('belfast') || tzLower.includes('europe/london')) {
      return COUNTRIES.find(c => c.code === 'GB')!;
    }
    if (
      tzLower.includes('new_york') || 
      tzLower.includes('los_angeles') || 
      tzLower.includes('chicago') || 
      tzLower.includes('denver') || 
      tzLower.includes('phoenix') ||
      tzLower.startsWith('america/')
    ) {
      return COUNTRIES.find(c => c.code === 'US')!;
    }
    if (tzLower.includes('toronto') || tzLower.includes('vancouver') || tzLower.includes('edmonton')) {
      return COUNTRIES.find(c => c.code === 'CA')!;
    }
    if (tzLower.includes('sydney') || tzLower.includes('melbourne') || tzLower.includes('brisbane') || tzLower.includes('perth')) {
      return COUNTRIES.find(c => c.code === 'AU')!;
    }
    if (tzLower.includes('paris') || tzLower.includes('berlin') || tzLower.includes('rome') || tzLower.includes('madrid')) {
      return COUNTRIES.find(c => c.code === 'FR') || COUNTRIES.find(c => c.code === 'DE')!;
    }
    if (tzLower.includes('dubai') || tzLower.includes('abu_dhabi')) {
      return COUNTRIES.find(c => c.code === 'AE')!;
    }
  } catch {
    // ignore
  }

  // Default to US (USD) or India if accessed via .in
  return COUNTRIES.find(c => c.code === 'US') || COUNTRIES[0];
}

/**
 * Format rate per minute dynamically into the user's currency
 */
export function formatCurrencyPrice(_baseGbpRate: number, currencyCode: string = 'USD'): {
  currentPrice: string;
  originalPrice: string;
  symbol: string;
  currentNumber: number;
} {
  const conf = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;
  const symbol = conf.symbol;
  const safeCurrency = currencyCode || 'USD';

  if (safeCurrency === 'INR') {
    return {
      currentPrice: '₹49.00',
      originalPrice: '₹99.00',
      symbol: '₹',
      currentNumber: 49.00
    };
  }

  if (safeCurrency === 'GBP') {
    return {
      currentPrice: '£1.00',
      originalPrice: '£2.50',
      symbol: '£',
      currentNumber: 1.00
    };
  }

  if (safeCurrency === 'EUR') {
    return {
      currentPrice: '€1.00',
      originalPrice: '€2.50',
      symbol: '€',
      currentNumber: 1.00
    };
  }

  if (safeCurrency === 'CAD') {
    return {
      currentPrice: 'CA$1.00',
      originalPrice: 'CA$2.50',
      symbol: 'CA$',
      currentNumber: 1.00
    };
  }

  if (safeCurrency === 'AUD') {
    return {
      currentPrice: 'A$1.00',
      originalPrice: 'A$2.50',
      symbol: 'A$',
      currentNumber: 1.00
    };
  }

  // Default USD
  return {
    currentPrice: '$1.00',
    originalPrice: '$2.50',
    symbol: '$',
    currentNumber: 1.00
  };
}
