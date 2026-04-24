import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { dreamRepo } from '../services/dreamRepo';
import Icon from '../components/ui/Icon';
import TagChip from '../components/TagChip';

const DRAFT_STORAGE_KEY = 'capture-draft';

// ── 子元件 ────────────────────────────────────────────

interface FieldProps {
  label: string;
  hint?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}

function Field({ label, hint, right, children }: FieldProps): JSX.Element {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <label style={{
          fontFamily: 'var(--font-ui, system-ui)',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
        }}>
          {label}
        </label>
        {right}
      </div>
      {children}
      {hint !== undefined && (
        <p style={{ marginTop: 8, fontSize: 11.5, color: 'var(--text-tertiary)', letterSpacing: '0.02em', fontStyle: 'italic' }}>
          {hint}
        </p>
      )}
    </div>
  );
}

interface MoodScaleProps {
  value: number | null;
  onChange: (v: number) => void;
}

function MoodScale({ value, onChange }: MoodScaleProps): JSX.Element {
  const steps = [
    { v: -2, color: '#6b3a3a', label: '極暗' },
    { v: -1, color: '#8a5b4a', label: '陰' },
    { v:  0, color: '#a89684', label: '中性' },
    { v:  1, color: '#c4a87a', label: '亮' },
    { v:  2, color: '#e0c46c', label: '極亮' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>
      <div style={{
        position: 'absolute', left: 12, right: 12, top: '50%', height: 1,
        background: 'var(--border-subtle)', zIndex: 0, transform: 'translateY(-50%)',
      }} />
      {steps.map((s) => {
        const active = value === s.v;
        return (
          <button
            key={s.v}
            type="button"
            onClick={() => onChange(s.v)}
            title={s.label}
            style={{
              flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              position: 'relative', zIndex: 1,
            }}
          >
            <span style={{
              width: active ? 16 : 10, height: active ? 16 : 10,
              borderRadius: 999,
              background: s.color,
              boxShadow: active ? `0 0 0 4px color-mix(in srgb, ${s.color} 30%, transparent)` : 'none',
              transition: 'all 200ms cubic-bezier(0.2,0,0,1)',
              display: 'block',
            }} />
            <span style={{
              fontSize: 10.5,
              color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
              letterSpacing: '0.08em',
              fontFamily: 'var(--font-ui, system-ui)',
            }}>
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface DotsScaleProps {
  max: number;
  value: number;
  onChange: (v: number) => void;
  variant?: 'dots' | 'bars';
}

function DotsScale({ max, value, onChange, variant = 'dots' }: DotsScaleProps): JSX.Element {
  const count = variant === 'dots' ? max + 1 : max;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', gap: variant === 'bars' ? 6 : 4, flex: 1, alignItems: 'flex-end' }}>
        {Array.from({ length: count }).map((_, i) => {
          const active = i <= value;
          if (variant === 'bars') {
            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange(i + 1)}
                style={{
                  flex: 1,
                  height: 28 + i * 4,
                  background: active ? 'var(--accent-default)' : 'var(--border-subtle)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  borderRadius: 2,
                  opacity: active ? 1 : 0.5,
                  transition: 'all 200ms cubic-bezier(0.2,0,0,1)',
                }}
              />
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              style={{
                width: 22, height: 22, padding: 0,
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{
                width: active ? 11 : 7, height: active ? 11 : 7,
                borderRadius: 999,
                background: active ? 'var(--accent-default)' : 'var(--border-default)',
                transition: 'all 180ms cubic-bezier(0.2,0,0,1)',
                display: 'block',
              }} />
            </button>
          );
        })}
      </div>
      <span style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 16, color: 'var(--text-primary)', minWidth: 28, textAlign: 'right' }}>
        {variant === 'bars' ? `${value}/${max}` : value}
      </span>
    </div>
  );
}

// ── 主元件 ────────────────────────────────────────────

export default function Capture(): JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isMorning = searchParams.get('morning') === '1';
  const defaultDate = format(isMorning ? subDays(new Date(), 1) : new Date(), 'yyyy-MM-dd');

  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [lucidity, setLucidity] = useState(0);
  const [vividness, setVividness] = useState(3);
  const [isLucid, setIsLucid] = useState(false);
  const [isNightmare, setIsNightmare] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 進頁面直接 focus
  useEffect(() => {
    textareaRef.current?.focus();
    const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (saved) {
      try {
        const { content: c, date: d } = JSON.parse(saved) as { content: string; date: string };
        setContent(c);
        setSelectedDate(d);
      } catch { /* 無效草稿 */ }
    }
  }, []);

  // auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.max(ta.scrollHeight, 320) + 'px';
  }, [content]);

  // 800ms debounce 自動儲存
  useEffect(() => {
    if (!content) return;
    const t = setTimeout(() => {
      setSavedAt(new Date());
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ content, date: selectedDate }));
    }, 800);
    return () => clearTimeout(t);
  }, [content, selectedDate, tags, mood, lucidity, vividness, isNightmare]);

  const addTag = useCallback((t: string): void => {
    const v = t.trim();
    if (!v || tags.includes(v)) return;
    setTags((prev) => [...prev, v]);
    setTagInput('');
  }, [tags]);

  const handleSave = async (): Promise<void> => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await dreamRepo.create({
        content,
        dreamDate: selectedDate,
        tags,
        mood,
        vividness,
        lucidity: isLucid ? lucidity : null,
        isNightmare,
        isRecurring: false,
      });
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      navigate('/home');
    } catch {
      setIsSubmitting(false);
    }
  };

  const now = new Date();
  const dateStr = format(new Date(`${selectedDate}T00:00:00`), 'M月d日 EEEE', { locale: zhTW });
  const timeStr = format(now, 'HH:mm');
  const wordCount = content.length;
  const readMins = Math.max(1, Math.ceil(wordCount / 300));

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', position: 'relative' }}>
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 32px 96px' }}>

        {/* 頂部 nav */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 64,
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {savedAt !== null ? (
              <span style={{
                fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.08em',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: 999,
                  background: 'var(--semantic-lucid)',
                  display: 'inline-block',
                }} className="animate-pulse-dot" />
                已守住 · {format(savedAt, 'HH:mm')}
              </span>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
                未儲存
              </span>
            )}
          </div>
        </header>

        {/* 日期時間抬頭 */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <time style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: 20, fontWeight: 300,
            color: 'var(--text-primary)', letterSpacing: '0.02em',
          }}>
            {dateStr}
          </time>
          <span style={{
            fontFamily: 'var(--font-ui, system-ui)', fontSize: 11,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
          }}>
            {timeStr} · {isMorning ? '清晨紀錄' : '午後紀錄'}
          </span>
        </div>

        {/* 空白提示引言 */}
        {!content && (
          <p style={{
            fontFamily: 'var(--font-serif, serif)',
            fontStyle: 'italic', fontSize: 15,
            color: 'var(--text-tertiary)', margin: 0, marginBottom: 8,
            letterSpacing: '0.01em',
          }}>
            你在哪裡？誰在那裡？發生了什麼——
          </p>
        )}

        {/* 核心無框 textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={content ? '' : '趁記憶還濕著⋯'}
          style={{
            width: '100%',
            minHeight: 320,
            padding: 0, margin: 0,
            border: 'none', outline: 'none', resize: 'none',
            background: 'transparent',
            fontFamily: 'var(--font-serif, serif)',
            fontSize: 18, lineHeight: 1.85, letterSpacing: '0.01em',
            color: 'var(--text-primary)',
            caretColor: 'var(--accent-default)',
          }}
          spellCheck={false}
        />

        {/* 標記抽屜 */}
        <section style={{ marginTop: 56 }}>
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingBottom: 10,
              background: 'none', border: 'none', borderBottom: '1px solid var(--border-subtle)',
              cursor: 'pointer', paddingLeft: 0, paddingRight: 0,
            }}
          >
            <h2 style={{
              fontFamily: 'var(--font-ui, system-ui)', fontSize: 11.5, fontWeight: 500,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'var(--text-tertiary)', margin: 0,
            }}>
              標記 · 情緒 · 清明度
            </h2>
            <span style={{
              fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.08em',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              {drawerOpen ? '收起' : '展開'}
              <Icon
                name="arrowRight"
                size={11}
                style={{ transform: drawerOpen ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 200ms' }}
              />
            </span>
          </button>

          {drawerOpen && (
            <div style={{ paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 28 }}>

              {/* 標籤 */}
              <Field label="標籤" hint="用逗號或 Enter 分隔。我們會記錄你最常用的主題。">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  {tags.map((t) => (
                    <TagChip
                      key={t} tag={t} variant="quiet"
                      onRemove={() => setTags(tags.filter((x) => x !== t))}
                    />
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); }
                      if (e.key === 'Backspace' && !tagInput && tags.length) {
                        setTags(tags.slice(0, -1));
                      }
                    }}
                    placeholder={tags.length ? '' : '海、飛行、童年⋯'}
                    style={{
                      flex: 1, minWidth: 120, padding: '4px 2px',
                      border: 'none', outline: 'none', background: 'transparent',
                      fontFamily: 'var(--font-serif, serif)', fontSize: 14,
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.08em', marginRight: 4 }}>常用：</span>
                  {['海', '飛行', '家人', '追逐', '童年', '房間'].filter((t) => !tags.includes(t)).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => addTag(t)}
                      style={{
                        background: 'transparent', border: 'none', padding: '2px 6px',
                        fontFamily: 'var(--font-serif, serif)', fontSize: 12.5,
                        color: 'var(--text-tertiary)', cursor: 'pointer',
                        borderBottom: '1px dashed var(--border-subtle)',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>

              {/* 情緒 */}
              <Field label="醒來時的情緒" hint="很暗 → 很亮">
                <MoodScale value={mood} onChange={setMood} />
              </Field>

              {/* 清明度 */}
              <Field
                label="清明度"
                hint="0 表示完全沒意識到；10 表示完全可以操控"
                right={
                  <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={isLucid}
                      onChange={(e) => setIsLucid(e.target.checked)}
                      style={{ accentColor: 'var(--accent-default)' }}
                    />
                    這是清明夢
                  </label>
                }
              >
                <DotsScale max={10} value={lucidity} onChange={setLucidity} />
              </Field>

              {/* 鮮明度 */}
              <Field label="鮮明度" hint="像薄霧 → 像 4K 影片">
                <DotsScale max={5} value={vividness} onChange={setVividness} variant="bars" />
              </Field>

              {/* 性質 */}
              <Field label="性質">
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={isNightmare}
                    onChange={(e) => setIsNightmare(e.target.checked)}
                    style={{ accentColor: 'var(--semantic-nightmare)' }}
                  />
                  <span style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 14 }}>標記為惡夢</span>
                </label>
              </Field>

            </div>
          )}
        </section>

        {/* 底部動作列 */}
        <div style={{
          marginTop: 48, paddingTop: 24,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>
            {wordCount} 字 · 約 {readMins} 分鐘閱讀
          </span>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate('/home')}
              style={{
                padding: '10px 20px',
                fontFamily: 'var(--font-ui, system-ui)', fontSize: 12.5, letterSpacing: '0.06em',
                color: 'var(--text-secondary)',
                background: 'transparent',
                border: '1px solid var(--border-default)', borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              稍後補完
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={!content.trim() || isSubmitting}
              style={{
                padding: '10px 24px',
                fontFamily: 'var(--font-ui, system-ui)', fontSize: 12.5, letterSpacing: '0.06em',
                color: 'var(--accent-contrast)',
                background: 'var(--accent-default)', borderRadius: 6, border: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                cursor: !content.trim() || isSubmitting ? 'not-allowed' : 'pointer',
                opacity: !content.trim() || isSubmitting ? 0.5 : 1,
                transition: 'opacity 180ms',
              }}
            >
              {isSubmitting ? '封存中…' : '封存這個夢'}
              {!isSubmitting && <Icon name="arrowRight" size={12} />}
            </button>
          </div>
        </div>

      </main>

      {/* 語音按鈕（fixed 右下） */}
      <button
        type="button"
        onClick={() => setVoiceOn(!voiceOn)}
        title="語音輸入"
        style={{
          position: 'fixed', bottom: 80, right: 24,
          width: 52, height: 52, borderRadius: 999,
          background: voiceOn ? 'var(--accent-default)' : 'var(--bg-raised)',
          color: voiceOn ? 'var(--accent-contrast)' : 'var(--text-secondary)',
          border: voiceOn ? 'none' : '1px solid var(--border-default)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: voiceOn
            ? '0 0 0 6px color-mix(in srgb, var(--accent-default) 20%, transparent), 0 4px 16px rgba(0,0,0,0.12)'
            : '0 4px 16px rgba(0,0,0,0.08)',
          transition: 'all 240ms cubic-bezier(0.2,0,0,1)',
          zIndex: 50,
        }}
      >
        <Icon name="mic" size={20} />
        {voiceOn && (
          <>
            <span style={{
              position: 'absolute', inset: -6, borderRadius: 999,
              border: '1px solid var(--accent-default)',
            }} className="animate-ripple" />
            <span style={{
              position: 'absolute', inset: -6, borderRadius: 999,
              border: '1px solid var(--accent-default)',
              animationDelay: '0.8s',
            }} className="animate-ripple" />
          </>
        )}
      </button>
    </div>
  );
}
