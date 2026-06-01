import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Landing.css';

const features = [
  {
    title: 'Admin Approval',
    desc: 'Every signup is reviewed before access. Keep your platform clean by default.',
  },
  {
    title: 'Role-Based Access',
    desc: 'Separate dashboards for admins and users with proper route protection.',
  },
  {
    title: 'Built for Scale',
    desc: 'JWT auth, MongoDB-backed, deployed serverless on Vercel.',
  },
];

const Landing = () => {
  const { token, user } = useAuth();
  const isAuthed = token && user;

  return (
    <div className="landing">
      <section className="hero container">
        <span className="badge">Full-stack · MERN</span>
        <h1>A simple user management portal.</h1>
        <p>
          Register, get approved, and access your dashboard — clean,
          fast, and built with the basics done right.
        </p>
        <div className="hero-actions">
          {isAuthed ? (
            <Link
              to={user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'}
              className="btn btn-primary"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn">
                Login
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="features container">
        {features.map((f) => (
          <div key={f.title} className="feature card">
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Landing;
