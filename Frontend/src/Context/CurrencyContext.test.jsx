import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CurrencyProvider, getCurrencyFromLocales, useCurrency } from './CurrencyContext';

test('detects supported locales, maps euro-area countries, and defaults to India', () => {
  expect(getCurrencyFromLocales(['en-IN'])).toBe('INR');
  expect(getCurrencyFromLocales(['en-US'])).toBe('USD');
  expect(getCurrencyFromLocales(['en-GB'])).toBe('GBP');
  expect(getCurrencyFromLocales(['de-DE'])).toBe('EUR');
  expect(getCurrencyFromLocales(['fr-FR'])).toBe('EUR');
  expect(getCurrencyFromLocales(['zh-CN'])).toBe('INR');
});

const CurrencyTestConsumer = () => {
  const { currency, convertToBase, formatCurrency, ratesReady, setCurrency } = useCurrency();
  return (
    <div>
      <label htmlFor="currency">Currency</label>
      <select id="currency" value={currency} onChange={(event) => setCurrency(event.target.value)}>
        <option value="USD">USD</option>
        <option value="INR">INR</option>
      </select>
      <span data-testid="conversion">{ratesReady ? convertToBase(800) : 'waiting'}</span>
      <span data-testid="formatted">{ratesReady ? formatCurrency(10) : 'waiting'}</span>
      <span data-testid="chart-tick">{ratesReady ? formatCurrency(10, { maximumFractionDigits: 0 }) : 'waiting'}</span>
    </div>
  );
};

test('converts input and formats stored USD amounts using the selected region rate', async () => {
  localStorage.clear();
  const rates = { INR: 80, USD: 1, GBP: 0.8, EUR: 0.9, CAD: 1.3, AUD: 1.5, JPY: 150 };
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ result: 'success', rates, time_last_update_unix: Math.floor(Date.now() / 1000) }),
  });

  render(<CurrencyProvider><CurrencyTestConsumer /></CurrencyProvider>);

  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('https://open.er-api.com/v6/latest/USD'));
  fireEvent.change(screen.getByLabelText('Currency'), { target: { value: 'INR' } });

  await waitFor(() => expect(screen.getByTestId('conversion')).toHaveTextContent('10'));
  expect(screen.getByTestId('formatted')).toHaveTextContent(/₹\s?800\.00/);
  expect(screen.getByTestId('chart-tick')).toHaveTextContent(/₹\s?800/);
  expect(screen.getByTestId('chart-tick')).not.toHaveTextContent(/\.00/);
  expect(localStorage.getItem('expense_tracker_currency')).toBe('INR');

  delete global.fetch;
});
