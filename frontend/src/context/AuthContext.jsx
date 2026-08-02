import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatUser = (userData) => {
    if (!userData) return null;
    return {
      ...userData,
      name: userData.name || userData.fullName || 'User',
    };
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(formatUser(parsed));
          // Validate token with backend in the background
          const response = await API.get('/auth/profile');
          if (response.data.success) {
            const formatted = formatUser(response.data.user);
            setUser(formatted);
            localStorage.setItem('user', JSON.stringify(formatted));
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      if (response.data.success) {
        const { token, user: userDetails } = response.data;
        const formatted = formatUser(userDetails);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(formatted));
        setUser(formatted);
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Server error during registration'
      };
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user: userDetails } = response.data;
        const formatted = formatUser(userDetails);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(formatted));
        setUser(formatted);
        return { success: true, role: userDetails.role };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Server error during login'
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Switch Role function
  const switchRole = async (newRole) => {
    const updated = formatUser({
      ...user,
      role: newRole
    });
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));

    try {
      await API.put('/auth/role', { role: newRole });
    } catch (err) {
      console.error('Backend role update failed:', err);
    }
    return updated;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    switchRole,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOwner: user?.role === 'owner',
    isProvider: user?.role === 'provider',
    isValet: user?.role === 'valet',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
