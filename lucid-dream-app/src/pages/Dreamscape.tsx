import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import { DREAM_ART, DreamArtKey } from '../components/ui/DreamArt';

interface DreamCardData {
  id: string;
  title: string;
  sub: string;
  count: number;
  mood: string;
  art: DreamArtKey;
  color: string;
}

interface CardLayout {
  x: string;
  y: number;
  rot: number;
  z: number;
  w: number;
}

const DREAM_CARDS: DreamCardData[] = [
  { id: 'flight',   title: '飛行',     sub: 'FLIGHT',    count: 7,  mood: '+1.4', art: 'flight',   color: 'var(--accent-default)' },
  { id: 'falling',  title: '墜落',     sub: 'FALLING',   count: 5,  mood: '-1.2', art: 'falling',  color: 'var(--semantic-warning)' },
  { id: 'water',    title: '水',       sub: 'WATER',     count: 11, mood: '+0.3', art: 'water',    color: 'var(--semantic-info)' },
  { id: 'chase',    title: '追逐',     sub: 'CHASE',     count: 4,  mood: '-1.6', art: 'chase',    color: 'var(--semantic-nightmare)' },
  { id: 'maze',     title: '迷宮',     sub: 'LABYRINTH', count: 8,  mood: '-0.4', art: 'maze',     color: 'var(--text-primary)' },
  { id: 'oldhouse', title: '老房子',   sub: 'OLD HOUSE', count: 9,  mood: '+0.6', art: 'oldhouse', color: 'var(--accent-muted)' },
  { id: 'moons',    title: '兩個月亮', sub: 'TWO MOONS', count: 3,  mood: '+1.8', art: 'moons',    color: 'var(--accent-default)' },
  { id: 'mirror',   title: '鏡子',     sub: 'MIRROR',    count: 6,  mood: '-0.2', art: 'mirror',   color: 'var(--text-primary)' },
  { id: 'animal',   title: '無影之獸', sub: 'SHADOWLESS', count: 4, mood: '0.0',  art: 'animal',   color: 'var(--text-primary)' },
  { id: 'family',   title: '家人',     sub: 'KIN',       count: 7,  mood: '-0.8', art: 'family',   color: 'var(--semantic-info)' },
  { id: 'book',     title: '書',       sub: 'BOOK',      count: 5,  mood: '+1.0', art: 'book',     color: 'var(--accent-default)' },
  { id: 'light',    title: '光 / 門',  sub: 'DOORWAY',   count: 3,  mood: '+2.0', art: 'light',    color: 'var(--accent-default)' },
];

const LAYOUTS: CardLayout[] = [
  { x: '6%',  y: 60,   rot: -8, z: 3, w: 220 },
  { x: '22%', y: 320,  rot: 6,  z: 5, w: 240 },
  { x: '41%', y: 30,   rot: -3, z: 4, w: 260 },
  { x: '62%', y: 260,  rot: 9,  z: 6, w: 230 },
  { x: '78%', y: 80,   rot: -6, z: 3, w: 220 },
  { x: '4%',  y: 640,  rot: 5,  z: 4, w: 240 },
  { x: '25%', y: 720,  rot: -4, z: 5, w: 230 },
  { x: '48%', y: 600,  rot: 7,  z: 4, w: 250 },
  { x: '70%', y: 690,  rot: -9, z: 6, w: 220 },
  { x: '12%', y: 1050, rot: 4,  z: 4, w: 240 },
  { x: '40%', y: 1000, rot: -7, z: 5, w: 260 },
  { x: '66%', y: 1080, rot: 3,  z: 3, w: 230 },
];

