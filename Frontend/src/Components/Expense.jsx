import React, { useState } from 'react';
import { FaCalendar, FaPlusCircle, FaChevronDown, FaTrash, FaEdit } from "react-icons/fa";
import { HiOutlineReceiptRefund } from "react-icons/hi2";
import axiosInstance from "../Constant/Backend/axiosInstance";
import { updateCurrentUser } from "../Feature/Auth/userAuthSlice";
import { useDispatch, useSelector } from 'react-redux';
import CustomCategory from './CustomCategory';
import moment from 'moment-timezone';
import ExpenseList from './ExpenseList';
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getCategoryTheme } from '../Constant/categories';
import TransactionEditor from './TransactionEditor';

const Expense = () => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [categorySuggestion, setCategorySuggestion] = useState(null);
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);

  const { currentUser } = useSelector((state) => state.authUser);
  const dispatch = useDispatch();

  const totalExpense = Number(currentUser?.user?.totalExpense ?? currentUser?.totalExpense ?? 0);

  const requestCategorySuggestion = async () => {
    if (description.trim().length < 2) {
      toast.error('Add a short description before requesting a suggestion.');
      return;
    }
    try {
      setIsSuggestingCategory(true);
      const response = await axiosInstance.post('/api/insights/category-suggestion', {
        description: description.trim(),
      });
      setCategorySuggestion(response.data);
    } catch (error) {
      toast.error(error.friendlyMessage || 'Unable to suggest a category.');
      setCategorySuggestion(null);
    } finally {
      setIsSuggestingCategory(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }

    if (!category || category === 'Category') {
      toast.error("Please select or create an expense category.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post('/api/expense/addExpense', {
        amount: parsedAmount,
        category,
        date: date || new Date(),
        description: description.trim()
      });

      if (response.data && response.data.success) {
        if (response.data.user) {
          dispatch(updateCurrentUser(response.data.user));
        }
        if (response.data.newExpense) {
          setIncomes((prev) => [response.data.newExpense, ...prev]);
          setRefreshKey((key) => key + 1);
        }
        toast.success(response.data.message || 'Expense added successfully');

        // Reset form
        setAmount('');
        setCategory('');
        setDescription('');
        setCategorySuggestion(null);
        setDate(null);
      } else {
        toast.error(response.data?.message || 'Failed to add expense.');
      }

    } catch (err) {
      const errorMsg = err.friendlyMessage || err.message || 'Failed to save expense.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await axiosInstance.delete(`/api/expense/deleteExpense/${id}`);

      if (response.data && response.data.success) {
        if (response.data.user) {
          dispatch(updateCurrentUser(response.data.user));
        }
        setIncomes((prev) => prev.filter((item) => item._id !== id));
        setRefreshKey((key) => key + 1);
        toast.success('Expense record deleted successfully');
      } else {
        toast.error(response.data?.message || 'Failed to delete expense');
      }

    } catch (err) {
      const errorMsg = err.friendlyMessage || err.message || 'Failed to delete expense.';
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
            <HiOutlineReceiptRefund className='text-rose-500 text-2xl' /> Expense Management
          </h2>
          <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1'>
            Log your daily expenses, tag them with categories, and review spending.
          </p>
        </div>
        <div className='px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-right'>
          <span className='text-xs text-slate-500 dark:text-slate-400 block font-medium'>Total Expenses</span>
          <span className='text-xl font-extrabold text-rose-600 dark:text-rose-400'>
            -${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Main Grid: Form (Left) & Transaction List (Right) */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
        
        {/* Expense Creation Form */}
        <div className='lg:col-span-5 p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 shadow-md'>
          <h3 className='text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2'>
            <FaPlusCircle className='text-rose-500 text-sm' /> Add New Expense
          </h3>

          <form onSubmit={handleAddExpense} className='space-y-4'>
            <CustomCategory category={category} setCategory={setCategory} />

            <div>
              <label className='text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5'>
                Amount ($)
              </label>
              <div className='relative'>
                <span className='absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold'>
                  $
                </span>
                <input
                  type='number'
                  placeholder='0.00'
                  min="0.01"
                  step="0.01"
                  required
                  value={amount}
                  disabled={isSubmitting}
                  onChange={(e) => setAmount(e.target.value)}
                  className='w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50'
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
                className='w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer'
              />
            </div>

            <div>
              <label className='text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5'>
                Description / Reference (Optional)
              </label>
              <textarea
                placeholder='E.g. Dinner with clients, grocery run...'
                value={description}
                disabled={isSubmitting}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setCategorySuggestion(null);
                }}
                rows="2"
                className='w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500'
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={requestCategorySuggestion}
                  disabled={isSuggestingCategory || description.trim().length < 2}
                  className="rounded-lg border border-blue-300 dark:border-blue-700 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 disabled:opacity-50"
                >
                  {isSuggestingCategory ? 'Checking your history…' : 'Suggest category'}
                </button>
                {categorySuggestion?.suggestion && (
                  <span className="text-xs text-slate-600 dark:text-slate-300" aria-live="polite">
                    Suggestion: <strong>{categorySuggestion.suggestion}</strong> ({Math.round(categorySuggestion.confidence * 100)}% match strength)
                    <button
                      type="button"
                      onClick={() => setCategory(categorySuggestion.suggestion)}
                      className="ml-2 font-semibold text-blue-600 dark:text-blue-400 underline"
                    >
                      Use suggestion
                    </button>
                  </span>
                )}
                {categorySuggestion && (
                  <p className="w-full text-[11px] text-slate-500 dark:text-slate-400" aria-live="polite">{categorySuggestion.reason}</p>
                )}
              </div>
            </div>

            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-glow-red hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2'
            >
              <FaPlusCircle className='text-base' />
              <span>{isSubmitting ? "Saving Expense..." : "Add Expense"}</span>
            </button>
          </form>
        </div>

        {/* Expenses List & Filter Area */}
        <div className='lg:col-span-7 p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 shadow-md flex flex-col'>
          <div className='pb-3 border-b border-slate-200 dark:border-slate-800'>
            <h3 className='text-base font-bold text-slate-900 dark:text-white mb-1'>Expense History</h3>
            <p className='text-xs text-slate-500 dark:text-slate-400'>Filter and inspect past expenditure records</p>
            <ExpenseList incomes={incomes} setIncomes={setIncomes} pagination={pagination} setPagination={setPagination} refreshKey={refreshKey} />
          </div>

          <div className='mt-4 space-y-3 overflow-y-auto max-h-[500px] pr-1'>
            {incomes && incomes.length > 0 ? (
              incomes.map((item) => {
                const theme = getCategoryTheme(item.category);
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
                          {item.category ? item.category.slice(0, 2).toUpperCase() : "EX"}
                        </div>

                        <div>
                          <div className='flex items-center gap-2'>
                            <span className='font-semibold text-slate-900 dark:text-white text-sm capitalize'>
                              {item.category}
                            </span>
                            <span 
                              className='px-2 py-0.5 rounded-full text-[10px] font-semibold border'
                              style={{ 
                                backgroundColor: theme.bgDark, 
                                color: theme.color, 
                                borderColor: theme.border 
                              }}
                            >
                              Expense
                            </span>
                          </div>
                          <div className='flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5'>
                            <FaCalendar className='text-[10px]' />
                            <span>{moment(item.date).format('MMM Do, YYYY')}</span>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        <span className='text-base font-bold text-rose-600 dark:text-rose-400'>
                          -${Number(item.amount).toFixed(2)}
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
                          onClick={() => handleDeleteExpense(item._id)}
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
                No expense transactions found matching your criteria.
              </div>
            )}
          </div>
        </div>

      </div>
      {editingTransaction && (
        <TransactionEditor
          transaction={editingTransaction}
          type="expense"
          onClose={() => setEditingTransaction(null)}
          onSaved={(transaction, user) => {
            if (user) dispatch(updateCurrentUser(user));
            setIncomes((items) => items.map((item) => item._id === transaction._id ? transaction : item));
            setRefreshKey((key) => key + 1);
          }}
        />
      )}
    </div>
  );
};

export default Expense;