import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { requestService } from '../../services/requestService.js';
import { STATES } from '../../utils/constants.js';
import {
  ArrowLeft, Calendar, User as UserIcon, Tag,
  CheckSquare, History, Check, X, MessageSquare,
  AlertCircle, FolderMinus, RotateCcw,
} from 'lucide-react';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import StatusBadge from '../../components/requests/StatusBadge.jsx';

/* ── priority pill (light) ── */
const PRIO = {
  High: { color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  Medium: { color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  Low: { color: '#166534', bg: '#f0fdf4', border: '#bbf7d0' },
};

/* ── timeline dot colour per status ── */
const dotColor = (status) => ({
  [STATES.APPROVED]: '#059669',
  [STATES.REJECTED]: '#dc2626',
  [STATES.NEEDS_CLARIFICATION]: '#d97706',
  [STATES.CLOSED]: '#94a3b8',
  [STATES.REOPENED]: '#7c3aed',
}[status] || '#3b82f6');

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const load = async () => {
    try {
      setLoading(true); setError('');
      const data = await requestService.getRequestById(id);
      setRequest(data);
      setHistory(data.history || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleTransition = async (nextStatus) => {
    setActionLoading(true); setError(''); setActionSuccess('');
    try {
      await requestService.updateRequestStatus(id, nextStatus, comments);
      setActionSuccess(`Request successfully updated to '${nextStatus}'.`);
      setComments('');
      const fresh = await requestService.getRequestById(id);
      setRequest(fresh); setHistory(fresh.history || []);
    } catch (err) {
      setError(err.message || 'Failed to update request status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader size="large" style={{ marginTop: 80 }} />;

  if (error && !request) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560, marginTop: 40 }}>
      <div style={s.errorBox}><AlertCircle size={15} />{error}</div>
      <Button variant="glass" onClick={() => navigate('/requests')} icon={ArrowLeft}>Back to List</Button>
    </div>
  );

  const currentStatus = request?.status;
  const isCreator = request?.created_by === user?.id;
  const showManagerActions = user?.role === 'Manager' && (currentStatus === STATES.SUBMITTED || currentStatus === STATES.REOPENED);
  const showUserAction = isCreator && user?.role === 'User' && currentStatus === STATES.NEEDS_CLARIFICATION;
  const showAdminClose = user?.role === 'Admin' && currentStatus === STATES.APPROVED;
  const showAdminReopen = user?.role === 'Admin' && currentStatus === STATES.CLOSED;
  const hasActions = showManagerActions || showUserAction || showAdminClose || showAdminReopen;

  const prio = PRIO[request?.priority] || PRIO.Low;

  return (
    <div style={s.page}>

      {/* ── Page Header ── */}
      <div style={s.pageHeader}>
        <button style={s.backBtn} onClick={() => navigate('/requests')}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 style={s.pageTitle}>Request Details</h2>
          <p style={s.pageSub}>ID: {request?.id}</p>
        </div>
      </div>

      {actionSuccess && (
        <div style={s.successBox}><Check size={15} style={{ flexShrink: 0 }} />{actionSuccess}</div>
      )}
      {error && (
        <div style={s.errorBox}><AlertCircle size={15} style={{ flexShrink: 0 }} />{error}</div>
      )}

      {/* ── Two-column layout ── */}
      <div style={s.grid}>

        {/* ── LEFT: Metadata card ── */}
        <div style={s.card}>
          {/* Card header */}
          <div style={s.cardHeader}>
            <h3 style={s.cardTitle} title={request?.title}>{request?.title}</h3>
            <StatusBadge status={request?.status} glow={false} />
          </div>

          {/* Meta rows */}
          <div style={s.metaList}>
            <MetaRow icon={<Tag size={15} style={{ color: '#6d28d9' }} />} label="Category">
              {request?.category}
            </MetaRow>

            <MetaRow icon={<AlertCircle size={15} style={{ color: '#6d28d9' }} />} label="Priority">
              <span style={{ ...s.prioBadge, color: prio.color, background: prio.bg, borderColor: prio.border }}>
                {request?.priority}
              </span>
            </MetaRow>

            <MetaRow icon={<UserIcon size={15} style={{ color: '#6d28d9' }} />} label="Submitted By">
              {request?.creator_name}{' '}
              <span style={{ color: '#94a3b8' }}>({request?.creator_email})</span>
            </MetaRow>

            <MetaRow icon={<Calendar size={15} style={{ color: '#6d28d9' }} />} label="Submitted On">
              {new Date(request?.created_at).toLocaleString(undefined, {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </MetaRow>
          </div>

          {/* Description */}
          <div style={s.descSection}>
            <span style={s.sectionLabel}>Request Justification</span>
            <p style={s.descText}>{request?.description}</p>
          </div>
        </div>

        {/* ── RIGHT: Actions + History ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Workflow Action card */}
          {hasActions && (
            <div style={{ ...s.card, borderColor: '#c4b5fd' }}>
              <div style={s.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ ...s.panelIconBox, background: '#f5f3ff', borderColor: '#c4b5fd' }}>
                    <CheckSquare size={14} style={{ color: '#6d28d9' }} />
                  </div>
                  <h3 style={s.panelTitle}>Workflow Decision</h3>
                </div>
              </div>

              {/* Comments textarea */}
              <div style={s.fieldGroup}>
                <label style={s.label}>Comments / Rationale</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  placeholder={
                    showManagerActions ? 'Provide justification for approval, rejection reasons, or clarification details...' :
                      showUserAction ? 'Provide the clarifications requested by the review manager...' :
                        'Provide comments regarding closing or reopening this request...'
                  }
                  style={s.textarea}
                />
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {showManagerActions && (<>
                  <Button variant="primary" size="sm" loading={actionLoading} onClick={() => handleTransition(STATES.APPROVED)} icon={Check}>Approve</Button>
                  <Button variant="danger" size="sm" loading={actionLoading} onClick={() => handleTransition(STATES.REJECTED)} icon={X}>Reject</Button>
                  <Button variant="glass" size="sm" loading={actionLoading} onClick={() => handleTransition(STATES.NEEDS_CLARIFICATION)} icon={MessageSquare}
                    style={{ color: '#b45309', borderColor: '#fde68a', background: '#fffbeb' }}>
                    Clarify
                  </Button>
                </>)}
                {showUserAction && (
                  <Button variant="primary" size="sm" loading={actionLoading} onClick={() => handleTransition(STATES.SUBMITTED)} icon={Check}>Resubmit Clarification</Button>
                )}
                {showAdminClose && (
                  <Button variant="primary" size="sm" loading={actionLoading} onClick={() => handleTransition(STATES.CLOSED)} icon={FolderMinus}>Close Transaction</Button>
                )}
                {showAdminReopen && (
                  <Button variant="accent" size="sm" loading={actionLoading} onClick={() => handleTransition(STATES.REOPENED)} icon={RotateCcw}>Reopen Request</Button>
                )}
              </div>
            </div>
          )}

          {/* Transition history card */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ ...s.panelIconBox, background: '#f0fdf4', borderColor: '#a7f3d0' }}>
                  <History size={14} style={{ color: '#059669' }} />
                </div>
                <h3 style={s.panelTitle}>Transition History</h3>
              </div>
              <span style={s.countBadge}>{history.length} event{history.length !== 1 ? 's' : ''}</span>
            </div>

            {history.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '8px 0' }}>No history records found.</p>
            ) : (
              <div style={s.timeline}>
                {history.map((log, i) => {
                  const color = dotColor(log.new_status);
                  const isLast = i === history.length - 1;
                  return (
                    <div key={log.id} style={{ position: 'relative', paddingLeft: 24, paddingBottom: isLast ? 0 : 20 }}>
                      {/* vertical line */}
                      {!isLast && (
                        <div style={{
                          position: 'absolute', left: 5, top: 18,
                          width: 1, bottom: 0, background: '#e2e8f0',
                        }} />
                      )}
                      {/* dot */}
                      <div style={{
                        position: 'absolute', left: 0, top: 4,
                        width: 12, height: 12, borderRadius: '50%',
                        background: color, border: '2px solid #fff',
                        boxShadow: `0 0 0 1px ${color}40`,
                      }} />

                      {/* content */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                            {log.old_status === 'None' ? 'Submitted Request' : `Transitioned to ${log.new_status}`}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            by {log.updater_name} ({log.updater_role})
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', whiteSpace: 'nowrap', marginTop: 2 }}>
                          {new Date(log.created_at).toLocaleString(undefined, {
                            month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {log.comments && (
                        <p style={s.logComment}>"{log.comments}"</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

/* ── small helper ── */
const MetaRow = ({ icon, label, children }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
    <div style={{ marginTop: 2, flexShrink: 0 }}>{icon}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#1e293b' }}>{children}</span>
    </div>
  </div>
);

/* ── styles ── */
const s = {
  page: { display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1020 },
  pageHeader: { display: 'flex', alignItems: 'center', gap: 14 },
  pageTitle: { fontSize: '1.35rem', fontWeight: 800, color: '#1e1b4b', letterSpacing: '-0.02em' },
  pageSub: { fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 },

  backBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
    background: '#fff', border: '0.5px solid #e2e8f0',
    color: '#64748b', cursor: 'pointer',
  },

  successBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 16px', borderRadius: 10,
    background: '#ecfdf5', border: '0.5px solid #a7f3d0',
    color: '#065f46', fontSize: '0.85rem',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 16px', borderRadius: 10,
    background: '#fef2f2', border: '0.5px solid #fecaca',
    color: '#b91c1c', fontSize: '0.85rem',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 20, alignItems: 'start',
  },

  card: {
    background: '#fff', border: '0.5px solid #e2e8f0',
    borderRadius: 14, padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    display: 'flex', flexDirection: 'column', gap: 20,
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: 16, borderBottom: '0.5px solid #f1f5f9', gap: 12,
  },
  cardTitle: {
    fontSize: '1rem', fontWeight: 700, color: '#1e1b4b',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220,
  },

  panelIconBox: {
    width: 28, height: 28, borderRadius: 7,
    border: '0.5px solid', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  panelTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' },
  countBadge: {
    padding: '2px 9px', borderRadius: 999,
    background: '#f8fafc', border: '0.5px solid #e2e8f0',
    fontSize: '0.7rem', fontWeight: 500, color: '#64748b',
  },

  metaList: { display: 'flex', flexDirection: 'column', gap: 16 },

  prioBadge: {
    display: 'inline-block', padding: '2px 8px', borderRadius: 999,
    fontSize: '0.67rem', fontWeight: 600, border: '0.5px solid',
    letterSpacing: '0.04em',
  },

  descSection: {
    paddingTop: 16, borderTop: '0.5px solid #f1f5f9',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  sectionLabel: {
    fontSize: '0.62rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8',
  },
  descText: {
    fontSize: '0.875rem', color: '#334155', lineHeight: 1.7,
    whiteSpace: 'pre-wrap', background: '#f8fafc',
    border: '0.5px solid #e2e8f0', borderRadius: 9,
    padding: '14px 16px', margin: 0,
  },

  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    fontSize: '0.67rem', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b',
  },
  textarea: {
    width: '100%', padding: '10px 12px',
    borderRadius: 9, border: '0.5px solid #e2e8f0',
    background: '#fff', color: '#1e293b',
    fontSize: '0.85rem', fontFamily: 'inherit',
    outline: 'none', resize: 'none', lineHeight: 1.6,
    boxSizing: 'border-box',
  },

  timeline: { display: 'flex', flexDirection: 'column' },
  logComment: {
    marginTop: 8, padding: '9px 12px',
    background: '#f8fafc', border: '0.5px solid #e2e8f0',
    borderRadius: 8, fontSize: '0.78rem',
    color: '#475569', fontStyle: 'italic', lineHeight: 1.5,
  },
};

export default RequestDetails;