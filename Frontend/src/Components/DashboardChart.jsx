import React, { useEffect, useState } from 'react';
import axiosInstance from "../Constant/Backend/axiosInstance";
import { FaChartLine, FaArrowTrendUp, FaArrowTrendDown, FaWallet } from "react-icons/fa6";
import { useSelector } from 'react-redux';
import PieChart from './Chart/PieChart';
import LineChart from "./Chart/LineChart";
import ExpenseSummary from "./ExpenseSummary";
import ExportCSV from "./ExportCSV";
import ExportPDF from "./ExportPDF";
import Loading from "./Loading";
import { toast } from "react-hot-toast";

const DashboardChart = () => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectOption, setSelectOption] = useState('expense');
  const [isLoading, setIsLoading] = useState(true);

  const { currentUser } = useSelector(state => state.authUser);

  const totalIncome = Number(currentUser?.user?.totalIncome ?? currentUser?.totalIncome ?? 0);
  const totalExpense = Number(currentUser?.user?.totalExpense ?? currentUser?.totalExpense ?? 0);
  const netBalance = totalIncome - totalExpense;

  useEffect(() => {
    let isMounted = true;

    const handleIncomesAndExpenses = async () => {
      try {
        setIsLoading(true);
        const [incomesRes, expensesRes] = await Promise.all([
          axiosInstance.get('/api/income/getIncome'),
          axiosInstance.get('/api/expense/getExpenseChart'),
        ]);

        if (isMounted) {
          setIncomes(incomesRes.data?.incomes || []);
          setExpenses(expensesRes.data?.expenses || []);
        }
      } catch (err) {
        const errorMsg = err.friendlyMessage || err.message || "Failed to load dashboard data.";
        toast.error(errorMsg);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    handleIncomesAndExpenses();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className='w-full space-y-6'>
      {/* Top Header & Export Actions */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800'>
        <div>
          <h2 className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5'>
            <FaChartLine className='text-blue-500' /> Financial Overview
          </h2>
          <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1'>
            Track your cash flow, analyze spending patterns, and monitor net balance.
          </p>
        </div>
        <div className='flex items-center gap-2.5 flex-wrap'>
          <ExportCSV expenses={expenses} />
          <ExportPDF expenses={expenses} />
        </div>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center h-72'>
          <Loading />
        </div>
      ) : (
        <>
          {/* Key Metric KPI Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {/* Total Income Card */}
            <div className='p-5 rounded-2xl glass-card border border-emerald-500/30 dark:border-emerald-500/20 shadow-glow-green relative overflow-hidden'>
              <div className='flex items-center justify-between'>
                <span className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
                  Total Income
                </span>
                <span className='w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm'>
                  <FaArrowTrendUp />
                </span>
              </div>
              <div className='mt-3'>
                <h3 className='text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400'>
                  +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>Cumulative recorded earnings</p>
              </div>
            </div>

            {/* Total Expense Card */}
            <div className='p-5 rounded-2xl glass-card border border-rose-500/30 dark:border-rose-500/20 shadow-glow-red relative overflow-hidden'>
              <div className='flex items-center justify-between'>
                <span className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
                  Total Expenses
                </span>
                <span className='w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 text-sm'>
                  <FaArrowTrendDown />
                </span>
              </div>
              <div className='mt-3'>
                <h3 className='text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400'>
                  -${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>Cumulative recorded spending</p>
              </div>
            </div>

            {/* Net Balance Card */}
            <div className={`p-5 rounded-2xl glass-card border relative overflow-hidden ${
              netBalance >= 0 ? "border-blue-500/30 dark:border-blue-500/20 shadow-glow-blue" : "border-amber-500/30 dark:border-amber-500/20"
            }`}>
              <div className='flex items-center justify-between'>
                <span className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
                  Net Savings
                </span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  netBalance >= 0 ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}>
                  <FaWallet />
                </span>
              </div>
              <div className='mt-3'>
                <h3 className={`text-2xl sm:text-3xl font-extrabold ${
                  netBalance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"
                }`}>
                  ${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
                  {netBalance >= 0 ? "Healthy financial surplus" : "Expenses exceed income"}
                </p>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
            {/* Category / Date Breakdown */}
            <div className='lg:col-span-5 p-4 sm:p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 shadow-md'>
              <PieChart
                expenses={selectOption === 'expense' ? expenses : incomes}
                selectOption={selectOption}
                setSelectOption={setSelectOption}
              />
            </div>

            {/* Cash Flow Line Trends */}
            <div className='lg:col-span-7 p-4 sm:p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 shadow-md'>
              <LineChart incomes={incomes} expenses={expenses} />
            </div>
          </div>

          {/* Monthly Category Summary Breakdown */}
          <div className='rounded-2xl glass-card border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-md'>
            <ExpenseSummary expenses={expenses} />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardChart;