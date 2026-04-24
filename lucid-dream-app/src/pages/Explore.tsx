import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { subDays, format } from 'date-fns';
import { dreamRepo } from '../services/dreamRepo';
import DreamEntry from '../components/ui/DreamEntry';
import FilterPill from '../components/ui/FilterPill';
import SectionLabel from '../components/ui/SectionLabel';
import HeroTitle from '../components/ui/HeroTitle';
import Icon from '../components/ui/Icon';
import { Dream } from '../types/dream';

type FilterType = 'all' | 'analyzed' | 'notAnalyzed' | 'lucid' | 'nightmare';

const FILTER_LABELS: Record<FilterType, string> = {
  all: '全部',
  analyzed: '已分析',
  notAnalyzed: '未分析',
  lucid: '清明夢',
  nightmare: '惡夢',
};

const ITEMS_PER_PAGE = 30;

interface ChartPoint {
  day: number;
  mood: number | null;
  lucidity: number | null;
}

interface MoodChartProps {
  data: ChartPoint[];
}

function MoodChart({ data }: MoodChartProps): JSX.Element {
  const w = 680;
  const h = 180;
  const padding = { top: 10, right: 0, bottom: 26, left: 0 };
  const innerW = w - padding.left - padding.right;
  const innerH = h - padding.top - padding.bottom;

  const xOf = (i: number): number => padding.left + (i / (data.length - 1)) * innerW;
  const yMood = (m: number): number => padding.top + (1 - (m + 2) / 4) * innerH;

  const segments: Array<Array<{ x: number; y: number }>> = [];
  let current: Array<{ x: number; y: number }> = [];
  data.forEach((d, i) => {
    if (d.mood == null) {
      if (current.length) { segments.push(current); current = []; }
    } else {
      current.push({ x: xOf(i), y: yMood(d.mood) });
    }
  });
  if (current.length) segments.push(current);

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', display: 'block' }}>
        <line x1={0} x2={w} y1={yMood(0)} y2={yMood(0)} stroke="var(--border-subtle)" strokeDasharray="2 4" />

        {data.map((d, i) =>
          (d.lucidity ?? 0) > 0 ? (
            <rect
              key={`l${i}`}
              x={xOf(i) - 1.5}
              y={h - padding.bottom - ((d.lucidity ?? 0) / 10) * innerH * 0.6}
              width={3}
              height={((d.lucidity ?? 0) / 10) * innerH * 0.6}
              fill="var(--semantic-lucid)"
              opacity={0.35}
            />
          ) : null
        )}

        {segments.map((seg, si) => (
          <polyline
            key={si}
            points={seg.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="var(--accent-default)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {data.map((d, i) =>
          d.mood != null ? (
            <circle key={`m${i}`} cx={xOf(i)} cy={yMood(d.mood)} r={1.6} fill="var(--accent-default)" />
          ) : null
        )}

        {([0, 30, 60, 89] as const).map((d, idx) => (
          <text
            key={idx}
            x={xOf(d)}
            y={h - 6}
            fill="var(--text-tertiary)"
            fontSize={10}
            textAnchor={idx === 0 ? 'start' : idx === 3 ? 'end' : 'middle'}
            letterSpacing="0.08em"
          >
            {d === 0 ? '90 日前' : d === 89 ? '今日' : `-${90 - d} 日`}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function Explore(): JSX.Element {
  const navigate = useNavigate();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [tagFrequency, setTagFrequency] = useState<Record<string, number>>({});
  const [moodData, setMoodData] = useState<ChartPoint[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const endOfListRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadDreams(): Promise<void> {
      const allDreams = await dreamRepo.listAll();
      const sorted = [...allDreams].sort(
        (a, b) => new Date(b.dreamDate).getTime() - new Date(a.dreamDate).getTime(),
      );
      setDreams(sorted);

      const freq: Record<string, number> = {};
      for (const dream of allDreams) {
        for (const tag of dream.tags) {
          freq[tag] = (freq[tag] ?? 0) + 1;
        }
      }
      setTagFrequency(freq);

      const today = new Date();
      const moodByDate: Record<string, { mood: number | null; lucidity: number | null }> = {};
      for (let i = 89; i >= 0; i--) {
        const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
        moodByDate[dateStr] = { mood: null, lucidity: null };
      }
      for (const dream of allDreams) {
        if (moodByDate[dream.dreamDate] !== undefined) {
          moodByDate[dream.dreamDate] = { mood: dream.mood ?? null, lucidity: dream.lucidity ?? null };
        }
      }
      setMoodData(
        Object.entries(moodByDate).map(([, vals], i) => ({ day: i, ...vals })),
      );
    }
    void loadDreams();
  }, []);

  useEffect(() => {
    if (!endOfListRef.current) return;
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
      }
    });
    observerRef.current.observe(endOfListRef.current);
    return () => observerRef.current?.disconnect();
  }, []);

  const filteredDreams = useMemo(() => {
    let result = dreams;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.content.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q)) ||
          (d.userNotes ?? '').toLowerCase().includes(q),
      );
    }
    if (selectedTags.size > 0) {
      result = result.filter((d) => [...selectedTags].some((t) => d.tags.includes(t)));
    }
    switch (selectedFilter) {
      case 'analyzed':
        result = result.filter((d) => d.ai !== null);
        break;
      case 'notAnalyzed':
        result = result.filter((d) => d.ai === null);
        break;
      case 'lucid':
        result = result.filter((d) => d.lucidity !== null && d.lucidity > 0);
        break;
      case 'nightmare':
        result = result.filter((d) => d.isNightmare);
        break;
    }
    return result;
  }, [dreams, searchQuery, selectedTags, selectedFilter]);

  const visibleDreams = filteredDreams.slice(0, displayCount);
  const hasMore = filteredDreams.length > displayCount;

  const topTags = Object.entries(tagFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30);
  const maxFreq = Math.max(...topTags.map(([, f]) => f), 1);
  const minFreq = Math.min(...topTags.map(([, f]) => f), 1);

  const toggleTag = (tag: string): void => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
    setDisplayCount(ITEMS_PER_PAGE);
  };

  const hasMoodData = moodData.some((d) => d.mood !== null);
  const lucidCount = moodData.filter((d) => (d.lucidity ?? 0) > 0).length;
  const entryCount = moodData.filter((d) => d.mood !== null).length;

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', flexDirection: 'column', background: 'var(--bg-base)' }}>
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 96 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 32px 0' }}>

          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 56 }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-tertiary)',
                fontSize: 12.5, letterSpacing: '0.08em',
                padding: 0,
              }}
            >
              <Icon name="arrowLeft" size={14} /> 返回
            </button>
            <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
              Explore
            </span>
          </header>

          <HeroTitle
            eyebrow="探索"
            title="翻開夢的地層"
            subtitle="搜尋、交叉篩選、觀察情緒的潮汐。看見自己記不住的模式。"
          />

          {/* 搜尋欄 */}
          <div style={{ position: 'relative', marginBottom: 36 }}>
            <span style={{
              position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)', display: 'flex', pointerEvents: 'none',
            }}>
              <Icon name="search" size={16} />
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="搜尋夢境內容、標籤、筆記⋯"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setDisplayCount(ITEMS_PER_PAGE); }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${searchFocused ? 'var(--accent-default)' : 'var(--border-default)'}`,
                padding: '14px 32px 14px 28px',
                fontFamily: 'var(--font-serif, serif)',
                fontSize: 16,
                color: 'var(--text-primary)',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 180ms',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setDisplayCount(ITEMS_PER_PAGE); }}
                style={{
                  position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-tertiary)', fontSize: 12, letterSpacing: '0.04em',
                  padding: '4px 8px',
                }}
              >
                清除
              </button>
            )}
          </div>

          {/* 篩選 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginBottom: 56 }}>
            {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
              <FilterPill
                key={f}
                label={FILTER_LABELS[f]}
                active={selectedFilter === f}
                onClick={() => { setSelectedFilter(f); setDisplayCount(ITEMS_PER_PAGE); }}
              />
            ))}
          </div>

          {/* 心象潮汐 */}
          {hasMoodData && (
            <section style={{ marginBottom: 64 }}>
              <SectionLabel
                right={
                  <span style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-tertiary)' }}>
                    近 90 日 · 情緒與清明度
                  </span>
                }
              >
                心象潮汐
              </SectionLabel>

              <MoodChart data={moodData} />

              <div style={{ display: 'flex', gap: 24, marginTop: 20, fontSize: 11.5, color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 18, height: 1.5, background: 'var(--accent-default)', display: 'inline-block' }} /> 情緒
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 10, background: 'var(--semantic-lucid)', opacity: 0.5, display: 'inline-block' }} /> 清明度
                </span>
                <span style={{ marginLeft: 'auto' }}>
                  {entryCount} 個夜晚 · {lucidCount} 個清明
                </span>
              </div>
            </section>
          )}

          {/* 標籤雲 */}
          {topTags.length > 0 && (
            <section style={{ marginBottom: 64 }}>
              <SectionLabel>反覆出現的符號</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 18px', lineHeight: 1.8 }}>
                {topTags.map(([tag, freq]) => {
                  const scale = minFreq === maxFreq ? 0.5 : (freq - minFreq) / (maxFreq - minFreq);
                  const fontSize = 13 + scale * 14;
                  const isSelected = selectedTags.has(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      style={{
                        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                        fontFamily: 'var(--font-serif, serif)',
                        fontSize,
                        fontWeight: scale > 0.7 ? 400 : 300,
                        color: isSelected
                          ? 'var(--accent-default)'
                          : scale > 0.5 ? 'var(--text-primary)' : 'var(--text-secondary)',
                        letterSpacing: '0.02em',
                        transition: 'all 180ms',
                        textDecoration: isSelected ? 'underline' : 'none',
                        textUnderlineOffset: '4px',
                        textDecorationThickness: '1px',
                      }}
                    >
                      {tag}
                      <sup style={{ marginLeft: 3, fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 400, fontFamily: 'var(--font-ui, system-ui)' }}>
                        {freq}
                      </sup>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* 夢境列表 */}
          <section>
            <SectionLabel
              right={
                <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>
                  {searchQuery || selectedTags.size > 0 || selectedFilter !== 'all'
                    ? `找到 ${filteredDreams.length} 則`
                    : `共 ${dreams.length} 則`}
                </span>
              }
            >
              夢境列表
            </SectionLabel>

            {visibleDreams.length === 0 ? (
              <p style={{ padding: '32px 0', textAlign: 'center', fontFamily: 'var(--font-ui, system-ui)', fontSize: 13, color: 'var(--text-tertiary)' }}>
                沒有符合條件的夢境
              </p>
            ) : (
              <div>
                {visibleDreams.map((dream) => (
                  <DreamEntry
                    key={dream.id}
                    dream={dream}
                    onClick={(id) => navigate(`/dreams/${id}`)}
                  />
                ))}
              </div>
            )}

            <div ref={endOfListRef} style={{ textAlign: 'center', marginTop: 32 }}>
              {hasMore && (
                <button
                  type="button"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-tertiary)',
                    fontSize: 11.5, letterSpacing: '0.18em', textTransform: 'uppercase',
                    padding: '8px 16px',
                  }}
                >
                  載入更早的夢 ⌄
                </button>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
