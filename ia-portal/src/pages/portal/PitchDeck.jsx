import React, { useState, useEffect, useCallback } from 'react';

const TEAL = '#00B4A6';
const GOLD = '#c9a84c';
const BG   = '#0a0a08';

function ImageWithFallback({ src, alt, type, initials, GOLD: gColor }) {
  const [error, setError] = useState(false);
  if (error || !src) {
    if (type === 'team') {
      return (
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#1e1e1c', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: gColor || GOLD, fontSize: 18, fontWeight: 700 }}>
          {initials}
        </div>
      );
    }
    return (
      <div style={{ width: '100%', height: '100%', background: '#1e1e1c', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
        {alt}
      </div>
    );
  }
  return (
    <img src={src} alt={alt} onError={() => setError(true)} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: type === 'team' ? '50%' : 4 }} />
  );
}

export default function PitchDeck({ onBack }) {
  const [current, setCurrent] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const totalSlides = 14;

  const next = useCallback(() => setCurrent(prev => Math.min(prev + 1, totalSlides - 1)), []);
  const prev = useCallback(() => setCurrent(prev => Math.max(prev - 1, 0)), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [next, prev]);

  const convert = (text) => {
    if (currency === 'INR') return text;
    return text
      .replace(/INR 1500 Cr(\.|\s?)\+/g, '$180M+')
      .replace(/INR 500 Cr\+/g, '$60M+')
      .replace(/INR 300 Cr\+/g, '$36M+')
      .replace(/INR 150 Cr\+/g, '$18M+')
      .replace(/INR 100 Cr/g, '$12M')
      .replace(/₹100 Cr/g, '$12M');
  };

  const handleClick = (e) => {
    const { clientX } = e;
    const { innerWidth } = window;
    if (clientX > innerWidth / 2) next();
    else prev();
  };

  const renderSlide = () => {
    const slideProps = { currency, convert, TEAL, GOLD };
    switch (current) {
      case 0:  return <Slide1 {...slideProps} />;
      case 1:  return <Slide2 {...slideProps} />;
      case 2:  return <Slide3 {...slideProps} />;
      case 3:  return <Slide4 {...slideProps} />;
      case 4:  return <Slide5 {...slideProps} />;
      case 5:  return <Slide6 {...slideProps} />;
      case 6:  return <Slide7 {...slideProps} />;
      case 7:  return <Slide8 {...slideProps} />;
      case 8:  return <Slide9 {...slideProps} />;
      case 9:  return <Slide10 {...slideProps} />;
      case 10: return <Slide11 {...slideProps} />;
      case 11: return <Slide12 {...slideProps} />;
      case 12: return <Slide13 {...slideProps} />;
      case 13: return <Slide14 {...slideProps} />;
      default: return null;
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: BG, zIndex: 1000, color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ height: 72, padding: '0 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(10,10,8,0.8)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', color: '#9e9b92', fontSize: 13, cursor: 'pointer' }}>
          ← Back to List
        </button>
        <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase', opacity: 0.8 }}>Pitch Deck</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ fontSize: 13, color: '#5c5a54', fontVariantNumeric: 'tabular-nums' }}>{current + 1} / {totalSlides}</div>
          <div style={{ display: 'flex', background: '#111', borderRadius: 8, padding: 4 }}>
            {['INR', 'USD'].map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                style={{
                  padding: '4px 12px', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: currency === c ? GOLD : 'transparent',
                  color: currency === c ? '#000' : '#5c5a54',
                  transition: 'all 0.2s'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slide Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }} onClick={handleClick}>
        <div key={current} className="fade-in" style={{ height: '100%', width: '100%', animation: 'fadeIn 0.5s ease forwards' }}>
          {renderSlide()}
        </div>

        {/* Navigation Arrows */}
        <button className="nav-btn" onClick={(e) => { e.stopPropagation(); prev(); }} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: current === 0 ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>‹</button>
        <button className="nav-btn" onClick={(e) => { e.stopPropagation(); next(); }} style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: current === totalSlides - 1 ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}>›</button>

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }} style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 4, background: i === current ? TEAL : 'rgba(255,255,255,0.2)', transition: 'all 0.3s', cursor: 'pointer' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Individual Slides ── */

