import React from 'react';
import { TrendingUp, TrendingDown, Calendar, FileText, Tag } from 'lucide-react';

const TransactionCard = ({ transaction, onClick }) => {
  const isIncome = transaction.type === 'income';
  
  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${
            isIncome ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isIncome ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">{transaction.description}</h4>
              {transaction.tags && transaction.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  {transaction.tags.slice(0, 2).map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {transaction.tags.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{transaction.tags.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4 mt-1">
              <span className="flex items-center text-sm text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(transaction.date).toLocaleDateString()}
              </span>
              
              {transaction.category && (
                <span className="flex items-center text-sm text-gray-500">
                  <FileText className="h-3 w-3 mr-1" />
                  {transaction.category}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <p className={`font-semibold ${
            isIncome ? 'text-green-600' : 'text-red-600'
          }`}>
            {isIncome ? '+' : '-'}KSh {transaction.amount.toLocaleString()}
          </p>
          
          {transaction.hustleName && (
            <p className="text-sm text-gray-500 mt-1">
              {transaction.hustleName}
            </p>
          )}
        </div>
      </div>
      
      {transaction.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">{transaction.notes}</p>
        </div>
      )}
    </div>
  );
};

export default TransactionCard;