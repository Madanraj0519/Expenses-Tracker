import React, { useState } from 'react';
import axiosInstance from '../Constant/Backend/axiosInstance';
import { toast } from 'react-hot-toast';
import { useCurrency } from '../Context/CurrencyContext';

const TransactionEditor = ({ transaction, type, onClose, onSaved }) => {
  const { currency, ratesReady, convertFromBase, convertToBase } = useCurrency();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(transaction.category || '');
  const [date, setDate] = useState(transaction.date ? new Date(transaction.date).toISOString().slice(0, 10) : '');
  const [description, setDescription] = useState(transaction.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const isExpense = type === 'expense';
  const entity = isExpense ? 'Expense' : 'Income';

  React.useEffect(() => {
    if (ratesReady) setAmount(String(convertFromBase(transaction.amount)));
  }, [transaction._id, transaction.amount, currency, ratesReady, convertFromBase]);

  const save = async (event) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || !category.trim() || !date) {
      toast.error('Enter a valid amount, category, and date.');
      return;
    }

    try {
      setIsSaving(true);
      if (!ratesReady) {
        toast.error('Wait for a valid exchange rate before saving this transaction.');
        return;
      }
      const response = await axiosInstance.put(`/api/${type}/update${entity}/${transaction._id}`, {
        amount: convertToBase(parsedAmount),
        category: category.trim(),
        date,
        description: description.trim(),
      });
      onSaved(response.data[isExpense ? 'newExpense' : 'newIncome'], response.data.user);
      toast.success(`${entity} updated.`);
      onClose();
    } catch (error) {
      toast.error(error.friendlyMessage || `Failed to update ${type}.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isSaving) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="transaction-editor-title" className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="transaction-editor-title" className="text-lg font-bold text-slate-900 dark:text-white">Edit {entity.toLowerCase()}</h2>
          <button type="button" onClick={onClose} disabled={isSaving} aria-label="Close editor" className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">×</button>
        </div>
        <form onSubmit={save} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
            Amount ({currency})
            <input type="number" min="0.01" step={currency === 'JPY' ? '1' : '0.01'} required disabled={!ratesReady} value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm disabled:opacity-50" />
          </label>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
            Category
            <input type="text" maxLength={80} required value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm" />
          </label>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
            Date
            <input type="date" required value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm" />
          </label>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
            Description
            <textarea maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} rows="3" className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm" />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} disabled={isSaving} className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium">Cancel</button>
            <button type="submit" disabled={isSaving || !ratesReady} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{isSaving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default TransactionEditor;
