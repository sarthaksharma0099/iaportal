import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Dots, Badge } from '../../components/UI';

export default function ThesesPage({ onBack }) {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('investment_theses')
          .select('*')
          .eq('is_visible', true)
          .order('name');
        if (error) throw error;
        setTheses(data || []);
      } catch (e) {
        console.error('Error loading theses:', e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
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
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#c9a84c', fontSize: 15, cursor: 'pointer' }}>
          ← Back to Portal
        </button>
        <div style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)' }}>
          Investment Theses
        </div>
        <div style={{ fontSize: 15, color: '#00B4A6' }}>India Accelerator</div>
      </nav>

      <div style={{ paddingTop: 64 }}>
        <section style={{ padding: '80px 80px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 32, height: 1, background: '#c9a84c' }} />
            <div style={{ fontSize: 13, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.15em' }}>OUR FOCUS</div>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 64, fontWeight: 300, lineHeight: 1.1, margin: 0 }}>
            The Theses Driving<br />vAlpha Returns.
          </h1>
        </section>

        <section style={{ padding: '0 80px 80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
            {theses.map(t => (
              <div key={t.id} style={{ 
                background: '#111110', border: '1px solid rgba(255,255,255,0.08)', 
                borderLeft: `4px solid ${t.color}`,
                borderRadius: '0 16px 16px 0', padding: 40, display: 'flex', flexDirection: 'column', gap: 24 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: '#fff', margin: 0 }}>{t.name}</h3>
                  <Badge variant="live">{t.code}</Badge>
                </div>
                <p style={{ color: '#9e9b92', fontSize: 16, lineHeight: 1.7, margin: 0 }}>{t.description}</p>
                <div>
                  <div style={{ fontSize: 11, color: t.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, fontWeight: 600 }}>Focus Areas</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {t.focus_areas.split(',').map((area, idx) => (
                      <div key={idx} style={{ 
                        padding: '4px 12px', borderRadius: 4, background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.06)', fontSize: 13, color: '#fff' 
                      }}>
                        {area.trim()}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 32, fontFamily: "'Cormorant Garamond', serif", color: t.color }}>{t.company_count}</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Grid<br />Companies</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
