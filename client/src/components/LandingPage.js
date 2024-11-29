import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      {/* Header */}
      <nav style={{ backgroundColor: '#2d3748', color: '#ffffff', padding: '1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#ffffff' }}>
            <img src={`${process.env.PUBLIC_URL}/lablogo.png`} alt="Lab Logo" style={{ height: '50px', marginRight: '1rem' }} />
            <span style={{ fontSize: '2rem', fontWeight: '700' }}>ScheduleSmart Roster Management</span>
          </Link>
          <div>
            <Link to="/login">
              <button
                style={{
                  padding: '1.25rem 2.5rem',
                  marginRight: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#3182ce',
                  color: '#ffffff',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.25rem'
                }}
              >
                Log In
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ flexGrow: 1, maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem', textAlign: 'center' }}>
        <img src={`${process.env.PUBLIC_URL}/flout-banner.jpg`} alt="Banner" style={{ width: '100%', marginBottom: '2rem' }} />
        <h1 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700' }}>
          Welcome to ScheduleSmart Roster Management
        </h1>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#2d3748', color: '#ffffff', padding: '1rem', textAlign: 'center' }}>
        <div>
          <p>&copy; 2024 ScheduleSmart Roster Management, Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
