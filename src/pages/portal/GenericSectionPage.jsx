import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { supabase } from '../../lib/supabase';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function GenericSectionPage({ email }) {
  const { key } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [blocks, setBlocks] = useState([]);
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
      const { data: sectionData, error: sectionError } = await supabase
        .from('portal_sections')
        .select('*')
        .eq('key', key)
        .single();
      
      if (sectionError) throw sectionError;
      setSection(sectionData);

      const { data: blocksData, error: blocksError } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('section_key', key)
        .order('created_at');
        
      if (!blocksError && blocksData) {
        setBlocks(blocksData);
      }

      // Log access
      if (email) {
        supabase.from('access_log').insert({
          investor_email: email,
          section_key: key,
          event: 'view'
        });
      }
    } catch (e) {
      console.error('Error loading section:', e);
    } finally {
      setLoading(false);
    }
  }, [key, email]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Width measurement for PDF
  useEffect(() => {
    function updateWidth() {
      if (pdfWrapperRef.current) {
        const rect = pdfWrapperRef.current.getBoundingClientRect();
        const availableWidth = Math.min(rect.width, window.innerWidth - 80);
        setContainerWidth(availableWidth);
      }
    }
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (pdfWrapperRef.current) observer.observe(pdfWrapperRef.current);
    return () => observer.disconnect();
  }, [section]);

  useEffect(() => {
    function handleResize() {
      if (pdfWrapperRef.current) {
        const rect = pdfWrapperRef.current.getBoundingClientRect();
        const availableWidth = Math.min(rect.width, window.innerWidth - 80);
        setContainerWidth(availableWidth);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setNumPages(0);
  }, [section?.key]);

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

  if (!section) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a08', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ color: '#fff' }}>Section not found.</div>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>
          Return to Portal
        </button>
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
          {section.title}
        </div>
        <div style={{ fontSize: 13, color: '#00B4A6' }}>India Accelerator</div>
      </div>

      {/* HERO SECTION */}
      <div style={{ paddingTop: 64 }}>
        <div style={{ padding: '80px 80px 60px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 1, background: '#c9a84c' }} />
            <span style={{ fontSize: 11, color: '#c9a84c', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>PORTAL SECTION</span>
          </div>
          
          <h1 style={{ fontSize: 52, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, marginBottom: 16 }}>
            {section.title}
          </h1>
          {section.description && (
            <p style={{ fontSize: 18, color: '#9e9b92', maxWidth: 800, lineHeight: 1.6, marginBottom: 0 }}>
              {section.description.split('\n').map((p, i) => (
                <span key={i}>{p}<br/></span>
              ))}
            </p>
          )}
        </div>
      </div>

      {/* CONTENT BLOCKS SECTION */}
      {blocks.length > 0 && (
        <div style={{ padding: '60px 80px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, color: '#c9a84c', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>DETAILS</div>
          <h2 style={{ fontSize: 32, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, marginBottom: 40 }}>
            Key Information
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {blocks.map(block => (
              <div key={block.id} style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 24 }}>
                <div style={{ fontSize: 13, color: '#00B4A6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{block.label}</div>
                <div style={{ fontSize: 16, color: '#fff', lineHeight: 1.6 }}>{block.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF SECTION */}
      {section.pdf_url && (
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
            }}>Detailed Overview</h2>
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
                file={section.pdf_url}
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

      <div style={{ height: 100 }} />
    </div>
  );
}
