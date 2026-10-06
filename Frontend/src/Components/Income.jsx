import React, { useCallback, useEffect, useState } from 'react';
import { FaCalendar, FaPlusCircle, FaChevronDown, FaTrash, FaEdit } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import axiosInstance from "../Constant/Backend/axiosInstance";
import { updateCurrentUser } from "../Feature/Auth/userAuthSlice";
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment-timezone';
import Loading from './Loading';
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getCategoryTheme } from '../Constant/categories';
import TransactionEditor from './TransactionEditor';
import { useCurrency } from '../Context/CurrencyContext';

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investments",
  "Business",
  "Rental",
  "Dividends",
  "Gift",
  "Others"
];

const Income = () => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Salary');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const { currentUser } = useSelector((state) => state.authUser);
  const dispatch = useDispatch();
  const { currency, ratesReady, convertToBase, formatCurrency } = useCurrency();

  const totalIncome = Number(currentUser?.user?.totalIncome ?? currentUser?.totalIncome ?? 0);

  const fetchIncomes = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get('/api/income/getIncome', {
        params: { page, limit: 10, search },
      });
      if (res.data && res.data.incomes) {
        const totalPages = res.data.pagination?.totalPages || 0;
        if (page > Math.max(1, totalPages)) {
          setPage(Math.max(1, totalPages));
          return;
        }
        setIncomes(res.data.incomes);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      const errorMsg = err.friendlyMessage || err.message || 'Failed to load incomes.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const handleAddIncome = async (e) => {
    e.preventDefault();

    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }

    const finalCategory = category === 'Others' && customCategory.trim() 
      ? customCategory.trim() 
      : category;

    if (!finalCategory) {
      toast.error("Please enter or select an income category.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post('/api/income/addIncome', {
        amount: convertToBase(parsedAmount),
        category: finalCategory,
        date: date || new Date(),
        description: description.trim()
      });

      if (response.data && response.data.success) {
        if (response.data.user) {
          dispatch(updateCurrentUser(response.data.user));
        }
        if (response.data.newIncome) {
          setPage(1);
          setSearch('');
          setIncomes((prev) => [response.data.newIncome, ...prev]);
        }
        toast.success(response.data.message || 'Income added successfully');

        // Reset form
        setAmount('');
        setDescription('');
        setDate(null);
        setCustomCategory('');
      } else {
        toast.error(response.data?.message || 'Failed to add income.');
      }

    } catch (err) {
      const errorMsg = err.friendlyMessage || err.message || 'Failed to save income.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIncome = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income record?")) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await axiosInstance.delete(`/api/income/deleteIncome/${id}`);

      if (response.data && response.data.success) {
        if (response.data.user) {
          dispatch(updateCurrentUser(response.data.user));
        }
        setIncomes((prev) => prev.filter((item) => item._id !== id));
        await fetchIncomes();
        toast.success('Income record deleted successfully');
      } else {
        toast.error(response.data?.message || 'Failed to delete income');
      }

    } catch (err) {
      const errorMsg = err.friendlyMessage || err.message || 'Failed to delete income.';
      toast.error(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className='w-full space-y-6'>
      {/* Header Banner */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3'>
        <div>
          <h2 className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5'>
            <HiOutlineShoppingBag className='text-emerald-500 text-2xl' /> Income Management
          </h2>
          <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1'>
            Track all incoming cash flows, wages, freelance payouts, and investments.
          </p>
        </div>
        <div className='px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-right'>
          <span className='text-xs text-slate-500 dark:text-slate-400 block font-medium'>Total Earnings</span>
          <span className='text-xl font-extrabold text-emerald-600 dark:text-emerald-400'>
            +{formatCurrency(totalIncome)}
          </span>
        </div>
      </div>

      {/* Main Grid: Form (Left) & Transaction List (Right) */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
        
        {/* Income Creation Form */}
        <div className='lg:col-span-5 p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 shadow-md'>
          <h3 className='text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2'>
            <FaPlusCircle className='text-emerald-500 text-sm' /> Record New Income
          </h3>

          <form onSubmit={handleAddIncome} className='space-y-4'>
            <div>
              <label className='text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5'>
                Income Category
              </label>
              <select
                value={category}
                disabled={isSubmitting}
                onChange={(e) => setCategory(e.target.value)}
                className='w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer'
              >
                {INCOME_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {category === 'Others' && (
              <div>
                <label className='text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5'>
                  Custom Source Name
                </label>
                <input
                  type='text'
                  placeholder='E.g. Bonus, Consulting...'
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className='w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                />
              </div>
            )}

            <div>
              <label className='text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5'>
                Amount ({currency})
              </label>
              <div className='relative'>
                <span className='absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold'>
                  {new Intl.NumberFormat(undefined, { style: 'currency', currency }).formatToParts(0).find((part) => part.type === 'currency')?.value || currency}
                </span>
                <input
                  type='number'
                  placeholder='0.00'
                  min="0.01"
                  step={currency === 'JPY' ? '1' : '0.01'}
                  required
                  value={amount}
                  disabled={isSubmitting || !ratesReady}
                  aria-label={`Amount in ${currency}`}
                  onChange={(e) => setAmount(e.target.value)}
                  className='w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50'
                />
              </div>
            </div>

            <div>
              <label className='text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5'>
                Date
              </label>
              <DatePicker
                selected={date}
                placeholderText='Choose date (defaults to today)'
                onChange={(selectedDate) => setDate(selectedDate)}
                disabled={isSubmitting}
                className='w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer'
              />
            </div>

            <div>
              <label className='text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5'>
                Description / Reference (Optional)
              </label>
              <textarea
                placeholder='E.g. Monthly salary, client retainer fee...'
                value={description}
                disabled={isSubmitting}
                onChange={(e) => setDescription(e.target.value)}
                rows="2"
                className='w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
              />
            </div>

            <button
              type='submit'
              disabled={isSubmitting || !ratesReady}
              className='w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-glow-green hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2'
            >
              <FaPlusCircle className='text-base' />
              <span>{isSubmitting ? "Recording Income..." : "Record Income"}</span>
            </button>
          </form>
        </div>

        {/* Income History List */}
        <div className='lg:col-span-7 p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 shadow-md flex flex-col'>
          <div className='pb-3 border-b border-slate-200 dark:border-slate-800'>
            <h3 className='text-base font-bold text-slate-900 dark:text-white mb-1'>Income Records</h3>
            <p className='text-xs text-slate-500 dark:text-slate-400'>Timeline of all earnings logged into your account</p>
            <input
              type="search"
              aria-label="Search income category or description"
              placeholder="Search category or description"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="mt-3 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
            />
          </div>

          <div className='mt-4 space-y-3 overflow-y-auto max-h-[500px] pr-1'>
            {isLoading ? (
              <div className='py-12 flex justify-center'>
                <Loading />
              </div>
            ) : incomes && incomes.length > 0 ? (
              incomes.map((item) => {
                const theme = getCategoryTheme(item.category || 'Salary');
                const isExpanded = expandedId === item._id;

                return (
                  <div
                    key={item._id}
                    className='p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600/70 transition-all'
                  >
                    <div className='flex items-center justify-between gap-3'>
                      <div className='flex items-center gap-3'>
                        {/* Category Indicator Dot */}
                        <div 
                          className='w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm'
                          style={{ backgroundColor: theme.bgDark, color: theme.color }}
                        >
                          {item.category ? item.category.slice(0, 2).toUpperCase() : "IN"}
                        </div>

                        <div>
                          <div className='flex items-center gap-2'>
                            <span className='font-semibold text-slate-900 dark:text-white text-sm capitalize'>
                              {item.category}
                            </span>
                            <span 
                              className='px-2 py-0.5 rounded-full text-[10px] font-semibold border'
                              style={{ 
                                backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                                color: '#10b981', 
                                borderColor: 'rgba(16, 185, 129, 0.3)' 
                              }}
                            >
                              Income
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5'>
                            <FaCalendar className='text-[10px]' />
                            <span>{moment(item.date).format('MMM Do, YYYY')}</span>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        <span className='text-base font-bold text-emerald-600 dark:text-emerald-400'>
                          +{formatCurrency(item.amount)}
                        </span>

                        <button
                          type='button'
                          title='Edit record'
                          onClick={() => setEditingTransaction(item)}
                          className='p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors'
                        >
                          <FaEdit className='text-xs' />
                        </button>
                        
                        <button
                          type='button'
                          title='Delete record'
                          disabled={deletingId === item._id}
                          onClick={() => handleDeleteIncome(item._id)}
                          className='p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-30 cursor-pointer'
                        >
                          <FaTrash className='text-xs' />
                        </button>

                        {item.description && (
                          <button
                            type='button'
                            onClick={() => setExpandedId(isExpanded ? null : item._id)}
                            className='p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-transform cursor-pointer'
                          >
                            <FaChevronDown className={`text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && item.description && (
                      <div className='mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-300'>
                        <span className='font-semibold text-slate-500 dark:text-slate-400'>Note: </span>
                        {item.description}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className='py-12 text-center text-slate-500 text-sm'>
                No income transactions recorded yet.
              </div>
            )}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} income records</span>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1 disabled:opacity-40">Previous</button>
                <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>

      </div>
      {editingTransaction && (
        <TransactionEditor
          transaction={editingTransaction}
          type="income"
          onClose={() => setEditingTransaction(null)}
          onSaved={(transaction, user) => {
            if (user) dispatch(updateCurrentUser(user));
            setIncomes((items) => items.map((item) => item._id === transaction._id ? transaction : item));
          }}
        />
      )}
    </div>
  );
};

export default Income;