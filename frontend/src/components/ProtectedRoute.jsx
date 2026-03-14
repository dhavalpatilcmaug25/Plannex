import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; // We need to create this hook for easier access

const ProtectedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role?.toLowerCase())) {
        // Unauthorized access - redirect to their dashboard or home
        // Unauthorized access - redirect to their specific dashboard
        const role = user.role?.toLowerCase();
        if (role === 'vendor') return <Navigate to="/vendor/dashboard" replace />;
        if (role === 'customer') return <Navigate to="/customer/dashboard" replace />;
        if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
