/**
 * Design tokens — 夜間夢境記錄氛圍
 *
 * 基調：深藍紫黑、霧灰、極低彩度暖琥珀點綴。
 * 嚴格避免：純黑 / 純白 / 預設藍連結色 / 高彩度 / SaaS 美學。
 *
 * 所有 hex 與 px 的原始定義集中於此檔。其他檔案應透過 token 名稱或
 * Tailwind utility 間接使用。
 */

export const color = {
  bg: {
    base: '#0B0E16',
    raised: '#11151F',
    surface: '#171C28',
    overlay: '#0E1219',
    inset: '#080A10',
  },
  border: {
    subtle: '#1C2130',
    default: '#262C3D',
    strong: '#353B50',
    focus: '#6A5A3E',
  },
  text: {
    primary: '#E8E3D5',
    secondary: '#A9A498',
    tertiary: '#6E6A61',
    disabled: '#45433D',
    inverse: '#11151F',
  },
  accent: {
    subtle: '#1F1A10',
    muted: '#5E4E30',
    default: '#C49A5E',
    hover: '#D4AB70',
    contrast: '#0B0E16',
  },
  semantic: {
    success: '#6E8F7A',
    warning: '#B8955E',
    danger: '#A87474',
    info: '#7886A0',
  },
} as const;

export const typography = {
  fontFamily: {
    ui: "-apple-system, BlinkMacSystemFont, 'PingFang TC', 'Microsoft JhengHei', 'Segoe UI', system-ui, sans-serif",
    serif: "'Noto Serif TC', ui-serif, Georgia, 'Songti TC', 'PMingLiU', serif",
    mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
  },
  fontSize: {
    caption: '0.75rem',
    small: '0.8125rem',
    body: '0.9375rem',
    bodyLg: '1.0625rem',
    title: '1.25rem',
    heading: '1.625rem',
    display: '2.125rem',
  },
  lineHeight: {
    tight: '1.2',
    snug: '1.35',
    normal: '1.55',
    relaxed: '1.75',
    loose: '2',
  },
  letterSpacing: {
    tight: '-0.01em',
    normal: '0em',
    wide: '0.04em',
    wider: '0.08em',
  },
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
  },
} as const;

export const spacing = {
  '0': '0px',
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
  '16': '64px',
  '20': '80px',
} as const;

export const radius = {
  none: '0px',
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '10px',
  xl: '14px',
  '2xl': '20px',
  full: '9999px',
} as const;

export const shadow = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.35)',
  md: '0 2px 6px -1px rgba(0, 0, 0, 0.45), 0 1px 2px -1px rgba(0, 0, 0, 0.35)',
  lg: '0 8px 20px -6px rgba(0, 0, 0, 0.55), 0 2px 4px -2px rgba(0, 0, 0, 0.40)',
  inset: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.03)',
  focus: '0 0 0 2px rgba(196, 154, 94, 0.35)',
} as const;

export const motion = {
  duration: {
    instant: '0ms',
    fast: '100ms',
    normal: '150ms',
    medium: '200ms',
    slow: '250ms',
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    linear: 'linear',
  },
} as const;

export const breakpoint = {
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

export const zIndex = {
  base: '0',
  raised: '10',
  sticky: '20',
  overlay: '40',
  modal: '60',
  toast: '80',
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
