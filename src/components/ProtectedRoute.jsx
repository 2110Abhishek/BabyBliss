import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';
import FullScreenLoader from './Loader/FullScreenLoader';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      console.log('ProtectedRoute: redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <FullScreenLoader text="Loading..." />;
  }

  if (!user) {
    return null; // Render nothing while redirecting
  }

  return children;
};

export default ProtectedRoute;
