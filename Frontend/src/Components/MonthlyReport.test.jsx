import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import MonthlyReport from './MonthlyReport';
import axiosInstance from '../Constant/Backend/axiosInstance';

jest.mock('./ExportCSV', () => () => <button type="button">CSV report</button>);
jest.mock('./ExportPDF', () => () => <button type="button">PDF report</button>);
jest.mock('../Constant/Backend/axiosInstance', () => ({
  get: jest.fn(),
}));

test('shows the selected month totals and updates them when the month changes', async () => {
  axiosInstance.get.mockImplementation((path) => Promise.resolve({
    data: {
      [path.includes('/income/') ? 'incomes' : 'expenses']: [],
      pagination: { totalPages: 1 },
    },
  }));

  await act(async () => {
    render(
      <MonthlyReport
        incomes={[
          { date: '2026-06-10T00:00:00.000Z', amount: 100 },
          { date: '2026-07-10T00:00:00.000Z', amount: 300 },
        ]}
        expenses={[
          { date: '2026-06-12T00:00:00.000Z', amount: 40 },
          { date: '2026-07-12T00:00:00.000Z', amount: 50 },
        ]}
      />
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  const monthInput = screen.getByLabelText('Report month');
  await act(async () => {
    fireEvent.change(monthInput, { target: { value: '2026-06' } });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(screen.getByText('$100.00')).toBeInTheDocument();
  expect(screen.getByText('$40.00')).toBeInTheDocument();
  expect(screen.getByText('$60.00')).toBeInTheDocument();

  await act(async () => {
    fireEvent.change(monthInput, { target: { value: '2026-07' } });
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(screen.getByText('$300.00')).toBeInTheDocument();
  expect(screen.getByText('$50.00')).toBeInTheDocument();
  expect(screen.getByText('$250.00')).toBeInTheDocument();
});
