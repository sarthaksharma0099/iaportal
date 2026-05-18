import React, { useState, useEffect, useRef } from 'react';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { Btn, Card, Dots, useToast } from '../../components/UI';

export default function GenericSectionManager({ sectionKey, sectionTitle }) {
  const [section, setSection] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef();
  const toast = useToast();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: sectionData, error: sectionError } = await supabaseAdmin
          .from('portal_sections')
          .select('*')
          .eq('key', sectionKey)
          .single();
        if (sectionError) throw sectionError;
        setSection(sectionData);

        const { data: blocksData, error: blocksError } = await supabaseAdmin
          .from('content_blocks')
          .select('*')
          .eq('section_key', sectionKey)
          .order('created_at');
        if (blocksError) throw blocksError;
        setBlocks(blocksData || []);
      } catch (err) {
        toast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sectionKey, toast]);

  const handleSectionSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabaseAdmin
        .from('portal_sections')
        .update({
          title: section.title,
          description: section.description,
          badge: section.badge
        })
        .eq('key', sectionKey);
      if (error) throw error;
      toast('Section info saved!');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast('Please upload a PDF file', 'error');
      return;
    }

    setPdfUploading(true);
    try {
      const filePath = `sections/${sectionKey}/document.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('portal-documents')
        .upload(filePath, file, { upsert: true, cacheControl: '3600' });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portal-documents')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabaseAdmin
        .from('portal_sections')
        .update({ pdf_url: publicUrl })
        .eq('key', sectionKey);
      if (updateError) throw updateError;

      setSection({ ...section, pdf_url: publicUrl });
      toast('PDF uploaded successfully');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setPdfUploading(false);
    }
  };

  const handleAddBlock = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('content_blocks')
        .insert({
          block_key: `${sectionKey}_block_${Date.now()}`,
          section_key: sectionKey,
          label: '',
          value: '',
          value_type: 'text'
        })
        .select()
        .single();
      if (error) throw error;
      if (data) setBlocks([...blocks, data]);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleBlocksSave = async () => {
    setSaving(true);
    try {
      for (const block of blocks) {
        const { error } = await supabaseAdmin
          .from('content_blocks')
          .update({ label: block.label, value: block.value })
          .eq('id', block.id);
        if (error) throw error;
      }
      toast('Content blocks saved!');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteBlock = async (id) => {
    if (!window.confirm('Are you sure you want to delete this block?')) return;
    try {
      const { error } = await supabaseAdmin
        .from('content_blocks')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setBlocks(blocks.filter(b => b.id !== id));
      toast('Block deleted');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const updateBlock = (index, field, value) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    setBlocks(newBlocks);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Dots /></div>;
  if (!section) return <div style={{ padding: 40, color: 'var(--text2)' }}>Section not found</div>;

  const cardStyle = {
    background: '#111110',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20
  };

  const labelStyle = {
    fontSize: 11,
    color: '#00B4A6',
    textTransform: 'uppercase',
    fontWeight: 600,
    marginBottom: 16,
    letterSpacing: '0.05em'
  };

  const inputStyle = {
    width: '100%',
    background: '#1a1a18',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '10px 14px',
    color: 'white',
    fontSize: 14,
    fontFamily: 'DM Sans, sans-serif'
  };

  const deleteButtonStyle = {
    background: 'rgba(255,80,80,0.1)',
    border: '1px solid rgba(255,80,80,0.2)',
    color: '#ff5050',
    borderRadius: 8,
    padding: '10px 14px',
    cursor: 'pointer',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <h2 style={{ fontSize: 20, color: '#fff', fontWeight: 500, margin: '0 0 8px' }}>{sectionTitle} Manager</h2>
      <div style={{ fontSize: 13, color: '#9e9b92', marginBottom: 32 }}>
        Manage content for the {sectionTitle} section
      </div>

      <Card style={cardStyle}>
        <div style={labelStyle}>SECTION INFO</div>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#9e9b92', textTransform: 'uppercase', marginBottom: 6 }}>Title</label>
          <input 
            style={inputStyle}
            value={section.title || ''}
            onChange={e => setSection({ ...section, title: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#9e9b92', textTransform: 'uppercase', marginBottom: 6 }}>Description</label>
          <textarea 
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
            value={section.description || ''}
            onChange={e => setSection({ ...section, description: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#9e9b92', textTransform: 'uppercase', marginBottom: 6 }}>Badge</label>
          <select 
            style={inputStyle}
            value={section.badge || ''}
            onChange={e => setSection({ ...section, badge: e.target.value })}
          >
            <option value="">No Badge</option>
            <option value="Live">Live</option>
            <option value="Coming Soon">Coming Soon</option>
            <option value="New">New</option>
          </select>
        </div>

        <Btn onClick={handleSectionSave} loading={saving} style={{ background: '#00B4A6', color: 'white', border: 'none' }}>
          Save Section Info
        </Btn>
      </Card>

      <Card style={cardStyle}>
        <div style={labelStyle}>PDF DOCUMENT</div>
        <div style={{ fontSize: 12, color: '#9e9b92', marginBottom: 16 }}>
          Upload a PDF that investors can view on this section's page
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {section.pdf_url ? (
            <>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 8, 
                padding: '6px 12px', background: 'rgba(0,180,166,0.1)', 
                color: '#00B4A6', borderRadius: 6, fontSize: 12, fontWeight: 500
              }}>
                ✓ PDF Uploaded
              </div>
              <a href={section.pdf_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--gold)', textDecoration: 'none' }}>View PDF</a>
              <Btn size="sm" variant="ghost" onClick={() => fileInputRef.current.click()} loading={pdfUploading}>Replace PDF</Btn>
            </>
          ) : (
            <Btn size="sm" onClick={() => fileInputRef.current.click()} loading={pdfUploading}>Upload PDF</Btn>
          )}
          <input 
            type="file" 
            hidden 
            ref={fileInputRef}
            accept=".pdf"
            onChange={handlePdfUpload}
          />
        </div>
      </Card>

      <Card style={cardStyle}>
        <div style={{ ...labelStyle, marginBottom: 4 }}>CONTENT BLOCKS</div>
        <div style={{ fontSize: 12, color: '#9e9b92', marginBottom: 16 }}>
          Add key information blocks shown on the investor page for this section
        </div>

        {blocks.map((block, index) => (
          <div key={block.id} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <input
                placeholder="Label (e.g. Total Raised)"
                value={block.label || ''}
                onChange={(e) => updateBlock(index, 'label', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 2 }}>
              <textarea
                rows={2}
                placeholder="Value or description"
                value={block.value || ''}
                onChange={(e) => updateBlock(index, 'value', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            <button
              onClick={() => deleteBlock(block.id)}
              style={deleteButtonStyle}
            >✕</button>
          </div>
        ))}

        <button
          onClick={handleAddBlock}
          style={{
            background: 'rgba(0,180,166,0.08)',
            border: '1px solid rgba(0,180,166,0.2)',
            color: '#00B4A6', borderRadius: 8,
            padding: '8px 16px', cursor: 'pointer',
            fontSize: 13, marginTop: 8, marginBottom: 24,
            display: 'block'
          }}
        >+ Add Content Block</button>

        <Btn onClick={handleBlocksSave} loading={saving} style={{ background: '#00B4A6', color: 'white', border: 'none' }}>
          Save All Blocks
        </Btn>
      </Card>
    </div>
  );
}
