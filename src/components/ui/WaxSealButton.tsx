import React from 'react';

interface WaxSealButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'gold' | 'green';
}

export const WaxSealButton: React.FC<WaxSealButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  variant = 'primary'
}) => {
  const variantClasses = {
    primary: 'wax-seal-btn',
    gold: 'gold-btn',
    green: 'bg-forest-green text-parchment-light font-medieval font-bold py-2 px-6 rounded-full hover:bg-forest-green-light transition-all duration-300 active:scale-95'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};
