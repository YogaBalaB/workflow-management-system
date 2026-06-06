import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { requestService } from '../../services/requestService.js';
import { formatTimestamp } from '../../utils/dateUtils.js';
import { CATEGORIES, STATES, PRIORITIES } from '../../utils/constants.js';
import { Search, ChevronLeft, ChevronRight, Eye, PlusCircle, SlidersHorizontal, RotateCcw } from 'lucide-react';
import Loader from '../../components/common/Loader.jsx';
import StatusBadge from '../../components/requests/StatusBadge.jsx';

/* ── priority pill colours (light theme) ── */
const PRIO = {
  High: { color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  Medium: { color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  Low: { color: '#166534', bg: '#f0fdf4', border: '#bbf7d0' },
};

const RequestList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const REQUEST_LIST_POLL_MS = 5_000;

  const fetchRequests = useCallback(async (overrides = {}, resetPage = false) => {
    try {
      setLoading(true);
      setError('');
      const data = await requestService.getRequests({
        search, status: statusFilter, category: categoryFilter, priority: priorityFilter,
        ...overrides,
      });
      setRequests(data);
      if (resetPage) {
        setCurrentPage(1);
      }
    } catch (err) {
      setError('Could not retrieve requests. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, priorityFilter]);

  useEffect(() => { fetchRequests({}, true); }, [fetchRequests]);

  useEffect(() => {
    const interval = setInterval(() => fetchRequests(), REQUEST_LIST_POLL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchRequests();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchRequests]);

  const handleSearchSubmit = (e) => { e.preventDefault(); fetchRequests({}, true); };

  const handleReset = () => {
    setSearch(''); setStatusFilter(''); setCategoryFilter(''); setPriorityFilter('');
    fetchRequests({ search: '', status: '', category: '', priority: '' }, true);
  };

  const total = requests.length;
  const totalPages = Math.ceil(total / itemsPerPage) || 1;
  const start = (currentPage - 1) * itemsPerPage;
  const current = requests.slice(start, start + itemsPerPage);

  return (
    <div style={s.page}>

      {/* ── Page Header ── */}
      <div style={s.pageHeader}>
        <div>
          <h2 style={s.pageTitle}>Requests Pipeline</h2>
          <p style={s.pageSub}>
            {user?.role === 'User'
              ? 'View and respond to your workflow requests.'
              : 'Review, manage, and action incoming tickets.'}
          </p>
        </div>
        {user?.role === 'User' && (
          <button style={s.primaryBtn} onClick={() => navigate('/requests/new')}>
            <PlusCircle size={15} /> Submit Request
          </button>
        )}
      </div>

      {error && <div style={s.errorBox}>⚠️ {error}</div>}

      {/* ── Filter Panel ── */}
      <div style={s.panel}>
        <div style={s.panelHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={s.panelIconBox}>
              <SlidersHorizontal size={14} style={{ color: '#6d28d9' }} />
            </div>
            <span style={s.panelTitle}>Filters</span>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit}>
          <div style={s.filterGrid}>
            {/* Search */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Search text</label>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={s.searchIcon} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. MacBook, License..."
                  style={s.input}
                />
              </div>
            </div>

            {/* Status */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={s.select}>
                <option value="">All Statuses</option>
                {Object.values(STATES).map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            {/* Category */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={s.select}>
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div style={s.fieldGroup}>
              <label style={s.label}>Priority</label>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={s.select}>
                <option value="">All Priorities</option>
                {Object.values(PRIORITIES).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Actions */}
            <div style={{ ...s.fieldGroup, justifyContent: 'flex-end' }}>
              <label style={{ ...s.label, opacity: 0 }}>_</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={handleReset} style={s.ghostBtn}>
                  <RotateCcw size={13} /> Reset
                </button>
                <button type="submit" style={s.primaryBtn}>
                  Apply
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ── Table Panel ── */}
      <div style={{ ...s.panel, padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48 }}><Loader size="medium" /></div>
        ) : current.length === 0 ? (
          <div style={s.emptyState}>
            <Search size={28} style={{ opacity: 0.25, marginBottom: 8 }} />
            <span style={s.emptyPrimary}>No requests matched search criteria.</span>
            <span style={s.emptySub}>Adjust your filters or submit a new ticket.</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>Title</th>
                  <th style={s.th}>Category</th>
                  <th style={{ ...s.th, textAlign: 'center' }}>Priority</th>
                  {user?.role !== 'User' && <th style={s.th}>Submitted By</th>}
                  <th style={s.th}>Created</th>
                  <th style={{ ...s.th, textAlign: 'center' }}>Status</th>
                  <th style={{ ...s.th, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {current.map((req) => {
                  const prio = PRIO[req.priority] || PRIO.Low;
                  return (
                    <tr key={req.id} style={s.tr}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fafbff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                    >
                      <td style={s.td}>
                        <span style={s.reqTitle}>{req.title}</span>
                        <span style={s.reqDesc}>{req.description}</span>
                      </td>
                      <td style={s.td}>
                        <span style={s.categoryTag}>{req.category}</span>
                      </td>
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        <span style={{ ...s.prioBadge, color: prio.color, background: prio.bg, borderColor: prio.border }}>
                          {req.priority}
                        </span>
                      </td>
                      {user?.role !== 'User' && (
                        <td style={{ ...s.td, color: '#475569', fontSize: '0.8rem' }}>{req.creator_name}</td>
                      )}
                      <td style={{ ...s.td, color: '#94a3b8', fontSize: '0.78rem' }}>
                        {formatTimestamp(req.created_at)}
                      </td>
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        <StatusBadge status={req.status} glow={false} />
                      </td>
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        <button style={s.viewBtn}
                          onClick={() => navigate(`/requests/${req.id}`)}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f5f3ff'; e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.color = '#6d28d9'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={s.pagination}>
            <span style={s.paginationText}>
              Showing <b>{start + 1}</b>–<b>{Math.min(start + itemsPerPage, total)}</b> of <b>{total}</b> requests
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                style={{ ...s.pageBtn, opacity: currentPage === 1 ? 0.4 : 1 }}
              >
                <ChevronLeft size={15} />
              </button>
              <span style={s.paginationText}>Page <b>{currentPage}</b> of <b>{totalPages}</b></span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                style={{ ...s.pageBtn, opacity: currentPage === totalPages ? 0.4 : 1 }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── styles ── */
const inputBase = {
  width: '100%', padding: '9px 12px',
  borderRadius: 8, border: '0.5px solid #e2e8f0',
  background: '#fff', color: '#1e293b',
  fontSize: '0.85rem', fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const s = {
  page: { display: 'flex', flexDirection: 'column', gap: 24 },
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  pageTitle: { fontSize: '1.35rem', fontWeight: 800, color: '#1e1b4b', letterSpacing: '-0.02em' },
  pageSub: { fontSize: '0.8rem', color: '#94a3b8', marginTop: 3 },

  errorBox: {
    padding: '12px 16px', borderRadius: 10,
    background: '#fef2f2', border: '0.5px solid #fecaca',
    color: '#b91c1c', fontSize: '0.85rem',
  },

  panel: {
    background: '#fff', border: '0.5px solid #e2e8f0',
    borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  panelHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
  },
  panelIconBox: {
    width: 28, height: 28, borderRadius: 7,
    background: '#f5f3ff', border: '0.5px solid #c4b5fd',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  panelTitle: { fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' },

  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16, alignItems: 'end',
  },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.67rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8' },
  searchIcon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' },
  input: { ...inputBase, paddingLeft: 32 },
  select: { ...inputBase, cursor: 'pointer', appearance: 'auto' },

  primaryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 18px', borderRadius: 8,
    background: '#6d28d9', color: '#fff', border: 'none',
    fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'background 0.15s',
    whiteSpace: 'nowrap',
  },
  ghostBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 14px', borderRadius: 8,
    background: '#fff', color: '#64748b',
    border: '0.5px solid #e2e8f0',
    fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'all 0.15s',
  },

  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thead: { background: '#f8fafc', borderBottom: '0.5px solid #e2e8f0' },
  th: {
    padding: '12px 20px',
    fontSize: '0.65rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: '#94a3b8', whiteSpace: 'nowrap',
  },
  tr: { background: '#fff', borderBottom: '0.5px solid #f1f5f9', transition: 'background 0.12s' },
  td: { padding: '14px 20px', verticalAlign: 'middle' },

  reqTitle: { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' },
  reqDesc: { display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginTop: 2, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

  categoryTag: {
    fontSize: '0.72rem', fontWeight: 500, color: '#475569',
    background: '#f8fafc', border: '0.5px solid #e2e8f0',
    padding: '2px 8px', borderRadius: 4,
  },
  prioBadge: {
    display: 'inline-block',
    padding: '2px 8px', borderRadius: 999,
    fontSize: '0.67rem', fontWeight: 600,
    border: '0.5px solid', letterSpacing: '0.04em',
  },
  viewBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '6px 12px', borderRadius: 7,
    background: '#fff', border: '0.5px solid #e2e8f0',
    color: '#64748b', fontSize: '0.78rem', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
  },

  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '56px 24px', gap: 6, textAlign: 'center',
  },
  emptyPrimary: { fontSize: '0.875rem', fontWeight: 600, color: '#64748b' },
  emptySub: { fontSize: '0.78rem', color: '#94a3b8' },

  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px', borderTop: '0.5px solid #f1f5f9',
    background: '#fafafa',
  },
  paginationText: { fontSize: '0.78rem', color: '#64748b' },
  pageBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 30, height: 30, borderRadius: 7,
    background: '#fff', border: '0.5px solid #e2e8f0',
    color: '#64748b', cursor: 'pointer', transition: 'all 0.15s',
  },
};

export default RequestList;