// Dashboard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DashboardOverview from '../components/dashboard/DashboardOverview';

const Dashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  if (!token) {
    navigate('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardOverview />
    </div>
  );
};

export default Dashboard;