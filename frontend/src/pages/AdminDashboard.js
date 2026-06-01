import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateAdminForm, setShowCreateAdminForm] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
  });

  const api = axiosInstance;

  // Fetch dashboard data
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    } else if (activeTab === 'requests') {
      fetchPendingRequests();
    } else if (activeTab === 'users') {
      fetchAllUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/dashboard-stats');
      setStats(res.data);
    } catch (err) {
      setError('Failed to fetch stats');
    }
  };

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/pending-requests');
      setPendingRequests(res.data);
    } catch (err) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/all-users');
      setAllUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId) => {
    try {
      await api.post(
        `/api/admin/approve-request/${requestId}`,
        {}
      );
      setSuccess('Request approved!');
      fetchPendingRequests();
    } catch (err) {
      setError('Failed to approve request');
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await api.post(
        `/api/admin/reject-request/${requestId}`,
        { reason: 'Rejected by admin' }
      );
      setSuccess('Request rejected!');
      fetchPendingRequests();
    } catch (err) {
      setError('Failed to reject request');
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await api.post(
        `/api/admin/toggle-user-status/${userId}`,
        {}
      );
      setSuccess('User status updated!');
      fetchAllUsers();
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/create-admin', adminFormData);
      setSuccess('Admin created successfully!');
      setAdminFormData({ username: '', email: '', phone: '', password: '' });
      setShowCreateAdminForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  return (
    <div className="admin-dashboard">
      <nav className="navbar">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.username}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="tabs">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={activeTab === 'requests' ? 'active' : ''}
          onClick={() => setActiveTab('requests')}
        >
          Registration Requests
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          All Users
        </button>
        <button
          className={activeTab === 'admin' ? 'active' : ''}
          onClick={() => setActiveTab('admin')}
        >
          Admin Management
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {activeTab === 'dashboard' && stats && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Active Users</h3>
            <p className="stat-value">{stats.activeUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Requests</h3>
            <p className="stat-value">{stats.pendingRequests}</p>
          </div>
          <div className="stat-card">
            <h3>Total Admins</h3>
            <p className="stat-value">{stats.totalAdmins}</p>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="content-section">
          <h2>Pending Registration Requests</h2>
          {loading ? (
            <p>Loading...</p>
          ) : pendingRequests.length === 0 ? (
            <p>No pending requests</p>
          ) : (
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((req) => (
                  <tr key={req._id}>
                    <td>{req.username}</td>
                    <td>{req.email}</td>
                    <td>{req.phone}</td>
                    <td>
                      <button
                        className="btn-approve"
                        onClick={() => approveRequest(req._id)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => rejectRequest(req._id)}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="content-section">
          <h2>All Users</h2>
          {loading ? (
            <p>Loading...</p>
          ) : allUsers.length === 0 ? (
            <p>No users found</p>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u._id}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>{u.role}</td>
                    <td>{u.isActive ? 'Active' : 'Inactive'}</td>
                    <td>
                      <button
                        className={u.isActive ? 'btn-deactivate' : 'btn-activate'}
                        onClick={() => toggleUserStatus(u._id)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'admin' && (
        <div className="content-section">
          <h2>Admin Management</h2>
          {!showCreateAdminForm ? (
            <button
              className="btn-create-admin"
              onClick={() => setShowCreateAdminForm(true)}
            >
              Create New Admin
            </button>
          ) : (
            <form onSubmit={handleCreateAdmin} className="admin-form">
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={adminFormData.username}
                  onChange={(e) =>
                    setAdminFormData({
                      ...adminFormData,
                      username: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={adminFormData.email}
                  onChange={(e) =>
                    setAdminFormData({
                      ...adminFormData,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="tel"
                  value={adminFormData.phone}
                  onChange={(e) =>
                    setAdminFormData({
                      ...adminFormData,
                      phone: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={adminFormData.password}
                  onChange={(e) =>
                    setAdminFormData({
                      ...adminFormData,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit">Create Admin</button>
                <button
                  type="button"
                  onClick={() => setShowCreateAdminForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
