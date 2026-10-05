import React from 'react';
import moment from 'moment-timezone';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Filler
} from 'chart.js';
import { useTheme } from '../../Context/ThemeContext';

ChartJS.register(LineElement, PointElement, Tooltip, Legend, CategoryScale, LinearScale, Filler);

const LineChart = ({ incomes = [], expenses = [] }) => {
  const { isDark } = useTheme();
  const safeIncomes = Array.isArray(incomes) ? incomes : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  // Group by Month-Year for clean financial trend tracking
  const monthlyData = {};

  safeIncomes.forEach((item) => {
    if (!item || !item.date) return;
    const m = moment(item.date).format('MMM YYYY');
    if (!monthlyData[m]) monthlyData[m] = { income: 0, expense: 0, sortKey: moment(item.date).valueOf() };
    monthlyData[m].income += Number(item.amount) || 0;
  });

  safeExpenses.forEach((item) => {
    if (!item || !item.date) return;
    const m = moment(item.date).format('MMM YYYY');
    if (!monthlyData[m]) monthlyData[m] = { income: 0, expense: 0, sortKey: moment(item.date).valueOf() };
    monthlyData[m].expense += Number(item.amount) || 0;
  });

  // Sort chronologically
  const sortedMonths = Object.keys(monthlyData).sort(
    (a, b) => monthlyData[a].sortKey - monthlyData[b].sortKey
  );

  const labels = sortedMonths.length > 0 ? sortedMonths : ['Current'];
  const incomeValues = sortedMonths.map((m) => monthlyData[m].income);
  const expenseValues = sortedMonths.map((m) => monthlyData[m].expense);

  const data = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomeValues,
        borderColor: '#10b981', // Emerald
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderWidth: 2.5,
        pointBackgroundColor: '#10b981',
        pointBorderColor: isDark ? '#1e293b' : '#ffffff',
        pointHoverRadius: 6,
        fill: true,
        tension: 0.35,
      },
      {
        label: 'Expense',
        data: expenseValues,
        borderColor: '#f43f5e', // Rose
        backgroundColor: 'rgba(244, 63, 94, 0.12)',
        borderWidth: 2.5,
        pointBackgroundColor: '#f43f5e',
        pointBorderColor: isDark ? '#1e293b' : '#ffffff',
        pointHoverRadius: 6,
        fill: true,
        tension: 0.35,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: {
            family: 'Plus Jakarta Sans',
            size: 11,
          }
        }
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: {
            family: 'Plus Jakarta Sans',
            size: 11,
          },
          callback: (value) => `$${value}`,
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: isDark ? '#cbd5e1' : '#334155',
          usePointStyle: true,
          boxWidth: 8,
          font: {
            family: 'Plus Jakarta Sans',
            size: 12,
            weight: 600,
          }
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
            const label = context.dataset.label || '';
            const val = context.parsed.y || 0;
            return ` ${label}: $${val.toFixed(2)}`;
          }
        }
      }
    }
  };

  const hasData = sortedMonths.length > 0;

  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-700/60'>
        <span className='text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider'>
          Cash Flow Trends
        </span>
        <span className='text-xs text-slate-400 dark:text-slate-400 font-medium'>
          Monthly Overview
        </span>
      </div>

      <div className='h-[260px] w-full'>
        {hasData ? (
          <Line data={data} options={options} />
        ) : (
          <div className='h-full flex items-center justify-center text-slate-400 dark:text-slate-500'>
            <p className='text-sm font-medium'>No transaction activity to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LineChart;