import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [view, setView] = useState('card');
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

  useEffect(() => {
    setError('');
    setSuccess('');
    if (activeTab === 'dashboard') fetchStats();
    else if (activeTab === 'requests') fetchPendingRequests();
    else if (activeTab === 'users') fetchAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/dashboard-stats');
      setStats(res.data);
    } catch {
      setError('Failed to fetch stats');
    }
  };

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/pending-requests');
      setPendingRequests(res.data);
    } catch {
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
    } catch {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id) => {
    try {
      await api.post(`/api/admin/approve-request/${id}`, {});
      setSuccess('Request approved');
      fetchPendingRequests();
    } catch {
      setError('Failed to approve');
    }
  };

  const rejectRequest = async (id) => {
    try {
      await api.post(`/api/admin/reject-request/${id}`, {
        reason: 'Rejected by admin',
      });
      setSuccess('Request rejected');
      fetchPendingRequests();
    } catch {
      setError('Failed to reject');
    }
  };

  const toggleUserStatus = async (id) => {
    try {
      await api.post(`/api/admin/toggle-user-status/${id}`, {});
      setSuccess('Status updated');
      fetchAllUsers();
    } catch {
      setError('Failed to update');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!/^[^\s@]+@gmail\.com$/i.test(adminFormData.email)) {
      setError('Email must be a valid @gmail.com address');
      return;
    }

    if (!/^\d{10}$/.test(adminFormData.phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    try {
      await api.post('/api/admin/create-admin', adminFormData);
      setSuccess('Admin created');
      setAdminFormData({ username: '', email: '', phone: '', password: '' });
      setShowCreateAdminForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'requests', label: 'Requests' },
    { id: 'users', label: 'Users' },
    { id: 'admin', label: 'Admins' },
  ];

  const showViewToggle = activeTab === 'requests' || activeTab === 'users';

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="dashboard-sub">
            Welcome back, <strong>{user?.username}</strong>
          </p>
        </div>
      </div>

      <div className="tabs">
        <div className="tabs-list">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {showViewToggle && (
          <div className="view-toggle">
            <button
              className={`view-btn ${view === 'card' ? 'active' : ''}`}
              onClick={() => setView('card')}
              title="Card view"
            >
              ▦
            </button>
            <button
              className={`view-btn ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
              title="List view"
            >
              ☰
            </button>
          </div>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {activeTab === 'dashboard' && (
        <div className="stats-grid">
          <StatCard label="Total Users" value={stats?.totalUsers ?? '—'} />
          <StatCard label="Active Users" value={stats?.activeUsers ?? '—'} />
          <StatCard
            label="Pending Requests"
            value={stats?.pendingRequests ?? '—'}
          />
          <StatCard label="Total Admins" value={stats?.totalAdmins ?? '—'} />
        </div>
      )}

      {activeTab === 'requests' && (
        <RequestsView
          loading={loading}
          requests={pendingRequests}
          view={view}
          onApprove={approveRequest}
          onReject={rejectRequest}
        />
      )}

      {activeTab === 'users' && (
        <UsersView
          loading={loading}
          users={allUsers}
          view={view}
          onToggle={toggleUserStatus}
        />
      )}

      {activeTab === 'admin' && (
        <div className="card">
          <div className="card-section-header">
            <div>
              <h3>Admin Management</h3>
              <p className="text-muted">Create new admin accounts.</p>
            </div>
            {!showCreateAdminForm && (
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateAdminForm(true)}
              >
                + New Admin
              </button>
            )}
          </div>

          {showCreateAdminForm && (
            <form onSubmit={handleCreateAdmin} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Username</label>
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
                  <label>Phone (10 digits)</label>
                  <input
                    type="tel"
                    value={adminFormData.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setAdminFormData({ ...adminFormData, phone: digits });
                    }}
                    placeholder="9876543210"
                    inputMode="numeric"
                    maxLength={10}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email (@gmail.com only)</label>
                <input
                  type="email"
                  value={adminFormData.email}
                  onChange={(e) =>
                    setAdminFormData({
                      ...adminFormData,
                      email: e.target.value,
                    })
                  }
                  placeholder="name@gmail.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
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
                <button type="submit" className="btn btn-primary">
                  Create Admin
                </button>
                <button
                  type="button"
                  className="btn"
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

const StatCard = ({ label, value }) => (
  <div className="card stat-card">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
  </div>
);

const RequestsView = ({ loading, requests, view, onApprove, onReject }) => {
  if (loading) return <div className="empty-state">Loading…</div>;
  if (requests.length === 0)
    return <div className="card empty-state">No pending requests</div>;

  if (view === 'list') {
    return (
      <div className="card list-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td>{r.username}</td>
                <td>{r.email}</td>
                <td>{r.phone}</td>
                <td className="actions-col">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => onApprove(r._id)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onReject(r._id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="cards-grid">
      {requests.map((r) => (
        <div key={r._id} className="card item-card">
          <div className="item-header">
            <div className="avatar avatar-sm">
              {r.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4>{r.username}</h4>
              <p className="text-muted">{r.email}</p>
            </div>
          </div>
          <div className="item-meta">
            <span className="text-muted">Phone:</span> {r.phone}
          </div>
          <div className="item-actions">
            <button
              className="btn btn-sm btn-success"
              onClick={() => onApprove(r._id)}
            >
              Approve
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => onReject(r._id)}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const UsersView = ({ loading, users, view, onToggle }) => {
  if (loading) return <div className="empty-state">Loading…</div>;
  if (users.length === 0)
    return <div className="card empty-state">No users found</div>;

  if (view === 'list') {
    return (
      <div className="card list-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>
                  <span className="badge badge-primary">{u.role}</span>
                </td>
                <td>
                  <span
                    className={u.isActive ? 'badge badge-success' : 'badge'}
                  >
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="actions-col">
                  <button
                    className={
                      u.isActive ? 'btn btn-sm btn-danger' : 'btn btn-sm btn-success'
                    }
                    onClick={() => onToggle(u._id)}
                  >
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="cards-grid">
      {users.map((u) => (
        <div key={u._id} className="card item-card">
          <div className="item-header">
            <div className="avatar avatar-sm">
              {u.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4>{u.username}</h4>
              <p className="text-muted">{u.email}</p>
            </div>
          </div>
          <div className="item-badges">
            <span className="badge badge-primary">{u.role}</span>
            <span className={u.isActive ? 'badge badge-success' : 'badge'}>
              {u.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="item-meta">
            <span className="text-muted">Phone:</span> {u.phone}
          </div>
          <div className="item-actions">
            <button
              className={
                u.isActive
                  ? 'btn btn-sm btn-danger'
                  : 'btn btn-sm btn-success'
              }
              onClick={() => onToggle(u._id)}
            >
              {u.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
