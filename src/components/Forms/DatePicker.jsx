import React from 'react';

const DatePicker = ({ label, name, value, onChange, error, required = false, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1.5">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <input
        type="date"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`input-field [color-scheme:dark] ${error ? '!border-rose-500' : ''}`}
      />
      {error && (
        <p className="mt-1 text-sm text-rose-400">{error}</p>
      )}
    </div>
  );
};

export default DatePicker;
