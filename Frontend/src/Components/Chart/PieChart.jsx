import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import moment from 'moment-timezone';
import { getCategoryTheme } from '../../Constant/categories';
import { useTheme } from '../../Context/ThemeContext';
import { useCurrency } from '../../Context/CurrencyContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ expenses = [], selectOption, setSelectOption }) => {
  const [groupBy, setGroupBy] = useState('category'); // 'category' or 'date'
  const { isDark } = useTheme();
  const { formatCurrency } = useCurrency();

  const safeData = Array.isArray(expenses) ? expenses : [];

  const totalsMap = safeData.reduce((acc, item) => {
    if (!item) return acc;
    const key = groupBy === 'date' 
      ? moment(item.date).format('MMM Do YYYY') 
      : (item.category || 'Uncategorized');
    
    acc[key] = (acc[key] || 0) + (Number(item.amount) || 0);
    return acc;
  }, {});

  const labels = Object.keys(totalsMap);
  const values = Object.values(totalsMap);

  const colors = labels.map((label) => {
    return getCategoryTheme(label).color;
  });

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        hoverBackgroundColor: colors,
        borderColor: isDark ? '#0f172a' : '#ffffff',
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#cbd5e1' : '#475569',
          font: {
            family: 'Plus Jakarta Sans',
            size: 11,
            weight: 500,
          },
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#475569',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            return ` ${formatCurrency(val)}`;
          }
        }
      }
    }
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700/60'>
        <span className='text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider'>
          Distribution
        </span>
        <div className='flex items-center gap-1.5'>
          <select
            className='bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-medium cursor-pointer focus:outline-none'
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
          >
            <option value="category">By Category</option>
            <option value="date">By Date</option>
          </select>
          <select
            className='bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-medium cursor-pointer focus:outline-none'
            value={selectOption}
            onChange={(e) => setSelectOption(e.target.value)}
          >
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
        </div>
      </div>

      <div className='flex-1 flex flex-col items-center justify-center min-h-[240px]'>
        {safeData.length > 0 ? (
          <div className='w-full max-w-[280px] mx-auto'>
            <Pie data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center p-6 text-slate-400 dark:text-slate-500'>
            <p className='text-sm font-medium'>No {selectOption} data recorded</p>
          </div>
        )}
      </div>

      <div className='mt-2 pt-2 text-center text-xs text-slate-500 dark:text-slate-400 font-medium capitalize border-t border-slate-200 dark:border-slate-800'>
        {selectOption} breakdown by {groupBy}
      </div>
    </div>
  );
};

export default PieChart;