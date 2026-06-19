import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { supabase } from '../../lib/supabase';

// Use the correct paths for react-pdf@10
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker - Use .mjs for pdfjs-dist 5.x
pdfjs.GlobalWorkerOptions.workerSrc = 
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PitchDeck() {
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  // Preserve existing Supabase fetch logic
  useEffect(() => {
    let cancelled = false;
    async function loadDeck() {
      try {
        const { data } = await supabase
          .from('pitch_deck_config')
          .select('pdf_url')
          .single();
        if (!cancelled) {
          setPdfUrl(data?.pdf_url || null);
        }
      } catch (e) {
        console.error('Deck load failed:', e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadDeck();
    return () => { cancelled = true; };
  }, []);

  // Measure container width for responsive PDF scaling
  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const goNext = useCallback(() => {
    if (currentPage < numPages) {
      setPageLoading(true);
      setCurrentPage(p => p + 1);
    }
  }, [currentPage, numPages]);

  const goPrev = useCallback(() => {
    if (currentPage > 1) {
      setPageLoading(true);
      setCurrentPage(p => p - 1);
    }
  }, [currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  // Loading state
  if (loading) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0a0a08', zIndex: 1000
      }}>
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 0.4; width: 20px; }
              50% { opacity: 1; width: 40px; }
              100% { opacity: 0.4; width: 20px; }
            }
          `}
        </style>
        <div style={{
          fontSize: 15, color: '#9e9b92',
          fontFamily: "'DM Sans', sans-serif",
          marginBottom: 16
        }}>Loading Deck...</div>
        <div style={{
          width: 40, height: 2,
          background: '#00B4A6',
          animation: 'pulse 1.5s infinite'
        }} />
      </div>
    );
  }

  // Empty state
  if (!pdfUrl) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0a0a08',
        color: '#9e9b92', fontSize: 15,
        fontFamily: "'DM Sans', sans-serif"
      }}>
        Pitch deck not yet available.
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#0a0a08', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      position: 'relative', fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* TOP BAR */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 56, zIndex: 100,
        background: 'rgba(10,10,8,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px'
      }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{
            background: 'none', border: 'none', color: '#c9a84c',
            fontSize: 13, cursor: 'pointer', letterSpacing: '0.05em',
            fontFamily: "'DM Sans', sans-serif"
          }}
        >
          ← Back to Portal
        </button>
        <div style={{
          fontSize: 12, letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.4)',
          fontFamily: "'DM Sans', sans-serif"
        }}>PITCH DECK</div>
        <div style={{
          fontSize: 13, color: '#c9a84c',
          fontFamily: "'DM Sans', sans-serif", fontWeight: 500
        }}>
          {currentPage} / {numPages}
        </div>
      </div>

      {/* SLIDE CONTAINER */}
      <div 
        ref={containerRef}
        style={{
          marginTop: 56, flex: 1, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
            setLoading(false);
          }}
          onLoadError={(error) => {
            console.error('PDF load error:', error);
            setLoading(false);
          }}
          loading={null}
        >
          <Page
            pageNumber={currentPage}
            width={containerWidth
              ? Math.min(containerWidth, window.innerHeight * 1.4)
              : Math.min(window.innerWidth, window.innerHeight * 1.4)
            }
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onRenderSuccess={() => setPageLoading(false)}
            loading={null}
            style={{
              display: 'block',
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 56px - 48px)',
              objectFit: 'contain',
            }}
          />
        </Document>

        {/* PAGE TRANSITION OVERLAY */}
        {pageLoading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(10,10,8,0.6)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 10,
            transition: 'opacity 0.2s'
          }}>
            <div style={{
              width: 24, height: 24,
              border: '2px solid rgba(0,180,166,0.2)',
              borderTopColor: '#00B4A6',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <style>
              {`@keyframes spin { to { transform: rotate(360deg); } }`}
            </style>
          </div>
        )}
      </div>

      {/* LEFT ARROW */}
      <button 
        style={{
          position: 'fixed', left: 20, top: '50%',
          transform: 'translateY(-50%)', zIndex: 200,
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#fff', fontSize: 20, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: currentPage === 1 ? 0.2 : 1,
          pointerEvents: currentPage === 1 ? 'none' : 'auto',
          transition: 'all 0.2s',
        }}
        onClick={goPrev}
      >
        ‹
      </button>

      {/* RIGHT ARROW */}
      <button 
        style={{
          position: 'fixed', right: 20, top: '50%',
          transform: 'translateY(-50%)', zIndex: 200,
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#fff', fontSize: 20, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: currentPage === numPages ? 0.2 : 1,
          pointerEvents: currentPage === numPages ? 'none' : 'auto',
          transition: 'all 0.2s',
        }}
        onClick={goNext}
      >
        ›
      </button>

      {/* DOT INDICATORS */}
      {numPages > 0 && numPages <= 20 && (
        <div style={{
          position: 'fixed', bottom: 16, left: '50%',
          transform: 'translateX(-50%)', display: 'flex',
          gap: 6, alignItems: 'center', zIndex: 200
        }}>
          {Array.from({ length: numPages }).map((_, i) => (
            <div 
              key={i}
              onClick={() => {
                setPageLoading(true);
                setCurrentPage(i + 1);
              }}
              style={{
                width: currentPage === i + 1 ? 20 : 6,
                height: 6, borderRadius: 3,
                background: currentPage === i + 1 
                  ? '#c9a84c' 
                  : 'rgba(255,255,255,0.25)',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
