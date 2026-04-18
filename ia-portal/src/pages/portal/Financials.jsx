import React, { useEffect, useState } 
  from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { Dots } from '../../components/UI';

const DEFAULT_SHEET_ID = 
  '1X6bUGtXki3HJWhYlISKVMBr_SjHKi8dNr1OOrUSYr8w';

function parseCSV(text) {
  if (!text || !text.trim()) return [];
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',')
    .map(h => h.replace(/"/g, '').trim());
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += line[i];
        }
      }
      values.push(current.trim());
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = (values[i] || '').trim();
      });
      return obj;
    });
}

async function fetchSheet(sheetId, tabName) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(
    `Failed to fetch ${tabName}`
  );
  const text = await res.text();
  return parseCSV(text);
}

const chartStyle = {
  cartesianGrid: {
    strokeDasharray: '3 3',
    stroke: 'rgba(255,255,255,0.04)'
  },
  xAxis: {
    tick: {
      fill: 'rgba(255,255,255,0.4)',
      fontSize: 12
    }
  },
  yAxis: {
    tick: {
      fill: 'rgba(255,255,255,0.4)',
      fontSize: 12
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

export default function Financials({ email }) {
  const navigate = useNavigate();
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

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      try {
        setLoading(true);
        let activeSheetId = DEFAULT_SHEET_ID;

        // 1. Fetch dynamic config from Supabase
        const { data: config } = await supabase
          .from('content_blocks')
          .select('value')
          .eq('section_key', 'financials')
          .eq('block_key', 'sheet_url')
          .maybeSingle();

        if (config?.value) {
          const match = config.value.match(/\/d\/([a-zA-Z0-9-_]+)/);
          activeSheetId = match ? match[1] : config.value;
        }

        // 2. Fetch all tabs from Google Sheet
        const [ov, dep, port, irr, pl, funds] =
          await Promise.all([
            fetchSheet(activeSheetId, 'Overview'),
            fetchSheet(activeSheetId, 'Deployment'),
            fetchSheet(activeSheetId, 'Portfolio'),
            fetchSheet(activeSheetId, 'IRR'),
            fetchSheet(activeSheetId, 'PL (P&L)'),
            fetchSheet(activeSheetId, 'Funds'),
          ]);

        if (!cancelled) {
          const ovMap = {};
          ov.forEach(r => {
            ovMap[r.Key] = r.Value;
          });
          setData({
            overview: ovMap,
            deployment: dep.map(r => ({
              year: r.Year,
              deployed: parseFloat(r.Deployed)||0,
              committed: parseFloat(r.Committed)||0,
            })),
            portfolio: port.map(r => ({
              name: r.Stage,
              value: parseFloat(r.Count)||0,
              color: r.Color||'#00B4A6',
            })),
            irr: irr.map(r => ({
              month: r.Month,
              irr: parseFloat(r.IRR)||0,
            })),
            pl: pl,
            funds: funds.map(r => ({
              name: r.Name,
              stage: r.Stage,
              status: r.Status,
              investments: parseInt(r.Investments)||0,
              color: r.Color||'#00B4A6',
            })),
          });
          setLoading(false);
        }
      } catch(e) {
        console.error('Sheet error:', e);
        if (!cancelled) {
          setSheetError(true);
          setLoading(false);
        }
      }
    }
    loadAll();
    return () => { cancelled = true; };
  }, []);

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
    metric: r.Metric,
    value: r[selectedYear] || '—',
    growth: r['Growth_FY26'] || '',
    type: r.Type || 'income',
  }));

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a08'
    }}>
      <TopBar
        navigate={navigate}
        currency={currency}
        setCurrency={setCurrency}
      />

      {/* OVERVIEW */}
      <section id="overview" style={{
        padding: '80px 80px 60px'
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
          }}>FUND OVERVIEW</div>
        </div>

        <div style={{
          fontFamily: 'Cormorant Garamond',
          fontSize: 60, fontWeight: 300,
          color: '#fff', lineHeight: 1.0,
          marginBottom: 0
        }}>
          Building India's Most Active
        </div>
        <div style={{
          fontFamily: 'Cormorant Garamond',
          fontSize: 60, fontStyle: 'italic',
          color: '#00B4A6', lineHeight: 1.0,
          marginBottom: 20
        }}>
          Startup Ecosystem
        </div>
        <div style={{
          fontSize: 17, color: '#9e9b92',
          maxWidth: 600, lineHeight: 1.7,
          marginBottom: 48
        }}>
          India Accelerator manages{' '}
          {ov.active_funds || '5'} active funds
          with {fmtCr(ov.capital_committed, '+')}
          {' '}in commitments, deploying capital
          across pre-seed to growth stage startups.
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
              label: 'Capital Committed',
              value: fmtCr(
                ov.capital_committed, '+'
              ),
              color: '#c9a84c',
              note: ov.committed_note||'via Finvolve'
            },
            {
              label: 'Capital Deployed',
              value: fmtCr(
                ov.capital_deployed, '+'
              ),
              color: '#fff',
              note: ov.deployed_note||'55+ startups'
            },
            {
              label: 'IRR (>18 months)',
              value: (ov.irr||'40') + '%',
              color: '#00B4A6',
              note: 'since date of investment'
            },
            {
              label: 'Active Funds',
              value: ov.active_funds || '5',
              color: '#fff',
              note: 'FAT, GIFT, Brew, IAGOF'
            },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#111110',
              padding: '32px 36px'
            }}>
              <div style={{
                fontSize: 13,
                color: '#00B4A6',
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
                <span style={{color:'#00B4A6'}}>
                  →
                </span>
                {s.note}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FUND PERFORMANCE */}
      <section id="fund-performance" style={{
        padding: '60px 80px',
        borderTop:
          '1px solid rgba(255,255,255,0.06)'
      }}>
        <SectionLabel label="Fund Performance" />
        <SectionTitle title="Finvolve & Funds" />

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24, marginBottom: 32
        }}>
          <ChartCard title="Capital Deployment (₹ Cr)">
            <ResponsiveContainer
              width="100%" height={280}>
              <BarChart data={data.deployment}>
                <CartesianGrid
                  {...chartStyle.cartesianGrid}/>
                <XAxis dataKey="year"
                  tick={chartStyle.xAxis.tick}/>
                <YAxis
                  tick={chartStyle.yAxis.tick}/>
                <Tooltip
                  contentStyle={
                    chartStyle.tooltip.contentStyle
                  }/>
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
            'repeat(5,1fr)',
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

      {/* IRR */}
      <section id="unit-economics" style={{
        padding: '60px 80px',
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

      {/* FINANCIALS / P&L */}
      <section id="financials" style={{
        padding: '60px 80px',
        borderTop:
          '1px solid rgba(255,255,255,0.06)'
      }}>
        <SectionLabel label="Financial Overview"/>
        <SectionTitle
          title="P&L Summary"/>

        {/* Disclaimer */}
        <div style={{
          background: 'rgba(201,168,76,0.06)',
          border:
            '1px solid rgba(201,168,76,0.15)',
          borderRadius: 10,
          padding: '14px 20px',
          marginBottom: 24,
          fontSize: 13,
          color: 'rgba(201,168,76,0.8)',
          fontStyle: 'italic'
        }}>
          Sample projections shown for
          illustrative purposes. Actual
          financials available to serious
          investors under NDA.
        </div>

        {/* Year selector */}
        <div style={{
          display: 'flex', gap: 8,
          marginBottom: 24
        }}>
          {['FY25','FY26','FY27'].map(y => (
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

      {/* Footer */}
      <div style={{
        borderTop:
          '1px solid rgba(255,255,255,0.06)',
        padding: '32px 80px',
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
  setCurrency }) {
  return (
    <div style={{
      position: 'fixed', top: 0,
      left: 0, right: 0, zIndex: 50,
      height: 64, padding: '0 40px',
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
      <span style={{
        fontSize: 14, color:
          'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: '0.15em'
      }}>
        Financial Projections
      </span>
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
