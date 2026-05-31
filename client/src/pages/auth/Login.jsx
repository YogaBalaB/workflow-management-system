import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import {
  Lock, Mail, ShieldCheck, Key, User as UserIcon,
  Award, Zap, Eye, EyeOff, Check, ArrowRight
} from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    setGeneralError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Enter a valid email address.';
    if (!formData.password) errs.password = 'Password is required.';
    else if (formData.password.length < 6) errs.password = 'Minimum 6 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setGeneralError('');
    try {
      await login(formData.email, formData.password);
      setSuccessAnimation(true);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setGeneralError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email) => {
    setFormData({ email, password: 'password123' });
    setErrors({});
    setGeneralError('');
  };

  const demoAccounts = [
    { name: 'Alice', role: 'User', email: 'user@test.com', icon: UserIcon, color: '#4f46e5', lightBg: '#eef2ff', badgeColor: '#e0e7ff', badgeText: '#3730a3', desc: 'Submit and track requests' },
    { name: 'Bob', role: 'Manager', email: 'manager@test.com', icon: Award, color: '#059669', lightBg: '#ecfdf5', badgeColor: '#d1fae5', badgeText: '#065f46', desc: 'Approve and manage requests' },
    { name: 'Charlie', role: 'Admin', email: 'admin@test.com', icon: ShieldCheck, color: '#d97706', lightBg: '#fffbeb', badgeColor: '#fde68a', badgeText: '#92400e', desc: 'Full workflow oversight' },
  ];

  const steps = [
    { state: 'Submitted', bg: '#dbeafe', color: '#1d4ed8' },
    { state: 'Approved', bg: '#dcfce7', color: '#166534' },
    { state: 'Closed', bg: '#f3f4f6', color: '#374151' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'var(--font-body)' }}>

      {/* ── LEFT PANEL ── */}
      <div className="login-branding-panel" style={{
        width: '50%', minHeight: '100vh', background: '#fff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'flex-start',
        padding: '0 64px', gap: '40px', boxSizing: 'border-box',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={17} color="#fff" />
          </div>
          <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>FlowTrack</span>
        </div>

        {/* Headline only */}
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', lineHeight: '1.25', letterSpacing: '-0.03em', marginBottom: '12px' }}>
            Request approvals,<br />
            <span style={{ color: '#4f46e5' }}>simplified.</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.65', maxWidth: '320px' }}>
            Role-based workflow management with full audit trail.
          </p>
        </div>

        {/* Workflow states — minimal */}
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>
            Workflow
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {steps.map((s, i) => (
              <React.Fragment key={s.state}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', background: s.bg, color: s.color }}>
                  {s.state}
                </span>
                {i < steps.length - 1 && <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Role pills */}
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>
            Roles
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { label: 'User', color: '#4f46e5', bg: '#eef2ff' },
              { label: 'Manager', color: '#059669', bg: '#ecfdf5' },
              { label: 'Admin', color: '#d97706', bg: '#fffbeb' },
            ].map(r => (
              <span key={r.label} style={{ fontSize: '0.78rem', fontWeight: 600, padding: '5px 12px', borderRadius: '20px', background: r.bg, color: r.color }}>
                {r.label}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ width: '50%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 56px', background: '#f8fafc', boxSizing: 'border-box' }}>
        <div style={{
          width: '100%',
          background: '#fff', borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '40px 40px', position: 'relative', width: '100%',
          animation: 'fadeInUp 0.45s cubic-bezier(0.16,1,0.3,1) both',
        }}>

          {/* Success overlay */}
          {successAnimation && (
            <div style={{ position: 'absolute', inset: 0, background: '#fff', borderRadius: '20px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease both' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#ecfdf5', border: '2px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', animation: 'pulseSuccess 1.5s infinite' }}>
                <Check size={24} color="#10b981" />
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#065f46', marginBottom: '4px' }}>Authentication Successful</div>
              <div style={{ fontSize: '0.82rem', color: '#059669' }}>Redirecting to dashboard...</div>
            </div>
          )}

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px', letterSpacing: '-0.02em' }}>
              Sign in to your account
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Enter your credentials to continue</p>
          </div>

          {/* Error */}
          {generalError && (
            <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#b91c1c', fontWeight: 500, animation: 'shakeError 0.35s ease both' }}>
              <span>⚠️</span> {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex', pointerEvents: 'none' }}>
                  <Mail size={15} />
                </span>
                <input
                  name="email" type="email" value={formData.email}
                  onChange={handleChange} placeholder="name@company.com" autoComplete="email"
                  style={{ width: '100%', height: '44px', border: `1px solid ${errors.email ? '#f87171' : '#e2e8f0'}`, borderRadius: '10px', paddingLeft: '38px', paddingRight: '14px', fontSize: '0.875rem', color: '#0f172a', background: '#f9fafb', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = errors.email ? '#f87171' : '#e2e8f0'; e.target.style.background = '#f9fafb'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {errors.email && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '5px', fontWeight: 500 }}>• {errors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex', pointerEvents: 'none' }}>
                  <Lock size={15} />
                </span>
                <input
                  name="password" type={showPassword ? 'text' : 'password'}
                  value={formData.password} onChange={handleChange}
                  placeholder="••••••••" autoComplete="current-password"
                  style={{ width: '100%', height: '44px', border: `1px solid ${errors.password ? '#f87171' : '#e2e8f0'}`, borderRadius: '10px', paddingLeft: '38px', paddingRight: '42px', fontSize: '0.875rem', color: '#0f172a', background: '#f9fafb', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = errors.password ? '#f87171' : '#e2e8f0'; e.target.style.background = '#f9fafb'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '5px', fontWeight: 500 }}>• {errors.password}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ width: '100%', height: '44px', background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff', fontWeight: 600, fontSize: '0.9rem', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 2px 10px rgba(79,70,229,0.25)', transition: 'background 0.15s, transform 0.1s' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#4338ca'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#4f46e5'; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.985)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = ''; }}
            >
              {loading ? (
                <><div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.65s linear infinite' }} /> Authenticating...</>
              ) : (
                <> Sign in to Portal <ArrowRight size={15} /> </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '22px 0 14px' }}>
            <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
            <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
              <Key size={11} /> Demo Accounts
            </span>
            <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {demoAccounts.map(({ name, role, email, icon: Icon, color, lightBg, badgeColor, badgeText, desc }) => {
              const isSelected = formData.email === email;
              return (
                <button key={email} type="button" onClick={() => fillCredentials(email)}
                  style={{ width: '100%', textAlign: 'left', background: isSelected ? lightBg : '#fafafa', border: `1px solid ${isSelected ? color : '#f1f5f9'}`, borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = color + '80'; e.currentTarget.style.background = lightBg; } e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#fafafa'; } e.currentTarget.style.transform = ''; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: lightBg, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={15} color={color} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>{name}</span>
                        {isSelected && <span style={{ width: '13px', height: '13px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={8} color="#fff" /></span>}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{desc}</span>
                    </div>
                  </div>
                  <span style={{ padding: '3px 9px', borderRadius: '5px', flexShrink: 0, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: badgeColor, color: badgeText }}>
                    {role}
                  </span>
                </button>
              );
            })}
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#cbd5e1', marginTop: '18px' }}>
            🔒 JWT secured · Role-based access control
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shakeError { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-4px); } 40%,80% { transform: translateX(4px); } }
        @keyframes pulseSuccess { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); } 50% { box-shadow: 0 0 0 10px rgba(16,185,129,0); } }
        @media (max-width: 860px) { .login-branding-panel { display: none !important; } }
      `}</style>
    </div>
  );
};

export default Login;