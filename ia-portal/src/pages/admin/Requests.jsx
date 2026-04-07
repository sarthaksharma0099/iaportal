import React, { useEffect, useState } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Btn, Badge, useToast, Dots } from '../../components/UI';

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const toast = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabaseAdmin.from('access_requests').select('*').order('created_at', { ascending: false });
    setRequests(data || []);
    setLoading(false);
  }

  async function approve(req) {
    await supabaseAdmin.from('investors').upsert({
      email: req.email, name: req.name, firm: req.firm,
      status: 'approved', approved_at: new Date().toISOString(),
    }, { onConflict: 'email' });
    await supabaseAdmin.from('access_requests').update({ status: 'approved' }).eq('id', req.id);
    toast('Approved — investor added');
    load();
  }

  async function reject(id) {
    await supabaseAdmin.from('access_requests').update({ status: 'rejected' }).eq('id', id);
    toast('Request rejected', 'error');
    load();
  }

  const pending  = requests.filter(r => r.status === 'pending');

  return (
    <div>
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center' }}><Dots /></div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: 12, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: '0.75rem' }}>
                {pending.length} Pending Review
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pending.map(r => (
                  <div key={r.id} style={{ background: 'var(--bg2)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: '1.25rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{r.name || '—'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)', marginBottom: 4 }}>{r.email}</div>
                      {r.firm && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{r.firm}</div>}
                      {r.message && <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 8, fontStyle: 'italic' }}>"{r.message}"</div>}
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>{fmt(r.created_at)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <Btn variant="success" size="sm" onClick={() => approve(r)}>Approve</Btn>
                      <Btn variant="danger"  size="sm" onClick={() => reject(r.id)}>Reject</Btn>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviewed */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
              All Requests {pending.length === 0 && <span style={{ fontSize: 12, color: 'var(--green)', marginLeft: 8 }}>✓ No pending requests</span>}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'Firm', 'Message', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.65rem 1.25rem', fontSize: 11, fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No requests yet.</td></tr>
                  )}
                  {requests.map(r => (
                    <tr key={r.id}>
                      <td style={{ padding: '0.85rem 1.25rem', fontSize: 13, color: 'var(--text)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{r.name || '—'}</td>
                      <td style={{ padding: '0.85rem 1.25rem', fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)', borderBottom: '1px solid var(--border)' }}>{r.email}</td>
                      <td style={{ padding: '0.85rem 1.25rem', fontSize: 13, color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>{r.firm || '—'}</td>
                      <td style={{ padding: '0.85rem 1.25rem', fontSize: 13, color: 'var(--text2)', borderBottom: '1px solid var(--border)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.message || '—'}</td>
                      <td style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                        <Badge variant={r.status === 'approved' ? 'approved' : r.status === 'rejected' ? 'revoked' : 'pending'}>{r.status}</Badge>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{fmt(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
