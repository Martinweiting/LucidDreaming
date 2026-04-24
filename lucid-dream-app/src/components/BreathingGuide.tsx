import { useEffect, useRef, useState } from 'react'

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out'

interface PhaseConfig {
  phase: BreathPhase
  duration: number
  label: string
  scale: number
}

interface BreathPattern {
  name: string
  phases: PhaseConfig[]
}

const PATTERNS: Record<string, BreathPattern> = {
  '478': {
    name: '4-7-8 放鬆法',
    phases: [
      { phase: 'inhale',   duration: 4, label: '吸氣', scale: 1    },
      { phase: 'hold-in',  duration: 7, label: '屏息', scale: 1    },
      { phase: 'exhale',   duration: 8, label: '呼氣', scale: 0.38 },
    ],
  },
  box: {
    name: '方形呼吸',
    phases: [
      { phase: 'inhale',    duration: 4, label: '吸氣', scale: 1    },
      { phase: 'hold-in',   duration: 4, label: '屏息', scale: 1    },
      { phase: 'exhale',    duration: 4, label: '呼氣', scale: 0.38 },
      { phase: 'hold-out',  duration: 4, label: '空息', scale: 0.38 },
    ],
  },
}

interface BreathingGuideProps {
  patternKey?: '478' | 'box'
  totalCycles?: number
  onComplete?: () => void
  autoStart?: boolean
}

export default function BreathingGuide({
  patternKey = '478',
  totalCycles = 5,
  onComplete,
  autoStart = true,
}: BreathingGuideProps): JSX.Element {
  const pattern = PATTERNS[patternKey]
  const [running, setRunning] = useState(autoStart)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(pattern.phases[0]!.duration)
  const [cycle, setCycle] = useState(1)
  const [done, setDone] = useState(false)

  const phaseIdxRef = useRef(phaseIdx)
  const secondsRef  = useRef(secondsLeft)
  const cycleRef    = useRef(cycle)
  phaseIdxRef.current = phaseIdx
  secondsRef.current  = secondsLeft
  cycleRef.current    = cycle

  useEffect(() => {
    if (!running || done) return

    const id = setInterval(() => {
      const secs  = secondsRef.current - 1
      const pIdx  = phaseIdxRef.current
      const cyc   = cycleRef.current
      const phases = pattern.phases

      if (secs > 0) {
        setSecondsLeft(secs)
        return
      }

      const nextPhaseIdx = (pIdx + 1) % phases.length
      const completedCycle = nextPhaseIdx === 0

      if (completedCycle) {
        if (cyc >= totalCycles) {
          setDone(true)
          setRunning(false)
          clearInterval(id)
          onComplete?.()
          return
        }
        setCycle(cyc + 1)
      }

      setPhaseIdx(nextPhaseIdx)
      setSecondsLeft(phases[nextPhaseIdx]!.duration)
    }, 1000)

    return () => clearInterval(id)
  }, [running, done, pattern, totalCycles, onComplete])

  const currentPhase = pattern.phases[phaseIdx]!
  const progress = 1 - (secondsLeft - 1) / currentPhase.duration

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
      {/* Pattern selector */}
      <div style={{ display: 'flex', gap: 8 }}>
        {Object.entries(PATTERNS).map(([key, p]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              if (running) return
              setPhaseIdx(0)
              setSecondsLeft(PATTERNS[key]!.phases[0]!.duration)
              setCycle(1)
              setDone(false)
            }}
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              border: '1px solid',
              borderColor: patternKey === key ? 'var(--accent-default)' : 'var(--border-subtle)',
              background: patternKey === key
                ? 'color-mix(in srgb, var(--accent-default) 15%, transparent)'
                : 'transparent',
              color: patternKey === key ? 'var(--accent-default)' : 'var(--text-tertiary)',
              fontSize: 12,
              letterSpacing: '0.06em',
              cursor: running ? 'default' : 'pointer',
              transition: 'all 150ms cubic-bezier(0.2,0,0,1)',
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Breathing orb */}
      <div style={{ position: 'relative', width: 160, height: 160 }}>
        {/* Outer ring progress */}
        <svg
          viewBox="0 0 160 160"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
        >
          <circle
            cx="80" cy="80" r="74"
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="2"
          />
          <circle
            cx="80" cy="80" r="74"
            fill="none"
            stroke="var(--accent-muted)"
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 74}`}
            strokeDashoffset={`${2 * Math.PI * 74 * (1 - progress)}`}
            style={{ transition: `stroke-dashoffset ${running ? '1s linear' : '0s'}` }}
          />
        </svg>

        {/* Breathing circle */}
        <div
          style={{
            position: 'absolute',
            inset: 12,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 35%, var(--accent-subtle), color-mix(in srgb, var(--accent-muted) 40%, var(--bg-surface)))',
            transform: `scale(${done ? 0.38 : currentPhase.scale})`,
            transition: `transform ${currentPhase.duration}s ${
              currentPhase.phase === 'inhale' ? 'cubic-bezier(0.4, 0, 0.2, 1)' : 'cubic-bezier(0.4, 0, 0.6, 1)'
            }`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{
            fontFamily: 'var(--font-ui, system-ui)',
            fontSize: 28,
            fontWeight: 200,
            color: 'var(--accent-default)',
            opacity: 0.85,
            transition: 'opacity 300ms',
          }}>
            {done ? '✓' : secondsLeft}
          </span>
        </div>
      </div>

      {/* Phase label */}
      <div style={{ textAlign: 'center', minHeight: 48 }}>
        {done ? (
          <p style={{ fontFamily: 'var(--font-serif, serif)', fontSize: 18, color: 'var(--text-secondary)', margin: 0 }}>
            呼吸練習完成
          </p>
        ) : (
          <>
            <p style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: 22,
              color: 'var(--text-primary)',
              margin: '0 0 4px',
              transition: 'opacity 200ms',
            }}>
              {currentPhase.label}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0, letterSpacing: '0.12em' }}>
              第 {cycle} 輪，共 {totalCycles} 輪
            </p>
          </>
        )}
      </div>

      {/* Start / Pause button */}
      {!done && (
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          style={{
            padding: '10px 28px',
            border: '1px solid var(--border-default)',
            borderRadius: 4,
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-ui, system-ui)',
            fontSize: 13,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            transition: 'all 150ms cubic-bezier(0.2,0,0,1)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)' }}
        >
          {running ? '暫停' : '開始'}
        </button>
      )}
    </div>
  )
}
