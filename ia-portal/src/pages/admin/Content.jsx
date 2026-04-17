import React, { useEffect, useState } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Btn, useToast, Dots } from '../../components/UI';

const ALLOWED_BLOCKS = [
  'fund_name', 'tagline', 'stage',
  'stat1_value', 'stat1_label',
  'stat2_value', 'stat2_label',
  'stat3_value', 'stat3_label',
  'stat4_value', 'stat4_label'
];

export default function Content() {
  const [sections, setSections]       = useState([]);
  const [selected, setSelected]       = useState(null);
  const [blocks, setBlocks]           = useState([]);
  const [edits, setEdits]             = useState({});
  const [saving, setSaving]           = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const toast = useToast();

  useEffect(() => { loadSections(); }, []);

  async function loadSections() {
    // Only show 'hero' section
    const { data } = await supabaseAdmin
      .from('portal_sections')
      .select('key,title,icon')
      .eq('key', 'hero');
    setSections(data || []);
    if (data && data.length > 0) {
      selectSection(data[0].key, data[0].title);
    }
  }

  async function selectSection(key, title) {
    setSelected({ key, title });
    setLoadingBlocks(true);
    const { data } = await supabaseAdmin
      .from('content_blocks')
      .select('*')
      .eq('section_key', key);
    
    // Filter to only show allowed blocks for the hero section
    const filtered = (data || []).filter(b => ALLOWED_BLOCKS.includes(b.block_key));
    setBlocks(filtered);
    
    const map = {};
    filtered.forEach(b => { map[b.block_key] = b.value || ''; });
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
    toast('Hero content saved ✓');
  }

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Reassurance Note */}
      <div style={{
        background: 'rgba(201,168,76,0.06)',
        border: '1px solid rgba(201,168,76,0.15)',
        borderRadius: 10,
        padding: '14px 20px',
        marginBottom: 24,
        fontSize: 14,
        color: 'rgba(201,168,76,0.8)',
        lineHeight: 1.5
      }}>
        This page controls the hero section of the investor portal homepage — the fund name, tagline, stage label, and the 4 key stats shown to investors when they first log in. All other content is managed from the dedicated tabs in the sidebar.
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
            Hero Section Editor
          </span>
          <Btn variant="gold" size="sm" disabled={saving} onClick={save}>
            {saving ? <Dots /> : 'Save Changes'}
          </Btn>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {loadingBlocks ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><Dots /></div>
          ) : (
            <>
              {blocks.map(b => (
                <div key={b.block_key} style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                    {b.label || b.block_key}
                  </div>
                  {(edits[b.block_key] || '').length > 80 ? (
                    <textarea
                      value={edits[b.block_key] || ''}
                      onChange={e => setEdits(prev => ({ ...prev, [b.block_key]: e.target.value }))}
                      rows={2}
                      style={{ width: '100%', padding: '10px 14px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none', resize: 'vertical', lineHeight: 1.5, fontFamily: 'var(--sans)' }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={edits[b.block_key] || ''}
                      onChange={e => setEdits(prev => ({ ...prev, [b.block_key]: e.target.value }))}
                      placeholder="Enter value…"
                      style={{ width: '100%', padding: '10px 14px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--sans)' }}
                    />
                  )}
                </div>
              ))}
              {blocks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)', fontSize: 13 }}>
                  No hero content blocks found in database.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

