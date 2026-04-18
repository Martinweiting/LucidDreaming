import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dreamRepo } from '../services/dreamRepo';
import { Dream } from '../types/dream';
import TagChip from '../components/TagChip';

export default function Home(): JSX.Element {
  const [allDreams, setAllDreams] = useState<Dream[]>([]);
  const [incompleteDreams, setIncompleteDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDreams() {
      try {
        const all = await dreamRepo.listAll();
        const incomplete = await dreamRepo.listIncomplete();
        setAllDreams(all);
        setIncompleteDreams(incomplete);
      } catch (error) {
        console.error('Failed to load dreams:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDreams();
  }, []);

  const recentDreams = allDreams.slice(0, 30);
  const showIncomplete = incompleteDreams.length > 0;
  const showRecent = recentDreams.length > 0;

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4">
        <p className="text-text-secondary">載入中…</p>
      </main>
    );
  }

  if (!showIncomplete && !showRecent) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="space-y-3">
          <p className="text-caption uppercase tracking-wide text-text-tertiary">還沒有夢</p>
          <h1 className="font-serif text-heading text-text-primary">還沒有任何夢的紀錄</h1>
          <p className="text-body text-text-secondary">打開記錄開始探索你的夜晚世界</p>
        </div>
        <Link
          to="/capture"
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md bg-accent px-5 py-2 text-body font-medium text-bg-primary transition-colors duration-normal hover:bg-accent-hover active:scale-95"
        >
          + 新記錄
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="font-serif text-title font-light text-text-primary">夢境記錄</h1>
        <div className="flex gap-2">
          <Link
            to="/capture"
            className="flex min-h-touch min-w-touch items-center justify-center rounded-md border border-border-subtle bg-bg-secondary text-text-secondary transition-colors duration-normal hover:border-border-default hover:text-text-primary"
            title="新記錄"
          >
            +
          </Link>
          <Link
            to="/settings"
            className="flex min-h-touch min-w-touch items-center justify-center rounded-md border border-border-subtle bg-bg-secondary text-text-secondary transition-colors duration-normal hover:border-border-default hover:text-text-primary"
            title="設定"
          >
            ⚙
          </Link>
        </div>
      </header>

      {showIncomplete && (
        <section className="space-y-3">
          <h2 className="text-body font-semibold text-text-primary">未補完</h2>
          <div className="space-y-2">
            {incompleteDreams.slice(0, 5).map((dream) => (
              <Link
                key={dream.id}
                to={`/dreams/${dream.id}`}
                className="block rounded-lg border border-border-subtle bg-bg-secondary p-3 transition-all duration-normal hover:border-border-default hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <p className="text-small text-text-secondary">{dream.dreamDate}</p>
                    <p className="line-clamp-2 text-body text-text-primary">
                      {dream.content.slice(0, 60)}
                      {dream.content.length > 60 ? '…' : ''}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <TagChip tag="補完" variant="outline" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showRecent && (
        <section className="space-y-3 flex-1">
          <h2 className="text-body font-semibold text-text-primary">最近的夢</h2>
          <div className="space-y-2">
            {recentDreams.map((dream) => (
              <Link
                key={dream.id}
                to={`/dreams/${dream.id}`}
                className="block rounded-lg border border-border-subtle bg-bg-secondary p-3 transition-all duration-normal hover:border-border-default hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-small text-text-secondary">{dream.dreamDate}</p>
                    {dream.lucidity !== null && dream.lucidity > 0 && (
                      <span className="text-small" title={`清明度: ${dream.lucidity}`}>
                        🌙
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-body text-text-primary">
                    {dream.content.slice(0, 80)}
                    {dream.content.length > 80 ? '…' : ''}
                  </p>
                  {dream.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {dream.tags.slice(0, 3).map((tag) => (
                        <TagChip key={tag} tag={tag} variant="outline" />
                      ))}
                      {dream.tags.length > 3 && (
                        <span className="text-caption text-text-tertiary">
                          +{dream.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showRecent && (
        <footer className="flex justify-center py-4">
          <Link
            to="/explore"
            className="text-body text-accent transition-colors duration-normal hover:text-accent-hover underline"
          >
            查看全部
          </Link>
        </footer>
      )}
    </main>
  );
}
