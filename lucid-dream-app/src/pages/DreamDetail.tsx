import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { dreamRepo } from '../services/dreamRepo';
import { Dream, DreamUpdate } from '../types/dream';
import { useAutoSave } from '../hooks/useAutoSave';
import { analyzeDream } from '../services/ai';
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
  const [similarDreams, setSimilarDreams] = useState<
    { dream: Dream; similarity: number }[]
  >([]);

  const editStateRef = useRef<Partial<Dream>>({});

  useEffect(() => {
    async function loadDream() {
      if (!id) return;
      try {
        const d = await dreamRepo.get(id);
        setDream(d || null);
        editStateRef.current = d ? { ...d } : {};

        // Load similar dreams
        if (d) {
          const allDreams = await dreamRepo.listAll();
          const similar = findSimilarDreams(d, allDreams, 3, 0.2);
          setSimilarDreams(similar);
        }
      } catch (error) {
        console.error('Failed to load dream:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDream();
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

  const handleDelete = async () => {
    if (deleteConfirmText !== '刪除' || !id) return;
    try {
      await dreamRepo.delete(id);
      navigate('/home');
    } catch (error) {
      console.error('Failed to delete dream:', error);
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const tag = newTag.trim();
    if (!editStateRef.current.tags?.includes(tag)) {
      editStateRef.current = {
        ...editStateRef.current,
        tags: [...(editStateRef.current.tags || []), tag],
      };
      setDream(dream ? { ...dream, tags: editStateRef.current.tags! } : null);
    }
    setNewTag('');
    setShowAddTag(false);
  };

  const handleRemoveTag = (tag: string) => {
    editStateRef.current = {
      ...editStateRef.current,
      tags: (editStateRef.current.tags || []).filter((t) => t !== tag),
    };
    setDream(dream ? { ...dream, tags: editStateRef.current.tags! } : null);
  };

  const handleAddExtractedTag = (tag: string) => {
    if (!editStateRef.current.tags?.includes(tag)) {
      editStateRef.current = {
        ...editStateRef.current,
        tags: [...(editStateRef.current.tags || []), tag],
      };
      setDream(dream ? { ...dream, tags: editStateRef.current.tags! } : null);
    }
  };

  const handleRunAnalysis = async () => {
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

  const suggestedTags = dream?.ai?.extractedTags.filter(
    (tag) => !dream.tags.includes(tag)
  ) || [];

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <p className="text-text-secondary">載入中…</p>
      </main>
    );
  }

  if (!dream) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
        <p className="text-text-primary">找不到夢境紀錄</p>
        <button
          onClick={() => navigate('/home')}
          className="text-accent transition-colors duration-normal hover:text-accent-hover"
        >
          返回首頁
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col gap-6 px-4 py-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <button
            onClick={() => navigate('/home')}
            className="text-text-secondary transition-colors duration-normal hover:text-text-primary"
          >
            ← 返回
          </button>
          <input
            type="date"
            value={dream.dreamDate}
            onChange={(e) => {
              editStateRef.current = { ...editStateRef.current, dreamDate: e.target.value };
              setDream({ ...dream, dreamDate: e.target.value });
            }}
            className="block w-full rounded-md border border-border-subtle bg-bg-secondary px-3 py-2 text-body text-text-primary placeholder-text-tertiary outline-none transition-colors duration-normal focus:border-border-default"
          />
        </div>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="mt-8 flex min-h-10 min-w-10 items-center justify-center rounded-md border border-danger bg-bg-secondary text-danger transition-colors duration-normal hover:bg-danger hover:text-bg-primary"
          title="刪除"
        >
          🗑
        </button>
      </header>

      {savedAt && (
        <div className="fixed top-4 right-4 bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-small text-text-tertiary animate-pulse">
          已儲存
        </div>
      )}

      <textarea
        value={dream.content}
        onChange={(e) => {
          editStateRef.current = { ...editStateRef.current, content: e.target.value };
          setDream({ ...dream, content: e.target.value });
        }}
        className="w-full rounded-lg border border-border-subtle bg-bg-secondary px-4 py-3 text-body text-text-primary placeholder-text-tertiary outline-none transition-colors duration-normal focus:border-border-default"
        placeholder="記錄你的夢…"
        rows={6}
      />

      <Section title="補充資訊" defaultExpanded>
        <div className="space-y-4">
          <div>
            <label className="block text-small text-text-secondary mb-2">情緒</label>
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

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dream.isNightmare}
                onChange={(e) => {
                  editStateRef.current = { ...editStateRef.current, isNightmare: e.target.checked };
                  setDream({ ...dream, isNightmare: e.target.checked });
                }}
                className="rounded"
              />
              <span className="text-body text-text-primary">是否惡夢</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dream.isRecurring}
                onChange={(e) => {
                  editStateRef.current = { ...editStateRef.current, isRecurring: e.target.checked };
                  setDream({ ...dream, isRecurring: e.target.checked });
                }}
                className="rounded"
              />
              <span className="text-body text-text-primary">是否反覆夢</span>
            </label>
          </div>
        </div>
      </Section>

      {dream.lucidity !== null && dream.lucidity > 0 && (
        <Section title="清明夢細節" defaultExpanded>
          <div className="space-y-4">
            <div>
              <label className="block text-small text-text-secondary mb-2">觸發因素</label>
              <input
                type="text"
                value={dream.lucidNotes || ''}
                onChange={(e) => {
                  editStateRef.current = { ...editStateRef.current, lucidNotes: e.target.value };
                  setDream({ ...dream, lucidNotes: e.target.value });
                }}
                className="w-full rounded-md border border-border-subtle bg-bg-secondary px-3 py-2 text-body text-text-primary placeholder-text-tertiary outline-none transition-colors duration-normal focus:border-border-default"
                placeholder="是什麼讓你變得清明？"
              />
            </div>
          </div>
        </Section>
      )}

      <Section title="標籤" defaultExpanded>
        <div className="space-y-3">
          {dream.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dream.tags.map((tag) => (
                <TagChip
                  key={tag}
                  tag={tag}
                  onRemove={() => handleRemoveTag(tag)}
                  variant="filled"
                />
              ))}
            </div>
          )}

          {suggestedTags.length > 0 && (
            <div className="space-y-2">
              <p className="text-small text-text-secondary">建議標籤</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <TagChip
                    key={tag}
                    tag={tag}
                    onClick={() => handleAddExtractedTag(tag)}
                    variant="dashed"
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
                }}
                autoFocus
                className="flex-1 rounded-md border border-border-subtle bg-bg-secondary px-3 py-2 text-body text-text-primary placeholder-text-tertiary outline-none transition-colors duration-normal focus:border-border-default"
                placeholder="輸入新標籤"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-2 rounded-md bg-accent text-bg-primary text-body font-medium transition-colors duration-normal hover:bg-accent-hover active:scale-95"
              >
                加入
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddTag(true)}
              className="text-accent transition-colors duration-normal hover:text-accent-hover"
            >
              + 新增
            </button>
          )}
        </div>
      </Section>

      <Section title="AI 分析" defaultExpanded={!!dream.ai}>
        {analysisError === 'missing-api-key' ? (
          <div className="space-y-3">
            <p className="text-small text-text-secondary">
              Gemini API key 未設定。請前往設定頁面輸入您的 API key。
            </p>
            <Link
              to="/settings"
              className="inline-block text-accent text-small underline hover:opacity-80"
            >
              前往設定
            </Link>
          </div>
        ) : analysisError ? (
          <div className="space-y-3">
            <p className="text-small text-danger">{analysisError}</p>
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="text-accent text-small transition-colors duration-normal hover:opacity-80 disabled:opacity-50"
            >
              重試
            </button>
          </div>
        ) : dream.ai ? (
          <div className="space-y-3">
            <p className="text-body text-text-primary">{dream.ai.summary}</p>
            <p className="text-small text-text-tertiary">
              分析於 {new Date(dream.ai.analyzedAt).toLocaleString('zh-TW')}
            </p>
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="text-accent transition-colors duration-normal hover:opacity-80 text-small disabled:opacity-50"
            >
              {isAnalyzing ? '分析中…' : '重新分析'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || !dream.content.trim()}
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-4 py-2 text-body font-medium text-bg-primary transition-colors duration-normal hover:bg-accent-hover active:scale-95 disabled:opacity-50"
          >
            {isAnalyzing ? '分析中…' : '執行分析'}
          </button>
        )}
      </Section>

      {similarDreams.length > 0 && (
        <Section title="相似的夢" defaultExpanded>
          <div className="space-y-3">
            {similarDreams.map(({ dream: similarDream, similarity }) => (
              <Link
                key={similarDream.id}
                to={`/dreams/${similarDream.id}`}
                className="block rounded-lg border border-border-subtle bg-bg-secondary p-3 transition-all duration-normal hover:border-border-default hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-small text-text-primary font-medium">
                      {format(new Date(similarDream.dreamDate), 'yyyy 年 M 月 d 日')}
                    </h4>
                    <p className="line-clamp-2 text-small text-text-secondary mt-1">
                      {similarDream.content}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="inline-block rounded-full bg-accent bg-opacity-20 px-2 py-1 text-small text-accent">
                      {Math.round(similarity * 100)}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title="我的筆記" defaultExpanded={!!dream.userNotes}>
        <textarea
          value={dream.userNotes}
          onChange={(e) => {
            editStateRef.current = { ...editStateRef.current, userNotes: e.target.value };
            setDream({ ...dream, userNotes: e.target.value });
          }}
          className="w-full rounded-lg border border-border-subtle bg-bg-secondary px-4 py-3 text-body text-text-primary placeholder-text-tertiary outline-none transition-colors duration-normal focus:border-border-default"
          placeholder="自由筆記…"
          rows={4}
        />
      </Section>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-modal flex items-center justify-center bg-overlay/50 backdrop-blur-sm px-4">
          <div className="max-w-sm rounded-lg border border-border-subtle bg-bg-secondary p-6 space-y-4">
            <h2 className="text-body font-semibold text-danger">確認刪除</h2>
            <p className="text-body text-text-secondary">
              這個動作無法復原。請輸入「<strong>刪除</strong>」來確認。
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full rounded-md border border-border-subtle bg-bg-secondary px-3 py-2 text-body text-text-primary placeholder-text-tertiary outline-none transition-colors duration-normal focus:border-border-default"
              placeholder="輸入刪除"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 rounded-md border border-border-subtle bg-bg-secondary px-4 py-2 text-body text-text-primary transition-colors duration-normal hover:border-border-default"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== '刪除'}
                className="flex-1 rounded-md bg-danger px-4 py-2 text-body font-medium text-bg-primary transition-colors duration-normal disabled:opacity-50 hover:enabled:bg-danger active:enabled:scale-95"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
