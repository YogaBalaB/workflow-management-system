import React from 'react';
import { STATUS_STYLES } from '../../utils/constants.js';

const StatusBadge = ({ status, glow = true }) => {
  const styles = STATUS_STYLES[status] || {
    label: status,
    bg: 'rgba(255, 255, 255, 0.1)',
    text: '#ffffff',
    border: 'rgba(255, 255, 255, 0.15)',
    glow: 'rgba(255, 255, 255, 0.05)'
  };

  return (
    <span
      className={`status-badge ${glow ? 'status-badge-glow' : ''}`}
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
        borderColor: styles.border,
        borderWidth: '1px',
        borderStyle: 'solid',
        '--badge-glow': styles.glow
      }}
    >
      <span 
        className="w-1.5 h-1.5 rounded-full" 
        style={{ backgroundColor: styles.text, boxShadow: `0 0 6px ${styles.text}` }}
      />
      {styles.label}
    </span>
  );
};

export default StatusBadge;
