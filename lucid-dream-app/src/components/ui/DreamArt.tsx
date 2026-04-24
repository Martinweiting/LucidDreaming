export type DreamArtKey =
  | 'flight' | 'falling' | 'water' | 'chase' | 'maze' | 'oldhouse'
  | 'moons' | 'mirror' | 'animal' | 'family' | 'book' | 'light';

const flight = (
  <svg viewBox="0 0 280 360" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#D8CEBB" stopOpacity="0.3"/>
        <stop offset="1" stopColor="#EFE9DE" stopOpacity="0"/>
      </linearGradient>
    </defs>
    <rect width="280" height="360" fill="url(#sky1)"/>
    <path d="M20 110 Q 60 100 110 108 T 210 102" stroke="var(--text-tertiary)" strokeWidth="0.8" fill="none" opacity="0.5"/>
    <path d="M40 170 Q 100 160 160 168 T 260 162" stroke="var(--text-tertiary)" strokeWidth="0.8" fill="none" opacity="0.4"/>
    <g transform="translate(140 180) rotate(-15)">
      <ellipse cx="0" cy="0" rx="6" ry="10" fill="none" stroke="var(--text-primary)" strokeWidth="1.3"/>
      <circle cx="0" cy="-14" r="5" fill="none" stroke="var(--text-primary)" strokeWidth="1.3"/>
      <line x1="-6" y1="-4" x2="-30" y2="-10" stroke="var(--text-primary)" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="6" y1="-4" x2="30" y2="-10" stroke="var(--text-primary)" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="-3" y1="10" x2="-10" y2="28" stroke="var(--text-primary)" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="3" y1="10" x2="10" y2="28" stroke="var(--text-primary)" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M-36 -6 Q -50 0 -60 10" stroke="var(--accent-default)" strokeWidth="0.8" fill="none" opacity="0.6"/>
      <path d="M36 -6 Q 50 0 60 10" stroke="var(--accent-default)" strokeWidth="0.8" fill="none" opacity="0.6"/>
    </g>
    <path d="M0 300 L 30 300 L 35 285 L 50 285 L 55 275 L 80 275 L 82 290 L 110 290 L 115 280 L 140 280 L 145 295 L 180 295 L 185 285 L 220 285 L 225 298 L 280 298 L 280 360 L 0 360 Z"
      fill="var(--text-primary)" opacity="0.12"/>
  </svg>
);

const falling = (
  <svg viewBox="0 0 280 360" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="280" height="80" fill="var(--text-primary)" opacity="0.05"/>
    {[60, 90, 140, 180, 220, 240].map((x, i) => (
      <line key={i} x1={x} y1={0} x2={x + (i%2 ? -10 : 10)} y2={360}
        stroke="var(--text-tertiary)" strokeWidth="0.6" opacity="0.3"/>
    ))}
    <g transform="translate(140 160) rotate(180)">
      <ellipse cx="0" cy="0" rx="6" ry="11" fill="none" stroke="var(--text-primary)" strokeWidth="1.3"/>
      <circle cx="0" cy="-15" r="5" fill="none" stroke="var(--text-primary)" strokeWidth="1.3"/>
      <line x1="-6" y1="-2" x2="-18" y2="6" stroke="var(--text-primary)" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="6" y1="-2" x2="22" y2="-2" stroke="var(--text-primary)" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="-3" y1="11" x2="-12" y2="26" stroke="var(--text-primary)" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="3" y1="11" x2="8" y2="30" stroke="var(--text-primary)" strokeWidth="1.3" strokeLinecap="round"/>
    </g>
    <path d="M130 100 Q 125 140 122 180" stroke="var(--accent-default)" strokeWidth="0.7" fill="none" opacity="0.5"/>
    <path d="M155 95 Q 158 140 160 180" stroke="var(--accent-default)" strokeWidth="0.7" fill="none" opacity="0.5"/>
    <rect x="0" y="300" width="280" height="60" fill="var(--text-primary)" opacity="0.15"/>
  </svg>
);

const water = (
  <svg viewBox="0 0 280 360" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="160" width="280" height="200" fill="var(--semantic-info)" opacity="0.08"/>
    {[180, 205, 235, 265, 295, 325].map((y, i) => (
      <path key={i}
        d={`M0 ${y} Q ${70} ${y - 3} ${140} ${y} T ${280} ${y}`}
        stroke="var(--semantic-info)" strokeWidth="0.9" fill="none" opacity={0.55 - i*0.06}/>
    ))}
    <circle cx="200" cy="90" r="28" fill="var(--accent-subtle)" opacity="0.9"/>
    <circle cx="200" cy="90" r="28" fill="none" stroke="var(--accent-default)" strokeWidth="0.8" opacity="0.5"/>
    <ellipse cx="200" cy="220" rx="26" ry="4" fill="var(--accent-default)" opacity="0.3"/>
    <ellipse cx="200" cy="240" rx="20" ry="2" fill="var(--accent-default)" opacity="0.2"/>
    <ellipse cx="200" cy="260" rx="14" ry="1.5" fill="var(--accent-default)" opacity="0.15"/>
    <path d="M60 170 Q 80 165 100 170 Q 120 175 140 170" stroke="var(--text-primary)" strokeWidth="1.2" fill="none"/>
    <circle cx="82" cy="166" r="3" fill="var(--text-primary)" opacity="0.6"/>
  </svg>
);

