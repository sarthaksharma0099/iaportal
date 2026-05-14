import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { Btn, Card, Input, Textarea, Dots, useToast } from '../../components/UI';

export default function EcosystemManager() {
  const [verticals, setVerticals] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadVerticals = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('ecosystem_verticals')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setVerticals(data || []);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadVerticals();
  }, [loadVerticals]);

  const handleSave = async (key, updatedData) => {
    try {
      const { error } = await supabaseAdmin
        .from('ecosystem_verticals')
        .update(updatedData)
        .eq('key', key);

      if (error) throw error;
      toast('Vertical updated successfully');
      loadVerticals();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const handleFileUpload = async (key, file) => {
    if (!file) return null;
    if (file.type !== 'application/pdf') {
      toast('Please upload a PDF file', 'error');
      return null;
    }

    try {
      const filePath = `ecosystem/${key}/deck.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('portal-documents')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portal-documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (e) {
      toast(e.message, 'error');
      return null;
    }
  };

  if (loading && verticals.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center' }}><Dots /></div>;
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <h2 style={{ fontSize: 20, color: '#fff', fontWeight: 500, margin: '0 0 8px' }}>Ecosystem Verticals</h2>
      <div style={{ fontSize: 13, color: '#9e9b92', marginBottom: 32 }}>
        Manage content for each vertical shown on the investor portal wheel. 
        Click any vertical to expand and edit.
      </div>

      {verticals.map(v => (
        <VerticalCard 
          key={v.key} 
          vertical={v} 
          onSave={handleSave} 
          onUpload={handleFileUpload} 
        />
      ))}
    </div>
  );
}

function VerticalCard({ vertical, onSave, onUpload }) {
  const [expanded, setExpanded] = useState(false);
  const [subtitle, setSubtitle] = useState(vertical.subtitle || '');
  const [description, setDescription] = useState(vertical.description || '');
  const [isVisible, setIsVisible] = useState(vertical.is_visible);
  const [pdfUrl, setPdfUrl] = useState(vertical.pdf_url || '');
  const [docTitle, setDocTitle] = useState(vertical.doc_title || '');
  const [statRows, setStatRows] = useState(vertical.stats || []);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef();
  const toast = useToast();

  const updateStat = (index, field, value) => {
    const updated = [...statRows];
    updated[index] = { ...updated[index], [field]: value };
    setStatRows(updated);
  };

  const removeStat = (index) => {
    setStatRows(statRows.filter((_, i) => i !== index));
  };

  const handleSaveClick = async () => {
    setSaving(true);
    const updatedStats = statRows.filter(s => s.label && s.value);
    await onSave(vertical.key, {
      subtitle,
      description,
      is_visible: isVisible,
      stats: updatedStats,
      pdf_url: pdfUrl,
      doc_title: docTitle
    });
    setSaving(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await onUpload(vertical.key, file);
    if (url) {
      setPdfUrl(url);
      toast('PDF uploaded. Click save to apply changes.');
    }
  };

  return (
    <Card style={{ padding: 0, marginBottom: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Header */}
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{ 
          padding: '20px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          background: expanded ? 'rgba(255,255,255,0.02)' : 'transparent',
          transition: 'background 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>{vertical.title}</span>
          <span style={{ 
            fontSize: 11, background: 'rgba(0,180,166,0.1)', color: '#00B4A6', 
            padding: '2px 8px', borderRadius: 20, marginLeft: 12, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>{vertical.key}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: isVisible ? 'var(--gold)' : 'var(--text3)', cursor: 'pointer' }} onClick={e => e.stopPropagation()}>
            <input 
              type="checkbox" 
              checked={isVisible} 
              onChange={e => setIsVisible(e.target.checked)} 
              style={{ cursor: 'pointer' }}
            />
            {isVisible ? 'Visible' : 'Hidden'}
          </label>
          <span style={{ 
            color: 'var(--gold)', fontSize: 14, marginLeft: 16,
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.3s ease'
          }}>▾</span>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ marginBottom: 24 }}>
            <Input 
              label="Subtitle" 
              value={subtitle} 
              onChange={setSubtitle} 
              placeholder="Short description shown on the detail page"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <Textarea 
              label="Description" 
              value={description} 
              onChange={setDescription} 
              rows={4}
              placeholder="Full description shown on the investor detail page"
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>Key Stats</label>
            <div style={{ fontSize: 12, color: 'var(--text4)', marginBottom: 16 }}>These appear as stat cards on the investor page</div>
            
            {statRows.map((stat, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'center' }}>
                <input
                  placeholder="Label (e.g. Funds)"
                  value={stat.label}
                  onChange={e => updateStat(i, 'label', e.target.value)}
                  style={{
                    flex: 1, background: '#1a1a18',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, padding: '8px 12px',
                    color: 'white', fontSize: 13
                  }}
                />
                <input
                  placeholder="Value (e.g. 5)"
                  value={stat.value}
                  onChange={e => updateStat(i, 'value', e.target.value)}
                  style={{
                    flex: 1, background: '#1a1a18',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, padding: '8px 12px',
                    color: 'white', fontSize: 13
                  }}
                />
                <button
                  onClick={() => removeStat(i)}
                  style={{
                    background: 'rgba(255,80,80,0.1)',
                    border: '1px solid rgba(255,80,80,0.2)',
                    color: '#ff5050', borderRadius: 8,
                    padding: '8px 12px', cursor: 'pointer',
                    fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: 36
                  }}
                >✕</button>
              </div>
            ))}
            
            <button
              onClick={() => setStatRows([...statRows, { label: '', value: '' }])}
              style={{
                background: 'rgba(0,180,166,0.08)',
                border: '1px solid rgba(0,180,166,0.2)',
                color: '#00B4A6', borderRadius: 8,
                padding: '8px 16px', cursor: 'pointer',
                fontSize: 13, marginTop: 8
              }}
            >+ Add Stat</button>
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#9e9b92', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Documentation Section Title</label>
            <input 
              value={docTitle || 'Detailed Overview'} 
              onChange={e => setDocTitle(e.target.value)} 
              placeholder="Detailed Overview"
              style={{
                width: '100%',
                background: '#1a1a18',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '8px 12px',
                color: 'white',
                fontSize: 14,
                fontFamily: 'DM Sans'
              }}
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>Vertical Document (PDF)</label>
            <div style={{ fontSize: 12, color: 'var(--text4)', marginBottom: 16 }}>This PDF will be shown slide-by-slide on the investor page</div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {pdfUrl ? (
                <>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: 8, 
                    padding: '6px 12px', background: 'rgba(0,180,166,0.1)', 
                    color: '#00B4A6', borderRadius: 6, fontSize: 12, fontWeight: 500
                  }}>
                    PDF Uploaded ✓
                  </div>
                  <a href={pdfUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--gold)', textDecoration: 'none' }}>View PDF</a>
                  <Btn size="sm" variant="ghost" onClick={() => fileInputRef.current.click()}>Replace PDF</Btn>
                </>
              ) : (
                <Btn size="sm" onClick={() => fileInputRef.current.click()}>Upload PDF</Btn>
              )}
              <input 
                type="file" 
                hidden 
                ref={fileInputRef}
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Btn variant="ghost" onClick={() => setExpanded(false)}>Cancel</Btn>
            <Btn onClick={handleSaveClick} loading={saving}>Save Changes</Btn>
          </div>
        </div>
      )}
    </Card>
  );
}
