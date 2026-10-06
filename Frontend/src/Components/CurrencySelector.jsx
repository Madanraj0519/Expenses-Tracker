import React from 'react';
import { useCurrency } from '../Context/CurrencyContext';

const CurrencySelector = () => {
  const {
    currency,
    supportedCurrencies,
    setCurrency,
    isRefreshingRates,
    rateError,
    rateFetchedAt,
    isRateStale,
    refreshRates,
    ratesReady,
  } = useCurrency();

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
      <label htmlFor="display-currency" className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
        Region and currency
      </label>
      <select
        id="display-currency"
        value={currency}
        onChange={(event) => setCurrency(event.target.value)}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-xs text-slate-800 dark:text-slate-100"
      >
        {supportedCurrencies.map((item) => (
          <option key={item.currency} value={item.currency}>{item.country} ({item.currency})</option>
        ))}
      </select>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-500 dark:text-slate-400">
          {isRefreshingRates
            ? 'Updating live exchange rates…'
            : rateFetchedAt
              ? `${isRateStale ? 'Cached rate' : 'Rate updated'} ${new Date(rateFetchedAt).toLocaleDateString()}`
              : ratesReady ? 'USD base currency' : 'Exchange rates unavailable'}
        </span>
        <button
          type="button"
          onClick={refreshRates}
          disabled={isRefreshingRates}
          className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>
      <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
        Stored in USD; converted at the current rate, not the transaction-date rate.
      </p>
      {rateError && (
        <p role="alert" className="mt-2 text-[10px] text-rose-600 dark:text-rose-400">
          {rateError}{rateFetchedAt ? ' Using the last saved rate.' : ' Amount entry is disabled until a rate is available.'}
        </p>
      )}
    </div>
  );
};

export default CurrencySelector;
