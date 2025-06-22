import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DashboardOverview from '../components/dashboard/DashboardOverview';

const Dashboard = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/dashboard/overview', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setDashboardData(data);

      } catch (error) {
        console.error('Dashboard error:', error);
        setDashboardData({
          userName: 'User',
          totalIncome: 0,
          totalExpenses: 0,
          incomeChange: 0,
          expensesChange: 0,
          activeHustles: 0,
          monthlyData: [],
          hustleComparison: [],
          recentTransactions: [],
          hustles: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardOverview dashboardData={dashboardData} />
    </div>
  );
};

export default Dashboard;