import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { requestService } from '../../services/requestService.js';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  LockKeyhole,
  HelpCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  RefreshCw,
} from 'lucide-react';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import StatusBadge from '../../components/requests/StatusBadge.jsx';

/* ─── design tokens ──────────────────────────────────────────── */
const role = {
  User: { accent: '#6d28d9', light: '#f5f3ff', border: '#c4b5fd', pill: '#ede9fe', pillText: '#5b21b6' },
  Manager: { accent: '#059669', light: '#ecfdf5', border: '#a7f3d0', pill: '#d1fae5', pillText: '#065f46' },
  Admin: { accent: '#db2777', light: '#fdf2f8', border: '#fbcfe8', pill: '#fce7f3', pillText: '#9d174d' },
};

const cardConfig = (stats) => [
  {
    title: 'Total Requests',
    value: stats?.Total || 0,
    icon: ClipboardList,
    iconColor: '#6d28d9',
    iconBg: '#f5f3ff',
    iconBorder: '#c4b5fd',
    valueColor: '#1e1b4b',
  },
  {
    title: 'Pending Review',
    value: (stats?.Submitted || 0) + (stats?.Reopened || 0),
    icon: Clock,
    iconColor: '#2563eb',
    iconBg: '#eff6ff',
    iconBorder: '#bfdbfe',
    valueColor: '#1e3a8a',
  },
  {
    title: 'Needs Action',
    value: stats?.['Needs Clarification'] || 0,
    icon: HelpCircle,
    iconColor: '#d97706',
    iconBg: '#fffbeb',
    iconBorder: '#fde68a',
    valueColor: '#78350f',
  },
  {
    title: 'Approved',
    value: stats?.Approved || 0,
    icon: CheckCircle2,
    iconColor: '#059669',
    iconBg: '#ecfdf5',
    iconBorder: '#a7f3d0',
    valueColor: '#064e3b',
  },
  {
    title: 'Rejected',
    value: stats?.Rejected || 0,
    icon: XCircle,
    iconColor: '#dc2626',
    iconBg: '#fef2f2',
    iconBorder: '#fecaca',
    valueColor: '#7f1d1d',
  },
  {
    title: 'Closed Out',
    value: stats?.Closed || 0,
    icon: LockKeyhole,
    iconColor: '#64748b',
    iconBg: '#f8fafc',
    iconBorder: '#e2e8f0',
    valueColor: '#334155',
  },
];

const barSegments = (stats) => [
  { key: 'Submitted', color: '#2563eb', label: 'Submitted', val: stats?.Submitted || 0 },
  { key: 'Reopened', color: '#7c3aed', label: 'Reopened', val: stats?.Reopened || 0 },
  { key: 'Approved', color: '#059669', label: 'Approved', val: stats?.Approved || 0 },
  { key: 'Needs Clarification', color: '#d97706', label: 'Needs action', val: stats?.['Needs Clarification'] || 0 },
  { key: 'Rejected', color: '#dc2626', label: 'Rejected', val: stats?.Rejected || 0 },
  { key: 'Closed', color: '#94a3b8', label: 'Closed', val: stats?.Closed || 0 },
];

const roleDescriptions = {
  User: 'Create hardware renewals or track the approval workflow status for your current requests.',
  Manager: 'Review and action submitted purchase tickets, request clarifications, or approve renewals.',
  Admin: 'Audit requests, close out finalised hardware transactions, or reopen closed request cases.',
};

