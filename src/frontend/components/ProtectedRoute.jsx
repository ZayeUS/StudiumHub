import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore'; // Zustand store

// ProtectedRoute component to protect routes
const ProtectedRoute = ({ children }) => {
  const { firebaseId } = useUserStore(); // Check if the user is logged in from Zustand store

  // If the user is not logged in, redirect to Login page
  if (!firebaseId) {
    return <Navigate to="/login" />;
  }

  // If the user is logged in, render the children (protected page)
  return children;
};

export default ProtectedRoute;
