import React, { useEffect, useState } 
  from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, LabelList
} from 'recharts';
import { Dots } from '../../components/UI';
import { supabase } from '../../lib/supabase';

const SHEET_ID = '1X6bUGtXki3HJWhYlISKVMBr_SjHKi8dNr1OOrUSYr8w';

async function fetchSheet(sheetId, tabName) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`
    const res = await fetch(url)
    if (!res.ok) {
      console.error(`Failed to fetch ${tabName}:`, res.status)
      return []
    }
    const text = await res.text()
    return parseCSV(text)
  } catch(e) {
    console.error(`Error fetching ${tabName}:`, e)
    return []
  }
}

function parseCSV(text) {
  if (!text || !text.trim()) return []
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',')
    .map(h => h.replace(/"/g, '').trim().toLowerCase())
  
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = []
      let current = ''
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          inQuotes = !inQuotes
        } else if (line[i] === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += line[i]
        }
      }
      values.push(current.trim())
      
      const obj = {}
      headers.forEach((h, i) => {
        obj[h] = (values[i] || '').trim()
      })
      return obj
    })
}

function getChartStyles(isMobile) {
  return {
    cartesianGrid: {
      strokeDasharray: '3 3',
      stroke: 'rgba(255,255,255,0.04)'
    },
    xAxis: {
      tick: {
        fill: 'rgba(255,255,255,0.4)',
        fontSize: isMobile ? 9 : 12
      }
    },
    yAxis: {
      tick: {
        fill: 'rgba(255,255,255,0.4)',
        fontSize: isMobile ? 9 : 12
      }
    },
    tooltip: {
      contentStyle: {
        background: '#111110',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        color: 'white',
        fontSize: 12
      }
    },
    legend: {
      wrapperStyle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12
      }
    }
  };
}

export default function Financials({ email }) {
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;
  const chartStyle = React.useMemo(() => getChartStyles(isMobile), [isMobile]);
  const [currency, setCurrency] = useState('INR');
  const [selectedYear, setSelectedYear] = 
    useState('FY26');
  const [loading, setLoading] = useState(true);
  const [sheetError, setSheetError] = 
    useState(false);
  const [data, setData] = useState({
    overview: {},
    deployment: [],
    portfolio: [],
    irr: [],
    pl: [],
    funds: []
  });
  const [forecastsData, setForecastsData] = useState({});
  const [sections, setSections] = useState({});
  const [projectionsData, setProjectionsData] = useState([]);
  const [revenueSubtitle, setRevenueSubtitle] = 
    useState('From ₹3.9 Cr in FY21 to ₹35.5 Cr in FY25 — and projecting ₹964 Cr by FY30')

  function isVisible(key) {
    if (!sections || Object.keys(sections).length === 0) {
      return true
    }
    return sections[key] !== false
  }

  // Fetch Section Visibility
  useEffect(() => {
    async function fetchSections() {
      try {
        const { data: sectionsData } = await supabase
          .from('financials_sections')
          .select('key, is_visible')
        
        if (sectionsData) {
          const map = {}
          sectionsData.forEach(s => {
            map[s.key] = s.is_visible
          })
          setSections(map)
        }

        const { data: subtitleData } = 
          await supabase
            .from('content_blocks')
            .select('value')
            .eq('block_key', 'financials_revenue_subtitle')
            .single()

        if (subtitleData) {
          setRevenueSubtitle(subtitleData.value)
        }
      } catch(err) {
        console.error('Sections fetch failed:', err)
      }
    }
    fetchSections()
  }, [])

  // Main Data Fetch
  useEffect(() => {
    let cancelled = false
    
    async function loadAll() {
      try {
        console.log('Fetching Google Sheet data...')
        
        const [overview, deploymentParsed, portfolio, 
               irr, pl, funds, forecastsRaw] = await Promise.all([
          fetchSheet(SHEET_ID, 'Overview'),
          fetchSheet(SHEET_ID, 'Deployment'),
          fetchSheet(SHEET_ID, 'Portfolio'),
          fetchSheet(SHEET_ID, 'IRR'),
          fetchSheet(SHEET_ID, 'PL (P&L)'),
          fetchSheet(SHEET_ID, 'Funds'),
          fetchSheet(SHEET_ID, 'Forecasts'),
        ])

        if (cancelled) return

        // Projections fetch in separate try/catch
        try {
          const projectionsRaw = await fetchSheet(SHEET_ID, 'Projections')
          const projectionsParsed = Array.isArray(projectionsRaw) ? projectionsRaw : []
          
          const safeProjections = projectionsParsed.map(r => {
            const keys = Object.keys(r)
            const find = (name) => {
              const k = keys.find(k => k.trim().toLowerCase() === name)
              return parseFloat(r[k]) || 0
            }
            return {
              year: r.year || r.Year || r[keys[0]],
              revenue: find('revenue'),
              cities: find('cities'),
              hubs: find('hubs'),
              seats: find('seats'),
              spaces_revenue: find('spaces_revenue'),
              startups_added: find('startups_added'),
              equity_value: find('equity_value'),
              ia_fund_share: find('ia_fund_share'),
            }
          })
          setProjectionsData(safeProjections)
        } catch(projErr) {
          console.error('Projections fetch failed:', projErr)
        }
        
        console.log('Sheet data loaded:', {
          overview: overview.length,
          deployment: deploymentParsed.length,
          portfolio: portfolio.length,
          irr: irr.length,
          pl: pl.length,
          funds: funds.length
        })
        
        // Parse overview into key-value map
        const ovMap = {}
        overview.forEach(row => {
          if (row.key) ovMap[row.key] = row.value
        })

        const forecastsMap = {}
        forecastsRaw.forEach(row => {
          forecastsMap[row.metric] = {
            fy26: parseFloat(row.fy26) || 0,
            fy27: parseFloat(row.fy27) || 0,
            fy28: parseFloat(row.fy28) || 0,
            fy29: parseFloat(row.fy29) || 0,
          }
        })
        setForecastsData(forecastsMap)
        
        setData({
          overview: ovMap,
          deployment: deploymentParsed.map(r => ({
            year: r.year || '',
            revenue: parseFloat(r.revenue) || parseFloat(r.deployed) || 0,
            profit: parseFloat(r.profit) || 0,
            target: parseFloat(r.target) || parseFloat(r.committed) || 0,
            deployed: parseFloat(r.revenue) || parseFloat(r.deployed) || 0,
            committed: parseFloat(r.target) || parseFloat(r.committed) || 0,
          })).filter(r => r.year),
          
          portfolio: portfolio.map(r => ({
            name: r.stage || '',
            value: parseFloat(r.count) || 0,
            color: r.color || '#00B4A6',
          })).filter(r => r.name),
          
          irr: irr.map(r => ({
            month: r.month || '',
            irr: parseFloat(r.irr) || 0,
          })).filter(r => r.month),
          
          pl: pl,
          
          funds: funds.map(r => ({
            name: r.name || '',
            stage: r.stage || '',
            status: r.status || 'Active',
            investments: parseInt(r.investments) || 0,
            color: r.color || '#00B4A6',
          })).filter(r => r.name),
        })
        
        setLoading(false)
      } catch(e) {
        console.error('Failed to load sheet:', e)
        if (!cancelled) {
          setSheetError(true)
          setLoading(false)
        }
      }
    }
    
    loadAll()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const USD = 0.012;
  function fmtCr(val, suffix='') {
    const num = parseFloat(val) || 0;
    if (currency === 'INR') {
      return '₹' + num + ' Cr' + suffix;
    }
    const usd = Math.round(
      num * 10000000 * USD / 1000000
    );
    return '$' + usd + 'M' + suffix;
  }

  const ov = data.overview;
  const revenuefy25 = parseFloat(ov.revenue_fy25)||27.24;
  const revenuefy26 = parseFloat(ov.revenue_fy26)||68.32;
  // const profitfy25 = parseFloat(ov.profit_fy25)||1.46;
  const profitfy26 = parseFloat(ov.profit_fy26)||1.62;
  const assetsfy25 = parseFloat(ov.total_assets_fy25)||41.91;
  const assetsfy26 = parseFloat(ov.total_assets_fy26)||103.03;
  const equityfy25 = parseFloat(ov.equity_fy25)||31.03;
  const equityfy26 = parseFloat(ov.equity_fy26)||70.99;
  const currentRatio = ov.current_ratio || '3.72';
  const debtEquity = ov.debt_equity || '0.08';
  const roe = ov.roe || '8%';
  const npm = ov.net_profit_margin || '5.3%';

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a08',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
      paddingTop: 64
    }}>
      <Dots />
      <div style={{
        fontSize: 13,
        color: '#9e9b92'
      }}>
        Loading financial data...
      </div>
    </div>
  );

  const fundDeploymentData = [
    { year: 'FY23', deployed: 5, committed: 50 },
    { year: 'FY24', deployed: 12.45, committed: 120 },
    { year: 'FY25', deployed: 27.24, committed: 250 },
    { year: 'FY26', deployed: 68.32, committed: 500 },
  ];

  if (sheetError) return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a08',
      paddingTop: 64
    }}>
      <TopBar
        navigate={navigate}
        currency={currency}
        setCurrency={setCurrency}
        isMobile={isMobile}
      />
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16, padding: '120px 2rem',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: 48, opacity: 0.2
        }}>▦</div>
        <div style={{
          fontSize: 16, color: '#fff'
        }}>
          Financial data unavailable
        </div>
        <div style={{
          fontSize: 13,
          color: '#9e9b92',
          maxWidth: 400
        }}>
          Could not connect to Google Sheets.
          Please check the sheet connection
          in the admin panel.
        </div>
      </div>
    </div>
  );

  const plData = data.pl.map(r => ({
    metric: r.metric,
    value: r[selectedYear.toLowerCase()] || '—',
    growth: r['growth_fy26'] || '',
    type: r.type || 'income',
  }));

  const safeDeployment = (data.deployment||[]).map(r => {
    const keys = Object.keys(r)
    const find = (name) => {
      const k = keys.find(k => 
        k.trim().toLowerCase() === name)
      return parseFloat(r[k]) || 0
    }
    return {
      year: r.year || r.Year || r[keys[0]],
      revenue: find('revenue'),
      profit: find('profit'),
      target: find('target'),
    }
  })

  const years = ['FY26','FY27','FY28','FY29']
  const fyKeys = ['fy26','fy27','fy28','fy29']

  function forecastSeries(metric) {
    return years.map((year, i) => ({
      year,
      value: forecastsData[metric]?.[fyKeys[i]] || 0
    }))
  }

  function forecastSeriesDual(m1, m2) {
    return years.map((year, i) => ({
      year,
      value1: forecastsData[m1]?.[fyKeys[i]] || 0,
      value2: forecastsData[m2]?.[fyKeys[i]] || 0,
    }))
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a08'
    }}>
      <TopBar
        navigate={navigate}
        currency={currency}
        setCurrency={setCurrency}
        isMobile={isMobile}
      />

      {/* Sticky Section Nav */}
      <div style={{
        position: 'sticky', top: 64, left: 0, right: 0, zIndex: 40,
        height: 48, background: 'rgba(10,10,8,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '2rem'
      }}>
        {[
          { id: 'overview', label: 'Overview', key: 'overview' },
          { id: 'revenue-trajectory', label: 'Revenue', key: 'revenue_trajectory' },
          { id: 'projections', label: 'Forecasts', key: 'projections' },
          { id: 'revenue-growth', label: 'Revenue Growth', key: 'revenue_growth' },
          { id: 'fund-performance', label: 'Fund Performance', key: 'fund_performance' },
          { id: 'unit-economics', label: 'Unit Economics', key: 'unit_economics' },
          { id: 'financials', label: 'P&L', key: 'pnl' },
          { id: 'balance-sheet', label: 'Balance Sheet', key: 'balance_sheet' },
          { id: 'forecasts', label: 'KPIs', key: 'forecasts' },
        ].filter(link => isVisible(link.key)).map(n => (
          <a key={n.id} href={`#${n.id}`} style={{
            fontSize: 12, color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none', textTransform: 'uppercase',
            letterSpacing: '0.08em', fontWeight: 500,
            transition: 'color 0.2s'
          }} onMouseEnter={e => e.target.style.color = '#c9a84c'}
             onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
            {n.label}
          </a>
        ))}
      </div>

      {/* OVERVIEW */}
      {isVisible('overview') && (
      <section id="overview" style={{
        padding: isMobile ? '40px 16px 32px' : '80px 80px 60px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12, marginBottom: 24
        }}>
          <div style={{
            width: 32, height: 1,
            background: '#c9a84c'
          }} />
          <div style={{
            fontSize: 13, color: '#c9a84c',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontWeight: 500
          }}>FINANCIAL PERFORMANCE</div>
        </div>

        <div style={{
          fontFamily: 'Cormorant Garamond',
          fontSize: 60, fontWeight: 300,
          color: '#fff', lineHeight: 1.0,
          marginBottom: 0
        }}>
          IA India Accelerator
        </div>
        <div style={{
          fontFamily: 'Cormorant Garamond',
          fontSize: 60, fontStyle: 'italic',
          color: '#00B4A6', lineHeight: 1.0,
          marginBottom: 20
        }}>
          Financial Performance
        </div>
        <div style={{
          fontSize: 17, color: '#9e9b92',
          maxWidth: 600, lineHeight: 1.7,
          marginBottom: 48
        }}>
          Audited financials for FY 2024-25 and 
          provisional figures for FY 2025-26. 
          Revenue grew 5.5x from ₹12.45 Cr to 
          ₹68.32 Cr in just 2 years.
        </div>

        {/* 4 hero stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, overflow: 'hidden',
          background: 'rgba(255,255,255,0.06)',
          gap: 1
        }}>
          {[
            {
              label: 'Revenue FY26',
              value: fmtCr(revenuefy26),
              color: '#c9a84c',
              note: 'Provisional'
            },
            {
              label: 'Revenue FY25',
              value: fmtCr(revenuefy25),
              color: '#fff',
              note: 'Audited'
            },
            {
              label: 'Net Profit FY26',
              value: fmtCr(profitfy26),
              color: '#00B4A6',
              note: 'Provisional'
            },
            {
              label: 'Total Assets FY26',
              value: fmtCr(assetsfy26),
              color: '#fff',
              note: 'Provisional'
            },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#111110',
              padding: '32px 36px'
            }}>
              <div style={{
                fontSize: 13,
                color: '#9e9b92',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 12
              }}>{s.label}</div>
              <div style={{
                fontFamily: 'Cormorant Garamond',
                fontSize: 52,
                color: s.color,
                lineHeight: 1,
                marginBottom: 8
              }}>{s.value}</div>
              <div style={{
                fontSize: 13,
                color: '#9e9b92',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{color: s.color}}>
                  ●
                </span>
                {s.note}
              </div>
            </div>
          ))}
        </div>

        {/* Audit Notice */}
        <div style={{
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.15)',
          borderRadius: 10, padding: '12px 20px',
          marginTop: 20, fontSize: 13,
          color: 'rgba(201,168,76,0.8)', fontStyle: 'italic'
        }}>
          * FY 2025-26 figures are provisional 
          and unaudited. FY 2024-25 figures are audited 
          by APAM & Co., Chartered Accountants.
        </div>
      </section>
      )}

      {/* REVENUE TRAJECTORY SECTION */}
      {isVisible('revenue_trajectory') && (
      <section id="revenue-trajectory"
        style={{
          padding: isMobile ? '32px 16px' : '60px 80px',
          borderTop: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 32, height: 1, background: '#c9a84c' }} />
          <div style={{ fontSize: 13, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 500 }}>REVENUE TRAJECTORY</div>
        </div>
        <h2 style={{ fontSize: 42, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#fff', marginBottom: 8 }}>Revenue Growth Story</h2>
        <p style={{ fontSize: 15, color: '#9e9b92', marginBottom: 40 }}>{revenueSubtitle}</p>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>
          <ChartCard title="Revenue Growth (In INR Cr)">
            <div style={{ overflow: 'visible' }}>
              <ResponsiveContainer width="100%" height={280} style={{ overflow: 'visible' }}>
                <BarChart data={(data.deployment||[]).filter(r => ['FY21','FY22','FY23','FY24','FY25'].includes(r.year))}
                  margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid {...chartStyle.cartesianGrid} />
                  <XAxis dataKey="year" tick={chartStyle.xAxis.tick} />
                  <YAxis tick={chartStyle.yAxis.tick} />
                  <Tooltip contentStyle={chartStyle.tooltip.contentStyle} formatter={(val) => fmtCr(val)} />
                  <Bar dataKey="revenue" name="Revenue (Cr)" fill="#00B4A6" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="revenue" position="top" style={{ fill: '#9e9b92', fontSize: 11, fontFamily: 'DM Sans' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Projected Revenue Growth (In INR Cr)">
            <div style={{ overflow: 'visible' }}>
              <ResponsiveContainer width="100%" height={280} style={{ overflow: 'visible' }}>
                <BarChart data={projectionsData.map(r => ({ year: r.year, revenue: r.revenue }))}
                  margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid {...chartStyle.cartesianGrid} />
                  <XAxis dataKey="year" tick={chartStyle.xAxis.tick} />
                  <YAxis tick={chartStyle.yAxis.tick} />
                  <Tooltip contentStyle={chartStyle.tooltip.contentStyle} formatter={(val) => fmtCr(val)} />
                  <Bar dataKey="revenue" name="Projected Revenue (Cr)" fill="#00B4A6" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="revenue" position="top" style={{ fill: '#9e9b92', fontSize: 11, fontFamily: 'DM Sans' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontSize: 11, color: '#9e9b92', fontStyle: 'italic', marginTop: 12 }}>* FY26 onwards are projections</div>
          </ChartCard>
        </div>
      </section>
      )}

      {/* KEY FINANCIAL FORECASTS SECTION */}
      {isVisible('projections') && (
      <section id="projections"
        style={{
          padding: isMobile ? '32px 16px' : '60px 80px',
          borderTop: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 32, height: 1, background: '#c9a84c' }} />
          <div style={{ fontSize: 13, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 500 }}>CRITICAL KPIs</div>
        </div>
        <h2 style={{ fontSize: 42, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#fff', marginBottom: 8 }}>Key Financial Forecasts</h2>
        <p style={{ fontSize: 15, color: '#9e9b92', marginBottom: 40 }}>Forward-looking projections across Infrastructure, Accelerator and Fund verticals</p>

        <div style={{ fontSize: 11, color: '#00B4A6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20, fontWeight: 500 }}>INFRASTRUCTURE</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
          {/* Chart 1: Total Cities & Hubs */}
          <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 16 }}>Total Cities & Hubs</div>
            <div style={{ overflow: 'visible' }}>
              <ResponsiveContainer width="100%" height={200} style={{ overflow: 'visible' }}>
                <BarChart data={projectionsData.filter(r => ['FY26','FY27','FY28','FY29'].includes(r.year))}
                  margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid {...chartStyle.cartesianGrid} />
                  <XAxis dataKey="year" tick={chartStyle.xAxis.tick} />
                  <Legend wrapperStyle={chartStyle.legend.wrapperStyle} />
                  <Bar dataKey="cities" name="Cities" fill="#00B4A6" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="cities" position="top" style={{ fill: '#9e9b92', fontSize: 11, fontFamily: 'DM Sans' }} />
                  </Bar>
                  <Bar dataKey="hubs" name="Hubs" fill="rgba(0,180,166,0.4)" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="hubs" position="top" style={{ fill: '#9e9b92', fontSize: 11, fontFamily: 'DM Sans' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Total Seats */}
          <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 16 }}>Total Seats (In 000's)</div>
            <div style={{ overflow: 'visible' }}>
              <ResponsiveContainer width="100%" height={200} style={{ overflow: 'visible' }}>
                <BarChart data={projectionsData.filter(r => ['FY26','FY27','FY28','FY29'].includes(r.year))}
                  margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid {...chartStyle.cartesianGrid} />
                  <XAxis dataKey="year" tick={chartStyle.xAxis.tick} />
                  <Bar dataKey="seats" name="Seats (000s)" fill="#00B4A6" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="seats" position="top" style={{ fill: '#9e9b92', fontSize: 11, fontFamily: 'DM Sans' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: IA Spaces Revenue */}
          <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 16 }}>IA Spaces Revenue (₹ Cr)</div>
            <div style={{ overflow: 'visible' }}>
              <ResponsiveContainer width="100%" height={200} style={{ overflow: 'visible' }}>
                <BarChart data={projectionsData.filter(r => ['FY26','FY27','FY28','FY29'].includes(r.year))}
                  margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid {...chartStyle.cartesianGrid} />
                  <XAxis dataKey="year" tick={chartStyle.xAxis.tick} />
                  <Tooltip contentStyle={chartStyle.tooltip.contentStyle} formatter={(val) => fmtCr(val)} />
                  <Bar dataKey="spaces_revenue" name="Revenue (Cr)" fill="#00B4A6" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="spaces_revenue" position="top" style={{ fill: '#9e9b92', fontSize: 11, fontFamily: 'DM Sans' }} formatter={(val) => fmtCr(val)} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '65% 35%', gap: 24, marginTop: 40 }}>
          {/* Accelerator */}
          <div>
            <div style={{ fontSize: 11, color: '#00B4A6', textTransform: 'uppercase', marginBottom: 20, fontWeight: 500 }}>{isMobile ? 'ACCELERATOR' : 'ACCELERATOR (MENTOR EQUITY)'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 16 }}>Startups Added</div>
                <div style={{ overflow: 'visible' }}>
                  <ResponsiveContainer width="100%" height={200} style={{ overflow: 'visible' }}>
                    <BarChart data={projectionsData.filter(r => ['FY26','FY27','FY28','FY29'].includes(r.year))}
                      margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid {...chartStyle.cartesianGrid} />
                      <XAxis dataKey="year" tick={chartStyle.xAxis.tick} />
                      <Bar dataKey="startups_added" fill="#00B4A6" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="startups_added" position="top" style={{ fill: '#9e9b92', fontSize: 11, fontFamily: 'DM Sans' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 16 }}>Value of Equity Added (₹ Cr)</div>
                <div style={{ overflow: 'visible' }}>
                  <ResponsiveContainer width="100%" height={200} style={{ overflow: 'visible' }}>
                    <BarChart data={projectionsData.filter(r => ['FY26','FY27','FY28','FY29'].includes(r.year))}
                      margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid {...chartStyle.cartesianGrid} />
                      <XAxis dataKey="year" tick={chartStyle.xAxis.tick} />
                      <Tooltip contentStyle={chartStyle.tooltip.contentStyle} formatter={(val) => fmtCr(val)} />
                      <Bar dataKey="equity_value" fill="#00B4A6" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="equity_value" position="top" style={{ fill: '#9e9b92', fontSize: 11, fontFamily: 'DM Sans' }} formatter={(val) => fmtCr(val)} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Fund */}
          <div>
            <div style={{ fontSize: 11, color: '#c9a84c', textTransform: 'uppercase', marginBottom: 20, fontWeight: 500 }}>{isMobile ? 'FUND' : 'FUND (EXCLUDING CARRY)'}</div>
            <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 16 }}>IA Share from Fund (₹ Cr)</div>
              <div style={{ overflow: 'visible' }}>
                <ResponsiveContainer width="100%" height={200} style={{ overflow: 'visible' }}>
                  <BarChart data={projectionsData.filter(r => ['FY26','FY27','FY28','FY29'].includes(r.year))}
                    margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid {...chartStyle.cartesianGrid} />
                    <XAxis dataKey="year" tick={chartStyle.xAxis.tick} />
                    <Tooltip contentStyle={chartStyle.tooltip.contentStyle} formatter={(val) => fmtCr(val)} />
                    <Bar dataKey="ia_fund_share" fill="#c9a84c" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="ia_fund_share" position="top" style={{ fill: '#9e9b92', fontSize: 11, fontFamily: 'DM Sans' }} formatter={(val) => fmtCr(val)} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

       {/* REVENUE GROWTH */}
      {isVisible('revenue_growth') && (
      <section id="revenue-growth" style={{
        padding: isMobile ? '32px 16px' : '60px 80px',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <SectionLabel label="REVENUE GROWTH" />
        <SectionTitle title="5.5x Growth in 2 Years" />
        <p style={{ fontSize: 15, color: '#9e9b92', marginTop: -20, marginBottom: 40, maxWidth: 600 }}>
          From ₹12.45 Cr in FY24 to ₹68.32 Cr in FY26 — consistent year-on-year revenue growth
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr',
          gap: 24
        }}>
          <ChartCard title="Revenue vs Profit (₹ Cr)">
            <div style={{ overflow: 'visible' }}>
              <ResponsiveContainer width="100%" height={280} style={{ overflow: 'visible' }}>
                <BarChart data={safeDeployment}
                  margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid {...chartStyle.cartesianGrid} />
                  <XAxis dataKey="year" tick={chartStyle.xAxis.tick} />
                  <YAxis 
                    tick={chartStyle.yAxis.tick}
                    label={{ value: '₹ Cr', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.4)', fontSize: 10, offset: 10 }}
                  />
                  <Tooltip 
                    contentStyle={chartStyle.tooltip.contentStyle}
                    formatter={(val) => fmtCr(val)}
                  />
                  <Legend 
                    wrapperStyle={chartStyle.legend.wrapperStyle}
                    verticalAlign="bottom"
                    align="center"
                  />
                  <Bar dataKey="revenue" name="Revenue (Cr)" fill="#00B4A6" radius={[4,4,0,0]} />
                  <Bar dataKey="profit" name="Net Profit (Cr)" fill="#c9a84c" radius={[4,4,0,0]} />
                  <Bar dataKey="target" name="Target (Cr)" fill="rgba(255,255,255,0.08)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            {[
              { val: currentRatio, label: 'Current Ratio', note: 'Healthy liquidity position' },
              { val: debtEquity, label: 'Debt-Equity Ratio', note: 'Conservative leverage' },
              { val: roe, label: 'Return on Equity', note: 'FY 2024-25' },
              { val: npm, label: 'Net Profit Margin', note: 'FY 2024-25' },
            ].map((r, i) => (
              <div key={i} style={{
                background: '#111110', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12, padding: 20, textAlign: 'center',
                display: 'flex', flexDirection: 'column', justifyContent: 'center'
              }}>
                <div style={{ fontFamily: 'Cormorant Garamond', fontSize: 36, color: '#c9a84c', lineHeight: 1 }}>{r.val}</div>
                <div style={{ fontSize: 11, color: '#00B4A6', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 8 }}>{r.label}</div>
                <div style={{ fontSize: 11, color: '#9e9b92', marginTop: 4 }}>{r.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* FUND PERFORMANCE */}
      {isVisible('fund_performance') && (
      <section id="fund-performance" style={{
        padding: isMobile ? '32px 16px' : '60px 80px',
        borderTop:
          '1px solid rgba(255,255,255,0.06)'
      }}>
        <SectionLabel label="Fund Performance" />
        <SectionTitle title="Finvolve & Investment Funds" />
        <p style={{ fontSize: 15, color: '#9e9b92', marginTop: -20, marginBottom: 40, maxWidth: 600 }}>
          IA manages 5 active funds through Finvolve, deploying capital from pre-seed to growth stage
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: 24, marginBottom: 32
        }}>
          <ChartCard title="Capital Deployment (₹ Cr)">
            <div style={{ overflow: 'visible' }}>
              <ResponsiveContainer
                width="100%" height={280} style={{ overflow: 'visible' }}>
                <BarChart data={fundDeploymentData}
                  margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid
                    {...chartStyle.cartesianGrid}/>
                  <XAxis dataKey="year"
                    tick={chartStyle.xAxis.tick}/>
                  <YAxis
                    tick={chartStyle.yAxis.tick}/>
                  <Tooltip
                    contentStyle={
                      chartStyle.tooltip.contentStyle
                    }
                    formatter={(val) => fmtCr(val)}
                  />
                  <Legend
                    wrapperStyle={
                      chartStyle.legend.wrapperStyle
                    }/>
                  <Bar dataKey="committed"
                    name="Committed"
                    fill="rgba(0,180,166,0.2)"
                    radius={[4,4,0,0]}/>
                  <Bar dataKey="deployed"
                    name="Deployed"
                    fill="#00B4A6"
                    radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Portfolio by Stage">
            <ResponsiveContainer
              width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.portfolio}
                  cx="50%" cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value">
                  {data.portfolio.map(
                    (entry, i) => (
                    <Cell key={i}
                      fill={entry.color}/>
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={
                    chartStyle.tooltip.contentStyle
                  }/>
                <Legend
                  wrapperStyle={
                    chartStyle.legend.wrapperStyle
                  }/>
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Fund cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns:
            isMobile ? 'repeat(2,1fr)' : 'repeat(5,1fr)',
          gap: 12
        }}>
          {data.funds.map((f, i) => (
            <div key={i} style={{
              background: '#111110',
              borderTop: `3px solid ${f.color}`,
              borderRadius: 12,
              padding: 20
            }}>
              <div style={{
                fontSize: 15,
                color: '#fff',
                fontWeight: 500,
                marginBottom: 6
              }}>{f.name}</div>
              <div style={{
                fontSize: 12,
                color: '#9e9b92',
                marginBottom: 12
              }}>{f.stage}</div>
              <span style={{
                display: 'inline-block',
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 20,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: f.status==='Active'
                  ? 'rgba(74,174,140,0.12)'
                  : 'rgba(201,168,76,0.1)',
                color: f.status==='Active'
                  ? '#6fcfb0' : '#c9a84c',
                border: f.status==='Active'
                  ? '1px solid rgba(74,174,140,0.25)'
                  : '1px solid rgba(201,168,76,0.2)'
              }}>{f.status}</span>
              {f.investments > 0 && (
                <div style={{
                  fontSize: 12,
                  color: '#9e9b92',
                  marginTop: 10
                }}>
                  <span style={{color:'#fff',
                    fontWeight:500}}>
                    {f.investments}
                  </span>
                  {' '}investments
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      )}

      {/* IRR */}
      {isVisible('unit_economics') && (
      <section id="unit-economics" style={{
        padding: isMobile ? '32px 16px' : '60px 80px',
        borderTop:
          '1px solid rgba(255,255,255,0.06)'
      }}>
        <SectionLabel
          label="Unit Economics & Returns"/>
        <SectionTitle
          title="IRR Progression"/>

        <ChartCard
          title="IRR Over Time (%)">
          <ResponsiveContainer
            width="100%" height={280}>
            <AreaChart data={data.irr}>
              <defs>
                <linearGradient
                  id="irrGrad"
                  x1="0" y1="0"
                  x2="0" y2="1">
                  <stop offset="5%"
                    stopColor="#c9a84c"
                    stopOpacity={0.2}/>
                  <stop offset="95%"
                    stopColor="#c9a84c"
                    stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid
                {...chartStyle.cartesianGrid}/>
              <XAxis dataKey="month"
                tick={chartStyle.xAxis.tick}/>
              <YAxis
                tick={chartStyle.yAxis.tick}/>
              <Tooltip
                contentStyle={
                  chartStyle.tooltip.contentStyle
                }/>
              <ReferenceLine y={40}
                stroke="rgba(201,168,76,0.4)"
                strokeDasharray="4 4"
                label={{
                  value: 'Current 40%',
                  fill: '#c9a84c',
                  fontSize: 12
                }}/>
              <Area
                dataKey="irr"
                name="IRR %"
                stroke="#c9a84c"
                strokeWidth={2}
                fill="url(#irrGrad)"
                dot={{
                  fill:'#c9a84c', r:4
                }}/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
      )}

      {/* FINANCIALS / P&L */}
      {isVisible('pnl') && (
      <section id="financials" style={{
        padding: isMobile ? '32px 16px' : '60px 80px',
        borderTop:
          '1px solid rgba(255,255,255,0.06)'
      }}>
        <SectionLabel label="Financial Overview"/>
        <SectionTitle
          title="Profit & Loss Statement"/>
        <p style={{ fontSize: 15, color: '#9e9b92', marginTop: -20, marginBottom: 40, maxWidth: 600 }}>
          IA India Accelerator Private Limited — Standalone financials
        </p>

        {/* Year selector */}
        <div style={{
          display: 'flex', alignItems: 'center',
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['FY25','FY26'].map(y => (
              <button key={y}
                onClick={() =>
                  setSelectedYear(y)}
                style={{
                  padding: '8px 24px',
                  borderRadius: 20,
                  border: selectedYear===y
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.12)',
                  background: selectedYear===y
                    ? '#c9a84c' : 'transparent',
                  color: selectedYear===y
                    ? '#0a0a08' : 'rgba(255,255,255,0.5)',
                  fontSize: 14,
                  fontWeight: selectedYear===y
                    ? 500 : 400,
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)'
                }}>
                {y}
              </button>
            ))}
          </div>
          
          {selectedYear === 'FY26' && (
            <span style={{
              fontSize: 11,
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.2)',
              color: '#c9a84c',
              padding: '3px 10px',
              borderRadius: 20,
              fontWeight: 500,
              marginLeft: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              Provisional
            </span>
          )}

          {selectedYear === 'FY25' && (
            <span style={{
              fontSize: 11,
              background: 'rgba(74,174,140,0.1)',
              border: '1px solid rgba(74,174,140,0.2)',
              color: '#6fcfb0',
              padding: '3px 10px',
              borderRadius: 20,
              fontWeight: 500,
              marginLeft: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              Audited
            </span>
          )}
        </div>

        {/* P&L table */}
        <div style={{
          background: '#111110',
          border:
            '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12,
          padding: 24
        }}>
          <div style={{
            fontSize: 15,
            fontWeight: 500,
            color: '#fff',
            marginBottom: 16
          }}>
            Income Statement — {selectedYear}
          </div>
          {plData.map((row, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom:
                i < plData.length-1
                  ? '1px solid rgba(255,255,255,0.04)'
                  : 'none'
            }}>
              <div style={{
                fontSize: 14,
                color: row.type==='total'||
                       row.type==='profit'
                  ? '#fff' : '#9e9b92',
                fontWeight: row.type==='total'||
                             row.type==='profit'
                  ? 500 : 400
              }}>{row.metric}</div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <div style={{
                  fontSize: 14,
                  color: row.type==='expense'
                    ? '#f08070' : '#fff',
                  fontWeight: 500
                }}>
                  {row.type==='margin'
                    ? row.value
                    : fmtCr(row.value)
                  }
                </div>
                {row.growth && (
                  <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 20,
                    background:
                      row.type==='expense'
                        ? 'rgba(224,92,74,0.1)'
                        : 'rgba(74,174,140,0.1)',
                    color: row.type==='expense'
                      ? '#f08070' : '#6fcfb0',
                    border: row.type==='expense'
                      ? '1px solid rgba(224,92,74,0.2)'
                      : '1px solid rgba(74,174,140,0.2)'
                  }}>
                    {row.growth}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* BALANCE SHEET */}
      {isVisible('balance_sheet') && (
      <section id="balance-sheet" style={{
        padding: isMobile ? '32px 16px' : '60px 80px',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <SectionLabel label="BALANCE SHEET" />
        <SectionTitle title="Financial Position" />
        <p style={{ fontSize: 15, color: '#9e9b92', marginTop: -20, marginBottom: 40, maxWidth: 600 }}>
          Key balance sheet metrics as at 31st March 2025 (Audited)
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: 24
        }}>
          {/* Assets */}
          <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 15, color: '#fff', fontWeight: 500 }}>Total Assets — {fmtCr(assetsfy25)}</div>
                <div style={{ fontSize: 12, color: '#c9a84c', marginTop: 4 }}>FY26: {fmtCr(assetsfy26)} (Provisional)</div>
              </div>
            </div>
            {[
              { l: 'Non-current Assets', v: 10.03 },
              { l: 'Current Assets', v: 31.89 },
              { l: 'Cash & Equivalents', v: 16.36 },
              { l: 'Trade Receivables', v: 5.44 },
              { l: 'Investments', v: 7.35 },
              { l: 'Other Assets', v: 3.03 },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                borderBottom: i<5 ? '1px solid rgba(255,255,255,0.04)' : 'none'
              }}>
                <span style={{ fontSize: 14, color: '#9e9b92' }}>{row.l}</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{fmtCr(row.v)}</span>
              </div>
            ))}
          </div>

          {/* Equity & Liabilities */}
          <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 15, color: '#fff', fontWeight: 500 }}>Total Liabilities — {fmtCr(assetsfy25)}</div>
                <div style={{ fontSize: 12, color: '#c9a84c', marginTop: 4 }}>FY26 Equity: {fmtCr(equityfy26)} (Provisional)</div>
              </div>
            </div>
            {[
              { l: 'Shareholders Equity', v: equityfy25 },
              { l: 'Long-term Borrowings', v: 1.89 },
              { l: 'Short-term Borrowings', v: 0.73 },
              { l: 'Trade Payables', v: 2.71 },
              { l: 'Other Current Liabilities', v: 5.42 },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                borderBottom: i<4 ? '1px solid rgba(255,255,255,0.04)' : 'none'
              }}>
                <span style={{ fontSize: 14, color: '#9e9b92' }}>{row.l}</span>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{fmtCr(row.v)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Highlight Bar */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,180,166,0.06), rgba(201,168,76,0.06))',
          border: '1px solid rgba(0,180,166,0.15)',
          borderRadius: 12, padding: 24, marginTop: 40,
          display: 'flex', justifyContent: 'space-around', alignItems: 'center'
        }}>
          {[
            { v: '268% Revenue Growth', l: 'FY24→FY26', c: '#00B4A6' },
            { v: 'Profitable in FY25', l: 'First profitable year', c: '#c9a84c' },
            { v: 'Strong Liquidity', l: 'Current Ratio 3.72', c: '#fff' },
          ].map((h, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Cormorant Garamond', fontSize: 22, color: h.c, fontWeight: 300 }}>{h.v}</div>
              <div style={{ fontSize: 12, color: '#9e9b92', marginTop: 4 }}>{h.l}</div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* KEY FORECASTS */}
      {isVisible('forecasts') && (
      <section id="forecasts" style={{
        padding: isMobile ? '32px 16px' : '60px 80px',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{
          fontSize: 11, color: '#c9a84c',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          fontWeight: 500, marginBottom: 8
        }}>KEY FORECASTS</div>
        <div style={{
          fontFamily: 'Cormorant Garamond',
          fontSize: 42, fontWeight: 300,
          color: '#fff', marginBottom: 8
        }}>Financial Forecasts FY26–FY29</div>
        <p style={{ fontSize: 15, color: '#9e9b92', marginBottom: 48, maxWidth: 600 }}>
          Forward-looking projections across Infrastructure, Accelerator and Fund verticals
        </p>

        {/* BLOCK 1: INFRASTRUCTURE */}
        <div style={{
          fontSize: 11, color: '#00B4A6',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: 24, fontWeight: 500
        }}>INFRASTRUCTURE</div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 24, marginBottom: 48
        }}>
          {/* Chart 1: Cities & Hubs */}
          <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 16 }}>Total Cities & Hubs</div>
            <div style={{ overflow: 'visible' }}>
              <ResponsiveContainer width="100%" height={220} style={{ overflow: 'visible' }}>
                <BarChart data={forecastSeriesDual('cities', 'hubs')}
                  margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid {...chartStyle.cartesianGrid} />
                  <XAxis dataKey="year" tick={chartStyle.xAxis.tick} />
                  <Tooltip contentStyle={chartStyle.tooltip.contentStyle} />
                  <Legend wrapperStyle={chartStyle.legend.wrapperStyle} verticalAlign="bottom" />
                  <Bar dataKey="value1" name="Cities" fill="#00B4A6" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="value1" position="top" style={{ fill: '#9e9b92', fontSize: 11, fontFamily: 'DM Sans' }} />
                  </Bar>
                  <Bar dataKey="value2" name="Hubs" fill="rgba(0,180,166,0.35)" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="value2" position="top" style={{ fill: '#9e9b92', fontSize: 11, fontFamily: 'DM Sans' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Total Seats */}
          <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 16 }}>Total Seats (In 000's)</div>
            <div style={{ overflow: 'visible' }}>
              <ResponsiveContainer width="100%" height={220} style={{ overflow: 'visible' }}>
                <BarChart data={forecastSeries('seats')}
                  margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid {...chartStyle.cartesianGrid} />
                  <XAxis dataKey="year" tick={chartStyle.xAxis.tick} />
                  <Tooltip contentStyle={chartStyle.tooltip.contentStyle} />
                  <Bar dataKey="value" name="Seats (000s)" fill="#00B4A6" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="value" position="top" style={{ fill: '#9e9b92', fontSize: 11, fontFamily: 'DM Sans' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Rental Revenue */}
          <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 16 }}>Rental Revenue (₹ Cr)</div>
            <div style={{ overflow: 'visible' }}>
              <ResponsiveContainer width="100%" height={220} style={{ overflow: 'visible' }}>
                <BarChart data={forecastSeries('rental_revenue')}
                  margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid {...chartStyle.cartesianGrid} />
                  <XAxis dataKey="year" tick={chartStyle.xAxis.tick} />
                  <Tooltip contentStyle={chartStyle.tooltip.contentStyle} formatter={(val) => fmtCr(val)} />
                  <Bar dataKey="value" name="Revenue (Cr)" fill="#00B4A6" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="value" position="top" formatter={(val) => fmtCr(val)} style={{ fill: '#9e9b92', fontSize: 11, fontFamily: 'DM Sans' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* BLOCK 2: ACCELERATOR & FUND */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '65% 35%',
          gap: 24
        }}>
          {/* Accelerator Column */}
          <div>
            <div style={{
              fontSize: 11, color: '#00B4A6',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 24, fontWeight: 500
            }}>{isMobile ? 'ACCELERATOR' : 'ACCELERATOR (MENTOR EQUITY)'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
              {/* Startup Added */}
              <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 12 }}>Startups Added</div>
                <div style={{ overflow: 'visible' }}>
                  <ResponsiveContainer width="100%" height={200} style={{ overflow: 'visible' }}>
                    <BarChart data={forecastSeries('startups_added')}
                      margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid {...chartStyle.cartesianGrid} />
                      <XAxis dataKey="year" tick={chartStyle.xAxis.tick} />
                      <Bar dataKey="value" fill="#00B4A6" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="value" position="top" style={{ fill: '#9e9b92', fontSize: 11, fontFamily: 'DM Sans' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Equity Value */}
              <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 12 }}>Equity Value (₹ Cr)</div>
                <div style={{ overflow: 'visible' }}>
                  <ResponsiveContainer width="100%" height={200} style={{ overflow: 'visible' }}>
                    <BarChart data={forecastSeries('equity_value')}
                      margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid {...chartStyle.cartesianGrid} />
                      <XAxis dataKey="year" tick={chartStyle.xAxis.tick} />
                      <Bar dataKey="value" fill="#00B4A6" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="value" position="top" formatter={(val) => fmtCr(val)} style={{ fill: '#9e9b92', fontSize: 11, fontFamily: 'DM Sans' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* CoE Rev */}
              <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 12 }}>CoE Revenue (₹ Cr)</div>
                <div style={{ overflow: 'visible' }}>
                  <ResponsiveContainer width="100%" height={200} style={{ overflow: 'visible' }}>
                    <BarChart data={forecastSeries('support_coe_rev')}
                      margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid {...chartStyle.cartesianGrid} />
                      <XAxis dataKey="year" tick={chartStyle.xAxis.tick} />
                      <Bar dataKey="value" fill="#00B4A6" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="value" position="top" formatter={(val) => fmtCr(val)} style={{ fill: '#9e9b92', fontSize: 11, fontFamily: 'DM Sans' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Fund Column */}
          <div>
            <div style={{
              fontSize: 11, color: '#c9a84c',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 24, fontWeight: 500
            }}>{isMobile ? 'FUND' : 'FUND (EXCLUDING CARRY)'}</div>
            <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 12 }}>IA Share from Fund (₹ Cr)</div>
              <div style={{ overflow: 'visible' }}>
                <ResponsiveContainer width="100%" height={200} style={{ overflow: 'visible' }}>
                  <BarChart data={forecastSeries('ia_fund_share')}
                    margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid {...chartStyle.cartesianGrid} />
                    <XAxis dataKey="year" tick={chartStyle.xAxis.tick} />
                    <Bar dataKey="value" fill="#c9a84c" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="value" position="top" formatter={(val) => fmtCr(val)} style={{ fill: '#9e9b92', fontSize: 11, fontFamily: 'DM Sans' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Footer */}
      <div style={{
        borderTop:
          '1px solid rgba(255,255,255,0.06)',
        padding: isMobile ? '24px 16px' : '32px 80px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{
          fontSize: 14, color: '#9e9b92'
        }}>
          © 2026 India Accelerator
          — Confidential
        </span>
        <a href="mailto:invest@indiaaccelerator.co"
          style={{
            fontSize: 14,
            color: '#c9a84c',
            textDecoration: 'none'
          }}>
          invest@indiaaccelerator.co
        </a>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function TopBar({ navigate, currency,
  setCurrency, isMobile }) {
  return (
    <div style={{
      position: 'fixed', top: 0,
      left: 0, right: 0, zIndex: 50,
      height: 64, padding: isMobile ? '0 16px' : '0 40px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(10,10,8,0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom:
        '1px solid rgba(255,255,255,0.06)'
    }}>
      <button onClick={() => navigate('/')}
        style={{
          fontSize: 15, color: '#c9a84c',
          background: 'none', border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--sans)'
        }}>
        ← Back to Portal
      </button>
      {!isMobile && (
      <span style={{
        fontSize: 14, color:
          'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: '0.15em'
      }}>
        Financial Projections
      </span>
      )}
      <div style={{
        display: 'flex', gap: 4,
        alignItems: 'center'
      }}>
        {['INR','USD'].map(c => (
          <button key={c}
            onClick={() => setCurrency(c)}
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              border: currency===c
                ? 'none'
                : '1px solid rgba(255,255,255,0.15)',
              background: currency===c
                ? '#c9a84c' : 'transparent',
              color: currency===c
                ? '#0a0a08'
                : 'rgba(255,255,255,0.5)',
              fontSize: 13,
              fontWeight: currency===c ? 500:400,
              cursor: 'pointer',
              fontFamily: 'var(--sans)'
            }}>{c}</button>
        ))}
        <span style={{
          fontSize: 14, color: '#00B4A6',
          marginLeft: 16
        }}>
          India Accelerator
        </span>
      </div>
    </div>
  );
}

function SectionLabel({ label }) {
  return (
    <div style={{
      fontSize: 13, color: '#c9a84c',
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      fontWeight: 500, marginBottom: 8
    }}>{label}</div>
  );
}

function SectionTitle({ title }) {
  return (
    <div style={{
      fontFamily: 'Cormorant Garamond',
      fontSize: 42, fontWeight: 300,
      color: '#fff', marginBottom: 32
    }}>{title}</div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{
      background: '#111110',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12, padding: 24
    }}>
      <div style={{
        fontSize: 15, fontWeight: 500,
        color: '#fff', marginBottom: 20
      }}>{title}</div>
      {children}
    </div>
  );
}
