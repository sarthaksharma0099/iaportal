import React, { useState, useEffect, useRef } from 'react';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { Btn, Card, Dots, useToast } from '../../components/UI';

export default function PitchDeckManager() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef();
  const toast = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('pitch_deck_config')
        .select('*')
        .single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"
      setConfig(data);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') return toast('Please select a PDF file', 'error');
    if (file.size > 50 * 1024 * 1024) return toast('File size must be under 50MB', 'error');

    setUploading(true);
    setProgress(10);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `pitchdeck/${fileName}`;

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('portal-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      if (uploadError) throw uploadError;
      setProgress(70);

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portal-documents')
        .getPublicUrl(filePath);

      // 3. Update Config Table
      const newConfig = {
        pdf_url: publicUrl,
        last_updated: new Date().toISOString()
      };

      const { error: upsertError } = await supabaseAdmin
        .from('pitch_deck_config')
        .upsert(newConfig);
      if (upsertError) throw upsertError;

      setProgress(100);
      toast('Pitch deck uploaded successfully');
      loadConfig();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  if (loading && !config) return <div style={{ padding: 40, textAlign: 'center' }}><Dots /></div>;

  return (
    <div style={{ maxWidth: 800 }}>
      {config && (
        <Card style={{ padding: 24, marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Current Pitch Deck</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#fff', marginBottom: 4 }}>Pitch_Deck_Global_v2.pdf</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Last updated: {new Date(config.last_updated).toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Btn variant="ghost" onClick={() => window.open(config.pdf_url, '_blank')}>View PDF</Btn>
            <Btn onClick={() => fileInputRef.current.click()}>Replace PDF</Btn>
          </div>
        </Card>
      )}

      <div 
        onClick={() => !uploading && fileInputRef.current.click()}
        style={{
          background: 'var(--bg3)', 
          border: '2px dashed rgba(255,255,255,0.12)',
          borderRadius: 16, padding: '60px 40px',
          textAlign: 'center', cursor: uploading ? 'default' : 'pointer',
          transition: 'all 0.2s',
          position: 'relative'
        }}
        onMouseOver={e => !uploading && (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)')}
        onMouseOut={e => !uploading && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          hidden 
          accept="application/pdf"
          onChange={handleFileSelect}
        />
        
        <div style={{ fontSize: 48, marginBottom: 16 }}>⬆</div>
        <div style={{ fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
          {uploading ? `Uploading... ${progress}%` : config ? 'Drop a new PDF to replace' : 'Upload Pitch Deck PDF'}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text3)' }}>PDF format only. Max 50MB.</div>

        {uploading && (
          <div style={{ 
            position: 'absolute', bottom: 0, left: 0, right: 0, 
            height: 4, background: 'var(--bg)', borderRadius: '0 0 16px 16px', overflow: 'hidden' 
          }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--gold)', transition: 'width 0.3s ease' }} />
          </div>
        )}
      </div>

      {/* Reassurance Note */}
      <div style={{ 
        background: 'rgba(74,174,140,0.06)', border: '1px solid rgba(74,174,140,0.15)',
        borderRadius: 10, padding: '14px 20px', marginTop: 24, fontSize: 13,
        color: 'rgba(74,174,140,0.9)', lineHeight: 1.6
      }}>
        ✓ All PDF content renders perfectly — including India maps, world maps, charts, images, and diagrams. The PDF is displayed as-is to investors in a clean full-screen viewer with no browser toolbar. Complex slides with geographic maps and visuals will display exactly as they appear in your PDF file.
      </div>

      <Card style={{ padding: 24, marginTop: 48 }}>
        <h3 style={{ fontSize: 16, fontWeight: 500, color: '#fff', marginBottom: 20 }}>How it works</h3>
        <div style={{ display: 'grid', gap: 16 }}>
          {[
            'Upload your pitch deck as a PDF file (maps, charts and images all supported)',
            'Investors see it in a clean full-screen viewer — no browser PDF toolbar shown',
            'Navigate slide by slide using arrow keys or clicking next/previous',
            'Replace the PDF anytime — changes are live to investors immediately',
            'Supports any PDF content: presentations, maps, financial charts, team photos'
          ].map((s, i) => (
            <div key={i} style={{ fontSize: 14, color: 'var(--text3)', display: 'flex', gap: 10 }}>
              <span style={{ color: 'var(--gold)' }}>Step {i+1}:</span> {s}
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
