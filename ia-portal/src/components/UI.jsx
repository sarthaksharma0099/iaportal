import React, { useEffect, useState } from 'react';

/* ── Button ── */
export function Btn({ children, variant = 'gold', size = 'md', full, disabled, onClick, style }) {
  const base = {
    border: 'none', borderRadius: 8, fontFamily: 'var(--sans)',
    fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s',
    letterSpacing: '0.01em',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    width: full ? '100%' : undefined,
  };
  const sizes = {
    sm: { padding: '5px 12px', fontSize: 12 },
    md: { padding: '10px 18px', fontSize: 13 },
    lg: { padding: '13px 24px', fontSize: 14 },
  };
  const variants = {
    gold:    { background: 'var(--gold)',   color: '#0a0a08' },
    ghost:   { background: 'transparent',  color: 'var(--text2)', border: '1px solid var(--border2)' },
    danger:  { background: 'rgba(224,92,74,0.12)', color: '#f08070', border: '1px solid rgba(224,92,74,0.25)' },
    success: { background: 'rgba(74,174,140,0.12)', color: '#6fcfb0', border: '1px solid rgba(74,174,140,0.25)' },
    dark:    { background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border2)' },
  };
  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

/* ── Badge ── */
export function Badge({ children, variant = 'default' }) {
  const variants = {
    default:  { background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border2)' },
    approved: { background: 'rgba(74,174,140,0.12)', color: '#6fcfb0', border: '1px solid rgba(74,174,140,0.25)' },
    pending:  { background: 'rgba(201,168,76,0.1)',  color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.2)' },
    revoked:  { background: 'rgba(224,92,74,0.1)',   color: '#f08070', border: '1px solid rgba(224,92,74,0.2)' },
    live:     { background: 'rgba(74,174,140,0.12)', color: '#6fcfb0', border: '1px solid rgba(74,174,140,0.25)' },
    soon:     { background: 'rgba(201,168,76,0.1)',  color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.2)' },
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 500, letterSpacing: '0.06em',
      textTransform: 'uppercase',
      ...variants[variant],
    }}>
      {(variant === 'live' || variant === 'approved') && (
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4aae8c', flexShrink: 0 }} />
      )}
      {children}
    </span>
  );
}

/* ── Loading dots ── */
export function Dots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)',
          animation: `dotPulse 1.4s infinite ${i * 0.2}s`,
          display: 'inline-block',
        }} />
      ))}
    </span>
  );
}

/* ── Input ── */
export function Input({ label, type = 'text', value, onChange, placeholder, style, onKeyDown }) {
  return (
    <div style={{ marginBottom: '0.9rem', ...style }}>
      {label && <div style={{
        fontSize: 11, fontWeight: 500, color: 'var(--text3)',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6
      }}>{label}</div>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} onKeyDown={onKeyDown}
        style={{
          width: '100%', padding: '10px 14px',
          background: 'var(--bg3)', border: '1px solid var(--border2)',
          borderRadius: 8, color: 'var(--text)',
          fontSize: 13, outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--border2)'}
      />
    </div>
  );
}

/* ── Textarea ── */
export function Textarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ marginBottom: '0.9rem' }}>
      {label && <div style={{
        fontSize: 11, fontWeight: 500, color: 'var(--text3)',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6
      }}>{label}</div>}
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        style={{
          width: '100%', padding: '10px 14px',
          background: 'var(--bg3)', border: '1px solid var(--border2)',
          borderRadius: 8, color: 'var(--text)',
          fontSize: 13, outline: 'none', resize: 'vertical',
          lineHeight: 1.5, transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--border2)'}
      />
    </div>
  );
}

/* ── Select ── */
export function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: '0.9rem' }}>
      {label && <div style={{
        fontSize: 11, fontWeight: 500, color: 'var(--text3)',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6
      }}>{label}</div>}
      <select
        value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px',
          background: 'var(--bg3)', border: '1px solid var(--border2)',
          borderRadius: 8, color: 'var(--text)',
          fontSize: 13, outline: 'none', cursor: 'pointer',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--border2)'}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

/* ── Modal ── */
export function Modal({ open, onClose, title, subtitle, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', animation: 'fadeIn 0.2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 16, padding: '2rem',
        width: '100%', maxWidth: 460,
        animation: 'fadeUp 0.25s ease',
      }}>
        {title && <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 300, color: '#fff', marginBottom: 4 }}>{title}</div>}
        {subtitle && <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: '1.5rem' }}>{subtitle}</div>}
        {children}
      </div>
    </div>
  );
}

/* ── Toast ── */
let _setToast = null;
export function useToast() {
  const show = (msg, type = 'success') => _setToast && _setToast({ msg, type, id: Date.now() });
  return show;
}

export function ToastProvider() {
  const [toast, setToast] = useState(null);
  _setToast = setToast;
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);
  if (!toast) return null;
  const colors = { success: '#6fcfb0', error: '#f08070', info: 'var(--gold)' };
  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
      background: 'var(--bg3)', border: `1px solid var(--border2)`,
      borderRadius: 10, padding: '0.75rem 1.25rem',
      fontSize: 13, color: colors[toast.type] || 'var(--text)',
      display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'toastIn 0.3s ease',
      maxWidth: 360,
    }}>
      {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
    </div>
  );
}

/* ── Card ── */
export function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 12, ...style,
    }}>
      {children}
    </div>
  );
}

/* ── Divider ── */
export function Divider({ style }) {
  return <div style={{ height: 1, background: 'var(--border)', ...style }} />;
}
