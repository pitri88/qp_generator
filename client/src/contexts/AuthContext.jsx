import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Token ${token}`;
          const response = await api.get('/profile/');
          setUser(response.data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post('/login/', credentials);
      const { token } = response.data;
      
      // Store token and role
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', credentials.role);
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      // Fetch user profile
      const profileResponse = await api.get('/profile/');
      const userData = profileResponse.data;
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.error || 'Login failed';
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout/');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      window.location.href = '/login';  // Force a full page refresh
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 