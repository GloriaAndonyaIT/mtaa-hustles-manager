import React from 'react';
import { Briefcase, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

const HustleCard = ({ hustle, onClick }) => {
  return (
    <div 
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Briefcase className="h-6 w-6 text-teal-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">{hustle.name}</h3>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          hustle.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {hustle.status === 'active' ? 'Active' : 'Needs Attention'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">Income</p>
          <p className="font-medium text-green-600">KSh {hustle.income.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Expenses</p>
          <p className="font-medium text-red-600">KSh {hustle.expenses.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Profit</p>
          <p className={`font-medium ${hustle.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            KSh {hustle.profit.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-teal-600 font-medium">
        <span>View details</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  );
};

export default HustleCard;