/* ─── status badge colours ───────────────────────────────────── */
const statusStyles = {
  Submitted: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  Approved: { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  Rejected: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  Reopened: { bg: '#f5f3ff', color: '#5b21b6', border: '#c4b5fd' },
  'Needs Clarification': { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  Closed: { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
};

/* ─── component ──────────────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const statsData = await requestService.getDashboardStats();
        setStats(statsData);
        const list = await requestService.getRequests();
        setRecentRequests(list.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Error loading dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader size="large" style={{ marginTop: 80 }} />;

  const isUser = user?.role === 'User';
  const isManager = user?.role === 'Manager';
  const isAdmin = user?.role === 'Admin';

  const roleStyle = role[user?.role] || role.User;
  const cards = cardConfig(stats);
  const segments = barSegments(stats);
  const total = stats?.Total || 0;
  const getPct = (v) => (total > 0 ? ((v / total) * 100).toFixed(1) : '0.0');

  return (
    <div style={s.page}>

      {/* ── Welcome Banner ──────────────────────────────────── */}
      <div style={{
        ...s.banner,
        background: roleStyle.light,
        borderColor: roleStyle.border,
      }}>
        {/* decorative blob */}
        <div style={{ ...s.blob, background: roleStyle.pill }} />

        <div style={s.bannerLeft}>
          <span style={{ ...s.rolePill, color: roleStyle.pillText, background: roleStyle.pill, borderColor: roleStyle.border }}>
            <Zap size={10} />
            {user?.role} Access
          </span>

          <h2 style={s.bannerTitle}>
            Welcome back,{' '}
            <span style={{ color: roleStyle.accent }}>{user?.name}</span>
          </h2>

          <p style={s.bannerSub}>{roleDescriptions[user?.role]}</p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
          {isUser && (
            <Button variant="primary" onClick={() => navigate('/requests/new')} icon={PlusCircle}>
              Submit Ticket
            </Button>
          )}
          {(isManager || isAdmin) && (
            <Button variant="primary" onClick={() => navigate('/requests')} icon={ArrowRight}>
              Review Pipeline
            </Button>
          )}
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <div style={s.errorBox}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <div style={s.cardGrid}>
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} style={s.statCard}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <div style={s.statHeader}>
                <span style={s.statLabel}>{card.title}</span>
                <div style={{ ...s.statIconBox, background: card.iconBg, borderColor: card.iconBorder }}>
                  <Icon size={15} style={{ color: card.iconColor }} />
                </div>
              </div>
              <span style={{ ...s.statValue, color: card.valueColor }}>{card.value}</span>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Two-Column ───────────────────────────────── */}
      <div style={s.bottomGrid}>

        {/* Status Breakdown */}
        <div style={s.panel}>
          <div style={s.panelHeader}>
            <div style={s.panelTitleGroup}>
              <div style={{ ...s.panelIconBox, background: '#f5f3ff', borderColor: '#c4b5fd' }}>
                <TrendingUp size={15} style={{ color: '#6d28d9' }} />
              </div>
              <div>
                <h3 style={s.panelTitle}>Status Breakdown</h3>
                <span style={s.panelSub}>All request categories</span>
              </div>
            </div>
            <span style={s.totalBadge}>{total} total</span>
          </div>

          {total === 0 ? (
            <div style={s.emptyState}>
              <Activity size={30} style={{ opacity: 0.3 }} />
              <span style={s.emptyPrimary}>No requests submitted yet.</span>
              <span style={s.emptySub}>Pipeline activity will appear here.</span>
            </div>
          ) : (
            <>
              {/* stacked bar */}
              <div style={s.stackedBar}>
                {segments.map((seg) => (
                  <div
                    key={seg.key}
                    title={`${seg.label}: ${getPct(seg.val)}%`}
                    style={{ width: `${getPct(seg.val)}%`, background: seg.color, transition: 'width 0.4s ease' }}
                  />
                ))}
              </div>

              {/* legend */}
              <div style={s.legendGrid}>
                {segments.map((seg) => (
                  <div key={seg.key} style={s.legendItem}>
                    <div style={s.legendLeft}>
                      <span style={{ ...s.legendDot, background: seg.color }} />
                      <span style={s.legendName}>{seg.label}</span>
                    </div>
                    <span style={s.legendPct}>{getPct(seg.val)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div style={s.panel}>
          <div style={s.panelHeader}>
            <div style={s.panelTitleGroup}>
              <div style={{ ...s.panelIconBox, background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                <Activity size={15} style={{ color: '#059669' }} />
              </div>
              <div>
                <h3 style={s.panelTitle}>Recent Activity</h3>
                <span style={s.panelSub}>Latest pipeline updates</span>
              </div>
            </div>
            <button style={s.viewAllBtn}
              onClick={() => navigate('/requests')}
              onMouseEnter={e => { e.currentTarget.style.background = '#f5f3ff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentRequests.length === 0 ? (
              <div style={s.emptyState}>
                <RefreshCw size={30} style={{ opacity: 0.3 }} />
                <span style={s.emptyPrimary}>No active requests found.</span>
                {isUser && (
                  <button style={s.emptyAction} onClick={() => navigate('/requests/new')}>
                    Submit your first request
                  </button>
                )}
              </div>
            ) : (
              recentRequests.map((req, i) => {
                const badge = statusStyles[req.status] || statusStyles.Closed;
                return (
                  <div
                    key={req.id}
                    onClick={() => navigate(`/requests/${req.id}`)}
                    style={s.reqItem}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#f5f3ff';
                      e.currentTarget.style.borderColor = '#c4b5fd';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    {/* index badge */}
                    <div style={s.reqNum}>{i + 1}</div>

                    {/* details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={s.reqTitle}>{req.title}</span>
                      <div style={s.reqMeta}>
                        <span style={s.reqTag}>{req.category}</span>
                        <span style={s.reqDot}>·</span>
                        <span style={s.reqPriority}>
                          Priority:{' '}
                          <span style={{ color: '#6d28d9', fontWeight: 500 }}>{req.priority}</span>
                        </span>
                      </div>
                    </div>

                    {/* status badge */}
                    <span style={{
                      ...s.statusBadge,
                      background: badge.bg,
                      color: badge.color,
                      borderColor: badge.border,
                    }}>
                      {req.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

/* ─── styles object ──────────────────────────────────────────── */
const s = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  },

  /* banner */
  banner: {
    padding: '32px 36px',
    borderRadius: 16,
    border: '0.5px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    flexWrap: 'wrap',
    position: 'relative',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute', top: -40, right: -30,
    width: 200, height: 200, borderRadius: '50%',
    pointerEvents: 'none',
  },
  bannerLeft: {
    display: 'flex', flexDirection: 'column', gap: 10,
    position: 'relative', zIndex: 1,
  },
  rolePill: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    padding: '3px 10px', borderRadius: 999,
    fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
    border: '0.5px solid',
  },
  bannerTitle: {
    fontSize: '1.5rem', fontWeight: 800,
    color: '#1e1b4b', lineHeight: 1.2, letterSpacing: '-0.02em',
  },
  bannerSub: {
    fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, maxWidth: 440,
  },

  /* error */
  errorBox: {
    padding: '14px 18px', borderRadius: 12,
    background: '#fef2f2', border: '0.5px solid #fecaca',
    color: '#b91c1c', fontSize: '0.875rem',
    display: 'flex', alignItems: 'center', gap: 10,
  },

  /* stat cards */
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
    gap: 14,
  },
  statCard: {
    padding: '20px',
    borderRadius: 12,
    background: '#ffffff',
    border: '0.5px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', gap: 14,
    transition: 'border-color 0.15s',
    cursor: 'default',
  },
  statHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.07em',
    textTransform: 'uppercase', color: '#94a3b8',
  },
  statIconBox: {
    width: 30, height: 30, borderRadius: 8,
    border: '0.5px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  statValue: {
    fontSize: '2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em',
  },

  /* bottom panels */
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 20,
    alignItems: 'start',
  },
  panel: {
    padding: 24,
    borderRadius: 12,
    background: '#ffffff',
    border: '0.5px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', gap: 0,
  },
  panelHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: 18,
    borderBottom: '0.5px solid #e2e8f0',
    marginBottom: 20,
  },
  panelTitleGroup: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  panelIconBox: {
    width: 32, height: 32, borderRadius: 8,
    border: '0.5px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  panelTitle: {
    fontSize: '0.9375rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2,
  },
  panelSub: {
    fontSize: '0.72rem', color: '#94a3b8',
  },
  totalBadge: {
    padding: '3px 10px', borderRadius: 6,
    background: '#f5f3ff', border: '0.5px solid #c4b5fd',
    fontSize: '0.7rem', fontWeight: 500, color: '#6d28d9',
  },
  viewAllBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: 'none', border: 'none', padding: '5px 8px',
    borderRadius: 6, cursor: 'pointer',
    fontSize: '0.75rem', fontWeight: 500, color: '#6d28d9',
    fontFamily: 'inherit', transition: 'background 0.12s',
  },

  /* stacked bar */
  stackedBar: {
    height: 8, borderRadius: 999, overflow: 'hidden',
    display: 'flex', background: '#f1f5f9',
    border: '0.5px solid #e2e8f0',
    marginBottom: 16,
  },

  /* legend */
  legendGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
  },
  legendItem: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '9px 12px', borderRadius: 8,
    background: '#f8fafc', border: '0.5px solid #e2e8f0',
  },
  legendLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  legendDot: { width: 7, height: 7, borderRadius: 2, flexShrink: 0 },
  legendName: { fontSize: '0.72rem', color: '#64748b', fontWeight: 500 },
  legendPct: { fontSize: '0.78rem', fontWeight: 500, color: '#1e293b' },

  /* empty state */
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '40px 20px', gap: 10,
    color: '#94a3b8', textAlign: 'center',
  },
  emptyPrimary: { fontSize: '0.875rem', fontWeight: 500, color: '#64748b' },
  emptySub: { fontSize: '0.75rem', color: '#94a3b8' },
  emptyAction: {
    marginTop: 4, padding: '8px 16px', borderRadius: 8,
    background: '#f5f3ff', border: '0.5px solid #c4b5fd',
    color: '#6d28d9', fontSize: '0.8rem', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
  },

  /* request items */
  reqItem: {
    padding: '13px 14px', borderRadius: 10,
    background: '#f8fafc', border: '0.5px solid #e2e8f0',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 12,
    transition: 'background 0.12s, border-color 0.12s',
  },
  reqNum: {
    width: 26, height: 26, borderRadius: 7, flexShrink: 0,
    background: '#ede9fe',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.65rem', fontWeight: 700, color: '#6d28d9',
  },
  reqTitle: {
    fontSize: '0.8rem', fontWeight: 500, color: '#1e293b',
    display: 'block',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  reqMeta: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 },
  reqTag: {
    fontSize: '0.67rem', color: '#64748b', fontWeight: 500,
    padding: '1px 6px', borderRadius: 4,
    background: '#f1f5f9', border: '0.5px solid #e2e8f0',
  },
  reqDot: { fontSize: '0.67rem', color: '#cbd5e1' },
  reqPriority: { fontSize: '0.67rem', color: '#94a3b8' },
  statusBadge: {
    padding: '3px 9px', borderRadius: 999,
    fontSize: '0.67rem', fontWeight: 500,
    border: '0.5px solid', whiteSpace: 'nowrap', flexShrink: 0,
  },
};

export default Dashboard;