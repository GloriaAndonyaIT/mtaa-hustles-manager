import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./components/common/LandingPage";
import LoginPage from "./components/auth/LoginPage";
import SignupForm from "./components/auth/SignupForm";
import LoadingSpinner from "./components/common/LoadingSpinner";
import Navigation from "./components/common/Navigation";
import DashboardOverview from "./components/dashboard/DashboardOverview";
import MyHustlesPage from './components/hustles/MyHustlesPage';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <div className="lg:pl-64">
        <div className="flex flex-col min-h-screen">
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-2">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-teal-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const dashboardData = {
    totalIncome: 45000,
    totalExpenses: 32000,
    totalDebts: 8500,
    activeHustles: 3,
    recentTransactions: [
      { id: 1, type: 'income', amount: 2500, description: 'Mama Mboga Sales', hustle: 'Vegetable Stand', date: '2025-06-02' },
      { id: 2, type: 'expense', amount: 800, description: 'Transport', hustle: 'Boda Boda', date: '2025-06-02' },
      { id: 3, type: 'income', amount: 3200, description: 'Mitumba Sales', hustle: 'Clothing Business', date: '2025-06-01' },
      { id: 4, type: 'debt', amount: 1500, description: 'Loan to Wanjiku', hustle: 'Personal', date: '2025-06-01' }
    ],
    hustles: [
      { id: 1, name: 'Mama Mboga Stand', income: 25000, expenses: 18000, profit: 7000, status: 'active' },
      { id: 2, name: 'Boda Boda', income: 15000, expenses: 8000, profit: 7000, status: 'active' },
      { id: 3, name: 'Mitumba Business', income: 5000, expenses: 6000, profit: -1000, status: 'needs_attention' }
    ],
    monthlyData: [
      { month: 'Jan', income: 35000, expenses: 25000, profit: 10000 },
      { month: 'Feb', income: 38000, expenses: 28000, profit: 10000 },
      { month: 'Mar', income: 42000, expenses: 30000, profit: 12000 },
      { month: 'Apr', income: 40000, expenses: 29000, profit: 11000 },
      { month: 'May', income: 43000, expenses: 31000, profit: 12000 },
      { month: 'Jun', income: 45000, expenses: 32000, profit: 13000 }
    ],
    hustleComparison: [
      { name: 'Mama Mboga', income: 25000, expenses: 18000, profit: 7000 },
      { name: 'Boda Boda', income: 15000, expenses: 8000, profit: 7000 },
      { name: 'Mitumba', income: 5000, expenses: 6000, profit: -1000 }
    ]
  };

  return <DashboardOverview dashboardData={dashboardData} />;
};

function AppContent() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <SignupForm />
        </PublicRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/hustles/*" element={
        <ProtectedRoute>
          <AppLayout>
            <MyHustlesPage />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;