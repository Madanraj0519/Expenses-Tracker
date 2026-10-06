import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { signInStart, signInSuccess, signInFailure } from "../Feature/Auth/userAuthSlice";
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from "../Constant/Backend/axiosInstance";
import logo from "../assets/expense-logo.png";
import { toast } from "react-hot-toast";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import ThemeToggle from "../Components/ThemeToggle";

const SignUp = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inlineError, setInlineError] = useState("");

  const { loading } = useSelector((state) => state.authUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInlineError("");

    const trimmedName = userName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setInlineError("Please enter your name (at least 2 characters).");
      toast.error("Please enter your name.");
      return;
    }

    if (!trimmedEmail) {
      setInlineError("Please enter your email address.");
      toast.error("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setInlineError("Please enter a valid email address.");
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 8) {
      setInlineError("Password must be at least 8 characters long.");
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    try {
      dispatch(signInStart());
      const response = await axiosInstance.post('/api/auth/registerUser', {
        userName: trimmedName,
        email: trimmedEmail,
        password,
      });

      if (!response.data || response.data.success === false) {
        const errorMsg = response.data?.message || "Registration failed. Please try again.";
        dispatch(signInFailure(errorMsg));
        setInlineError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      dispatch(signInSuccess(response.data));
      localStorage.setItem("token", response.data.accessToken);
      toast.success(response.data.message || "Account created successfully!");
      navigate('/dashboard');

    } catch (err) {
      const displayMsg = err.friendlyMessage || err.message || "Registration failed. Please try again.";
      dispatch(signInFailure(displayMsg));
      setInlineError(displayMsg);
      toast.error(displayMsg);
    }
  };

  return (
    <div className='min-h-screen w-full flex flex-col justify-center items-center p-4 relative overflow-hidden bg-slate-50 dark:bg-[#0a0e17] text-slate-900 dark:text-slate-100 transition-colors duration-300'>
      {/* Top right Theme Toggle */}
      <div className='absolute top-5 right-5 z-20'>
        <ThemeToggle compact={true} />
      </div>

      {/* Ambient background glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Auth Card */}
      <div className='w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800/80 relative z-10'>
        {/* Brand Header */}
        <div className='flex flex-col items-center text-center mb-8'>
          <div className='w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-2.5 shadow-glow-green flex items-center justify-center mb-3'>
            <img className='h-full w-full object-contain' src={logo} alt="Expense Tracker Logo" />
          </div>
          <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-white'>Create Account</h1>
          <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1'>
            Start mastering your expenses and savings today
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5'>
              Full Name
            </label>
            <div className='relative'>
              <span className='absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400'>
                <FaUser className='text-sm' />
              </span>
              <input
                type='text'
                placeholder='John Doe'
                value={userName}
                disabled={loading}
                onChange={(e) => setUserName(e.target.value)}
                className='w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-all'
              />
            </div>
          </div>

          <div>
            <label className='text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5'>
              Email Address
            </label>
            <div className='relative'>
              <span className='absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400'>
                <FaEnvelope className='text-sm' />
              </span>
              <input
                type='email'
                placeholder='name@example.com'
                value={email}
                autoComplete="email"
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-all'
              />
            </div>
          </div>

          <div>
            <label className='text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1.5'>
              Password
            </label>
            <div className='relative'>
              <span className='absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400'>
                <FaLock className='text-sm' />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                value={password}
                minLength={8}
                autoComplete="new-password"
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-all'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer'
              >
                {showPassword ? <FaEyeSlash className='text-sm' /> : <FaEye className='text-sm' />}
              </button>
            </div>
          </div>

          {inlineError && (
            <div className='p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium'>
              {inlineError}
            </div>
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-glow-green hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer'
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Footer Link */}
        <div className='mt-6 text-center text-xs text-slate-500 dark:text-slate-400'>
          <span>Already have an account? </span>
          <Link to='/' className='text-emerald-600 dark:text-emerald-400 hover:underline font-semibold transition-colors'>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;