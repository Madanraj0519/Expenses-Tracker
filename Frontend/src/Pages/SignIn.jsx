import React, {useState} from 'react';
import {Link} from "react-router-dom";
import {signInStart, signInSuccess, signInFailure} from "../Feature/Auth/userAuthSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from "../Constant/Backend/axiosInstance";
import logo from "../assets/expense-logo.png";

import {toast} from "react-hot-toast";

const SignIn = () => {

  const [email, setEmail] = useState("madan__raj@hotmail.com");
  const [password, setPassword] = useState("madan");
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {loading} = useSelector(state => state.authUser);


  const handleLogin = async(e) => {
    e.preventDefault();

    if(!email){
      setError("Please enter a valid email");
      toast.error("Please enter a valid email");
      return;
    }

    if(!password){
      setError("Please enter a valid password");
      toast.error("Please enter a valid password");
      return;
    }

    setError("");

    // console.log(email, password);

    // sign in api calls
    try {
      dispatch(signInStart());
      const response = await axiosInstance.post('/api/auth/loginUser', {
        email,
        password
      });
      
      if(response.data.success === false){
        dispatch(signInFailure(response.data));
        toast.error(response.data.message);
        setError(response.data.message);
      }

      dispatch(signInSuccess(response.data));
      toast.success(response.data.message);
      localStorage.setItem("token", response.data.accessToken);
      navigate("/dashboard");
      
    } catch (error) {
      dispatch(signInFailure(error));
      setError(error.message);
    }

  };
  
  return (
  <>
    <div className='flex justify-start items-center gap-2 p-5'>
       <img className='h-10 w-10 base:w-12 base:h-12' src={logo} />
       <h4 className='text-2xl small:text-3xl base:text-4xl font-bold text-[#eeebebdb]'>Expense Tracker</h4>
    </div>
    <div className='w-[100%] h-screen overflow-hidden flex flex-col items-center text-center'>
      <div  className='large:w-2/6 mx-auto pt-2 mt-16 border-2 bg-[#e4dfdf2c] rounded-lg border-[#e4dfdf8c] p-4 shadow-sm shadow-white'>
          <h1 className='text-3xl text-center text-[#090e3dec] font-bold my-7'>Sign In</h1>
           <form 
           onSubmit={handleLogin} 
           className='flex flex-col gap-4'>
                <input type='text-' placeholder='User Email' value={email}
                onChange={(e) => setEmail(e.target.value)} id='userEmail' className=' p-3 rounded-lg font-medium bg-[#090e3db0]' />
                <input type='password' placeholder='User Password' value={password}
                onChange={(e) => setPassword(e.target.value)} id='userPassword' className=' p-3 rounded-lg font-medium bg-[#090e3db0]' />
                <button type='submit' className='bg-green-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>{loading ? "Loading" : "Sign In"}</button>
          </form>
      <div className='base:flex gap-2 mt-5 font-semibold'>
        <p>Don't Have a account?</p>
        <Link to={'/sign-up'}>
           <span className='text-[#050505e6] font-semibold'>Sign Up</span>
        </Link>
      </div>
      <p className='text-red-500 mt-5'>{error ? error || 'something went wrong' : ''}</p>
      </div>
    </div>
  </>
  )
}

export default SignIn