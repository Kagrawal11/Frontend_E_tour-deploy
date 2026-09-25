import React from 'react';

const RadioGroup = ({ label, name, options, value, onChange, error, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="h-4 w-4 accent-[#7c5cff] border-white/20"
            />
            <span className="ml-2 text-sm text-slate-300">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-rose-400">{error}</p>
      )}
    </div>
  );
};

export default RadioGroup;
