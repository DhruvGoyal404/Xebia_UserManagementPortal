import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import './App.css';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return (
      <Navigate
        to={user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'}
        replace
      />
    );
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-dashboard"
                element={
                  <ProtectedRoute allowedRole="user">
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
