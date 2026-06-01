import React, { createContext, useState, useContext } from 'react';
import axiosInstance from '../utils/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = async (username, email, phone, password, profilePic) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('password', password);
      formData.append('confirmPassword', password);
      if (profilePic) {
        formData.append('profilePic', profilePic);
      }

      const res = await axiosInstance.post('/api/auth/register', formData);
      setLoading(false);
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      setLoading(false);
      throw new Error(errorMsg);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post('/api/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      setLoading(false);
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      setLoading(false);
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
