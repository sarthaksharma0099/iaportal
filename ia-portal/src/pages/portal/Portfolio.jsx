import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Dots } from '../../components/UI';

const SECTORS = [
  'All', 'Defence & Aerospace', 'Energy & Mobility', 'Frontier Tech', 'Fintech', 
  'Healthtech', 'eCommerce & D2C', 'Media', 'Legaltech', 'Gaming', 'Manufacturing', 'SaaS'
];

const STAGES = ['All Stages', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Pre-IPO', 'Growth'];

export default function Portfolio({ onBack }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeStage, setActiveStage] = useState('All Stages');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  async function loadPortfolio() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('portfolio_companies')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      setCompanies(data || []);
    } catch (e) {
      console.error('Error loading portfolio:', e.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredPortfolio = companies.filter(item => {
    const sectorMatch = activeFilter === 'All' || item.sector === activeFilter;
    const stageMatch = activeStage === 'All Stages' || item.stage === activeStage;
    return sectorMatch && stageMatch;
  });

  const featuredCompanies = companies.filter(c => c.is_featured);

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Seed': return { bg: 'rgba(0,180,166,0.1)', color: '#00B4A6' };
      case 'Pre-IPO': return { bg: 'rgba(201,168,76,0.1)', color: '#c9a84c' };
      case 'Growth': return { bg: 'rgba(130,100,220,0.1)', color: '#b09be8' };
      default: return { bg: 'rgba(255,255,255,0.05)', color: '#9e9b92' };
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0a08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Dots /></div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a08', color: '#ffffff', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top Bar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 1000,
        padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,10,8,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <button onClick={onBack} style={{ fontSize: 15, color: '#c9a84c', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Back to Portal
        </button>
        <div style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)' }}>
          Portfolio Companies
        </div>
        <div style={{ fontSize: 15, color: '#00B4A6' }}>India Accelerator</div>
      </nav>

      <div style={{ paddingTop: 64 }}>
        {/* Hero Section */}
        <section style={{ padding: '80px 80px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 32, height: 1, background: '#c9a84c' }} />
            <div style={{ fontSize: 13, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.15em' }}>OUR PORTFOLIO</div>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 64, fontWeight: 300, lineHeight: 1.1, margin: 0 }}>
            {companies.length > 200 ? '263' : companies.length} Companies.
          </h1>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 64, fontWeight: 300, fontStyle: 'italic', color: '#00B4A6', lineHeight: 1.1, marginBottom: 20 }}>
            2 Unicorns. 9 Exits.
          </h1>

          <div style={{ display: 'flex', gap: 16, marginBottom: 48 }}>
            {[
              { v: companies.length, label: 'Companies Backed' },
              { v: '2', label: 'Unicorns' },
              { v: '9', label: 'Portfolio Exits' },
              { v: companies.filter(c => c.stage !== 'Exit').length, label: 'Active Investments' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 40, padding: '10px 24px', fontSize: 14, color: '#9e9b92'
              }}>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{s.v}</span> {s.label}
              </div>
            ))}
          </div>
        </section>

        {/* Filter Bar */}
        <div style={{ padding: '0 80px', marginBottom: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SECTORS.map(s => (
              <button
                key={s}
                onClick={() => setActiveFilter(s)}
                style={{
                  padding: '6px 18px', borderRadius: 20, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                  background: activeFilter === s ? 'rgba(0,180,166,0.12)' : 'transparent',
                  border: `1px solid ${activeFilter === s ? 'rgba(0,180,166,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  color: activeFilter === s ? '#00B4A6' : 'rgba(255,255,255,0.5)'
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STAGES.map(s => (
              <button
                key={s}
                onClick={() => setActiveStage(s)}
                style={{
                  padding: '6px 18px', borderRadius: 20, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                  background: activeStage === s ? 'rgba(0,180,166,0.12)' : 'transparent',
                  border: `1px solid ${activeStage === s ? 'rgba(0,180,166,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  color: activeStage === s ? '#00B4A6' : 'rgba(255,255,255,0.5)'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Section */}
        {featuredCompanies.length > 0 && (
          <section style={{ padding: '0 80px', marginBottom: 60 }}>
            <div style={{ fontSize: 13, color: '#c9a84c', textTransform: 'uppercase', marginBottom: 8 }}>Featured Portfolio</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, marginBottom: 32 }}>Class of 2025</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {featuredCompanies.map((c, i) => (
                <div key={i} className="featured-card" style={{
                  background: '#ffffff', borderRadius: 12, padding: 20, height: 100,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <img
                    src={c.logo_url || `https://logo.clearbit.com/${c.domain}`}
                    alt={c.name}
                    style={{ width: 80, height: 40, objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none', color: '#00B4A6', fontSize: 18, fontWeight: 'bold' }}>
                    {getInitials(c.name)}
                  </div>
                  <div style={{ fontSize: 11, color: '#333', fontWeight: 600, marginTop: 8 }}>{c.name}</div>
                  <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, color: '#00B4A6', fontWeight: 500 }}>{c.sector}</div>
                  <style>{`
                    .featured-card:hover {
                      transform: translateY(-3px);
                      box-shadow: 0 8px 24px rgba(0,180,166,0.15);
                    }
                  `}</style>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Full Portfolio Grid */}
        <section style={{ padding: '0 80px', marginBottom: 80 }}>
          <div style={{ fontSize: 13, color: '#c9a84c', textTransform: 'uppercase', marginBottom: 8 }}>Full Portfolio</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, marginBottom: 32 }}>
            {filteredPortfolio.length} Companies
          </h2>
          {filteredPortfolio.length === 0 ? (
            <div style={{ padding: '100px 0', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
              No companies match the current filters.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              {filteredPortfolio.map((p, i) => {
                const colors = getStageColor(p.stage);
                return (
                  <div key={i} className="portfolio-grid-card" style={{
                    background: '#111110', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
                    padding: 16, display: 'flex', flexDirection: 'column', gap: 8, transition: 'all 0.2s'
                  }}>
                    <div style={{ background: '#fff', borderRadius: 8, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                      <img
                        src={p.logo_url || `https://logo.clearbit.com/${p.domain}`}
                        alt={p.name}
                        style={{ height: 28, objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div style={{ display: 'none', color: '#00B4A6', fontSize: 14, fontWeight: 'bold' }}>
                        {getInitials(p.name)}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{p.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 11, color: '#00B4A6' }}>{p.sector}</div>
                      <div style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 20,
                        background: colors.bg, color: colors.color
                      }}>
                        {p.stage}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#9e9b92', lineHeight: 1.4 }}>{p.description}</div>
                    <style>{`
                      .portfolio-grid-card:hover {
                        border-color: rgba(0,180,166,0.25);
                      }
                    `}</style>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Stats Section Bottom */}
        <section style={{ padding: '60px 80px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { v: companies.length > 200 ? '263' : companies.length, l: 'Total Companies', sub: 'Since 2018' },
            { v: '₹300 Cr+', l: 'Capital Deployed', sub: 'via Finvolve' },
            { v: '9', l: 'Portfolio Exits', sub: 'Successful exits' },
            { v: '2', l: 'Unicorns', sub: 'Droom & Ola' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, color: '#c9a84c' }}>{s.v}</div>
              <div style={{ fontSize: 15, color: '#fff', fontWeight: 500, marginTop: 8 }}>{s.l}</div>
              <div style={{ fontSize: 13, color: '#9e9b92', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 80px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14, color: '#9e9b92' }}>© 2026 India Accelerator — Confidential</div>
          <a href="mailto:invest@indiaaccelerator.co" style={{ fontSize: 14, color: '#c9a84c', textDecoration: 'none' }}>invest@indiaaccelerator.co</a>
        </footer>
      </div>
    </div>
  );
}

