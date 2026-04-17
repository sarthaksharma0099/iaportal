import React, { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Btn, Card, Badge, Modal, Input, Textarea, Dots, useToast } from '../../components/UI';

export default function ThesesManager() {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingThesis, setEditingThesis] = useState(null);
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '', code: '', description: '', 
    focus_areas: '', company_count: 0, 
    color: '#00B4A6', is_visible: true
  });

  const loadTheses = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('investment_theses')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setTheses(data || []);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => {
    loadTheses();
  }, [loadTheses]);

  const handleAdd = () => {
    setEditingThesis(null);
    setFormData({ name: '', code: '', description: '', focus_areas: '', company_count: 0, color: '#00B4A6', is_visible: true });
    setShowModal(true);
  };

  const handleEdit = (t) => {
    setEditingThesis(t);
    setFormData({ ...t });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code) return toast('Name and code are required', 'error');
    try {
      if (editingThesis) {
        await supabaseAdmin.from('investment_theses').update(formData).eq('id', editingThesis.id);
        toast('Thesis updated');
      } else {
        await supabaseAdmin.from('investment_theses').insert([formData]);
        toast('Thesis added');
      }
      setShowModal(false);
      loadTheses();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this thesis?')) return;
    try {
      await supabaseAdmin.from('investment_theses').delete().eq('id', id);
      toast('Thesis deleted');
      loadTheses();
    } catch (e) { toast(e.message, 'error'); }
  };

  const toggleVisibility = async (id, current) => {
    try {
      await supabaseAdmin.from('investment_theses').update({ is_visible: !current }).eq('id', id);
      loadTheses();
    } catch (e) { toast(e.message, 'error'); }
  };

  if (loading && theses.length === 0) return <div style={{ padding: 40, textAlign: 'center' }}><Dots /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: 24, margin: 0 }}>Investment Theses</h2>
        <Btn onClick={handleAdd}>+ Add Thesis</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {theses.map(t => (
          <Card key={t.id} style={{ padding: 20, borderLeft: `4px solid ${t.color}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#fff', marginBottom: 4 }}>{t.name}</div>
                <Badge variant="live">{t.code}</Badge>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn size="sm" variant="ghost" onClick={() => toggleVisibility(t.id, t.is_visible)}>
                  {t.is_visible ? '👁' : 'hidden'}
                </Btn>
                <Btn size="sm" variant="ghost" onClick={() => handleEdit(t)}>Edit</Btn>
                <Btn size="sm" variant="danger" onClick={() => handleDelete(t.id)}>×</Btn>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.5 }}>{t.description}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              <b>Focus Areas:</b> {t.focus_areas}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>{t.company_count} companies</span>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: t.color, border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          </Card>
        ))}
        {theses.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 12 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>◧</div>
            <div style={{ color: 'var(--text3)', marginBottom: 20 }}>No investment theses defined yet.</div>
            <Btn onClick={handleAdd}>Add your first thesis</Btn>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingThesis ? "Edit Thesis" : "Add Thesis"}>
        <Input label="Thesis Name*" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
        <Input label="Short Code*" value={formData.code} onChange={v => setFormData({ ...formData, code: v.toUpperCase() })} placeholder="e.g. DA" />
        <Textarea label="Description" value={formData.description} onChange={v => setFormData({ ...formData, description: v })} />
        <Textarea label="Focus Areas (comma separated)" value={formData.focus_areas} onChange={v => setFormData({ ...formData, focus_areas: v })} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="Company Count" value={formData.company_count} onChange={v => setFormData({ ...formData, company_count: parseInt(v) || 0 })} type="number" />
          <Input label="Color (Hex)" value={formData.color} onChange={v => setFormData({ ...formData, color: v })} placeholder="#00B4A6" />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginTop: 10 }}>
          <input type="checkbox" checked={formData.is_visible} onChange={e => setFormData({ ...formData, is_visible: e.target.checked })} /> Visible on Portal
        </label>
        <div style={{ marginTop: 24 }}>
          <Btn full onClick={handleSave}>Save Thesis</Btn>
        </div>
      </Modal>
    </div>
  );
}
