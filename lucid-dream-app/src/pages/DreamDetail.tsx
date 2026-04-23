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
import Section from '../components/Section';
import MoodControl from '../components/MoodControl';
import StarRating from '../components/StarRating';
import TagChip from '../components/TagChip';
import DreamEntry from '../components/ui/DreamEntry';
import SectionLabel from '../components/ui/SectionLabel';
import IconButton from '../components/ui/IconButton';
import Navbar from '../components/Navbar';

export default function DreamDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dream, setDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showDateEdit, setShowDateEdit] = useState(false);
  const [similarDreams, setSimilarDreams] = useState<
    { dream: Dream; similarity: number }[]
  >([]);

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
      } catch {
        // 靜默處理
      } finally {
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
    } catch {
      // 靜默處理
    }
  };

  const handleAddTag = (): void => {
    const tag = newTag.trim();
    if (!tag) return;
    if (!editStateRef.current.tags?.includes(tag)) {
      editStateRef.current = {
        ...editStateRef.current,
        tags: [...(editStateRef.current.tags ?? []), tag],
      };
      setDream(dream ? { ...dream, tags: editStateRef.current.tags! } : null);
    }
    setNewTag('');
    setShowAddTag(false);
  };

  const handleRemoveTag = (tag: string): void => {
    editStateRef.current = {
      ...editStateRef.current,
      tags: (editStateRef.current.tags ?? []).filter((t) => t !== tag),
    };
    setDream(dream ? { ...dream, tags: editStateRef.current.tags! } : null);
  };

  const handleAddExtractedTag = (tag: string): void => {
    if (!editStateRef.current.tags?.includes(tag)) {
      editStateRef.current = {
        ...editStateRef.current,
        tags: [...(editStateRef.current.tags ?? []), tag],
      };
      setDream(dream ? { ...dream, tags: editStateRef.current.tags! } : null);
    }
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
      if (error instanceof MissingApiKeyError) {
        setAnalysisError('missing-api-key');
      } else if (error instanceof InvalidApiKeyError) {
        setAnalysisError('invalid-api-key');
      } else if (error instanceof RateLimitError) {
        setAnalysisError('rate-limit');
      } else if (error instanceof AnalysisError) {
        setAnalysisError(error.message);
      } else {
        setAnalysisError('分析失敗，請稍後重試');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const suggestedTags =
    dream?.ai?.extractedTags.filter((tag) => !dream.tags.includes(tag)) ?? [];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <p className="font-ui text-small text-tertiary">載入中…</p>
      </div>
    );
  }

  if (!dream) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-base px-4">
        <p className="font-serif text-body text-secondary">找不到夢境紀錄</p>
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="font-ui text-small text-accent hover:text-accent-hover"
        >
          返回首頁
        </button>
      </div>
    );
  }

  const displayDate = format(parseISO(dream.dreamDate), 'yyyy年M月d日 EEEE', {
    locale: zhTW,
  });

  const rightActions = (
    <>
      <IconButton
        icon="trash"
        label="刪除此夢境"
        onClick={() => setShowDeleteConfirm(true)}
        variant="ghost"
        size="md"
      />
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <Navbar showBack onBackClick={() => navigate('/home')} rightActions={rightActions} />

      {/* 儲存指示器 */}
      {savedAt && (
        <div className="fixed right-4 top-14 z-20 animate-fade-in">
          <span className="font-ui text-caption text-tertiary">已儲存</span>
        </div>
      )}

      <main className="flex flex-col gap-8 px-5 py-6 pb-12">
        {/* 日期標頭 */}
        <div>
          {showDateEdit ? (
            <input
              type="date"
              value={dream.dreamDate}
              autoFocus
              onChange={(e) => {
                editStateRef.current = { ...editStateRef.current, dreamDate: e.target.value };
                setDream({ ...dream, dreamDate: e.target.value });
              }}
              onBlur={() => setShowDateEdit(false)}
              className="rounded-md border border-border-default bg-raised px-3 py-2 font-ui text-body text-primary outline-none focus:border-border-focus"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowDateEdit(true)}
              className="group text-left"
              aria-label="編輯日期"
            >
              <span className="font-serif text-title font-light text-primary transition-colors duration-fast group-hover:text-accent">
                {displayDate}
              </span>
            </button>
          )}
        </div>

        {/* 夢境內容 */}
        <div>
          <SectionLabel className="mb-3">夢境記錄</SectionLabel>
          <textarea
            value={dream.content}
            onChange={(e) => {
              editStateRef.current = { ...editStateRef.current, content: e.target.value };
              setDream({ ...dream, content: e.target.value });
            }}
            placeholder="記錄你的夢…"
            rows={8}
            className="w-full resize-none bg-transparent font-serif text-bodyLg leading-relaxed text-primary placeholder-text-disabled outline-none"
          />
        </div>

        <div className="border-t border-border-subtle" />

        {/* 基本指標 */}
        <Section title="記錄指標" defaultExpanded>
          <div className="space-y-5">
            <div>
              <p className="mb-2 font-ui text-small text-secondary">情緒</p>
              <MoodControl
                value={dream.mood}
                onChange={(value) => {
                  editStateRef.current = { ...editStateRef.current, mood: value };
                  setDream({ ...dream, mood: value });
                }}
              />
            </div>

            <div>
              <StarRating
                value={dream.vividness}
                onChange={(value) => {
                  editStateRef.current = { ...editStateRef.current, vividness: value };
                  setDream({ ...dream, vividness: value });
                }}
                maxStars={5}
                label="生動度"
              />
            </div>

            <div>
              <StarRating
                value={dream.lucidity}
                onChange={(value) => {
                  editStateRef.current = { ...editStateRef.current, lucidity: value };
                  setDream({ ...dream, lucidity: value });
                }}
                maxStars={6}
                label="清明度"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={dream.isNightmare}
                  onChange={(e) => {
                    editStateRef.current = { ...editStateRef.current, isNightmare: e.target.checked };
                    setDream({ ...dream, isNightmare: e.target.checked });
                  }}
                  className="rounded accent-accent-default"
                />
                <span className="font-ui text-body text-secondary">夢魘</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={dream.isRecurring}
                  onChange={(e) => {
                    editStateRef.current = { ...editStateRef.current, isRecurring: e.target.checked };
                    setDream({ ...dream, isRecurring: e.target.checked });
                  }}
                  className="rounded accent-accent-default"
                />
                <span className="font-ui text-body text-secondary">反覆出現</span>
              </label>
            </div>
          </div>
        </Section>

        {/* 清明夢細節 */}
        {dream.lucidity !== null && dream.lucidity !== undefined && dream.lucidity > 0 && (
          <Section title="清明夢細節" defaultExpanded>
            <textarea
              value={dream.lucidNotes ?? ''}
              onChange={(e) => {
                editStateRef.current = { ...editStateRef.current, lucidNotes: e.target.value };
                setDream({ ...dream, lucidNotes: e.target.value });
              }}
              placeholder="觸發因素、控制方式、夢中意圖…"
              rows={3}
              className="w-full resize-none bg-transparent font-serif text-body leading-relaxed text-primary placeholder-text-disabled outline-none"
            />
          </Section>
        )}

        {/* 標籤 */}
        <Section title="標籤" defaultExpanded>
          <div className="space-y-3">
            {dream.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {dream.tags.map((tag) => (
                  <TagChip
                    key={tag}
                    tag={tag}
                    variant="solid"
                    size="md"
                    onRemove={() => handleRemoveTag(tag)}
                  />
                ))}
              </div>
            )}

            {suggestedTags.length > 0 && (
              <div className="space-y-2">
                <p className="font-ui text-small text-tertiary">AI 建議</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => (
                    <TagChip
                      key={tag}
                      tag={tag}
                      variant="ghost"
                      size="md"
                      onClick={() => handleAddExtractedTag(tag)}
                    />
                  ))}
                </div>
              </div>
            )}

            {showAddTag ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTag();
                    if (e.key === 'Escape') setShowAddTag(false);
                  }}
                  autoFocus
                  placeholder="標籤名稱"
                  className="flex-1 border-b border-border-default bg-transparent pb-1 font-ui text-body text-primary placeholder-text-disabled outline-none focus:border-border-focus"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="font-ui text-small text-accent hover:text-accent-hover"
                >
                  加入
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddTag(true)}
                className="font-ui text-small text-tertiary transition-colors duration-fast hover:text-secondary"
              >
                + 新增標籤
              </button>
            )}
          </div>
        </Section>

        {/* AI 分析 */}
        <Section title="AI 分析" defaultExpanded={!!dream.ai}>
          {analysisError === 'missing-api-key' ? (
            <div className="space-y-3">
              <p className="font-ui text-small text-secondary">
                尚未設定 API 金鑰。可前往設定頁面輸入，或使用手動分析。
              </p>
              <div className="flex items-center gap-4">
                <Link to="/settings" className="font-ui text-small text-accent hover:text-accent-hover">
                  前往設定
                </Link>
                <button
                  type="button"
                  onClick={() => setShowManualModal(true)}
                  className="font-ui text-small text-tertiary hover:text-secondary"
                >
                  手動分析
                </button>
              </div>
            </div>
          ) : analysisError ? (
            <div className="space-y-3">
              <p className="font-ui text-small text-danger">{analysisError}</p>
              <button
                type="button"
                onClick={() => void handleRunAnalysis()}
                className="font-ui text-small text-accent hover:text-accent-hover"
              >
                重試
              </button>
            </div>
          ) : dream.ai ? (
            <div className="space-y-3">
              <div className="border-l-2 border-accent-subtle pl-4">
                <p className="font-serif text-body leading-relaxed text-primary">{dream.ai.summary}</p>
              </div>
              <p className="font-ui text-caption text-disabled">
                {new Date(dream.ai.analyzedAt).toLocaleString('zh-TW')} · {dream.ai.model}
              </p>
              <button
                type="button"
                onClick={() => void handleRunAnalysis()}
                disabled={isAnalyzing}
                className="font-ui text-small text-tertiary transition-colors duration-fast hover:text-secondary disabled:opacity-40"
              >
                {isAnalyzing ? '分析中…' : '重新分析'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void handleRunAnalysis()}
              disabled={isAnalyzing || !dream.content.trim()}
              className="rounded-md border border-border-default px-4 py-2 font-ui text-small text-primary transition-colors duration-fast hover:border-border-strong hover:bg-inset disabled:opacity-40"
            >
              {isAnalyzing ? '分析中…' : '執行 AI 分析'}
            </button>
          )}
        </Section>

        {/* 相似的夢 */}
        {similarDreams.length > 0 && (
          <Section title="相似的夢" defaultExpanded>
            <div className="divide-y divide-border-subtle">
              {similarDreams.map(({ dream: similar, similarity }) => (
                <div key={similar.id} className="relative">
                  <DreamEntry
                    dream={similar}
                    onClick={(simId) => navigate(`/dreams/${simId}`)}
                    showTags={false}
                    compact
                  />
                  <span className="absolute right-0 top-4 font-ui text-caption text-disabled tabular-nums">
                    {Math.round(similarity * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 個人筆記 */}
        <Section title="個人筆記" defaultExpanded={!!dream.userNotes}>
          <textarea
            value={dream.userNotes}
            onChange={(e) => {
              editStateRef.current = { ...editStateRef.current, userNotes: e.target.value };
              setDream({ ...dream, userNotes: e.target.value });
            }}
            placeholder="自由書寫你對這個夢的想法…"
            rows={4}
            className="w-full resize-none bg-transparent font-serif text-body leading-relaxed text-primary placeholder-text-disabled outline-none"
          />
        </Section>
      </main>

      {/* 刪除確認對話框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay/60 backdrop-blur-sm px-4 pb-8 sm:items-center">
          <div className="w-full max-w-sm rounded-lg border border-border-subtle bg-raised p-6 shadow-overlay space-y-4">
            <h2 className="font-serif text-title font-light text-danger">確認刪除</h2>
            <p className="font-ui text-body text-secondary">
              這個動作無法復原。輸入「<strong className="text-primary">刪除</strong>」以確認。
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="刪除"
              className="w-full border-b border-border-default bg-transparent pb-2 font-ui text-body text-primary placeholder-text-disabled outline-none focus:border-border-focus"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 rounded-md border border-border-subtle py-2 font-ui text-body text-secondary transition-colors duration-fast hover:border-border-default hover:text-primary"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleteConfirmText !== '刪除'}
                className="flex-1 rounded-md bg-semantic-danger py-2 font-ui text-body text-bg-base transition-colors duration-fast disabled:opacity-40 enabled:hover:opacity-90"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {showManualModal && (
        <ManualAnalysisModal
          dreamContent={dream.content}
          onClose={() => setShowManualModal(false)}
        />
      )}
    </div>
  );
}
