import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Badge, Dots } from '../../components/UI';

function cleanDescription(section) {
  const desc = section.description || ''
  if (
    desc.includes('http') ||
    desc.includes('https') ||
    desc.includes('docs.google') ||
    desc.includes('spreadsheet') ||
    desc.includes('drive.google') ||
    desc.startsWith('http')
  ) {
    const defaults = {
      pitch_deck: 'Full pitch deck — market opportunity, product, traction and team',
      financials: 'Interactive financial projections — revenue, portfolio performance and fund metrics',
      portfolio: 'Active portfolio companies across all investment theses',
      team: 'Leadership team, thesis owners and mentor board',
      programs: 'Active accelerator programs and cohorts',
      theses: 'Our 6 investment thesis areas and portfolio allocation',
      presence: 'Pan-India and global footprint — 30+ hubs across 16 cities and 8 countries',
      documents: 'Legal, compliance and governance documentation',
      hero: 'Fund overview, headline metrics, and thesis',
    }
    return defaults[section.key] || 'View details'
  }
  return desc
}

// SVG Math Helpers
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  }
}

function segmentPath(cx, cy, r1, r2, startAngle, endAngle) {
  const s1 = polarToCartesian(cx, cy, r1, startAngle)
  const e1 = polarToCartesian(cx, cy, r1, endAngle)
  const s2 = polarToCartesian(cx, cy, r2, startAngle)
  const e2 = polarToCartesian(cx, cy, r2, endAngle)
  return [
    `M ${s1.x} ${s1.y}`,
    `A ${r1} ${r1} 0 0 1 ${e1.x} ${e1.y}`,
    `L ${e2.x} ${e2.y}`,
    `A ${r2} ${r2} 0 0 0 ${s2.x} ${s2.y}`,
    'Z'
  ].join(' ')
}

