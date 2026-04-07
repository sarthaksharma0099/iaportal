import React, { useEffect, useState } from 'react';
import { supabaseAdmin, SUPABASE_URL } from '../../lib/supabase';
import { Btn, useToast, Dots } from '../../components/UI';

export default function Content() {
  const [sections, setSections]       = useState([]);
  const [selected, setSelected]       = useState(null);
  const [blocks, setBlocks]           = useState([]);
  const [edits, setEdits]             = useState({});
  const [saving, setSaving]           = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [uploading, setUploading]     = useState(false);
  const toast = useToast();

  useEffect(() => { loadSections(); }, []);

  async function loadSections() {
    const { data } = await supabaseAdmin.from('portal_sections').select('key,title,icon').order('sort_order');
    setSections(data || []);
  }

  async function selectSection(key, title) {
    setSelected({ key, title });
    setLoadingBlocks(true);
    const { data } = await supabaseAdmin.from('content_blocks').select('*').eq('section_key', key);
    setBlocks(data || []);
    const map = {};
    (data || []).forEach(b => { map[b.block_key] = b.value || ''; });
    setEdits(map);
    setLoadingBlocks(false);
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    const updates = blocks.map(b => ({
      ...b, value: edits[b.block_key] ?? b.value,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabaseAdmin.from('content_blocks').upsert(updates, { onConflict: 'section_key,block_key' });
    setSaving(false);
    if (error) { toast('Save failed: ' + error.message, 'error'); return; }
    toast('Content saved ✓');
  }

  async function addBlock() {
    const key   = window.prompt('Block key (e.g. headline, arr_value):');
    if (!key) return;
    const label = window.prompt('Label (human-readable):') || key;
    const type  = window.prompt('Type — text / number / url / html:') || 'text';
    const { error } = await supabaseAdmin.from('content_blocks').insert({
      section_key: selected.key, block_key: key, label, value_type: type, value: '',
    });
    if (error) { toast('Error: ' + error.message, 'error'); return; }
    toast('Block added');
    selectSection(selected.key, selected.title);
  }

  async function handlePdfUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast('Please select a PDF file', 'error');
      return;
    }

    setUploading(true);
    let nextIdx = 1;
    for (let i = 1; i <= 10; i++) {
      if (!edits[`pdf_${i}_url` ]) {
        nextIdx = i;
        break;
      }
    }
    if (nextIdx > 10) {
      toast('Max 10 PDFs reached for this section', 'error');
      setUploading(false);
      return;
    }

    const path = `${selected.key}/${file.name}`;

    try {
      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabaseAdmin.storage
        .from('portal-documents')
        .upload(path, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      // 2. Construct public URL
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/portal-documents/${path}`;

      const { error: dbError } = await supabaseAdmin.from('content_blocks').upsert([
        {
          section_key: selected.key,
          block_key:   `pdf_${nextIdx}_url`,
          label:       `PDF ${nextIdx} URL`,
          value_type:  'url',
          value:       publicUrl,
          updated_at:  new Date().toISOString(),
        },
        {
          section_key: selected.key,
          block_key:   `pdf_${nextIdx}_name`,
          label:       `PDF ${nextIdx} Name`,
          value_type:  'text',
          value:       file.name,
          updated_at:  new Date().toISOString(),
        }
      ], { onConflict: 'section_key,block_key' });

      if (dbError) throw new Error(dbError.message);

      toast('PDF uploaded and linked successfully ✓');
      selectSection(selected.key, selected.title); // Refresh view
    } catch (err) {
      toast('Upload failed: ' + err.message, 'error');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  }

  async function deletePdf(idx) {
    if (!window.confirm(`Are you sure you want to delete PDF #${idx}?`)) return;
    const url = edits[`pdf_${idx}_url` ];
    if (!url) return;

    const path = url.split('/portal-documents/')[1];
    if (!path) return;

    try {
      const { error: storageError } = await supabaseAdmin.storage.from('portal-documents').remove([path]);
      if (storageError) throw new Error(storageError.message);

      const { error: dbError } = await supabaseAdmin.from('content_blocks')
        .delete()
        .match({ section_key: selected.key })
        .in('block_key', [`pdf_${idx}_url`, `pdf_${idx}_name`]);

      if (dbError) throw new Error(dbError.message);

      toast('PDF deleted ✓');
      selectSection(selected.key, selected.title);
    } catch (err) {
      toast('Delete failed: ' + err.message, 'error');
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', height: 'calc(100vh - 120px)' }}>
      {/* Section list */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Select Section</div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {sections.map(s => (
            <div key={s.key} onClick={() => selectSection(s.key, s.title)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0.85rem 1.25rem', cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
                background: selected?.key === s.key ? 'var(--gold-dim)' : 'transparent',
                borderLeft: `2px solid ${selected?.key === s.key ? 'var(--gold)' : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
              <span style={{ fontSize: 15, opacity: 0.7 }}>{s.icon}</span>
              <span style={{ fontSize: 13, color: selected?.key === s.key ? 'var(--gold)' : 'var(--text)' }}>{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
            {selected ? `Editing: ${selected.title}` : 'Select a section to edit'}
          </span>
          {selected && (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="pdf-upload-input"
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={handlePdfUpload}
              />
              <Btn variant="ghost" size="sm" disabled={uploading || saving} onClick={() => document.getElementById('pdf-upload-input').click()}>
                {uploading ? <Dots /> : 'Upload PDF'}
              </Btn>
              <Btn variant="gold" size="sm" disabled={saving || uploading} onClick={save}>
                {saving ? <Dots /> : 'Save Changes'}
              </Btn>
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {!selected && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text3)', fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: '1rem', opacity: 0.3 }}>◈</div>
              Choose a section from the left to edit its content.
            </div>
          )}

          {selected && loadingBlocks && (
            <div style={{ textAlign: 'center', padding: '3rem' }}><Dots /></div>
          )}

          {selected && !loadingBlocks && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                Uploaded Documents
                <span style={{ width: 40, height: 1, background: 'var(--border)' }} />
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => {
                  const url = edits[`pdf_${i}_url` ];
                  const name = edits[`pdf_${i}_name` ] || `PDF #${i}`;
                  if (!url) return null;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 16 }}>📄</span>
                        <div>
                          <div style={{ fontSize: 13, color: 'var(--text)' }}>{name}</div>
                          <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>pdf_{i}_url</div>
                        </div>
                      </div>
                      <button
                        onClick={() => deletePdf(i)}
                        style={{ background: 'rgba(224,92,74,0.1)', border: '1px solid rgba(224,92,74,0.2)', color: '#e05c4a', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
                {!Object.keys(edits).some(k => k.startsWith('pdf_') && k.endsWith('_url')) && (
                  <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 8, color: 'var(--text3)', fontSize: 12 }}>
                    No PDFs uploaded yet. Use the header button to upload.
                  </div>
                )}
              </div>
            </div>
          )}

          {selected && !loadingBlocks && blocks.length === 0 && !Object.keys(edits).some(k => k.startsWith('pdf_') && k.endsWith('_url')) && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)', fontSize: 13 }}>
              <div style={{ fontSize: 24, marginBottom: '0.75rem', opacity: 0.3 }}>◈</div>
              No content blocks yet.
              <div style={{ marginTop: '1rem' }}>
                <Btn variant="gold" size="sm" onClick={addBlock}>+ Add Content Block</Btn>
              </div>
            </div>
          )}

          {selected && !loadingBlocks && blocks.map(b => (
            <div key={b.block_key} style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                {b.label || b.block_key}
              </div>
              {(b.value_type === 'html' || (edits[b.block_key] || '').length > 80) ? (
                <textarea
                  value={edits[b.block_key] || ''}
                  onChange={e => setEdits(prev => ({ ...prev, [b.block_key]: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.5, fontFamily: 'var(--sans)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border2)'}
                />
              ) : (
                <input
                  type="text"
                  value={edits[b.block_key] || ''}
                  onChange={e => setEdits(prev => ({ ...prev, [b.block_key]: e.target.value }))}
                  placeholder="Enter value…"
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--sans)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border2)'}
                />
              )}
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{b.block_key} · {b.value_type}</span>
            </div>
          ))}

          {selected && !loadingBlocks && blocks.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <Btn variant="ghost" size="sm" onClick={addBlock}>+ Add field</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
