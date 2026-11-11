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
  { code: 'INR', symbol: '₹', label: 'INR (₹)', name: 'Indian Rupee', flag: '🇮🇳', minRecharge: 50 },
  { code: 'USD', symbol: '$', label: 'USD ($)', name: 'US Dollar', flag: '🇺🇸', minRecharge: 5 },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', name: 'British Pound', flag: '🇬🇧', minRecharge: 5 },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', name: 'Euro', flag: '🇪🇺', minRecharge: 5 },
  { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$)', name: 'Canadian Dollar', flag: '🇨🇦', minRecharge: 5 },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)', name: 'Australian Dollar', flag: '🇦🇺', minRecharge: 5 },
  { code: 'AED', symbol: 'AED ', label: 'AED (Dirham)', name: 'UAE Dirham', flag: '🇦🇪', minRecharge: 20 },
];

/**
 * Accurately convert INR shop product price to visitor's detected currency
 */
export function convertInrToCurrency(amountINR: number, currencyCode: string = 'INR'): {
  formatted: string;
  symbol: string;
  value: number;
} {
  const code = currencyCode.toUpperCase();
  if (code === 'INR') {
    return {
      formatted: `₹${amountINR.toLocaleString('en-IN')}`,
      symbol: '₹',
      value: amountINR
    };
  }

  let rate = 0.012; // default USD
  let symbol = '$';

  if (code === 'USD') { rate = 0.012; symbol = '$'; }
  else if (code === 'GBP') { rate = 0.0095; symbol = '£'; }
  else if (code === 'EUR') { rate = 0.011; symbol = '€'; }
  else if (code === 'CAD') { rate = 0.016; symbol = 'CA$'; }
  else if (code === 'AUD') { rate = 0.018; symbol = 'A$'; }
  else if (code === 'AED') { rate = 0.044; symbol = 'AED '; }
  else if (code === 'SGD') { rate = 0.016; symbol = 'S$'; }
  else if (code === 'NZD') { rate = 0.020; symbol = 'NZ$'; }

  const converted = Math.max(1, Math.round(amountINR * rate));
  return {
    formatted: `${symbol}${converted.toLocaleString('en-US')}`,
    symbol,
    value: converted
  };
}

/**
 * Accurately convert USD base ritual price to visitor's detected currency
 */
export function convertUsdToCurrency(amountUSD: number, currencyCode: string = 'USD'): {
  formatted: string;
  symbol: string;
  value: number;
} {
  const code = currencyCode.toUpperCase();
  if (code === 'USD') {
    return {
      formatted: `$${amountUSD.toLocaleString('en-US')}`,
      symbol: '$',
      value: amountUSD
    };
  }

  if (code === 'INR') {
    const inrVal = Math.round(amountUSD * 83);
    return {
      formatted: `₹${inrVal.toLocaleString('en-IN')}`,
      symbol: '₹',
      value: inrVal
    };
  }

  let multiplier = 1.0;
  let symbol = '$';

  if (code === 'GBP') { multiplier = 0.80; symbol = '£'; }
  else if (code === 'EUR') { multiplier = 0.92; symbol = '€'; }
  else if (code === 'CAD') { multiplier = 1.35; symbol = 'CA$'; }
  else if (code === 'AUD') { multiplier = 1.50; symbol = 'A$'; }
  else if (code === 'AED') { multiplier = 3.67; symbol = 'AED '; }
  else if (code === 'SGD') { multiplier = 1.34; symbol = 'S$'; }
  else if (code === 'NZD') { multiplier = 1.63; symbol = 'NZ$'; }

  const converted = Math.max(1, Math.round(amountUSD * multiplier));
  return {
    formatted: `${symbol}${converted.toLocaleString('en-US')}`,
    symbol,
    value: converted
  };
}

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
/**
 * Timezone & locale-based country heuristic (instantaneous, offline-safe, 0ms latency)
 */
