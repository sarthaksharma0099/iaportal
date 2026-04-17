import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Dots } from '../../components/UI';

// --- COMPONENTS ---

const SectionHeader = ({ label }) => (
  <div style={{ padding: '0 80px', marginBottom: 48 }}>
    <div style={{ fontSize: 13, color: '#c9a84c', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
      {label}
    </div>
    <div style={{ width: 40, height: 2, background: '#00B4A6', marginTop: 8 }} />
  </div>
);

const PersonCard = ({ member }) => {
  const [imgError, setImgError] = useState(false);
  const showPhoto = member.photo_url && !imgError;

  return (
    <div 
      className="team-card"
      style={{
        background: '#111110', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, padding: '28px 24px', display: 'flex',
        flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        transition: 'all 0.2s ease'
      }}
    >
      {showPhoto ? (
        <img 
          src={member.photo_url}
          alt={member.name}
          onError={() => setImgError(true)}
          style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,180,166,0.25)', marginBottom: 16 }}
        />
      ) : (
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#0d2a28,#111110)', border: '1px solid rgba(0,180,166,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#00B4A6', fontWeight: 500, marginBottom: 16 }}>
          {member.initials || member.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
        </div>
      )}
      <div style={{ fontSize: 18, fontWeight: 500, color: '#ffffff', marginBottom: 5 }}>{member.name}</div>
      <div style={{ fontSize: 14, color: '#00B4A6', marginBottom: 12 }}>{member.role}</div>
      {member.bio && (
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{member.bio}</div>
      )}
      <style>{`
        .team-card:hover { border-color: rgba(0,180,166,0.35); transform: translateY(-4px); }
      `}</style>
    </div>
  );
};

const MentorCard = ({ member }) => {
  const [imgError, setImgError] = useState(false);
  const showPhoto = member.photo_url && !imgError;

  return (
    <div style={{ background: '#111110', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.2s ease' }}>
      {showPhoto ? (
        <img 
          src={member.photo_url}
          alt={member.name}
          onError={() => setImgError(true)}
          style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,180,166,0.25)', marginBottom: 12 }}
        />
      ) : (
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#0d2a28,#111110)', border: '1px solid rgba(0,180,166,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#00B4A6', fontWeight: 500, marginBottom: 12 }}>
          {member.initials || member.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
        </div>
      )}
      <div style={{ fontSize: 15, fontWeight: 500, color: '#ffffff', marginBottom: 2 }}>{member.name}</div>
      <div style={{ fontSize: 12, color: '#00B4A6' }}>{member.role}</div>
    </div>
  );
};

export default function TeamPage({ onBack }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });
      setMembers(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const founding   = members.filter(m => m.category === 'founding');
  const thesis     = members.filter(m => m.category === 'thesis');
  const functional = members.filter(m => m.category === 'functional');
  const spaces     = members.filter(m => m.category === 'spaces');
  const mentors    = members.filter(m => m.category === 'mentor');

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a08', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 100 }}>
      <Dots />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a08', color: '#ffffff', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top Bar Navigation */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'rgba(10,10,8,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#c9a84c', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          ← Back to Portal
        </button>
        <div style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)' }}>Team & Leadership</div>
        <div style={{ fontSize: 15, color: '#00B4A6' }}>India Accelerator</div>
      </nav>

      <div style={{ paddingTop: 64 }}>
        {/* Header Hero Section */}
        <section style={{ padding: '80px 80px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 32, height: 1, background: '#c9a84c' }} />
            <div style={{ fontSize: 13, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.15em' }}>OUR TEAM</div>
          </div>
          <h1 style={{ margin: 0, fontSize: 64, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#ffffff', lineHeight: 1.0 }}>
            The People Building
          </h1>
          <h1 style={{ margin: '0 0 20px 0', fontSize: 64, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: '#00B4A6', lineHeight: 1.0 }}>
            India's Largest Startup Ecosystem
          </h1>
          <p style={{ fontSize: 18, color: '#9e9b92', maxWidth: 580, lineHeight: 1.7, margin: 0 }}>
            Passionate professionals combining expertise and experience to empower startups on their journey to success.
          </p>
        </section>

        {!loading && members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#9e9b92' }}>
            <div style={{ fontSize: 48, opacity: 0.2, marginBottom: 16 }}>◎</div>
            <div style={{ fontSize: 14 }}>Team information coming soon.</div>
          </div>
        ) : (
          <>
            {founding.length > 0 && (
              <>
                <SectionHeader label="FOUNDING TEAM" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '0 80px', marginBottom: 64 }}>
                  {founding.map(m => (
                    <PersonCard key={m.id} member={m} />
                  ))}
                </div>
              </>
            )}

            {thesis.length > 0 && (
              <>
                <SectionHeader label="THESIS LEADERSHIP" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '0 80px', marginBottom: 64 }}>
                  {thesis.map(m => (
                    <PersonCard key={m.id} member={m} />
                  ))}
                </div>
              </>
            )}

            {functional.length > 0 && (
              <>
                <SectionHeader label="FUNCTIONAL LEADERSHIP" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '0 80px', marginBottom: 64 }}>
                  {functional.map(m => (
                    <PersonCard key={m.id} member={m} />
                  ))}
                </div>
              </>
            )}

            {spaces.length > 0 && (
              <>
                <SectionHeader label="IA SPACES LEADERSHIP" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '0 80px', marginBottom: 64 }}>
                  {spaces.map(m => (
                    <PersonCard key={m.id} member={m} />
                  ))}
                </div>
              </>
            )}

            {mentors.length > 0 && (
              <>
                <div style={{ padding: '0 80px', marginBottom: 8 }}>
                  <SectionHeader label="MENTOR BOARD" />
                  <div style={{ fontSize: 16, color: '#9e9b92', marginBottom: 32, marginTop: -16 }}>
                    120+ global experts guiding our portfolio companies
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, padding: '0 80px', marginBottom: 80 }}>
                  {mentors.map(m => (
                    <MentorCard key={m.id} member={m} />
                  ))}
                  <div style={{ background: 'rgba(0,180,166,0.06)', border: '1px solid rgba(0,180,166,0.2)', borderRadius: 12, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, color: '#00B4A6', fontFamily: "'Cormorant Garamond', serif" }}>+50</div>
                    <div style={{ fontSize: 13, color: '#9e9b92', marginTop: 4 }}>more experts</div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, color: '#9e9b92' }}>© 2026 India Accelerator — Private & Confidential</div>
          <div style={{ display: 'flex', gap: 32 }}>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>500+ Mentors</span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>1200+ Angels</span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>5 Continents</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
