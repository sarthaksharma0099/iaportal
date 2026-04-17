import React, { useState } from 'react';

const DESIGN = {
  bg: '#0a0a08',
  cardBg: '#111110',
  border: 'rgba(255,255,255,0.08)',
  borderCard: 'rgba(255,255,255,0.07)',
  teal: '#00B4A6',
  gold: '#c9a84c',
  text1: '#ffffff',
  text2: '#9e9b92',
  textMuted: 'rgba(255,255,255,0.45)',
  topBarBg: 'rgba(10,10,8,0.95)'
};

const SectionHeader = ({ label, subtitle }) => (
  <div style={{ padding: '0 80px', marginBottom: 32 }}>
    <div style={{ fontSize: 13, color: DESIGN.gold, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
      {label}
    </div>
    <div style={{ width: 40, height: 2, background: DESIGN.teal, marginTop: 8 }} />
    {subtitle && (
      <div style={{ fontSize: 16, color: DESIGN.text2, marginTop: 16 }}>
        {subtitle}
      </div>
    )}
  </div>
);

const PersonCard = ({ name, role, bio, photo, initials }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: DESIGN.cardBg,
        border: `1px solid ${hovered ? 'rgba(0,180,166,0.35)' : DESIGN.borderCard}`,
        borderRadius: 16,
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'border-color 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        cursor: 'default'
      }}
    >
      <div style={{ position: 'relative', width: 88, height: 88, marginBottom: 16 }}>
        {photo ? (
          <>
            <img 
              src={photo} 
              alt={name} 
              style={{ 
                width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', 
                border: `2px solid ${hovered ? 'rgba(201,168,76,0.5)' : 'rgba(0,180,166,0.25)'}`,
                transition: 'border-color 0.2s'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                const fallback = e.target.nextElementSibling;
                if(fallback) fallback.style.display = 'flex';
              }}
            />
            <div style={{ 
              display: 'none', width: 88, height: 88, borderRadius: '50%', 
              background: 'linear-gradient(135deg,#0d2a28,#111110)', border: '1px solid rgba(0,180,166,0.25)',
              alignItems: 'center', justifyContent: 'center', fontSize: 24, color: DESIGN.teal, fontWeight: 500
            }}>
              {initials}
            </div>
          </>
        ) : (
          <div style={{ 
            width: 88, height: 88, borderRadius: '50%', 
            background: 'linear-gradient(135deg,#0d2a28,#111110)', border: '1px solid rgba(0,180,166,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: DESIGN.teal, fontWeight: 500
          }}>
            {initials}
          </div>
        )}
      </div>

      <div style={{ fontSize: 18, fontWeight: 500, color: DESIGN.text1, marginBottom: 5 }}>{name}</div>
      <div style={{ fontSize: 14, color: DESIGN.teal, marginBottom: 12 }}>{role}</div>
      <div style={{ fontSize: 14, color: DESIGN.textMuted, lineHeight: 1.6 }}>{bio}</div>
    </div>
  );
};

const MentorCard = ({ name, description, initials }) => (
  <div style={{ 
    background: DESIGN.cardBg, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, 
    padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' 
  }}>
    <div style={{ 
      width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#0d2a28,#111110)', 
      border: '1px solid rgba(0,180,166,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      fontSize: 18, color: DESIGN.teal, fontWeight: 500, marginBottom: 12 
    }}>
      {initials}
    </div>
    <div style={{ fontSize: 15, color: DESIGN.text1, fontWeight: 500, marginBottom: 4 }}>{name}</div>
    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{description}</div>
  </div>
);

