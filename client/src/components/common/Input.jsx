import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  className = '',
  rows = 3, // for textarea
  options = [], // for select type
  icon: Icon = null
}) => {
  const containerClass = `flex flex-col gap-1.5 w-full ${className}`;
  const inputBaseStyles = `w-full rounded-lg bg-slate-950/40 border text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-slate-900/60 focus:shadow-[0_0_0_2px_rgba(99,102,241,0.15)]`;
  const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.15)]' : 'border-slate-800/80';
  
  const elementStyles = {
    padding: '10px 14px',
    fontSize: '0.875rem',
    borderRadius: '8px',
    borderStyle: 'solid',
    outline: 'none',
    width: '100%',
    fontFamily: 'var(--font-body)',
  };

  return (
    <div className={containerClass}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 select-none">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative flex w-full items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-500 pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        
        {type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            rows={rows}
            className={`${inputBaseStyles} ${errorStyles}`}
            style={{
              ...elementStyles,
              paddingLeft: Icon ? '40px' : '14px',
              resize: 'vertical'
            }}
          />
        ) : type === 'select' ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={`${inputBaseStyles} ${errorStyles}`}
            style={{
              ...elementStyles,
              paddingLeft: Icon ? '40px' : '14px',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")',
              backgroundPosition: 'right 12px center',
              backgroundSize: '18px',
              backgroundRepeat: 'no-repeat',
              paddingRight: '36px'
            }}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((opt) => (
              <option 
                key={typeof opt === 'object' ? opt.value : opt} 
                value={typeof opt === 'object' ? opt.value : opt}
                style={{ backgroundColor: '#0b0f19' }}
              >
                {typeof opt === 'object' ? opt.label : opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`${inputBaseStyles} ${errorStyles}`}
            style={{
              ...elementStyles,
              paddingLeft: Icon ? '40px' : '14px',
            }}
          />
        )}
      </div>
      
      {error && (
        <span className="text-xs font-medium text-red-400 select-none animate-pulse">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
