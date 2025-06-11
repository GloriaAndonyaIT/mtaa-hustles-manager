import React from 'react';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ArrowLeft,
  PlusCircle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import TransactionList from './TransactionList';

const HustleDetails = ({ hustle }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  if (!hustle) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p>Hustle not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-teal-600 hover:text-teal-700 font-medium"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to hustles
      </button>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{hustle.name}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                {hustle.businessType}
              </span>
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {hustle.location}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Started on {new Date(hustle.startDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            hustle.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {hustle.status === 'active' ? 'Active' : 'Needs Attention'}
          </span>
        </div>

        {hustle.description && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-gray-700">{hustle.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              Total Income
            </h3>
            <p className="text-2xl font-bold text-green-600">KSh {hustle.income.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">
              {hustle.incomeChange > 0 ? '+' : ''}{hustle.incomeChange}% from last period
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
              <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
              Total Expenses
            </h3>
            <p className="text-2xl font-bold text-red-600">KSh {hustle.expenses.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">
              {hustle.expenseChange > 0 ? '+' : ''}{hustle.expenseChange}% from last period
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-teal-600" />
              Net Profit
            </h3>
            <p className={`text-2xl font-bold ${
              hustle.profit >= 0 ? 'text-teal-600' : 'text-red-600'
            }`}>
              KSh {hustle.profit.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {hustle.profitChange > 0 ? '+' : ''}{hustle.profitChange}% from last period
            </p>
          </div>
        </div>

        <TransactionList transactions={hustle.recentTransactions} />
      </div>
    </div>
  );
};

export default HustleDetails;