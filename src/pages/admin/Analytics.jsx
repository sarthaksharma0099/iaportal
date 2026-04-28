import React, { useEffect, useState } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Dots } from '../../components/UI';

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Analytics() {
  const [log, setLog]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabaseAdmin.from('access_log').select('*').order('created_at', { ascending: false }).limit(300);
    setLog(data || []);
    setLoading(false);
  }

  const logins  = log.filter(l => l.event === 'login').length;
  const views   = log.filter(l => l.event === 'view').length;
  const unique  = new Set(log.map(l => l.investor_email)).size;

  // Section breakdown
  const sectionMap = {};
  log.filter(l => l.section_key).forEach(l => {
    sectionMap[l.section_key] = (sectionMap[l.section_key] || 0) + 1;
  });
  const topSections = Object.entries(sectionMap).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { v: logins, l: 'Total Logins' },
          { v: views,  l: 'Section Views' },
          { v: unique, l: 'Unique Investors' },
        ].map(s => (
          <div key={s.l} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 300, color: '#fff', marginBottom: 4 }}>{loading ? <Dots /> : s.v}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Top sections */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Top Sections</div>
          <div style={{ padding: '0.5rem 0' }}>
            {topSections.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No data yet.</div>}
            {topSections.map(([key, count]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1.25rem' }}>
                <span style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--mono)' }}>{key}</span>
                <span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 500 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Full log */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', maxHeight: 500, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Full Log</div>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}><Dots /></div>
          ) : (
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg3)', zIndex: 1 }}>
                  <tr>
                    {['Investor', 'Section', 'Event', 'Time'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.65rem 1.25rem', fontSize: 11, fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {log.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No events yet.</td></tr>
                  )}
                  {log.map(l => (
                    <tr key={l.id}>
                      <td style={{ padding: '0.7rem 1.25rem', fontSize: 12, color: 'var(--text)', fontFamily: 'var(--mono)', borderBottom: '1px solid var(--border)' }}>{l.investor_email}</td>
                      <td style={{ padding: '0.7rem 1.25rem', fontSize: 12, color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>{l.section_key || '—'}</td>
                      <td style={{ padding: '0.7rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em',
                          ...(l.event === 'login'
                            ? { background: 'rgba(74,174,140,0.1)', color: '#6fcfb0', border: '1px solid rgba(74,174,140,0.2)' }
                            : { background: 'rgba(201,168,76,0.08)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.15)' }
                          )
                        }}>{l.event}</span>
                      </td>
                      <td style={{ padding: '0.7rem 1.25rem', fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{fmt(l.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
