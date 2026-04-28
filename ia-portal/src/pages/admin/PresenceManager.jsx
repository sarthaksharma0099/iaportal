import React, { useState, useEffect } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Btn, Card, Dots, useToast, Modal, Input, Select } from '../../components/UI';

const DEFAULT_GLOBAL = [
  { id: 'usa', name: 'United States', flag: '🇺🇸', focus: 'SaaS, Deeptech', type: 'Partner' },
  { id: 'canada', name: 'Canada', flag: '🇨🇦', focus: 'Health, D2C', type: 'Partner' },
  { id: 'germany', name: 'Germany', flag: '🇩🇪', focus: 'Fintech, AI', type: 'Partner' },
  { id: 'uae', name: 'UAE', flag: '🇦🇪', focus: 'Health, Fintech', type: 'Partner' },
  { id: 'saudi', name: 'Saudi Arabia', flag: '🇸🇦', focus: 'Energy, AI', type: 'Partner' },
  { id: 'india', name: 'India', flag: '🇮🇳', focus: 'IA Headquarters', type: 'HQ' },
  { id: 'japan', name: 'Japan', flag: '🇯🇵', focus: 'AI, EV, Life Sciences', type: 'Partner' },
  { id: 'australia', name: 'Australia', flag: '🇦🇺', focus: 'Cleantech, AI', type: 'Partner' },
];

const DEFAULT_INDIA = [
  { city: 'Gurgaon', hubs: 5, type: 'HQ' },
  { city: 'New Delhi', hubs: 3, type: 'Hub' },
  { city: 'Noida', hubs: 2, type: 'Hub' },
  { city: 'Mumbai', hubs: 3, type: 'Hub' },
  { city: 'Bangalore', hubs: 3, type: 'Hub' },
  { city: 'Hyderabad', hubs: 2, type: 'Hub' },
  { city: 'Chennai', hubs: 1, type: 'Hub' },
  { city: 'Pune', hubs: 2, type: 'Hub' },
  { city: 'Kolkata', hubs: 1, type: 'Hub' },
  { city: 'Ahmedabad', hubs: 2, type: 'Hub' },
  { city: 'Jaipur', hubs: 1, type: 'Hub' },
  { city: 'Chandigarh', hubs: 1, type: 'Hub' },
  { city: 'Surat', hubs: 1, type: 'Hub' },
  { city: 'Ludhiana', hubs: 1, type: 'Hub' },
  { city: 'Amritsar', hubs: 1, type: 'Hub' },
  { city: 'Dehradun', hubs: 1, type: 'Hub' },
];

