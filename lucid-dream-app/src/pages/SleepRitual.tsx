import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { incubationRepo } from '../services/incubationRepo'
import { type IncubationIntent } from '../types/incubation'
import BreathingGuide from '../components/BreathingGuide'
import Icon from '../components/ui/Icon'

// ── Phase definitions ─────────────────────────────────────────────────────────

type RitualPhase = 'scene' | 'breathing' | 'affirmation' | 'sleep'

interface PhaseInfo {
  id: RitualPhase
  title: string
  subtitle: string
  durationSeconds: number
}

const PHASES: PhaseInfo[] = [
  { id: 'scene',       title: '場景沉浸',   subtitle: '讓場景在腦海中清晰成形',   durationSeconds: 120 },
  { id: 'breathing',   title: '呼吸放鬆',   subtitle: '4-7-8 呼吸，讓身體沉入深層放鬆', durationSeconds: 95  },
  { id: 'affirmation', title: '意圖錨定',   subtitle: '默念語句，將意圖刻入記憶',  durationSeconds: 60  },
  { id: 'sleep',       title: '進入夢境',   subtitle: '讓意識隨著呼吸緩緩沉入',    durationSeconds: 0   },
]

// ── Scene display – sentence by sentence ─────────────────────────────────────

function tokenizeSentences(text: string): string[] {
  return text
    .split(/[。！？\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

interface SceneDisplayProps {
  intent: IncubationIntent
  active: boolean
}

function SceneDisplay({ intent, active }: SceneDisplayProps): JSX.Element {
  const sentences = [
    intent.targetScene,
    intent.sensoryVisual && `視覺：${intent.sensoryVisual}`,
    intent.sensoryAudio && `聽覺：${intent.sensoryAudio}`,
    intent.sensoryTactile && `觸覺：${intent.sensoryTactile}`,
    intent.emotionTone && `情緒：${intent.emotionTone}`,
  ].filter(Boolean) as string[]

  const allLines = sentences.flatMap(tokenizeSentences)
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!active || allLines.length === 0) return
    const DISPLAY_MS = 4500
    const FADE_MS = 600
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx((i) => (i + 1) % allLines.length)
        setVisible(true)
      }, FADE_MS)
    }, DISPLAY_MS)
    return () => clearInterval(id)
  }, [active, allLines.length])

  if (allLines.length === 0) return <></>

  return (
    <div style={{ textAlign: 'center', padding: '0 24px', maxWidth: 520, margin: '0 auto' }}>
      <p style={{
        fontFamily: 'var(--font-serif, serif)',
        fontSize: 'clamp(18px, 4.5vw, 26px)',
        color: 'var(--text-primary)',
        lineHeight: 1.9,
        fontWeight: 300,
        margin: 0,
        opacity: visible ? 1 : 0,
        transition: 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)',
        letterSpacing: '0.03em',
      }}>
        {allLines[idx]}
      </p>
      {(intent.characters.length > 0 || intent.symbols.length > 0) && (
        <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, opacity: 0.55 }}>
          {[...intent.characters, ...intent.symbols].map((item) => (
            <span key={item} style={{
              fontSize: 12,
              padding: '3px 10px',
              borderRadius: 20,
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-tertiary)',
              letterSpacing: '0.06em',
            }}>
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Affirmation display ───────────────────────────────────────────────────────

interface AffirmationDisplayProps {
  text: string
  active: boolean
}

function AffirmationDisplay({ text, active }: AffirmationDisplayProps): JSX.Element {
  const [pulse, setPulse] = useState(true)

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setPulse((v) => !v), 4000)
    return () => clearInterval(id)
  }, [active])

  return (
    <div style={{ textAlign: 'center', padding: '0 32px', maxWidth: 480, margin: '0 auto' }}>
      <p style={{
        fontFamily: 'var(--font-serif, serif)',
        fontSize: 'clamp(17px, 4vw, 24px)',
        color: 'var(--accent-default)',
        lineHeight: 2,
        fontWeight: 300,
        letterSpacing: '0.05em',
        margin: 0,
        opacity: pulse ? 0.9 : 0.45,
        transition: 'opacity 3500ms cubic-bezier(0.4, 0, 0.6, 1)',
      }}>
        {text || '今晚我將清醒地意識到自己在做夢'}
      </p>
      <p style={{ marginTop: 24, fontSize: 13, color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>
        輕閉雙眼，在心中緩緩默念
      </p>
    </div>
  )
}

// ── Progress dot indicator ────────────────────────────────────────────────────

interface PhaseDotsProps {
  current: RitualPhase
}

function PhaseDots({ current }: PhaseDotsProps): JSX.Element {
  const currentIdx = PHASES.findIndex((p) => p.id === current)
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {PHASES.map((p, i) => (
        <div
          key={p.id}
          style={{
            width: i === currentIdx ? 20 : 6,
            height: 6,
            borderRadius: 3,
            background: i <= currentIdx ? 'var(--accent-default)' : 'var(--border-subtle)',
            transition: 'all 300ms cubic-bezier(0.2, 0, 0, 1)',
            opacity: i < currentIdx ? 0.4 : 1,
          }}
        />
      ))}
    </div>
  )
}