const chase = (
  <svg viewBox="0 0 280 360" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 60 L 140 160 L 280 60" stroke="var(--text-tertiary)" strokeWidth="0.8" fill="none" opacity="0.4"/>
    <path d="M0 300 L 140 200 L 280 300" stroke="var(--text-tertiary)" strokeWidth="0.8" fill="none" opacity="0.4"/>
    <line x1="0" y1="60" x2="0" y2="300" stroke="var(--text-tertiary)" strokeWidth="0.8" opacity="0.3"/>
    <line x1="280" y1="60" x2="280" y2="300" stroke="var(--text-tertiary)" strokeWidth="0.8" opacity="0.3"/>
    {[1, 2, 3, 4, 5].map(i => (
      <line key={i} x1={0} y1={300 - i*20} x2={280} y2={300 - i*20}
        stroke="var(--text-tertiary)" strokeWidth="0.4" opacity={0.15 + i*0.04} strokeDasharray="2 4"/>
    ))}
    <ellipse cx="140" cy="175" rx="18" ry="22" fill="var(--text-primary)" opacity="0.7"/>
    <circle cx="140" cy="150" r="8" fill="var(--text-primary)" opacity="0.7"/>
    <ellipse cx="60" cy="280" rx="14" ry="20" fill="none" stroke="var(--text-primary)" strokeWidth="1.3"/>
    <circle cx="60" cy="255" r="8" fill="none" stroke="var(--text-primary)" strokeWidth="1.3"/>
    <line x1="48" y1="280" x2="30" y2="270" stroke="var(--text-primary)" strokeWidth="1.3"/>
    <line x1="72" y1="280" x2="88" y2="275" stroke="var(--text-primary)" strokeWidth="1.3"/>
    {[30, 50, 70, 90].map((y, i) => (
      <line key={i} x1={0} y1={y + 200} x2={20 + i*3} y2={y + 200}
        stroke="var(--accent-default)" strokeWidth="0.8" opacity="0.5"/>
    ))}
  </svg>
);

const maze = (
  <svg viewBox="0 0 280 360" xmlns="http://www.w3.org/2000/svg">
    {[0, 1, 2, 3, 4].map(i => {
      const s = i * 28;
      return (
        <rect key={i} x={40 + s*0.7} y={40 + s} width={200 - s*1.4} height={280 - s*2}
          fill="none" stroke="var(--text-primary)" strokeWidth={1.2 - i*0.15}
          opacity={0.9 - i*0.15} rx={2}/>
      );
    })}
    <ellipse cx="140" cy="195" rx="3" ry="5" fill="var(--text-primary)" opacity="0.6"/>
    <circle cx="140" cy="188" r="2" fill="var(--text-primary)" opacity="0.6"/>
    <line x1="40" y1="320" x2="240" y2="320" stroke="var(--text-tertiary)" strokeWidth="0.5" opacity="0.4"/>
    <line x1="52" y1="340" x2="228" y2="340" stroke="var(--text-tertiary)" strokeWidth="0.5" opacity="0.3"/>
  </svg>
);

const oldhouse = (
  <svg viewBox="0 0 280 360" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="280" height="200" fill="var(--accent-subtle)" opacity="0.4"/>
    <circle cx="220" cy="60" r="16" fill="var(--accent-default)" opacity="0.4"/>
    <path d="M60 320 L 60 180 L 140 110 L 220 180 L 220 320 Z"
      fill="var(--text-primary)" opacity="0.08"
      stroke="var(--text-primary)" strokeWidth="1.4"/>
    <line x1="55" y1="184" x2="225" y2="184" stroke="var(--text-primary)" strokeWidth="1" opacity="0.6"/>
    <rect x="125" y="250" width="30" height="70" fill="var(--text-primary)" opacity="0.4"
      stroke="var(--text-primary)" strokeWidth="1"/>
    <circle cx="150" cy="285" r="1.2" fill="var(--text-primary)"/>
    <rect x="80" y="210" width="24" height="28" fill="var(--accent-default)" opacity="0.5"
      stroke="var(--text-primary)" strokeWidth="1"/>
    <line x1="92" y1="210" x2="92" y2="238" stroke="var(--text-primary)" strokeWidth="0.6"/>
    <line x1="80" y1="224" x2="104" y2="224" stroke="var(--text-primary)" strokeWidth="0.6"/>
    <rect x="176" y="210" width="24" height="28" fill="none" stroke="var(--text-primary)" strokeWidth="1" opacity="0.6"/>
    <line x1="188" y1="210" x2="188" y2="238" stroke="var(--text-primary)" strokeWidth="0.5" opacity="0.6"/>
    <line x1="176" y1="224" x2="200" y2="224" stroke="var(--text-primary)" strokeWidth="0.5" opacity="0.6"/>
    <line x1="30" y1="320" x2="30" y2="260" stroke="var(--text-primary)" strokeWidth="1.2"/>
    <path d="M30 260 Q 22 250 18 240 M30 260 Q 38 252 42 244 M30 272 Q 22 268 16 262" stroke="var(--text-primary)" strokeWidth="0.9" fill="none"/>
  </svg>
);

