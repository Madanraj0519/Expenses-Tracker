import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate } from "react-router-dom"

const UserPrivateRoute = () => {
  
    const {currentUser} = useSelector(state => state.authUser);

    return currentUser ? <Outlet /> : <Navigate to={'/'} />
}

export default UserPrivateRoute