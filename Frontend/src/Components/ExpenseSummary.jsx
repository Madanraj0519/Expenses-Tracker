import React, { useState } from 'react';
import { getCategoryTheme } from '../Constant/categories';

const ExpenseSummary = ({ expenses = [] }) => {
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (event) => {
    if (event.target.value) {
      setSelectedDate(new Date(event.target.value));
    }
  };

  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();

  // Calculate total expenses for the selected month
  const totalMonthlyExpenses = safeExpenses.reduce((total, expense) => {
    if (!expense || !expense.date) return total;
    const expenseDate = new Date(expense.date);
    if (
      !isNaN(expenseDate.getTime()) &&
      expenseDate.getMonth() === selectedMonth &&
      expenseDate.getFullYear() === selectedYear
    ) {
      return total + (Number(expense.amount) || 0);
    }
    return total;
  }, 0);

  // Calculate total expenses per category
  const categoryTotals = safeExpenses.reduce((acc, expense) => {
    if (!expense || !expense.date) return acc;
    const expenseDate = new Date(expense.date);
    if (
      !isNaN(expenseDate.getTime()) &&
      expenseDate.getMonth() === selectedMonth &&
      expenseDate.getFullYear() === selectedYear
    ) {
      const cat = expense.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + (Number(expense.amount) || 0);
    }
    return acc;
  }, {});

  const categoryKeys = Object.keys(categoryTotals).sort(
    (a, b) => categoryTotals[b] - categoryTotals[a]
  );

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-700/60 gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Monthly Category Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Spending distribution for {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs rounded-xl px-3 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
            type="month"
            value={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`}
            onChange={handleDateChange}
          />
          <div className="text-right pl-3 border-l border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Month Total</span>
            <span className="text-base font-bold text-rose-600 dark:text-rose-400">
              ${totalMonthlyExpenses.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {categoryKeys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryKeys.map((category) => {
            const amount = categoryTotals[category];
            const percentage = totalMonthlyExpenses > 0 ? (amount / totalMonthlyExpenses) * 100 : 0;
            const theme = getCategoryTheme(category);

            return (
              <div 
                key={category} 
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: theme.color }} 
                    />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{category}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${amount.toFixed(2)}</span>
                </div>

                {/* Mini Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`, 
                      backgroundColor: theme.color 
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Share of expenses</span>
                  <span className="font-semibold">{percentage.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-sm">
          No expenses recorded for {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}.
        </div>
      )}
    </div>
  );
};

export default ExpenseSummary;
