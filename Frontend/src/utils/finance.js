export const filterTransactionsForMonth = (transactions, month) => (
  (Array.isArray(transactions) ? transactions : []).filter((transaction) => {
    const date = new Date(transaction?.date);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 7) === month;
  })
);

export const summarizeTransactions = (transactions) => (
  (Array.isArray(transactions) ? transactions : []).reduce((total, transaction) => {
    const amount = Number(transaction?.amount);
    return Number.isFinite(amount) && amount > 0 ? total + amount : total;
  }, 0)
);
