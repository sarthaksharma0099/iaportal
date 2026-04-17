import React, { useState, useEffect } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Btn, Badge, Modal, Input, Select, Textarea, Dots, useToast } from '../../components/UI';

const SECTORS = [
  'All', 'Defence', 'Energy', 'Frontier Tech', 'Fintech', 
  'Healthtech', 'eCommerce', 'Media', 'Legaltech', 'Gaming', 
  'SaaS', 'Other'
];

const STAGES = ['All Stages', 'Pre-Seed', 'Seed', 'Series A', 'Pre-IPO', 'Growth'];

export default function PortfolioManager() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All Stages');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const toast = useToast();

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', domain: '', website_url: '', sector: 'SaaS', stage: 'Seed',
    founded_year: '', description: '', logo_url: '', 
    is_featured: false, is_visible: true
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    setLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('portfolio_companies')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setCompanies(data || []);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast('Logo too large. Max 2MB.', 'error');

    // Instant preview
    const reader = new FileReader();
    reader.onload = ev => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);

    setLogoUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `logos/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('portal-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabaseAdmin.storage
        .from('portal-documents')
        .getPublicUrl(fileName);

      setFormData(f => ({ ...f, logo_url: urlData.publicUrl }));
      toast('Logo uploaded ✓');
    } catch (e) {
      toast('Upload failed: ' + e.message, 'error');
    } finally {
      setLogoUploading(false);
    }
  }

  const handleEdit = (company) => {
    setEditingCompany(company);
    setLogoPreview(null);
    setFormData({ ...company });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingCompany(null);
    setLogoPreview(null);
    setFormData({
      name: '', domain: '', website_url: '', sector: 'SaaS', stage: 'Seed',
      founded_year: '', description: '', logo_url: '', 
      is_featured: false, is_visible: true
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name) return toast('Company name is required', 'error');
    try {
      if (editingCompany) {
        const { error } = await supabaseAdmin
          .from('portfolio_companies')
          .update(formData)
          .eq('id', editingCompany.id);
        if (error) throw error;
        toast('Company updated ✓');
      } else {
        const { error } = await supabaseAdmin
          .from('portfolio_companies')
          .insert([formData]);
        if (error) throw error;
        toast('Company added ✓');
      }
      setShowModal(false);
      loadCompanies();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this company?')) return;
    try {
      const { error } = await supabaseAdmin.from('portfolio_companies').delete().eq('id', id);
      if (error) throw error;
      toast('Company deleted');
      loadCompanies();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const toggleFeatured = async (id, current) => {
    try {
      await supabaseAdmin.from('portfolio_companies').update({ is_featured: !current }).eq('id', id);
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, is_featured: !current } : c));
      toast(`Featured ${!current ? 'added' : 'removed'}`);
    } catch (e) { toast(e.message, 'error'); }
  };

  const toggleVisible = async (id, current) => {
    try {
      await supabaseAdmin.from('portfolio_companies').update({ is_visible: !current }).eq('id', id);
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, is_visible: !current } : c));
      toast(`Visibility ${!current ? 'enabled' : 'disabled'}`);
    } catch (e) { toast(e.message, 'error'); }
  };

  const filtered = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                         (c.domain || '').toLowerCase().includes(search.toLowerCase());
    const matchesStage  = stageFilter === 'All Stages' || c.stage === stageFilter;
    const matchesSector = sectorFilter === 'All' || c.sector === sectorFilter;
    return matchesSearch && matchesStage && matchesSector;
  });

  const stats = {
    total: companies.length,
    featured: companies.filter(c => c.is_featured).length,
    visible: companies.filter(c => c.is_visible).length,
    hidden: companies.filter(c => !c.is_visible).length
  };

  const getInitials = (name) => (name || '??').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div style={{ color: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 17, fontWeight: 500, margin: 0 }}>Portfolio Companies</h2>
        <Btn variant="gold" onClick={handleAdd}>+ Add Company</Btn>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total', value: stats.total },
          { label: 'Featured', value: stats.featured },
          { label: 'Visible', value: stats.visible },
          { label: 'Hidden', value: stats.hidden }
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontFamily: 'var(--serif)', color: 'var(--gold)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none' }}
            />
          </div>
          <div style={{ width: 160 }}>
            <select 
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none' }}
            >
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
          {SECTORS.map(s => (
            <button
              key={s}
              onClick={() => setSectorFilter(s)}
              style={{
                flexShrink: 0, padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
                background: sectorFilter === s ? 'rgba(0,180,166,0.1)' : 'transparent',
                border: `1px solid ${sectorFilter === s ? 'rgba(0,180,166,0.3)' : 'rgba(255,255,255,0.1)'}`,
                color: sectorFilter === s ? '#00B4A6' : 'rgba(255,255,255,0.45)'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Company Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', width: 60 }}>Logo</th>
              <th style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase' }}>Company</th>
              <th style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase' }}>Sector</th>
              <th style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase' }}>Stage</th>
              <th style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', width: 80, textAlign: 'center' }}>Featured</th>
              <th style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', width: 80, textAlign: 'center' }}>Visible</th>
              <th style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', width: 100, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }} className="table-row-hover">
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ width: 40, height: 28, background: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img 
                      src={p.logo_url || `https://logo.clearbit.com/${p.domain}`} 
                      alt={p.name}
                      style={{ height: '70%', width: '80%', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div style={{ display: 'none', color: '#00B4A6', fontSize: 11, fontWeight: 'bold' }}>{getInitials(p.name)}</div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{p.domain}</div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text2)' }}>{p.sector}</td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge variant={p.stage === 'Seed' ? 'approved' : p.stage === 'Pre-IPO' ? 'pending' : 'default'}>
                    {p.stage}
                  </Badge>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <button 
                    onClick={() => toggleFeatured(p.id, p.is_featured)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: p.is_featured ? 'var(--gold)' : 'var(--text3)' }}
                  >
                    {p.is_featured ? '★' : '☆'}
                  </button>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div 
                    onClick={() => toggleVisible(p.id, p.is_visible)}
                    style={{ 
                      width: 32, height: 18, borderRadius: 20, background: p.is_visible ? 'var(--gold)' : 'var(--bg3)', 
                      position: 'relative', cursor: 'pointer', margin: '0 auto', transition: 'all 0.2s' 
                    }}
                  >
                    <div style={{ 
                      width: 14, height: 14, background: p.is_visible ? '#000' : 'var(--text3)', borderRadius: '50%',
                      position: 'absolute', top: 2, left: p.is_visible ? 16 : 2, transition: 'all 0.2s'
                    }} />
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                    <Btn size="sm" variant="ghost" onClick={() => handleEdit(p)}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => handleDelete(p.id)}>×</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: 32, opacity: 0.2, marginBottom: 12 }}>◉</div>
            <div style={{ color: 'var(--text3)', fontSize: 14 }}>No companies found</div>
          </div>
        )}
      </div>

      <Modal 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingCompany ? "Edit Company" : "Add Company"}
        subtitle="Add a portfolio company to show investors"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Input label="Company Name*" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
          </div>
          
          <Input label="Domain (e.g. company.com)" value={formData.domain} onChange={v => setFormData({ ...formData, domain: v })} />
          <Input label="Website URL" value={formData.website_url} onChange={v => setFormData({ ...formData, website_url: v })} />
          
          <Select label="Sector" value={formData.sector} options={SECTORS.filter(s=>s!=='All').map(s=>({label:s, value:s}))} onChange={v => setFormData({ ...formData, sector: v })} />
          <Select label="Stage" value={formData.stage} options={STAGES.filter(s=>s!=='All Stages').map(s=>({label:s, value:s}))} onChange={v => setFormData({ ...formData, stage: v })} />
          
          <Input label="Founded Year" value={formData.founded_year} onChange={v => setFormData({ ...formData, founded_year: v })} />
          <div style={{ display:'flex', alignItems:'center', paddingTop: 20 }}>
            {/* checkbox spacer */}
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Description" value={formData.description} onChange={v => setFormData({ ...formData, description: v })} />
          </div>

          {/* Logo Upload Component */}
          <div style={{ gridColumn: '1 / -1', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Company Logo
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Rectangle Preview */}
              <div style={{ width: 80, height: 50, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
                {(logoPreview || formData.logo_url) ? (
                  <img src={logoPreview || formData.logo_url} style={{ height: '70%', width: '80%', objectFit: 'contain' }} alt="preview" />
                ) : (
                  <div style={{ color: '#00B4A6', fontSize: 12, fontWeight: 'bold' }}>??</div>
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <label 
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '9px 16px', borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border2)',
                    color: logoUploading ? 'var(--text3)' : 'var(--text2)', fontSize: 13, cursor: 'pointer',
                    transition: 'border-color 0.2s', marginBottom: 6
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                >
                  {logoUploading ? '⏳ Uploading...' : '📷 Upload Logo'}
                  <input type="file" accept="image/png,image/svg+xml,image/jpeg" style={{ display: 'none' }} onChange={handleLogoUpload} disabled={logoUploading} />
                </label>
                <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.4 }}>
                  PNG or SVG recommended · Max 2MB
                </div>
              </div>
            </div>
          </div>


          <div style={{ display: 'flex', gap: 20, gridColumn: '1 / -1' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} /> ☆ Featured
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.is_visible} onChange={e => setFormData({ ...formData, is_visible: e.target.checked })} /> 👁 Visible
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <Btn variant="ghost" full onClick={() => setShowModal(false)}>Cancel</Btn>
          <Btn variant="gold" full onClick={handleSave}>Save Company</Btn>
        </div>
      </Modal>

      <style>{`
        .table-row-hover:hover { background: rgba(255,255,255,0.02); }
      `}</style>
    </div>
  );
}
