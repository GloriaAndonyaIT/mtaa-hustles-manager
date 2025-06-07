import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const signup = (firstName, lastName, email, password) => {
    const newUser = { firstName, lastName, email, password };
    // Store in memory instead of localStorage
    setRegisteredUsers(prev => [...prev, newUser]);
    setUser({ firstName, lastName, email });
  };

  const login = (email, password) => {
    // Check against in-memory registered users
    const foundUser = registeredUsers.find(
      user => user.email === email && user.password === password
    );
    
    if (foundUser) {
      setUser({ 
        firstName: foundUser.firstName, 
        lastName: foundUser.lastName, 
        email: foundUser.email 
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      signup, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};