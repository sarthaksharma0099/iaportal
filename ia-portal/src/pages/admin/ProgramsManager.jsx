import React, { useState, useEffect } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Btn, Card, Badge, Modal, Input, Select, Textarea, Dots, useToast } from '../../components/UI';

const STATUS_OPTIONS = [
  { label: 'Active', value: 'Active' },
  { label: 'Closed', value: 'Closed' },
  { label: 'Upcoming', value: 'Upcoming' }
];

export default function ProgramsManager() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '', description: '', status: 'Active',
    start_date: '', end_date: '', app_count: 0, is_visible: true
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  async function loadPrograms() {
    setLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('programs')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setPrograms(data || []);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  const handleAdd = () => {
    setEditingProgram(null);
    setFormData({ name: '', description: '', status: 'Active', start_date: '', end_date: '', app_count: 0, is_visible: true });
    setShowModal(true);
  };

  const handleEdit = (p) => {
    setEditingProgram(p);
    setFormData({ ...p });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name) return toast('Program name is required', 'error');
    try {
      if (editingProgram) {
        await supabaseAdmin.from('programs').update(formData).eq('id', editingProgram.id);
        toast('Program updated');
      } else {
        await supabaseAdmin.from('programs').insert([formData]);
        toast('Program added');
      }
      setShowModal(false);
      loadPrograms();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this program?')) return;
    try {
      await supabaseAdmin.from('programs').delete().eq('id', id);
      toast('Program deleted');
      loadPrograms();
    } catch (e) { toast(e.message, 'error'); }
  };

  const toggleVisibility = async (id, current) => {
    try {
      await supabaseAdmin.from('programs').update({ is_visible: !current }).eq('id', id);
      loadPrograms();
    } catch (e) { toast(e.message, 'error'); }
  };

  if (loading && programs.length === 0) return <div style={{ padding: 40, textAlign: 'center' }}><Dots /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: 24, margin: 0 }}>Programs</h2>
        <Btn onClick={handleAdd}>+ Add Program</Btn>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {programs.map(p => (
          <Card key={p.id} style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr auto', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>{p.name}</span>
                <Badge variant={p.status === 'Active' ? 'live' : p.status === 'Closed' ? 'revoked' : 'soon'}>
                  {p.status}
                </Badge>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>{p.description}</div>
              <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--text3)' }}>
                <span>Applications: <b style={{ color: 'var(--text)' }}>{p.app_count}</b></span>
                {p.start_date && <span>Timeline: <b style={{ color: 'var(--text)' }}>{p.start_date} - {p.end_date || 'TBD'}</b></span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Btn size="sm" variant="ghost" onClick={() => toggleVisibility(p.id, p.is_visible)}>
                {p.is_visible ? '👁' : 'hidden'}
              </Btn>
              <Btn size="sm" variant="ghost" onClick={() => handleEdit(p)}>Edit</Btn>
              <Btn size="sm" variant="danger" onClick={() => handleDelete(p.id)}>×</Btn>
            </div>
          </Card>
        ))}
        {programs.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 12 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>◫</div>
            <div style={{ color: 'var(--text3)', marginBottom: 20 }}>No accelerator programs listed yet.</div>
            <Btn onClick={handleAdd}>Add your first program</Btn>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingProgram ? "Edit Program" : "Add Program"}>
        <Input label="Program Name*" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
        <Textarea label="Description" value={formData.description} onChange={v => setFormData({ ...formData, description: v })} />
        <Select label="Status" value={formData.status} options={STATUS_OPTIONS} onChange={v => setFormData({ ...formData, status: v })} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="Start Date" value={formData.start_date} onChange={v => setFormData({ ...formData, start_date: v })} placeholder="e.g. Q3 2025" />
          <Input label="End Date" value={formData.end_date} onChange={v => setFormData({ ...formData, end_date: v })} placeholder="e.g. Q4 2025" />
        </div>
        <Input label="Application Count" value={formData.app_count} onChange={v => setFormData({ ...formData, app_count: parseInt(v) || 0 })} type="number" />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginTop: 10 }}>
          <input type="checkbox" checked={formData.is_visible} onChange={e => setFormData({ ...formData, is_visible: e.target.checked })} /> Visible on Portal
        </label>
        <div style={{ marginTop: 24 }}>
          <Btn full onClick={handleSave}>Save Program</Btn>
        </div>
      </Modal>
    </div>
  );
}
