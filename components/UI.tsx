
import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 p-8 ${className}`}>
    {children}
  </div>
);

export const Button: React.FC<{ 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost',
  disabled?: boolean,
  className?: string
}> = ({ children, onClick, variant = 'primary', disabled, className = "" }) => {
  const styles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800',
    outline: 'border border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600',
    ghost: 'text-slate-400 hover:text-slate-600'
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`px-6 py-4 rounded-2xl font-semibold transition-all active:scale-95 disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const InputField: React.FC<{
  label: string,
  value: string | number,
  onChange: (val: string) => void,
  type?: string,
  placeholder?: string
}> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div className="flex flex-col gap-2 w-full mb-4 text-left">
    <label className="text-sm font-bold text-slate-500 ml-1 uppercase tracking-wider">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all bg-slate-50 text-slate-900"
    />
  </div>
);
