import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, UserPlus, Users, ToggleLeft, ToggleRight,
  Clock, Save, RefreshCw, CheckCircle2, AlertCircle, Eye, EyeOff,
} from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import Loader from '../../components/common/Loader.jsx';

/* ── helpers ──────────────────────────────────────────────────── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) : '—';

/* ── sub-components ───────────────────────────────────────────── */
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === 'success' ? '#ecfdf5' : '#fef2f2';
  const brd = type === 'success' ? '#a7f3d0' : '#fecaca';
  const clr = type === 'success' ? '#065f46' : '#991b1b';
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <div style={{ ...s.toast, background: bg, borderColor: brd, color: clr }}>
      <Icon size={15} />
      <span>{msg}</span>
    </div>
  );
};

/* ── main component ───────────────────────────────────────────── */
const AdminConsole = () => {
  /* managers state */
  const [managers, setManagers] = useState([]);
  const [mgLoading, setMgLoading] = useState(true);

  /* create form */
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [creating, setCreating] = useState(false);

  /* settings */
  const [timeLimitInput, setTimeLimitInput] = useState('');
  const [savedLimit, setSavedLimit] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  /* toast */
  const [toast, setToast] = useState(null);

  const notify = (msg, type = 'success') => setToast({ msg, type });

  /* ── fetch managers ───────────────────────────────────────── */
  const loadManagers = useCallback(async () => {
    setMgLoading(true);
    try {
      const data = await adminService.getManagers();
      setManagers(Array.isArray(data) ? data : []);
    } catch {
      notify('Failed to load managers.', 'error');
    } finally {
      setMgLoading(false);
    }
  }, []);

  /* ── fetch settings ───────────────────────────────────────── */
  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const data = await adminService.getSettings();
      const v = data?.response_time_limit ?? 10;
      setSavedLimit(v);
      setTimeLimitInput(String(v));
    } catch {
      notify('Failed to load settings.', 'error');
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadManagers();
    loadSettings();
  }, [loadManagers, loadSettings]);

  /* ── create manager ───────────────────────────────────────── */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      notify('All fields are required.', 'error');
      return;
    }
    if (form.password.length < 6) {
      notify('Password must be at least 6 characters.', 'error');
      return;
    }
    setCreating(true);
    try {
      await adminService.createManager(form);
      setForm({ name: '', email: '', password: '' });
      notify('Manager account created successfully!');
      loadManagers();
    } catch (err) {
      notify(err.message || 'Failed to create manager.', 'error');
    } finally {
      setCreating(false);
    }
  };

  /* ── toggle enable/disable ────────────────────────────────── */
  const handleToggle = async (manager) => {
    const next = !manager.is_enabled;
    /* optimistic update */
    setManagers((prev) =>
      prev.map((m) => (m.id === manager.id ? { ...m, is_enabled: next } : m))
    );
    try {
      await adminService.toggleManager(manager.id, next);
      notify(`${manager.name} ${next ? 'enabled' : 'disabled'} successfully.`);
    } catch (err) {
      /* revert on failure */
      setManagers((prev) =>
        prev.map((m) => (m.id === manager.id ? { ...m, is_enabled: !next } : m))
      );
      notify(err.message || 'Failed to update manager status.', 'error');
    }
  };

  /* ── save settings ────────────────────────────────────────── */
  const handleSaveSettings = async () => {
    const val = parseInt(timeLimitInput, 10);
    if (isNaN(val) || val < 1 || val > 86400) {
      notify('Enter a valid time (1 – 86400 seconds).', 'error');
      return;
    }
    setSavingSettings(true);
    try {
      await adminService.updateSettings({ response_time_limit: val });
      setSavedLimit(val);
      notify(`Response time limit updated to ${val}s.`);
    } catch (err) {
      notify(err.message || 'Failed to save settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  /* ── render ───────────────────────────────────────────────── */
  return (
    <div style={s.page}>

      {/* toast */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* ── Page Header ──────────────────────────────────────── */}
      <div style={s.pageHeader}>
        <div style={s.pageHeaderLeft}>
          <div style={s.headerIcon}>
            <ShieldCheck size={20} color="#db2777" />
          </div>
          <div>
            <h1 style={s.pageTitle}>Admin Console</h1>
            <p style={s.pageSub}>Manage manager accounts, access control and SLA settings.</p>
          </div>
        </div>
      </div>

      {/* ── 2-column grid ────────────────────────────────────── */}
      <div style={s.grid}>

        {/* ── LEFT COLUMN ─────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Create Manager Card */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={{ ...s.cardIconBox, background: '#fdf2f8', borderColor: '#fbcfe8' }}>
                <UserPlus size={15} color="#db2777" />
              </div>
              <div>
                <h2 style={s.cardTitle}>Create Manager Account</h2>
                <p style={s.cardSub}>New accounts are immediately active.</p>
              </div>
            </div>

            <form onSubmit={handleCreate} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Full Name</label>
                <input
                  style={s.input}
                  type="text"
                  placeholder="e.g. Sarah Johnson"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  onFocus={(e) => (e.target.style.borderColor = '#f9a8d4')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Email Address</label>
                <input
                  style={s.input}
                  type="email"
                  placeholder="manager@company.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  onFocus={(e) => (e.target.style.borderColor = '#f9a8d4')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Password</label>
                <div style={s.pwWrap}>
                  <input
                    style={{ ...s.input, paddingRight: 40 }}
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    onFocus={(e) => (e.target.style.borderColor = '#f9a8d4')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                  <button type="button" style={s.pwEye} onClick={() => setShowPw((v) => !v)}>
                    {showPw ? <EyeOff size={14} color="#94a3b8" /> : <Eye size={14} color="#94a3b8" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={creating}
                style={{ ...s.submitBtn, opacity: creating ? 0.7 : 1 }}
                onMouseEnter={(e) => { if (!creating) e.currentTarget.style.background = '#be185d'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#db2777'; }}
              >
                {creating ? (
                  <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <UserPlus size={14} />
                )}
                {creating ? 'Creating…' : 'Create Manager'}
              </button>
            </form>
          </div>

          {/* Response Time Settings Card */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={{ ...s.cardIconBox, background: '#fffbeb', borderColor: '#fde68a' }}>
                <Clock size={15} color="#d97706" />
              </div>
              <div>
                <h2 style={s.cardTitle}>SLA Response Time</h2>
                <p style={s.cardSub}>Max seconds before a reminder is triggered.</p>
              </div>
            </div>

            {settingsLoading ? (
              <Loader size="small" style={{ margin: '20px auto' }} />
            ) : (
              <div style={{ marginTop: 4 }}>
                <div style={s.field}>
                  <label style={s.label}>
                    Time Limit
                    {savedLimit !== null && (
                      <span style={s.savedBadge}>Currently: {savedLimit}s</span>
                    )}
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      style={{ ...s.input, flex: 1 }}
                      type="number"
                      min="1"
                      max="86400"
                      placeholder="e.g. 10"
                      value={timeLimitInput}
                      onChange={(e) => setTimeLimitInput(e.target.value)}
                      onFocus={(e) => (e.target.style.borderColor = '#fde68a')}
                      onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                    />
                    <button
                      onClick={handleSaveSettings}
                      disabled={savingSettings}
                      style={{ ...s.saveBtn, opacity: savingSettings ? 0.7 : 1 }}
                      onMouseEnter={(e) => { if (!savingSettings) e.currentTarget.style.background = '#b45309'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#d97706'; }}
                    >
                      {savingSettings ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                      Save
                    </button>
                  </div>
                  <p style={s.hint}>
                    Managers receive a reminder notification in their dashboard if a pending
                    request is not actioned within this time.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Managers List ───────────────────── */}
        <div style={s.card}>
          <div style={{ ...s.cardHeader, marginBottom: 0 }}>
            <div style={s.cardHeaderLeft}>
              <div style={{ ...s.cardIconBox, background: '#eff6ff', borderColor: '#bfdbfe' }}>
                <Users size={15} color="#2563eb" />
              </div>
              <div>
                <h2 style={s.cardTitle}>Manager Accounts</h2>
                <p style={s.cardSub}>Enable or disable manager login access.</p>
              </div>
            </div>
            <span style={s.countBadge}>{managers.length} total</span>
          </div>

          <div style={s.divider} />

          {mgLoading ? (
            <Loader size="small" style={{ margin: '40px auto' }} />
          ) : managers.length === 0 ? (
            <div style={s.emptyState}>
              <Users size={32} style={{ opacity: 0.25 }} />
              <span style={s.emptyText}>No manager accounts yet.</span>
              <span style={s.emptyHint}>Use the form on the left to create one.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {managers.map((mgr) => (
                <div key={mgr.id} style={s.managerRow}>
                  {/* Avatar */}
                  <div style={{
                    ...s.avatar,
                    background: mgr.is_enabled ? '#eff6ff' : '#f8fafc',
                    color: mgr.is_enabled ? '#2563eb' : '#94a3b8',
                    borderColor: mgr.is_enabled ? '#bfdbfe' : '#e2e8f0',
                  }}>
                    {mgr.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={s.mgrName}>{mgr.name}</span>
                      <span style={{
                        ...s.statusPill,
                        background: mgr.is_enabled ? '#ecfdf5' : '#fef2f2',
                        color: mgr.is_enabled ? '#065f46' : '#991b1b',
                        borderColor: mgr.is_enabled ? '#a7f3d0' : '#fecaca',
                      }}>
                        {mgr.is_enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <span style={s.mgrEmail}>{mgr.email}</span>
                    <span style={s.mgrDate}>Since {fmtDate(mgr.created_at)}</span>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(mgr)}
                    style={{
                      ...s.toggleBtn,
                      background: mgr.is_enabled ? '#ecfdf5' : '#fef2f2',
                      borderColor: mgr.is_enabled ? '#a7f3d0' : '#fecaca',
                      color: mgr.is_enabled ? '#065f46' : '#991b1b',
                    }}
                    title={mgr.is_enabled ? 'Disable login' : 'Enable login'}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    {mgr.is_enabled
                      ? <><ToggleRight size={16} /> Enabled</>
                      : <><ToggleLeft size={16} /> Disabled</>
                    }
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* spin keyframes injected once */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

/* ── styles ───────────────────────────────────────────────────── */
const s = {
  page: {
    display: 'flex', flexDirection: 'column', gap: 28,
  },

  /* header */
  pageHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
  },
  pageHeaderLeft: {
    display: 'flex', alignItems: 'center', gap: 14,
  },
  headerIcon: {
    width: 44, height: 44, borderRadius: 12,
    background: '#fdf2f8', border: '0.5px solid #fbcfe8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: '1.35rem', fontWeight: 800, color: '#1e1b4b', margin: 0, letterSpacing: '-0.02em',
  },
  pageSub: {
    fontSize: '0.8rem', color: '#94a3b8', margin: 0,
  },

  /* 2-col grid */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(300px, 380px) 1fr',
    gap: 20,
    alignItems: 'start',
  },

  /* card */
  card: {
    background: '#ffffff',
    border: '0.5px solid #e2e8f0',
    borderRadius: 14,
    padding: 24,
    display: 'flex', flexDirection: 'column', gap: 20,
  },
  cardHeader: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
  },
  cardHeaderLeft: {
    display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1,
  },
  cardIconBox: {
    width: 34, height: 34, borderRadius: 9,
    border: '0.5px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: '0.9375rem', fontWeight: 700, color: '#1e293b', margin: 0,
  },
  cardSub: {
    fontSize: '0.72rem', color: '#94a3b8', margin: 0,
  },
  countBadge: {
    padding: '3px 10px', borderRadius: 6,
    background: '#eff6ff', border: '0.5px solid #bfdbfe',
    fontSize: '0.7rem', fontWeight: 500, color: '#1d4ed8',
    whiteSpace: 'nowrap',
  },
  divider: {
    height: 1, background: '#e2e8f0', margin: '0 -24px',
  },

  /* form */
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    fontSize: '0.75rem', fontWeight: 600, color: '#475569',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  savedBadge: {
    padding: '2px 8px', borderRadius: 5,
    background: '#fffbeb', border: '0.5px solid #fde68a',
    color: '#92400e', fontSize: '0.65rem', fontWeight: 500,
  },
  input: {
    width: '100%', padding: '9px 12px',
    border: '0.5px solid #e2e8f0', borderRadius: 8,
    fontSize: '0.85rem', color: '#1e293b',
    background: '#fafafa',
    fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  },
  pwWrap: { position: 'relative' },
  pwEye: {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', padding: 2,
    display: 'flex', alignItems: 'center',
  },
  hint: {
    fontSize: '0.7rem', color: '#94a3b8', margin: '4px 0 0 0', lineHeight: 1.5,
  },
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '10px 16px', borderRadius: 9,
    background: '#db2777', color: '#fff', border: 'none',
    fontSize: '0.85rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'background 0.15s',
  },
  saveBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '9px 16px', borderRadius: 9,
    background: '#d97706', color: '#fff', border: 'none',
    fontSize: '0.82rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'background 0.15s', whiteSpace: 'nowrap',
  },

  /* manager rows */
  managerRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '13px 14px', borderRadius: 10,
    background: '#f8fafc', border: '0.5px solid #e2e8f0',
  },
  avatar: {
    width: 38, height: 38, borderRadius: 10,
    border: '0.5px solid', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', fontWeight: 700,
  },
  mgrName: {
    fontSize: '0.85rem', fontWeight: 600, color: '#1e293b',
  },
  statusPill: {
    padding: '2px 8px', borderRadius: 999,
    fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
    border: '0.5px solid',
  },
  mgrEmail: {
    fontSize: '0.72rem', color: '#64748b',
    display: 'block', marginTop: 2,
  },
  mgrDate: {
    fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginTop: 1,
  },
  toggleBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '6px 12px', borderRadius: 8,
    border: '0.5px solid',
    fontSize: '0.72rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'opacity 0.15s', whiteSpace: 'nowrap', flexShrink: 0,
  },

  /* empty state */
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '48px 20px', gap: 8,
    color: '#94a3b8',
  },
  emptyText: { fontSize: '0.875rem', fontWeight: 500, color: '#64748b' },
  emptyHint: { fontSize: '0.75rem', color: '#94a3b8' },

  /* toast */
  toast: {
    position: 'fixed', top: 20, right: 24, zIndex: 9999,
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 18px', borderRadius: 10, border: '0.5px solid',
    fontSize: '0.82rem', fontWeight: 500,
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    animation: 'slideIn 0.2s ease',
  },
};

export default AdminConsole;
