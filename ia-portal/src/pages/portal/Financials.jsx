import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Dots } from '../../components/UI';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

// ── SAMPLE DATA ──
const DEPLOYMENT_DATA = [
  {year:'FY22', deployed:20, committed:50},
  {year:'FY23', deployed:45, committed:120},
  {year:'FY24', deployed:90, committed:250},
  {year:'FY25', deployed:150, committed:380},
  {year:'FY26', deployed:300, committed:500},
];

const INVESTMENT_DATA = [
  {year:'FY22', investments:3, exits:0},
  {year:'FY23', investments:8, exits:0},
  {year:'FY24', investments:15, exits:1},
  {year:'FY25', investments:25, exits:2},
  {year:'FY26', investments:35, exits:3},
];

const PORTFOLIO_STAGE_DATA = [
  {name:'Pre-Seed', value:35, color:'#00B4A6'},
  {name:'Seed', value:40, color:'#007a72'},
  {name:'Series A', value:15, color:'#c9a84c'},
  {name:'Growth', value:10, color:'#8b7235'},
];

const THESIS_DATA = [
  {thesis:'Consumption & Impact', count:20},
  {thesis:'Frontier Tech', count:15},
  {thesis:'Defence & Aerospace', count:12},
  {thesis:'Energy & Resilience', count:8},
];

const IRR_DATA = [
  {month:'Month 6', irr:8},
  {month:'Month 12', irr:18},
  {month:'Month 18', irr:32},
  {month:'Month 24', irr:40},
  {month:'Month 30', irr:47},
  {month:'Month 36', irr:55},
];

const FUNDS_DATA = [
  {name:'FAT I-II', stage:'Pre-Seed to Seed', status:'Active', investments:12, color:'#00B4A6'},
  {name:'GIFT City Fund', stage:'Seed to Series A', status:'Active', investments:8, color:'#007a72'},
  {name:'Brew Fund', stage:'Pre-Seed', status:'Active', investments:6, color:'#c9a84c'},
  {name:'IAGOF-I', stage:'Seed to Series A', status:'Active', investments:15, color:'#00B4A6'},
  {name:'IAGOF-II/III', stage:'Series A to Growth', status:'Fundraising', investments:0, color:'#8b7235'},
];

const chartStyles = {
  cartesianGrid: { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.04)" },
  xAxisTick: { fill: 'rgba(255,255,255,0.4)', fontSize: 13 },
  yAxisTick: { fill: 'rgba(255,255,255,0.4)', fontSize: 13 },
  tooltip: {
    contentStyle: { background: '#111110', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: 13 }
  },
  legend: { wrapperStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 13 } }
};

