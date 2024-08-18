import { useState } from 'react'
import {BrowserRouter, Route, Routes} from "react-router-dom"
import './App.css'
import SignIn from './Pages/SignIn'
import SignUp from './Pages/Signup'
import DashBoard from './Pages/DashBoard'
import UserPrivateRoute from './PrivateRoutes/UserPrivateRoute'

function App() {

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
    </BrowserRouter>
    </>
  )
}

export default App
