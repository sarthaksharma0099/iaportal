import React, { useState } from 'react';
import { Btn, Input } from '../../components/UI';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  function handleLogin() {
    const correct = process.env.REACT_APP_ADMIN_PASSWORD;
    if (password === correct) {
      sessionStorage.setItem('ia_admin', '1');
      onLogin();
    } else {
      setError('Incorrect password.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 380, background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 16, padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' }}>
          <div style={{ width: 32, height: 32, background: 'var(--gold-dim)', border: '1px solid var(--gold)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--gold)' }}>◈</div>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--text)' }}>India Accelerator</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Admin Panel</div>
          </div>
        </div>

        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 300, color: '#fff', marginBottom: 6 }}>Sign in</h2>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: '1.75rem' }}>Enter your admin password to manage the investor portal.</p>

        {error && (
          <div style={{ background: 'rgba(224,92,74,0.1)', border: '1px solid rgba(224,92,74,0.25)', borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: 13, color: '#f08070', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <Input label="Admin Password" type="password" value={password} onChange={setPassword}
          placeholder="••••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <Btn full variant="gold" size="lg" onClick={handleLogin}>Sign In</Btn>

        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: '1rem', textAlign: 'center' }}>
          Set your password in the <code style={{ fontFamily: 'var(--mono)', background: 'var(--bg3)', padding: '1px 6px', borderRadius: 4 }}>.env</code> file.
        </p>
      </div>
    </div>
  );
}
