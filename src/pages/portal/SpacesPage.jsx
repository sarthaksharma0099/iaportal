import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const INDIA_GEO_URL =
  'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson';

const HUB_CITIES = [
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
];

export default function SpacesPage({ email }) {
  const navigate = useNavigate();
  const [vertical, setVertical] = useState(null);
  const [activeCity, setActiveCity] = useState(null);
  const [mapPosition, setMapPosition] = useState({ coordinates: [82, 23], zoom: 1 });
  const isMobile = window.innerWidth <= 768;

  // PDF states
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const pdfWrapperRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data, error } = await supabase
          .from('ecosystem_verticals')
          .select('*')
          .eq('key', 'spaces')
          .single();
        if (error) throw error;
        setVertical(data);
      } catch (e) {
        console.error('Error loading spaces:', e);
      }
    }
    loadData();
  }, []);

  // Width measurement for PDF
  useEffect(() => {
    function updateWidth() {
      if (pdfWrapperRef.current) {
        const rect = pdfWrapperRef.current.getBoundingClientRect();
        const availableWidth = Math.min(
          rect.width,
          window.innerWidth - 80
        );
        setContainerWidth(availableWidth);
      }
    }
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (pdfWrapperRef.current) {
      observer.observe(pdfWrapperRef.current);
    }
    return () => observer.disconnect();
  }, [vertical]);

  useEffect(() => {
    function handleResize() {
      if (pdfWrapperRef.current) {
        const rect = pdfWrapperRef.current.getBoundingClientRect();
        const availableWidth = Math.min(
          rect.width,
          window.innerWidth - 80
        );
        setContainerWidth(availableWidth);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset PDF on vertical change
  useEffect(() => {
    setCurrentPage(1);
    setNumPages(0);
  }, [vertical?.key]);

  // Keyboard navigation for PDF
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'ArrowRight' && currentPage < numPages) {
        setPageLoading(true);
        setCurrentPage(p => p + 1);
      }
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        setPageLoading(true);
        setCurrentPage(p => p - 1);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentPage, numPages]);

  const stats = (vertical?.stats || []).filter(s => s.value !== 'XX' && s.value !== '');

  return (
    <div style={{ background: '#0a0a08', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      {/* TOP BAR */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 100,
        background: 'rgba(10,10,8,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '0 16px' : '0 48px'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: '#c9a84c', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
        >
          ← Back to Portal
        </button>
        {!isMobile && (
          <div style={{ fontSize: 13, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            SPACES
          </div>
        )}
        <div style={{ fontSize: 13, color: '#00B4A6' }}>IA Multiverse</div>
      </div>

      <div style={{ paddingTop: 64 }}>
        {/* HERO SECTION */}
        <div style={{ padding: isMobile ? '60px 20px 40px' : '80px 80px 60px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 1, background: '#c9a84c' }} />
            <span style={{ fontSize: 11, color: '#c9a84c', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>FOUNDER ACCESS</span>
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? 36 : 64, fontWeight: 300, marginBottom: 16, color: '#fff' }}>
            Spaces
          </h1>
          <p style={{ fontSize: 18, color: '#9e9b92', maxWidth: 600, lineHeight: 1.6, marginBottom: 48 }}>
            {vertical?.description}
          </p>

          <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
            {stats.map((s, i) => (
              <React.Fragment key={i}>
                <div style={{ padding: isMobile ? '0 12px' : '0 32px', textAlign: 'center', minWidth: isMobile ? 80 : 120 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? 28 : 48, color: '#c9a84c', fontWeight: 300, lineHeight: 1, marginBottom: 8 }}>
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

        {/* INDIA HUB MAP SECTION */}
        <div style={{ padding: isMobile ? '40px 16px' : '60px 80px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, color: '#c9a84c', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
            OUR NETWORK
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? 24 : 36, fontWeight: 300, color: '#fff', marginBottom: 8 }}>
            33 Hubs Across India
          </h2>
          <p style={{ fontSize: 15, color: '#9e9b92', maxWidth: 600, lineHeight: 1.6 }}>
            Tier 2 & 3 cities chosen for industry strength, talent density, and founder catchment
          </p>

          <div style={{
            background: 'linear-gradient(160deg, #0f1f1a 0%, #0a1510 50%, #081210 100%)',
            borderRadius: 16,
            border: '1px solid rgba(0,180,166,0.15)',
            overflow: 'hidden',
            maxWidth: isMobile ? '100%' : 760,
            margin: '32px auto 0',
            padding: '8px',
            position: 'relative',
          }}>
            <ComposableMap
              projection="geoNaturalEarth1"
              projectionConfig={{
                scale: 1000,
                center: [82, 23],
              }}
              style={{ width: '100%', height: 'auto' }}
            >
              <ZoomableGroup
                zoom={mapPosition.zoom}
                center={mapPosition.coordinates}
                onMoveEnd={setMapPosition}
                minZoom={1}
                maxZoom={6}
              >
                <Geographies geography={INDIA_GEO_URL}>
                  {({ geographies }) =>
                    geographies.map(geo => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        style={{
                          default: {
                            fill: 'rgba(0,180,166,0.12)',
                            stroke: 'rgba(0,180,166,0.45)',
                            strokeWidth: 0.8,
                            outline: 'none',
                          },
                          hover: {
                            fill: 'rgba(0,180,166,0.22)',
                            stroke: 'rgba(0,180,166,0.6)',
                            strokeWidth: 0.8,
                            outline: 'none',
                          },
                          pressed: { outline: 'none' }
                        }}
                      />
                    ))
                  }
                </Geographies>

                {HUB_CITIES.map(loc => (
                  <Marker
                    key={loc.city}
                    coordinates={loc.coordinates}
                    onMouseEnter={() => setActiveCity(loc)}
                    onMouseLeave={() => setActiveCity(null)}
                    onClick={() => setActiveCity(loc)}
                  >
                    <circle
                      r={loc.type === 'HQ' ? 8 : 5}
                      fill="none"
                      stroke={loc.type === 'HQ' ? '#c9a84c' : '#00B4A6'}
                      strokeWidth={1}
                      opacity={0.35}
                    />
                    <circle
                      r={loc.type === 'HQ' ? 4 : 3}
                      fill={loc.type === 'HQ' ? '#c9a84c' : '#00B4A6'}
                      stroke={loc.type === 'HQ' ? 'rgba(201,168,76,0.4)' : 'rgba(0,180,166,0.4)'}
                      strokeWidth={1.5}
                      style={{ cursor: 'pointer' }}
                    />
                  </Marker>
                ))}
              </ZoomableGroup>
            </ComposableMap>

            {/* Zoom controls */}
            <div style={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              zIndex: 10,
            }}>
              <button
                onClick={() => setMapPosition(pos => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 6) }))}
                style={{
                  width: isMobile ? 28 : 32, height: isMobile ? 28 : 32,
                  background: 'rgba(0,180,166,0.15)',
                  border: '1px solid rgba(0,180,166,0.3)',
                  borderRadius: 6,
                  color: '#00B4A6',
                  fontSize: 18,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                +
              </button>
              <button
                onClick={() => setMapPosition(pos => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 1) }))}
                style={{
                  width: isMobile ? 28 : 32, height: isMobile ? 28 : 32,
                  background: 'rgba(0,180,166,0.15)',
                  border: '1px solid rgba(0,180,166,0.3)',
                  borderRadius: 6,
                  color: '#00B4A6',
                  fontSize: 18,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                −
              </button>
              <button
                onClick={() => setMapPosition({ coordinates: [82, 23], zoom: 1 })}
                style={{
                  width: isMobile ? 28 : 32, height: isMobile ? 28 : 32,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  color: '#9e9b92',
                  fontSize: 10,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '0.05em',
                }}
              >
                ↺
              </button>
            </div>
          </div>

          {/* Info panel */}
          <div style={{
            minHeight: 80,
            marginTop: 16,
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.07)',
            background: '#111110',
            padding: isMobile ? '14px 16px' : '20px 28px',
            transition: 'opacity 0.2s',
            opacity: activeCity ? 1 : 0.4,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isMobile ? 12 : 24,
            flexWrap: 'wrap',
          }}>
            {activeCity ? (
              <>
                <div>
                  <div style={{ fontSize: 10, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, marginBottom: 6 }}>
                    {activeCity.type === 'HQ' ? 'HEADQUARTERS' : 'HUB LOCATION'}
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? 22 : 32, fontWeight: 300, color: '#fff', lineHeight: 1 }}>
                    {activeCity.city}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#9e9b92', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                    HUBS IN CITY
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: isMobile ? 22 : 32, color: '#00B4A6' }}>
                    {activeCity.hubs}
                  </div>
                </div>
                <div style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  background: activeCity.type === 'HQ' ? 'rgba(201,168,76,0.15)' : 'rgba(0,180,166,0.1)',
                  border: `1px solid ${activeCity.type === 'HQ' ? 'rgba(201,168,76,0.4)' : 'rgba(0,180,166,0.3)'}`,
                  color: activeCity.type === 'HQ' ? '#c9a84c' : '#00B4A6',
                }}>
                  {activeCity.type === 'HQ' ? 'HEADQUARTERS' : 'ACTIVE HUB'}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: '#5c5a54', width: '100%', textAlign: 'center' }}>
                Hover a pin to explore hub details
              </div>
            )}
          </div>

          {/* Map legend */}
          <div style={{
            display: 'flex',
            gap: 32,
            justifyContent: 'center',
            marginTop: 20,
            padding: '12px 0',
            borderTop: '1px solid rgba(255,255,255,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#9e9b92' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c9a84c' }} />
              Headquarters (Gurgaon)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#9e9b92' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00B4A6' }} />
              Hub Locations
            </div>
            <div style={{ fontSize: 12, color: '#5c5a54' }}>
              33 hubs · 18 cities
            </div>
          </div>

          {/* Zoom hint */}
          <div style={{ textAlign: 'center', fontSize: 11, color: '#5c5a54', marginTop: 8 }}>
            Scroll to zoom · Drag to pan · Pinch on mobile
          </div>
        </div>

        {/* DOCUMENTATION / PDF SECTION */}
        {vertical?.pdf_url && (
          <div style={{
            padding: isMobile ? '40px 16px' : '60px 40px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
            boxSizing: 'border-box',
            maxWidth: '100%'
          }}>
            <div style={{ marginBottom: 32, paddingLeft: 40 }}>
              <p style={{
                fontSize: 11, letterSpacing: '0.15em',
                color: '#c9a84c', textTransform: 'uppercase',
                marginBottom: 12, fontFamily: 'DM Sans'
              }}>DOCUMENTATION</p>
              <h2 style={{
                fontSize: 36, fontFamily: 'Cormorant Garamond',
                fontWeight: 300, color: '#fff', margin: 0
              }}>{vertical.doc_title || 'Documentation'}</h2>
            </div>

            <div style={{
              background: '#111110',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16,
              overflow: 'hidden',
              position: 'relative',
              maxWidth: '100%',
              boxSizing: 'border-box',
              margin: '0 40px'
            }}>
              <div ref={pdfWrapperRef} style={{
                width: '100%',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: 400,
                overflow: 'hidden',
                maxWidth: '100%'
              }}>
                <Document
                  file={vertical.pdf_url}
                  onLoadSuccess={({ numPages }) => {
                    setNumPages(numPages);
                    setPageLoading(false);
                  }}
                  onLoadError={console.error}
                  loading={
                    <div style={{ width: '100%', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9e9b92', fontSize: 14 }}>
                      Loading document...
                    </div>
                  }
                >
                  <Page
                    pageNumber={currentPage}
                    width={containerWidth > 0 ? Math.min(containerWidth, window.innerWidth - 80) : undefined}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    onRenderSuccess={() => setPageLoading(false)}
                    loading={null}
                  />
                </Document>

                {/* Page loading overlay */}
                {pageLoading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(17,17,16,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' }}>
                    <div style={{ width: 30, height: 2, background: '#00B4A6' }} />
                  </div>
                )}

                {/* LEFT ARROW */}
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      setPageLoading(true);
                      setCurrentPage(p => p - 1);
                    }
                  }}
                  style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 20,
                    width: 44, height: 44, borderRadius: '50%', background: 'rgba(10,10,8,0.8)',
                    border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 20,
                    cursor: currentPage === 1 ? 'default' : 'pointer',
                    opacity: currentPage === 1 ? 0.25 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'opacity 0.2s'
                  }}
                >
                  ‹
                </button>

                {/* RIGHT ARROW */}
                <button
                  onClick={() => {
                    if (currentPage < numPages) {
                      setPageLoading(true);
                      setCurrentPage(p => p + 1);
                    }
                  }}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 20,
                    width: 44, height: 44, borderRadius: '50%', background: 'rgba(10,10,8,0.8)',
                    border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 20,
                    cursor: currentPage === numPages ? 'default' : 'pointer',
                    opacity: currentPage === numPages ? 0.25 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'opacity 0.2s'
                  }}
                >
                  ›
                </button>
              </div>

              {/* BOTTOM BAR */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {numPages <= 20 && Array.from({ length: numPages }).map((_, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setPageLoading(true);
                        setCurrentPage(i + 1);
                      }}
                      style={{
                        width: currentPage === i + 1 ? 20 : 6,
                        height: 6, borderRadius: 3,
                        background: currentPage === i + 1 ? '#c9a84c' : 'rgba(255,255,255,0.2)',
                        transition: 'all 0.3s', cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: '#9e9b92', fontFamily: 'DM Sans' }}>
                  Page {currentPage} of {numPages}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: isMobile ? '24px 20px' : '32px 80px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: isMobile ? 8 : 0
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
