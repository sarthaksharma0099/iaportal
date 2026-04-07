import React, { useEffect, useState } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Btn, Modal, Input, Select, Badge, useToast, Dots } from '../../components/UI';

export default function Sections() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ key: '', title: '', icon: '◈', description: '', badge: 'Live' });
  const toast = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabaseAdmin.from('portal_sections').select('*').order('sort_order');
    setSections(data || []);
    setLoading(false);
  }

  async function toggleVisibility(id, current) {
    await supabaseAdmin.from('portal_sections').update({ is_visible: !current }).eq('id', id);
    toast(!current ? 'Section is now visible' : 'Section hidden from portal');
    load();
  }

  async function updateBadge(id, badge) {
    await supabaseAdmin.from('portal_sections').update({ badge }).eq('id', id);
    toast('Badge updated'); load();
  }

  async function deleteSection(id, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await supabaseAdmin.from('portal_sections').delete().eq('id', id);
    toast('Section deleted', 'error'); load();
  }

  async function addSection() {
    if (!form.key || !form.title) { toast('Key and title are required', 'error'); return; }
    const maxOrder = Math.max(...sections.map(s => s.sort_order), 0);
    const { error } = await supabaseAdmin.from('portal_sections').insert({
      key: form.key.replace(/\s+/g, '_').toLowerCase(),
      title: form.title, icon: form.icon || '◈',
      description: form.description, badge: form.badge,
      is_visible: true, sort_order: maxOrder + 1,
    });
    if (error) { toast('Error: ' + error.message, 'error'); return; }
    toast('Section added');
    setModal(false);
    setForm({ key: '', title: '', icon: '◈', description: '', badge: 'Live' });
    load();
  }

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}><Dots /></div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Btn variant="gold" onClick={() => setModal(true)}>+ Add Section</Btn>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>Toggle visibility, manage badges, or add new sections to the investor portal.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem' }}>
        {sections.map(s => (
          <div key={s.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 24, opacity: 0.6, marginTop: 2 }}>{s.icon || '◈'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: '0.75rem', lineHeight: 1.4 }}>{s.description}</div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Badge variant={s.badge === 'Live' ? 'live' : 'pending'}>{s.badge || 'No badge'}</Badge>
                <select
                  value={s.badge || ''} onChange={e => updateBadge(s.id, e.target.value)}
                  style={{ padding: '3px 8px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text2)', fontSize: 12, cursor: 'pointer', outline: 'none' }}
                >
                  <option value="Live">Live</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="">No badge</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              {/* Toggle */}
              <button onClick={() => toggleVisibility(s.id, s.is_visible)} style={{
                width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                background: s.is_visible ? 'var(--green)' : 'var(--border2)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}>
                <span style={{ position: 'absolute', top: 3, left: s.is_visible ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block' }} />
              </button>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{s.is_visible ? 'Visible' : 'Hidden'}</span>
              <Btn variant="danger" size="sm" onClick={() => deleteSection(s.id, s.title)}>Delete</Btn>
            </div>
          </div>
        ))}
      </div>

      {/* Add Section Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Section" subtitle="Add a new section to the investor portal.">
        <Input label="Section Key (e.g. cap_table)" value={form.key} onChange={v => setForm(f => ({ ...f, key: v }))} placeholder="cap_table" />
        <Input label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Cap Table" />
        <Input label="Icon (emoji)" value={form.icon} onChange={v => setForm(f => ({ ...f, icon: v }))} placeholder="◈" />
        <Input label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Brief description shown on the portal" />
        <Select label="Badge" value={form.badge} onChange={v => setForm(f => ({ ...f, badge: v }))}
          options={[{ value: 'Live', label: 'Live' }, { value: 'Coming Soon', label: 'Coming Soon' }, { value: '', label: 'No badge' }]} />
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn variant="gold" onClick={addSection}>Add Section</Btn>
        </div>
      </Modal>
    </div>
  );
}
