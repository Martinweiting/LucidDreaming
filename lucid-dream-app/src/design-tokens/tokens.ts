/**
 * Design tokens — 雙主題：燕麥紙本（light）/ 深可可煙燻（dark）
 *
 * 所有顏色值改用 CSS 自訂屬性（custom properties），
 * 實際色碼集中在 src/index.css 的 :root 與 [data-theme='dark'] 區塊。
 * 其他檔案透過 Tailwind utility class 或 token 名稱間接使用，
 * 嚴禁 hardcode hex 色碼。
 */

export const color = {
  bg: {
    base:    'var(--bg-base)',
    raised:  'var(--bg-raised)',
    surface: 'var(--bg-surface)',
    overlay: 'var(--bg-overlay)',
    inset:   'var(--bg-inset)',
  },
  border: {
    subtle:  'var(--border-subtle)',
    default: 'var(--border-default)',
    strong:  'var(--border-strong)',
    focus:   'var(--border-focus)',
  },
  text: {
    primary:   'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    tertiary:  'var(--text-tertiary)',
    disabled:  'var(--text-disabled)',
    inverse:   'var(--text-inverse)',
  },
  accent: {
    subtle:   'var(--accent-subtle)',
    muted:    'var(--accent-muted)',
    default:  'var(--accent-default)',
    hover:    'var(--accent-hover)',
    contrast: 'var(--accent-contrast)',
  },
  semantic: {
    success:   'var(--semantic-success)',
    warning:   'var(--semantic-warning)',
    danger:    'var(--semantic-danger)',
    info:      'var(--semantic-info)',
    nightmare: 'var(--semantic-nightmare)',
    lucid:     'var(--semantic-lucid)',
  },
} as const;

export const typography = {
  fontFamily: {
    ui:    "-apple-system, BlinkMacSystemFont, 'PingFang TC', 'Microsoft JhengHei', 'Segoe UI', system-ui, sans-serif",
    serif: "'Noto Serif TC', ui-serif, Georgia, 'Songti TC', 'PMingLiU', serif",
    mono:  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
  },
  fontSize: {
    caption: '0.75rem',
    small:   '0.8125rem',
    body:    '0.9375rem',
    bodyLg:  '1.0625rem',
    title:   '1.25rem',
    heading: '1.625rem',
    display: '2.125rem',
  },
  lineHeight: {
    tight:   '1.2',
    snug:    '1.35',
    normal:  '1.55',
    relaxed: '1.75',
    loose:   '2',
  },
  letterSpacing: {
    tight:  '-0.01em',
    normal: '0em',
    wide:   '0.04em',
    wider:  '0.08em',
    widest: '0.18em',
    ultra:  '0.24em',
  },
  fontWeight: {
    light:    '300',
    regular:  '400',
    medium:   '500',
    semibold: '600',
  },
} as const;

export const spacing = {
  '0':  '0px',
  '1':  '4px',
  '2':  '8px',
  '3':  '12px',
  '4':  '16px',
  '5':  '20px',
  '6':  '24px',
  '8':  '32px',
  '10': '40px',
  '12': '48px',
  '16': '64px',
  '20': '80px',
} as const;

export const radius = {
  none: '0px',
  xs:   '2px',
  sm:   '4px',
  md:   '6px',
  lg:   '10px',
  xl:   '14px',
  '2xl':'20px',
  full: '9999px',
} as const;

export const shadow = {
  none:  'none',
  sm:    '0 1px 3px 0 rgba(0, 0, 0, 0.12)',
  md:    '0 4px 12px -2px rgba(0, 0, 0, 0.18), 0 1px 3px -1px rgba(0, 0, 0, 0.12)',
  lg:    '0 12px 32px -8px rgba(0, 0, 0, 0.22), 0 2px 6px -2px rgba(0, 0, 0, 0.14)',
  inset: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.04)',
  focus: '0 0 0 2px color-mix(in srgb, var(--accent-default) 35%, transparent)',
} as const;

export const motion = {
  duration: {
    instant: '0ms',
    fast:    '100ms',
    normal:  '150ms',
    medium:  '200ms',
    slow:    '250ms',
  },
  easing: {
    standard:   'cubic-bezier(0.2, 0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    linear:     'linear',
  },
} as const;

export const breakpoint = {
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

export const zIndex = {
  base:    '0',
  raised:  '10',
  sticky:  '20',
  overlay: '40',
  modal:   '60',
  toast:   '80',
} as const;

export const tokens = {
  color,
  typography,
  spacing,
  radius,
  shadow,
  motion,
  breakpoint,
  zIndex,
} as const;

export type Tokens = typeof tokens;
