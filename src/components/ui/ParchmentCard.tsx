import React from 'react';

interface ParchmentCardProps {
  children: React.ReactNode;
  className?: string;
  torn?: boolean;
}

export const ParchmentCard: React.FC<ParchmentCardProps> = ({ children, className = '', torn = false }) => {
  return (
    <div className={`parchment-card ${torn ? 'torn-edge' : ''} p-6 ${className}`}>
      {children}
    </div>
  );
};
