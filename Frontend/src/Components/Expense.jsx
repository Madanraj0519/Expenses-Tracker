import React, { useEffect, useState } from 'react';
import { FaCalendar, FaPlusCircle, FaArrowRight  } from "react-icons/fa";
import { FcMoneyTransfer } from "react-icons/fc";
import { MdDelete } from "react-icons/md";
import { GiSevenPointedStar } from "react-icons/gi";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import axiosInstance from "../Constant/Backend/axiosInstance";
import {signInStart, signInSuccess, signInFailure} from "../Feature/Auth/userAuthSlice";
import { useDispatch, useSelector } from 'react-redux';
import CustomCategory from './CustomCategory';
import moment from 'moment-timezone';
import ExpenseList from './ExpenseList';
import Loading from './Loading';
import {toast} from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const Expense = () => {


  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [incomes, setIncomes] = useState([]);
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState('');


  const {currentUser} = useSelector(state => state.authUser);
  // console.log(currentUser);
  const dispatch = useDispatch();


  const handleAddIncome = async(e) => {
    e.preventDefault();

    try {
      dispatch(signInStart());
      const response = await axiosInstance.post('/api/expense/addExpense', {
        amount : Number(amount),
        category,
        date,
        description
      });

      if(response.data.success === false){
        dispatch(signInFailure(response.data));
        toast.error(response.data.message);
      }


      dispatch(signInSuccess(response.data));
      toast.success(response.data.message);
      // console.log(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteIncome = async(id) => {

    try {
      dispatch(signInStart());
      const response = await axiosInstance.delete(`/api/expense/deleteExpense/${id}`);

      if(response.data.success === false){
        dispatch(signInFailure(response.data));
        toast.error(response.data.message);
      }

      dispatch(signInSuccess(response.data));
      toast.error(response.data.message);
      // console.log(response.data);

    } catch (error) {
      console.error(error);
    }
  };


  const handleDescriptionInfo = (index) =>{
    if(showInfo !== index){
      setShowInfo(index);
    }else{
      setShowInfo('');
    }
  }

  return (
    <div className='w-full h-full text-black'>
      <div className='p-2 base:p-4 h-full'>
        <h4 className='text-lg base:text-xl large:text-3xl whitespace-nowrap font-semibold flex justify-center large:justify-start items-center gap-2 text-black'>< FaMoneyBillTrendUp /> Expense</h4>
        <div className='mt-2 base:mt-4 w-full bg-[#ffffffdb] flex justify-center items-center p-3 base:p-6 rounded-[15px] shadow-base '>
          <h4 className='text-base base:text-2xl font-semibold text-gray-900'>Total Expense : <span className='text-red-600'>- ${currentUser.user.totalExpense}</span></h4>
        </div>

        <div className='flex flex-col mt-5 large:flex-row justify-center base:justify-between gap-5 base:gap-3 items-start'> 
          <div className=' w-[280px] small:w-[330px] x-small:w-[390px] base:w-[400px] large:w-[500px]'>
          <h4 className='text-red-600 font-medium mb-2'>{error}</h4>
          <form 
           onSubmit={handleAddIncome} 
           className='flex flex-col gap-4'>
                <CustomCategory category={category} setCategory={setCategory} />

                <input type='number' placeholder='Amount' 
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)} 
                id='userEmail' className=' p-2 rounded-lg bg-[#f9f4f46f] border-2 text-black font-medium border-[#ffffffef]' />

                <DatePicker
                required
                selected={date}
                placeholderText='Choose date'
                placeholder={`Choose date`}
                onChange={(date) => setDate(date)} 
                id="date"  className='p-2 rounded-lg cursor-pointer bg-[#f9f4f46f] border-2 w-full text-black font-medium border-[#ffffffef]' />

                <textarea type='text-' placeholder='Add a reference' 
                value={description}
                onChange={(e) => setDescription(e.target.value)} 
                id='userEmail' className=' p-2 rounded-lg bg-[#f9f4f46f] border-2 text-black font-medium border-[#ffffffef]' />

                <button type='submit' className='bg-[#c35f5f] text-white p-3 rounded-lg uppercase 
                flex justify-center items-center hover:opacity-95 disabled:opacity-80'>
                  <p className='flex justify-center items-center gap-3'><FaPlusCircle className='text-2xl' />Add Expense</p>
                </button>
          </form>
          </div>
          
          <div className=' w-[280px] small:w-[330px] x-small:w-[390px]  base:w-[530px] large:w-[630px]  bg-[#e9e3e3af] h-[480px] rounded-[15px] overflow-y-scroll'>
            <div className='flex flex-col p-4'>
            <h4 className='text-center font-semibold text-green-600'>Recent Expenses</h4>
             <ExpenseList incomes={incomes} setIncomes={setIncomes} />
             {
              incomes.length > 0 ? (
                
                  incomes.map((item, index) => (
                <div className=' mt-5 rounded-md bg-white rounded-base p-4' key={index}>
                  <div onClick={() => handleDescriptionInfo(index)}  className='flex justify-end items-end'>
                   <FaArrowRight className={`${showInfo === index ? 'rotate-90' : 'rotate-0'} font-semibold cursor-pointer`}  />
                 </div>

                  <div className='flex justify-between items-center' key={index}>
                    <FcMoneyTransfer className='text-5xl text-red-500' />
    
                  <div className='font-medium flex flex-col justify-center x-small:justify-start items-center x-small:items-start'>
                    <div className='flex gap-2 justify-center items-center'>
                      <span className='bg-red-700 w-3 h-3 rounded-full p-1'></span>
                      <p className='capitalize'>{item.category}</p>
                    </div>
                    <div className='flex flex-col x-small:flex-row x-small:justify-between gap-2 x-small:gap-10 items-center'>
                      <p className='flex gap-1 text-sm items-center'><span className='text-yellow-500 font-semibold text-xl'>$</span> {item.amount}</p>
                      <p className='flex gap-1 text-sm whitespace-nowrap items-center'><FaCalendar className='text-blue-300' />{moment(item.date).format('MMM Do YYYY')}</p>
                    </div>
                  </div>
    
                  <MdDelete className='text-3xl cursor-pointer hover:text-red-500' onClick={() => handleDeleteIncome(item._id)} />
                    </div>
                  {
                    showInfo === index && (
                    <div className='flex gap-1 mt-4'>
                     <p className='flex gap-2 base:items-center text-sm font-medium'><span><GiSevenPointedStar className='mt-1 base:mt-0 text-yellow-700' /></span>{item.description ? item.description : "You did'nt given the description"}</p>
                    </div>
                    )
                   }
                </div>
                  ))
              ) : (
                <div>
                   <div className='flex justify-center items-center'>
                     <Loading />
                   </div>
                   <h3 className='text-center font-medium'>Expenses not found</h3>
                </div>
              )
             }

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Expense