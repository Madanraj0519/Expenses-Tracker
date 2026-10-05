import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import SignIn from './Pages/SignIn';
import SignUp from './Pages/Signup';
import DashBoard from './Pages/DashBoard';
import UserPrivateRoute from './PrivateRoutes/UserPrivateRoute';
import { Toaster } from "react-hot-toast";
import { useTheme } from './Context/ThemeContext';

function App() {
  const { isDark } = useTheme();
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<SignIn />} />
          <Route path='/sign-up' element={<SignUp />} />
          <Route element={<UserPrivateRoute />}>
            <Route path='/dashboard' element={<DashBoard />} />
          </Route>
        </Routes>

        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3500,
            style: {
              background: isDark ? '#0f172a' : '#ffffff',
              color: isDark ? '#f8fafc' : '#0f172a',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              borderRadius: '14px',
              fontSize: '13px',
              fontWeight: '500',
              padding: '12px 16px',
              boxShadow: isDark 
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
                : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </BrowserRouter>
    </>
  );
}

export default App;
