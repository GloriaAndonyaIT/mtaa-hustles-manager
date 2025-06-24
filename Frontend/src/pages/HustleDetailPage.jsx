// HustleDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  Briefcase, MapPin, Calendar, FileText, 
  TrendingUp, TrendingDown, DollarSign, 
  ArrowLeft, Plus, Trash2, Edit, Filter, 
  Search, Tag, X 
} from 'lucide-react';

const HustleDetails = ({ hustle, transactions = [], onAddTransaction, onEditTransaction, onDeleteTransaction }) => {
  const navigate = useNavigate();

  if (!hustle) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p>Hustle not found</p>
      </div>
    );
  }

  // Calculate hustle stats from transactions
  const calculateStats = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const profit = income - expenses;
    
    return { income, expenses, profit };
  };

  const { income, expenses, profit } = calculateStats();

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/hustles')}
        className="flex items-center text-teal-600 hover:text-teal-700 font-medium"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to hustles
      </button>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{hustle.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                {hustle.type}
              </span>
              {hustle.location && (
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {hustle.location}
                </span>
              )}
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Started on {new Date(hustle.date).toLocaleDateString()}
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
            <p className="text-2xl font-bold text-green-600">KSh {income.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
              <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
              Total Expenses
            </h3>
            <p className="text-2xl font-bold text-red-600">KSh {expenses.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-teal-600" />
              Net Profit
            </h3>
            <p className={`text-2xl font-bold ${
              profit >= 0 ? 'text-teal-600' : 'text-red-600'
            }`}>
              KSh {profit.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Transactions</h3>
          <button
            onClick={onAddTransaction}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Transaction
          </button>
        </div>

        <TransactionList 
          transactions={transactions}
          hustles={[hustle]}
          onAddTransaction={onAddTransaction}
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={onDeleteTransaction}
        />
      </div>
    </div>
  );
};

const TransactionCard = ({ transaction, onClick, onEdit, onDelete }) => {
  const isIncome = transaction.type === 'income';
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
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
        
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <p className={`font-semibold ${
              isIncome ? 'text-green-600' : 'text-red-600'
            }`}>
              {isIncome ? '+' : '-'}KSh {transaction.amount.toLocaleString()}
            </p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(transaction);
            }}
            className="text-gray-500 hover:text-teal-600"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(transaction.id);
            }}
            className="text-gray-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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

const TransactionList = ({ 
  transactions = [], 
  hustles = [], 
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterHustle, setFilterHustle] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const filterTransactions = () => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    if (filterHustle !== 'all') {
      filtered = filtered.filter(transaction => transaction.hustle_id === filterHustle);
    }

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
            <DollarSign className="h-8 w-8 text-teal-600" />
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

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={filterHustle}
            onChange={(e) => setFilterHustle(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">All Hustles</option>
            {hustles.map(hustle => (
              <option key={hustle.id} value={hustle.id}>
                {hustle.title}
              </option>
            ))}
          </select>

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
              onClick={() => {}}
              onEdit={onEditTransaction}
              onDelete={onDeleteTransaction}
            />
          ))
        )}
      </div>
    </div>
  );
};

