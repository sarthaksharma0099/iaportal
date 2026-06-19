import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../components/UI';

export default function ThesesEcosystemPage({ email }) {
  const navigate = useNavigate();
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

  const stats = [
    { value: '4', label: 'Thesis Areas' },
    { value: '150+', label: 'Mentors' },
    { value: '250+', label: 'Startups' },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 15, color: '#9e9b92' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a08', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      {/* TOP BAR */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 100,
        background: 'rgba(10,10,8,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: '#c9a84c', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
        >
          ← Back to Portal
        </button>
        <div style={{ fontSize: 13, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
          INVESTMENT THESES
        </div>
        <div style={{ fontSize: 13, color: '#00B4A6' }}>IA Multiverse</div>
      </div>

      <div style={{ paddingTop: 64 }}>
        {/* HERO SECTION */}
        <div style={{ padding: '80px 80px 60px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 1, background: '#c9a84c' }} />
            <span style={{ fontSize: 11, color: '#c9a84c', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>FOUNDER SUCCESS</span>
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 64, fontWeight: 300, marginBottom: 16, color: '#fff' }}>
            Investment Theses
          </h1>

          <div style={{ display: 'flex', gap: 0, alignItems: 'stretch', marginTop: 48 }}>
            {stats.map((s, i) => (
              <React.Fragment key={i}>
                <div style={{ padding: '0 32px', textAlign: 'center', minWidth: 120 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: '#c9a84c', fontWeight: 300, lineHeight: 1, marginBottom: 8 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 11, color: '#9e9b92', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {s.label}
                  </div>
                </div>
                {i < stats.length - 1 && (
                  <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* THESIS CARDS SECTION */}
        <div style={{ padding: '60px 80px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, color: '#c9a84c', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
            OUR THESES
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: '#fff', marginBottom: 40 }}>
            Four Theses. One Platform.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {theses.map(t => (
              <div
                key={t.id}
                style={{
                  background: '#111110',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderLeft: `4px solid ${t.color}`,
                  borderRadius: '0 16px 16px 0',
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: '#fff', margin: 0 }}>{t.name}</h3>
                  <Badge variant="live">{t.code}</Badge>
                </div>

                {t.description && (
                  <p style={{ fontSize: 14, color: '#9e9b92', lineHeight: 1.6, margin: '0 0 16px' }}>{t.description}</p>
                )}

                {t.focus_areas && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {t.focus_areas.split(',').map((area, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '3px 10px',
                          borderRadius: 4,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          fontSize: 12,
                          color: '#fff'
                        }}
                      >
                        {area.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 'auto', marginBottom: 8 }}>
                  {t.company_count} companies
                </div>

                {t.pdf_url ? (
                  <a
                    href={t.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      marginTop: 20,
                      padding: '10px 20px',
                      borderRadius: 8,
                      background: 'rgba(201,168,76,0.1)',
                      border: '1px solid rgba(201,168,76,0.3)',
                      color: '#c9a84c',
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    ↗ Open Thesis PDF
                  </a>
                ) : (
                  <div style={{ marginTop: 20, fontSize: 12, color: '#5c5a54' }}>PDF coming soon</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PORTFOLIO COMPANIES SECTION */}
        <div style={{ padding: '60px 80px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, color: '#c9a84c', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
            PORTFOLIO
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: '#fff' }}>
            Companies Across Theses
          </h2>

          {theses.find(t => t.portfolio_image_url) && (
            <img
              src={theses.find(t => t.portfolio_image_url).portfolio_image_url}
              alt="Portfolio companies"
              style={{
                width: '100%',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.06)',
                marginTop: 32,
              }}
            />
          )}
        </div>

        {/* FOOTER */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '32px 80px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: 14, color: '#9e9b92' }}>
            © 2026 India Accelerator — Confidential
          </span>
          <a
            href="mailto:invest@indiaaccelerator.co"
            style={{ fontSize: 14, color: '#c9a84c', textDecoration: 'none' }}
          >
            invest@indiaaccelerator.co
          </a>
        </div>
      </div>
    </div>
  );
}
