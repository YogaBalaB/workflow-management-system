import React from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
import Button from '../common/Button.jsx';

const roleStyles = {
  Admin: { color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8' },
  Manager: { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  User: { color: '#6d28d9', bg: '#f5f3ff', border: '#c4b5fd' },
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const badge = roleStyles[user?.role] || roleStyles.User;

  return (
    <header style={s.header}>
      {/* Brand */}
      <div style={s.brand}>
        <div style={s.logoBox}>
          <ShieldCheck size={18} style={{ color: '#6d28d9' }} />
        </div>
        <div>
          <h1 style={s.brandName}>FlowTrack</h1>
          <span style={s.brandSub}>Workflow Portal</span>
        </div>
      </div>

      {/* Right side */}
      <div style={s.right}>
        {user && (
          <div style={s.userSection}>
            <div style={s.avatar}>
              <UserIcon size={16} style={{ color: '#6d28d9' }} />
            </div>
            <div style={s.userInfo}>
              <span style={s.userName}>{user.name}</span>
              <span style={s.userEmail}>{user.email}</span>
            </div>
            <span style={{ ...s.roleBadge, color: badge.color, background: badge.bg, borderColor: badge.border }}>
              {user.role}
            </span>
            <div style={s.divider} />
          </div>
        )}
        <button style={s.signOutBtn} onClick={logout}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.color = '#b91c1c'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </header>
  );
};

const s = {
  header: {
    position: 'sticky', top: 0, zIndex: 40,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 28px',
    height: 60,
    background: '#ffffff',
    borderBottom: '0.5px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    width: '100%',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  logoBox: {
    width: 34, height: 34, borderRadius: 9,
    background: '#f5f3ff', border: '0.5px solid #c4b5fd',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  brandName: {
    fontSize: '1rem', fontWeight: 800, color: '#1e1b4b',
    letterSpacing: '-0.02em', lineHeight: 1.1,
  },
  brandSub: {
    fontSize: '0.6rem', fontWeight: 600, color: '#a78bfa',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    display: 'block',
  },
  right: {
    display: 'flex', alignItems: 'center', gap: 14,
  },
  userSection: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: '#f5f3ff', border: '0.5px solid #c4b5fd',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  userInfo: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
  },
  userName: {
    fontSize: '0.8rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.2,
  },
  userEmail: {
    fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.2,
  },
  roleBadge: {
    padding: '2px 8px', borderRadius: 999,
    fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
    border: '0.5px solid',
  },
  divider: {
    width: 1, height: 28, background: '#e2e8f0', marginLeft: 4,
  },
  signOutBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 8,
    background: '#fff', border: '0.5px solid #e2e8f0',
    fontSize: '0.78rem', fontWeight: 500, color: '#64748b',
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
};

export default Navbar;