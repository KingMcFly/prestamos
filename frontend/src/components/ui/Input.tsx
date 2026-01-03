import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <input
        id={id}
        // Aumentado py-2 a py-3 para mejor target táctil en tablets
        className={`w-full rounded-xl border border-gray-300 px-4 py-3 text-base shadow-sm placeholder-gray-400 focus:border-tuniche-500 focus:outline-none focus:ring-2 focus:ring-tuniche-500/20 transition-all ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
};