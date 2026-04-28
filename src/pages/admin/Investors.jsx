import React, { useEffect, useState } from 'react';
import { supabaseAdmin } from '../../lib/supabase';
import { Btn, Badge, Modal, Input, useToast, Dots } from '../../components/UI';

function fmt(iso) {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Investors() {
  const [all, setAll]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({ name: '', email: '', firm: '', note: '' });
  const toast = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabaseAdmin.from('investors').select('*').order('created_at', { ascending: false });
    setAll(data || []);
    setFiltered(data || []);
    setLoading(false);
  }

  function filter(q) {
    const lower = q.toLowerCase();
    setFiltered(all.filter(i =>
      i.email.includes(lower) ||
      (i.name || '').toLowerCase().includes(lower) ||
      (i.firm || '').toLowerCase().includes(lower)
    ));
  }

  async function updateStatus(id, status) {
    const update = { status };
    if (status === 'approved') update.approved_at = new Date().toISOString();
    await supabaseAdmin.from('investors').update(update).eq('id', id);
    toast(`Investor ${status}`);
    load();
  }

  async function remove(id, email) {
    if (!window.confirm(`Remove ${email}?`)) return;
    await supabaseAdmin.from('investors').delete().eq('id', id);
    toast('Removed', 'error'); load();
  }

  async function addInvestor() {
    if (!form.email) { toast('Email is required', 'error'); return; }
    const { error } = await supabaseAdmin.from('investors').upsert({
      name: form.name, email: form.email.toLowerCase(),
      firm: form.firm, note: form.note,
      status: 'approved', approved_at: new Date().toISOString(),
    }, { onConflict: 'email' });
    if (error) { toast('Error: ' + error.message, 'error'); return; }
    toast('Investor added & approved');
    setModal(false);
    setForm({ name: '', email: '', firm: '', note: '' });
    load();
  }

  const statusVariant = { approved: 'approved', pending: 'pending', revoked: 'revoked' };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <Btn variant="gold" onClick={() => setModal(true)}>+ Add Investor</Btn>
        <input
          type="text" placeholder="Search by name, email or firm…"
          onChange={e => filter(e.target.value)}
          style={{ padding: '8px 14px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none', width: 260, fontFamily: 'var(--sans)' }}
          onFocus={e => e.target.style.borderColor = 'var(--gold)'}
          onBlur={e => e.target.style.borderColor = 'var(--border2)'}
        />
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
          Investor Access List <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 400 }}>({filtered.length})</span>
        </div>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}><Dots /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Name', 'Email', 'Firm', 'Status', 'Last Viewed', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.65rem 1.25rem', fontSize: 11, fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border)', background: 'var(--bg3)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No investors yet. Add one above.</td></tr>
                )}
                {filtered.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: 13, color: 'var(--text)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{inv.name || '—'}</td>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)', borderBottom: '1px solid var(--border)' }}>{inv.email}</td>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: 13, color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>{inv.firm || '—'}</td>
                    <td style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                      <Badge variant={statusVariant[inv.status]}>{inv.status}</Badge>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{fmt(inv.last_viewed_at)}</td>
                    <td style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {inv.status !== 'approved' && <Btn size="sm" variant="success" onClick={() => updateStatus(inv.id, 'approved')}>Approve</Btn>}
                        {inv.status !== 'revoked'  && <Btn size="sm" variant="danger"  onClick={() => updateStatus(inv.id, 'revoked')}>Revoke</Btn>}
                        <Btn size="sm" variant="ghost" onClick={() => remove(inv.id, inv.email)}>Remove</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Investor" subtitle="Grant portal access to an investor by email.">
        <Input label="Full Name"  value={form.name}  onChange={v => setForm(f => ({ ...f, name: v }))}  placeholder="Rahul Sharma" />
        <Input label="Email"      type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="rahul@firm.com" />
        <Input label="Firm"       value={form.firm}  onChange={v => setForm(f => ({ ...f, firm: v }))}  placeholder="Sequoia Capital" />
        <Input label="Note (internal)" value={form.note} onChange={v => setForm(f => ({ ...f, note: v }))} placeholder="Met at Surge 2025…" />
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
          <Btn variant="gold"  onClick={addInvestor}>Add & Approve</Btn>
        </div>
      </Modal>
    </div>
  );
}
