import React, { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Btn, Card, Modal, Input, Select, Textarea, Dots, useToast } from '../../components/UI';

const CATEGORIES = [
  { label: 'Founding', value: 'founding' },
  { label: 'Thesis', value: 'thesis' },
  { label: 'Functional', value: 'functional' },
  { label: 'Spaces', value: 'spaces' },
  { label: 'Mentor', value: 'mentor' }
];

export default function TeamManager() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('founding');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '', role: '', category: 'founding', bio: '',
    photo_url: '', linkedin_url: '', initials: '',
    sort_order: 0, is_visible: true
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('team_members')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      setMembers(data || []);
    } catch (e) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleAdd = () => {
    setEditingMember(null);
    setPhotoPreview(null);
    setFormData({ name: '', role: '', category: activeTab, bio: '', photo_url: '', linkedin_url: '', initials: '', sort_order: members.length + 1, is_visible: true });
    setShowModal(true);
  };

  const handleEdit = (m) => {
    setEditingMember(m);
    setPhotoPreview(m.photo_url);
    setFormData({ ...m });
    setShowModal(true);
  };

  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
    
    // Upload to Supabase storage
    setUploading(true);
    const fileName = `team/${Date.now()}-${file.name}`;
    const { error } = await supabaseAdmin.storage
      .from('portal-documents')
      .upload(fileName, file, { upsert: true });
    
    if (error) {
      toast('Upload failed: ' + error.message, 'error');
      setUploading(false);
      return;
    }
    
    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('portal-documents')
      .getPublicUrl(fileName);
    
    // Save URL to form
    setFormData(f => ({...f, photo_url: urlData.publicUrl}));
    setUploading(false);
    toast('Photo uploaded ✓');
  }

  const handleSave = async () => {
    if (!formData.name || !formData.role) return toast('Name and role are required', 'error');
    
    // Auto-generate initials if missing
    let finalData = { ...formData };
    if (!finalData.initials) {
      const parts = finalData.name.trim().split(' ');
      finalData.initials = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
    }

    try {
      if (editingMember) {
        await supabaseAdmin.from('team_members').update(finalData).eq('id', editingMember.id);
        toast('Member updated ✓');
      } else {
        await supabaseAdmin.from('team_members').insert([finalData]);
        toast('Member added ✓');
      }
      setShowModal(false);
      loadMembers();
    } catch (e) { toast(e.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this team member?')) return;
    try {
      await supabaseAdmin.from('team_members').delete().eq('id', id);
      toast('Member deleted');
      loadMembers();
    } catch (e) { toast(e.message, 'error'); }
  };

  const toggleVisibility = async (id, current) => {
    try {
      await supabaseAdmin.from('team_members').update({ is_visible: !current }).eq('id', id);
      loadMembers();
    } catch (e) { toast(e.message, 'error'); }
  };

  const seedDefaultTeam = async () => {
    if (!window.confirm('This will seed the default team members as requested. Proceed?')) return;
    try {
      const seedData = [
        // Founding
        {name:'Ashish Bhatia', role:'CEO & Founder', category:'founding', sort_order:1, photo_url:'/images/team/Ashish.jpg', initials:'AB', is_visible:true, bio:'Visionary entrepreneur building India largest startup ecosystem with 7+ years driving innovation.'},
        {name:'Mona Singh', role:'Co-Founder & Director', category:'founding', sort_order:2, photo_url:'/images/team/Mona.jpg', initials:'MS', is_visible:true, bio:'Co-founder driving strategic growth and partnerships at India Accelerator.'},
        {name:'Abhay Chawla', role:'Co-Founder & COO', category:'founding', sort_order:3, photo_url:'/images/team/abhay.jpg', initials:'AC', is_visible:true, bio:'Operations leader overseeing execution across programs and portfolio companies.'},
        {name:'Deepak Sharma', role:'Co-Founder & Managing Partner', category:'founding', sort_order:4, photo_url:'/images/team/Deepak.jpg', initials:'DS', is_visible:true, bio:'Managing Partner focused on fund strategy and investor relations.'},
        
        // Thesis
        {name:'Munish Bhatia', role:'Co-Founder, Thesis Owner - Impact', category:'thesis', sort_order:1, photo_url:'/images/team/Munish.jpg', initials:'MB', is_visible:true, bio:'Co-founder leading the Impact thesis focused on startups solving real-world challenges.'},
        {name:'Arindam Mukhopadhyay', role:'Partner, Thesis Owner - Unmanned & Mobility', category:'thesis', sort_order:2, photo_url:'/images/team/Arindam.jpg', initials:'AM', is_visible:true, bio:'Partner driving investments in unmanned systems and mobility solutions.'},
        {name:'Rakesh Saoji', role:'Partner, Thesis Owner', category:'thesis', sort_order:3, initials:'RS', is_visible:true, bio:'Partner and thesis owner identifying high-potential startups across key sectors.'},
        {name:'Vinod Abrol', role:'Lead Investment Advisor', category:'thesis', sort_order:4, initials:'VA', is_visible:true, bio:'Seasoned investment advisor with decades of experience in venture capital.'},
        
        // Functional
        {name:'Nitin Aggarwal', role:'Finance', category:'functional', sort_order:1, initials:'NA', is_visible:true, bio:'Finance leader managing financial operations, fund accounting and compliance.'},
        {name:'Saurabh Sharma', role:'Legal & Compliance', category:'functional', sort_order:2, initials:'SS', is_visible:true, bio:'Legal head ensuring regulatory compliance across all verticals.'},
        {name:'Maninder Bawa', role:'Technology', category:'functional', sort_order:3, photo_url:'/images/team/Maninde.jpg', initials:'MB', is_visible:true, bio:'Technology leader driving digital transformation and platform infrastructure.'},
        {name:'Ranjoy Dey', role:'Marketing', category:'functional', sort_order:4, initials:'RD', is_visible:true, bio:'Marketing head building brand presence and driving startup ecosystem outreach.'},
        
        // IA Spaces
        {name:'Tushar Mittal', role:'Founder, Mysoho', category:'spaces', sort_order:1, initials:'TM', is_visible:true, bio:'Founder of Mysoho leading IA Spaces operations and coworking infrastructure.'},
        {name:'Ashu Kapoor', role:'Co-Founder, Mysoho', category:'spaces', sort_order:2, initials:'AK', is_visible:true, bio:'Co-founder driving Mysoho expansion across 16+ cities.'},
        {name:'Navneet Gill', role:'Co-Founder, Mysoho', category:'spaces', sort_order:3, initials:'NG', is_visible:true, bio:'Co-founder focused on community building across the IA Spaces network.'},
        {name:'John Thomas', role:'Managing Partner', category:'spaces', sort_order:4, photo_url:'/images/team/John.jpg', initials:'JT', is_visible:true, bio:'Managing Partner overseeing IA Spaces growth strategy and partnerships.'},
        
        // Mentors
        {name:'Lt. General Anil Chait', role:'Military Strategist', category:'mentor', sort_order:1, initials:'AC', is_visible:true, bio:'Respected Indian military officer with strong leadership and strategic expertise.'},
        {name:'Gen. (Dr.) Manoj Naravane', role:'Former Indian Army Chief', category:'mentor', sort_order:2, initials:'MN', is_visible:true, bio:'Former Indian Army Chief with wide experience in leadership and management.'},
        {name:'Anjan Bose', role:'Healthcare Expert', category:'mentor', sort_order:3, initials:'AB', is_visible:true, bio:'Founding Secretary General of NATHEALTH, Ex President Philips Healthcare.'},
        {name:'Dr. Anant Malewar', role:'Robotics Expert', category:'mentor', sort_order:4, initials:'AM', is_visible:true, bio:'Robotics and embedded systems expert with deep engineering innovation insight.'},
        {name:'Hari Hegde', role:'Investment Expert', category:'mentor', sort_order:5, initials:'HH', is_visible:true, bio:'Founding Partner at Edhina Capital, ex-Wipro SVP and active angel investor.'},
        {name:'Manish Purohit', role:'ISRO Scientist & Quantum Expert', category:'mentor', sort_order:6, initials:'MP', is_visible:true, bio:'Former ISRO scientist and Quantum expert, ex-BITS Pilani.'},
        {name:'K. M. Ramakrishnan', role:'Defence Tech Expert', category:'mentor', sort_order:7, initials:'KR', is_visible:true, bio:'Rear Admiral Indian Navy and Quantum, Space and Defencetech expert.'},
        {name:'Dr. PV Venkitakrishnan', role:'Aerospace Expert', category:'mentor', sort_order:8, initials:'PV', is_visible:true, bio:'Former Director ISRO Propulsion Complex with 40+ years in aerospace.'}
      ];
      await supabaseAdmin.from('team_members').insert(seedData);
      toast('Team seeded successfully');
      loadMembers();
    } catch (e) { toast(e.message, 'error'); }
  };

  const filtered = members.filter(m => m.category === activeTab);

  if (loading && members.length === 0) return <div style={{ padding: 40, textAlign: 'center' }}><Dots /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: 24, margin: 0 }}>Team Management</h2>
        <Btn onClick={handleAdd}>+ Add Member</Btn>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '2rem', background: 'var(--bg3)', padding: 4, borderRadius: 10, alignSelf: 'flex-start' }}>
        {CATEGORIES.map(cat => (
          <button key={cat.value} onClick={() => setActiveTab(cat.value)} style={{
            padding: '8px 20px', borderRadius: 8, fontSize: 13, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === cat.value ? 'var(--gold)' : 'transparent',
            color: activeTab === cat.value ? '#000' : 'var(--text3)', fontWeight: activeTab === cat.value ? 600 : 400
          }}>
            {cat.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {filtered.map(m => (
          <Card key={m.id} style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {m.photo_url ? (
                <img src={m.photo_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--gold)' }}>{m.initials}</div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
              <div style={{ fontSize: 12, color: 'var(--gold)', marginBottom: 6 }}>{m.role}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.bio}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn size="sm" variant="ghost" onClick={() => toggleVisibility(m.id, m.is_visible)}>
                {m.is_visible ? '👁' : 'hidden'}
              </Btn>
              <Btn size="sm" variant="ghost" onClick={() => handleEdit(m)}>Edit</Btn>
              <Btn size="sm" variant="danger" onClick={() => handleDelete(m.id)}>×</Btn>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 12 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>◎</div>
            <div style={{ color: 'var(--text3)', marginBottom: 20 }}>No members in this category yet.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <Btn onClick={handleAdd}>Add team member</Btn>
              {members.length === 0 && (
                <button onClick={seedDefaultTeam} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
                  Seed Default Team members
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingMember ? "Edit Team Member" : "Add Team Member"}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <Input label="Full Name*" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
          <Input label="Initials" value={formData.initials} onChange={v => setFormData({ ...formData, initials: v.toUpperCase() })} placeholder="e.g. AB" />
        </div>
        
        {/* Photo Upload Component */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Photo
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Circle preview */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
              background: 'linear-gradient(135deg,#0d2a28,#111110)', border: '1px solid rgba(0,180,166,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#00B4A6', fontWeight: 500
            }}>
              {(photoPreview || formData.photo_url) ? (
                <img src={photoPreview || formData.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" />
              ) : (
                formData.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || '?'
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <label 
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '9px 16px', borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border2)',
                  color: uploading ? 'var(--text3)' : 'var(--text2)', fontSize: 13, cursor: 'pointer',
                  transition: 'border-color 0.2s', marginBottom: 6
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
              >
                {uploading ? '⏳ Uploading...' : '📷 Upload Photo'}
                <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handlePhotoUpload} disabled={uploading} />
              </label>
              <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.4 }}>
                JPG, PNG or WEBP · Max 5MB
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="Role*" value={formData.role} onChange={v => setFormData({ ...formData, role: v })} />
          <Select label="Category" value={formData.category} options={CATEGORIES} onChange={v => setFormData({ ...formData, category: v })} />
        </div>
        <Textarea label="Bio" value={formData.bio} onChange={v => setFormData({ ...formData, bio: v })} />
        <Input label="LinkedIn URL (optional)" value={formData.linkedin_url} onChange={v => setFormData({ ...formData, linkedin_url: v })} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'center' }}>
          <Input label="Sort Order" value={formData.sort_order} onChange={v => setFormData({ ...formData, sort_order: parseInt(v) || 0 })} type="number" />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginTop: 14 }}>
            <input type="checkbox" checked={formData.is_visible} onChange={e => setFormData({ ...formData, is_visible: e.target.checked })} /> Visible on Portal
          </label>
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <Btn variant="ghost" full onClick={() => setShowModal(false)}>Cancel</Btn>
          <Btn variant="gold" full onClick={handleSave} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Save Member'}
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
