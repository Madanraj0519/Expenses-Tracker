import React, { useState } from 'react';
import {Link} from "react-router-dom";
import {signInStart, signInSuccess, signInFailure} from "../Feature/Auth/userAuthSlice";
import {useNavigate} from "react-router-dom"
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from "../Constant/Backend/axiosInstance";
import logo from "../assets/expense-logo.png";
import {toast} from "react-hot-toast";

const SignUp = () => {

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isActive, setIsActive] = useState(false);


  // const {currentUser} = useSelector((state) => state.authUser);

  const dispatch = useDispatch();
  const navigate = useNavigate();


  const handleSubmit = async(e) => {
    e.preventDefault();

    if(!userName){
      setError("Please enter your name");
      return;
    }

    if(!email){
      setError("Please enter a valid email");
      return;
    }

    if(!password){
      setError("Please enter a valid password");
      return;
    }

    setError("");

    // console.log( userName ,email, password);

    // Sign up api call
    try {
      dispatch(signInStart());
      const response = await axiosInstance.post('/api/auth/registerUser', {
        userName,
        email,
        password,
      });

      if(response.data.success === false){
        dispatch(signInFailure(response.data.message));
        toast.error(response.data.message);
        setError(response.data.message);
      }

      dispatch(signInSuccess(response.data));
      toast.success(response.data.message);
      localStorage.setItem("token", response.data.accessToken);
      navigate('/Dashboard');

    } catch (error) {
      dispatch(signInFailure(error));
      setError(error.message);
    }

  }

  return (
  <>
    <div className='flex justify-start items-center gap-2 p-5'>
      <img className='h-10 w-10 base:w-12 base:h-12' src={logo} />
      <h4 className='text-2xl small:text-3xl base:text-4xl font-bold text-[#eeebebdb]'>Expense Tracker</h4>
    </div>
    <div className='h-screen w-[100%] overflow-hidden flex flex-col text-center'>
        <div  className='large:w-2/6 mx-auto pt-2 mt-16 border-2 bg-[#e4dfdf2c] rounded-lg border-[#e4dfdf8c] p-4 shadow-sm shadow-white'>
          <h1 className='text-3xl text-center text-[#090e3dec] font-bold my-7'>Sign Up</h1>
           <form 
           onSubmit={handleSubmit} 
           className='flex flex-col gap-4'>
                <input type='text' placeholder='User Name' value={userName} 
                onChange={(e) => setUserName(e.target.value)} id='userName' className=' p-3 rounded-lg font-medium bg-[#090e3db0]' />
                <input type='text' placeholder='User Email' value={email}
                onChange={(e) => setEmail(e.target.value)} id='userEmail' className='p-3 rounded-lg font-medium bg-[#090e3db0]' />
                <input type='text' placeholder='User Password' value={password}
                onChange={(e) => setPassword(e.target.value)} id='userPassword' className='p-3 rounded-lg font-medium bg-[#090e3db0]' />
                <button type='submit' className='bg-green-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>Sign Up</button>
            </form>
      <div className='base:flex gap-2 mt-5 font-semibold'>
        <p>Already having a account?</p>
        <Link to={'/'}>
           <span className='text-[#050505e6] font-semibold'>Sign In</span>
        </Link>
      </div>
      <p className='text-red-500 mt-5'>{error ? error.message || 'something went wrong' : ''}</p>
        </div>
    </div>
  </>
  )
}

export default SignUp