import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';

const WORLD_GEO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const GLOBAL_LOCATIONS = [
  {
    id: 'india',
    name: 'India',
    flag: '🇮🇳',
    focus: 'IA Headquarters',
    type: 'HQ',
    coordinates: [78.9629, 20.5937]
  },
  {
    id: 'usa',
    name: 'United States',
    flag: '🇺🇸',
    focus: 'SaaS, Deeptech',
    type: 'Partner',
    coordinates: [-95.7129, 37.0902]
  },
  {
    id: 'canada',
    name: 'Canada',
    flag: '🇨🇦',
    focus: 'Health, D2C',
    type: 'Partner',
    coordinates: [-106.3468, 56.1304]
  },
  {
    id: 'germany',
    name: 'Germany',
    flag: '🇩🇪',
    focus: 'Fintech, AI',
    type: 'Partner',
    coordinates: [10.4515, 51.1657]
  },
  {
    id: 'uae',
    name: 'UAE',
    flag: '🇦🇪',
    focus: 'Health, Fintech',
    type: 'Partner',
    coordinates: [53.8478, 23.4241]
  },
  {
    id: 'saudi',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    focus: 'Energy, AI',
    type: 'Partner',
    coordinates: [45.0792, 23.8859]
  },
  {
    id: 'japan',
    name: 'Japan',
    flag: '🇯🇵',
    focus: 'AI, EV, Life Sciences',
    type: 'Partner',
    coordinates: [138.2529, 36.2048]
  },
  {
    id: 'australia',
    name: 'Australia',
    flag: '🇦🇺',
    focus: 'Cleantech, AI',
    type: 'Partner',
    coordinates: [133.7751, -25.2744]
  },
]

const INDIA_CITIES = [
  {city:'Gurgaon', coordinates:[77.0266,28.4595], hubs:5, type:'HQ'},
  {city:'New Delhi', coordinates:[77.1025,28.7041], hubs:3, type:'Hub'},
  {city:'Noida', coordinates:[77.3910,28.5355], hubs:2, type:'Hub'},
  {city:'Mumbai', coordinates:[72.8777,19.0760], hubs:3, type:'Hub'},
  {city:'Bangalore', coordinates:[77.5946,12.9716], hubs:3, type:'Hub'},
  {city:'Hyderabad', coordinates:[78.4867,17.3850], hubs:2, type:'Hub'},
  {city:'Chennai', coordinates:[80.2707,13.0827], hubs:1, type:'Hub'},
  {city:'Pune', coordinates:[73.8567,18.5204], hubs:2, type:'Hub'},
  {city:'Kolkata', coordinates:[88.3639,22.5726], hubs:1, type:'Hub'},
  {city:'Ahmedabad', coordinates:[72.5714,23.0225], hubs:2, type:'Hub'},
  {city:'Jaipur', coordinates:[75.7873,26.9124], hubs:1, type:'Hub'},
  {city:'Chandigarh', coordinates:[76.7794,30.7333], hubs:1, type:'Hub'},
  {city:'Surat', coordinates:[72.8311,21.1702], hubs:1, type:'Hub'},
  {city:'Ludhiana', coordinates:[75.8573,30.9010], hubs:1, type:'Hub'},
  {city:'Amritsar', coordinates:[74.8723,31.6340], hubs:1, type:'Hub'},
  {city:'Dehradun', coordinates:[78.0322,30.3165], hubs:1, type:'Hub'},
]

