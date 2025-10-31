import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medieval font-semibold text-castle-stone mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-castle-stone-light">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-2 ${icon ? 'pl-10' : ''}
            bg-parchment border-2 border-aged-brown rounded-md
            font-body text-castle-stone
            focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold
            placeholder:text-castle-stone-light
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-blood-red' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-blood-red font-body">
          {error}
        </p>
      )}
    </div>
  );
};