export default function Portal({ email, onSignOut }) {
  const isMobile = window.innerWidth <= 768;
  const navigate = useNavigate();
  const [sections, setSections]   = useState([]);
  const [content, setContent]     = useState({});
  // eslint-disable-next-line no-unused-vars
  const [ecosystem, setEcosystem] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [hoveredSegment, setHoveredSegment] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [secRes, conRes, ecoRes] = await Promise.all([
      supabase.from('portal_sections').select('*').eq('is_visible', true).order('sort_order'),
      supabase.from('content_blocks').select('block_key, value').eq('section_key', 'hero'),
      supabase.from('ecosystem_verticals').select('key, title, color, stats, is_visible').eq('is_visible', true).order('sort_order')
    ]);
    
    setSections(secRes.data || []);
    setEcosystem(ecoRes.data || []);
    
    const map = {};
    (conRes.data || []).forEach(b => {
      if (!map['hero']) map['hero'] = {};
      map['hero'][b.block_key] = b.value;
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

    if (type === 'pitch_deck' || section.key === 'pitch_deck') {
      navigate('/deck');
    } else if (type === 'team' || section.key === 'team') {
      navigate('/team');
    } else if (type === 'portfolio' || section.key === 'portfolio') {
      navigate('/portfolio');
    } else if (type === 'financials' || section.key === 'financials') {
      navigate('/financials');
    } else if (type === 'programs' || section.key === 'programs') {
      navigate('/programs');
    } else if (type === 'theses' || section.key === 'theses') {
      navigate('/theses');
    } else if (type === 'presence' || section.key === 'presence' || section.title?.toLowerCase().includes('presence')) {
      navigate('/presence');
    } else {
      navigate(`/section/${section.key}`);
    }
  }

  const hero    = content['hero']       || {};
  const fin     = content['financials'] || {};
  const gridSec = sections.filter(s => s.key !== 'hero');

  // Inner ring configuration (3 segments, 120 degrees each)
  const wheelInnerConfig = [
    { key: 'founder_capital', title: 'Founder Capital', startAngle: 240, color: '#2d6d56' },
    { key: 'founder_access',  title: 'Founder Access',  startAngle: 0,   color: '#008379' },
    { key: 'founder_success', title: 'Founder Success', startAngle: 120, color: '#9d8033' }
  ];

  // Outer ring configuration (8 segments, dynamic angles to align with inner segments)
  const wheelOuterConfig = [
    { key: 'finvolve', title: 'Finvolve & Funds', group: 'founder_capital', color: '#4aae8c', lines: ['Finvolve &', 'Funds'], startAngle: 240, angleSpan: 120 },
    { key: 'spaces', title: 'Spaces', group: 'founder_access', color: '#009e92', lines: ['Spaces'], startAngle: 0, angleSpan: 40 },
    { key: 'vas', title: 'Value Added Services', group: 'founder_access', color: '#00887e', lines: ['Value Added', 'Services'], startAngle: 40, angleSpan: 40 },
    { key: 'academia_corporate_programs', title: 'Academia & Corporate Programs', group: 'founder_access', color: '#00d0c0', lines: ['Academia &', 'Corporate', 'Programs'], startAngle: 80, angleSpan: 40 },
    { key: 'starlink', title: 'Starlink', group: 'founder_success', color: '#c9a84c', lines: ['Starlink'], startAngle: 120, angleSpan: 30 },
    { key: 'page', title: 'Portfolio & Growth Engine (PAGE)', group: 'founder_success', color: '#b59640', lines: ['Portfolio &', 'Growth Engine', '(PAGE)'], startAngle: 150, angleSpan: 30 },
    { key: 'coes', title: 'CoEs', group: 'founder_success', color: '#9c8031', lines: ['CoEs'], startAngle: 180, angleSpan: 30 },
    { key: 'theses', title: 'Theses', group: 'founder_success', color: '#dfc05d', lines: ['Theses'], startAngle: 210, angleSpan: 30 }
  ];

  const outerSegments = wheelOuterConfig.map(seg => ({
    ...seg
  }));



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
            <section style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '60px 1.5rem 40px' : '100px 4rem 48px' }}>
              <div className="fade-up" style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 500, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 32, height: 1, background: 'var(--gold)', display: 'block' }} />
                {hero.stage || 'Investor Materials'}
              </div>
              <h1 className="fade-up d1" style={{ fontFamily: 'var(--serif)', fontSize: isMobile ? '48px' : '96px', fontWeight: 300, lineHeight: 0.9, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
                {hero.fund_name || 'India Accelerator'}<br />
                <em style={{ color: 'var(--gold)', fontStyle: 'italic', fontSize: isMobile ? '48px' : '96px' }}>{hero.tagline_short || 'Investor Portal'}</em>
              </h1>
              <p className="fade-up d2" style={{ fontSize: isMobile ? 15 : 22, color: 'var(--text2)', maxWidth: 650, lineHeight: 1.6, marginBottom: '4rem' }}>
                {hero.tagline || 'Building the next generation of Indian founders.'}
              </p>

              {/* Stats */}
              <div className="fade-up d3" style={{
                display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
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
                  <div key={i} style={{ 
                    background: 'var(--bg2)', 
                    padding: '1.75rem 1.25rem',
                    minWidth: 0,
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      fontFamily: 'var(--serif)', 
                      fontSize: isMobile ? 22 : 36, 
                      fontWeight: 300, 
                      color: '#fff', 
                      lineHeight: 1, 
                      marginBottom: 6,
                      whiteSpace: isMobile ? 'normal' : 'nowrap',
                      overflow: isMobile ? 'visible' : 'hidden',
                      textOverflow: isMobile ? 'clip' : 'ellipsis'
                    }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--border)', maxWidth: 1200, margin: '0 auto' }} />

            {/* ── ECOSYSTEM WHEEL ── */}
            <section style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '40px 1.5rem 32px' : '32px 4rem 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <div style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 500, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <span style={{ width: 32, height: 1, background: 'var(--gold)', display: 'block' }} />
                  IA ECOSYSTEM
                </div>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: isMobile ? 28 : 42, fontWeight: 300, color: '#fff', marginBottom: 12 }}>The IA Multiverse</h2>
                <p style={{ fontSize: 15, color: '#9e9b92', maxWidth: 500, margin: '12px auto 0' }}>Three pillars, nine verticals — powering India's founder ecosystem</p>
              </div>

              <div 
                style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <svg viewBox="0 0 600 600" style={{ width: '100%', maxWidth: 680, display: 'block', margin: '0 auto', overflow: 'visible' }}>
                  {/* Center Circle */}
                  <circle cx={300} cy={300} r={80} fill="#111110" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                  <foreignObject
                    x={235}
                    y={255}
                    width={130}
                    height={90}
                  >
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <img
                        src="/images/logos/ialogo.jpeg"
                        alt="India Accelerator"
                        style={{
                          width: '90px',
                          height: 'auto',
                          objectFit: 'contain',
                          filter: 'brightness(1.1)',
                        }}
                      />
                    </div>
                  </foreignObject>

                  {/* Inner Ring (3 segments, decorative only) */}
                  {wheelInnerConfig.map(seg => {
                    const midAngle = seg.startAngle + 60;
                    const midPointLabel = polarToCartesian(300, 300, 130, midAngle);

                    return (
                      <g key={seg.key}>
                        <path
                          d={segmentPath(300, 300, 96, 164, seg.startAngle + 3, seg.startAngle + 120 - 3)}
                          fill={seg.color}
                          stroke={seg.color}
                          strokeWidth={8}
                          strokeLinejoin="round"
                          style={{ pointerEvents: 'none' }}
                        />
                        <text
                          x={midPointLabel.x}
                          y={midPointLabel.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize={12}
                          fontFamily="'DM Sans', sans-serif"
                          fontWeight={600}
                          style={{ pointerEvents: 'none' }}
                          transform={`rotate(${midAngle + (midAngle > 90 && midAngle < 270 ? 180 : 0)}, ${midPointLabel.x}, ${midPointLabel.y})`}
                        >
                          {seg.title}
                        </text>
                      </g>
                    );
                  })}

                  {/* Outer Ring (9 segments, clickable) */}
                  {outerSegments.map(seg => {
                    const midAngle = seg.startAngle + seg.angleSpan / 2;
                    const midPointLabel = polarToCartesian(300, 300, 220, midAngle);
                    const lines = seg.lines || [seg.title];

                    return (
                      <g key={seg.key}>
                        <path
                          d={segmentPath(300, 300, 184, 256, seg.startAngle + 1.5, seg.startAngle + seg.angleSpan - 1.5)}
                          fill={hoveredSegment === seg.key ? seg.color : seg.color + '99'}
                          stroke={hoveredSegment === seg.key ? seg.color : seg.color + '99'}
                          strokeWidth={8}
                          strokeLinejoin="round"
                          style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                          onMouseEnter={() => setHoveredSegment(seg.key)}
                          onClick={() => navigate(`/ecosystem/${seg.key}`)}
                        />
                        <text
                          x={midPointLabel.x}
                          y={midPointLabel.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize={9.5}
                          fontFamily="'DM Sans', sans-serif"
                          fontWeight={600}
                          style={{ pointerEvents: 'none' }}
                          transform={`rotate(${midAngle + (midAngle > 90 && midAngle < 270 ? 180 : 0)}, ${midPointLabel.x}, ${midPointLabel.y})`}
                        >
                          {lines.map((line, idx) => (
                            <tspan
                              key={idx}
                              x={midPointLabel.x}
                              dy={idx === 0 ? `${-(lines.length - 1) * 0.6}em` : '1.2em'}
                            >
                              {line}
                            </tspan>
                          ))}
                        </text>
                      </g>
                    );
                  })}
                </svg>


              </div>
            </section>

            {/* ── Materials Grid ── */}
            <section style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '3rem 1.5rem' : '3rem 4rem 5rem' }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 12 : 0, justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 500, marginBottom: 8 }}>Materials</div>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 40, fontWeight: 300, color: '#fff', lineHeight: 1.1 }}>Investor Documents</h2>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text2)', maxWidth: 340, lineHeight: 1.6, textAlign: isMobile ? 'left' : 'right', marginTop: 4 }}>
                  Access our pitch deck, financials, portfolio, and due diligence materials.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)',
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
      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{cleanDescription(section)}</div>
      {isLive && (
        <div style={{ position: 'absolute', bottom: '1.25rem', right: '1.25rem', fontSize: 18, color: hovered ? 'var(--gold)' : 'var(--text3)', transition: 'all 0.2s', transform: hovered ? 'translate(3px,-3px)' : 'none' }}>↗</div>
      )}
    </div>
  );
}
