import React from 'react';

const Select = ({ label, name, value, onChange, options, error, required = false, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1.5">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`input-field ${error ? '!border-rose-500' : ''}`}
      >
        <option value="" className="bg-[#0f111a]">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0f111a]">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-rose-400">{error}</p>
      )}
    </div>
  );
};

export default Select;