export default function TeamPage({ onBack }) {
  const data = {
    founding: [
      { n: "Ashish Bhatia", p: "/images/team/Ashish.jpg", r: "CEO & Founder", i: "AB", b: "Visionary entrepreneur building India's largest startup ecosystem with 7+ years driving innovation across accelerator, fund and infrastructure verticals." },
      { n: "Mona Singh", p: "/images/team/Mona.jpg", r: "Co-Founder & Director", i: "MS", b: "Co-founder driving strategic growth and partnerships at India Accelerator with deep expertise in startup ecosystems." },
      { n: "Abhay Chawla", p: "/images/team/abhay.jpg", r: "Co-Founder & COO", i: "AC", b: "Operations leader overseeing day-to-day execution across India Accelerator's programs and portfolio companies." },
      { n: "Deepak Sharma", p: "/images/team/Deepak.jpg", r: "Co-Founder & Managing Partner", i: "DS", b: "Managing Partner focused on fund strategy, investor relations and scaling India Accelerator's financial verticals." }
    ],
    thesis: [
      { n: "Munish Bhatia", p: "/images/team/Munish.jpg", i: "MB", r: "Co-Founder, Thesis Owner — Impact", b: "Co-founder leading the Impact thesis focused on startups solving real-world social and environmental challenges." },
      { n: "Arindam Mukhopadhyay", p: "/images/team/Arindam.jpg", i: "AM", r: "Partner, Thesis Owner — Unmanned & Mobility", b: "Partner driving investments in unmanned systems, drones and next-generation mobility solutions." },
      { n: "Rakesh Saoji", i: "RS", r: "Partner, Thesis Owner", b: "Partner and thesis owner focused on identifying and nurturing high-potential startups across key sectors." },
      { n: "Vinod Abrol", i: "VA", r: "Lead Investment Advisor", b: "Seasoned investment advisor bringing decades of experience in venture capital and startup ecosystems." }
    ],
    functional: [
      { n: "Nitin Aggarwal", i: "NA", r: "Finance", b: "Finance leader managing India Accelerator's financial operations, fund accounting and compliance." },
      { n: "Saurabh Sharma", i: "SS", r: "Legal & Compliance", b: "Legal head ensuring regulatory compliance and protecting India Accelerator's interests across all verticals." },
      { n: "Maninder Bawa", p: "/images/team/Maninde.jpg", i: "MB", r: "Technology", b: "Technology leader driving digital transformation and building the tech infrastructure for IA's platforms." },
      { n: "Ranjoy Dey", i: "RD", r: "Marketing", b: "Marketing head building India Accelerator's brand presence and driving outreach across startup ecosystems." },
      { n: "Apoorva", p: "/images/team/Apoorva.jpg", i: "AP", r: "Team Member", b: "Passionate professional driving India Accelerator's mission forward." }
    ],

    spaces: [
      { n: "Tushar Mittal", i: "TM", r: "Founder, Mysoho", b: "Founder of Mysoho leading IA Spaces operations and building world-class coworking infrastructure." },
      { n: "Ashu Kapoor", i: "AK", r: "Co-Founder, Mysoho", b: "Co-founder driving Mysoho's expansion across 16+ cities with 30+ premium coworking locations." },
      { n: "Navneet Gill", i: "NG", r: "Co-Founder, Mysoho", b: "Co-founder focused on community building and operations across the IA Spaces network." },
      { n: "John Thomas", p: "/images/team/John.jpg", i: "JT", r: "Managing Partner", b: "Managing Partner overseeing IA Spaces growth strategy and key institutional partnerships." }

    ],
    mentors: [
      { n: "Lt. General Anil Chait", i: "AC", d: "Respected Indian military officer with strong leadership and strategic expertise" },
      { n: "Gen. (Dr.) Manoj Naravane", i: "MN", d: "Former Indian Army Chief, wide experience in leadership and management" },
      { n: "Jeby Philip", i: "JP", d: "Former Group Director, Structural Testing Group, VSSC" },
      { n: "Anjan Bose", i: "AB", d: "Founding Secretary General of NATHEALTH, Ex President Philips Healthcare" },
      { n: "Dr. Anant Malewar", i: "AM", d: "Robotics and embedded systems expert with deep engineering innovation insight" },
      { n: "Hari Hegde", i: "HH", d: "Founding Partner at Edhina Capital, ex-Wipro SVP and active angel investor" },
      { n: "Mukul Bagga", i: "MB", d: "MD Medicom Healthcare, Ex Novartis, Quest Diagnostics, J&J and Ranbaxy" },
      { n: "Tanvir Singh", i: "TS", d: "Founder of TrusTerra and Mooving focused on e-mobility solutions" },
      { n: "Anuj Jain", i: "AJ", d: "Seasoned investment professional specialized in global alternative investments" },
      { n: "Abhay Potdar", i: "AP", d: "Ex Senior VP Apraava Renewable Energy, 35 years in Renewables and power generation" },
      { n: "Manish Purohit", i: "MP", d: "Former ISRO scientist and Quantum expert, ex-BITS Pilani" },
      { n: "K. M. Ramakrishnan", i: "KR", d: "Rear Admiral Indian Navy, Quantum Space and Defencetech expert" },
      { n: "Dr. PV Venkitakrishnan", i: "PV", d: "Former Director ISRO Propulsion Complex with 40+ years in aerospace" }
    ]
  };

  return (
    <div style={{ minHeight: '100vh', background: DESIGN.bg, color: DESIGN.text1, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top Bar */}
      <nav style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 1000, 
        padding: '0 80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: DESIGN.topBarBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid rgba(255,255,255,0.06)`
      }}>
        <button 
          onClick={onBack} 
          style={{ background: 'none', border: 'none', color: DESIGN.gold, fontSize: 15, cursor: 'pointer', outline: 'none' }}
        >
          ← Back to Portal
        </button>
        <div style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)' }}>
          Team & Leadership
        </div>
        <div style={{ fontSize: 15, color: DESIGN.teal }}>India Accelerator</div>
      </nav>

      {/* Hero Section */}
      <header style={{ padding: '144px 80px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 32, height: 1, background: DESIGN.gold }} />
          <div style={{ fontSize: 13, color: DESIGN.gold, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>OUR TEAM</div>
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 64, fontWeight: 300, color: DESIGN.text1, lineHeight: 1.1, marginBottom: 0 }}>
          The People Building
        </h1>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 64, fontWeight: 300, fontStyle: 'italic', color: DESIGN.teal, lineHeight: 1.0, marginBottom: 20 }}>
          India's Largest Startup Ecosystem
        </h1>
        <p style={{ fontSize: 18, color: DESIGN.text2, maxWidth: 580, lineHeight: 1.7 }}>
          Passionate professionals combining expertise and experience to empower startups on their journey to success.
        </p>
      </header>

      {/* Sections */}
      <div style={{ paddingBottom: 80 }}>
        {/* Section 1 - Founding */}
        <SectionHeader label="Founding Team" />
        <div style={{ padding: '0 80px', marginBottom: 64, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {data.founding.map((p, idx) => (
            <PersonCard key={idx} name={p.n} role={p.r} bio={p.b} photo={p.p} initials={p.i} />
          ))}
        </div>

        {/* Section 2 - Thesis */}
        <SectionHeader label="Thesis Leadership" />
        <div style={{ padding: '0 80px', marginBottom: 64, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {data.thesis.map((p, idx) => (
            <PersonCard key={idx} name={p.n} role={p.r} bio={p.b} photo={p.p} initials={p.i} />
          ))}
        </div>


        {/* Section 3 - Functional */}
        <SectionHeader label="Functional Leadership" />
        <div style={{ padding: '0 80px', marginBottom: 64, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {data.functional.map((p, idx) => (
            <PersonCard key={idx} name={p.n} role={p.r} bio={p.b} photo={p.p} initials={p.i} />
          ))}
        </div>


        {/* Section 4 - IA Spaces */}
        <SectionHeader label="IA Spaces Leadership" />
        <div style={{ padding: '0 80px', marginBottom: 64, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {data.spaces.map((p, idx) => (
            <PersonCard key={idx} name={p.n} role={p.r} bio={p.b} photo={p.p} initials={p.i} />
          ))}
        </div>

        {/* Mentor Board */}
        <SectionHeader label="Mentor Board" subtitle="120+ global experts guiding our portfolio companies" />
        <div style={{ padding: '0 80px', marginBottom: 80, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {data.mentors.map((m, idx) => (
            <MentorCard key={idx} name={m.n} description={m.d} initials={m.i} />
          ))}
          <div style={{ 
            background: 'rgba(0,180,166,0.06)', border: '1px solid rgba(0,180,166,0.2)', borderRadius: 12, 
            padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' 
          }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: DESIGN.teal }}>+ 50</div>
            <div style={{ fontSize: 13, color: DESIGN.text2, marginTop: 4 }}>more experts</div>
          </div>
        </div>

        {/* Page Footer */}
        <footer style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, padding: '32px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, color: DESIGN.text2 }}>© 2026 India Accelerator — Confidential</div>
          <a href="mailto:invest@indiaaccelerator.co" style={{ fontSize: 14, color: DESIGN.gold, textDecoration: 'none' }}>
            invest@indiaaccelerator.co
          </a>
        </footer>
      </div>
    </div>
  );
}
