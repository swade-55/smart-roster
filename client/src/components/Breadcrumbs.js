import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const displayNameMapping = {
    'layout': ' ',
    'toolform': 'Tool Form',
    'categoryform': 'Category Form',
    'executivesummary': 'Summary',
    'masteroperatingplan': 'Layout',
    'login': 'Login',
    'signup': 'Sign Up',
  };

  return (
    <div style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
      {pathnames.length > 0 && (
        <Link to="/" style={{ fontSize: '1.25rem', color: '#1d4ed8', textDecoration: 'none' }}>Home</Link>
      )}
      {pathnames.map((value, index) => {
        const isLast = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const displayName = displayNameMapping[value] || value;

        return isLast ? (
          <span key={to} style={{ fontSize: '1.25rem' }}>
            {' > '}
            <span style={{ fontSize: '1.25rem' }}>{displayName}</span>
          </span>
        ) : (
          <span key={to} style={{ fontSize: '1.25rem' }}>
            {' > '}
            <Link to={to} style={{ fontSize: '1.25rem', color: '#1d4ed8', textDecoration: 'none' }}>{displayName}</Link>
          </span>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;
