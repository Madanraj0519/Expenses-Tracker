import React from 'react';
import { render, screen } from '@testing-library/react';
import BudgetManager from './BudgetManager';
import axiosInstance from '../Constant/Backend/axiosInstance';

jest.mock('../Constant/Backend/axiosInstance', () => ({
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));
jest.mock('react-hot-toast', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

test('shows budget usage and threshold warning from the API response', async () => {
  axiosInstance.get.mockResolvedValue({
    data: {
      budgets: [{
        _id: 'budget-1',
        category: 'Food',
        amount: 500,
        spent: 425,
        remaining: 75,
        percentage: 85,
        alertLevel: 'warning',
      }],
    },
  });

  render(<BudgetManager />);

  expect(await screen.findByText('80% or more used')).toBeInTheDocument();
  expect(screen.getByText('Food')).toBeInTheDocument();
  expect(screen.getByRole('progressbar', { name: 'Food budget used' })).toHaveAttribute('aria-valuenow', '85');
});
