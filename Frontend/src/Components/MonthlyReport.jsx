import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../Constant/Backend/axiosInstance';
import { toast } from 'react-hot-toast';
import { filterTransactionsForMonth, summarizeTransactions } from '../utils/finance';
import ExportCSV from './ExportCSV';
import ExportPDF from './ExportPDF';

const currentMonth = () => new Date().toISOString().slice(0, 7);
const currency = (value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const MonthlyReport = ({ incomes = [], expenses = [] }) => {
  const [month, setMonth] = useState(currentMonth);
  const [reportTransactions, setReportTransactions] = useState([]);
  const [isLoadingReport, setIsLoadingReport] = useState(true);
  const monthlyIncomes = useMemo(() => filterTransactionsForMonth(incomes, month), [incomes, month]);
  const monthlyExpenses = useMemo(() => filterTransactionsForMonth(expenses, month), [expenses, month]);
  const incomeTotal = summarizeTransactions(monthlyIncomes);
  const expenseTotal = summarizeTransactions(monthlyExpenses);
  const net = incomeTotal - expenseTotal;
  const savingsRate = incomeTotal > 0 ? (net / incomeTotal) * 100 : 0;

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const [year, monthNumber] = month.split('-').map(Number);
    const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const params = {
      startDate: `${month}-01`,
      endDate: `${month}-${String(lastDay).padStart(2, '0')}`,
      limit: 100,
    };

    const fetchAllPages = async (path, key, type) => {
      const firstResponse = await axiosInstance.get(path, { params: { ...params, page: 1 }, signal: controller.signal });
      const firstData = firstResponse.data;
      const transactions = (firstData[key] || []).map((transaction) => ({ ...transaction, type }));
      for (let page = 2; page <= (firstData.pagination?.totalPages || 1); page += 1) {
        const pageResponse = await axiosInstance.get(path, { params: { ...params, page }, signal: controller.signal });
        transactions.push(...(pageResponse.data[key] || []).map((transaction) => ({ ...transaction, type })));
      }
      return transactions;
    };

    const loadReportTransactions = async () => {
      try {
        setIsLoadingReport(true);
        const [incomeRows, expenseRows] = await Promise.all([
          fetchAllPages('/api/income/getIncome', 'incomes', 'Income'),
          fetchAllPages('/api/expense/getExpense', 'expenses', 'Expense'),
        ]);
        if (isMounted) {
          setReportTransactions([...incomeRows, ...expenseRows].sort((a, b) => new Date(b.date) - new Date(a.date)));
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.friendlyMessage || 'Unable to load transactions for this report.');
        }
      } finally {
        if (isMounted) setIsLoadingReport(false);
      }
    };

    loadReportTransactions();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [month]);

  return (
    <section className="rounded-2xl glass-card border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-md" aria-labelledby="monthly-report-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 id="monthly-report-heading" className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Monthly financial report</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Compare cash in, spending, and savings for a selected month.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="report-month" className="sr-only">Report month</label>
          <input id="report-month" type="month" required value={month} onChange={(event) => {
            if (event.target.value) setMonth(event.target.value);
          }} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-1.5 text-xs" />
          <ExportCSV transactions={reportTransactions} month={month} disabled={isLoadingReport} />
          <ExportPDF transactions={reportTransactions} month={month} disabled={isLoadingReport} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Income</p>
          <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">{currency(incomeTotal)}</p>
        </div>
        <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Expenses</p>
          <p className="mt-1 text-lg font-bold text-rose-600 dark:text-rose-400">{currency(expenseTotal)}</p>
        </div>
        <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">Net savings · {savingsRate.toFixed(1)}% savings rate</p>
          <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">{currency(net)}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {isLoadingReport ? 'Loading transactions for export…' : `${reportTransactions.length} transactions included in this report.`}
      </p>
    </section>
  );
};

export default MonthlyReport;