const TransactionForm = ({ hustle, onSubmit, initialData = {} }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: initialData.type || 'income',
    amount: initialData.amount || '',
    description: initialData.description || '',
    date: initialData.date || new Date().toISOString().split('T')[0],
    category: initialData.category || '',
    notes: initialData.notes || '',
    tags: initialData.tags || []
  });

  const [newTag, setNewTag] = useState('');

  const categories = {
    income: [
      'Sales Revenue',
      'Service Income',
      'Product Sales',
      'Consultation',
      'Commission',
      'Other Income'
    ],
    expense: [
      'Raw Materials',
      'Transport',
      'Rent',
      'Utilities',
      'Marketing',
      'Equipment',
      'Maintenance',
      'Other Expenses'
    ]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const transaction = {
      ...formData,
      amount: Number(formData.amount),
      date: formData.date,
      hustle_id: hustle?.id
    };
    onSubmit(transaction);
  };

  if (!hustle) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto">
        <p className="text-gray-600">Hustle not found</p>
        <button
          onClick={() => navigate('/hustles')}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          Back to Hustles
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button 
        onClick={() => navigate(`/hustles/${hustle.id}`)}
        className="flex items-center text-teal-600 hover:text-teal-700 font-medium mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to {hustle.title}
      </button>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {initialData.id ? 'Edit' : 'Add'} {formData.type === 'income' ? 'Income' : 'Expense'} to {hustle.title}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (KSh) *
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="1"
                  step="1"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select a category</option>
                {categories[formData.type].map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                placeholder="What was this for?"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              placeholder="Additional notes (optional)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/hustles/${hustle.id}`)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                formData.type === 'income' 
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              } focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              {initialData.id ? 'Update' : 'Add'} {formData.type === 'income' ? 'Income' : 'Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HustleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const [hustle, setHustle] = useState(location.state?.hustle || null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(!location.state?.hustle);
  const [error, setError] = useState(null);

const fetchHustleDetails = async () => {
  try {
    setLoading(true);
    setError(null);

    if (!token) {
      throw new Error('Authentication token is missing');
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    };

    // Fetch hustle with error handling
    const hustleResponse = await axios.get(`http://127.0.0.1:5000/hustles/${id}`, config);
    
    if (!hustleResponse.data?.hustle) {
      // Check if response is in different format
      const alternativeData = hustleResponse.data;
      if (alternativeData?.id) {
        console.warn('Received direct hustle object, wrapping in "hustle" key');
        setHustle({
          ...alternativeData,
          status: alternativeData.status || 'active'
        });
      } else {
        throw new Error('Invalid hustle data format');
      }
    } else {
      setHustle(hustleResponse.data.hustle);
    }

    // Fetch transactions
    const transactionsResponse = await axios.get(
      `http://127.0.0.1:5000/hustles/${id}/transactions`, 
      config
    );
    
    setTransactions(transactionsResponse.data?.transactions || []);

  } catch (err) {
    console.error('Fetch error:', {
      message: err.message,
      response: err.response?.data,
      config: err.config
    });
    
    setError(err.response?.data?.error || err.message || 'Failed to load data');
    toast.error(error);
    
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  console.log('Current hustle data:', hustle);
  console.log('Current transactions:', transactions);
}, [hustle, transactions]);

  useEffect(() => {
    if (id) {
      fetchHustleDetails();
    }
  }, [id, token]);

  const addTransaction = async (transaction) => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/transactions',
        { ...transaction, hustle_id: id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setTransactions([response.data.transaction, ...transactions]);
      toast.success('Transaction added successfully');
      navigate(`/hustles/${id}`);
    } catch (err) {
      console.error('Error adding transaction:', err);
      let errorMessage = 'Failed to add transaction';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      toast.error(errorMessage);
    }
  };

  const updateTransaction = async (transactionId, updatedTransaction) => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:5000/transactions/${transactionId}`,
        updatedTransaction,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setTransactions(transactions.map(t => 
        t.id === transactionId ? response.data.transaction : t
      ));
      toast.success('Transaction updated successfully');
      navigate(`/hustles/${id}`);
    } catch (err) {
      console.error('Error updating transaction:', err);
      let errorMessage = 'Failed to update transaction';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      toast.error(errorMessage);
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      await axios.delete(
        `http://127.0.0.1:5000/transactions/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setTransactions(transactions.filter(t => t.id !== transactionId));
      toast.success('Transaction deleted successfully');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      let errorMessage = 'Failed to delete transaction';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      toast.error(errorMessage);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!hustle) return <div className="p-4">Hustle not found</div>;

  return (
    <div className="p-6">
      <Routes>
        <Route 
          path="/" 
          element={
            <HustleDetails 
              hustle={hustle} 
              transactions={transactions}
              onAddTransaction={() => navigate(`/hustles/${id}/transactions/new`)}
              onEditTransaction={(transaction) => navigate(`/hustles/${id}/transactions/${transaction.id}/edit`, { 
                state: { transaction } 
              })}
              onDeleteTransaction={deleteTransaction}
            />
          } 
        />
        <Route 
          path="/transactions/new" 
          element={
            <TransactionForm 
              hustle={hustle}
              onSubmit={addTransaction}
            />
          } 
        />
        <Route 
          path="/transactions/:transactionId/edit" 
          element={
            <TransactionForm 
              hustle={hustle}
              initialData={location.state?.transaction || {}}
              onSubmit={(data) => updateTransaction(location.state?.transaction?.id, data)}
            />
          }
        />
      </Routes>
    </div>
  );
};

export default HustleDetailPage;