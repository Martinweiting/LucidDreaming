import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { subDays, format } from 'date-fns';
import {
  Line,
  Bar,
  XAxis,
  YAxis,
  ComposedChart,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { dreamRepo } from '../services/dreamRepo';
import PageLayout from '../components/PageLayout';
import DreamEntry from '../components/ui/DreamEntry';
import FilterPill from '../components/ui/FilterPill';
import SectionLabel from '../components/ui/SectionLabel';
import IconButton from '../components/ui/IconButton';
import { Dream } from '../types/dream';

type FilterType = 'all' | 'analyzed' | 'notAnalyzed' | 'lucid' | 'nightmare';

const FILTER_LABELS: Record<FilterType, string> = {
  all: '全部',
  analyzed: '已分析',
  notAnalyzed: '未分析',
  lucid: '清明夢',
  nightmare: '夢魘',
};

const ITEMS_PER_PAGE = 30;

export default function Explore(): JSX.Element {
  const navigate = useNavigate();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [tagFrequency, setTagFrequency] = useState<Record<string, number>>({});
  const [showSearch, setShowSearch] = useState(false);
  const [moodData, setMoodData] = useState<
    Array<{ date: string; mood: number | null; lucidity: number | null }>
  >([]);

  const endOfListRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 載入資料
  useEffect(() => {
    async function loadDreams(): Promise<void> {
      const allDreams = await dreamRepo.listAll();
      const sorted = [...allDreams].sort(
        (a, b) => new Date(b.dreamDate).getTime() - new Date(a.dreamDate).getTime(),
      );
      setDreams(sorted);

      // 標籤頻率
      const freq: Record<string, number> = {};
      for (const dream of allDreams) {
        for (const tag of dream.tags) {
          freq[tag] = (freq[tag] ?? 0) + 1;
        }
      }
      setTagFrequency(freq);

      // 90 天情緒圖表資料
      const today = new Date();
      const moodByDate: Record<string, { mood: number | null; lucidity: number | null }> = {};
      for (let i = 89; i >= 0; i--) {
        const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
        moodByDate[dateStr] = { mood: null, lucidity: null };
      }
      for (const dream of allDreams) {
        if (moodByDate[dream.dreamDate]) {
          moodByDate[dream.dreamDate] = { mood: dream.mood, lucidity: dream.lucidity };
        }
      }
      setMoodData(
        Object.entries(moodByDate).map(([date, vals]) => ({ date, ...vals })),
      );
    }

    void loadDreams();
  }, []);

  // 無限捲動（只在掛載時設定一次，callback 用 functional update 避免 stale closure）
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

  // 搜尋顯示後自動 focus
  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
    }
  }, [showSearch]);

  // 過濾邏輯（純計算，不是 hook）
  const filteredDreams = (() => {
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
      result = result.filter((d) =>
        [...selectedTags].some((t) => d.tags.includes(t)),
      );
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
  })();

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

  const rightActions = (
    <IconButton
      icon="search"
      label="搜尋"
      onClick={() => setShowSearch((v) => !v)}
      active={showSearch || searchQuery.length > 0}
      size="md"
    />
  );

  return (
    <PageLayout title="探索" showTabBar rightActions={rightActions}>
      <div className="px-5 pt-4 pb-2 space-y-7">
        {/* 搜尋列 */}
        {showSearch && (
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="搜尋夢境內容、標籤…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDisplayCount(ITEMS_PER_PAGE);
              }}
              className="w-full border-b border-border-default bg-transparent pb-2 font-ui text-body text-primary placeholder-text-disabled outline-none focus:border-border-focus"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDisplayCount(ITEMS_PER_PAGE);
                }}
                className="absolute right-0 top-0 font-ui text-small text-tertiary hover:text-secondary"
              >
                清除
              </button>
            )}
          </div>
        )}

        {/* 篩選器 */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(FILTER_LABELS) as FilterType[]).map((filter) => (
            <FilterPill
              key={filter}
              label={FILTER_LABELS[filter]}
              active={selectedFilter === filter}
              onClick={() => {
                setSelectedFilter(filter);
                setDisplayCount(ITEMS_PER_PAGE);
              }}
            />
          ))}
        </div>

        {/* 90 天趨勢圖 */}
        {moodData.some((d) => d.mood !== null) && (
          <section>
            <SectionLabel className="mb-4">90 天情緒趨勢</SectionLabel>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={moodData} margin={{ top: 0, right: 0, bottom: 0, left: -28 }}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'var(--text-disabled)' }}
                    tickFormatter={(d: string) => format(new Date(d), 'MM/dd')}
                    interval={Math.floor(moodData.length / 5)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[-2, 2]}
                    tick={{ fontSize: 10, fill: 'var(--text-disabled)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 10]}
                    tick={{ fontSize: 10, fill: 'var(--text-disabled)' }}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-raised)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'var(--text-tertiary)' }}
                    itemStyle={{ color: 'var(--text-secondary)' }}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="lucidity"
                    fill="var(--accent-default)"
                    opacity={0.2}
                    radius={[2, 2, 0, 0]}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="mood"
                    stroke="var(--accent-default)"
                    strokeWidth={1.5}
                    dot={false}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1 font-ui text-caption text-disabled">
              情緒（折線）· 清明度（柱狀）
            </p>
          </section>
        )}

        {/* 標籤雲 */}
        {topTags.length > 0 && (
          <section>
            <SectionLabel className="mb-3">標籤</SectionLabel>
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {topTags.map(([tag, freq]) => {
                const scale =
                  minFreq === maxFreq ? 0.5 : (freq - minFreq) / (maxFreq - minFreq);
                const em = 0.75 + scale * 0.65;
                const isSelected = selectedTags.has(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{ fontSize: `${em}rem` }}
                    className={`font-ui leading-relaxed transition-colors duration-fast ${
                      isSelected
                        ? 'text-accent'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    {tag}
                    {freq > 1 && (
                      <sup className="text-disabled" style={{ fontSize: '0.6em' }}>
                        {freq}
                      </sup>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 夢境列表 */}
        <section>
          <div className="mb-1 flex items-center justify-between">
            <SectionLabel>
              {searchQuery || selectedTags.size > 0 || selectedFilter !== 'all'
                ? `找到 ${filteredDreams.length} 則`
                : `共 ${dreams.length} 則`}
            </SectionLabel>
          </div>

          {visibleDreams.length === 0 ? (
            <p className="py-8 text-center font-ui text-small text-tertiary">
              沒有符合條件的夢境
            </p>
          ) : (
            <div className="divide-y divide-border-subtle">
              {visibleDreams.map((dream) => (
                <DreamEntry
                  key={dream.id}
                  dream={dream}
                  onClick={(dreamId) => navigate(`/dreams/${dreamId}`)}
                />
              ))}
            </div>
          )}

          {/* 無限捲動觸發點 */}
          <div ref={endOfListRef} className="pt-4">
            {hasMore && (
              <p className="text-center font-ui text-caption text-disabled">載入更多…</p>
            )}
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