const moons = (
  <svg viewBox="0 0 280 360" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="360" fill="var(--text-primary)" opacity="0.04"/>
    <circle cx="100" cy="140" r="58" fill="var(--accent-subtle)" opacity="0.9"/>
    <circle cx="100" cy="140" r="58" fill="none" stroke="var(--accent-default)" strokeWidth="0.8" opacity="0.7"/>
    <circle cx="90" cy="128" r="8" fill="var(--accent-muted)" opacity="0.5"/>
    <circle cx="115" cy="145" r="5" fill="var(--accent-muted)" opacity="0.4"/>
    <circle cx="85" cy="155" r="3" fill="var(--accent-muted)" opacity="0.35"/>
    <circle cx="205" cy="230" r="32" fill="var(--accent-subtle)" opacity="0.5"/>
    <circle cx="205" cy="230" r="32" fill="none" stroke="var(--accent-default)" strokeWidth="0.6" opacity="0.5" strokeDasharray="2 3"/>
    {([[40,60],[250,50],[30,200],[260,150],[160,70],[220,90],[50,280],[240,310],[140,300]] as [number,number][]).map(([x,y],i) => (
      <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.2 : 0.7} fill="var(--text-primary)" opacity="0.5"/>
    ))}
  </svg>
);

const mirror = (
  <svg viewBox="0 0 280 360" xmlns="http://www.w3.org/2000/svg">
    <rect x="70" y="50" width="140" height="240" rx="70"
      fill="var(--bg-surface)" opacity="0.7"
      stroke="var(--text-primary)" strokeWidth="1.5"/>
    <rect x="78" y="58" width="124" height="224" rx="62"
      fill="var(--accent-subtle)" opacity="0.3"
      stroke="var(--accent-default)" strokeWidth="0.5"/>
    <ellipse cx="140" cy="180" rx="28" ry="40" fill="var(--text-primary)" opacity="0.2"/>
    <ellipse cx="140" cy="130" rx="18" ry="22" fill="var(--text-primary)" opacity="0.25"/>
    <path d="M95 85 Q 105 80 118 88" stroke="var(--text-primary)" strokeWidth="0.8" fill="none" opacity="0.5"/>
    <line x1="120" y1="290" x2="160" y2="290" stroke="var(--text-primary)" strokeWidth="1.2"/>
    <line x1="115" y1="295" x2="165" y2="295" stroke="var(--text-primary)" strokeWidth="1.2"/>
    <path d="M100 90 L 130 160 L 115 200 L 145 260" stroke="var(--text-primary)" strokeWidth="0.6" fill="none" opacity="0.6"/>
  </svg>
);

const animal = (
  <svg viewBox="0 0 280 360" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="260" x2="280" y2="260" stroke="var(--text-primary)" strokeWidth="0.8" opacity="0.4"/>
    <g transform="translate(140 220)">
      <ellipse cx="0" cy="10" rx="38" ry="16" fill="var(--text-primary)" opacity="0.85"/>
      <circle cx="36" cy="-4" r="14" fill="var(--text-primary)" opacity="0.85"/>
      <path d="M28 -14 L 26 -22 L 34 -18 Z" fill="var(--text-primary)" opacity="0.85"/>
      <path d="M42 -14 L 46 -22 L 48 -14 Z" fill="var(--text-primary)" opacity="0.85"/>
      <path d="M-38 6 Q -56 -6 -58 -18" stroke="var(--text-primary)" strokeWidth="5" fill="none" opacity="0.85" strokeLinecap="round"/>
      <rect x="-26" y="22" width="4" height="16" fill="var(--text-primary)" opacity="0.85"/>
      <rect x="18" y="22" width="4" height="16" fill="var(--text-primary)" opacity="0.85"/>
      <circle cx="32" cy="-6" r="1.3" fill="var(--accent-default)"/>
      <circle cx="40" cy="-6" r="1.3" fill="var(--accent-default)"/>
    </g>
    <ellipse cx="140" cy="260" rx="42" ry="3" fill="none" stroke="var(--text-tertiary)"
      strokeWidth="0.5" strokeDasharray="1 2" opacity="0.5"/>
    <rect x="30" y="140" width="40" height="100" fill="none" stroke="var(--text-tertiary)" strokeWidth="0.6" opacity="0.4"/>
  </svg>
);