export default function PresenceManager() {
  const [tab, setTab] = useState('india');
  const [loading, setLoading] = useState(true);
  const [indiaLocs, setIndiaLocs] = useState([]);
  const [globalLocs, setGlobalLocs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const toast = useToast();

  useEffect(() => {
    async function init() {
      // 1. Ensure portal section exists
      const { data: section } = await supabaseAdmin
        .from('portal_sections')
        .select('id')
        .eq('key', 'presence')
        .maybeSingle();

      if (!section) {
        await supabaseAdmin.from('portal_sections').insert({
          key: 'presence',
          title: 'Our Presence',
          icon: '◎',
          description: 'Pan-India and global footprint — 30+ hubs across 16 cities and 8 countries',
          badge: 'Live',
          is_visible: true,
          sort_order: 8,
          section_type: 'presence'
        });
      }

      // 2. Load locations
      const { data: blocks } = await supabaseAdmin
        .from('content_blocks')
        .select('*')
        .eq('section_key', 'presence');

      const indiaBlock = blocks?.find(b => b.block_key === 'india_locations');
      const globalBlock = blocks?.find(b => b.block_key === 'global_locations');

      setIndiaLocs(indiaBlock ? JSON.parse(indiaBlock.value) : DEFAULT_INDIA);
      setGlobalLocs(globalBlock ? JSON.parse(globalBlock.value) : DEFAULT_GLOBAL);
      setLoading(false);
    }
    init();
  }, []);

  async function saveLocations(type, data) {
    const key = type === 'india' ? 'india_locations' : 'global_locations';
    const label = type === 'india' ? 'India Hub Locations' : 'Global Partner Locations';
    
    const { error } = await supabaseAdmin
      .from('content_blocks')
      .upsert({
        section_key: 'presence',
        block_key: key,
        value: JSON.stringify(data),
        value_type: 'json',
        label: label,
        updated_at: new Date().toISOString()
      }, { onConflict: 'section_key,block_key' });

    if (error) toast(error.message, 'error');
    else toast('Locations updated successfully');
  }

  const handleDelete = (index) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;
    const newData = tab === 'india' ? [...indiaLocs] : [...globalLocs];
    newData.splice(index, 1);
    if (tab === 'india') setIndiaLocs(newData);
    else setGlobalLocs(newData);
    saveLocations(tab, newData);
  };

  const handleEdit = (item, index) => {
    setEditingItem({ ...item, index });
    setModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newItem = Object.fromEntries(formData.entries());
    if (tab === 'india') newItem.hubs = parseInt(newItem.hubs);

    const newData = tab === 'india' ? [...indiaLocs] : [...globalLocs];
    if (editingItem && editingItem.index !== undefined) {
      newData[editingItem.index] = newItem;
    } else {
      newData.push(newItem);
    }

    if (tab === 'india') setIndiaLocs(newData);
    else setGlobalLocs(newData);
    
    saveLocations(tab, newData);
    setModalOpen(false);
    setEditingItem(null);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Dots /></div>;

  return (
    <div style={{ maxWidth: 1000 }}>
      <header style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 300, color: '#fff', marginBottom: 8, fontFamily: 'var(--serif)' }}>Presence Manager</h2>
        <p style={{ color: 'var(--text3)', fontSize: 14 }}>Manage India and global location pins shown on the maps.</p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
        {['india', 'global'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
              color: tab === t ? 'var(--gold)' : 'var(--text3)',
              borderBottom: `2px solid ${tab === t ? 'var(--gold)' : 'transparent'}`,
              fontSize: 14, fontWeight: 500, textTransform: 'capitalize', transition: 'all 0.2s'
            }}
          >
            {t} Locations
          </button>
        ))}
      </div>

      <Card style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>{tab === 'india' ? 'India Hubs' : 'Global Partners'}</h3>
          <Btn onClick={() => { setEditingItem(null); setModalOpen(true); }}>+ Add Location</Btn>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              {tab === 'india' ? (
                <>
                  <th style={thStyle}>City</th>
                  <th style={thStyle}>Hubs</th>
                  <th style={thStyle}>Type</th>
                </>
              ) : (
                <>
                  <th style={thStyle}>Country</th>
                  <th style={thStyle}>Flag</th>
                  <th style={thStyle}>Focus</th>
                  <th style={thStyle}>Type</th>
                </>
              )}
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(tab === 'india' ? indiaLocs : globalLocs).map((loc, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                {tab === 'india' ? (
                  <>
                    <td style={tdStyle}>{loc.city}</td>
                    <td style={tdStyle}>{loc.hubs}</td>
                    <td style={tdStyle}>{loc.type}</td>
                  </>
                ) : (
                  <>
                    <td style={tdStyle}>{loc.name}</td>
                    <td style={tdStyle}>{loc.flag}</td>
                    <td style={tdStyle}>{loc.focus}</td>
                    <td style={tdStyle}>{loc.type}</td>
                  </>
                )}
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <Btn variant="ghost" size="sm" onClick={() => handleEdit(loc, i)} style={{ marginRight: 8 }}>Edit</Btn>
                  <Btn variant="danger" size="sm" onClick={() => handleDelete(i)}>Delete</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Location' : 'Add Location'}>
        <form onSubmit={handleSaveModal}>
          {tab === 'india' ? (
            <>
              <Input label="City Name" name="city" defaultValue={editingItem?.city} required />
              <Input label="Hubs Count" name="hubs" type="number" defaultValue={editingItem?.hubs} required />
              <Select label="Type" name="type" defaultValue={editingItem?.type || 'Hub'} options={[
                { label: 'Accelerator Hub', value: 'Hub' },
                { label: 'IA Headquarters', value: 'HQ' }
              ]} />
            </>
          ) : (
            <>
              <Input label="Country Name" name="name" defaultValue={editingItem?.name} required />
              <Input label="Flag Emoji" name="flag" defaultValue={editingItem?.flag || '🚩'} required />
              <Input label="Focus Areas" name="focus" defaultValue={editingItem?.focus} placeholder="e.g. AI, Fintech" required />
              <Select label="Type" name="type" defaultValue={editingItem?.type || 'Partner'} options={[
                { label: 'Partner', value: 'Partner' },
                { label: 'Strategic Office', value: 'Office' },
                { label: 'IA Headquarters', value: 'HQ' }
              ]} />
            </>
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <Btn variant="ghost" full type="button" onClick={() => setModalOpen(false)}>Cancel</Btn>
            <Btn full type="submit">Save Location</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const thStyle = { padding: '12px 16px', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 };
const tdStyle = { padding: '16px', fontSize: 14, color: 'var(--text2)' };
