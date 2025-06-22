// AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        try {
          // Updated endpoint to match your Flask API
          const response = await fetch('http://127.0.0.1:5000/users/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(storedToken);
          } else {
            localStorage.removeItem('access_token');
          }
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (token) => {
    localStorage.setItem('access_token', token);
    setToken(token);
    
    try {
      // Updated endpoint to match your Flask API
      const response = await fetch('http://127.0.0.1:5000/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return true; // Return success status
      }
      return false;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setToken(null);
    // Navigation is handled in the components now
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      login, 
      logout, 
      isAuthenticated: !!token,
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};