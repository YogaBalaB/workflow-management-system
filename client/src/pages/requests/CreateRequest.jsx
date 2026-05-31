import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestService } from '../../services/requestService.js';
import { CATEGORIES, PRIORITIES } from '../../utils/constants.js';
import { ClipboardList, PlusCircle, ArrowLeft, AlertCircle } from 'lucide-react';

const PRIO_CONFIG = {
  [PRIORITIES.LOW]: { color: '#166534', bg: '#f0fdf4', border: '#86efac', activeBg: '#dcfce7' },
  [PRIORITIES.MEDIUM]: { color: '#b45309', bg: '#fffbeb', border: '#fcd34d', activeBg: '#fef3c7' },
  [PRIORITIES.HIGH]: { color: '#b91c1c', bg: '#fef2f2', border: '#fca5a5', activeBg: '#fee2e2' },
};

const CreateRequest = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '', category: '', priority: PRIORITIES.LOW, description: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.title?.trim()) e.title = 'Request title is required.';
    else if (formData.title.length > 255) e.title = 'Title cannot exceed 255 characters.';
    if (!formData.category) e.category = 'Please select a valid category.';
    if (!formData.description?.trim()) e.description = 'Detailed description is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setGeneralError('');
    try {
      await requestService.createRequest(formData);
      navigate('/requests');
    } catch (err) {
      setGeneralError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>

      {/* ── Page Header ── */}
      <div style={s.pageHeader}>
        <button style={s.backBtn} onClick={() => navigate('/requests')}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 style={s.pageTitle}>Submit New Request</h2>
          <p style={s.pageSub}>Fill in purchase renewal or upgrade details.</p>
        </div>
      </div>

      {generalError && (
        <div style={s.errorBox}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          {generalError}
        </div>
      )}

      {/* ── Form Card ── */}
      <div style={s.card}>
        <form onSubmit={handleSubmit} style={s.form}>

          {/* Title */}
          <div style={s.fieldGroup}>
            <label style={s.label}>
              Request Title <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <ClipboardList size={15} style={s.fieldIcon} />
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Adobe Creative Cloud Renewal"
                style={{ ...s.input, paddingLeft: 36, borderColor: errors.title ? '#fca5a5' : '#e2e8f0' }}
              />
            </div>
            {errors.title && <span style={s.fieldError}>{errors.title}</span>}
          </div>

          {/* Category */}
          <div style={s.fieldGroup}>
            <label style={s.label}>
              Category <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ ...s.input, cursor: 'pointer', appearance: 'auto', borderColor: errors.category ? '#fca5a5' : '#e2e8f0' }}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <span style={s.fieldError}>{errors.category}</span>}
          </div>

          {/* Priority */}
          <div style={s.fieldGroup}>
            <label style={s.label}>Priority level</label>
            <div style={s.prioGrid}>
              {[PRIORITIES.LOW, PRIORITIES.MEDIUM, PRIORITIES.HIGH].map((p) => {
                const cfg = PRIO_CONFIG[p];
                const isActive = formData.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority: p }))}
                    style={{
                      ...s.prioBtn,
                      color: isActive ? cfg.color : '#94a3b8',
                      background: isActive ? cfg.activeBg : '#f8fafc',
                      borderColor: isActive ? cfg.border : '#e2e8f0',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div style={s.fieldGroup}>
            <label style={s.label}>
              Detailed Description <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Explain why this request is required, estimated costs, and any relevant timeline guidelines."
              style={{ ...s.input, resize: 'vertical', lineHeight: 1.6, borderColor: errors.description ? '#fca5a5' : '#e2e8f0' }}
            />
            {errors.description && <span style={s.fieldError}>{errors.description}</span>}
          </div>

          {/* Actions */}
          <div style={s.formFooter}>
            <button type="button" style={s.ghostBtn} onClick={() => navigate('/requests')} disabled={loading}>
              Cancel
            </button>
            <button type="submit" style={{ ...s.primaryBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? (
                'Submitting…'
              ) : (
                <><PlusCircle size={15} /> Submit Ticket</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── styles ── */
const inputBase = {
  width: '100%', padding: '10px 13px',
  borderRadius: 9, border: '0.5px solid #e2e8f0',
  background: '#fff', color: '#1e293b',
  fontSize: '0.875rem', fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const s = {
  page: { display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720 },
  pageHeader: { display: 'flex', alignItems: 'center', gap: 14 },
  pageTitle: { fontSize: '1.35rem', fontWeight: 800, color: '#1e1b4b', letterSpacing: '-0.02em' },
  pageSub: { fontSize: '0.8rem', color: '#94a3b8', marginTop: 3 },

  backBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
    background: '#fff', border: '0.5px solid #e2e8f0',
    color: '#64748b', cursor: 'pointer', transition: 'all 0.15s',
  },

  errorBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 16px', borderRadius: 10,
    background: '#fef2f2', border: '0.5px solid #fecaca',
    color: '#b91c1c', fontSize: '0.85rem',
  },

  card: {
    background: '#fff', border: '0.5px solid #e2e8f0',
    borderRadius: 14, padding: '28px 32px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 22 },

  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: {
    fontSize: '0.75rem', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.07em',
    color: '#64748b',
  },
  fieldIcon: {
    position: 'absolute', left: 11, top: '50%',
    transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none',
  },
  input: inputBase,
  fieldError: { fontSize: '0.75rem', color: '#dc2626', marginTop: 2 },

  prioGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 },
  prioBtn: {
    padding: '10px 0', borderRadius: 9,
    border: '0.5px solid', fontSize: '0.85rem',
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.15s',
  },

  formFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: 10,
    paddingTop: 18, borderTop: '0.5px solid #f1f5f9', marginTop: 4,
  },
  ghostBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '10px 20px', borderRadius: 9,
    background: '#fff', border: '0.5px solid #e2e8f0',
    color: '#64748b', fontSize: '0.85rem', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
  },
  primaryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '10px 22px', borderRadius: 9,
    background: '#6d28d9', color: '#fff', border: 'none',
    fontSize: '0.85rem', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
  },
};

export default CreateRequest;