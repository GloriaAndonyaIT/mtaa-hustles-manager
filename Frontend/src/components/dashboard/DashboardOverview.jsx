import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MPesaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border-0 rounded-2xl shadow-2xl">
        <p className="font-bold text-gray-800 mb-3 text-base">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between mb-2 last:mb-0">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: entry.color }} />
              <span className="text-sm font-medium text-gray-700">{entry.name}</span>
            </div>
            <span className="text-sm font-bold text-gray-900 ml-6">
              KSh {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [activeChart, setActiveChart] = useState('monthly');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch hustles data
        const hustlesResponse = await fetch('http://127.0.0.1:5000/hustles', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Fetch transactions data
        const transactionsResponse = await fetch('http://127.0.0.1:5000/transactions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!hustlesResponse.ok || !transactionsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const hustlesData = await hustlesResponse.json();
        const transactionsData = await transactionsResponse.json();

        // Ensure we have arrays to work with
        const safeHustles = Array.isArray(hustlesData) ? hustlesData : 
                          (hustlesData.hustles || hustlesData.data || []);
        
        const safeTransactions = Array.isArray(transactionsData) ? transactionsData : 
                              (transactionsData.transactions || transactionsData.data || []);

        // Process the data to create dashboard metrics
        const processedData = processDashboardData(safeHustles, safeTransactions);
        setDashboardData(processedData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData({
          userName: 'User',
          totalIncome: 0,
          totalExpenses: 0,
          incomeChange: 0,
          expensesChange: 0,
          totalHustles: 0,
          monthlyData: [],
          hustleComparison: [],
          recentTransactions: [],
          hustles: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const processDashboardData = (hustles = [], transactions = []) => {
    // Ensure inputs are arrays
    const safeHustles = Array.isArray(hustles) ? hustles : [];
    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    
    // Calculate total income and expenses with proper fallbacks
    const totalIncome = safeTransactions
      .filter(t => t && t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
    const totalExpenses = safeTransactions
      .filter(t => t && t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // CHANGE: Count ALL hustles instead of just active ones
    const totalHustles = safeHustles.length;

    // Group transactions by month for the last 12 months
    const monthlyData = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth() + 1;
      
      const monthTransactions = safeTransactions.filter(t => {
        if (!t || !t.created_at) return false;
        try {
          const tDate = new Date(t.created_at);
          return tDate.getFullYear() === year && tDate.getMonth() + 1 === month;
        } catch (e) {
          return false;
        }
      });
      
      const monthIncome = monthTransactions
        .filter(t => t && t.type === 'income')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      
      const monthExpenses = monthTransactions
        .filter(t => t && t.type === 'expense')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      
      monthlyData.push({
        month: monthName,
        income: monthIncome,
        expenses: monthExpenses,
        profit: monthIncome - monthExpenses
      });
    }

    // Create hustle comparison data (top 5 by income)
    const hustleComparison = safeHustles.map(hustle => {
      if (!hustle || !hustle.id) return null;
      
      const hustleTransactions = safeTransactions.filter(t => 
        t && t.hustle_id === hustle.id
      );
      
      const income = hustleTransactions
        .filter(t => t && t.type === 'income')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      
      const expenses = hustleTransactions
        .filter(t => t && t.type === 'expense')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      
      return {
        name: hustle.title || 'Unnamed Hustle',
        income,
        expenses,
        profit: income - expenses
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.income - a.income)
    .slice(0, 5);

    // Get recent transactions (last 5)
    const recentTransactions = [...safeTransactions]
      .filter(t => t && t.created_at)
      .sort((a, b) => {
        try {
          return new Date(b.created_at) - new Date(a.created_at);
        } catch (e) {
          return 0;
        }
      })
      .slice(0, 5)
      .map(t => ({
        id: t.id || Date.now().toString(),
        type: t.type || 'unknown',
        description: t.description || 'No description',
        amount: Number(t.amount) || 0,
        date: t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Unknown date',
        hustle: safeHustles.find(h => h && h.id === t.hustle_id)?.title || 'General'
      }));

    // Get top 3 hustles by profit
    const topHustles = safeHustles
      .map(hustle => {
        if (!hustle || !hustle.id) return null;
        
        const hustleTransactions = safeTransactions.filter(t => 
          t && t.hustle_id === hustle.id
        );
        
        const income = hustleTransactions
          .filter(t => t && t.type === 'income')
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        
        const expenses = hustleTransactions
          .filter(t => t && t.type === 'expense')
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        
        return {
          id: hustle.id,
          name: hustle.title || 'Unnamed Hustle',
          status: income > 0 ? 'active' : 'needs_attention',
          income,
          expenses,
          profit: income - expenses
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 3);

    // Calculate percentage changes
    const currentMonth = monthlyData[monthlyData.length - 1] || { income: 0, expenses: 0 };
    const prevMonth = monthlyData[monthlyData.length - 2] || { income: 0, expenses: 0 };
    
    const incomeChange = prevMonth.income ? 
      Math.round(((currentMonth.income - prevMonth.income) / prevMonth.income) * 100) : 0;
    
    const expensesChange = prevMonth.expenses ? 
      Math.round(((currentMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100) : 0;

    return {
      userName: 'User',
      totalIncome,
      totalExpenses,
      incomeChange,
      expensesChange,
      totalHustles, // Now shows TOTAL hustles count
      monthlyData,
      hustleComparison,
      recentTransactions,
      hustles: topHustles
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const netProfit = dashboardData?.totalIncome - dashboardData?.totalExpenses || 0;


  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-2">
          {(() => {
            const hour = new Date().getHours();
            if (hour < 12) return `Good morning, ${dashboardData.userName || 'User'}!`;
            if (hour < 18) return `Good afternoon, ${dashboardData.userName || 'User'}!`;
            return `Good evening, ${dashboardData.userName || 'User'}!`;
          })()}
        </h1>
        <p className="text-teal-100">Here's how your hustles are performing today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Income Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">
                KSh {(dashboardData.totalIncome || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {dashboardData.incomeChange >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${dashboardData.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {dashboardData.incomeChange >= 0 ? '+' : ''}{dashboardData.incomeChange || 0}% from last month
            </span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                KSh {(dashboardData.totalExpenses || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {dashboardData.expensesChange >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-red-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-green-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${dashboardData.expensesChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {dashboardData.expensesChange >= 0 ? '+' : ''}{dashboardData.expensesChange || 0}% from last month
            </span>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                KSh {netProfit.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-full ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`h-6 w-6 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600">
              {dashboardData.totalIncome > 0 
                ? `${((netProfit / dashboardData.totalIncome) * 100).toFixed(1)}% profit margin`
                : 'No income data'}
            </span>
          </div>
        </div>

        {/* Updated Hustles Card - Now shows TOTAL hustles */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hustles</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.totalHustles || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => navigate('/hustles/new')}
              className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add New Hustle
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      {dashboardData.monthlyData?.length > 0 && (
        <div className="bg-white rounded-3xl shadow-lg border-0">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-6 w-6 mr-3 text-green-600" />
                Performance Analytics
              </h2>
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button 
                  onClick={() => setActiveChart('monthly')}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    activeChart === 'monthly' 
                      ? 'bg-white text-green-700 shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Monthly Trend
                </button>
                <button 
                  onClick={() => setActiveChart('comparison')}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    activeChart === 'comparison' 
                      ? 'bg-white text-green-700 shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Hustle Comparison
                </button>
              </div>
            </div>

            <div className="h-96">
              {activeChart === 'monthly' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.monthlyData} margin={{ top: 20, right: 60, left: 60, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="none" stroke="#e5e7eb" strokeWidth={1} horizontal={true} vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6b7280"
                      fontSize={11}
                      axisLine={true}
                      tickLine={true}
                      tick={{ dy: 5, fill: '#6b7280' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      yAxisId="left"
                      orientation="left"
                      stroke="#6b7280"
                      fontSize={11}
                      axisLine={true}
                      tickLine={true}
                      tick={{ dx: -5, fill: '#6b7280' }}
                      tickFormatter={(value) => `${(value / 1000)}K`}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#6b7280"
                      fontSize={11}
                      axisLine={true}
                      tickLine={true}
                      tick={{ dx: 5, fill: '#6b7280' }}
                      tickFormatter={(value) => `${((value / (dashboardData.totalIncome || 1)) * 100).toFixed(0)}%`}
                    />
                    <Tooltip content={<MPesaTooltip />} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="income"
                      stroke="#0d9488"
                      strokeWidth={3}
                      name="Hustle Income"
                      dot={{ fill: '#0d9488', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#0d9488', strokeWidth: 2, fill: 'white' }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="profit"
                      stroke="#059669"
                      strokeWidth={2}
                      name="Profit Growth %"
                      dot={{ fill: '#059669', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: '#059669', strokeWidth: 2, fill: 'white' }}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.hustleComparison} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `KSh ${(value / 1000).toFixed(0)}K`} />
                    <Tooltip content={<MPesaTooltip />} />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" fill="#0d9488" name="Profit" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => navigate('/hustles/new?type=income')}
          className="flex flex-col items-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
        >
          <PlusCircle className="h-8 w-8 text-teal-600 mb-2" />
          <span className="text-sm font-medium text-gray-700">Add Income</span>
        </button>
        <button 
          onClick={() => navigate('/hustles/new?type=expense')}
          className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <TrendingDown className="h-8 w-8 text-red-600 mb-2" />
          <span className="text-sm font-medium text-gray-700">Add Expense</span>
        </button>
        <button 
          onClick={() => navigate('/hustles/new?type=debt')}
          className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Users className="h-8 w-8 text-blue-600 mb-2" />
          <span className="text-sm font-medium text-gray-700">Track Debt</span>
        </button>
        <button 
          onClick={() => navigate('/hustles/new')}
          className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <Target className="h-8 w-8 text-purple-600 mb-2" />
          <span className="text-sm font-medium text-gray-700">Add New Hustle</span>
        </button>
      </div>

      {/* Hustles Performance */}
      {dashboardData.hustles?.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Your Hustles Performance</h2>
            <button 
              onClick={() => navigate('/hustles')}
              className="text-teal-600 hover:text-teal-700 font-medium text-sm"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {dashboardData.hustles.map((hustle) => (
              <div key={hustle.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="font-medium text-gray-900 mr-3">{hustle.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      hustle.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {hustle.status === 'active' ? 'Active' : 'Needs Attention'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span>Income: KSh {hustle.income.toLocaleString()}</span>
                    <span>Expenses: KSh {hustle.expenses.toLocaleString()}</span>
                    <span className={`font-medium ${hustle.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Profit: KSh {hustle.profit.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <button 
                    onClick={() => navigate(`/hustles/${hustle.id}`)}
                    className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {dashboardData.recentTransactions?.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <button 
              onClick={() => navigate('/transactions')}
              className="text-teal-600 hover:text-teal-700 font-medium text-sm"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {dashboardData.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border-l-4 border-l-gray-200 pl-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-green-100' 
                      : transaction.type === 'expense' 
                      ? 'bg-red-100' 
                      : 'bg-blue-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className={`h-4 w-4 text-green-600`} />
                    ) : transaction.type === 'expense' ? (
                      <TrendingDown className={`h-4 w-4 text-red-600`} />
                    ) : (
                      <Clock className={`h-4 w-4 text-blue-600`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{transaction.hustle} • {transaction.date}</p>
                  </div>
                </div>
                <div className={`font-semibold ${
                  transaction.type === 'income' 
                    ? 'text-green-600' 
                    : transaction.type === 'expense' 
                    ? 'text-red-600' 
                    : 'text-blue-600'
                }`}>
                  {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                  KSh {transaction.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;