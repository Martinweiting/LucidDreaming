import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { dreamRepo } from '../services/dreamRepo';
import { Dream, DreamUpdate } from '../types/dream';
import { useAutoSave } from '../hooks/useAutoSave';
import { analyzeDream } from '../services/ai';
import ManualAnalysisModal from '../components/ManualAnalysisModal';
import {
  MissingApiKeyError,
  InvalidApiKeyError,
  RateLimitError,
  AnalysisError,
} from '../types/ai';
import { findSimilarDreams } from '../services/similarity';
import TagChip from '../components/TagChip';
import DreamEntry from '../components/ui/DreamEntry';
import SectionLabel from '../components/ui/SectionLabel';
import IconButton from '../components/ui/IconButton';
import Icon from '../components/ui/Icon';

// ── 小元件 ──

const MOOD_COLORS: Record<string, string> = {
  '-2': '#6b3a3a',
  '-1': '#8a5b4a',
   '0': '#a89684',
   '1': '#c4a87a',
   '2': '#e0c46c',
};

function MoodSwatch({ value }: { value: number }): JSX.Element {
  const color = MOOD_COLORS[String(value)] ?? '#a89684';
  return (
    <span style={{
      width: 14, height: 14, borderRadius: 999,
      background: color,
      boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 20%, transparent)`,
      display: 'inline-block',
      flexShrink: 0,
    }} />
  );
}

function MiniBar({ value, max, bars = false }: { value: number; max: number; bars?: boolean }): JSX.Element {
  if (bars) {
    return (
      <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
        {Array.from({ length: max }).map((_, i) => (
          <span key={i} style={{
            width: 4, height: 6 + i * 2,
            background: i < value ? 'var(--accent-default)' : 'var(--border-default)',
            opacity: i < value ? 1 : 0.4,
            borderRadius: 1,
            display: 'block',
          }} />
        ))}
      </div>
    );
  }
  return (
    <div style={{ width: 64, height: 2, background: 'var(--border-subtle)', borderRadius: 1, position: 'relative', flexShrink: 0 }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${(value / max) * 100}%`,
        background: 'var(--accent-default)',
        borderRadius: 1,
      }} />
    </div>
  );
}

function MetaRow({ label, value, swatch }: { label: string; value: React.ReactNode; swatch?: React.ReactNode }): JSX.Element {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontFamily: 'var(--font-ui, system-ui)', fontSize: 11,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--text-tertiary)', margin: 0, marginBottom: 8,
      }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {swatch}
        <span style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 15, color: 'var(--text-primary)' }}>
          {value}
        </span>
      </div>
    </div>
  );
}

// ── 主元件 ──

