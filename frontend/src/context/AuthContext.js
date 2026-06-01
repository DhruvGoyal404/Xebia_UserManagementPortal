import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

const AuthContext = createContext();

const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token');
    if (!t) return null;
    const payload = decodeToken(t);
    if (!payload) {
      localStorage.removeItem('token');
      return null;
    }
    return {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token && !user) {
      const payload = decodeToken(token);
      if (payload) {
        setUser({
          id: payload.id,
          username: payload.username,
          email: payload.email,
          role: payload.role,
        });
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    }
  }, [token, user]);

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
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
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
