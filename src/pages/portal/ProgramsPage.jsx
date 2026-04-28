import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Dots, Badge } from '../../components/UI';

export default function ProgramsPage({ onBack }) {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('*')
          .eq('is_visible', true)
          .order('name');
        if (error) throw error;
        if (!cancelled) setPrograms(data || []);
      } catch (e) {
        console.error('Error loading programs:', e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0a08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Dots /></div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a08', color: '#ffffff', fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', background: 'rgba(10,10,8,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#c9a84c', fontSize: 15, cursor: 'pointer' }}>
          ← Back to Portal
        </button>
        <div style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)' }}>
          Accelerator Programs
        </div>
        <div style={{ fontSize: 15, color: '#00B4A6' }}>India Accelerator</div>
      </nav>

      <div style={{ paddingTop: 64 }}>
        <section style={{ padding: '80px 80px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 32, height: 1, background: '#c9a84c' }} />
            <div style={{ fontSize: 13, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.15em' }}>PROGRAMS</div>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 64, fontWeight: 300, lineHeight: 1.1, margin: 0 }}>
            Fueling Innovation<br />Across India.
          </h1>
        </section>

        <section style={{ padding: '0 80px 80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {programs.map(p => (
              <div key={p.id} style={{ 
                background: '#111110', border: '1px solid rgba(255,255,255,0.08)', 
                borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: 20, color: '#fff', margin: 0 }}>{p.name}</h3>
                  <Badge variant={p.status === 'Active' ? 'live' : p.status === 'Closed' ? 'revoked' : 'soon'}>
                    {p.status}
                  </Badge>
                </div>
                <p style={{ color: '#9e9b92', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{p.description}</p>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                    Applications: <span style={{ color: '#fff', fontWeight: 500 }}>{p.app_count}</span>
                  </div>
                  {p.start_date && (
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                      {p.start_date}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {programs.length === 0 && (
            <div style={{ padding: '100px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>◫</div>
              <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.3)' }}>No programs currently listed.</div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
