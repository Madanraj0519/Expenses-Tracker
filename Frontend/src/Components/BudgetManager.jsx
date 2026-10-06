import React, { useCallback, useEffect, useState } from 'react';
import axiosInstance from '../Constant/Backend/axiosInstance';
import { toast } from 'react-hot-toast';

const currentMonth = () => new Date().toISOString().slice(0, 7);
const currency = (value) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const BudgetManager = () => {
  const [month, setMonth] = useState(currentMonth);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadBudgets = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/api/budget', { params: { month } });
      setBudgets(response.data.budgets || []);
    } catch (error) {
      toast.error(error.friendlyMessage || 'Failed to load budgets.');
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const saveBudget = async (event) => {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Enter a budget amount greater than zero.');
      return;
    }

    try {
      setIsSaving(true);
      await axiosInstance.put('/api/budget', {
        month,
        category: category.trim() || null,
        amount: value,
      });
      setAmount('');
      setCategory('');
      toast.success('Monthly budget saved.');
      await loadBudgets();
    } catch (error) {
      toast.error(error.friendlyMessage || 'Failed to save budget.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBudget = async (id) => {
    try {
      await axiosInstance.delete(`/api/budget/${id}`);
      toast.success('Budget removed.');
      await loadBudgets();
    } catch (error) {
      toast.error(error.friendlyMessage || 'Failed to remove budget.');
    }
  };

  return (
    <section className="rounded-2xl glass-card border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-md" aria-labelledby="monthly-budget-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 id="monthly-budget-heading" className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Monthly budgets</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Set an overall limit or track a specific spending category.</p>
        </div>
        <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Budget month
          <input
            type="month"
            aria-label="Budget month"
            required
            value={month}
            onChange={(event) => {
              if (event.target.value) setMonth(event.target.value);
            }}
            className="ml-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-1.5"
          />
        </label>
      </div>

      <form onSubmit={saveBudget} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 mb-5">
        <label className="sr-only" htmlFor="budget-category">Category (leave blank for overall budget)</label>
        <input
          id="budget-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          maxLength={80}
          placeholder="Category (blank = overall)"
          className="min-w-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
        />
        <label className="sr-only" htmlFor="budget-amount">Monthly budget amount</label>
        <input
          id="budget-amount"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Limit amount"
          required
          className="min-w-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
        />
        <button type="submit" disabled={isSaving} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {isSaving ? 'Saving…' : 'Save budget'}
        </button>
      </form>

      {isLoading ? (
        <p className="py-5 text-center text-sm text-slate-500">Loading budgets…</p>
      ) : budgets.length === 0 ? (
        <p className="py-5 text-center text-sm text-slate-500">No budgets set for this month yet.</p>
      ) : (
        <div className="space-y-3">
          {budgets.map((budget) => {
            const exceeded = budget.alertLevel === 'exceeded';
            const warning = budget.alertLevel === 'warning';
            const width = Math.min(budget.percentage, 100);
            return (
              <div key={budget._id} className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{budget.category || 'Overall spending'}</p>
                    <p className={`text-xs mt-0.5 ${exceeded ? 'text-rose-600 dark:text-rose-400' : warning ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {exceeded ? 'Budget exceeded' : warning ? '80% or more used' : `${currency(budget.remaining)} remaining`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-right text-xs text-slate-600 dark:text-slate-300">
                      {currency(budget.spent)} / {currency(budget.amount)}
                      <span className="block">{budget.percentage.toFixed(0)}% used</span>
                    </span>
                    <button type="button" onClick={() => deleteBudget(budget._id)} aria-label={`Remove ${budget.category || 'overall'} budget`} className="text-xs font-medium text-rose-600 hover:text-rose-500">
                      Remove
                    </button>
                  </div>
                </div>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
                  role="progressbar"
                  aria-label={`${budget.category || 'Overall'} budget used`}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={Math.min(100, Math.round(budget.percentage))}
                >
                  <div className={`h-full rounded-full ${exceeded ? 'bg-rose-500' : warning ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default BudgetManager;