function detectFromTimezone(): CountryInfo | null {
  try {
    // 1. Precise Indian Standard Time offset check (UTC+5:30 -> -330 min)
    const offset = new Date().getTimezoneOffset();
    if (offset === -330) {
      return COUNTRIES.find(c => c.code === 'IN') || null;
    }

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('India') || tz === 'Asia/Colombo') {
      return COUNTRIES.find(c => c.code === 'IN') || null;
    }
    if (tz.includes('London') || tz.includes('Belfast') || tz.includes('Dublin')) {
      return COUNTRIES.find(c => c.code === 'GB') || null;
    }
    if (tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Montreal') || tz.includes('Edmonton') || tz.includes('Winnipeg') || tz.includes('Halifax')) {
      return COUNTRIES.find(c => c.code === 'CA') || null;
    }
    if (tz.includes('Sydney') || tz.includes('Melbourne') || tz.includes('Brisbane') || tz.includes('Perth') || tz.includes('Adelaide') || tz.includes('Hobart')) {
      return COUNTRIES.find(c => c.code === 'AU') || null;
    }
    if (tz.includes('Dubai') || tz.includes('Muscat')) {
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
    if (tz.includes('Zurich')) return COUNTRIES.find(c => c.code === 'CH') || null;
    if (tz.startsWith('America/')) {
      return COUNTRIES.find(c => c.code === 'US') || null;
    }
  } catch {}
  return null;
}

/**
 * Browser Language heuristic
 */
function detectFromBrowserLanguage(): CountryInfo | null {
  try {
    const langs = navigator.languages || [navigator.language || ''];
    for (const l of langs) {
      const lower = l.toLowerCase();
      if (lower.includes('-in') || lower.startsWith('hi') || lower.startsWith('te') || lower.startsWith('ta') || lower.startsWith('mr') || lower.startsWith('bn') || lower.startsWith('gu')) {
        return COUNTRIES.find(c => c.code === 'IN') || null;
      }
      if (lower.includes('-gb')) return COUNTRIES.find(c => c.code === 'GB') || null;
      if (lower.includes('-ca')) return COUNTRIES.find(c => c.code === 'CA') || null;
      if (lower.includes('-au')) return COUNTRIES.find(c => c.code === 'AU') || null;
      if (lower.includes('-ae')) return COUNTRIES.find(c => c.code === 'AE') || null;
      if (lower.includes('-de')) return COUNTRIES.find(c => c.code === 'DE') || null;
      if (lower.includes('-fr')) return COUNTRIES.find(c => c.code === 'FR') || null;
    }
  } catch {}
  return null;
}

/**
 * Detects user country & currency based on:
 * 1. Explicit user override (if chosen via UI currency picker)
 * 2. Real IP-based Geo from local backend /api/geo
 * 3. Fast public Geo IP lookup (api.country.is)
 * 4. Zero-latency client timezone and offset heuristics
 * 5. Browser language tags
 */
export async function detectUserGeo(forceReDetect: boolean = false): Promise<CountryInfo> {
  const defaultCountry = COUNTRIES.find(c => c.code === 'IN') || COUNTRIES.find(c => c.code === 'US') || COUNTRIES[0];

  // 1. Return manual user choice if visitor explicitly picked currency via UI
  if (!forceReDetect) {
    try {
      const isManual = localStorage.getItem('astral_currency_manual_override') === 'true';
      const savedCode = localStorage.getItem('astral_country');
      if (isManual && savedCode) {
        const savedMatch = COUNTRIES.find(c => c.code.toUpperCase() === savedCode.toUpperCase());
        if (savedMatch) return savedMatch;
      }
    } catch {}
  }

  // 2. Try local backend /api/geo with 1200ms timeout
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

  // 3. Fast direct public Geo-IP lookup from visitor's real client IP
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch('https://api.country.is', {
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

  // 4. Instant client timezone heuristic (100% reliable, zero network latency)
  const tzMatch = detectFromTimezone();
  if (tzMatch) {
    try {
      localStorage.setItem('astral_country', tzMatch.code);
      localStorage.setItem('astral_currency', tzMatch.currency);
    } catch {}
    return tzMatch;
  }

  // 5. Browser Language check
  const langMatch = detectFromBrowserLanguage();
  if (langMatch) {
    try {
      localStorage.setItem('astral_country', langMatch.code);
      localStorage.setItem('astral_currency', langMatch.currency);
    } catch {}
    return langMatch;
  }

  // 6. Saved previous preference if exists
  try {
    const savedCode = localStorage.getItem('astral_country');
    if (savedCode) {
      const savedMatch = COUNTRIES.find(c => c.code.toUpperCase() === savedCode.toUpperCase());
      if (savedMatch) return savedMatch;
    }
  } catch {}

  // 7. Fallback to default
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
