'use client';

import { useState, useEffect } from 'react';
import { getSupportedCurrencies, formatCurrency } from '@/lib/currency';

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  amount?: number;
  showConversion?: boolean;
}

export default function CurrencySelector({ value, onChange, amount, showConversion }: CurrencySelectorProps) {
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const currencies = getSupportedCurrencies();

  useEffect(() => {
    if (showConversion && amount) {
      fetchExchangeRates();
    }
  }, [value, showConversion, amount]);

  const fetchExchangeRates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/currency/rates?base=${value}`);
      const data = await response.json();
      setExchangeRates(data.rates || {});
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertAmount = (targetCurrency: string) => {
    if (!amount || !exchangeRates[targetCurrency]) return amount || 0;
    return (amount / exchangeRates[value]) * exchangeRates[targetCurrency];
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Currency
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} - {currency.name} ({currency.symbol})
            </option>
          ))}
        </select>
      </div>

      {showConversion && amount && (
        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Currency Conversion</h4>
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading rates...</div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {currencies.slice(0, 6).map((currency) => (
                <div key={currency.code} className="flex justify-between">
                  <span className="text-gray-600">{currency.code}:</span>
                  <span className="font-medium">
                    {formatCurrency(convertAmount(currency.code), currency.code)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Rates are updated hourly. Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}