import React, { useState } from 'react';
import { 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';

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

const DashboardOverview = ({ dashboardData }) => {
  const navigate = useNavigate();
  const [activeChart, setActiveChart] = useState('monthly');
  const netProfit = dashboardData.totalIncome - dashboardData.totalExpenses;

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Karibu! Welcome back 👋</h1>
        <p className="text-teal-100">Here's how your hustles are performing today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">KSh {dashboardData.totalIncome.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">KSh {dashboardData.totalExpenses.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-sm text-red-600 font-medium">+8% from last month</span>
          </div>
        </div>

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
            <span className="text-sm text-gray-600">{((netProfit / dashboardData.totalIncome) * 100).toFixed(1)}% profit margin</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Hustles</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.activeHustles}</p>
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
                    tickFormatter={(value) => `${((value / dashboardData.totalIncome) * 100).toFixed(0)}%`}
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

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Your Hustles Performance</h2>
          <button className="text-teal-600 hover:text-teal-700 font-medium text-sm">View All</button>
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

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button className="text-teal-600 hover:text-teal-700 font-medium text-sm">View All</button>
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
    </div>
  );
};

export default DashboardOverview;