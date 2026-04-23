import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dreamRepo } from '../services/dreamRepo';
import { backupService } from '../services/backup';
import { Dream } from '../types/dream';
import PageLayout from '../components/PageLayout';
import DreamEntry from '../components/ui/DreamEntry';
import SectionLabel from '../components/ui/SectionLabel';
import IconButton from '../components/ui/IconButton';
import { useThemeContext } from '../contexts/ThemeContext';

export default function Home(): JSX.Element {
  const [allDreams, setAllDreams] = useState<Dream[]>([]);
  const [incompleteDreams, setIncompleteDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysSinceExport, setDaysSinceExport] = useState<number | null>(null);
  const { theme, toggleTheme } = useThemeContext();
  const navigate = useNavigate();

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

  const recentDreams = allDreams.slice(0, 30);
  const showBackupReminder =
    daysSinceExport !== null && daysSinceExport >= 30;

  const rightActions = (
    <>
      <IconButton
        icon={theme === 'dark' ? 'sun' : 'moon'}
        label={theme === 'dark' ? '切換為白晝模式' : '切換為夜間模式'}
        onClick={toggleTheme}
        size="md"
      />
      <IconButton
        icon="settings"
        label="設定"
        onClick={() => navigate('/settings')}
        size="md"
      />
    </>
  );

  if (loading) {
    return (
      <PageLayout showTabBar rightActions={rightActions}>
        <div className="flex min-h-[50dvh] items-center justify-center">
          <p className="font-ui text-small text-tertiary">載入中…</p>
        </div>
      </PageLayout>
    );
  }

  if (allDreams.length === 0) {
    return (
      <PageLayout showTabBar rightActions={rightActions}>
        <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-8 px-6 text-center">
          <div className="space-y-3">
            <p className="font-ui text-caption uppercase tracking-widest text-tertiary">
              空白的夜晚
            </p>
            <h1 className="font-serif text-heading font-light text-primary">
              還沒有夢的紀錄
            </h1>
            <p className="font-ui text-body text-secondary">
              每一個夢都是值得留存的世界
            </p>
          </div>
          <Link
            to="/capture"
            className="inline-flex min-h-touch items-center justify-center rounded-md border border-border-default px-6 py-2 font-ui text-body text-primary transition-colors duration-fast hover:border-border-strong hover:bg-inset active:bg-inset"
          >
            記下第一個夢
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showTabBar rightActions={rightActions}>
      <div className="px-5 pt-6 pb-2">
        {/* 頁面標題區 */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-serif text-display font-light leading-none text-primary">
              控夢
            </h1>
            <p className="mt-1.5 font-ui text-small text-tertiary">
              共 {allDreams.length} 則夢境紀錄
            </p>
          </div>
        </div>

        {/* 備份提醒 */}
        {showBackupReminder && (
          <div className="mb-6 flex items-center justify-between border-l-2 border-border-default pl-3">
            <p className="font-ui text-small text-secondary">
              已 {daysSinceExport} 天未備份
            </p>
            <Link
              to="/settings"
              className="font-ui text-small text-accent transition-colors duration-fast hover:text-accent-hover"
            >
              前往備份
            </Link>
          </div>
        )}

        {/* 未補完的夢 */}
        {incompleteDreams.length > 0 && (
          <section className="mb-8">
            <SectionLabel className="mb-3">待補完</SectionLabel>
            <div className="divide-y divide-border-subtle">
              {incompleteDreams.slice(0, 3).map((dream) => (
                <DreamEntry
                  key={dream.id}
                  dream={dream}
                  onClick={(id) => navigate(`/dreams/${id}`)}
                  compact
                />
              ))}
            </div>
            {incompleteDreams.length > 3 && (
              <p className="mt-3 font-ui text-small text-tertiary">
                還有 {incompleteDreams.length - 3} 則待補完
              </p>
            )}
          </section>
        )}

        {/* 最近的夢 */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <SectionLabel>最近的夢</SectionLabel>
          </div>
          <div className="divide-y divide-border-subtle">
            {recentDreams.map((dream) => (
              <DreamEntry
                key={dream.id}
                dream={dream}
                onClick={(id) => navigate(`/dreams/${id}`)}
              />
            ))}
          </div>

          {allDreams.length > 30 && (
            <div className="mt-6 border-t border-border-subtle pt-4 text-center">
              <Link
                to="/explore"
                className="font-ui text-small text-tertiary transition-colors duration-fast hover:text-secondary"
              >
                查看全部 {allDreams.length} 則 →
              </Link>
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
