import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { dreamRepo } from '../services/dreamRepo';
import { backupService } from '../services/backup';
import { Dream } from '../types/dream';
import BottomTabBar from '../components/BottomTabBar';
import Icon from '../components/ui/Icon';
import { useThemeContext } from '../contexts/ThemeContext';

interface TopTab {
  to: string;
  label: string;
}

const BASE_TABS: TopTab[] = [
  { to: '/home', label: '首頁' },
  { to: '/capture', label: '記錄' },
  { to: '', label: '詳情' },
  { to: '/explore', label: '探索' },
  { to: '/dreamscape', label: '圖鑑' },
];

function buildPatternLine(dreams: Dream[]): string {
  const recurringCount = dreams.filter((d) => d.isRecurring).length;
  if (recurringCount >= 2) {
    return `其中 ${recurringCount} 個帶你回到同一個夢境。`;
  }

  const tagCounts = new Map<string, number>();
  for (const dream of dreams) {
    for (const tag of dream.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }
  if (tagCounts.size > 0) {
    const sorted = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted[0];
    if (top !== undefined && top[1] >= 3) {
      return `其中 ${top[1]} 個都出現了「${top[0]}」。`;
    }
  }

  const lucidCount = dreams.filter(
    (d) => d.lucidity !== null && d.lucidity !== undefined && d.lucidity > 0,
  ).length;
  if (lucidCount >= 2) {
    return `其中 ${lucidCount} 個讓你意識到自己在做夢。`;
  }

  return '每個夢都是一個獨特的世界。';
}

interface HomeDreamRowProps {
  dream: Dream;
  onClick: () => void;
}

function HomeDreamRow({ dream, onClick }: HomeDreamRowProps): JSX.Element {
  const date = parseISO(dream.dreamDate);
  const day = format(date, 'd');
  const month = `${format(date, 'M')}月`;
  const snippet = dream.ai?.summary ?? dream.content;

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <article
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="group flex items-start gap-6 border-b border-border-subtle py-5 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-border-focus last:border-b-0"
    >
      {/* 日期欄：大數字 + 月份 */}
      <div className="w-10 flex-shrink-0 text-right pt-1">
        <span className="block font-serif text-heading font-light text-disabled tabular-nums leading-none">
          {day}
        </span>
        <span className="block font-ui text-caption text-disabled mt-1 tracking-wide">
          {month}
        </span>
      </div>

      {/* 內容 */}
      <p className="flex-1 font-serif text-body text-secondary line-clamp-2 leading-relaxed transition-colors duration-fast group-hover:text-primary">
        {snippet}
      </p>
    </article>
  );
}

