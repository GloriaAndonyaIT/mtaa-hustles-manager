import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  // Initialize data from browser storage when component mounts
  useEffect(() => {
    // 1. RETRIEVING DATA FROM BROWSER STORAGE
    
    // Retrieve registered users from localStorage (persistent storage)
    const storedUsers = localStorage.getItem('registeredUsers');
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        setRegisteredUsers(parsedUsers);
        console.log('Retrieved registered users from localStorage:', parsedUsers);
      } catch (error) {
        console.error('Error parsing stored users:', error);
      }
    }

    // Retrieve current session from sessionStorage (session-only storage)
    const currentSession = sessionStorage.getItem('currentUser');
    if (currentSession) {
      try {
        const sessionUser = JSON.parse(currentSession);
        setUser(sessionUser);
        console.log('Retrieved current session from sessionStorage:', sessionUser);
      } catch (error) {
        console.error('Error parsing session data:', error);
      }
    }
  }, []);

  const signup = (firstName, lastName, email, password) => {
    const newUser = { firstName, lastName, email, password };
    
    // Update state
    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    
    const userSession = { firstName, lastName, email };
    setUser(userSession);

    // 2. STORING DATA IN BROWSER STORAGE
    
    // Store registered users in localStorage (persistent across browser sessions)
    try {
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      console.log('Stored registered users in localStorage');
    } catch (error) {
      console.error('Error storing users in localStorage:', error);
    }

    // Store current session in sessionStorage (cleared when tab closes)
    try {
      sessionStorage.setItem('currentUser', JSON.stringify(userSession));
      console.log('Stored current session in sessionStorage');
    } catch (error) {
      console.error('Error storing session in sessionStorage:', error);
    }

    // Additional demonstration: Store signup timestamp in localStorage
    try {
      localStorage.setItem('lastSignupTime', new Date().toISOString());
      console.log('Stored signup timestamp in localStorage');
    } catch (error) {
      console.error('Error storing timestamp:', error);
    }
  };

  const login = (email, password) => {
    // Check against registered users (now includes users from localStorage)
    const foundUser = registeredUsers.find(
      user => user.email === email && user.password === password
    );
    
    if (foundUser) {
      const userSession = { 
        firstName: foundUser.firstName, 
        lastName: foundUser.lastName, 
        email: foundUser.email 
      };
      setUser(userSession);

      // 3. STORING SESSION DATA IN BROWSER STORAGE
      
      // Store current session in sessionStorage
      try {
        sessionStorage.setItem('currentUser', JSON.stringify(userSession));
        console.log('Stored login session in sessionStorage');
      } catch (error) {
        console.error('Error storing login session:', error);
      }

      // Store login timestamp in localStorage for persistent tracking
      try {
        localStorage.setItem('lastLoginTime', new Date().toISOString());
        console.log('Stored login timestamp in localStorage');
      } catch (error) {
        console.error('Error storing login timestamp:', error);
      }

      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    
    // 4. REMOVING DATA FROM BROWSER STORAGE
    
    // Clear session data from sessionStorage
    try {
      sessionStorage.removeItem('currentUser');
      console.log('Removed current session from sessionStorage');
    } catch (error) {
      console.error('Error removing session data:', error);
    }

    // Store logout timestamp in localStorage
    try {
      localStorage.setItem('lastLogoutTime', new Date().toISOString());
      console.log('Stored logout timestamp in localStorage');
    } catch (error) {
      console.error('Error storing logout timestamp:', error);
    }
  };

  // Utility function to get browser storage info (for demonstration)
  const getBrowserStorageInfo = () => {
    const info = {
      localStorage: {},
      sessionStorage: {}
    };

    // Get localStorage data
    try {
      info.localStorage.registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      info.localStorage.lastSignupTime = localStorage.getItem('lastSignupTime');
      info.localStorage.lastLoginTime = localStorage.getItem('lastLoginTime');
      info.localStorage.lastLogoutTime = localStorage.getItem('lastLogoutTime');
    } catch (error) {
      console.error('Error reading localStorage:', error);
    }

    // Get sessionStorage data
    try {
      info.sessionStorage.currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    } catch (error) {
      console.error('Error reading sessionStorage:', error);
    }

    return info;
  };

  // Function to clear all stored data (for demonstration)
  const clearAllStoredData = () => {
    try {
      localStorage.removeItem('registeredUsers');
      localStorage.removeItem('lastSignupTime');
      localStorage.removeItem('lastLoginTime');
      localStorage.removeItem('lastLogoutTime');
      sessionStorage.removeItem('currentUser');
      
      setRegisteredUsers([]);
      setUser(null);
      
      console.log('Cleared all stored data from browser storage');
    } catch (error) {
      console.error('Error clearing stored data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      signup, 
      login, 
      logout, 
      isAuthenticated: !!user,
      registeredUsers,
      getBrowserStorageInfo,
      clearAllStoredData
    }}>
      {children}
    </AuthContext.Provider>
  );
};