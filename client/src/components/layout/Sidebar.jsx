import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { LayoutDashboard, FileText, PlusCircle, ShieldCheck } from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const isUser = user?.role === 'User';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/requests', label: 'All Requests', icon: FileText },
  ];
  if (isUser) {
    navItems.push({ to: '/requests/new', label: 'Submit Request', icon: PlusCircle });
  }

  return (
    <aside style={s.aside}>
      {/* Nav label */}
      <span style={s.sectionLabel}>Navigation</span>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <div style={{
                ...s.navItem,
                ...(isActive ? s.navActive : s.navInactive),
              }}>
                <Icon size={16} style={{ flexShrink: 0 }} />
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer card */}
      <div style={s.footer}>
        <div style={s.footerIcon}>
          <ShieldCheck size={14} style={{ color: '#6d28d9' }} />
        </div>
        <div>
          <span style={s.footerTitle}>Role-Based Access</span>
          <p style={s.footerSub}>
            Actions are strictly validated at both client and server layers.
          </p>
        </div>
      </div>
    </aside>
  );
};

const s = {
  aside: {
    width: 232,
    flexShrink: 0,
    minHeight: 'calc(100vh - 100px)',
    position: 'sticky',
    top: 76,
    padding: '20px 12px',
    background: '#ffffff',
    border: '0.5px solid #e2e8f0',
    borderRadius: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  sectionLabel: {
    fontSize: '0.6rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: '#cbd5e1', paddingLeft: 12,
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 9,
    fontSize: '0.85rem', fontWeight: 500,
    border: '0.5px solid transparent',
    transition: 'all 0.15s',
    cursor: 'pointer',
  },
  navActive: {
    background: '#f5f3ff',
    borderColor: '#c4b5fd',
    color: '#6d28d9',
  },
  navInactive: {
    color: '#64748b',
    background: 'transparent',
  },
  footer: {
    marginTop: 'auto',
    padding: '14px',
    borderRadius: 10,
    background: '#f8fafc',
    border: '0.5px solid #e2e8f0',
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  },
  footerIcon: {
    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
    background: '#f5f3ff', border: '0.5px solid #c4b5fd',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  footerTitle: {
    fontSize: '0.75rem', fontWeight: 600, color: '#1e293b',
    display: 'block', marginBottom: 3,
  },
  footerSub: {
    fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.5, margin: 0,
  },
};

export default Sidebar;