interface DreamCardProps {
  card: DreamCardData;
  layout: CardLayout;
  isHovered: boolean;
  dim: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function DreamCard({ card, layout, isHovered, dim, onMouseEnter, onMouseLeave }: DreamCardProps): JSX.Element {
  return (
    <article
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'absolute',
        left: layout.x,
        top: layout.y,
        width: layout.w,
        transform: `rotate(${layout.rot}deg)${isHovered ? ' scale(1.04) translateY(-8px)' : ''}`,
        transformOrigin: 'center',
        zIndex: isHovered ? 20 : layout.z,
        background: 'var(--bg-raised)',
        borderRadius: 2,
        boxShadow: isHovered
          ? '0 24px 60px -12px rgba(47,42,36,0.35), 0 8px 20px -4px rgba(47,42,36,0.2)'
          : '0 8px 24px -6px rgba(47,42,36,0.18), 0 2px 6px -2px rgba(47,42,36,0.1)',
        transition: 'transform 260ms cubic-bezier(0.2,0,0,1), box-shadow 260ms, opacity 260ms',
        opacity: dim ? 0.35 : 1,
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: '100%', aspectRatio: '280/360', background: 'var(--bg-surface)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          {DREAM_ART[card.art]}
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.15), transparent 70%)',
          pointerEvents: 'none',
        }} />
      </div>
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--text-tertiary)' }}>{card.sub}</span>
          <span style={{ fontSize: 10, letterSpacing: '0.08em', color: card.color, fontFamily: 'var(--font-ui, system-ui)' }}>
            {card.mood}
          </span>
        </div>
        <h3 style={{
          fontFamily: 'var(--font-serif, serif)', fontSize: 20, fontWeight: 400,
          margin: 0, marginBottom: 6, color: 'var(--text-primary)', letterSpacing: '0.02em',
        }}>
          {card.title}
        </h3>
        <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)', margin: 0, letterSpacing: '0.04em' }}>
          {card.count} 次出現 · 近 90 日
        </p>
      </div>
    </article>
  );
}

export default function Dreamscape(): JSX.Element {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', flexDirection: 'column', background: 'var(--bg-base)' }}>
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 96 }}>
        <div style={{ position: 'relative', padding: '40px 0 160px', overflow: 'hidden' }}>

          {/* 頂部 nav */}
          <header style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 32px', marginBottom: 40,
            maxWidth: 1400, margin: '0 auto 40px',
          }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-tertiary)', fontSize: 12.5, letterSpacing: '0.08em', padding: 0,
              }}
            >
              <Icon name="arrowLeft" size={14} /> 返回
            </button>
            <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
              Dreamscape · 夢境圖鑑
            </span>
          </header>

          {/* 超大背景字 */}
          <div style={{
            position: 'absolute', top: 100, left: 0, right: 0,
            textAlign: 'center', pointerEvents: 'none', zIndex: 1,
          }}>
            <h1 style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: 'clamp(100px, 18vw, 260px)',
              fontWeight: 300,
              letterSpacing: '-0.04em',
              lineHeight: 0.88,
              margin: 0,
              color: 'var(--text-primary)',
              opacity: 0.08,
              whiteSpace: 'nowrap',
            }}>
              常見的夢
            </h1>
          </div>

          {/* 副標 */}
          <div style={{
            position: 'relative', zIndex: 2,
            maxWidth: 620, margin: '0 auto', padding: '60px 32px 40px',
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: 'var(--font-ui, system-ui)',
              fontSize: 11.5, letterSpacing: '0.24em', textTransform: 'uppercase',
              color: 'var(--accent-default)', margin: 0, marginBottom: 20,
            }}>
              ARCHETYPES · 十二個母題
            </p>
            <p style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: 18, lineHeight: 1.7, color: 'var(--text-secondary)',
              margin: 0, fontStyle: 'italic',
            }}>
              多數人會在一生中反覆夢見這些景象。<br />
              懸浮於你記憶之上 — 點擊一張，看自己的版本。
            </p>
          </div>

          {/* 散落的卡片 */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: 1400,
            margin: '0 auto',
            height: 1400,
            zIndex: 2,
          }}>
            {DREAM_CARDS.map((card, i) => (
              <DreamCard
                key={card.id}
                card={card}
                layout={LAYOUTS[i] as CardLayout}
                isHovered={hovered === card.id}
                dim={hovered !== null && hovered !== card.id}
                onMouseEnter={() => setHovered(card.id)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
          </div>

          {/* 底部 footnote */}
          <div style={{
            position: 'relative', zIndex: 2,
            textAlign: 'center', marginTop: 80, padding: '0 32px',
          }}>
            <p style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: 14.5, fontStyle: 'italic',
              color: 'var(--text-tertiary)', maxWidth: 480, margin: '0 auto',
            }}>
              若你發現自己最近常夢見同一張卡上的景象，<br />
              也許那個母題正在靠近你。
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
