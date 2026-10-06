import { filterTransactionsForMonth, summarizeTransactions } from './finance';

describe('monthly financial summaries', () => {
  const transactions = [
    { date: '2026-05-31T23:59:59.000Z', amount: 10 },
    { date: '2026-06-01T00:00:00.000Z', amount: 20 },
    { date: 'invalid', amount: 100 },
  ];

  test('filters transactions using inclusive UTC calendar months', () => {
    expect(filterTransactionsForMonth(transactions, '2026-06')).toEqual([transactions[1]]);
  });

  test('sums only finite positive transaction amounts', () => {
    expect(summarizeTransactions([{ amount: 2 }, { amount: '3.5' }, { amount: 'bad' }, { amount: -1 }])).toBe(5.5);
  });
});