// ── Timer bar ─────────────────────────────────────────────────────────────────

interface TimerBarProps {
  durationSeconds: number
  running: boolean
  onComplete: () => void
}

function TimerBar({ durationSeconds, running, onComplete }: TimerBarProps): JSX.Element {
  const [elapsed, setElapsed] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    setElapsed(0)
  }, [durationSeconds])

  useEffect(() => {
    if (!running || durationSeconds === 0) return
    const id = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= durationSeconds) {
          clearInterval(id)
          setTimeout(() => onCompleteRef.current(), 100)
          return durationSeconds
        }
        return e + 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, durationSeconds])

  const progress = durationSeconds > 0 ? elapsed / durationSeconds : 0
  const remaining = Math.max(0, durationSeconds - elapsed)
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  if (durationSeconds === 0) return <></>

  return (
    <div style={{ width: '100%', maxWidth: 320, margin: '0 auto' }}>
      <div style={{ height: 2, borderRadius: 1, background: 'var(--border-subtle)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progress * 100}%`,
          borderRadius: 1,
          background: 'var(--accent-muted)',
          transition: 'width 1s linear',
        }} />
      </div>
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', margin: '8px 0 0', letterSpacing: '0.12em', fontVariantNumeric: 'tabular-nums' }}>
        {mins}:{secs.toString().padStart(2, '0')}
      </p>
    </div>
  )
}

// ── Sleep phase ───────────────────────────────────────────────────────────────

interface SleepPhaseProps {
  intent: IncubationIntent
  onExit: () => void
}

