import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dreamRepo } from '../services/dreamRepo';
import { backupService } from '../services/backup';
import { checkAndMarkDailyOpen } from '../services/dailySession';
import { Dream } from '../types/dream';
import BottomTabBar from '../components/BottomTabBar';
import Icon from '../components/ui/Icon';
import IconButton from '../components/ui/IconButton';
import HeroTitle from '../components/ui/HeroTitle';
import SectionLabel from '../components/ui/SectionLabel';
import DreamEntry from '../components/ui/DreamEntry';
import { useThemeContext } from '../contexts/ThemeContext';

function buildPatternLine(dreams: Dream[]): string {
  const recurringCount = dreams.filter((d) => d.isRecurring).length;
  if (recurringCount >= 2) {
    return `其中 ${recurringCount} 個帶你回到同一個房間。`;
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

export default function Home(): JSX.Element {
  const [allDreams, setAllDreams] = useState<Dream[]>([]);
  const [incompleteDreams, setIncompleteDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysSinceExport, setDaysSinceExport] = useState<number | null>(null);
  const { theme, toggleTheme } = useThemeContext();
  const navigate = useNavigate();

  useEffect(() => {
    const session = checkAndMarkDailyOpen();
    if (session === 'first') {
      navigate('/capture?morning=1', { replace: true });
      return;
    }

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
  }, [navigate]);

  const patternLine = useMemo(() => buildPatternLine(allDreams), [allDreams]);
  const recentDreams = allDreams.slice(0, 10);
  const showBackupReminder = daysSinceExport !== null && daysSinceExport >= 30;

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100dvh', flexDirection: 'column', background: 'var(--bg-base)' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
            載入中
          </p>
        </div>
        <BottomTabBar />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', flexDirection: 'column', background: 'var(--bg-base)' }}>
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 96 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 32px 0' }}>

          {/* 頂部 nav：品牌 + icon 按鈕 */}
          <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 64,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{
                fontFamily: 'var(--font-serif, serif)',
                fontSize: 17,
                fontWeight: 300,
                letterSpacing: '0.08em',
                color: 'var(--text-primary)',
              }}>
                控夢
              </span>
              <span style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
              }}>
                Lucid Journal
              </span>
            </div>
            <nav style={{ display: 'flex', gap: 4 }}>
              <IconButton icon="search" label="探索" onClick={() => navigate('/explore')} />
              <IconButton icon="flask" label="清明實驗室" onClick={() => navigate('/lab')} />
              <IconButton
                icon={theme === 'dark' ? 'sun' : 'moon'}
                label={theme === 'dark' ? '切換為白晝模式' : '切換為夜間模式'}
                onClick={toggleTheme}
              />
              <IconButton icon="settings" label="設定" onClick={() => navigate('/settings')} />
            </nav>
          </header>

          {/* Hero */}
          {allDreams.length === 0 ? (
            <HeroTitle
              eyebrow="今夜"
              title="開始記錄你的第一個夢"
              subtitle="每一個夢都是值得留存的世界。趁記憶還濕著。"
            />
          ) : (
            <HeroTitle
              eyebrow="今夜"
              title={
                <>
                  你已記錄{' '}
                  <em style={{ fontStyle: 'italic', color: 'var(--accent-default)' }}>{allDreams.length}</em>
                  {' '}個夢，<br />
                  {patternLine}
                </>
              }
              subtitle="繼續書寫。當模式浮現，我們會為你指出來。"
            />
          )}

          {/* 「記下今晚的夢」邀請條 */}
          <Link
            to="/capture"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '22px 24px',
              marginBottom: 48,
              background: 'var(--bg-raised)',
              borderLeft: '2px solid var(--accent-default)',
              borderRadius: 4,
              color: 'var(--text-primary)',
              textDecoration: 'none',
              transition: 'all 200ms cubic-bezier(0.2,0,0,1)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                'color-mix(in srgb, var(--accent-default) 8%, var(--bg-raised))';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-raised)';
            }}
          >
            <div>
              <p style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 17, margin: 0, marginBottom: 2, fontWeight: 400 }}>
                記下今晚的夢
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', margin: 0, letterSpacing: '0.04em' }}>
                趁記憶還濕著
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent-default)' }}>
              <Icon name="feather" size={18} />
              <Icon name="arrowRight" size={16} />
            </div>
          </Link>

          {/* 未補完 */}
          {incompleteDreams.length > 0 && (
            <section style={{ marginBottom: 56 }}>
              <SectionLabel
                right={
                  <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>
                    {incompleteDreams.length} 個待補
                  </span>
                }
              >
                未補完
              </SectionLabel>
              <div>
                {incompleteDreams.slice(0, 3).map((dream) => (
                  <DreamEntry
                    key={dream.id}
                    dream={dream}
                    compact
                    onClick={(id) => navigate(`/dreams/${id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 最近的夢 */}
          {recentDreams.length > 0 && (
            <section style={{ marginBottom: 48 }}>
              <SectionLabel>最近的夢</SectionLabel>
              <div>
                {recentDreams.map((dream) => (
                  <DreamEntry
                    key={dream.id}
                    dream={dream}
                    onClick={(id) => navigate(`/dreams/${id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 翻開全部夢境 */}
          {allDreams.length > 10 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
              <Link
                to="/explore"
                style={{
                  fontFamily: 'var(--font-ui, system-ui)',
                  fontSize: 12,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 2px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                翻開全部夢境 <Icon name="arrowRight" size={12} />
              </Link>
            </div>
          )}

          {/* 備份提醒 */}
          {showBackupReminder && (
            <div style={{
              paddingTop: 24,
              borderTop: '1px dashed var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}>
              <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', margin: 0 }}>
                距上次備份已{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{daysSinceExport}</span> 天。
              </p>
              <Link
                to="/settings"
                style={{ fontSize: 12.5, color: 'var(--accent-default)', textDecoration: 'none', letterSpacing: '0.04em' }}
              >
                前往備份 →
              </Link>
            </div>
          )}

        </div>
      </main>
      <BottomTabBar />
    </div>
  );
}