const Slide1 = ({ TEAL }) => (
  <div style={{ height: '100%', padding: '0 5rem', display: 'flex', alignItems: 'center', position: 'relative' }}>
    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '60%', height: '80%', background: TEAL, borderTopLeftRadius: '100%', opacity: 0.15, filter: 'blur(80px)' }} />
    <div style={{ zIndex: 1 }}>
      <div style={{ width: 140, height: 40, marginBottom: 80 }}>
        <ImageWithFallback src="/images/ia-logo.png" alt="India Accelerator" />
      </div>
      <h1 style={{ fontSize: 86, fontWeight: 700, maxWidth: 800, lineHeight: 1.1, marginBottom: 40 }}>
        Building India's largest <span style={{ color: TEAL }}>startup ecosystem</span>
      </h1>
    </div>
  </div>
);

const Slide2 = ({ TEAL }) => (
  <div style={{ height: '100%', padding: '5rem', maxWidth: 1200, margin: '0 auto' }}>
    <div style={{ background: TEAL, color: '#000', display: 'inline-block', padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase' }}>The Market</div>
    <h2 style={{ fontSize: 48, fontWeight: 700, marginBottom: 48 }}>The Indian startup ecosystem is booming...</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 60 }}>
      {['1,85,000+', '635+', '3rd'].map((v, i) => (
        <div key={i} style={{ background: TEAL, padding: '2rem', borderRadius: 12, color: '#000' }}>
          <div style={{ fontSize: 42, fontWeight: 800 }}>{v}</div>
          <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.8 }}>{i === 0 ? 'Startups in India' : i === 1 ? 'Cities' : 'Global ranking'}</div>
        </div>
      ))}
    </div>
    <div style={{ display: 'grid', gap: 24, fontSize: 16, lineHeight: 1.6, color: '#9e9b92' }}>
      <div style={{ display: 'flex', gap: 16 }}><span style={{ color: TEAL }}>•</span> 30 years ago, the NASDAQ was dominated by oil, telecom, and industrial companies. Today, the top spots are owned by software, silicon, and platforms.</div>
      <div style={{ display: 'flex', gap: 16 }}><span style={{ color: TEAL }}>•</span> In 1990, technology made up just 6% of the S&P 500. By 2020, it crossed 30%, a 5x jump in sector weightage.</div>
      <div style={{ display: 'flex', gap: 16 }}><span style={{ color: TEAL }}>•</span> The biggest companies today are built on code, networks, and compounding data advantages. That's why startups are now a legitimate asset class.</div>
    </div>
  </div>
);

