import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ username: '', phone: '' });
  const [newProfilePic, setNewProfilePic] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('/api/user/profile');
      setProfile(res.data);
      setFormData({ username: res.data.username, phone: res.data.phone });
    } catch {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('username', formData.username);
      fd.append('phone', formData.phone);
      if (newProfilePic) fd.append('profilePic', newProfilePic);

      const res = await axiosInstance.put('/api/user/update-profile', fd);
      setProfile(res.data.user);
      toast.success('Profile updated');
      setEditing(false);
      setNewProfilePic(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: digits });
  };

  if (loading) {
    return <div className="container empty-state">Loading…</div>;
  }

  const initial = (profile?.username || user?.username || '?')
    .charAt(0)
    .toUpperCase();

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Your Profile</h1>
          <p className="dashboard-sub">Manage your account details.</p>
        </div>
      </div>

      {profile && (
        <div className="card profile-card">
          <div className="profile-header">
            <div className="avatar">
              {profile.profilePic ? (
                <img src={profile.profilePic} alt={profile.username} />
              ) : (
                initial
              )}
            </div>
            <div className="profile-meta">
              <h3>{profile.username}</h3>
              <p className="text-muted">{profile.email}</p>
              <div className="profile-badges">
                <span className="badge badge-primary">{profile.role}</span>
                <span
                  className={
                    profile.isActive ? 'badge badge-success' : 'badge'
                  }
                >
                  {profile.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {!editing ? (
            <div className="profile-info-grid">
              <InfoItem label="Username" value={profile.username} />
              <InfoItem label="Email" value={profile.email} />
              <InfoItem label="Phone" value={profile.phone} />
              <InfoItem label="Role" value={profile.role} />
              <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Phone (10 digits)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    inputMode="numeric"
                    maxLength={10}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Profile Picture (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewProfilePic(e.target.files[0])}
                />
                {newProfilePic && (
                  <p className="text-muted" style={{ marginTop: 4 }}>
                    Selected: {newProfilePic.name}
                  </p>
                )}
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setEditing(false);
                    setNewProfilePic(null);
                    setFormData({
                      username: profile.username,
                      phone: profile.phone,
                    });
                  }}
                  disabled={saving}
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

const InfoItem = ({ label, value }) => (
  <div className="info-item">
    <div className="info-label">{label}</div>
    <div className="info-value">{value}</div>
  </div>
);

export default UserDashboard;
