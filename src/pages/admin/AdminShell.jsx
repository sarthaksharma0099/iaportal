import React from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard  from './Dashboard';
import Sections   from './Sections';
import Content    from './Content';
import Investors  from './Investors';
import Requests   from './Requests';
import Analytics  from './Analytics';
import PortfolioManager from './PortfolioManager';
import ProgramsManager from './ProgramsManager';
import ThesesManager from './ThesesManager';
import TeamManager from './TeamManager';
import PitchDeckManager from './PitchDeckManager';
import FinancialsManager from './FinancialsManager';
import PresenceManager from './PresenceManager';

const NAV = [
  { key: 'dashboard',  label: 'Dashboard',    icon: '▦', group: 'Overview' },
  { key: 'sections',   label: 'Sections',     icon: '◫', group: 'Portal' },
  { key: 'content',    label: 'Hero Content', icon: '◈', group: 'Portal' },
  { key: 'portfolio',  label: 'Portfolio',    icon: '◉', group: 'Portal' },
  { key: 'programs',   label: 'Programs',     icon: '◫', group: 'Portal' },
  { key: 'theses',     label: 'Theses',       icon: '◧', group: 'Portal' },
  { key: 'team',       label: 'Team',         icon: '◎', group: 'Portal' },
  { key: 'pitchdeck',  label: 'Pitch Deck',   icon: '⬡', group: 'Portal' },
  { key: 'financials', label: 'Financials',   icon: '▦', group: 'Portal' },
  { key: 'presence',   label: 'Presence',     icon: '◎', group: 'Portal' },
  { key: 'investors',  label: 'Investors',    icon: '◎', group: 'Access' },
  { key: 'requests',   label: 'Requests',     icon: '◉', group: 'Access', badge: true },
  { key: 'analytics',  label: 'Analytics',    icon: '◧', group: 'Insights' },
];

export default function AdminShell({ onSignOut, pendingCount }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract current page from URL e.g. /admin/investors -> investors
  const currentPath = location.pathname.split('/').filter(Boolean);
  const activePage = currentPath[1] || 'dashboard';

  const groups = [...new Set(NAV.map(n => n.group))];

  const titles = {
    dashboard: 'Dashboard', 
    sections: 'Portal Sections',
    content: 'Hero Content', 
    portfolio: 'Portfolio Companies',
    programs: 'Programs', 
    theses: 'Investment Theses',
    team: 'Team Management', 
    pitchdeck: 'Pitch Deck',
    financials: 'Financials Manager',
    presence: 'Presence Manager',
    investors: 'Investor Access', 
    requests: 'Access Requests',
    analytics: 'Analytics',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10,
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, background: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>◈</div>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 15 }}>IA Portal</span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--gold)', background: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.2)', padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
          {groups.map(group => (
            <div key={group}>
              <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '1rem 1.25rem 0.4rem' }}>
                {group}
              </div>
              {NAV.filter(n => n.group === group).map(n => (
                <div key={n.key} onClick={() => navigate(`/admin/${n.key}`)} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '0.65rem 1.25rem', cursor: 'pointer',
                  fontSize: 13,
                  color: activePage === n.key ? 'var(--gold)' : 'var(--text2)',
                  borderLeft: `2px solid ${activePage === n.key ? 'var(--gold)' : 'transparent'}`,
                  background: activePage === n.key ? 'var(--gold-dim)' : 'transparent',
                  transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: 14, width: 20, textAlign: 'center', opacity: 0.8 }}>{n.icon}</span>
                  {n.label}
                  {n.badge && pendingCount > 0 && (
                    <span style={{ marginLeft: 'auto', background: 'var(--amber)', color: '#000', borderRadius: 20, fontSize: 10, padding: '1px 7px', fontWeight: 600 }}>
                      {pendingCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            admin@indiaaccelerator.co
          </div>
          <button onClick={() => { onSignOut(); navigate('/admin'); }} style={{ fontSize: 12, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Sign out →
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Topbar */}
        <div style={{
          height: 56, padding: '0 2rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          background: 'var(--bg)',
          position: 'sticky', top: 0, zIndex: 5,
        }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{titles[activePage] || 'Admin'}</span>
        </div>

        {/* Page content */}
        <div style={{ padding: '2rem', flex: 1 }}>
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="sections" element={<Sections />} />
            <Route path="content" element={<Content />} />
            <Route path="portfolio" element={<PortfolioManager />} />
            <Route path="programs" element={<ProgramsManager />} />
            <Route path="theses" element={<ThesesManager />} />
            <Route path="team" element={<TeamManager />} />
            <Route path="pitchdeck" element={<PitchDeckManager />} />
            <Route path="financials" element={<FinancialsManager />} />
            <Route path="presence" element={<PresenceManager />} />
            <Route path="investors" element={<Investors />} />
            <Route path="requests" element={<Requests />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