export default function PresencePage({ email }) {
  const navigate = useNavigate();
  const [hoveredGlobal, setHoveredGlobal] = 
    useState(null);
  const [hoveredCity, setHoveredCity] = 
    useState(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a08',
      fontFamily: 'DM Sans, sans-serif'
    }}>

      {/* TOP BAR */}
      <div style={{
        position: 'fixed', top: 0,
        left: 0, right: 0, zIndex: 50,
        height: 64, padding: '0 40px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(10,10,8,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            fontSize: 15, color: '#c9a84c',
            background: 'none', border: 'none',
            cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif'
          }}>
          ← Back to Portal
        </button>
        <span style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em'
        }}>Our Presence</span>
        <span style={{
          fontSize: 14, color: '#00B4A6'
        }}>
          India Accelerator
        </span>
      </div>

      <div style={{ paddingTop: 64 }}>

        {/* HERO */}
        <section style={{
          padding: '60px 80px 40px'
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
            }}>OUR PRESENCE</div>
          </div>

          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 64, fontWeight: 300,
            color: '#fff', lineHeight: 1.0
          }}>
            Pan-India & Global
          </div>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 64, fontStyle: 'italic',
            color: '#00B4A6', lineHeight: 1.0,
            marginBottom: 20
          }}>
            Footprint
          </div>
          <div style={{
            fontSize: 17, color: '#9e9b92',
            maxWidth: 600, lineHeight: 1.7,
            marginBottom: 40
          }}>
            30+ coworking hubs across 16 Indian 
            cities with international presence 
            in 8 countries spanning 4 continents.
          </div>

          {/* Stat pills */}
          <div style={{
            display: 'flex', gap: 12,
            flexWrap: 'wrap'
          }}>
            {[
              '30+ Coworking Hubs',
              '16 Indian Cities',
              '8 Countries',
              '4 Continents'
            ].map(s => (
              <div key={s} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 40,
                padding: '10px 24px',
                fontSize: 14, color: '#9e9b92'
              }}>{s}</div>
            ))}
          </div>
        </section>

        {/* WORLD MAP */}
        <section style={{
          padding: '60px 80px',
          borderTop: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{
            fontSize: 13, color: '#c9a84c',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontWeight: 500, marginBottom: 8
          }}>GLOBAL PRESENCE</div>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 42, fontWeight: 300,
            color: '#fff', marginBottom: 8
          }}>International Footprint</div>
          <div style={{
            fontSize: 15, color: '#9e9b92',
            marginBottom: 40
          }}>
            Strategic partnerships and presence 
            across key global markets
          </div>

          {/* World Map Container */}
          <div style={{
            background: 'linear-gradient(135deg,#0d1a2e,#0a1520)',
            borderRadius: 16,
            border: '1px solid rgba(0,180,166,0.15)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <ComposableMap
              projectionConfig={{
                scale: 147,
                center: [20, 10]
              }}
              style={{
                width: '100%',
                height: 'auto'
              }}>
              <ZoomableGroup>
                <Geographies
                  geography={WORLD_GEO_URL}>
                  {({ geographies }) =>
                    geographies.map(geo => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        style={{
                          default: {
                            fill: 'rgba(0,180,166,0.12)',
                            stroke: 'rgba(0,180,166,0.25)',
                            strokeWidth: 0.5,
                            outline: 'none'
                          },
                          hover: {
                            fill: 'rgba(0,180,166,0.2)',
                            stroke: 'rgba(0,180,166,0.4)',
                            strokeWidth: 0.5,
                            outline: 'none'
                          },
                          pressed: {
                            fill: 'rgba(0,180,166,0.2)',
                            outline: 'none'
                          }
                        }}
                      />
                    ))
                  }
                </Geographies>

                {GLOBAL_LOCATIONS.map(loc => (
                  <Marker
                    key={loc.id}
                    coordinates={loc.coordinates}
                    onMouseEnter={() =>
                      setHoveredGlobal(loc.id)}
                    onMouseLeave={() =>
                      setHoveredGlobal(null)}>

                    {/* Pulse ring */}
                    <circle
                      r={hoveredGlobal===loc.id
                        ? 14 : 10}
                      fill="none"
                      stroke={loc.type==='HQ'
                        ? '#c9a84c'
                        : '#e05c4a'}
                      strokeWidth="1"
                      opacity="0.4"
                      style={{
                        transition: 'r 0.3s ease'
                      }}
                    />

                    {/* Main pin */}
                    <circle
                      r={loc.type==='HQ' ? 6 : 5}
                      fill={loc.type==='HQ'
                        ? '#c9a84c' : '#e05c4a'}
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth="1.5"
                      style={{cursor:'pointer'}}
                    />

                    {/* Label */}
                    {hoveredGlobal === loc.id && (
                      <foreignObject
                        x={loc.coordinates[0] > 100
                          ? -160 : 12}
                        y={-50}
                        width="150"
                        height="70">
                        <div style={{
                          background:
                            'rgba(10,10,8,0.97)',
                          border:
                            '1px solid rgba(255,255,255,0.15)',
                          borderRadius: 8,
                          padding: '8px 12px',
                          fontSize: 12,
                          color: 'white',
                          backdropFilter:
                            'blur(10px)',
                          pointerEvents: 'none'
                        }}>
                          <div style={{
                            fontSize: 13,
                            fontWeight: 500,
                            marginBottom: 2
                          }}>
                            {loc.flag} {loc.name}
                          </div>
                          <div style={{
                            fontSize: 11,
                            color: '#00B4A6'
                          }}>
                            {loc.focus}
                          </div>
                        </div>
                      </foreignObject>
                    )}
                  </Marker>
                ))}
              </ZoomableGroup>
            </ComposableMap>
          </div>

          {/* Legend */}
          <div style={{
            display: 'flex', gap: 24,
            marginTop: 16, fontSize: 13,
            color: '#9e9b92',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center', gap: 8
            }}>
              <div style={{
                width: 10, height: 10,
                borderRadius: '50%',
                background: '#e05c4a'
              }}/>
              Partner Location
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center', gap: 8
            }}>
              <div style={{
                width: 10, height: 10,
                borderRadius: '50%',
                background: '#c9a84c'
              }}/>
              IA Headquarters
            </div>
          </div>

          {/* Global location cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(4,1fr)',
            gap: 12, marginTop: 32
          }}>
            {GLOBAL_LOCATIONS.map(loc => (
              <div key={loc.id}
                onMouseEnter={() =>
                  setHoveredGlobal(loc.id)}
                onMouseLeave={() =>
                  setHoveredGlobal(null)}
                style={{
                  background: hoveredGlobal===loc.id
                    ? 'rgba(0,180,166,0.08)'
                    : '#111110',
                  border: hoveredGlobal===loc.id
                    ? '1px solid rgba(0,180,166,0.3)'
                    : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  padding: '16px 20px',
                  cursor: 'default',
                  transition: 'all 0.2s'
                }}>
                <div style={{
                  fontSize: 24,
                  marginBottom: 8
                }}>
                  {loc.flag}
                </div>
                <div style={{
                  fontSize: 15, color: '#fff',
                  fontWeight: 500, marginBottom: 4
                }}>
                  {loc.name}
                </div>
                <div style={{
                  fontSize: 12,
                  color: '#00B4A6',
                  marginBottom: 6
                }}>
                  {loc.focus}
                </div>
                <span style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: loc.type==='HQ'
                    ? 'rgba(201,168,76,0.1)'
                    : 'rgba(0,180,166,0.1)',
                  color: loc.type==='HQ'
                    ? '#c9a84c' : '#00B4A6',
                  border: loc.type==='HQ'
                    ? '1px solid rgba(201,168,76,0.2)'
                    : '1px solid rgba(0,180,166,0.2)',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {loc.type}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* INDIA MAP */}
        <section style={{
          padding: '60px 80px 80px',
          borderTop:
            '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{
            fontSize: 13, color: '#c9a84c',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontWeight: 500, marginBottom: 8
          }}>PAN-INDIA PRESENCE</div>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 42, fontWeight: 300,
            color: '#fff', marginBottom: 8
          }}>30+ Hubs Across 16 Cities</div>
          <div style={{
            fontSize: 15, color: '#9e9b92',
            marginBottom: 40
          }}>
            Coworking spaces, accelerator hubs 
            and innovation centres spanning 
            major Indian cities
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 40, alignItems: 'start'
          }}>

            {/* India Map */}
            <div style={{
              background:
                'linear-gradient(135deg,#0d1a2e,#0a1520)',
              borderRadius: 16,
              border:
                '1px solid rgba(0,180,166,0.15)',
              overflow: 'hidden',
              padding: '20px'
            }}>
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 1000,
                  center: [82, 22]
                }}
                style={{
                  width: '100%',
                  height: 'auto'
                }}>
                <Geographies
                  geography={WORLD_GEO_URL}>
                  {({ geographies }) =>
                    geographies
                      .filter(geo =>
                        geo.properties.name
                          === 'India')
                      .map(geo => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          style={{
                            default: {
                              fill: 'rgba(0,180,166,0.15)',
                              stroke: 'rgba(0,180,166,0.4)',
                              strokeWidth: 1,
                              outline: 'none'
                            },
                            hover: {
                              fill: 'rgba(0,180,166,0.15)',
                              outline: 'none'
                            },
                            pressed: {
                              fill: 'rgba(0,180,166,0.15)',
                              outline: 'none'
                            }
                          }}
                        />
                      ))
                  }
                </Geographies>

                {INDIA_CITIES.map(loc => (
                  <Marker
                    key={loc.city}
                    coordinates={loc.coordinates}
                    onMouseEnter={() =>
                      setHoveredCity(loc.city)}
                    onMouseLeave={() =>
                      setHoveredCity(null)}>

                    <circle
                      r={hoveredCity===loc.city
                        ? 10 : 7}
                      fill="none"
                      stroke={loc.type==='HQ'
                        ? '#c9a84c' : '#00B4A6'}
                      strokeWidth="1"
                      opacity="0.4"
                      style={{
                        transition: 'r 0.2s'
                      }}
                    />
                    <circle
                      r={loc.type==='HQ' ? 5 : 4}
                      fill={loc.type==='HQ'
                        ? '#c9a84c' : '#00B4A6'}
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth="1"
                      style={{cursor:'pointer'}}
                    />

                    {hoveredCity===loc.city && (
                      <foreignObject
                        x={loc.coordinates[0] > 80
                          ? -130 : 10}
                        y={-45}
                        width="120"
                        height="60">
                        <div style={{
                          background:
                            'rgba(10,10,8,0.97)',
                          border:
                            '1px solid rgba(255,255,255,0.15)',
                          borderRadius: 8,
                          padding: '6px 10px',
                          fontSize: 11,
                          color: 'white',
                          pointerEvents: 'none'
                        }}>
                          <div style={{
                            fontWeight: 500,
                            marginBottom: 2,
                            fontSize: 12
                          }}>
                            {loc.city}
                            {loc.type==='HQ' &&
                              ' 🏢'}
                          </div>
                          <div style={{
                            color: '#00B4A6',
                            fontSize: 11
                          }}>
                            {loc.hubs} hub
                            {loc.hubs>1?'s':''}
                          </div>
                        </div>
                      </foreignObject>
                    )}
                  </Marker>
                ))}
              </ComposableMap>
            </div>

            {/* City list */}
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                marginBottom: 32
              }}>
                {INDIA_CITIES.map(loc => (
                  <div
                    key={loc.city}
                    onMouseEnter={() =>
                      setHoveredCity(loc.city)}
                    onMouseLeave={() =>
                      setHoveredCity(null)}
                    style={{
                      background:
                        hoveredCity===loc.city
                          ? 'rgba(0,180,166,0.08)'
                          : '#111110',
                      border:
                        hoveredCity===loc.city
                          ? '1px solid rgba(0,180,166,0.3)'
                          : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 10,
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'default',
                      transition: 'all 0.2s'
                    }}>
                    <div style={{
                      width: 8, height: 8,
                      borderRadius: '50%',
                      background:
                        loc.type==='HQ'
                          ? '#c9a84c' : '#00B4A6',
                      flexShrink: 0
                    }}/>
                    <div style={{
                      flex: 1, fontSize: 14,
                      color: '#fff',
                      fontWeight: loc.type==='HQ'
                        ? 500 : 400
                    }}>
                      {loc.city}
                    </div>
                    {loc.hubs > 1 && (
                      <span style={{
                        fontSize: 11,
                        color: '#00B4A6',
                        background:
                          'rgba(0,180,166,0.1)',
                        padding: '2px 8px',
                        borderRadius: 20,
                        border:
                          '1px solid rgba(0,180,166,0.2)'
                      }}>
                        {loc.hubs} hubs
                      </span>
                    )}
                    {loc.type === 'HQ' && (
                      <span style={{
                        fontSize: 10,
                        color: '#c9a84c',
                        background:
                          'rgba(201,168,76,0.1)',
                        padding: '2px 8px',
                        borderRadius: 20,
                        border:
                          '1px solid rgba(201,168,76,0.2)',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>HQ</span>
                    )}
                  </div>
                ))}
              </div>

              {/* India stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(2,1fr)',
                gap: 12
              }}>
                {[
                  {v:'30+', l:'Total Hubs'},
                  {v:'16', l:'Cities'},
                  {v:'500+', l:'Community Startups'},
                  {v:'2018', l:'Est. Year'},
                ].map(s => (
                  <div key={s.l} style={{
                    background: '#111110',
                    border:
                      '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 12,
                    padding: '20px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontFamily:
                        'Cormorant Garamond, serif',
                      fontSize: 36,
                      color: '#c9a84c',
                      fontWeight: 300,
                      marginBottom: 4
                    }}>{s.v}</div>
                    <div style={{
                      fontSize: 12,
                      color: '#9e9b92',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em'
                    }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
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
          <a
            href="mailto:invest@indiaaccelerator.co"
            style={{
              fontSize: 14, color: '#c9a84c',
              textDecoration: 'none'
            }}>
            invest@indiaaccelerator.co
          </a>
        </div>

      </div>
    </div>
  );
}
