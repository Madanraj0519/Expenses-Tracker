import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TransactionEditor from './TransactionEditor';
import axiosInstance from '../Constant/Backend/axiosInstance';

jest.mock('../Constant/Backend/axiosInstance', () => ({
  put: jest.fn(),
}));
jest.mock('react-hot-toast', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));
jest.mock('../Context/CurrencyContext', () => ({
  useCurrency: (() => {
    const convertAmount = (value) => value;
    return () => ({
      currency: 'USD',
      ratesReady: true,
      convertFromBase: convertAmount,
      convertToBase: convertAmount,
    });
  })(),
}));

test('submits validated transaction edits and returns the updated record', async () => {
  const updated = { _id: 'expense-1', amount: 75, category: 'Travel', date: '2026-06-01', description: 'Train' };
  axiosInstance.put.mockResolvedValue({
    data: { newExpense: updated, user: { totalExpense: 75 } },
  });
  const onSaved = jest.fn();
  const onClose = jest.fn();

  render(
    <TransactionEditor
      transaction={{ _id: 'expense-1', amount: 50, category: 'Food', date: '2026-06-01T00:00:00.000Z', description: '' }}
      type="expense"
      onSaved={onSaved}
      onClose={onClose}
    />
  );

  fireEvent.change(screen.getByLabelText('Amount (USD)'), { target: { value: '75' } });
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Travel' } });
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Train' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

  await waitFor(() => expect(onSaved).toHaveBeenCalledWith(updated, { totalExpense: 75 }));
  expect(axiosInstance.put).toHaveBeenCalledWith(
    '/api/expense/updateExpense/expense-1',
    { amount: 75, category: 'Travel', date: '2026-06-01', description: 'Train' }
  );
  expect(onClose).toHaveBeenCalled();
});
