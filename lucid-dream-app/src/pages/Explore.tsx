import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { subDays, format } from 'date-fns';
import {
  Line,
  Bar,
  XAxis,
  YAxis,
  ComposedChart,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { dreamRepo } from '../services/dreamRepo';
import { Dream } from '../types/dream';

type FilterType = 'all' | 'analyzed' | 'notAnalyzed' | 'lucid' | 'nightmare';

interface ExploreState {
  dreams: Dream[];
  searchQuery: string;
  selectedTags: Set<string>;
  selectedFilter: FilterType;
  displayedDreams: Dream[];
  isLoadingMore: boolean;
  hasMore: boolean;
}

const ITEMS_PER_PAGE = 30;

export default function Explore(): JSX.Element {
  const [state, setState] = useState<ExploreState>({
    dreams: [],
    searchQuery: '',
    selectedTags: new Set(),
    selectedFilter: 'all',
    displayedDreams: [],
    isLoadingMore: false,
    hasMore: true,
  });

  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const observerRef = useRef<IntersectionObserver>();
  const endOfListRef = useRef<HTMLDivElement>(null);
  const [tagFrequency, setTagFrequency] = useState<Record<string, number>>({});
  const [moodData, setMoodData] = useState<
    Array<{ date: string; mood: number | null; lucidity: number | null }>
  >([]);

  // Load dreams on mount
  useEffect(() => {
    async function loadDreams() {
      const allDreams = await dreamRepo.listAll();
      setState((prev) => ({
        ...prev,
        dreams: allDreams.sort(
          (a, b) => new Date(b.dreamDate).getTime() - new Date(a.dreamDate).getTime()
        ),
      }));

      // Calculate tag frequency
      const freq: Record<string, number> = {};
      allDreams.forEach((dream) => {
        dream.tags.forEach((tag) => {
          freq[tag] = (freq[tag] || 0) + 1;
        });
      });
      setTagFrequency(freq);

      // Generate 90-day mood data
      const today = new Date();
      const moodByDate: Record<string, { mood: number | null; lucidity: number | null }> = {};

      for (let i = 89; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        moodByDate[dateStr] = { mood: null, lucidity: null };
      }

      allDreams.forEach((dream) => {
        const entry = moodByDate[dream.dreamDate];
        if (entry) {
          entry.mood = dream.mood;
          entry.lucidity = dream.lucidity;
        }
      });

      const chartData = Object.entries(moodByDate).map(([date, { mood, lucidity }]) => ({
        date,
        mood,
        lucidity,
      }));
      setMoodData(chartData);
    }

    loadDreams();
  }, []);

  // Filter and search dreams
  useEffect(() => {
    let filtered = state.dreams;

    // Apply search filter
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (dream) =>
          dream.content.toLowerCase().includes(query) ||
          dream.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          dream.userNotes?.toLowerCase().includes(query)
      );
    }

    // Apply tag filter
    if (state.selectedTags.size > 0) {
      filtered = filtered.filter((dream) =>
        [...state.selectedTags].some((tag) => dream.tags.includes(tag))
      );
    }

    // Apply type filter
    switch (state.selectedFilter) {
      case 'analyzed':
        filtered = filtered.filter((dream) => dream.ai !== null);
        break;
      case 'notAnalyzed':
        filtered = filtered.filter((dream) => dream.ai === null);
        break;
      case 'lucid':
        filtered = filtered.filter((dream) => dream.lucidity !== null && dream.lucidity > 0);
        break;
      case 'nightmare':
        filtered = filtered.filter((dream) => dream.isNightmare);
        break;
    }

    setState((prev) => ({
      ...prev,
      displayedDreams: filtered.slice(0, displayCount),
      hasMore: filtered.length > displayCount,
    }));
  }, [state.dreams, state.searchQuery, state.selectedTags, state.selectedFilter, displayCount]);

  // Search debounce
  const handleSearch = (query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
    setDisplayCount(ITEMS_PER_PAGE);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  // Tag toggle
  const toggleTag = (tag: string) => {
    setState((prev) => {
      const newTags = new Set(prev.selectedTags);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return { ...prev, selectedTags: newTags };
    });
    setDisplayCount(ITEMS_PER_PAGE);
  };

  // Filter change
  const handleFilterChange = (filter: FilterType) => {
    setState((prev) => ({ ...prev, selectedFilter: filter }));
    setDisplayCount(ITEMS_PER_PAGE);
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!endOfListRef.current) return;

    observerRef.current = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting && state.hasMore && !state.isLoadingMore) {
        setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
      }
    });

    observerRef.current.observe(endOfListRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [state.hasMore, state.isLoadingMore]);

  // Get top 30 tags
  const topTags = Object.entries(tagFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30);

  const maxFreq = Math.max(...topTags.map(([, freq]) => freq), 1);
  const minFreq = Math.min(...topTags.map(([, freq]) => freq), 1);

  return (
    <main className="min-h-screen bg-bg-primary px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-serif text-display text-text-primary">探索夢境</h1>
          <p className="text-body text-text-secondary">搜尋、篩選、發現您的夢境模式</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="搜尋夢境內容…"
            value={state.searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-surface px-4 py-3 text-text-primary placeholder-text-muted transition-colors focus:border-border-default focus:outline-none focus:ring-2 focus:ring-accent-default focus:ring-opacity-20"
          />
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
            🔍
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'analyzed', 'notAnalyzed', 'lucid', 'nightmare'] as FilterType[]).map(
            (filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`rounded-full px-4 py-2 text-small transition-all duration-normal ${
                  state.selectedFilter === filter
                    ? 'bg-accent-default text-accent-contrast'
                    : 'border border-border-subtle bg-surface text-text-secondary hover:border-border-default'
                }`}
              >
                {filter === 'all' && '全部'}
                {filter === 'analyzed' && '已分析'}
                {filter === 'notAnalyzed' && '未分析'}
                {filter === 'lucid' && '清明夢'}
                {filter === 'nightmare' && '惡夢'}
              </button>
            )
          )}
        </div>

        {/* 90-Day Mood Chart */}
        {moodData.length > 0 && (
          <div className="space-y-3 rounded-lg border border-border-subtle bg-surface p-6">
            <h2 className="font-serif text-title text-text-primary">90 天情緒趨勢</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={moodData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#A9A498' }}
                    tickFormatter={(date) => format(new Date(date), 'MM/dd')}
                    interval={Math.floor(moodData.length / 6)}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[-2, 2]}
                    tick={{ fontSize: 12, fill: '#A9A498' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 10]}
                    tick={{ fontSize: 12, fill: '#A9A498' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#11151F',
                      border: '1px solid #262C3D',
                      borderRadius: '6px',
                    }}
                    labelStyle={{ color: '#E8E3D5' }}
                  />
                  <Bar yAxisId="right" dataKey="lucidity" fill="#C49A5E" opacity={0.3} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="mood"
                    stroke="#C49A5E"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="text-caption text-text-tertiary">
              情緒變化（左軸）與清明度（右軸柱狀）
            </p>
          </div>
        )}

        {/* Tag Cloud */}
        {topTags.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-serif text-title text-text-primary">標籤雲</h2>
            <div className="flex flex-wrap gap-3">
              {topTags.map(([tag, freq]) => {
                const scale = minFreq === maxFreq ? 1 : (freq - minFreq) / (maxFreq - minFreq);
                const fontSize = 0.8 + scale * 0.7; // 0.8x to 1.5x
                const isSelected = state.selectedTags.has(tag);

                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{ fontSize: `${fontSize}rem` }}
                    className={`transition-all duration-normal ${
                      isSelected
                        ? 'bg-accent-default text-accent-contrast'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dream List */}
        <div className="space-y-4">
          <h2 className="font-serif text-title text-text-primary">
            夢境列表 ({state.displayedDreams.length})
          </h2>

          {state.displayedDreams.length === 0 ? (
            <div className="rounded-lg border border-border-subtle bg-surface p-8 text-center">
              <p className="text-body text-text-secondary">沒有符合條件的夢境</p>
            </div>
          ) : (
            <div className="space-y-3">
              {state.displayedDreams.map((dream) => (
                <Link
                  key={dream.id}
                  to={`/dreams/${dream.id}`}
                  className="block rounded-lg border border-border-subtle bg-surface p-4 transition-all duration-normal hover:border-border-default hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-body text-text-primary">
                        {format(new Date(dream.dreamDate), 'yyyy 年 M 月 d 日')}
                      </h3>
                      {dream.ai && (
                        <span className="text-caption text-text-tertiary">已分析</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {dream.isNightmare && (
                        <span className="rounded-full bg-danger bg-opacity-20 px-2 py-1 text-caption text-danger">
                          惡夢
                        </span>
                      )}
                      {dream.lucidity !== null && dream.lucidity > 0 && (
                        <span className="rounded-full bg-success bg-opacity-20 px-2 py-1 text-caption text-success">
                          清明度 {dream.lucidity}/10
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mb-3 line-clamp-2 text-body text-text-secondary">
                    {dream.content}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {dream.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border-subtle bg-bg-primary px-2.5 py-1 text-caption text-text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                    {dream.tags.length > 3 && (
                      <span className="text-caption text-text-tertiary">
                        +{dream.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {dream.mood !== null && (
                    <div className="mt-2 text-caption text-text-tertiary">
                      情緒：{dream.mood > 0 ? '😊' : dream.mood < 0 ? '😟' : '😐'}
                    </div>
                  )}
                </Link>
              ))}

              {/* Infinite scroll trigger */}
              <div ref={endOfListRef} className="pt-4">
                {state.hasMore && (
                  <div className="text-center">
                    <p className="text-caption text-text-tertiary">載入更多…</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