export default function DreamDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dream, setDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [similarDreams, setSimilarDreams] = useState<{ dream: Dream; similarity: number }[]>([]);

  const editStateRef = useRef<Partial<Dream>>({});

  useEffect(() => {
    async function loadDream(): Promise<void> {
      if (!id) return;
      try {
        const d = await dreamRepo.get(id);
        setDream(d ?? null);
        editStateRef.current = d ? { ...d } : {};
        if (d) {
          const allDreams = await dreamRepo.listAll();
          setSimilarDreams(findSimilarDreams(d, allDreams, 3, 0.2));
        }
      } catch { /* 靜默處理 */ } finally {
        setLoading(false);
      }
    }
    void loadDream();
  }, [id]);

  const { savedAt } = useAutoSave({
    value: editStateRef.current,
    onSave: async () => {
      if (!dream || !id) return;
      const updates: DreamUpdate = {};
      for (const [key, value] of Object.entries(editStateRef.current)) {
        if (key !== 'id' && key !== 'createdAt' && value !== dream[key as keyof Dream]) {
          (updates as Record<string, unknown>)[key] = value;
        }
      }
      if (Object.keys(updates).length > 0) {
        await dreamRepo.update(id, updates);
        setDream({ ...dream, ...editStateRef.current });
      }
    },
    debounceDelay: 800,
  });

  const handleDelete = async (): Promise<void> => {
    if (deleteConfirmText !== '刪除' || !id) return;
    try {
      await dreamRepo.delete(id);
      navigate('/home');
    } catch { /* 靜默處理 */ }
  };

  const handleAddTag = (): void => {
    const tag = newTag.trim();
    if (!tag) return;
    if (!editStateRef.current.tags?.includes(tag)) {
      editStateRef.current = { ...editStateRef.current, tags: [...(editStateRef.current.tags ?? []), tag] };
      setDream(dream ? { ...dream, tags: editStateRef.current.tags! } : null);
    }
    setNewTag('');
    setShowAddTag(false);
  };

  const handleRemoveTag = (tag: string): void => {
    editStateRef.current = { ...editStateRef.current, tags: (editStateRef.current.tags ?? []).filter((t) => t !== tag) };
    setDream(dream ? { ...dream, tags: editStateRef.current.tags! } : null);
  };

  const handleRunAnalysis = async (): Promise<void> => {
    if (!dream || !id || !dream.content.trim()) {
      setAnalysisError('請先輸入夢境內容');
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await analyzeDream(dream.content);
      const updatedDream = { ...dream, ai: result };
      editStateRef.current = updatedDream;
      setDream(updatedDream);
      await dreamRepo.update(id, { ai: result });
    } catch (error) {
      if (error instanceof MissingApiKeyError) setAnalysisError('missing-api-key');
      else if (error instanceof InvalidApiKeyError) setAnalysisError('invalid-api-key');
      else if (error instanceof RateLimitError) setAnalysisError('rate-limit');
      else if (error instanceof AnalysisError) setAnalysisError((error as Error).message);
      else setAnalysisError('分析失敗，請稍後重試');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100dvh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
          載入中…
        </p>
      </div>
    );
  }

  if (!dream) {
    return (
      <div style={{ display: 'flex', minHeight: '100dvh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--bg-base)', padding: '0 24px' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--text-secondary)' }}>找不到夢境紀錄</p>
        <button type="button" onClick={() => navigate('/home')} style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--accent-default)', background: 'none', border: 'none', cursor: 'pointer' }}>
          返回首頁
        </button>
      </div>
    );
  }

  const date = parseISO(dream.dreamDate);
  const weekday = format(date, 'EEEE', { locale: zhTW }).toUpperCase();
  const writtenAt = format(parseISO(dream.createdAt), 'HH:mm');
  const dateDisplay = format(date, 'M月d日', { locale: zhTW });
  const moodLabel: Record<number, string> = { '-2': '極暗', '-1': '陰', '0': '中性', '1': '亮', '2': '極亮' };

  const firstChar = dream.content.trim().charAt(0);
  const restContent = dream.content.trim().substring(1);

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-base)' }}>
      <main style={{ maxWidth: 920, margin: '0 auto', padding: '32px 32px 120px' }}>

        {/* 頂部 nav */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 80,
        }}>
          <button
            type="button"
            onClick={() => navigate('/home')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              fontFamily: 'var(--font-ui, system-ui)', fontSize: 12,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <Icon name="arrowLeft" size={12} />
            返回
          </button>

          <div style={{ display: 'flex', gap: 4 }}>
            {savedAt !== null && (
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.08em', alignSelf: 'center', marginRight: 8 }}>
                已儲存
              </span>
            )}
            <IconButton icon="edit" label="編輯" onClick={() => setEditing(!editing)} active={editing} />
            <IconButton icon="share" label="分享" />
            <IconButton icon="trash" label="刪除" onClick={() => setShowDeleteConfirm(true)} />
          </div>
        </header>

        {/* 大時間戳 */}
        <div style={{ marginBottom: 56 }}>
          <p style={{
            fontFamily: 'var(--font-ui, system-ui)', fontSize: 11,
            letterSpacing: '0.24em', textTransform: 'uppercase',
            color: 'var(--text-tertiary)', margin: 0, marginBottom: 18,
          }}>
            {weekday} · 寫於清晨 {writtenAt}
          </p>
          <h1 style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: 'clamp(40px, 6vw, 64px)',
            fontWeight: 300, letterSpacing: '-0.02em',
            lineHeight: 1, color: 'var(--text-primary)',
            margin: 0,
          }}>
            {dateDisplay}
          </h1>
        </div>

        {/* 雙欄主體 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 240px) 1fr',
          gap: 56,
          marginBottom: 80,
        }}>
          {/* 左 rail — metadata */}
          <aside style={{ paddingTop: 8 }}>
            {dream.mood !== null && dream.mood !== undefined && (
              <MetaRow
                label="情緒"
                value={`${dream.mood > 0 ? '+' : ''}${dream.mood} · ${moodLabel[dream.mood] ?? '—'}`}
                swatch={<MoodSwatch value={dream.mood} />}
              />
            )}
            {dream.lucidity !== null && dream.lucidity !== undefined && (
              <MetaRow
                label="清明度"
                value={`${dream.lucidity} / 10`}
                swatch={<MiniBar value={dream.lucidity} max={10} />}
              />
            )}
            {dream.vividness !== null && dream.vividness !== undefined && (
              <MetaRow
                label="鮮明度"
                value={`${dream.vividness} / 5`}
                swatch={<MiniBar value={dream.vividness} max={5} bars />}
              />
            )}

            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-subtle)' }}>
              <p style={{
                fontFamily: 'var(--font-ui, system-ui)', fontSize: 11,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'var(--text-tertiary)', margin: 0, marginBottom: 14,
              }}>
                標籤
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {dream.tags.map((t) => (
                  <TagChip key={t} tag={t} variant="quiet" onRemove={editing ? () => handleRemoveTag(t) : undefined} />
                ))}
                {editing && (
                  showAddTag ? (
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTag();
                        if (e.key === 'Escape') setShowAddTag(false);
                      }}
                      autoFocus
                      placeholder="新增標籤"
                      style={{
                        border: 'none', borderBottom: '1px solid var(--border-default)',
                        background: 'transparent', outline: 'none',
                        fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-primary)',
                        padding: '2px 0', width: 80,
                      }}
                    />
                  ) : (
                    <TagChip tag="+" variant="ghost" onClick={() => setShowAddTag(true)} />
                  )
                )}
              </div>
            </div>
          </aside>

          {/* 主欄 — 內文 */}
          <article>
            {editing ? (
              <textarea
                value={dream.content}
                onChange={(e) => {
                  editStateRef.current = { ...editStateRef.current, content: e.target.value };
                  setDream({ ...dream, content: e.target.value });
                }}
                style={{
                  width: '100%', minHeight: 400,
                  border: 'none', outline: 'none', resize: 'vertical',
                  background: 'transparent',
                  fontFamily: 'var(--font-serif, serif)', fontSize: 18, lineHeight: 1.85,
                  color: 'var(--text-primary)', padding: 0,
                  caretColor: 'var(--accent-default)',
                }}
              />
            ) : (
              <div style={{
                fontFamily: 'var(--font-serif, serif)',
                fontSize: 18, lineHeight: 1.9, letterSpacing: '0.01em',
                color: 'var(--text-primary)',
              }}>
                {/* 首字 drop cap */}
                <span style={{
                  float: 'left',
                  fontFamily: 'var(--font-serif, serif)',
                  fontSize: 68, lineHeight: 0.9,
                  fontWeight: 300, color: 'var(--accent-default)',
                  marginRight: 12, marginTop: 8, marginBottom: -4,
                }}>
                  {firstChar}
                </span>
                {restContent.split('\n\n').map((para, i) => (
                  <p key={i} style={{ margin: 0, marginBottom: 22 }}>{para}</p>
                ))}
              </div>
            )}
          </article>
        </div>

        {/* AI 分析 */}
        {dream.ai !== null ? (
          <section style={{ marginBottom: 72 }}>
            <SectionLabel
              right={
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="sparkle" size={12} />
                  分析於寫入後
                </span>
              }
            >
              夢的讀寫 · AI 導讀
            </SectionLabel>

            {/* 摘要 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: 56, marginBottom: 40 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-ui, system-ui)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: 0, marginBottom: 10 }}>摘要</p>
              </div>
              <p style={{
                fontFamily: 'var(--font-serif, serif)', fontSize: 16, lineHeight: 1.85,
                color: 'var(--text-primary)', margin: 0, fontStyle: 'italic',
                borderLeft: '2px solid var(--accent-default)', paddingLeft: 24,
              }}>
                {dream.ai.summary}
              </p>
            </div>

            {/* 標籤建議 */}
            {dream.ai.extractedTags.filter((t) => !dream.tags.includes(t)).length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: 56, marginBottom: 40 }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-ui, system-ui)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: 0, marginBottom: 10 }}>建議標籤</p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {dream.ai.extractedTags.filter((t) => !dream.tags.includes(t)).map((tag) => (
                    <TagChip
                      key={tag} tag={tag} variant="ghost"
                      onClick={() => {
                        if (!editStateRef.current.tags?.includes(tag)) {
                          editStateRef.current = { ...editStateRef.current, tags: [...(editStateRef.current.tags ?? []), tag] };
                          setDream({ ...dream, tags: editStateRef.current.tags! });
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-disabled)', margin: 0 }}>
              {new Date(dream.ai.analyzedAt).toLocaleString('zh-TW')} · {dream.ai.model}
            </p>
            <button
              type="button"
              onClick={() => void handleRunAnalysis()}
              disabled={isAnalyzing}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8 }}
            >
              {isAnalyzing ? '分析中…' : '重新分析'}
            </button>
          </section>
        ) : (
          <section style={{ marginBottom: 72 }}>
            <SectionLabel>AI 分析</SectionLabel>
            {analysisError === 'missing-api-key' ? (
              <div style={{ display: 'flex', gap: 16 }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                  尚未設定 API 金鑰。
                </p>
                <Link to="/settings" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--accent-default)', textDecoration: 'none' }}>前往設定</Link>
                <button type="button" onClick={() => setShowManualModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-tertiary)' }}>手動分析</button>
              </div>
            ) : analysisError !== null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--semantic-danger)', margin: 0 }}>{analysisError}</p>
                <button type="button" onClick={() => void handleRunAnalysis()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--accent-default)', padding: 0, textAlign: 'left' }}>重試</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void handleRunAnalysis()}
                disabled={isAnalyzing || !dream.content.trim()}
                style={{
                  padding: '10px 20px', border: '1px solid var(--border-default)',
                  borderRadius: 6, background: 'transparent',
                  fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-primary)',
                  cursor: isAnalyzing || !dream.content.trim() ? 'not-allowed' : 'pointer',
                  opacity: isAnalyzing || !dream.content.trim() ? 0.4 : 1,
                  transition: 'all 180ms',
                }}
              >
                {isAnalyzing ? '分析中…' : '執行 AI 分析'}
              </button>
            )}
          </section>
        )}

        {/* 相似的夢 */}
        {similarDreams.length > 0 && (
          <section>
            <SectionLabel>同一片海域的夢</SectionLabel>
            <div>
              {similarDreams.map(({ dream: similar }) => (
                <DreamEntry
                  key={similar.id}
                  dream={similar}
                  compact
                  onClick={(simId) => navigate(`/dreams/${simId}`)}
                />
              ))}
            </div>
          </section>
        )}

      </main>

      {/* 編輯模式浮動 action bar */}
      {editing && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '16px 32px',
          background: 'var(--bg-raised)',
          borderTop: '1px solid var(--border-default)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          zIndex: 80,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginRight: 'auto' }}>
            編輯中 · 變更會自動儲存
          </span>
          <button
            type="button"
            onClick={() => setEditing(false)}
            style={{
              padding: '10px 20px',
              fontFamily: 'var(--font-ui)', fontSize: 12.5, letterSpacing: '0.06em',
              background: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)', borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            style={{
              padding: '10px 24px',
              fontFamily: 'var(--font-ui)', fontSize: 12.5, letterSpacing: '0.06em',
              background: 'var(--accent-default)', color: 'var(--accent-contrast)',
              border: 'none', borderRadius: 6, cursor: 'pointer',
            }}
          >
            完成
          </button>
        </div>
      )}

      {/* 刪除確認 */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'color-mix(in srgb, var(--bg-overlay) 80%, transparent)',
          backdropFilter: 'blur(4px)', padding: '0 24px',
        }}>
          <div style={{
            width: '100%', maxWidth: 400, borderRadius: 6,
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-raised)', padding: 24,
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 300, color: 'var(--semantic-danger)', margin: 0 }}>確認刪除</h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
              這個動作無法復原。輸入「<strong style={{ color: 'var(--text-primary)' }}>刪除</strong>」以確認。
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="刪除"
              autoFocus
              style={{
                background: 'transparent',
                border: 'none', borderBottom: '1px solid var(--border-default)',
                outline: 'none', padding: '4px 0',
                fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-primary)',
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                style={{ flex: 1, padding: '10px', border: '1px solid var(--border-subtle)', borderRadius: 6, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-secondary)' }}>
                取消
              </button>
              <button type="button" onClick={() => void handleDelete()} disabled={deleteConfirmText !== '刪除'}
                style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: 'var(--semantic-danger)', cursor: deleteConfirmText !== '刪除' ? 'not-allowed' : 'pointer', opacity: deleteConfirmText !== '刪除' ? 0.4 : 1, fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--bg-base)' }}>
                刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {showManualModal && (
        <ManualAnalysisModal dreamContent={dream.content} onClose={() => setShowManualModal(false)} />
      )}
    </div>
  );
}
