import React, { useState, useEffect } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Dots, useToast } from '../../components/UI';

export default function FinancialsManager() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const toast = useToast();

  const loadSections = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('financials_sections')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      setSections(data || []);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  async function toggleSection(key) {
    setSaving(key);
    try {
      const section = sections.find(s => s.key === key);
      const newVal = !section.is_visible;
      
      const { error } = await supabaseAdmin
        .from('financials_sections')
        .update({ is_visible: newVal })
        .eq('key', key);

      if (error) throw error;

      setSections(prev => prev.map(s => 
        s.key === key ? { ...s, is_visible: newVal } : s
      ));
      toast(`${section.label} ${newVal ? 'visible' : 'hidden'}`);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}><Dots /></div>;
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <h2 style={{ fontSize: 20, color: '#fff', fontWeight: 500, margin: '0 0 8px' }}>Financials Sections</h2>
      <p style={{ fontSize: 13, color: '#9e9b92', marginBottom: 32 }}>
        Control which sections are visible to investors on the Financials page.
        Hidden sections are preserved — you can re-enable them anytime.
      </p>

      {sections.map(section => (
        <div key={section.key} style={{
          background: '#111110',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12, padding: '20px 24px',
          marginBottom: 12,
          display: 'flex', alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 15, color: '#fff', fontWeight: 500 }}>{section.label}</div>
            <div style={{ fontSize: 12, color: '#9e9b92', marginTop: 4 }}>{section.description || `Manage visibility for ${section.label} section`}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {saving === section.key ? (
              <div style={{ width: 44, display: 'flex', justifyContent: 'center' }}><Dots size="sm" /></div>
            ) : (
              <>
                <span style={{ fontSize: 12, color: section.is_visible ? '#00B4A6' : '#9e9b92' }}>
                  {section.is_visible ? 'Visible' : 'Hidden'}
                </span>
                <div 
                  onClick={() => toggleSection(section.key)}
                  style={{
                    width: 44, height: 24,
                    borderRadius: 12,
                    background: section.is_visible ? '#00B4A6' : 'rgba(255,255,255,0.1)',
                    position: 'relative', cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    width: 18, height: 18,
                    borderRadius: '50%',
                    background: 'white',
                    top: 3,
                    left: section.is_visible ? 23 : 3,
                    transition: 'left 0.2s'
                  }} />
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
