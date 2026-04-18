import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Badge, Dots } from '../../components/UI';





export default function Portal({ email, onSignOut }) {
  const navigate = useNavigate();
  const [sections, setSections]   = useState([]);
  const [content, setContent]     = useState({});
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [secRes, conRes] = await Promise.all([
      supabase.from('portal_sections').select('*').eq('is_visible', true).order('sort_order'),
      supabase.from('content_blocks').select('*'),
    ]);
    setSections(secRes.data || []);
    // Build content map: { section_key: { block_key: value } }
    const map = {};
    (conRes.data || []).forEach(b => {
      if (!map[b.section_key]) map[b.section_key] = {};
      map[b.section_key][b.block_key] = b.value;
    });
    setContent(map);
    setLoading(false);
  }

  function handleSectionClick(section) {
    supabase.from('access_log').insert({
      investor_email: email,
      section_key: section.key,
      event: 'view'
    });

    const type = section.section_type || section.key;

    if (type === 'pitch_deck' || 
        section.key === 'pitch_deck') {
      navigate('/deck');
    } else if (type === 'team' || 
               section.key === 'team') {
      navigate('/team');
    } else if (type === 'portfolio' || 
               section.key === 'portfolio') {
      navigate('/portfolio');
    } else if (type === 'financials' || 
               section.key === 'financials') {
      navigate('/financials');
    } else if (type === 'programs' || 
               section.key === 'programs') {
      navigate('/programs');
    } else if (type === 'theses' || 
               section.key === 'theses') {
      navigate('/theses');
    }
  }

  const hero    = content['hero']       || {};
  const fin     = content['financials'] || {};
  const gridSec = sections.filter(s => s.key !== 'hero');





  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: -200, left: -100, width: 700, height: 700, borderRadius: '50%', background: 'rgba(201,168,76,0.035)', filter: 'blur(130px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '5%', right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(74,174,140,0.025)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 64, padding: '0 2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,10,8,0.88)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>◈</div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>India Accelerator</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{email}</span>
          <Badge variant="approved">Investor</Badge>
          <button onClick={onSignOut} style={{ fontSize: 12, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 64 }}>
        {loading ? (
          <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Dots />
          </div>
        ) : (
          <>
            {/* ── Hero ── */}
            <section style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 4rem 80px' }}>
              <div className="fade-up" style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 500, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 32, height: 1, background: 'var(--gold)', display: 'block' }} />
                {hero.stage || 'Investor Materials'}
              </div>
              <h1 className="fade-up d1" style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(48px,7vw,86px)', fontWeight: 300, lineHeight: 1.0, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
                {hero.fund_name || 'India Accelerator'}<br />
                <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>{hero.tagline_short || 'Investor Portal'}</em>
              </h1>
              <p className="fade-up d2" style={{ fontSize: 17, color: 'var(--text2)', maxWidth: 520, lineHeight: 1.7, marginBottom: '3.5rem' }}>
                {hero.tagline || 'Building the next generation of Indian founders.'}
              </p>

              {/* Stats */}
              <div className="fade-up d3" style={{
                display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
                border: '1px solid var(--border)', borderRadius: 16,
                overflow: 'hidden', maxWidth: 700, background: 'var(--border)',
                gap: 1,
              }}>
                {[
                  { v: hero.stat1_value || '5,344+', l: hero.stat1_label || 'Applications' },
                  { v: hero.stat2_value || '11',     l: hero.stat2_label || 'Programs' },
                  { v: hero.stat3_value || '318',    l: hero.stat3_label || 'Pipeline' },
                  { v: hero.stat4_value || '6',      l: hero.stat4_label || 'Theses' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'var(--bg2)', padding: '1.75rem 1.5rem' }}>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 300, color: '#fff', lineHeight: 1, marginBottom: 6 }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--border)', maxWidth: 1200, margin: '0 auto' }} />

            {/* ── Materials Grid ── */}
            <section style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 500, marginBottom: 8 }}>Materials</div>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 40, fontWeight: 300, color: '#fff', lineHeight: 1.1 }}>Investor Documents</h2>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text2)', maxWidth: 340, lineHeight: 1.6, textAlign: 'right', marginTop: 4 }}>
                  Access our pitch deck, financials, portfolio, and due diligence materials.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: 1, background: 'var(--border)',
                border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden',
              }}>
                {gridSec.length === 0 && (
                  <div style={{ padding: '3rem', color: 'var(--text3)', fontSize: 13 }}>No sections configured yet.</div>
                )}
                {gridSec.map(s => (
                  <MaterialCard key={s.id} section={s} onView={() => handleSectionClick(s)} />
                ))}
              </div>
            </section>

            {/* ── Financials ── */}
            {Object.keys(fin).length > 0 && (
              <>
                <div style={{ height: 1, background: 'var(--border)', maxWidth: 1200, margin: '0 auto' }} />
                <section style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 4rem' }}>
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 500, marginBottom: 8 }}>Performance</div>
                    <h2 style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 300, color: '#fff' }}>Financial Overview</h2>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
                    {Object.entries(fin).map(([k, v]) => (
                      <div key={k} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 300, color: '#fff', marginBottom: 6 }}>{v}</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k.replace(/_/g, ' ')}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Footer */}
            <div style={{ height: 1, background: 'var(--border)', maxWidth: 1200, margin: '0 auto' }} />
            <footer style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>© 2026 India Accelerator. Confidential — For intended recipients only.</span>
              <a href="mailto:invest@indiaaccelerator.co" style={{ fontSize: 12, color: 'var(--gold)' }}>invest@indiaaccelerator.co</a>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

function MaterialCard({ section, onView }) {
  const isLive = section.badge === 'Live';
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={isLive ? onView : undefined}
      style={{
        background: hovered && isLive ? 'var(--bg3)' : 'var(--bg2)',
        padding: '2rem', cursor: isLive ? 'pointer' : 'default',
        opacity: isLive ? 1 : 0.55,
        position: 'relative', overflow: 'hidden',
        transition: 'background 0.2s',
      }}
    >
      {hovered && isLive && (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(201,168,76,0.05),transparent)', pointerEvents: 'none' }} />
      )}
      <Badge variant={isLive ? 'live' : 'soon'}>{section.badge || 'Soon'}</Badge>
      <div style={{ fontSize: 28, marginTop: '1.25rem', marginBottom: '0.75rem', opacity: 0.7 }}>{section.icon || '◈'}</div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>{section.title}</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{section.description}</div>
      {isLive && (
        <div style={{ position: 'absolute', bottom: '1.25rem', right: '1.25rem', fontSize: 18, color: hovered ? 'var(--gold)' : 'var(--text3)', transition: 'all 0.2s', transform: hovered ? 'translate(3px,-3px)' : 'none' }}>↗</div>
      )}
    </div>
  );
}