const family = (
  <svg viewBox="0 0 280 360" xmlns="http://www.w3.org/2000/svg">
    <rect x="50" y="220" width="180" height="90" fill="var(--text-primary)" opacity="0.1"
      stroke="var(--text-primary)" strokeWidth="1.1"/>
    <line x1="50" y1="240" x2="230" y2="240" stroke="var(--text-primary)" strokeWidth="0.6" opacity="0.6"/>
    <rect x="60" y="250" width="70" height="50" fill="none" stroke="var(--text-primary)" strokeWidth="0.8" opacity="0.6"/>
    <rect x="150" y="250" width="70" height="50" fill="none" stroke="var(--text-primary)" strokeWidth="0.8" opacity="0.6"/>
    <circle cx="95" cy="275" r="1.5" fill="var(--text-primary)" opacity="0.7"/>
    <circle cx="185" cy="275" r="1.5" fill="var(--text-primary)" opacity="0.7"/>
    <rect x="90" y="70" width="100" height="130" fill="var(--accent-subtle)" opacity="0.3"
      stroke="var(--text-primary)" strokeWidth="0.6" strokeDasharray="3 3"/>
    <text x="140" y="138" textAnchor="middle" fontSize="10" fill="var(--text-tertiary)"
      fontFamily="serif" fontStyle="italic" opacity="0.7">〔鏡子不在〕</text>
    <ellipse cx="140" cy="195" rx="22" ry="8" fill="var(--text-primary)" opacity="0.5"/>
    <ellipse cx="140" cy="170" rx="14" ry="18" fill="var(--text-primary)" opacity="0.5"/>
    <circle cx="140" cy="148" r="10" fill="var(--text-primary)" opacity="0.55"/>
    <circle cx="175" cy="130" r="1.5" fill="var(--text-tertiary)" opacity="0.7"/>
    <circle cx="182" cy="124" r="1" fill="var(--text-tertiary)" opacity="0.6"/>
    <circle cx="187" cy="120" r="0.7" fill="var(--text-tertiary)" opacity="0.5"/>
  </svg>
);

const book = (
  <svg viewBox="0 0 280 360" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 120 L 140 90 L 240 120 L 240 300 L 140 270 L 40 300 Z"
      fill="var(--bg-raised)" stroke="var(--text-primary)" strokeWidth="1.3"/>
    <line x1="140" y1="90" x2="140" y2="270" stroke="var(--text-primary)" strokeWidth="1"/>
    {[150, 165, 180, 195, 210, 225].map((y, i) => (
      <line key={`l${i}`} x1={60} y1={y} x2={125 - (i%2)*10} y2={y}
        stroke="var(--text-primary)" strokeWidth="0.5" opacity="0.5"/>
    ))}
    <text x="180" y="160" fontFamily="serif" fontSize="13" fontStyle="italic"
      fill="var(--text-primary)" opacity="0.8">你的房間</text>
    {[180, 195, 210].map((y, i) => (
      <line key={`r${i}`} x1={160} y1={y} x2={220 - i*8} y2={y}
        stroke="var(--text-primary)" strokeWidth="0.4" opacity="0.3"/>
    ))}
    <ellipse cx="140" cy="200" rx="60" ry="8" fill="var(--accent-default)" opacity="0.08"/>
  </svg>
);

const light = (
  <svg viewBox="0 0 280 360" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="360" fill="var(--text-primary)" opacity="0.05"/>
    <rect x="100" y="80" width="80" height="220" rx="2"
      fill="var(--accent-default)" opacity="0.2"
      stroke="var(--text-primary)" strokeWidth="1.3"/>
    <rect x="112" y="92" width="56" height="196" rx="1"
      fill="var(--accent-default)" opacity="0.55"/>
    <rect x="118" y="98" width="44" height="184" rx="1"
      fill="var(--accent-default)" opacity="0.8"/>
    <path d="M140 300 L 40 360 L 240 360 Z" fill="var(--accent-default)" opacity="0.15"/>
    <ellipse cx="140" cy="240" rx="10" ry="28" fill="var(--text-primary)" opacity="0.85"/>
    <circle cx="140" cy="205" r="8" fill="var(--text-primary)" opacity="0.85"/>
  </svg>
);

export const DREAM_ART: Record<DreamArtKey, JSX.Element> = {
  flight, falling, water, chase, maze, oldhouse,
  moons, mirror, animal, family, book, light,
};
