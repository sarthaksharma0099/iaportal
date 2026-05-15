import React, { useState, useEffect } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Btn, Card, Dots, useToast } from '../../components/UI';

export default function PresenceContentManager() {
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabaseAdmin
          .from('content_blocks')
          .select('block_key, value')
          .eq('section_key', 'presence');
        
        if (data) {
          const map = {};
          data.forEach(b => {
            map[b.block_key] = b.value;
          });
          setFields(map);
        }
      } catch (e) {
        toast(e.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [block_key, value] of Object.entries(fields)) {
        const { error } = await supabaseAdmin
          .from('content_blocks')
          .update({ value })
          .eq('block_key', block_key);
        if (error) throw error;
      }
      toast('Presence content updated successfully');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key, val) => {
    setFields(prev => ({ ...prev, [key]: val }));
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Dots /></div>;

  const labelStyle = {
    fontSize: 12, color: '#9e9b92',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    marginBottom: 6, display: 'block'
  };

  const inputStyle = {
    width: '100%', background: '#1a1a18',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '10px 14px',
    color: 'white', fontSize: 14,
    fontFamily: 'DM Sans, sans-serif', marginBottom: 16
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <h2 style={{ fontSize: 20, color: '#fff', fontWeight: 500, margin: '0 0 8px' }}>Presence Page Content</h2>
      <div style={{ fontSize: 13, color: '#9e9b92', marginBottom: 32 }}>
        Edit text content shown on the Our Presence page
      </div>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#00B4A6', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Hero Section</div>
        
        <label style={labelStyle}>Hero Title</label>
        <input 
          style={inputStyle}
          value={fields.presence_hero_title || ''}
          onChange={e => updateField('presence_hero_title', e.target.value)}
        />

        <label style={labelStyle}>Hero Title Line 2 (italic gold)</label>
        <input 
          style={inputStyle}
          value={fields.presence_hero_subtitle_line2 || ''}
          onChange={e => updateField('presence_hero_subtitle_line2', e.target.value)}
        />

        <label style={labelStyle}>Hero Description</label>
        <textarea 
          style={{ ...inputStyle, height: 80, resize: 'vertical' }}
          value={fields.presence_hero_description || ''}
          onChange={e => updateField('presence_hero_description', e.target.value)}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Badge 1</label>
            <input 
              style={inputStyle}
              value={fields.presence_badge_1 || ''}
              onChange={e => updateField('presence_badge_1', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Badge 2</label>
            <input 
              style={inputStyle}
              value={fields.presence_badge_2 || ''}
              onChange={e => updateField('presence_badge_2', e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Badge 3</label>
            <input 
              style={inputStyle}
              value={fields.presence_badge_3 || ''}
              onChange={e => updateField('presence_badge_3', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Badge 4</label>
            <input 
              style={inputStyle}
              value={fields.presence_badge_4 || ''}
              onChange={e => updateField('presence_badge_4', e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card style={{ padding: 24, marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: '#00B4A6', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16 }}>Pan-India Section</div>

        <label style={labelStyle}>Section Title</label>
        <input 
          style={inputStyle}
          value={fields.presence_india_title || ''}
          onChange={e => updateField('presence_india_title', e.target.value)}
        />

        <label style={labelStyle}>Section Subtitle</label>
        <textarea 
          style={{ ...inputStyle, height: 60, resize: 'vertical' }}
          value={fields.presence_india_subtitle || ''}
          onChange={e => updateField('presence_india_subtitle', e.target.value)}
        />
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn onClick={handleSave} loading={saving} style={{ padding: '12px 32px' }}>
          {saving ? 'Saving...' : 'Save All Changes'}
        </Btn>
      </div>
    </div>
  );
}
