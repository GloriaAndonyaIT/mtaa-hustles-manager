import React, { useState } from 'react';
import TransactionCard from './TransactionCard';
import { Filter, Search, Plus, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const TransactionList = ({ transactions = [], hustles = [], onAddTransaction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, income, expense
  const [filterHustle, setFilterHustle] = useState('all');
  const [filterDate, setFilterDate] = useState('all'); // all, today, week, month
  const [sortBy, setSortBy] = useState('date'); // date, amount, type

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    // Hustle filter
    if (filterHustle !== 'all') {
      filtered = filtered.filter(transaction => transaction.hustleId === filterHustle);
    }

    // Date filter
    if (filterDate !== 'all') {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        
        switch (filterDate) {
          case 'today':
            return transactionDate >= todayStart;
          case 'week':
            const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
            return transactionDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);
            return transactionDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount;
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    return filtered;
  };

  const filteredTransactions = filterTransactions();

  const getTotalStats = () => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      count: filteredTransactions.length
    };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
        <button
          onClick={onAddTransaction}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Transaction
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                KSh {stats.totalIncome.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                KSh {stats.totalExpenses.toLocaleString()}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className={`text-2xl font-bold ${
                stats.netProfit >= 0 ? 'text-teal-600' : 'text-red-600'
              }`}>
                KSh {stats.netProfit.toLocaleString()}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-teal-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.count}
              </p>
            </div>
            <Filter className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Hustle Filter */}
          <select
            value={filterHustle}
            onChange={(e) => setFilterHustle(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">All Hustles</option>
            {hustles.map(hustle => (
              <option key={hustle.id} value={hustle.id}>
                {hustle.name}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="type">Sort by Type</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
            <p className="text-gray-600 mb-4">
              {transactions.length === 0 
                ? "No transactions yet. Start by adding your first income or expense!"
                : "No transactions match your current filters."
              }
            </p>
            {transactions.length === 0 && (
              <button
                onClick={onAddTransaction}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                Add Your First Transaction
              </button>
            )}
          </div>
        ) : (
          filteredTransactions.map(transaction => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onClick={() => {
                // You can add transaction detail view here if needed
                console.log('Transaction clicked:', transaction);
              }}
            />
          ))
        )}
      </div>

      {/* Load More Button (if you want pagination) */}
      {filteredTransactions.length > 0 && filteredTransactions.length < transactions.length && (
        <div className="text-center">
          <button className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            Load More Transactions
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionList;