import React, { useEffect, useState } from 'react';
import axiosInstance from "../Constant/Backend/axiosInstance";
import { FaChartLine } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import PieChart from './Chart/PieChart';
import LineChart from "./Chart/LineChart";
import ExpenseSummary from "./ExpenseSummary";
import ExportCSV from "./ExportCSV";
import ExportPDF from "./ExportPDF"

const DashboardChart = () => {

  const [incomes, setIncomes ] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const { currentUser } = useSelector(state => state.authUser);

  const total = currentUser.user.totalIncome - currentUser.user.totalExpense;

  useEffect(() => {

    const handleIncomesAndExpenses = async() => {
      try {
        const [ incomesRes, expensesRes ] = await Promise.all([
          axiosInstance.get('/api/income/getIncome'),
          axiosInstance.get('/api/expense/getExpenseChart'),
        ]);

        setIncomes(incomesRes.data.incomes);
        setExpenses(expensesRes.data.expenses);

      } catch (error) {
        console.log(error);
      }
    };

    handleIncomesAndExpenses();
  }, [])


  return (
    <div className='w-full h-full text-black'>
      <div className='p-4 base:p-4 h-full'>

         <div className='flex flex-col large:flex-row justify-between items-center gap-4'>
           <h4 className='text-lg base:text-xl large:text-3xl whitespace-nowrap font-semibold flex justify-start items-center gap-2 text-black'><FaChartLine /> All Transaction</h4>
           <div className='flex justify-center items-center gap-2'>
             <ExportCSV expenses={expenses} />
             <ExportPDF expenses={expenses}  />
           </div>
         </div>

          <div className='flex flex-col large:flex-row justify-center items-center gap-4'>
           <div className='w-[290px] small:w-[330px] x-small:w-[380px] base:w-[450px] large:w-[380px] bg-white mt-4 rounded-md p-2'>
            <PieChart expenses={expenses} />
           </div>
           <div className='w-[290px]  small:w-[330px] x-small:w-[380px] base:w-[450px] large:w-[770px] bg-white mt-4 rounded-md p-2'>
            <LineChart incomes={incomes} expenses={expenses}  />
           </div>
          </div>


         <div className='flex flex-col justify-center items-center large:flex-row w-full h-full gap-3 mt-5'>

           <div className=" w-[280px] small:w-[330px] base:w-[500px] large:w-[380px]">
             <div className='flex justify-evenly items-center gap-2'>
                <div className='bg-[#e9e3e3af] text-[#090e3dd6] p-4 rounded-md'>
                  <h3  className='text-center font-semibold text-xl'>Total Income</h3>
                  <p className='text-center font-extrabold text-xl'>${currentUser.user.totalIncome}</p>
                </div>
                <div className='bg-[#e9e3e3af] text-[#090e3dd6] p-4 rounded-md'>
                  <h3  className='text-center font-semibold text-xl'>Total Expense</h3>
                  <p  className='text-center font-extrabold text-xl'>${currentUser.user.totalExpense}</p>
                </div>
             </div>
             <div className='p-3'>
                <div className='bg-[#e9e3e3af] text-[#090e3dd6] p-4 rounded-md'>
                  <h3  className='text-center font-semibold text-xl'>Total Balance</h3>
                  <p className={`text-center font-extrabold text-xl 
                    ${ total < 0 ? "text-red-700" : "text-green-700"}`}>${(total).toFixed(2)}</p>
                </div>
             </div>
           </div>


           <div className=' w-[280px] small:w-[330px] x-small:w-[380px] base:w-[450px] large:w-[770px] bg-[#e9e3e3af]'>
             <ExpenseSummary expenses={expenses} />
           </div>
         </div>
      </div>
    </div>
  )
}

export default DashboardChart