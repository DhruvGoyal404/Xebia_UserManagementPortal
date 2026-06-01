import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="footer-text">
          © {new Date().getFullYear()} UserPortal | built by Dhruv Goyal |{' '}
          <a
            href="https://github.com/DhruvGoyal404/Xebia_UserManagementPortal"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            GitHub
          </a>
        </span>
        <span className="footer-text footer-muted">
          Powered by React · Express · MongoDB
        </span>
      </div>
    </footer>
  );
};

export default Footer;
