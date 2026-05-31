import React from 'react';

const variants = {
  primary: {
    background: '#6d28d9',
    color: '#ffffff',
    border: '0.5px solid #5b21b6',
    hoverBg: '#5b21b6',
  },
  accent: {
    background: '#db2777',
    color: '#ffffff',
    border: '0.5px solid #be185d',
    hoverBg: '#be185d',
  },
  glass: {
    background: '#ffffff',
    color: '#64748b',
    border: '0.5px solid #e2e8f0',
    hoverBg: '#f8fafc',
    hoverColor: '#1e293b',
    hoverBorder: '#cbd5e1',
  },
  danger: {
    background: '#fef2f2',
    color: '#b91c1c',
    border: '0.5px solid #fecaca',
    hoverBg: '#fee2e2',
  },
};

const sizes = {
  sm: { padding: '6px 14px', fontSize: '0.78rem', iconSize: 13 },
  md: { padding: '9px 18px', fontSize: '0.85rem', iconSize: 15 },
  lg: { padding: '11px 24px', fontSize: '0.95rem', iconSize: 18 },
};

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  style: extraStyle = {},
  icon: Icon = null,
}) => {
  const v = variants[variant] || variants.primary;
  const sz = sizes[size] || sizes.md;

  const [hovered, setHovered] = React.useState(false);

  const computedStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: sz.padding,
    fontSize: sz.fontSize,
    fontWeight: 500,
    fontFamily: 'inherit',
    borderRadius: 9,
    border: hovered && v.hoverBorder ? v.hoverBorder : v.border,
    background: hovered && v.hoverBg ? v.hoverBg : v.background,
    color: hovered && v.hoverColor ? v.hoverColor : v.color,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.55 : 1,
    width: fullWidth ? '100%' : undefined,
    transition: 'all 0.15s ease',
    outline: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...extraStyle,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      style={computedStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {loading ? (
        <span style={{
          width: sz.iconSize, height: sz.iconSize,
          border: `2px solid currentColor`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'btn-spin 0.7s linear infinite',
        }} />
      ) : Icon ? (
        <Icon size={sz.iconSize} />
      ) : null}
      {children}

      <style>{`@keyframes btn-spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
};

export default Button;