export default function Financials({ onBack, email }) {
  const navigate = useNavigate();
  const [financials, setFinancials] = useState({});
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('INR');
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedYear, setSelectedYear] = useState('FY26');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await supabase
          .from('content_blocks')
          .select('*')
          .eq('section_key', 'financials');
        if (!cancelled) {
          const map = {};
          if (data) data.forEach(b => map[b.block_key] = b.value);
          setFinancials(map);
        }
      } catch (e) {
        console.error('Error loading financials:', e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const USD_RATE = 0.012;

  const fmtCr = (crores, suffix = '') => {
    if (currency === 'INR') {
      return '₹' + crores + ' Cr' + suffix;
    } else {
      const usd = Math.round(crores * 10000000 * USD_RATE / 1000000);
      return '$' + usd + 'M' + suffix;
    }
  };

  const navLinks = [
    { id: 'overview', label: 'Overview' },
    { id: 'fund-performance', label: 'Fund Performance' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'unit-economics', label: 'Unit Economics' },
    { id: 'financials', label: 'Financials' },
  ];

  const scrollTo = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 128,
        behavior: 'smooth'
      });
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
        <button onClick={() => navigate('/')} style={{ fontSize: 15, color: '#c9a84c', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Back to Portal
        </button>
        <div style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)' }}>
          Financial Projections
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 3 }}>
            {['INR', 'USD'].map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                style={{
                  padding: '5px 14px', borderRadius: 20, border: currency === c ? 'none' : '1px solid transparent',
                  background: currency === c ? '#c9a84c' : 'transparent',
                  color: currency === c ? '#0a0a08' : 'rgba(255,255,255,0.5)',
                  fontSize: 13, fontWeight: currency === c ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 15, color: '#00B4A6' }}>India Accelerator</div>
        </div>
      </nav>

      {/* Sticky Section Nav */}
      <div style={{
        position: 'sticky', top: 64, zIndex: 900, background: 'rgba(10,10,8,0.92)',
        backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', overflowX: 'auto'
      }}>
        {navLinks.map(link => (
          <div
            key={link.id}
            onClick={() => scrollTo(link.id)}
            style={{
              fontSize: 14, padding: '16px 28px', cursor: 'pointer', transition: 'all 0.2s',
              color: activeSection === link.id ? '#c9a84c' : 'rgba(255,255,255,0.45)',
              borderBottom: `2px solid ${activeSection === link.id ? '#c9a84c' : 'transparent'}`,
              whiteSpace: 'nowrap'
            }}
          >
            {link.label}
          </div>
        ))}
      </div>

      <div style={{ paddingTop: 60 }}>
        {/* ── Section 1: Overview ── */}
        <section id="overview" style={{ padding: '60px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 32, height: 1, background: '#c9a84c' }} />
            <div style={{ fontSize: 13, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.15em' }}>FUND OVERVIEW</div>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 60, fontWeight: 300, lineHeight: 1.0, margin: 0 }}>
            Building India's Most Active
          </h1>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 60, fontWeight: 300, fontStyle: 'italic', color: '#00B4A6', lineHeight: 1.0, marginBottom: 20 }}>
            Startup Ecosystem
          </h1>
          <p style={{ fontSize: 17, color: '#9e9b92', maxWidth: 600, lineHeight: 1.7, marginBottom: 48 }}>
            {financials?.hero_description || "India Accelerator manages 5 active funds with ₹500 Cr+ in commitments, deploying capital across pre-seed to growth stage startups."}
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', gap: 1, background: 'rgba(255,255,255,0.06)'
          }}>
            {[
              { l: 'Capital Committed', v: fmtCr(500, '+'), sub: 'via Finvolve', color: '#c9a84c' },
              { l: 'Capital Deployed', v: fmtCr(300, '+'), sub: 'across 55+ startups', color: '#fff' },
              { l: 'IRR (>18 months)', v: '40%', sub: 'since date of investment', color: '#00B4A6' },
              { l: 'Active Funds', v: '5', sub: 'FAT I-II, GIFT, Brew, IAGOF', color: '#fff' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#111110', padding: '32px 36px' }}>
                <div style={{ fontSize: 13, color: '#00B4A6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{s.l}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, color: s.color, lineHeight: 1 }}>{s.v}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', color: '#9e9b92', fontSize: 13 }}>
                  <span style={{ color: '#00B4A6' }}>→</span> {s.sub}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: Fund Performance ── */}
        <section id="fund-performance" style={{ padding: '60px 80px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, color: '#c9a84c', textTransform: 'uppercase', marginBottom: 8 }}>Fund Performance</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 300, marginBottom: 40 }}>Finvolve & Funds</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 20 }}>Capital Deployment ({currency === 'INR' ? '₹ Cr' : '$M'})</div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={DEPLOYMENT_DATA}>
                  <CartesianGrid {...chartStyles.cartesianGrid} />
                  <XAxis dataKey="year" tick={chartStyles.xAxisTick} />
                  <YAxis tick={chartStyles.yAxisTick} />
                  <Tooltip {...chartStyles.tooltip} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                  <Legend {...chartStyles.legend} />
                  <Bar dataKey="committed" name="Committed" fill="rgba(0,180,166,0.2)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deployed" name="Deployed" fill="#00B4A6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 20 }}>Investment Activity</div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={INVESTMENT_DATA}>
                  <CartesianGrid {...chartStyles.cartesianGrid} />
                  <XAxis dataKey="year" tick={chartStyles.xAxisTick} />
                  <YAxis tick={chartStyles.yAxisTick} />
                  <Tooltip {...chartStyles.tooltip} />
                  <Legend {...chartStyles.legend} />
                  <Line dataKey="investments" name="Investments" stroke="#00B4A6" strokeWidth={2} dot={{ fill: '#00B4A6', r: 4 }} />
                  <Line dataKey="exits" name="Exits" stroke="#c9a84c" strokeWidth={2} dot={{ fill: '#c9a84c', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {FUNDS_DATA.map((f, i) => (
              <div key={i} style={{ background: '#111110', borderTop: `3px solid ${f.color}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{f.name}</div>
                <div style={{ fontSize: 13, color: '#9e9b92', marginBottom: 12 }}>{f.stage}</div>
                <span style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em',
                  background: f.status === 'Active' ? 'rgba(74,174,140,0.12)' : 'rgba(201,168,76,0.1)',
                  color: f.status === 'Active' ? '#6fcfb0' : '#c9a84c',
                  border: `1px solid ${f.status === 'Active' ? 'rgba(74,174,140,0.25)' : 'rgba(201,168,76,0.2)'}`
                }}>
                  {f.status}
                </span>
                <div style={{ fontSize: 13, color: '#9e9b92', marginTop: 12 }}>
                  <strong style={{ color: '#fff' }}>{f.investments}</strong> investments
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 3: Portfolio ── */}
        <section id="portfolio" style={{ padding: '60px 80px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, color: '#c9a84c', textTransform: 'uppercase', marginBottom: 8 }}>Portfolio Performance</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 300, marginBottom: 40 }}>Scale & Impact</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 40 }}>
            {[
              { v: '55+', l: 'Startups Invested' },
              { v: '2', l: 'Partial Exits' },
              { v: '16', l: 'Cities Covered' },
              { v: fmtCr(150, '+'), l: 'Deployed in CY25' },
            ].map((m, i) => (
              <div key={i} style={{ background: '#111110', borderLeft: '3px solid #00B4A6', borderRadius: 12, padding: 24 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, color: '#c9a84c' }}>{m.v}</div>
                <div style={{ fontSize: 13, color: '#00B4A6', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6 }}>{m.l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24, position: 'relative' }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 20 }}>Portfolio by Stage</div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={PORTFOLIO_STAGE_DATA} cx="40%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value">
                    {PORTFOLIO_STAGE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...chartStyles.tooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PORTFOLIO_STAGE_DATA.map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9e9b92' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                    {item.name} ({item.value}%)
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 20 }}>Portfolio by Thesis</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={THESIS_DATA} layout="vertical">
                  <CartesianGrid {...chartStyles.cartesianGrid} horizontal={false} />
                  <XAxis type="number" tick={chartStyles.xAxisTick} hide />
                  <YAxis type="category" dataKey="thesis" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 13 }} width={160} />
                  <Tooltip {...chartStyles.tooltip} />
                  <Bar dataKey="count" fill="#00B4A6" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: 'rgba(255,255,255,0.5)', fontSize: 13 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ── Section 4: Unit Economics ── */}
        <section id="unit-economics" style={{ padding: '60px 80px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, color: '#c9a84c', textTransform: 'uppercase', marginBottom: 8 }}>Unit Economics & Returns</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 300, marginBottom: 40 }}>Returns Profile</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
            {[
              { v: '40%', l: 'Portfolio IRR', sub: '>18 months since date of investment', color: '#00B4A6' },
              { v: '68%', l: 'Follow-on Rate', sub: 'Portfolio companies raising follow-on rounds', color: '#c9a84c' },
              { v: fmtCr(1.5), l: 'Average Ticket Size', sub: 'Per startup initial investment', color: '#fff' },
            ].map((c, i) => (
              <div key={i} style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, color: c.color }}>{c.v}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', marginTop: 12, marginBottom: 8 }}>{c.l}</div>
                <div style={{ fontSize: 13, color: '#9e9b92', lineHeight: 1.5 }}>{c.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 20 }}>IRR Progression Over Time</div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={IRR_DATA}>
                <defs>
                  <linearGradient id="irrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#c9a84c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartStyles.cartesianGrid} />
                <XAxis dataKey="month" tick={chartStyles.xAxisTick} />
                <YAxis tick={chartStyles.yAxisTick} />
                <Tooltip {...chartStyles.tooltip} />
                <ReferenceLine y={40} stroke="rgba(201,168,76,0.4)" strokeDasharray="4 4" label={{ value: 'Current 40%', fill: '#c9a84c', fontSize: 13, position: 'right' }} />
                <Area dataKey="irr" name="IRR %" stroke="#c9a84c" strokeWidth={2} fill="url(#irrGradient)" dot={{ fill: '#c9a84c', r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── Section 5: Financials ── */}
        <section id="financials" style={{ padding: '60px 80px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, color: '#c9a84c', textTransform: 'uppercase', marginBottom: 8 }}>Financial Overview</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 300, marginBottom: 40 }}>Projected P&L</h2>

          <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 10, padding: '14px 20px', marginBottom: 40, fontSize: 14, color: 'rgba(201,168,76,0.8)', fontStyle: 'italic' }}>
            Sample projections shown for illustrative purposes. Actual financials available to serious investors under NDA.
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            {['FY25', 'FY26', 'FY27'].map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                style={{
                  padding: '8px 24px', borderRadius: 20, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                  background: selectedYear === year ? '#c9a84c' : 'transparent',
                  color: selectedYear === year ? '#0a0a08' : 'rgba(255,255,255,0.5)',
                  fontWeight: selectedYear === year ? 600 : 400,
                  border: `1px solid ${selectedYear === year ? '#c9a84c' : 'rgba(255,255,255,0.12)'}`
                }}
              >
                {year}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 24 }}>
            <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 28 }}>
              <div style={{ fontSize: 16, whiteSpace: 'nowrap', fontWeight: 500, marginBottom: 20 }}>Income Statement ({selectedYear})</div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                {[
                  { n: 'Management Fees', v: fmtCr(8), g: '+25%' },
                  { n: 'Performance Fees', v: fmtCr(3), g: '+40%' },
                  { n: 'Advisory Income', v: fmtCr(2), g: '+30%' },
                  { n: 'Total Revenue', v: fmtCr(13), g: '+28%', highlight: '#00B4A6' },
                  { n: 'Operating Expenses', v: fmtCr(7), g: '+15%', neg: true },
                  { n: 'EBITDA', v: fmtCr(6), g: '+45%', highlight: '#c9a84c' },
                  { n: 'EBITDA Margin', v: '46%', g: '+7pp' },
                ].map((row, i) => (
                  <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, color: '#9e9b92' }}>{row.n}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontSize: 12, background: row.neg ? 'rgba(255,0,0,0.1)' : 'rgba(74,174,140,0.1)', color: row.neg ? '#ff4d4d' : '#6fcfb0', padding: '2px 8px', borderRadius: 20 }}>
                        {row.g}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: row.highlight ? 700 : 500, color: row.highlight || '#fff' }}>{row.v}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 28 }}>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>Key Metrics</div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                {[
                  { n: 'AUM', v: fmtCr(500, '+') },
                  { n: 'Deployment Rate', v: '60%' },
                  { n: 'Active Portfolio', v: '55 companies' },
                  { n: 'Avg Investment Age', v: '2.3 years' },
                  { n: 'Portfolio Valuation', v: fmtCr(850, '+') },
                  { n: 'Unrealized Gains', v: fmtCr(350, '+') },
                ].map((row, i) => (
                  <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 14, color: '#9e9b92' }}>{row.n}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{row.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, color: '#9e9b92' }}>© 2026 India Accelerator — Confidential</div>
          <a href="mailto:invest@indiaaccelerator.co" style={{ fontSize: 14, color: '#c9a84c', textDecoration: 'none' }}>invest@indiaaccelerator.co</a>
        </footer>
      </div>
    </div>
  );
}