const Slide3 = ({ TEAL, convert }) => {
  const years = [
    { y: '2018', t: 'Foundation', d: 'First cohort launched, Opened flagship hub in Gurgaon' },
    { y: '2020', t: 'Early expansion', d: 'Second hub launched, iAngels network established, 50+ startups accelerated' },
    { y: '2021', t: 'Platform takes shape', d: 'Grew to 5 centres in Delhi NCR, Launched 9 sector-specific verticals' },
    { y: '2023', t: 'Scaling', d: 'Awarded Best Accelerator by GOI. Launched Finvolve. International with iAccel GBI. Thesis-led investing.' },
    { y: '2024', t: 'Flywheel', d: convert('Crossed ₹100 Cr in deployment. Closed two maiden funds. 200+ startups.') },
    { y: '2025+', t: 'Growth', d: 'Pan-India growth, Catchment area, Flywheel & Network effect in play' }
  ];
  return (
    <div style={{ height: '100%', padding: '5rem 3rem' }}>
      <div style={{ background: TEAL, color: '#000', display: 'inline-block', padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 700, marginBottom: 24 }}>Journey so far</div>
      <h2 style={{ fontSize: 42, fontWeight: 700, marginBottom: 80 }}>Seven years of building, testing, learning...and growing</h2>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '0 2rem' }}>
        <div style={{ position: 'absolute', top: 32, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        {years.map((y, i) => (
          <div key={i} style={{ width: '15%', zIndex: 1 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: TEAL, marginBottom: 16, position: 'relative', left: 'calc(50% - 6px)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, color: TEAL, fontWeight: 700, marginBottom: 8 }}>{y.y}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#fff' }}>{y.t}</div>
              <div style={{ fontSize: 11, color: '#9e9b92', lineHeight: 1.5 }}>{y.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Slide4 = ({ convert, TEAL }) => {
  const stats = [
    { v: convert('INR 500 Cr+'), l: 'Committed (Finvolve)' },
    { v: convert('INR 300 Cr+'), l: 'Invested (Finvolve)' },
    { v: '30+', l: 'Hubs across 16 cities' },
    { v: '120+', l: 'Mentor Board' },
    { v: '50+', l: 'Projects & Partnerships' },
    { v: '5', l: 'Active Funds' },
    { v: '55+', l: 'Startups Invested' }
  ];
  const logos = ['Indrajaal', 'Rohal Technologies', 'Pernia\'s Pop-Up Studio', 'Aquila Clouds', 'BU4', 'Magicroll.ai', 'Atlas AI', 'Nitro Commerce', 'Droom', 'Battwheel', 'Zulu', 'Paramount Services', 'SaleAssist', 'Recur', 'Munic', 'IG Defence', 'AquaAirX', 'Trusterra', 'Spotsense', 'Lawyered'];
  return (
    <div style={{ height: '100%', padding: '5rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 60 }}>
      <div>
        <h2 style={{ fontSize: 42, marginBottom: 48, fontWeight: 700 }}>IA by the numbers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ borderLeft: `2px solid ${TEAL}`, paddingLeft: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: TEAL }}>{s.v}</div>
              <div style={{ fontSize: 12, color: '#9e9b92', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: '#111', borderRadius: 16, padding: '2rem' }}>
        <div style={{ fontSize: 11, color: TEAL, textTransform: 'uppercase', marginBottom: 20, fontWeight: 700 }}>Class of 2025</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {logos.map(l => <span key={l} style={{ fontSize: 10, background: '#1e1e1c', padding: '4px 10px', borderRadius: 4, color: '#9e9b92' }}>{l}</span>)}
        </div>
      </div>
    </div>
  );
};

const Slide5 = ({ convert, TEAL }) => (
  <div style={{ height: '100%', padding: '5rem' }}>
    <h2 style={{ fontSize: 42, marginBottom: 60, fontWeight: 700 }}>IA Business Verticals</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: TEAL, marginBottom: 24 }}>Financial Capital <span style={{ opacity: 0.5 }}>(Finvolve)</span></div>
        <div style={{ display: 'grid', gap: 16 }}>
          {[
            { v: '5', l: 'Active Funds' },
            { v: '1200+', l: 'Investors' },
            { v: convert('INR 500 Cr+'), l: 'in commitments' },
            { v: convert('INR 300 Cr+'), l: 'Deployed' }
          ].map((s, i) => (
            <div key={i}><div style={{ fontSize: 20, fontWeight: 700 }}>{s.v}</div><div style={{ fontSize: 12, color: '#9e9b92' }}>{s.l}</div></div>
          ))}
        </div>
      </div>
      <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 40 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: TEAL, marginBottom: 24 }}>Infrastructure Capital <span style={{ opacity: 0.5 }}>(IA Spaces)</span></div>
        <div style={{ display: 'grid', gap: 16 }}>
          {[{ v: '31+', l: 'coworking hubs' }, { v: '16 cities', l: 'across India' }, { v: '500+', l: 'community startups' }].map((s, i) => (
            <div key={i}><div style={{ fontSize: 20, fontWeight: 700 }}>{s.v}</div><div style={{ fontSize: 12, color: '#9e9b92' }}>{s.l}</div></div>
          ))}
        </div>
      </div>
      <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 40 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: TEAL, marginBottom: 24 }}>Intellectual Capital <span style={{ opacity: 0.5 }}>(India Accelerator)</span></div>
        <div style={{ display: 'grid', gap: 16 }}>
          {[{ v: '250+', l: 'Startups Accelerated' }, { v: '120+', l: 'Global Mentor Network' }, { v: '50+', l: 'Corporate & Gov Partners' }].map((s, i) => (
            <div key={i}><div style={{ fontSize: 20, fontWeight: 700 }}>{s.v}</div><div style={{ fontSize: 12, color: '#9e9b92' }}>{s.l}</div></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Slide6 = ({ convert, TEAL }) => {
  const stages = ['Pre-Seed', 'Seed', 'Series A/B', 'Growth'];
  const stats = [
    { v: '5', l: 'Active funds' }, { v: '25', l: 'Investments in CY25' }, { v: '1400+', l: 'Investors' },
    { v: '40%*', l: 'IRR*' }, { v: '2', l: 'Partial Exits' }, { v: convert('INR 150 Cr+'), l: 'Capital deployed CY25' }
  ];
  return (
    <div style={{ height: '100%', padding: '5rem' }}>
      <h2 style={{ fontSize: 42, marginBottom: 60, fontWeight: 700 }}>Finvolve & Funds</h2>
      <div style={{ marginBottom: 80 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          {stages.map(s => <span key={s} style={{ fontSize: 12, color: '#9e9b92', textTransform: 'uppercase' }}>{s}</span>)}
        </div>
        <div style={{ position: 'relative', height: 40, background: '#111', borderRadius: 20, display: 'flex', alignItems: 'center', padding: '0 2rem' }}>
          <div style={{ position: 'absolute', left: '5%', right: '55%', height: 6, background: TEAL, borderRadius: 3 }} />
          <div style={{ position: 'absolute', left: '45%', right: '10%', height: 6, background: GOLD, borderRadius: 3, opacity: 0.8 }} />
          <div style={{ position: 'absolute', top: 50, left: '15%', fontSize: 11, color: TEAL }}>FAT I-II, GIFT, Brew, IAGOF-I</div>
          <div style={{ position: 'absolute', top: 50, left: '60%', fontSize: 11, color: GOLD }}>IAGOF-II/III, CAT-III</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
        {stats.map((s, i) => (
          <div key={i}><div style={{ fontSize: 28, fontWeight: 800, color: TEAL }}>{s.v}</div><div style={{ fontSize: 12, color: '#9e9b92' }}>{s.l}</div></div>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 100, fontSize: 10, color: '#5c5a54' }}>* {'>'} 18 months since date of investment</div>
    </div>
  );
};

const Slide7 = ({ TEAL }) => {
  const boxes = [
    { t: 'Defence & Aerospace', c: ['Unmanned Systems & Components', 'Command & Control Tech', 'Space Tech', 'Munitions & Hypersonics', 'Mesh Networks'], bg: '#111' },
    { t: 'Energy Independence', c: ['Renewables', 'Hydrogen Economy', 'Electric Vehicle Ecosystem', 'Industrial Efficiency', 'ESS & Energy Trading'], bg: TEAL, tc: '#000' },
    { t: 'Frontier & Strategic Tech', c: ['Intelligence Systems', 'Distributed Trust Tech', 'Quantum Computing', 'Semiconductors', 'Advanced Manufacturing'], bg: TEAL, tc: '#000' },
    { t: 'Consumption & Impact', c: ['Fintech', 'Healthtech', 'EComm / QComm / D2C', 'Platform / Marketplace', 'Circular Economy'], bg: '#111' }
  ];
  return (
    <div style={{ height: '100%', padding: '5rem' }}>
      <h2 style={{ fontSize: 42, marginBottom: 48, fontWeight: 700 }}>Intellectual Capital - Our Theses</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 20, height: 'calc(100% - 140px)' }}>
        {boxes.map((b, i) => (
          <div key={i} style={{ background: b.bg, padding: '2rem', borderRadius: 16, color: b.tc || '#fff' }}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>{b.t}</div>
            {b.c.map(line => <div key={line} style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>• {line}</div>)}
          </div>
        ))}
      </div>
    </div>
  );
};

const Slide8 = ({ TEAL }) => (
  <div style={{ height: '100%', padding: '5rem' }}>
    <h2 style={{ fontSize: 42, marginBottom: 60, fontWeight: 700 }}>Subset of portfolio</h2>
    <div style={{ marginBottom: 48 }}>
      <div style={{ fontSize: 11, color: TEAL, fontWeight: 700, marginBottom: 20, textTransform: 'uppercase' }}>Seed Companies</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {[
          { n: 'Inc42', l: '/images/logos/inc42.png' },
          { n: 'STAGE', l: '/images/logos/stage.png' },
          { n: 'Janitri', l: '/images/logos/janitri.png' },
          { n: 'Lawyered', l: '/images/logos/lawyered.png' },
          { n: 'Marcos Gaming', l: '/images/logos/marcos-gaming.png' },
          { n: 'Matter', l: '/images/logos/matter.png' },
          { n: 'Zulu', l: '/images/logos/zulu.png' },
          { n: 'IG Drones' }, { n: 'Sunfox' }, { n: 'Indrajaal' }
        ].map(n => (
          <div key={n.n} style={{ background: '#111', height: 72, padding: n.l ? 0 : '1rem', borderRadius: 8, fontSize: 13, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImageWithFallback src={n.l} alt={n.n} />
          </div>
        ))}
      </div>
    </div>
    <div>
      <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, marginBottom: 20, textTransform: 'uppercase' }}>Pre-IPO Companies</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {['InCred', 'Imarticus', 'Prabhudas Lilladher', 'CashE', 'Partex'].map(n => (
          <div key={n} style={{ background: '#1e1e1c', padding: '1.25rem', borderRadius: 8, fontSize: 13, color: GOLD, textAlign: 'center' }}>{n}</div>
        ))}
      </div>
    </div>
  </div>
);

const Slide9 = ({ TEAL }) => {
  const mentors = [
    { n: 'Lt. Gen Anil Chait', d: 'Strategic Indian military officer' },
    { n: 'Gen. Manoj Naravane', d: 'Former Indian Army Chief' },
    { n: 'Jeby Philip', d: 'Former Structural Testing, VSSC' },
    { n: 'Anjan Bose', d: 'Founding Sec Gen NATHEALTH' },
    { n: 'Dr. Anant Malewar', d: 'Robotics & embedded systems' },
    { n: 'Hari Hegde', d: 'Founding Partner, ex-Wipro SVP' },
    { n: 'Mukul Bagga', d: 'MD Medicom Healthcare' },
    { n: 'Tanvir Singh', d: 'Founder TrusTerra, e-mobility' },
    { n: 'Anuj Jain', d: 'Alternative Investments specialist' },
    { n: 'Abhay Potdar', d: 'Renewables expert, 35y exp' },
    { n: 'Manish Purohit', d: 'Former ISRO scientist, Quantum' },
    { n: 'K. M. Ramakrishnan', d: 'Rear Admiral, Navy & Defense' },
    { n: 'Dr. PV Venkitakrishnan', d: 'Former Director, ISRO complex' }
  ];
  return (
    <div style={{ height: '100%', padding: '4rem 5rem' }}>
      <h2 style={{ fontSize: 32, marginBottom: 32, fontWeight: 700 }}>Intellectual Capital - Subset of Mentor Board</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {mentors.map((m, i) => (
          <div key={i} style={{ background: '#111', padding: '1rem', borderRadius: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEAL, marginBottom: 4 }}>{m.n}</div>
            <div style={{ fontSize: 11, color: '#9e9b92', lineHeight: 1.3 }}>{m.d}</div>
          </div>
        ))}
        <div style={{ border: `1px dashed ${TEAL}`, opacity: 0.5, padding: '1rem', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>+ 50 more</div>
      </div>
    </div>
  );
};

const Slide10 = ({ TEAL }) => (
  <div style={{ height: '100%', padding: '5rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 60 }}>
    <div>
      <div style={{ background: TEAL, color: '#000', display: 'inline-block', padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 700, marginBottom: 24 }}>The Vision</div>
      <h2 style={{ fontSize: 42, marginBottom: 40, fontWeight: 700 }}>H12026 End State</h2>
      <div style={{ marginBottom: 32 }}>Total Startups: <span style={{ color: TEAL, fontSize: 24, fontWeight: 800 }}>2,07,135</span></div>
      <div style={{ width: '100%', height: 340, background: '#111', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 14 }}>
        [India Startup Density Map Visualization]
      </div>
    </div>
    <div style={{ overflowY: 'auto', paddingRight: 10 }}>
      <div style={{ fontSize: 12, color: TEAL, marginBottom: 16, fontWeight: 700 }}>Operating Cities</div>
      <div style={{ display: 'grid', gap: 6 }}>
        {['Ahmedabad', 'Ambala', 'Amritsar', 'Bangalore', 'Bhopal', 'Bhubaneswar', 'Chandigarh', 'Dehradun', 'Goa', 'Gurgaon', 'Guwahati', 'Hyderabad', 'Jaipur', 'Jalandhar', 'Kanpur', 'Kolkata', 'Ludhiana', 'Mohali', 'Mumbai', 'New Delhi', 'Noida', 'Pune', 'Surat', 'Vadodara'].map(c => <div key={c} style={{ fontSize: 12, color: '#9e9b92' }}>• {c}</div>)}
      </div>
    </div>
  </div>
);

const MemberCard = ({ name, title, photo, initials, GOLD }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
    <div style={{ width: 50, height: 50, flexShrink: 0 }}>
      <ImageWithFallback src={photo} alt={name} type="team" initials={initials} GOLD={GOLD} />
    </div>
    <div style={{ overflow: 'hidden' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{name}</div>
      <div style={{ fontSize: 11, color: '#9e9b92', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
    </div>
  </div>
);

const Slide11 = ({ TEAL, GOLD }) => {
  const teams = [
    { h: 'Founding Team', m: [
      { n: 'Ashish Bhatia', t: 'CEO & Founder', p: '/images/team/ashish-bhatia.png', i: 'AB' },
      { n: 'Mona Singh', t: 'Co-Founder & Director', p: '/images/team/mona-singh.png', i: 'MS' },
      { n: 'Abhay Chawla', t: 'Co-Founder & COO', p: '/images/team/abhay-chawla.png', i: 'AC' },
      { n: 'Deepak Sharma', t: 'Co-Founder & MP', p: '/images/team/deepak-sharma.png', i: 'DS' }
    ]},
    { h: 'Thesis Leadership', m: [
      { n: 'Munish Bhatia', t: 'Thesis Owner- Impact', p: '/images/team/munish-bhatia.png', i: 'MB' },
      { n: 'Arindam M.', t: 'Thesis Owner- Unmanned', p: '/images/team/arindam.png', i: 'AM' },
      { n: 'Rakesh Saoji', t: 'Partner', i: 'RS' },
      { n: 'Vinod Abrol', t: 'Lead Advisor', i: 'VA' }
    ]},
    { h: 'Functional', m: [
      { n: 'Nitin Aggarwal', t: 'Finance', i: 'NA' },
      { n: 'Saurabh Sharma', t: 'Legal', i: 'SS' },
      { n: 'Maninder Bawa', t: 'Technology', i: 'MB' },
      { n: 'Ranjoy Dey', t: 'Marketing', i: 'RD' }
    ]},
    { h: 'IA Spaces', m: [
      { n: 'Tushar Mittal', t: 'Founder, Mysoho', i: 'TM' },
      { n: 'Ashu Kapoor', t: 'Co-Founder', i: 'AK' },
      { n: 'Navneet Gill', t: 'Co-Founder', i: 'NG' },
      { n: 'John Thomas', t: 'Managing Partner', p: '/images/team/john-thomas.png', i: 'JT' }
    ]}
  ];
  return (
    <div style={{ height: '100%', padding: '5rem' }}>
      <h2 style={{ fontSize: 42, marginBottom: 50, fontWeight: 700 }}>IA Leadership Team</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 40 }}>
        {teams.map(t => (
          <div key={t.h}>
            <div style={{ fontSize: 15, fontWeight: 800, color: TEAL, marginBottom: 32, borderBottom: `1px solid rgba(0,180,166,0.2)`, paddingBottom: 12 }}>{t.h}</div>
            {t.m.map(n => <MemberCard key={n.n} name={n.n} title={n.t} photo={n.p} initials={n.i} GOLD={GOLD} />)}
          </div>
        ))}
      </div>
    </div>
  );
};

const Slide12 = ({ TEAL, convert, GOLD }) => (
  <div style={{ height: '100%', padding: '5rem', display: 'grid', gridTemplateColumns: '300px 1fr 300px', gap: 40, alignItems: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ background: TEAL, display: 'inline-block', padding: '4px 12px', borderRadius: 4, fontSize: 10, fontWeight: 700, color: '#000', marginBottom: 24 }}>Vision</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>250+</div>
      <div style={{ fontSize: 13, color: '#9e9b92' }}>Hi-Potential ventures</div>
    </div>
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: 32, marginBottom: 12 }}>The factory is built.</h2>
      <div style={{ color: TEAL, fontSize: 14, fontWeight: 700, marginBottom: 48 }}>The 2028 Roadmap</div>
      <div style={{ position: 'relative', width: 280, height: 280, margin: '0 auto' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 220, height: 220, opacity: 0.15, zIndex: 1 }}>
          <ImageWithFallback src="/images/ia-wheel.png" alt="IA Ecosystem" />
        </div>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 100, height: 100, background: TEAL, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#000', fontWeight: 800, zIndex: 2 }}>Finvolve</div>
        <div style={{ position: 'absolute', bottom: 20, left: 0, width: 120, height: 120, background: 'red', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 800, opacity: 0.8 }}>IA</div>
        <div style={{ position: 'absolute', bottom: 20, right: 0, width: 120, height: 120, background: GOLD, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#000', fontWeight: 800 }}>Spaces</div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 80, height: 80, background: '#0a0a08', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, textAlign: 'center', zIndex: 3 }}>Catchment<br/>Area</div>
      </div>
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: TEAL }}>{convert('INR 1500 Cr.')}+</div>
        <div style={{ fontSize: 12, color: '#9e9b92' }}>Venture funding</div>
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: TEAL }}>50+ Cities</div>
        <div style={{ fontSize: 12, color: '#9e9b92' }}>100+ Regional Hubs</div>
      </div>
    </div>
  </div>
);

const Slide13 = ({ TEAL }) => (
  <div style={{ height: '100%', padding: '5rem' }}>
    <div style={{ background: TEAL, color: '#000', display: 'inline-block', padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 700, marginBottom: 24 }}>Presence</div>
    <h2 style={{ fontSize: 42, marginBottom: 48, fontWeight: 700 }}>IA MAP - Global Market Access</h2>
    <div style={{ width: '100%', height: 400, background: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: '3rem', position: 'relative' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
        {['USA (SaaS)', 'Canada (Health)', 'Germany (AI)', 'UAE (Fintech)', 'Saudi (Energy)', 'India (HQ)', 'Japan (EV)', 'Australia (AI)'].map(loc => (
          <div key={loc} style={{ fontSize: 13, color: '#fff', borderLeft: `2px solid ${TEAL}`, paddingLeft: 12 }}>{loc}</div>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 40, right: 40, fontSize: 12, color: '#555' }}>IA's focus sectors geography-wise</div>
    </div>
  </div>
);

const Slide14 = ({ TEAL, GOLD }) => (
  <div style={{ height: '100%', padding: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ maxWidth: 600, position: 'relative' }}>
      <div style={{ position: 'absolute', left: -40, top: -40, width: 200, height: 200, background: TEAL, opacity: 0.1, borderRadius: '50%', filter: 'blur(40px)' }} />
      <h1 style={{ fontSize: 64, fontWeight: 800, marginBottom: 24, lineHeight: 1.1 }}>Whatever you're thinking, Think <span style={{ color: TEAL }}>BIGGER.</span></h1>
      <p style={{ fontSize: 24, color: GOLD, fontWeight: 300 }}>Let's Talk.</p>
    </div>
    <div style={{ background: '#111', padding: '3rem', borderRadius: 24, width: 400, border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 32 }}>India Accelerator</div>
      <div style={{ display: 'grid', gap: 24, fontSize: 14, color: '#9e9b92' }}>
        <div>
          <div style={{ color: TEAL, fontSize: 10, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Address</div>
          UG-006, MGF Metropolis Mall, MG Road, Gurgaon-122002
        </div>
        <div>
          <div style={{ color: TEAL, fontSize: 10, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Email</div>
          info@indiaaccelerator.co
        </div>
      </div>
    </div>
  </div>
);
