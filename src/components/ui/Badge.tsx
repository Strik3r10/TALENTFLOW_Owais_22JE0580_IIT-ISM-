import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'active' | 'archived' | 'success' | 'danger';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', icon, className = '' }) => {
  const variantClasses = {
    default: 'bg-castle-stone-light text-parchment',
    active: 'bg-forest-green text-parchment border-forest-green-light',
    archived: 'bg-aged-brown text-parchment border-aged-brown-light',
    success: 'bg-gold text-castle-stone border-gold-light',
    danger: 'bg-blood-red text-parchment border-blood-red-light'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medieval rounded-full border-2 ${variantClasses[variant]} ${className}`}>
      {icon && <span className="text-xs">{icon}</span>}
      {children}
    </span>
  );
};
