import React from 'react';
import { 
  Home, 
  Briefcase, 
  TrendingUp, 
  Users, 
  Settings, 
  HelpCircle,
  PlusCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navigation = ({ isMobileMenuOpen, setIsMobileMenuOpen, activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const navItems = [
    {
      name: 'Dashboard',
      id: 'dashboard',
      icon: Home,
      description: 'Overview of all your hustles',
      path: '/dashboard'
    },
    {
      name: 'My Hustles',
      id: 'hustles',
      icon: Briefcase,
      description: 'Manage your business ventures',
      path: '/hustles'
    },
    {
      name: 'Analytics',
      id: 'analytics',
      icon: TrendingUp,
      description: 'Business insights and reports',
      path: '/analytics'
    },
    {
      name: 'Debts & Loans',
      id: 'debts',
      icon: Users,
      description: 'Track money owed and lending',
      path: '/debts'
    },
    {
      name: 'Settings',
      id: 'settings',
      icon: Settings,
      description: 'Account and app preferences',
      path: '/settings'
    }
  ];

  const handleNavClick = (item) => {
    setActiveTab(item.id);
    navigate(item.path);
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const NavItem = ({ item, isMobile = false }) => (
    <button
      onClick={() => handleNavClick(item)}
      className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        activeTab === item.id
          ? 'bg-teal-600 text-white shadow-lg'
          : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'
      }`}
    >
      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
      <div className="flex-1 text-left">
        <div className="font-medium">{item.name}</div>
        {!isMobile && (
          <div className="text-xs text-gray-500 group-hover:text-teal-500 mt-0.5">
            {item.description}
          </div>
        )}
      </div>
    </button>
  );

  return (
    <>
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="text-xl font-bold italic text-teal-600">
              Mtaa Hustle Manager
            </div>
          </div>

          <div className="px-4 mb-6">
            <button 
              onClick={() => navigate('/hustles/new')}
              className="w-full flex items-center justify-center px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add Transaction
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>

          <div className="px-4 pt-6 border-t border-gray-200">
            <button className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-teal-600 transition-colors">
              <HelpCircle className="mr-3 h-5 w-5 text-gray-400 group-hover:text-teal-500" />
              <div className="text-left">
                <div className="font-medium">Help & Support</div>
                <div className="text-xs text-gray-500 group-hover:text-teal-500">
                  Get help when you need it
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4 mb-8">
                <div className="text-xl font-bold italic text-teal-600">
                  Mtaa Hustle Manager
                </div>
              </div>

              <div className="px-4 mb-6">
                <button 
                  onClick={() => {
                    navigate('/hustles/new');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Transaction
                </button>
              </div>

              <nav className="px-4 space-y-2">
                {navItems.map((item) => (
                  <NavItem key={item.name} item={item} isMobile={true} />
                ))}
              </nav>
            </div>

            <div className="px-4 py-6 border-t border-gray-200">
              <button className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-teal-600 transition-colors">
                <HelpCircle className="mr-3 h-5 w-5 text-gray-400 group-hover:text-teal-500" />
                <span>Help & Support</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;