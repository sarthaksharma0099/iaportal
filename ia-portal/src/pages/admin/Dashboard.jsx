import React, { useEffect, useState } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Dots } from '../../components/UI';

function StatCard({ value, label }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem' }}>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 300, color: '#fff', marginBottom: 4 }}>{value ?? <Dots />}</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Dashboard() {
  const [stats, setStats]   = useState({});
  const [log, setLog]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const [inv, req, sec, logRes] = await Promise.all([
      supabaseAdmin.from('investors').select('id', { count: 'exact' }).eq('status', 'approved'),
      supabaseAdmin.from('access_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabaseAdmin.from('portal_sections').select('id', { count: 'exact' }).eq('is_visible', true),
      supabaseAdmin.from('access_log').select('*').order('created_at', { ascending: false }).limit(15),
    ]);
    setStats({ investors: inv.count, pending: req.count, sections: sec.count, views: logRes.data?.length });
    setLog(logRes.data || []);
    setLoading(false);
  }

  const eventBadge = (e) => ({
    color:      e === 'login' ? '#6fcfb0' : 'var(--gold)',
    background: e === 'login' ? 'rgba(74,174,140,0.1)' : 'rgba(201,168,76,0.08)',
    border:     e === 'login' ? '1px solid rgba(74,174,140,0.2)' : '1px solid rgba(201,168,76,0.15)',
  });

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard value={stats.investors} label="Approved Investors" />
        <StatCard value={stats.pending}   label="Pending Requests" />
        <StatCard value={stats.sections}  label="Live Sections" />
        <StatCard value={stats.views}     label="Recent Events" />
      </div>

      {/* Log table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Recent Access Log</div>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}><Dots /></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Investor', 'Section', 'Event', 'Time'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.65rem 1.25rem', fontSize: 11, fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {log.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No activity yet.</td></tr>
              )}
              {log.map(l => (
                <tr key={l.id}>
                  <td style={{ padding: '0.85rem 1.25rem', fontSize: 13, color: 'var(--text)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{l.investor_email}</td>
                  <td style={{ padding: '0.85rem 1.25rem', fontSize: 13, color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>{l.section_key || '—'}</td>
                  <td style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ ...eventBadge(l.event), padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l.event}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)', borderBottom: '1px solid var(--border)' }}>{formatDate(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
