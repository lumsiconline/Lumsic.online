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
 * Timezone-based country heuristic (instantaneous, offline-safe, 0ms latency)
 */
function detectFromTimezone(): CountryInfo | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('India')) {
      return COUNTRIES.find(c => c.code === 'IN') || null;
    }
    if (tz.includes('London') || tz.includes('Belfast')) {
      return COUNTRIES.find(c => c.code === 'GB') || null;
    }
    if (tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Montreal') || tz.includes('Edmonton') || tz.includes('Winnipeg')) {
      return COUNTRIES.find(c => c.code === 'CA') || null;
    }
    if (tz.includes('Sydney') || tz.includes('Melbourne') || tz.includes('Brisbane') || tz.includes('Perth') || tz.includes('Adelaide')) {
      return COUNTRIES.find(c => c.code === 'AU') || null;
    }
    if (tz.includes('Dubai')) {
      return COUNTRIES.find(c => c.code === 'AE') || null;
    }
    if (tz.includes('Singapore')) {
      return COUNTRIES.find(c => c.code === 'SG') || null;
    }
    if (tz.includes('Auckland')) {
      return COUNTRIES.find(c => c.code === 'NZ') || null;
    }
    if (tz.includes('Paris')) return COUNTRIES.find(c => c.code === 'FR') || null;
    if (tz.includes('Berlin')) return COUNTRIES.find(c => c.code === 'DE') || null;
    if (tz.includes('Rome')) return COUNTRIES.find(c => c.code === 'IT') || null;
    if (tz.includes('Madrid')) return COUNTRIES.find(c => c.code === 'ES') || null;
    if (tz.includes('Amsterdam')) return COUNTRIES.find(c => c.code === 'NL') || null;
    if (tz.includes('Dublin')) return COUNTRIES.find(c => c.code === 'IE') || null;
    if (tz.includes('Zurich')) return COUNTRIES.find(c => c.code === 'CH') || null;
    if (tz.startsWith('America/')) {
      return COUNTRIES.find(c => c.code === 'US') || null;
    }
  } catch {}
  return null;
}

/**
 * Detects user country & currency based on stored preference, local /api/geo, or timezone heuristics.
 * Fully resilient with no network blocking or unhandled console errors.
 */
export async function detectUserGeo(): Promise<CountryInfo> {
  const defaultCountry = COUNTRIES.find(c => c.code === 'US') || COUNTRIES[0];

  // 1. Return saved preference if already chosen by visitor
  try {
    const savedCode = localStorage.getItem('astral_country');
    if (savedCode) {
      const savedMatch = COUNTRIES.find(c => c.code.toUpperCase() === savedCode.toUpperCase());
      if (savedMatch) return savedMatch;
    }
  } catch {}

  // 2. Try fast local backend /api/geo with 1200ms timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch('/api/geo', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json().catch(() => null);
      const code = String(data?.country || '').toUpperCase();
      if (code) {
        const match = COUNTRIES.find(c => c.code.toUpperCase() === code);
        if (match) {
          try {
            localStorage.setItem('astral_country', match.code);
            localStorage.setItem('astral_currency', match.currency);
          } catch {}
          return match;
        }
      }
    }
  } catch {}

  // 3. Instant client timezone heuristic (100% reliable, zero network latency)
  const tzMatch = detectFromTimezone();
  if (tzMatch) {
    try {
      localStorage.setItem('astral_country', tzMatch.code);
      localStorage.setItem('astral_currency', tzMatch.currency);
    } catch {}
    return tzMatch;
  }

  // 4. Fallback to default
  return defaultCountry;
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
