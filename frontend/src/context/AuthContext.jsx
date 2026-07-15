import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for user
    const storedUser = localStorage.getItem('zapravka_user');
    if (storedUser) {
      try {
        let parsedUser = JSON.parse(storedUser);
        
        // Auto-fix: If the admin user has an incorrect cached role, force it to ADMIN
        if (parsedUser.username === 'admin' && parsedUser.role !== 'ADMIN') {
          parsedUser.role = 'ADMIN';
          localStorage.setItem('zapravka_user', JSON.stringify(parsedUser));
        }
        
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse user from local storage');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('zapravka_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zapravka_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
