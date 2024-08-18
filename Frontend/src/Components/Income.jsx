import React, { useEffect, useState } from 'react';
import { FaMoneyBillWave, FaCalendar, FaPlusCircle } from "react-icons/fa";
import { FcMoneyTransfer } from "react-icons/fc";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../Constant/Backend/axiosInstance";
import {signInStart, signInSuccess, signInFailure} from "../Feature/Auth/userAuthSlice";
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment-timezone';
import Loading from './Loading';



const Income = () => {

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(Date.now());
  const [incomes, setIncomes] = useState([]);
  const [error, setError] = useState('');

  const {currentUser} = useSelector(state => state.authUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchIncomes = async() => {
      try {
        const res = await axiosInstance.get('/api/income/getIncome');
        // console.log(res.data.incomes);
        setIncomes(res.data.incomes);
      } catch (error) {
        console.log(error);
      }
    };

    fetchIncomes();
  }, [amount, date, description, category]);


  const handleAddIncome = async(e) => {
    e.preventDefault();

    try {
      dispatch(signInStart());
      const response = await axiosInstance.post('/api/income/addIncome', {
        amount : Number(amount),
        category,
        date,
        description
      });

      if(!response){
        dispatch(signInFailure(response.data));
      }


      dispatch(signInSuccess(response.data));

      // console.log(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteIncome = async(id) => {

    try {
      dispatch(signInStart());
      const response = await axiosInstance.delete(`/api/income/deleteIncome/${id}`);

      if(!response){
        dispatch(signInFailure(response.data));
      }


      dispatch(signInSuccess(response.data));

      console.log(response.data);

    } catch (error) {
      console.error(error);
    }
  };


  return (
    <div className='w-full h-full text-black'>
      <div className='p-2 base:p-4 w-full h-full'>
        <h4 className='text-lg base:text-xl large:text-3xl whitespace-nowrap font-semibold flex justify-center large:justify-start items-center gap-2 text-black'><FaMoneyBillWave /> Income</h4>
        <div className='mt-2 base:mt-4 w-full bg-[#ffffffdb] flex justify-center items-center p-3 base:p-6 rounded-[15px] shadow-base '>
          <h4 className='text-base base:text-2xl font-semibold text-gray-900'>Total incomes : <span className='text-green-600'>${currentUser.user.totalIncome}</span></h4>
        </div>
        <div className='flex flex-col mt-5 large:flex-row justify-center base:justify-between gap-5 base:gap-3 items-start'> 
          <div className=' w-[280px] small:w-[330px] x-small:w-[390px] base:w-[400px] large:w-[500px]'>
            <h4 className='text-red-600 font-medium mb-2'>{error}</h4>
            <form 
           onSubmit={handleAddIncome} 
           className='flex flex-col gap-4'>
                <input type='text-' placeholder='Category' 
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)} 
                id='userEmail' className=' p-2 rounded-lg bg-[#f9f4f46f] border-2 text-black font-medium border-[#ffffffef]' />

                <input type='number' placeholder='Amount' 
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)} 
                id='userEmail' className=' p-2 rounded-lg bg-[#f9f4f46f] border-2 text-black font-medium border-[#ffffffef]' />

                <input type='date'
                required
                value={date}
                placeholder={`${Date.now()}`}
                onChange={(e) => setDate(e.target.value)} 
                id='userPassword' className='p-2 rounded-lg bg-[#f9f4f46f] border-2 text-black font-medium border-[#ffffffef]' />

                <textarea type='text-' placeholder='Add a reference' 
                value={description}
                onChange={(e) => setDescription(e.target.value)} 
                id='userEmail' className=' p-2 rounded-lg bg-[#f9f4f46f] border-2 text-black font-medium border-[#ffffffef]' />

                <button type='submit' className='bg-[#c35f5f] text-white p-3 rounded-lg uppercase 
                flex justify-center items-center hover:opacity-95 disabled:opacity-80'>
                  <p className='flex justify-center items-center gap-3'><FaPlusCircle className='text-2xl' />Add Income</p>
                </button>
            </form>
          </div>
          
          <div className=' w-[280px] small:w-[330px] x-small:w-[390px]  base:w-[530px] large:w-[630px]  bg-[#e9e3e3af] h-[480px] rounded-[15px] overflow-y-scroll'>
            <div className='flex flex-col p-4'>
            <h4 className='text-center font-semibold text-green-600'>Recent Incomes</h4>

             {
              incomes.length > 0 ? (
                
                  incomes.map((item, index) => (
                    <div className='flex justify-between items-center mt-5 rounded-md bg-white rounded-base p-4' key={index}>
                  <FcMoneyTransfer className='text-5xl' />
    
                  <div className='font-medium flex flex-col justify-center x-small:justify-start items-center x-small:items-start'>
                    <div className='flex gap-2 justify-center items-center'>
                      <span className='bg-green-700 w-3 h-3 rounded-full p-1'></span>
                      <p>{item.category}</p>
                    </div>
                    <div className='flex flex-col x-small:flex-row x-small:justify-between gap-2 x-small:gap-10 items-center'>
                      <p className='flex gap-1 text-sm items-center'><span className='text-yellow-500 font-semibold text-xl'>$</span> {item.amount}</p>
                      <p className='flex gap-1 text-sm whitespace-nowrap items-center'><FaCalendar className='text-blue-300' />{moment(item.date).format('MMMM Do YYYY')}</p>
                    </div>
                  </div>
    
                  <MdDelete className='text-3xl cursor-pointer hover:text-red-500' onClick={() => handleDeleteIncome(item._id)} />
                 </div>
                  ))
              ) : (
                     <h3 className='text-center mt-5'>Items not found</h3>
                  )
             }

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Income