import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from 'react-simple-maps';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const WORLD_GEO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const CORRIDOR_COORDS = {
  'Saudi Arabia': [45.0792, 23.8859],
  'UAE': [53.8478, 23.4241],
  'Germany': [10.4515, 51.1657],
  'Japan': [138.2529, 36.2048],
  'USA': [-95.7129, 37.0902],
  'Australia': [134.0, -27.0],
};

export default function StarlinkPage({ email }) {
  const navigate = useNavigate();
  const [vertical, setVertical] = useState(null);
  const [corridors, setCorridors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCorridor, setActiveCorridor] = useState(null);

  // PDF states
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const pdfWrapperRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [vRes, cRes] = await Promise.all([
          supabase
            .from('ecosystem_verticals')
            .select('*')
            .eq('key', 'starlink')
            .single(),
          supabase
            .from('starlink_corridors')
            .select('*')
            .order('sort_order')
        ]);

        if (vRes.error) throw vRes.error;
        setVertical(vRes.data);
        setCorridors(cRes.data || []);
      } catch (e) {
        console.error('Error loading Starlink data:', e);
      } finally {
        setLoading(false);
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
          STARLINK
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
            Starlink
          </h1>
          <p style={{ fontSize: 18, color: '#9e9b92', maxWidth: 600, lineHeight: 1.6, marginBottom: 48 }}>
            {vertical?.description}
          </p>

          <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
            {(vertical?.stats || []).map((s, i) => (
              <React.Fragment key={i}>
                <div style={{ padding: '0 32px', textAlign: 'center', minWidth: 120 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: '#c9a84c', fontWeight: 300, lineHeight: 1, marginBottom: 8 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 11, color: '#9e9b92', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {s.label}
                  </div>
                </div>
                {i < (vertical?.stats || []).length - 1 && (
                  <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* GLOBAL CORRIDORS SECTION */}
        <div style={{ padding: '60px 80px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, color: '#c9a84c', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
            ACTIVE CORRIDORS
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: '#fff', marginBottom: 40 }}>
            {corridors.length} Active Global Corridors
          </h2>

          {/* World Map */}
          <div style={{
            position: 'relative',
            background: 'rgba(0,180,166,0.04)',
            border: '1px solid rgba(0,180,166,0.1)',
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 40
          }}>
            <ComposableMap
              projection="geoNaturalEarth1"
              projectionConfig={{
                scale: 153,
                center: [10, -5],
              }}
              width={800}
              height={450}
              style={{ width: '100%', height: 'auto' }}
            >
              <Geographies geography={WORLD_GEO_URL}>
                {({ geographies }) =>
                  geographies.map(geo => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill: 'rgba(0,180,166,0.08)',
                          stroke: 'rgba(0,180,166,0.2)',
                          strokeWidth: 0.5,
                          outline: 'none'
                        },
                        hover: {
                          fill: 'rgba(0,180,166,0.12)',
                          stroke: 'rgba(0,180,166,0.3)',
                          strokeWidth: 0.5,
                          outline: 'none'
                        },
                        pressed: {
                          fill: 'rgba(0,180,166,0.08)',
                          outline: 'none'
                        }
                      }}
                    />
                  ))
                }
              </Geographies>

              {corridors.map(c => {
                const coords = CORRIDOR_COORDS[c.country];
                if (!coords) return null;
                const isHardLaunch = c.launch_model === 'Hard Launch';
                const isActive = activeCorridor?.id === c.id;

                return (
                  <Marker
                    key={c.id}
                    coordinates={coords}
                    onMouseEnter={() => setActiveCorridor(c)}
                    onMouseLeave={() => setActiveCorridor(null)}
                    onClick={() => setActiveCorridor(c)}
                  >
                    {/* Pulse ring */}
                    <circle
                      r={isActive ? 14 : 10}
                      fill="none"
                      stroke={isHardLaunch ? '#c9a84c' : '#00B4A6'}
                      strokeWidth="1"
                      opacity="0.4"
                      style={{ transition: 'r 0.3s ease', cursor: 'pointer' }}
                    />
                    {/* Main pin */}
                    <circle
                      r={5}
                      fill={isHardLaunch ? '#c9a84c' : '#00B4A6'}
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth="1.5"
                      style={{ cursor: 'pointer' }}
                    />
                  </Marker>
                );
              })}
            </ComposableMap>
            {activeCorridor && (
              <div style={{
                position: 'absolute',
                bottom: 24,
                left: 24,
                background: 'rgba(10,10,8,0.92)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '20px 24px',
                minWidth: 260,
                maxWidth: 320,
                zIndex: 10,
                pointerEvents: 'none',
              }}>
                <div style={{
                  fontSize: 10,
                  color: '#c9a84c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontWeight: 600,
                  marginBottom: 8
                }}>
                  Active Corridor
                </div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 28,
                  fontWeight: 300,
                  color: '#fff',
                  lineHeight: 1,
                  marginBottom: 4
                }}>
                  {activeCorridor.country}
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#00B4A6',
                  marginBottom: 12
                }}>
                  {activeCorridor.partner}
                </div>
                <div style={{
                  fontSize: 12,
                  color: '#9e9b92',
                  marginBottom: 10
                }}>
                  {activeCorridor.sectors}
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  background: activeCorridor.launch_model === 'Hard Launch'
                    ? 'rgba(201,168,76,0.15)'
                    : 'rgba(0,180,166,0.1)',
                  border: `1px solid ${activeCorridor.launch_model === 'Hard Launch'
                    ? 'rgba(201,168,76,0.4)'
                    : 'rgba(0,180,166,0.3)'}`,
                  color: activeCorridor.launch_model === 'Hard Launch'
                    ? '#c9a84c'
                    : '#00B4A6',
                }}>
                  {activeCorridor.launch_model.toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* Corridor Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16
          }}>
            {corridors.map(c => {
              const isHardLaunch = c.launch_model === 'Hard Launch';
              return (
                <div
                  key={c.id}
                  style={{
                    background: '#111110',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 12,
                    padding: 24
                  }}
                >
                  <div style={{ fontSize: 18, color: '#fff', fontWeight: 500, marginBottom: 8 }}>
                    {c.country}
                  </div>
                  {c.partner && (
                    <div style={{ fontSize: 13, color: '#00B4A6', marginBottom: 6 }}>
                      {c.partner}
                    </div>
                  )}
                  {c.sectors && (
                    <div style={{ fontSize: 13, color: '#9e9b92', marginBottom: 12 }}>
                      {c.sectors}
                    </div>
                  )}
                  <span style={{
                    fontSize: 10,
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: isHardLaunch ? 'rgba(201,168,76,0.12)' : 'transparent',
                    color: isHardLaunch ? '#c9a84c' : '#00B4A6',
                    border: `1px solid ${isHardLaunch ? 'rgba(201,168,76,0.3)' : 'rgba(0,180,166,0.3)'}`,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {c.launch_model}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* DOCUMENTATION / PDF SECTION */}
        {vertical?.pdf_url && (
          <div style={{
            padding: '60px 40px',
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
