import React, { useState } from 'react';

const ExpenseSummary = ({ expenses }) => {
  // State to store the selected month and year
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Handle month and year change
  const handleDateChange = (event) => {
    setSelectedDate(new Date(event.target.value));
  };

  // Get selected month and year
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();

  // Calculate total expenses for the selected month
  const totalMonthlyExpenses = expenses.reduce((total, expense) => {
    const expenseDate = new Date(expense.date);
    if (
      expenseDate.getMonth() === selectedMonth &&
      expenseDate.getFullYear() === selectedYear
    ) {
      return total + expense.amount;
    }
    return total;
  }, 0);

  // Calculate total expenses per category
  const categoryTotals = expenses.reduce((acc, expense) => {
    const expenseDate = new Date(expense.date);
    if (
      expenseDate.getMonth() === selectedMonth &&
      expenseDate.getFullYear() === selectedYear
    ) {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    }
    return acc;
  }, {});

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg small:text-xl font-semibold mb-4">Expense Summary</h2>

      {/* Total Monthly Expenses */}
      <div className="flex flex-col large:flex-row justify-between mb-4">
        <div>
          <h3 className=" text-base small:text-lg font-semibold">Total Expenses for {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}:</h3>
          <p className="text-2xl font-bold text-red-500">${totalMonthlyExpenses.toFixed(2)}</p>
        </div>

        <div>
         <label className='text-lg font-medium text-gray-700 flex justify-end large:justify-start'>select Month</label>
         <input className='bg-[#eee2e2] p-1 text-end px-2 cursor-pointer rounded font-medium text-black w-full'
            type="date"
            value={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`}
            onChange={handleDateChange}
             placeholder="Start Date"
           />
         </div>
      </div>

      {/* Total Per Category */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Expenses by Category:</h3>
        <ul className="list-disc list-inside">
          {Object.keys(categoryTotals).map((category) => (
            <li key={category} className="text-base flex gap-2 mt-2">
              <span className="font-semibold">{category}:</span> ${categoryTotals[category].toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExpenseSummary;
