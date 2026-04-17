import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Badge, Dots } from '../../components/UI';
import PitchDeck from './PitchDeck';
import TeamPage  from './TeamPage';
import Financials from './Financials';
import Portfolio from './Portfolio';
import ProgramsPage from './ProgramsPage';
import ThesesPage from './ThesesPage';





export default function Portal({ email, onSignOut }) {
  const [sections, setSections]   = useState([]);
  const [content, setContent]     = useState({});
  const [loading, setLoading]     = useState(true);
  const [viewingSection, setViewingSection] = useState(null);
  const [showDeck, setShowDeck]     = useState(false);
  const [showTeam, setShowTeam]     = useState(false);
  const [showFinancials, setShowFinancials] = useState(false);
  const [showPortfolio, setShowPortfolio]   = useState(false);
  const [showPrograms, setShowPrograms]     = useState(false);
  const [showTheses, setShowTheses]         = useState(false);





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

  useEffect(() => {
    if (showTeam) {
      supabase.from('access_log').insert({ 
        investor_email: email, 
        section_key: 'team_page', 
        event: 'view' 
      }).then(() => {});
    }
  }, [showTeam, email]);

  useEffect(() => {
    if (showFinancials) {
      supabase.from('access_log').insert({ 
        investor_email: email, 
        section_key: 'financials', 
        event: 'view' 
      }).then(() => {});
    }
  }, [showFinancials, email]);

  useEffect(() => {
    if (showPortfolio) {
      supabase.from('access_log').insert({ 
        investor_email: email, 
        section_key: 'portfolio', 
        event: 'view' 
      }).then(() => {});
    }
  }, [showPortfolio, email]);

  useEffect(() => {
    if (showPrograms) {
      supabase.from('access_log').insert({ 
        investor_email: email, 
        section_key: 'programs', 
        event: 'view' 
      }).then(() => {});
    }
  }, [showPrograms, email]);

  useEffect(() => {
    if (showTheses) {
      supabase.from('access_log').insert({ 
        investor_email: email, 
        section_key: 'theses', 
        event: 'view' 
      }).then(() => {});
    }
  }, [showTheses, email]);





  async function trackView(sectionKey) {
    await supabase.from('access_log').insert({ investor_email: email, section_key: sectionKey, event: 'view' });
  }

  const handleSectionClick = (s) => {
    trackView(s.key);
    const title = s.title.toLowerCase();
    const type = s.section_type;

    if (type === 'team' || title.includes('team') || title.includes('leadership')) {
      setShowTeam(true);
    } else if (type === 'pitch_deck' || title.includes('pitch deck') || title.includes('deck')) {
      setShowDeck(true);
    } else if (type === 'financials' || title.includes('financial')) {
      setShowFinancials(true);
    } else if (type === 'portfolio' || title.includes('portfolio')) {
      setShowPortfolio(true);
    } else if (type === 'programs' || title.includes('program')) {
      setShowPrograms(true);
    } else if (type === 'theses' || title.includes('theses') || title.includes('focus')) {
      setShowTheses(true);
    } else {
      setViewingSection(s);
    }
  };



  const hero    = content['hero']       || {};
  const fin     = content['financials'] || {};
  const gridSec = sections.filter(s => s.key !== 'hero');

  if (showDeck) return <PitchDeck onBack={() => setShowDeck(false)} />;
  if (showTeam) return <TeamPage onBack={() => setShowTeam(false)} email={email} />;
  if (showFinancials) return <Financials onBack={() => setShowFinancials(false)} email={email} />;
  if (showPortfolio) return <Portfolio onBack={() => setShowPortfolio(false)} email={email} />;
  if (showPrograms) return <ProgramsPage onBack={() => setShowPrograms(false)} />;
  if (showTheses) return <ThesesPage onBack={() => setShowTheses(false)} />;





  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: -200, left: -100, width: 700, height: 700, borderRadius: '50%', background: 'rgba(201,168,76,0.035)', filter: 'blur(130px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '5%', right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(74,174,140,0.025)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* PDF Viewer Overlay */}
      {viewingSection && (
        <PDFViewer
          section={viewingSection}
          content={content[viewingSection.key] || {}}
          onBack={() => setViewingSection(null)}
        />
      )}

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

function PDFViewer({ section, content, onBack }) {
  const [activeUrl, setActiveUrl] = useState(null);

  // Extract all docs from 1 to 10
  const docs = [];
  for (let i = 1; i <= 10; i++) {
    const url = content[`pdf_${i}_url` ];
    const name = content[`pdf_${i}_name` ] || `Document ${i}`;
    if (url) docs.push({ url, name, id: i });
  }

  const handleBack = () => {
    if (activeUrl) setActiveUrl(null);
    else onBack();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'var(--bg)', display: 'flex', flexDirection: 'column',
      animation: 'fadeIn 0.3s ease forwards',
    }}>
      {/* Header */}
      <div style={{
        position: 'relative', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderBottom: '1px solid var(--border)', padding: '0 2rem',
        background: 'rgba(10,10,8,0.85)', backdropFilter: 'blur(12px)',
      }}>
        <button
          onClick={handleBack}
          style={{
            position: 'absolute', left: '2rem',
            background: 'none', border: '1px solid var(--border)', borderRadius: 8,
            padding: '8px 16px', color: 'var(--text2)', fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.color = '#fff'; }}
          onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text2)'; }}
        >
          <span style={{ fontSize: 18 }}>←</span> {activeUrl ? 'Back to List' : 'Back to Portal'}
        </button>

        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: '#fff',
          fontWeight: 400, letterSpacing: '0.01em',
        }}>
          {activeUrl ? section.title : `${section.title} Materials`}
        </div>
      </div>

      {/* Content Body */}
      <div style={{ flex: 1, overflowY: activeUrl ? 'hidden' : 'auto', background: activeUrl ? '#000' : 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        {activeUrl ? (
          <iframe
            src={activeUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={section.title}
          />
        ) : docs.length > 0 ? (
          <div style={{ maxWidth: 800, width: '100%', margin: '0 auto', padding: '4rem 2rem', animation: 'fadeUp 0.6s ease' }}>
            <div style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 500, marginBottom: '2rem', textAlign: 'center' }}>
              Available Documents
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {docs.map(doc => (
                <div key={doc.id} style={{
                  background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
                  padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'transform 0.2s, border-color 0.2s', cursor: 'default'
                }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ fontSize: 32, opacity: 0.5 }}>📄</div>
                    <div>
                      <div style={{ fontSize: 17, color: '#fff', fontWeight: 400, fontFamily: 'var(--serif)', marginBottom: 4 }}>{doc.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>PDF · Resource</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveUrl(doc.url)}
                    style={{
                      background: 'var(--gold-dim)', border: '1px solid var(--gold)', color: 'var(--gold)',
                      padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.target.style.background = 'var(--gold)'; e.target.style.color = '#000'; }}
                    onMouseLeave={e => { e.target.style.background = 'var(--gold-dim)'; e.target.style.color = 'var(--gold)'; }}
                  >
                    Open Document
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', padding: '4rem', animation: 'fadeUp 0.6s ease' }}>
              <div style={{ fontSize: 56, marginBottom: '2rem', opacity: 0.2 }}>{section.icon || '◈'}</div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 32, color: '#fff', marginBottom: 12, fontWeight: 300 }}>
                Content coming soon
              </h3>
              <p style={{ color: 'var(--text3)', fontSize: 14, maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>
                We are currently finalizing the materials for the <strong>{section.title}</strong> section. Please check back shortly.
              </p>
              <button
                onClick={onBack}
                style={{ marginTop: '2.5rem', background: 'var(--gold-dim)', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '10px 24px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
              >
                Return Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
