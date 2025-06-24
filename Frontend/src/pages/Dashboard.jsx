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


  const { token, logout } = useAuth();

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

        // Fetch user data
        const userResponse = await fetch('http://127.0.0.1:5000/users/me', {

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

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userResponse.json();

        // Fetch transactions data
        const transactionsResponse = await fetch('http://127.0.0.1:5000/transactions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!transactionsResponse.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const transactionsData = await transactionsResponse.json();

        // Fetch hustles data
        const hustlesResponse = await fetch('http://127.0.0.1:5000/hustles', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!hustlesResponse.ok) {
          throw new Error('Failed to fetch hustles');
        }
        const hustlesData = await hustlesResponse.json();

        // Calculate totals
        const totalIncome = transactionsData.transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactionsData.transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        // Prepare monthly data (example - you'll need to adapt this based on your actual data)
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
          month: new Date(0, i).toLocaleString('default', { month: 'short' }),
          income: Math.floor(Math.random() * 10000) + 5000,
          profit: Math.floor(Math.random() * 100)
        }));

        // Prepare hustle comparison data (example)
        const hustleComparison = hustlesData.slice(0, 5).map(hustle => ({
          name: hustle.title,
          income: Math.floor(Math.random() * 5000) + 1000,
          expenses: Math.floor(Math.random() * 3000) + 500,
          profit: Math.floor(Math.random() * 2000) + 500
        }));

        // Prepare recent transactions
        const recentTransactions = transactionsData.transactions
          .slice(0, 5)
          .map(t => ({
            id: t.id,
            type: t.type,
            description: t.description,
            amount: t.amount,
            date: new Date(t.created_at).toLocaleDateString(),
            hustle: t.hustle_id ? 
              hustlesData.find(h => h.id === t.hustle_id)?.title || 'General' : 'General'
          }));

        // Prepare hustles performance data
        const hustles = hustlesData.slice(0, 3).map(hustle => ({
          id: hustle.id,
          name: hustle.title,
          status: Math.random() > 0.3 ? 'active' : 'needs_attention',
          income: Math.floor(Math.random() * 5000) + 1000,
          expenses: Math.floor(Math.random() * 3000) + 500,
          profit: Math.floor(Math.random() * 2000) + 500
        }));

        setDashboardData({
          userName: userData.username,
          totalIncome,
          totalExpenses,
          activeHustles: hustlesData.length,
          monthlyData,
          hustleComparison,
          recentTransactions,
          hustles
        });

      } catch (error) {
        console.error('Dashboard error:', error);
        // Fallback data if API calls fail
        setDashboardData({
          userName: userData?.username || 'User',
          totalIncome: 0,
          totalExpenses: 0,

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

  if (loading || !dashboardData) {

    return <LoadingSpinner />;

  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardOverview />
    </div>
  );
};

export default Dashboard;