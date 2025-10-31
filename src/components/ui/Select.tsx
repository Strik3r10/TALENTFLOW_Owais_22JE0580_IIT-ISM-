import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
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
      <select
        className={`
          w-full px-4 py-2
          bg-parchment border-2 border-aged-brown rounded-md
          font-body text-castle-stone
          focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-blood-red' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-blood-red font-body">
          {error}
        </p>
      )}
    </div>
  );
};
