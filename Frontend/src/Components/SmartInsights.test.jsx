import React from 'react';
import { render, screen } from '@testing-library/react';
import SmartInsights from './SmartInsights';
import axiosInstance from '../Constant/Backend/axiosInstance';

jest.mock('../Constant/Backend/axiosInstance', () => ({
  get: jest.fn(),
}));
jest.mock('react-hot-toast', () => ({
  toast: { error: jest.fn() },
}));

test('renders explainable, server-calculated spending insights', async () => {
  axiosInstance.get.mockResolvedValue({
    data: {
      insights: [{
        type: 'budget_pace',
        severity: 'caution',
        title: 'Food budget is at risk',
        message: 'At this pace, food spending may reach $600.00 against a $500.00 budget.',
      }],
      dataSufficiency: { historicalMonthsAvailable: 2, elapsedDays: 16, message: null },
    },
  });

  render(<SmartInsights />);

  expect(await screen.findByText('Food budget is at risk')).toBeInTheDocument();
  expect(screen.getByText(/No external AI service is used/)).toBeInTheDocument();
  expect(axiosInstance.get).toHaveBeenCalledWith(
    '/api/insights/spending',
    expect.objectContaining({ params: { month: expect.any(String) } })
  );
});

test('shows a recoverable error rather than presenting a failed request as empty insights', async () => {
  axiosInstance.get.mockRejectedValueOnce(new Error('API unavailable'));

  render(<SmartInsights />);

  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load spending insights.');
  expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  expect(screen.queryByText('No notable spending changes or budget risks for this month.')).not.toBeInTheDocument();
});
