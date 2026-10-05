import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate } from "react-router-dom";

const UserPrivateRoute = () => {
    const { currentUser } = useSelector(state => state.authUser);
    const token = localStorage.getItem("token");

    const isAuthenticated = Boolean(currentUser && token);

    return isAuthenticated ? <Outlet /> : <Navigate to={'/'} replace />;
};

export default UserPrivateRoute;