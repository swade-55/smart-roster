import React from 'react';

export const Alert = ({ children, variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    error: 'bg-red-50 text-red-900 border border-red-200',
    success: 'bg-green-50 text-green-900 border border-green-200',
    warning: 'bg-yellow-50 text-yellow-900 border border-yellow-200',
  };

  return (
    <div className={`p-4 rounded-lg ${variantStyles[variant]}`}>
      {children}
    </div>
  );
};

export const AlertTitle = ({ children }) => (
  <h5 className="font-medium mb-1">{children}</h5>
);

export const AlertDescription = ({ children }) => (
  <div className="text-sm">{children}</div>
);