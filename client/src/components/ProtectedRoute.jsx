import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, role }) {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // If no token, redirect to appropriate login page
    if (!token) {
        return <Navigate to={role === 'admin' ? '/login-admin' : '/login-faculty'} replace />;
    }

    // If role is specified (for admin routes) and user role doesn't match
    if (role && userRole !== role) {
        // If user is faculty trying to access admin route, send to faculty dashboard
        if (userRole === 'faculty') {
            return <Navigate to="/faculty-dashboard" replace />;
        }
        // Otherwise send to appropriate login
        return <Navigate to={role === 'admin' ? '/login-admin' : '/login-faculty'} replace />;
    }

    // If no specific role required (faculty routes) but user is not faculty
    if (!role && userRole !== 'faculty') {
        // If user is admin trying to access faculty route, send to admin dashboard
        if (userRole === 'admin') {
            return <Navigate to="/admin-dashboard" replace />;
        }
        // Otherwise send to faculty login
        return <Navigate to="/login-faculty" replace />;
    }

    return children;
} 