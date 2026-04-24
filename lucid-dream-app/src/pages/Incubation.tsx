import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { incubationRepo } from '../services/incubationRepo'
import { calcHitScore, type IncubationIntent } from '../types/incubation'
import Icon from '../components/ui/Icon'

// ── Constants ────────────────────────────────────────────────────────────────

const PRESET_EMOTIONS = [
  '愉悅', '平靜', '興奮', '好奇', '溫暖', '神秘',
  '清晰', '自由', '連結', '力量', '喜悅', '安全', '輕盈',
]

const MILD_SUGGESTIONS = [
  '今晚我將清醒地意識到自己在做夢',
  '下一次我做夢時，我會知道我在夢中',
  '我的夢清晰、生動，我完全記得意圖',
]

type Tab = 'intent' | 'records' | 'stats' | 'techniques'
const TODAY = format(new Date(), 'yyyy-MM-dd')

// ── Tag input helpers ─────────────────────────────────────────────────────────

interface TagInputProps {
  label: string
  tags: string[]
  placeholder: string
  onChange: (tags: string[]) => void
}

function TagInput({ label, tags, placeholder, onChange }: TagInputProps): JSX.Element {
  const [input, setInput] = useState('')

  function commit(): void {
    const val = input.trim()
    if (val && !tags.includes(val)) onChange([...tags, val])
    setInput('')
  }

  return (
    <div>
      <p style={labelStyle}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {tags.map((t) => (
          <span
            key={t}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 20,
              border: '1px solid var(--border-default)',
              background: 'var(--bg-surface)',
              fontSize: 13, color: 'var(--text-secondary)',
            }}
          >
            {t}
            <button
              type="button"
              onClick={() => onChange(tags.filter((x) => x !== t))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-tertiary)', lineHeight: 1 }}
              aria-label={`移除 ${t}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit() } }}
        onBlur={commit}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  )
}

// ── Morning review card ───────────────────────────────────────────────────────

interface ReviewCardProps {
  intent: IncubationIntent
  onSave: (intent: IncubationIntent) => void
}

function ReviewCard({ intent, onSave }: ReviewCardProps): JSX.Element {
  const [expanded, setExpanded] = useState(!intent.reviewed)
  const [hitScene, setHitScene] = useState(intent.hitScene)
  const [hitVisual, setHitVisual] = useState(intent.hitVisual)
  const [hitAudio, setHitAudio] = useState(intent.hitAudio)
  const [hitTactile, setHitTactile] = useState(intent.hitTactile)
  const [hitEmotional, setHitEmotional] = useState(intent.hitEmotional)
  const [hitCharacters, setHitCharacters] = useState(intent.hitCharacters)
  const [hitSymbols, setHitSymbols] = useState(intent.hitSymbols)
  const [hitOverall, setHitOverall] = useState(intent.hitOverall)
  const [hitNotes, setHitNotes] = useState(intent.hitNotes)
  const [saving, setSaving] = useState(false)

  const { hit, total } = calcHitScore({ ...intent, reviewed: true, hitScene, hitVisual, hitAudio, hitTactile, hitEmotional, hitCharacters, hitSymbols })
  const rate = total > 0 ? Math.round((hit / total) * 100) : 0

  async function handleSave(): Promise<void> {
    setSaving(true)
    await incubationRepo.update(intent.id, {
      reviewed: true, hitScene, hitVisual, hitAudio, hitTactile, hitEmotional,
      hitCharacters, hitSymbols, hitOverall, hitNotes,
    })
    const updated = await incubationRepo.get(intent.id)
    if (updated) onSave(updated)
    setSaving(false)
    setExpanded(false)
  }

  function CheckBox({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean) => void }): JSX.Element {
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0',
          color: value ? 'var(--text-primary)' : 'var(--text-tertiary)',
          textAlign: 'left',
        }}
      >
        <span style={{
          width: 18, height: 18, borderRadius: 4, flexShrink: 0,
          border: '1.5px solid',
          borderColor: value ? 'var(--accent-default)' : 'var(--border-default)',
          background: value ? 'var(--accent-default)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 150ms cubic-bezier(0.2,0,0,1)',
        }}>
          {value && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="var(--bg-base)" strokeWidth="1.5" strokeLinecap="round"/></svg>}
        </span>
        <span style={{ fontSize: 14 }}>{label}</span>
      </button>
    )
  }

  return (
    <div style={{
      borderRadius: 6,
      border: '1px solid var(--border-subtle)',
      background: 'var(--bg-raised)',
      overflow: 'hidden',
      marginBottom: 12,
      transition: 'border-color 150ms',
    }}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer', gap: 12,
        }}
      >
        <div style={{ textAlign: 'left', minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-tertiary)', letterSpacing: '0.08em', marginBottom: 3 }}>
            {format(new Date(intent.date + 'T12:00:00'), 'M月d日 EEEE', { locale: zhTW })}
          </p>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--text-primary)', fontFamily: 'var(--font-serif, serif)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {intent.targetScene.slice(0, 60)}{intent.targetScene.length > 60 ? '…' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {intent.reviewed ? (
            <span style={{
              padding: '3px 10px', borderRadius: 20,
              background: rate >= 60
                ? 'color-mix(in srgb, var(--accent-default) 15%, transparent)'
                : 'var(--bg-inset)',
              color: rate >= 60 ? 'var(--accent-default)' : 'var(--text-tertiary)',
              fontSize: 12, letterSpacing: '0.06em',
            }}>
              命中 {rate}%
            </span>
          ) : (
            <span style={{ padding: '3px 10px', borderRadius: 20, background: 'var(--bg-inset)', color: 'var(--text-tertiary)', fontSize: 12 }}>
              待回顧
            </span>
          )}
          <Icon name="arrowRight" size={14} style={{ color: 'var(--text-tertiary)', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 200ms' }} />
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 18px 20px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ paddingTop: 16, marginBottom: 16 }}>
            <p style={labelStyle}>意圖場景</p>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'var(--font-serif, serif)', lineHeight: 1.7 }}>
              {intent.targetScene}
            </p>
          </div>

          <p style={{ ...labelStyle, marginBottom: 6 }}>哪些元素出現在你的夢中？</p>

          <CheckBox label="核心場景" value={hitScene} onChange={(v) => setHitScene(v)} />
          {intent.sensoryVisual && <CheckBox label={`視覺：${intent.sensoryVisual.slice(0, 30)}`} value={hitVisual} onChange={(v) => setHitVisual(v)} />}
          {intent.sensoryAudio && <CheckBox label={`聽覺：${intent.sensoryAudio.slice(0, 30)}`} value={hitAudio} onChange={(v) => setHitAudio(v)} />}
          {intent.sensoryTactile && <CheckBox label={`觸覺：${intent.sensoryTactile.slice(0, 30)}`} value={hitTactile} onChange={(v) => setHitTactile(v)} />}
          {(intent.emotionTone || intent.emotions.length > 0) && (
            <CheckBox label={`情緒：${intent.emotionTone || intent.emotions.join('、')}`} value={hitEmotional} onChange={(v) => setHitEmotional(v)} />
          )}

          {intent.characters.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p style={{ ...labelStyle, marginBottom: 4 }}>命中的人物</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {intent.characters.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setHitCharacters((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])}
                    style={{
                      padding: '4px 12px', borderRadius: 20, border: '1px solid',
                      borderColor: hitCharacters.includes(c) ? 'var(--accent-default)' : 'var(--border-default)',
                      background: hitCharacters.includes(c) ? 'color-mix(in srgb, var(--accent-default) 15%, transparent)' : 'transparent',
                      color: hitCharacters.includes(c) ? 'var(--accent-default)' : 'var(--text-tertiary)',
                      fontSize: 13, cursor: 'pointer', transition: 'all 150ms',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {intent.symbols.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p style={{ ...labelStyle, marginBottom: 4 }}>命中的意象</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {intent.symbols.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setHitSymbols((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                    style={{
                      padding: '4px 12px', borderRadius: 20, border: '1px solid',
                      borderColor: hitSymbols.includes(s) ? 'var(--accent-default)' : 'var(--border-default)',
                      background: hitSymbols.includes(s) ? 'color-mix(in srgb, var(--accent-default) 15%, transparent)' : 'transparent',
                      color: hitSymbols.includes(s) ? 'var(--accent-default)' : 'var(--text-tertiary)',
                      fontSize: 13, cursor: 'pointer', transition: 'all 150ms',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <p style={labelStyle}>整體命中感（1–5）</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setHitOverall(n)}
                  style={{
                    width: 36, height: 36, borderRadius: 4, border: '1px solid',
                    borderColor: hitOverall === n ? 'var(--accent-default)' : 'var(--border-default)',
                    background: hitOverall === n ? 'color-mix(in srgb, var(--accent-default) 15%, transparent)' : 'transparent',
                    color: hitOverall === n ? 'var(--accent-default)' : 'var(--text-tertiary)',
                    fontSize: 14, cursor: 'pointer', transition: 'all 150ms',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <p style={labelStyle}>早晨備注</p>
            <textarea
              value={hitNotes}
              onChange={(e) => setHitNotes(e.target.value)}
              placeholder="任何與昨晚意圖相關的補充…"
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>
              目前命中率：<span style={{ color: 'var(--accent-default)' }}>{rate}%</span>
            </span>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={primaryBtn}
            >
              {saving ? '儲存中…' : '完成回顧'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Techniques section ────────────────────────────────────────────────────────

interface TechniqueAccordionProps {
  title: string
  badge?: string
  children: React.ReactNode
}

function TechniqueAccordion({ title, badge, children }: TechniqueAccordionProps): JSX.Element {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
          <span style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 16, color: 'var(--text-primary)' }}>{title}</span>
          {badge && (
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'var(--bg-surface)', color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>
              {badge}
            </span>
          )}
        </div>
        <Icon name="arrowRight" size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 200ms' }} />
      </button>
      {open && (
        <div style={{ paddingBottom: 20, color: 'var(--text-secondary)', fontSize: 14.5, lineHeight: 1.85, fontFamily: 'var(--font-serif, serif)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui, system-ui)',
  fontSize: 11.5,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--text-tertiary)',
  marginTop: 0,
  marginBottom: 8,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: 'var(--bg-inset)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 4,
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-serif, serif)',
  fontSize: 15,
  lineHeight: 1.6,
  outline: 'none',
  boxSizing: 'border-box',
}

const primaryBtn: React.CSSProperties = {
  padding: '10px 24px',
  background: 'var(--accent-default)',
  color: 'var(--bg-base)',
  border: 'none',
  borderRadius: 4,
  fontFamily: 'var(--font-ui, system-ui)',
  fontSize: 13,
  letterSpacing: '0.08em',
  cursor: 'pointer',
  transition: 'opacity 150ms',
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Incubation(): JSX.Element {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab | null) ?? 'intent'

  const [tab, setTab] = useState<Tab>(initialTab)
  const [intents, setIntents] = useState<IncubationIntent[]>([])
  const [todayIntent, setTodayIntent] = useState<IncubationIntent | null>(null)
  const [loading, setLoading] = useState(true)
  const [weeklyStats, setWeeklyStats] = useState<{ weekLabel: string; rate: number; count: number }[]>([])
  const [overallRate, setOverallRate] = useState(0)

  // Intent form state
  const [targetScene, setTargetScene] = useState('')
  const [sensoryVisual, setSensoryVisual] = useState('')
  const [sensoryAudio, setSensoryAudio] = useState('')
  const [sensoryTactile, setSensoryTactile] = useState('')
  const [emotionTone, setEmotionTone] = useState('')
  const [emotions, setEmotions] = useState<string[]>([])
  const [characters, setCharacters] = useState<string[]>([])
  const [symbols, setSymbols] = useState<string[]>([])
  const [mildAffirmation, setMildAffirmation] = useState(MILD_SUGGESTIONS[0]!)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [all, today, stats, rate] = await Promise.all([
          incubationRepo.listAll(),
          incubationRepo.getByDate(TODAY),
          incubationRepo.getWeeklyStats(8),
          incubationRepo.getOverallHitRate(),
        ])
        setIntents(all)
        setWeeklyStats(stats)
        setOverallRate(rate)

        if (today) {
          setTodayIntent(today)
          setTargetScene(today.targetScene)
          setSensoryVisual(today.sensoryVisual)
          setSensoryAudio(today.sensoryAudio)
          setSensoryTactile(today.sensoryTactile)
          setEmotionTone(today.emotionTone)
          setEmotions(today.emotions)
          setCharacters(today.characters)
          setSymbols(today.symbols)
          setMildAffirmation(today.mildAffirmation || MILD_SUGGESTIONS[0]!)
        }
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const autoSave = useCallback(async (fields: Partial<Parameters<typeof incubationRepo.update>[1]>): Promise<void> => {
    if (!todayIntent) return
    await incubationRepo.update(todayIntent.id, fields)
    setSavedAt(new Date())
    setTimeout(() => setSavedAt(null), 1500)
  }, [todayIntent])

  function scheduleAutoSave(fields: Parameters<typeof autoSave>[0]): void {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => void autoSave(fields), 800)
  }

  async function handleSaveIntent(): Promise<void> {
    if (!targetScene.trim()) return
    setSaving(true)
    try {
      if (todayIntent) {
        await incubationRepo.update(todayIntent.id, {
          targetScene, sensoryVisual, sensoryAudio, sensoryTactile,
          emotionTone, emotions, characters, symbols, mildAffirmation,
        })
      } else {
        const created = await incubationRepo.create({
          date: TODAY, targetScene, sensoryVisual, sensoryAudio, sensoryTactile,
          emotionTone, emotions, characters, symbols, mildAffirmation,
        })
        setTodayIntent(created)
        setIntents((prev) => [created, ...prev])
      }
      setSavedAt(new Date())
      setTimeout(() => setSavedAt(null), 1500)
    } finally {
      setSaving(false)
    }
  }

  async function handleStartRitual(): Promise<void> {
    let id = todayIntent?.id
    if (!id && targetScene.trim()) {
      const created = await incubationRepo.create({
        date: TODAY, targetScene, sensoryVisual, sensoryAudio, sensoryTactile,
        emotionTone, emotions, characters, symbols, mildAffirmation,
      })
      setTodayIntent(created)
      setIntents((prev) => [created, ...prev])
      id = created.id
    }
    if (id) navigate(`/sleep-ritual/${id}`)
  }

  const reviewedCount = intents.filter((i) => i.reviewed).length

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100dvh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
          載入中
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', flexDirection: 'column', background: 'var(--bg-base)' }}>
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 96 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 0' }}>

          {/* Header */}
          <header style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="seedling" size={18} style={{ color: 'var(--accent-default)' }} />
                <h1 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 22, fontWeight: 400, color: 'var(--text-primary)', margin: 0 }}>
                  夢境孵化
                </h1>
              </div>
              {reviewedCount > 0 && (
                <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>
                  整體命中率 <span style={{ color: 'var(--accent-default)', fontWeight: 500 }}>{Math.round(overallRate * 100)}%</span>
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
              睡前種下意圖的種子，讓夢境依著它生長。
            </p>
          </header>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 0, marginBottom: 32,
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            {(['intent', 'records', 'stats', 'techniques'] as Tab[]).map((t) => {
              const labels: Record<Tab, string> = { intent: '設定意圖', records: '孵化記錄', stats: '命中統計', techniques: '技術教學' }
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  style={{
                    padding: '10px 16px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-ui, system-ui)',
                    fontSize: 13,
                    color: tab === t ? 'var(--accent-default)' : 'var(--text-tertiary)',
                    borderBottom: `2px solid ${tab === t ? 'var(--accent-default)' : 'transparent'}`,
                    marginBottom: -1,
                    transition: 'color 150ms, border-color 150ms',
                    letterSpacing: '0.04em',
                  }}
                >
                  {labels[t]}
                </button>
              )
            })}
          </div>

          {/* ── Tab: 設定意圖 ──────────────────────────────────────── */}
          {tab === 'intent' && (
            <section>
              {savedAt && (
                <div style={{ marginBottom: 16, fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'right', transition: 'opacity 300ms' }}>
                  已儲存
                </div>
              )}

              <div style={{ marginBottom: 22 }}>
                <p style={labelStyle}>今晚的孵化日期</p>
                <p style={{ margin: 0, fontSize: 15, color: 'var(--text-secondary)', fontFamily: 'var(--font-serif, serif)' }}>
                  {format(new Date(), 'yyyy年M月d日 EEEE', { locale: zhTW })}
                </p>
              </div>

              <div style={{ marginBottom: 22 }}>
                <p style={labelStyle}>目標場景 <span style={{ color: 'var(--semantic-danger)' }}>*</span></p>
                <textarea
                  value={targetScene}
                  onChange={(e) => {
                    setTargetScene(e.target.value)
                    scheduleAutoSave({ targetScene: e.target.value })
                  }}
                  placeholder="描述你希望夢到的場景。越具體越好——不是「飛翔」，而是「站在夜晚的山頂，感受到身體緩緩離地…」"
                  rows={5}
                  style={{ ...inputStyle, resize: 'none' }}
                />
                <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-tertiary)' }}>
                  提示：使用現在式、第一人稱、感官細節，讓大腦更容易「相信」這個場景。
                </p>
              </div>

              {/* Sensory details */}
              <div style={{ marginBottom: 22, padding: '18px 20px', background: 'var(--bg-raised)', borderRadius: 6 }}>
                <p style={{ ...labelStyle, marginBottom: 16 }}>感官細節（選填）</p>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ ...labelStyle, fontSize: 11 }}>👁 視覺景象</p>
                  <input
                    value={sensoryVisual}
                    onChange={(e) => { setSensoryVisual(e.target.value); scheduleAutoSave({ sensoryVisual: e.target.value }) }}
                    placeholder="光線顏色、物體形狀、空間遠近感…"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ ...labelStyle, fontSize: 11 }}>👂 聽覺氛圍</p>
                  <input
                    value={sensoryAudio}
                    onChange={(e) => { setSensoryAudio(e.target.value); scheduleAutoSave({ sensoryAudio: e.target.value }) }}
                    placeholder="環境音、音樂、人聲、靜默感…"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ ...labelStyle, fontSize: 11 }}>✋ 觸覺感受</p>
                  <input
                    value={sensoryTactile}
                    onChange={(e) => { setSensoryTactile(e.target.value); scheduleAutoSave({ sensoryTactile: e.target.value }) }}
                    placeholder="溫度、質感、風、重力感…"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <p style={{ ...labelStyle, fontSize: 11 }}>💫 情緒基調</p>
                  <input
                    value={emotionTone}
                    onChange={(e) => { setEmotionTone(e.target.value); scheduleAutoSave({ emotionTone: e.target.value }) }}
                    placeholder="整體情緒氛圍，例如「平靜而充滿力量」…"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Emotion tags */}
              <div style={{ marginBottom: 22 }}>
                <p style={labelStyle}>情緒標籤</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {PRESET_EMOTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmotions((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e])}
                      style={{
                        padding: '5px 14px', borderRadius: 20, border: '1px solid',
                        borderColor: emotions.includes(e) ? 'var(--accent-default)' : 'var(--border-default)',
                        background: emotions.includes(e) ? 'color-mix(in srgb, var(--accent-default) 15%, transparent)' : 'transparent',
                        color: emotions.includes(e) ? 'var(--accent-default)' : 'var(--text-tertiary)',
                        fontSize: 13, cursor: 'pointer', transition: 'all 150ms',
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 22 }}>
                <TagInput label="人物" tags={characters} placeholder="輸入人名後按 Enter" onChange={(v) => { setCharacters(v); scheduleAutoSave({ characters: v }) }} />
              </div>

              <div style={{ marginBottom: 22 }}>
                <TagInput label="意象 / 符號" tags={symbols} placeholder="輸入意象後按 Enter" onChange={(v) => { setSymbols(v); scheduleAutoSave({ symbols: v }) }} />
              </div>

              {/* MILD Affirmation */}
              <div style={{ marginBottom: 32, padding: '18px 20px', background: 'var(--bg-raised)', borderRadius: 6, borderLeft: '2px solid var(--accent-muted)' }}>
                <p style={labelStyle}>MILD 意圖語句</p>
                <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', margin: '0 0 12px', lineHeight: 1.6 }}>
                  入睡前默念 5–10 次。用當下式、第一人稱，明確表達清醒夢的意圖。
                </p>
                <textarea
                  value={mildAffirmation}
                  onChange={(e) => { setMildAffirmation(e.target.value); scheduleAutoSave({ mildAffirmation: e.target.value }) }}
                  rows={3}
                  style={{ ...inputStyle, resize: 'none', fontFamily: 'var(--font-serif, serif)', fontSize: 15, lineHeight: 1.7 }}
                />
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {MILD_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setMildAffirmation(s)}
                      style={{
                        padding: '4px 10px', borderRadius: 4,
                        background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)',
                        color: 'var(--text-tertiary)', fontSize: 11.5, cursor: 'pointer',
                      }}
                    >
                      {s.slice(0, 18)}…
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
                <button
                  type="button"
                  onClick={handleSaveIntent}
                  disabled={saving || !targetScene.trim()}
                  style={{
                    ...primaryBtn,
                    opacity: !targetScene.trim() ? 0.4 : 1,
                    flex: 1,
                  }}
                >
                  {saving ? '儲存中…' : todayIntent ? '更新意圖' : '儲存意圖'}
                </button>
                <button
                  type="button"
                  onClick={handleStartRitual}
                  disabled={!targetScene.trim()}
                  style={{
                    flex: 2,
                    padding: '10px 24px',
                    background: targetScene.trim() ? 'color-mix(in srgb, var(--accent-default) 18%, var(--bg-raised))' : 'var(--bg-raised)',
                    color: targetScene.trim() ? 'var(--accent-default)' : 'var(--text-tertiary)',
                    border: `1px solid ${targetScene.trim() ? 'var(--accent-muted)' : 'var(--border-subtle)'}`,
                    borderRadius: 4,
                    fontFamily: 'var(--font-ui, system-ui)',
                    fontSize: 13,
                    letterSpacing: '0.08em',
                    cursor: targetScene.trim() ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 150ms',
                  }}
                >
                  <Icon name="moon" size={15} />
                  進入入睡儀式
                </button>
              </div>
            </section>
          )}

          {/* ── Tab: 孵化記錄 ──────────────────────────────────────── */}
          {tab === 'records' && (
            <section>
              {intents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-tertiary)' }}>
                  <Icon name="seedling" size={32} style={{ marginBottom: 16, opacity: 0.4 }} />
                  <p style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 16, margin: 0 }}>還沒有孵化記錄</p>
                  <p style={{ fontSize: 13, margin: '8px 0 0' }}>先在「設定意圖」標籤種下今晚的種子</p>
                </div>
              ) : (
                intents.map((intent) => (
                  <ReviewCard
                    key={intent.id}
                    intent={intent}
                    onSave={(updated) => {
                      setIntents((prev) => prev.map((i) => i.id === updated.id ? updated : i))
                      void incubationRepo.getOverallHitRate().then(setOverallRate)
                      void incubationRepo.getWeeklyStats(8).then(setWeeklyStats)
                    }}
                  />
                ))
              )}
            </section>
          )}

          {/* ── Tab: 命中統計 ──────────────────────────────────────── */}
          {tab === 'stats' && (
            <section>
              {reviewedCount === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-tertiary)' }}>
                  <p style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 16, margin: '0 0 8px' }}>數據還不夠多</p>
                  <p style={{ fontSize: 13, margin: 0 }}>完成至少一次孵化回顧，統計圖表就會出現</p>
                </div>
              ) : (
                <>
                  {/* Overview stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 36 }}>
                    {[
                      { label: '整體命中率', value: `${Math.round(overallRate * 100)}%` },
                      { label: '已孵化次數', value: String(intents.length) },
                      { label: '已回顧次數', value: String(reviewedCount) },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding: '16px 14px', background: 'var(--bg-raised)', borderRadius: 6, textAlign: 'center' }}>
                        <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-serif, serif)', fontSize: 24, color: 'var(--accent-default)', fontWeight: 300 }}>{value}</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Weekly chart */}
                  <div style={{ marginBottom: 36 }}>
                    <p style={{ ...labelStyle, marginBottom: 16 }}>週命中率趨勢（近 8 週）</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={weeklyStats} margin={{ top: 8, right: 0, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="hitGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent-default)" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="var(--accent-default)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="weekLabel" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(v: number) => `${Math.round(v * 100)}%`} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} domain={[0, 1]} />
                        <Tooltip
                          formatter={(v: number) => [`${Math.round(v * 100)}%`, '命中率']}
                          contentStyle={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', borderRadius: 4, fontSize: 12 }}
                        />
                        <Area type="monotone" dataKey="rate" stroke="var(--accent-default)" strokeWidth={1.5} fill="url(#hitGrad)" dot={{ fill: 'var(--accent-default)', r: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Per-element breakdown */}
                  {reviewedCount >= 3 && (() => {
                    const reviewed = intents.filter((i) => i.reviewed)
                    const elements = [
                      { key: 'hitScene',    label: '核心場景',  count: reviewed.filter((i) => i.hitScene).length,    total: reviewed.length },
                      { key: 'hitVisual',   label: '視覺細節',  count: reviewed.filter((i) => i.hitVisual && i.sensoryVisual).length,  total: reviewed.filter((i) => i.sensoryVisual).length },
                      { key: 'hitAudio',    label: '聽覺氛圍',  count: reviewed.filter((i) => i.hitAudio && i.sensoryAudio).length,   total: reviewed.filter((i) => i.sensoryAudio).length },
                      { key: 'hitTactile',  label: '觸覺感受',  count: reviewed.filter((i) => i.hitTactile && i.sensoryTactile).length, total: reviewed.filter((i) => i.sensoryTactile).length },
                      { key: 'hitEmotional',label: '情緒基調',  count: reviewed.filter((i) => i.hitEmotional && (i.emotionTone || i.emotions.length > 0)).length, total: reviewed.filter((i) => i.emotionTone || i.emotions.length > 0).length },
                    ].filter((e) => e.total > 0)

                    return (
                      <div>
                        <p style={{ ...labelStyle, marginBottom: 14 }}>各元素命中率</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {elements.map((el) => {
                            const r = el.total > 0 ? el.count / el.total : 0
                            return (
                              <div key={el.key}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{el.label}</span>
                                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{el.count}/{el.total} = {Math.round(r * 100)}%</span>
                                </div>
                                <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-inset)' }}>
                                  <div style={{ height: '100%', borderRadius: 2, width: `${r * 100}%`, background: 'var(--accent-default)', transition: 'width 600ms cubic-bezier(0.2,0,0,1)' }} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}
                </>
              )}
            </section>
          )}

          {/* ── Tab: 技術教學 ──────────────────────────────────────── */}
          {tab === 'techniques' && (
            <section>
              <div style={{ marginBottom: 28, padding: '20px', background: 'var(--bg-raised)', borderRadius: 6, borderLeft: '2px solid var(--accent-muted)' }}>
                <p style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.8, fontStyle: 'italic' }}>
                  「夢境孵化是一門古老的藝術——讓意識在入睡的瞬間，帶著明確的意圖渡入夢境。」
                </p>
              </div>

              <TechniqueAccordion title="什麼是夢境孵化？" badge="入門">
                <p>夢境孵化（Dream Incubation）是指在睡前刻意設定意圖，引導夢境內容朝特定場景或主題發展的實踐。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>歷史根源</strong><br />
                古埃及人將孵夢視為神聖行為，在神廟中的「孵夢室」睡眠以求神明啟示。古希臘的阿斯克勒庇俄斯神廟是當時著名的孵夢聖地，病人在此尋求治癒夢境。許多原住民文化也有系統化的夢境引導儀式。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>現代科學視角</strong><br />
                夢境主要發生在 REM 睡眠期。前瞻記憶（Prospective Memory）研究顯示，睡前的強烈意圖確實能影響夢境內容。神經科學家發現，入睡前的思緒會影響夜間的記憶鞏固，以及 REM 期的神經活動模式。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>孵化 vs 清明夢</strong><br />
                夢境孵化與清明夢是互補的實踐。孵化著重「種下意圖」，清明夢著重「夢中覺知」。兩者結合——在清明夢中有意識地回到孵化的場景——是最進階的應用。</p>
              </TechniqueAccordion>

              <TechniqueAccordion title="意圖設定法" badge="核心技術">
                <p>有效的意圖設定遵循四個原則：</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>1. 具體化，不抽象</strong><br />
                「我想飛翔」不如「我站在懸崖邊，感受到腳下的風，身體緩緩浮起，看見下方的森林」。大腦需要具體的感官線索來建構夢境。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>2. 現在式，第一人稱</strong><br />
                使用「我正在……」而非「我希望……」。這向潛意識傳達一個已經發生的現實，而非願望。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>3. 情緒化</strong><br />
                加入強烈的情緒。場景帶有情緒電荷，大腦在 REM 期更容易激活。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>4. 重複錨定</strong><br />
                一個意圖設定一次遠不夠。整個睡前儀式（書寫、默念、視覺化）都是在重複錨定同一個意圖。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>書寫的力量</strong><br />
                用手寫或打字書寫意圖，比只是想一想效果高 3 倍——這是前瞻記憶研究的結論。書寫行為本身就是一種神經錨定。</p>
              </TechniqueAccordion>

              <TechniqueAccordion title="MILD 技術" badge="Stephen LaBerge">
                <p>MILD（Mnemonic Induction of Lucid Dreams）是史丹佛大學夢境研究者 Stephen LaBerge 博士在 1980 年代開發的方法，也是目前科學研究最充分的清明夢誘導技術之一。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>四個核心步驟</strong></p>
                <p>① <strong style={{ color: 'var(--text-secondary)' }}>設定意圖（Intention）</strong><br />
                在入睡前明確告訴自己：「下次我做夢時，我會意識到我在做夢」。這個意圖要具體、真誠，不只是隨口說說。</p>
                <p>② <strong style={{ color: 'var(--text-secondary)' }}>回憶近期夢境（Memory）</strong><br />
                在腦中重溫你最近記得的夢境。識別其中的「夢境符號」——那些在現實中不會發生的奇特元素。</p>
                <p>③ <strong style={{ color: 'var(--text-secondary)' }}>視覺化（Visualization）</strong><br />
                想像自己回到那個夢境場景，但這次你「意識到」自己在做夢。仔細想像那種清醒的感覺。</p>
                <p>④ <strong style={{ color: 'var(--text-secondary)' }}>入睡前反覆默念（Mantra）</strong><br />
                在快要入睡時，緩慢默念你的意圖語句，直到進入睡眠。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>與 WBTB 結合</strong><br />
                MILD 與 WBTB（清晨回床法）結合效果最佳：睡 5–6 小時後短暫清醒 30 分鐘，閱讀夢境資料，然後帶著 MILD 意圖回床睡眠。此時正是 REM 密集期。</p>
              </TechniqueAccordion>

              <TechniqueAccordion title="視覺化冥想指南" badge="入睡儀式">
                <p>視覺化冥想是夢境孵化的核心工具。目標是在清醒狀態下，盡可能生動地「預演」你希望夢到的場景，讓大腦把它編碼為記憶素材。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>三階段進入法</strong></p>
                <p>① <strong style={{ color: 'var(--text-secondary)' }}>放鬆（2–3 分鐘）</strong><br />
                進行 4-7-8 呼吸或身體掃描。讓肌肉從腳趾到頭皮逐步放鬆。不要試圖「清空腦袋」，而是讓思緒自然放慢。</p>
                <p>② <strong style={{ color: 'var(--text-secondary)' }}>定錨（1 分鐘）</strong><br />
                想像一個你熟悉的、平靜的地方（不一定是孵化場景）。感受那個地方的溫度、質感、氣味。建立穩定的「視覺化基地」。</p>
                <p>③ <strong style={{ color: 'var(--text-secondary)' }}>建構場景（5–10 分鐘）</strong><br />
                從定錨點轉移到你的孵化場景。不要「看」場景，而是「進入」它——感受腳踩的地面、周圍的溫度、空氣的氣味。如果畫面模糊，用觸覺補強。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>超頻效應</strong><br />
                連續多晚視覺化同一個場景，會產生「超頻效應」——大腦的神經路徑被多次激活，場景進入夢境的機率顯著提升。許多孵化實踐者建議至少堅持同一意圖 7 天。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>最佳時間點</strong><br />
                入睡前 15–30 分鐘。太早開始，視覺化完成後清醒時間太長；太晚，進入睡眠前只有幾分鐘。使用本應用的「入睡儀式」功能，它會引導你在合適的節奏下完成視覺化。</p>
              </TechniqueAccordion>

              <TechniqueAccordion title="4-7-8 呼吸法" badge="科學依據">
                <p>4-7-8 呼吸法由安德魯·威爾（Andrew Weil）博士推廣，原理是通過延長呼氣來激活副交感神經系統（「休息與消化」模式），從而降低皮質醇，誘導深層放鬆。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>操作步驟</strong><br />
                ① 完全呼出肺中空氣<br />
                ② 閉口，用鼻子吸氣 4 秒<br />
                ③ 屏住呼吸 7 秒<br />
                ④ 用嘴完全呼出 8 秒（可發出聲音）<br />
                重複 4–5 個循環。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>為什麼在孵化儀式中使用？</strong><br />
                呼吸練習有三個孵化目的：降低焦慮（焦慮會抑制夢境形成）、穩定注意力（讓心智平靜並集中於意圖）、建立儀式感（固定的前置動作能告訴大腦「現在準備做夢了」）。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>替代方案：方形呼吸（4-4-4-4）</strong><br />
                如果 4-7-8 對你太強烈，可以用方形呼吸：吸氣 4 秒、屏息 4 秒、呼氣 4 秒、空息 4 秒。這是許多軍事訓練採用的壓力管理技術，更容易上手。</p>
              </TechniqueAccordion>

              <TechniqueAccordion title="感官錨點技法" badge="進階">
                <p>感官錨點是指在清醒生活中刻意建立特定感官線索，當這些線索在夢中重現時，觸發清醒覺知。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>建立觸發器</strong><br />
                選擇一個在孵化場景中一定會出現的感官元素（例如：某種質感、溫度、聲音）。白天多次主動感受並默念：「當我感覺到____時，我知道我在做夢。」</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>身體掃描入睡法</strong><br />
                入睡時，從腳趾開始，緩慢掃描身體各部位的感覺。這個方法有雙重效果：一是加深放鬆；二是讓意識停留在身體感官層面，更容易帶著感官記憶進入夢境。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>意圖實體化</strong><br />
                有些實踐者會在床頭放置一個與孵化場景相關的物件，睡前觸摸它，最後一個意念就是這個物件。這種實體錨點能強化意圖的神經編碼。</p>
              </TechniqueAccordion>

              <TechniqueAccordion title="命中率解讀與進步曲線">
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>什麼算「命中」？</strong><br />
                任何與你的意圖有關的夢境元素都算命中，不必完全按照想像。如果你設定了「山頂」，夢到「高樓頂層」也有一定命中；若設定了「平靜」的情緒，而夢境確實給你帶來平靜感，也算命中。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>典型進步曲線</strong><br />
                初期（1–2 週）：命中率通常在 20–40%。多數命中是情緒而非具體場景。<br />
                中期（3–6 週）：隨著記錄積累，你開始了解自己的「夢境語言」，命中率上升到 40–60%。<br />
                進階期（2 個月以上）：穩定的儀式 + 清明夢技術結合，命中率可達 60–80%。</p>
                <p><strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>影響命中率的因素</strong><br />
                ① 壓力與睡眠品質：高壓夜晚夢境更混亂，孵化效果下降<br />
                ② 意圖具體程度：越具體的意圖，命中率評估也越精確<br />
                ③ 夢境記錄能力：越能記得夢，越能評估命中率<br />
                ④ 堅持程度：每日記錄比間歇記錄效果好 3 倍以上</p>
              </TechniqueAccordion>

              <div style={{ paddingTop: 32, paddingBottom: 16, textAlign: 'center' }}>
                <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
                  參考資料：LaBerge & Rheingold（1990）、Stumbrys et al.（2012）、Sparrow（2009）
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
