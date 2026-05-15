import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { supabase } from '../../lib/supabase';

// CSS for react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = 
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function EcosystemDetail() {
  const { key } = useParams();
  const navigate = useNavigate();
  const [vertical, setVertical] = useState(null);
  const [relatedData, setRelatedData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // PDF states
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const pdfWrapperRef = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch vertical metadata
      const { data: vData, error: vError } = await supabase
        .from('ecosystem_verticals')
        .select('*')
        .eq('key', key)
        .single();
      
      if (vError) throw vError;
      setVertical(vData);

      // 2. Fetch related data based on key
      let rData = [];
      if (key === 'programs') {
        const { data } = await supabase
          .from('programs')
          .select('*')
          .eq('is_visible', true)
          .order('name');
        rData = data || [];
      } else if (key === 'thesis') {
        const { data } = await supabase
          .from('investment_theses')
          .select('*')
          .eq('is_visible', true)
          .order('name');
        rData = data || [];
      } else if (key === 'spaces') {
        rData = [
          { label: '31 Hubs', value: '31' },
          { label: '17 Cities', value: '17' },
          { label: '10 States', value: '10' },
          { label: '9000+ Seats', value: '9000+' }
        ];
      } else if (key === 'finvolve') {
        rData = [
          { name: 'FAT I-II', stage: 'Early Stage' },
          { name: 'GIFT City', stage: 'Global Access' },
          { name: 'Brew', stage: 'Consumer Tech' },
          { name: 'IAGOF-I', stage: 'Growth' },
          { name: 'IAGOF-II/III', stage: 'Scale' }
        ];
      } else if (key === 'iangels') {
        rData = [
          { label: '1800+ iAngels', value: '1800+' },
          { label: '55 Deals', value: '55' },
          { label: 'INR 500 Cr+ Committed', value: '₹500Cr+' }
        ];
      } else if (key === 'vas') {
        rData = [
          { title: 'Accounting', icon: '📝', desc: 'Full-stack accounting and taxation services.' },
          { title: 'Legal', icon: '⚖️', desc: 'Compliance, IP protection, and structural advisory.' },
          { title: 'Technology', icon: '💻', desc: 'CTO-as-a-service and engineering support.' },
          { title: 'PR & Marketing', icon: '📣', desc: 'Go-to-market strategy and brand visibility.' }
        ];
      }
      setRelatedData(rData);

    } catch (e) {
      console.error('Error loading vertical:', e);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Width measurement - fires on mount and resize
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

  // Reset to page 1 when vertical changes
  useEffect(() => {
    setCurrentPage(1);
    setNumPages(0);
  }, [vertical?.key]);

  // Keyboard navigation
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

  if (!vertical) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#fff' }}>Vertical not found.</div>
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
          style={{ background: 'none', border: 'none', color: '#c9a84c', fontSize: 13, cursor: 'pointer' }}
        >
          ← Back to Portal
        </button>
        <div style={{ fontSize: 13, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
          {vertical.title}
        </div>
        <div style={{ fontSize: 13, color: '#00B4A6' }}>IA Ecosystem</div>
      </div>

      {/* HERO SECTION */}
      <div style={{ paddingTop: 64 }}>
        <div style={{ padding: '80px 80px 60px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 1, background: '#c9a84c' }} />
            <span style={{ fontSize: 11, color: '#c9a84c', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>IA Ecosystem</span>
          </div>
          
          <h1 style={{ fontSize: 52, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, marginBottom: 16 }}>
            {vertical.title}
          </h1>
          <p style={{ fontSize: 18, color: '#9e9b92', maxWidth: 600, lineHeight: 1.6, marginBottom: 48 }}>
            {vertical.subtitle}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
            {(vertical.stats || []).map((s, i) => (
              <div key={i} style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
                <div style={{ fontSize: 36, fontFamily: "'Cormorant Garamond', serif", color: '#c9a84c', fontWeight: 300 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: '#9e9b92', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      {vertical.description && (
        <div style={{ padding: '60px 80px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 800 }}>
            {vertical.description.split('\n').map((p, i) => (
              <p key={i} style={{ fontSize: 16, color: '#e0e0e0', lineHeight: 1.8, marginBottom: 24 }}>{p}</p>
            ))}
          </div>
        </div>
      )}

      {/* RELATED DATA SECTION */}
      {relatedData.length > 0 && key !== 'spaces' && key !== 'iangels' && (
        <div style={{ padding: '60px 80px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, color: '#c9a84c', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>EXPLORE</div>
          <h2 style={{ fontSize: 32, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, marginBottom: 40 }}>
            {key === 'programs' ? 'Active Programs' : key === 'thesis' ? 'Investment Theses' : 'Key Highlights'}
          </h2>

          {key === 'programs' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {relatedData.map(p => (
                <div key={p.id} style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: p.status === 'Active' ? 'rgba(0,180,166,0.1)' : 'rgba(255,255,255,0.05)', color: p.status === 'Active' ? '#00B4A6' : '#9e9b92', border: `1px solid ${p.status === 'Active' ? 'rgba(0,180,166,0.2)' : 'rgba(255,255,255,0.1)'}` }}>
                      {p.status}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#9e9b92', lineHeight: 1.5 }}>{p.description}</div>
                </div>
              ))}
            </div>
          )}

          {key === 'thesis' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
              {relatedData.map(t => (
                <div key={t.id} style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
                  <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 12 }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: '#9e9b92', lineHeight: 1.5, marginBottom: 20 }}>{t.description}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(t.focus_areas || '').split(',').map(fa => (
                      <span key={fa} style={{ fontSize: 10, background: 'rgba(0,180,166,0.1)', color: '#00B4A6', padding: '4px 10px', borderRadius: 4 }}>
                        {fa.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {key === 'finvolve' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {relatedData.map((f, i) => (
                <div key={i} style={{ background: '#111110', borderRadius: 12, padding: 20, textAlign: 'center', flex: '1 1 180px' }}>
                  <div style={{ fontSize: 15, fontWeight: 'bold' }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: '#00B4A6', marginTop: 8 }}>{f.stage}</div>
                </div>
              ))}
            </div>
          )}



          {key === 'vas' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
              {relatedData.map((s, i) => (
                <div key={i} style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: '#9e9b92' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PDF SECTION */}
      {vertical.pdf_url && (
        <div style={{ 
          padding: '60px 40px', 
          borderTop: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
          boxSizing: 'border-box',
          maxWidth: '100%'
        }}>
          <div style={{ marginBottom: 32 }}>
            <p style={{
              fontSize: 11, letterSpacing: '0.15em',
              color: '#c9a84c', textTransform: 'uppercase',
              marginBottom: 12, fontFamily: 'DM Sans'
            }}>DOCUMENTATION</p>
            <h2 style={{
              fontSize: 36, fontFamily: 'Cormorant Garamond',
              fontWeight: 300, color: '#fff', margin: 0
            }}>{vertical.doc_title || 'Detailed Overview'}</h2>
          </div>

          <div style={{ 
            background: '#111110', 
            border: '1px solid rgba(255,255,255,0.07)', 
            borderRadius: 16, 
            overflow: 'hidden', 
            position: 'relative',
            maxWidth: '100%',
            boxSizing: 'border-box'
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

      {/* FOOTER PADDING */}
      <div style={{ height: 100 }} />
    </div>
  );
}