export default function Home(): JSX.Element {
  const [allDreams, setAllDreams] = useState<Dream[]>([]);
  const [incompleteDreams, setIncompleteDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysSinceExport, setDaysSinceExport] = useState<number | null>(null);
  const { theme, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function loadData(): Promise<void> {
      try {
        const [all, incomplete] = await Promise.all([
          dreamRepo.listAll(),
          dreamRepo.listIncomplete(),
        ]);
        setAllDreams(all);
        setIncompleteDreams(incomplete);
      } catch {
        // 靜默處理，顯示空狀態
      } finally {
        setLoading(false);
      }
    }
    void loadData();
    setDaysSinceExport(backupService.getDaysSinceLastExport());
  }, []);

  const patternLine = useMemo(() => buildPatternLine(allDreams), [allDreams]);
  const recentDreams = allDreams.slice(0, 30);
  const showBackupReminder = daysSinceExport !== null && daysSinceExport >= 30;

  const tabs = useMemo((): TopTab[] => {
    const latestId = allDreams[0]?.id;
    return BASE_TABS.map((tab) =>
      tab.label === '詳情'
        ? { to: latestId ? `/dreams/${latestId}` : '/explore', label: '詳情' }
        : tab,
    );
  }, [allDreams]);

  /* ── 共用 icon 按鈕樣式 ───────────────────────────────── */
  const iconBtnClass =
    'flex h-10 w-10 items-center justify-center text-tertiary transition-colors duration-fast hover:text-secondary';

  const header = (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-base/98 backdrop-blur-md">

      {/* ── Mobile (< sm: 480px) ─────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 sm:hidden">
        <div className="flex flex-col leading-none">
          <span className="font-serif text-title font-light italic text-primary leading-none">
            控夢
          </span>
          <span className="font-ui text-caption tracking-ultra text-tertiary uppercase mt-1">
            Lucid Journal
          </span>
        </div>
        <div className="flex items-center">
          <button type="button" onClick={() => navigate('/explore')}
            className={iconBtnClass} aria-label="搜尋">
            <Icon name="search" size={18} strokeWidth={1.25} />
          </button>
          <button type="button" onClick={toggleTheme}
            className={iconBtnClass}
            aria-label={theme === 'dark' ? '切換為白晝模式' : '切換為夜間模式'}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} strokeWidth={1.25} />
          </button>
          <button type="button" onClick={() => navigate('/settings')}
            className={iconBtnClass} aria-label="設定">
            <Icon name="settings" size={18} strokeWidth={1.25} />
          </button>
        </div>
      </div>

      {/* ── Desktop (sm+: 480px+) ────────────────────────── */}
      <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] items-stretch px-8 md:px-10 lg:px-16">

        {/* 品牌 — 左欄 */}
        <div className="flex items-center py-5 pr-8 border-r border-border-subtle">
          <div>
            <div className="font-serif text-title font-light italic text-primary leading-none tracking-tight">
              控夢
            </div>
            <div className="font-ui text-caption tracking-ultra text-tertiary uppercase mt-1">
              Lucid Journal
            </div>
          </div>
        </div>

        {/* 導覽 — 中欄，下底線指示器 */}
        <nav aria-label="主要導覽" className="flex items-stretch">
          {tabs.map((tab, i) => {
            const isActive = location.pathname === tab.to;
            return (
              <Link
                key={i}
                to={tab.to}
                className={`relative flex items-center px-6 font-ui text-small tracking-wide transition-colors duration-fast ${
                  isActive ? 'text-primary' : 'text-tertiary hover:text-secondary'
                }`}
              >
                {tab.label}
                <span
                  className={`absolute bottom-0 left-5 right-5 h-px transition-all duration-normal ${
                    isActive ? 'bg-accent-default' : 'bg-transparent'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* 操作 — 右欄 */}
        <div className="flex items-center justify-end pl-8 border-l border-border-subtle">
          <button type="button" onClick={() => navigate('/explore')}
            className={iconBtnClass} aria-label="搜尋">
            <Icon name="search" size={16} strokeWidth={1.25} />
          </button>
          <button type="button" onClick={toggleTheme}
            className={iconBtnClass}
            aria-label={theme === 'dark' ? '切換為白晝模式' : '切換為夜間模式'}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} strokeWidth={1.25} />
          </button>
          <button type="button" onClick={() => navigate('/settings')}
            className={iconBtnClass} aria-label="設定">
            <Icon name="settings" size={16} strokeWidth={1.25} />
          </button>
        </div>
      </div>
    </header>
  );

  /* ── 載入中 ───────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-base">
        {header}
        <main className="flex flex-1 items-center justify-center pb-24">
          <p className="font-ui text-caption tracking-ultra text-tertiary uppercase">載入中</p>
        </main>
        <BottomTabBar />
      </div>
    );
  }

  /* ── 空狀態 ───────────────────────────────────────────── */
  if (allDreams.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-base">
        {header}
        <main className="flex flex-1 flex-col items-center justify-center gap-12 px-6 pb-24 text-center">
          <div>
            <p className="font-ui text-caption tracking-ultra text-tertiary uppercase mb-6">
              空白的夜晚
            </p>
            <h1 className="font-serif text-display font-light text-primary mb-4">
              還沒有夢的紀錄
            </h1>
            <p className="font-ui text-small text-tertiary">
              每一個夢都是值得留存的世界
            </p>
          </div>
          <Link
            to="/capture"
            className="font-ui text-small text-tertiary border-b border-border-default pb-1 transition-colors duration-fast hover:text-secondary hover:border-border-strong"
          >
            記下第一個夢
          </Link>
        </main>
        <BottomTabBar />
      </div>
    );
  }

  /* ── 主要畫面 ─────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen flex-col bg-base">
      {header}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="px-5 pt-10 md:max-w-3xl md:mx-auto md:px-10 lg:px-12">

          {/* 英雄區塊 — 大數字 */}
          <section className="mb-16 animate-fade-in">
            <p className="mb-8 font-ui text-caption tracking-ultra text-tertiary uppercase">
              夢境概覽
            </p>
            <div className="flex items-end gap-4 mb-4">
              <span
                className="text-hero font-serif font-light text-primary tabular-nums"
                style={{ color: 'var(--accent-default)' }}
              >
                {allDreams.length}
              </span>
              <span className="font-serif text-heading font-light text-secondary mb-2">
                則夢境
              </span>
            </div>
            <p className="font-serif text-body text-tertiary leading-relaxed max-w-sm">
              {patternLine}
            </p>
          </section>

          {/* 快速記錄 CTA */}
          <Link
            to="/capture"
            className="group mb-16 flex items-center justify-between border-t border-b border-border-subtle py-5 transition-colors duration-normal hover:border-border-default"
          >
            <div>
              <p className="font-serif text-body text-primary">記下今晚的夢</p>
              <p className="font-ui text-small text-tertiary mt-1">趁記憶還濕著</p>
            </div>
            <Icon
              name="arrowRight"
              size={16}
              strokeWidth={1.25}
              className="text-tertiary transition-colors duration-fast group-hover:text-secondary"
            />
          </Link>

          {/* 備份提醒 */}
          {showBackupReminder && (
            <div className="mb-12 flex items-center justify-between border-b border-border-subtle pb-4">
              <p className="font-ui text-small text-tertiary">已 {daysSinceExport} 天未備份</p>
              <Link
                to="/settings"
                className="font-ui text-small text-accent transition-colors duration-fast hover:text-accent-hover border-b border-accent"
              >
                前往備份
              </Link>
            </div>
          )}

          {/* 未補完夢境 */}
          {incompleteDreams.length > 0 && (
            <section className="mb-12">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-ui text-caption tracking-ultra text-tertiary uppercase">
                  未補完
                </span>
                <span className="font-ui text-caption text-disabled tabular-nums">
                  {incompleteDreams.length}
                </span>
              </div>
              <div className="border-t border-border-subtle">
                {incompleteDreams.slice(0, 3).map((dream) => (
                  <HomeDreamRow
                    key={dream.id}
                    dream={dream}
                    onClick={() => navigate(`/dreams/${dream.id}`)}
                  />
                ))}
              </div>
              {incompleteDreams.length > 3 && (
                <p className="mt-4 font-ui text-caption text-disabled">
                  還有 {incompleteDreams.length - 3} 則待補完
                </p>
              )}
            </section>
          )}

          {/* 最近的夢 */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <span className="font-ui text-caption tracking-ultra text-tertiary uppercase">
                最近的夢
              </span>
            </div>
            <div className="border-t border-border-subtle">
              {recentDreams.map((dream) => (
                <HomeDreamRow
                  key={dream.id}
                  dream={dream}
                  onClick={() => navigate(`/dreams/${dream.id}`)}
                />
              ))}
            </div>
            {allDreams.length > 30 && (
              <div className="mt-8 pt-4 text-center">
                <Link
                  to="/explore"
                  className="font-ui text-caption tracking-wide text-tertiary border-b border-border-subtle pb-1 transition-colors duration-fast hover:text-secondary hover:border-border-default"
                >
                  查看全部 {allDreams.length} 則
                </Link>
              </div>
            )}
          </section>

        </div>
      </main>
      <BottomTabBar />
    </div>
  );
}
