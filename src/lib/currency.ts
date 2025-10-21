import axios from 'axios';

export interface CurrencyRate {
  code: string;
  rate: number;
  name: string;
}

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

let cachedRates: ExchangeRates | null = null;
let cacheExpiry = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function getExchangeRates(baseCurrency = 'USD'): Promise<ExchangeRates> {
  const now = Date.now();

  if (cachedRates && cachedRates.base === baseCurrency && now < cacheExpiry) {
    return cachedRates;
  }

  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    const url = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;

    const response = await axios.get(url);
    const data = response.data;

    cachedRates = {
      base: data.base,
      rates: data.rates,
      timestamp: now,
    };
    cacheExpiry = now + CACHE_DURATION;

    return cachedRates;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    // Return cached rates if available, otherwise fallback to basic rates
    if (cachedRates) {
      return cachedRates;
    }

    // Fallback rates (approximate)
    return {
      base: baseCurrency,
      rates: {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        CAD: 1.25,
        AUD: 1.35,
        JPY: 110,
        CHF: 0.92,
        CNY: 6.45,
        INR: 74,
        ZAR: 14.5,
      },
      timestamp: now,
    };
  }
}

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string, rates: Record<string, number>): number {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;

  // Convert to base currency first, then to target currency
  const baseAmount = amount / fromRate;
  return baseAmount * toRate;
}

export function getSupportedCurrencies() {
  return SUPPORTED_CURRENCIES;
}

export function getCurrencySymbol(code: string): string {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === code);
  return currency?.symbol || code;
}

export function formatCurrency(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
}