function SleepPhaseDisplay({ intent, onExit }: SleepPhaseProps): JSX.Element {
  const [dimmed, setDimmed] = useState(false)

  return (
    <div style={{ textAlign: 'center', padding: '0 32px', maxWidth: 440, margin: '0 auto' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'radial-gradient(circle at 40% 35%, var(--accent-subtle), transparent)',
        margin: '0 auto 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: dimmed ? 0.2 : 0.7,
        transition: 'opacity 2s ease-in-out',
      }}>
        <Icon name="moon" size={28} style={{ color: 'var(--accent-muted)' }} />
      </div>

      <p style={{
        fontFamily: 'var(--font-serif, serif)',
        fontSize: 'clamp(20px, 4.5vw, 28px)',
        fontWeight: 300,
        color: 'var(--text-primary)',
        margin: '0 0 12px',
        letterSpacing: '0.04em',
      }}>
        祝你好夢
      </p>
      <p style={{ fontSize: 14, color: 'var(--text-tertiary)', margin: '0 0 8px', lineHeight: 1.7 }}>
        讓螢幕自動變暗，合上眼睛
      </p>
      <p style={{ fontSize: 13.5, fontFamily: 'var(--font-serif, serif)', color: 'var(--text-secondary)', margin: '0 0 40px', lineHeight: 1.9, fontStyle: 'italic' }}>
        「{intent.targetScene.slice(0, 50)}{intent.targetScene.length > 50 ? '…' : ''}」
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setDimmed(true)}
          style={{
            padding: '12px 32px',
            background: 'color-mix(in srgb, var(--accent-default) 15%, transparent)',
            border: '1px solid var(--accent-muted)',
            borderRadius: 4,
            color: 'var(--accent-default)',
            fontFamily: 'var(--font-ui, system-ui)',
            fontSize: 13,
            letterSpacing: '0.08em',
            cursor: 'pointer',
          }}
        >
          降低螢幕亮度
        </button>
        <button
          type="button"
          onClick={onExit}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12.5, color: 'var(--text-tertiary)', letterSpacing: '0.06em',
            padding: '8px',
          }}
        >
          結束儀式，返回
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SleepRitual(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [intent, setIntent] = useState<IncubationIntent | null>(null)
  const [loading, setLoading] = useState(true)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [timerKey, setTimerKey] = useState(0)
  const [breathingDone, setBreathingDone] = useState(false)

  useEffect(() => {
    async function load(): Promise<void> {
      if (!id) { navigate('/incubation'); return }
      const found = await incubationRepo.get(id)
      if (!found) { navigate('/incubation'); return }
      setIntent(found)
      setLoading(false)
    }
    void load()
  }, [id, navigate])

  const currentPhase = PHASES[phaseIdx]!

  const advancePhase = useCallback(() => {
    setPhaseIdx((i) => Math.min(i + 1, PHASES.length - 1))
    setTimerKey((k) => k + 1)
  }, [])

  function handleExit(): void {
    navigate('/incubation')
  }

  if (loading || !intent) {
    return (
      <div style={{ display: 'flex', minHeight: '100dvh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
          準備儀式中
        </p>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
    }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        flexShrink: 0,
      }}>
        <PhaseDots current={currentPhase.id} />
        <button
          type="button"
          onClick={handleExit}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-tertiary)', padding: 4,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
          aria-label="退出儀式"
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      {/* Phase header */}
      <div style={{ textAlign: 'center', padding: '24px 24px 16px', flexShrink: 0 }}>
        <p style={{
          fontFamily: 'var(--font-ui, system-ui)',
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--text-tertiary)',
          margin: '0 0 8px',
        }}>
          第 {phaseIdx + 1} 階段 / {PHASES.length}
        </p>
        <h2 style={{
          fontFamily: 'var(--font-serif, serif)',
          fontSize: 'clamp(20px, 5vw, 28px)',
          fontWeight: 300,
          color: 'var(--text-primary)',
          margin: '0 0 6px',
          letterSpacing: '0.04em',
        }}>
          {currentPhase.title}
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.5 }}>
          {currentPhase.subtitle}
        </p>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
        {currentPhase.id === 'scene' && (
          <SceneDisplay intent={intent} active={true} />
        )}

        {currentPhase.id === 'breathing' && (
          <BreathingGuide
            patternKey="478"
            totalCycles={5}
            autoStart={true}
            onComplete={() => setBreathingDone(true)}
          />
        )}

        {currentPhase.id === 'affirmation' && (
          <AffirmationDisplay text={intent.mildAffirmation} active={true} />
        )}

        {currentPhase.id === 'sleep' && (
          <SleepPhaseDisplay intent={intent} onExit={handleExit} />
        )}
      </div>

      {/* Bottom controls */}
      {currentPhase.id !== 'sleep' && (
        <div style={{
          flexShrink: 0,
          padding: '16px 24px',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          {currentPhase.id !== 'breathing' && (
            <TimerBar
              key={timerKey}
              durationSeconds={currentPhase.durationSeconds}
              running={true}
              onComplete={advancePhase}
            />
          )}

          {currentPhase.id === 'breathing' && breathingDone && (
            <button
              type="button"
              onClick={advancePhase}
              style={{
                padding: '12px 40px',
                background: 'color-mix(in srgb, var(--accent-default) 15%, transparent)',
                border: '1px solid var(--accent-muted)',
                borderRadius: 4,
                color: 'var(--accent-default)',
                fontFamily: 'var(--font-ui, system-ui)',
                fontSize: 13,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
            >
              繼續下一階段
            </button>
          )}

          <button
            type="button"
            onClick={advancePhase}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'var(--text-tertiary)', letterSpacing: '0.08em',
              padding: '6px',
              opacity: 0.7,
            }}
          >
            跳過此階段 →
          </button>
        </div>
      )}
    </div>
  )
}
