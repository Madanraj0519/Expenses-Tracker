import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export const CURRENCIES = [
  { country: 'India', countryCode: 'IN', currency: 'INR', locale: 'en-IN' },
  { country: 'United States', countryCode: 'US', currency: 'USD', locale: 'en-US' },
  { country: 'United Kingdom', countryCode: 'GB', currency: 'GBP', locale: 'en-GB' },
  { country: 'Eurozone', countryCode: 'EU', currency: 'EUR', locale: 'de-DE' },
  { country: 'Canada', countryCode: 'CA', currency: 'CAD', locale: 'en-CA' },
  { country: 'Australia', countryCode: 'AU', currency: 'AUD', locale: 'en-AU' },
  { country: 'Japan', countryCode: 'JP', currency: 'JPY', locale: 'ja-JP' },
];

const STORAGE_KEY = 'expense_tracker_currency';
const RATE_CACHE_KEY = 'expense_tracker_usd_rates';
const RATE_REFRESH_INTERVAL = 24 * 60 * 60 * 1000;
const CurrencyContext = createContext(null);
const EUROZONE_COUNTRIES = new Set([
  'AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'HR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES',
]);

export const getCurrencyFromLocales = (locales) => {
  for (const locale of locales) {
    try {
      const region = new Intl.Locale(locale).region;
      if (EUROZONE_COUNTRIES.has(region)) return 'EUR';
      const match = CURRENCIES.find((entry) => entry.countryCode === region);
      if (match) return match.currency;
    } catch (error) {
      console.warn('Unable to detect currency region from browser locale.', error);
    }
  }
  return 'INR';
};

const detectCurrency = () => {
  if (typeof navigator === 'undefined') return 'INR';
  return getCurrencyFromLocales([...(navigator.languages || []), navigator.language].filter(Boolean));
};

const getInitialCurrency = () => {
  try {
    const savedCurrency = localStorage.getItem(STORAGE_KEY);
    if (CURRENCIES.some((item) => item.currency === savedCurrency)) return savedCurrency;
  } catch (error) {
    console.warn('Unable to read saved currency preference.', error);
  }
  return detectCurrency();
};

const readCachedRates = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(RATE_CACHE_KEY) || 'null');
    if (
      cached &&
      typeof cached.rates === 'object' &&
      Number.isFinite(cached.fetchedAt) &&
      CURRENCIES.every((item) => Number.isFinite(cached.rates[item.currency]) && cached.rates[item.currency] > 0)
    ) {
      return cached;
    }
  } catch (error) {
    console.warn('Unable to read cached exchange rates.', error);
  }
  return null;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(getInitialCurrency);
  const [rateData, setRateData] = useState(readCachedRates);
  const [isRefreshingRates, setIsRefreshingRates] = useState(false);
  const [rateError, setRateError] = useState(null);

  const refreshRates = useCallback(async () => {
    setIsRefreshingRates(true);
    setRateError(null);
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!response.ok) throw new Error(`Exchange-rate service returned HTTP ${response.status}.`);
      const data = await response.json();
      if (data.result !== 'success' || !data.rates) {
        throw new Error('Exchange-rate service returned an invalid response.');
      }
      const providerUpdatedAt = Number(data.time_last_update_unix) * 1000;
      if (!Number.isFinite(providerUpdatedAt) || providerUpdatedAt <= 0 || providerUpdatedAt > Date.now()) {
        throw new Error('Exchange-rate service returned an invalid update timestamp.');
      }
      const rates = Object.fromEntries(CURRENCIES.map(({ currency: code }) => [code, Number(data.rates[code])]));
      if (Object.values(rates).some((rate) => !Number.isFinite(rate) || rate <= 0)) {
        throw new Error('Exchange-rate service did not return valid rates for all supported currencies.');
      }
      const nextRateData = { rates, fetchedAt: providerUpdatedAt };
      setRateData(nextRateData);
      try {
        localStorage.setItem(RATE_CACHE_KEY, JSON.stringify(nextRateData));
      } catch (error) {
        console.warn('Unable to cache exchange rates.', error);
      }
    } catch (error) {
      setRateError(error.message || 'Unable to refresh exchange rates.');
    } finally {
      setIsRefreshingRates(false);
    }
  }, []);

  useEffect(() => {
    if (!rateData || Date.now() - rateData.fetchedAt >= RATE_REFRESH_INTERVAL) {
      refreshRates();
    }
  }, [rateData, refreshRates]);

  const setCurrency = useCallback((nextCurrency) => {
    if (!CURRENCIES.some((item) => item.currency === nextCurrency)) {
      throw new Error(`Unsupported currency: ${nextCurrency}`);
    }
    setCurrencyState(nextCurrency);
    try {
      localStorage.setItem(STORAGE_KEY, nextCurrency);
    } catch (error) {
      console.error('Unable to save currency preference.', error);
    }
  }, []);

  const selected = CURRENCIES.find((item) => item.currency === currency);
  const rate = rateData?.rates?.[currency];
  const convertFromBase = useCallback((usdAmount) => {
    const value = Number(usdAmount);
    if (!Number.isFinite(value)) return 0;
    if (currency === 'USD') return value;
    if (!Number.isFinite(rate) || rate <= 0) throw new Error('A valid exchange rate is required to convert this amount.');
    return value * rate;
  }, [currency, rate]);
  const convertToBase = useCallback((regionalAmount) => {
    const value = Number(regionalAmount);
    if (!Number.isFinite(value)) throw new Error('Enter a valid amount.');
    if (currency === 'USD') return value;
    if (!Number.isFinite(rate) || rate <= 0) throw new Error('A valid exchange rate is required to convert this amount.');
    return value / rate;
  }, [currency, rate]);
  const formatCurrency = useCallback((usdAmount, options = {}) => {
    if (currency !== 'USD' && (!Number.isFinite(rate) || rate <= 0)) return '—';
    const value = convertFromBase(usdAmount);
    const defaultFractionDigits = currency === 'JPY' ? 0 : 2;
    const minimumFractionDigits = options.minimumFractionDigits
      ?? (options.maximumFractionDigits === undefined
        ? defaultFractionDigits
        : Math.min(defaultFractionDigits, options.maximumFractionDigits));
    const maximumFractionDigits = Math.max(
      minimumFractionDigits,
      options.maximumFractionDigits ?? defaultFractionDigits
    );
    return new Intl.NumberFormat(selected.locale, {
      style: 'currency',
      currency,
      ...options,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value);
  }, [convertFromBase, currency, rate, selected]);

  const contextValue = useMemo(() => ({
    currency,
    region: selected,
    supportedCurrencies: CURRENCIES,
    ratesReady: currency === 'USD' || Number.isFinite(rate),
    isRefreshingRates,
    rateError,
    rateFetchedAt: rateData?.fetchedAt || null,
    isRateStale: Boolean(rateData && Date.now() - rateData.fetchedAt >= RATE_REFRESH_INTERVAL),
    refreshRates,
    setCurrency,
    convertFromBase,
    convertToBase,
    formatCurrency,
  }), [currency, selected, rate, isRefreshingRates, rateError, rateData, refreshRates, setCurrency, convertFromBase, convertToBase, formatCurrency]);

  return <CurrencyContext.Provider value={contextValue}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider.');
  return context;
};
