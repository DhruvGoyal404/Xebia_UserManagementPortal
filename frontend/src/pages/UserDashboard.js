import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const UserDashboard = () => {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
  });

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('/api/user/profile');
      setProfile(res.data);
      setFormData({
        username: res.data.username,
        phone: res.data.phone,
      });
    } catch (err) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put('/api/user/update-profile', formData);
      setSuccess('Profile updated successfully!');
      fetchProfile();
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="user-dashboard">
      <nav className="navbar">
        <h1>User Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.username}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h2>Your Profile</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {profile && (
          <div className="profile-card">
            {profile.profilePic && (
              <img src={profile.profilePic} alt="Profile" className="profile-pic" />
            )}
            <div className="profile-info">
              <p>
                <strong>Username:</strong> {profile.username}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <p>
                <strong>Phone:</strong> {profile.phone}
              </p>
              <p>
                <strong>Role:</strong> {profile.role}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                {profile.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>

            {!editing ? (
              <button
                className="btn-edit"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            ) : (
              <form onSubmit={handleUpdate} className="edit-form">
                <div className="form-group">
                  <label>Username:</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="form-actions">
                  <button type="submit">Save Changes</button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
