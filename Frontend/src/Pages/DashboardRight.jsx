import React from 'react';
import DashboardChart from '../Components/DashboardChart';
import Income from '../Components/Income';
import Expense from '../Components/Expense';

const DashboardRight = ({ active }) => {
  return (
    <div className='w-full h-full glass-panel rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-200 dark:border-slate-800/80 transition-colors duration-300'>
      {active === 1 && <DashboardChart />}
      {active === 2 && <Income />}
      {active === 3 && <Expense />}
    </div>
  );
};

export default DashboardRight;