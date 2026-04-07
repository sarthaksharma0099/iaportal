import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Btn, Input, Dots } from '../../components/UI';

export default function Gate({ onAccess }) {
  const [email, setEmail]       = useState('');
  const [mode, setMode]         = useState('login'); // 'login' | 'request'
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [reqName, setReqName]   = useState('');
  const [reqFirm, setReqFirm]   = useState('');
  const [reqMsg, setReqMsg]     = useState('');

  async function checkAccess() {
    if (!email || !email.includes('@')) { setError('Please enter a valid email.'); return; }
    setLoading(true); setError('');
    const { data } = await supabase.from('investors').select('status,name').eq('email', email.toLowerCase()).single();
    setLoading(false);
    if (!data)                     return setError('This email is not on the approved list. You can request access below.');
    if (data.status === 'pending') return setError('Your request is pending approval. We will notify you soon.');
    if (data.status === 'revoked') return setError('Access has been revoked. Contact invest@indiaaccelerator.co');
    sessionStorage.setItem('ia_email', email.toLowerCase());
    await supabase.from('investors').update({ last_viewed_at: new Date().toISOString() }).eq('email', email.toLowerCase());
    await supabase.from('access_log').insert({ investor_email: email.toLowerCase(), event: 'login' });
    onAccess(email.toLowerCase());
  }

  async function submitRequest() {
    if (!reqName || !email) { setError('Name and email are required.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.from('access_requests').insert({
      name: reqName, email: email.toLowerCase(), firm: reqFirm, message: reqMsg,
    });
    setLoading(false);
    if (err) return setError('Failed to submit. Please email us directly.');
    setSuccess('Request submitted! We will review and get back to you within 24 hours.');
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem',
      background: 'var(--bg)',
    }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: -200, left: -100, width: 600, height: 600, borderRadius: '50%', background: 'rgba(201,168,76,0.04)', filter: 'blur(120px)', pointerEvents: 'none' }} />

      <div className="fade-up" style={{
        width: '100%', maxWidth: 440,
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 20, padding: '3rem 2.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Gold top line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,var(--gold),transparent)', opacity: 0.5 }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2.5rem' }}>
          <div style={{
            width: 36, height: 36, background: 'var(--gold-dim)',
            border: '1px solid var(--gold)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>◈</div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--text)' }}>India Accelerator</span>
        </div>

        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 300, color: '#fff', lineHeight: 1.15, marginBottom: 8 }}>
          Investor<br /><em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Portal</em>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Confidential materials for accredited investors and fund partners.
        </p>

        {/* Alerts */}
        {error   && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {mode === 'login' && !success && (
          <>
            <Input label="Work Email" type="email" value={email} onChange={setEmail}
              placeholder="you@firm.com"
              onKeyDown={e => e.key === 'Enter' && checkAccess()} />
            <Btn full variant="gold" disabled={loading} onClick={checkAccess} size="lg">
              {loading ? <Dots /> : 'Access Materials'}
            </Btn>
            <GateDivider />
            <Btn full variant="ghost" onClick={() => { setMode('request'); setError(''); }}>
              Request Access
            </Btn>
          </>
        )}

        {mode === 'request' && !success && (
          <>
            <Input label="Full Name"  value={reqName} onChange={setReqName} placeholder="Rahul Sharma" />
            <Input label="Work Email" type="email" value={email} onChange={setEmail} placeholder="you@firm.com" />
            <Input label="Firm"       value={reqFirm} onChange={setReqFirm} placeholder="Sequoia Capital" />
            <Input label="Message (optional)" value={reqMsg} onChange={setReqMsg} placeholder="Brief note about your interest…" />
            <Btn full variant="gold" disabled={loading} onClick={submitRequest} size="lg">
              {loading ? <Dots /> : 'Submit Request'}
            </Btn>
            <GateDivider />
            <Btn full variant="ghost" onClick={() => { setMode('login'); setError(''); }}>
              ← Back to sign in
            </Btn>
          </>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: '1.5rem', lineHeight: 1.5 }}>
          Confidential — For intended recipients only<br />© 2026 India Accelerator
        </p>
      </div>
    </div>
  );
}

function GateDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0', color: 'var(--text3)', fontSize: 12 }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      or
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

function Alert({ type, children }) {
  const styles = {
    error:   { bg: 'rgba(224,92,74,0.1)',  border: 'rgba(224,92,74,0.3)',  color: '#f08070' },
    success: { bg: 'rgba(74,174,140,0.1)', border: 'rgba(74,174,140,0.3)', color: '#6fcfb0' },
  };
  const s = styles[type];
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: 13, color: s.color, marginBottom: '1rem' }}>
      {children}
    </div>
  );
}
