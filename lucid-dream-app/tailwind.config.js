import {
  color,
  typography,
  spacing,
  radius,
  shadow,
  motion,
  breakpoint,
  zIndex,
} from './src/design-tokens/tokens.ts';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      sm: breakpoint.sm,
      md: breakpoint.md,
      lg: breakpoint.lg,
      xl: breakpoint.xl,
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      bg: color.bg,
      border: color.border,
      text: color.text,
      accent: color.accent,
      semantic: color.semantic,
    },
    fontFamily: {
      ui: typography.fontFamily.ui.split(',').map((s) => s.trim()),
      serif: typography.fontFamily.serif.split(',').map((s) => s.trim()),
      mono: typography.fontFamily.mono.split(',').map((s) => s.trim()),
    },
    fontSize: {
      caption: [typography.fontSize.caption, { lineHeight: typography.lineHeight.snug }],
      small: [typography.fontSize.small, { lineHeight: typography.lineHeight.normal }],
      body: [typography.fontSize.body, { lineHeight: typography.lineHeight.normal }],
      bodyLg: [typography.fontSize.bodyLg, { lineHeight: typography.lineHeight.relaxed }],
      title: [typography.fontSize.title, { lineHeight: typography.lineHeight.snug }],
      heading: [typography.fontSize.heading, { lineHeight: typography.lineHeight.snug }],
      display: [typography.fontSize.display, { lineHeight: typography.lineHeight.tight }],
    },
    fontWeight: typography.fontWeight,
    letterSpacing: typography.letterSpacing,
    lineHeight: typography.lineHeight,
    spacing,
    borderRadius: radius,
    boxShadow: shadow,
    transitionDuration: motion.duration,
    transitionTimingFunction: motion.easing,
    zIndex,
    extend: {
      backgroundColor: ({ theme }) => ({
        surface: theme('colors.bg.surface'),
        base: theme('colors.bg.base'),
        raised: theme('colors.bg.raised'),
        overlay: theme('colors.bg.overlay'),
      }),
      textColor: ({ theme }) => ({
        primary: theme('colors.text.primary'),
        secondary: theme('colors.text.secondary'),
        tertiary: theme('colors.text.tertiary'),
        disabled: theme('colors.text.disabled'),
      }),
      borderColor: ({ theme }) => ({
        DEFAULT: theme('colors.border.default'),
        subtle: theme('colors.border.subtle'),
        strong: theme('colors.border.strong'),
        focus: theme('colors.border.focus'),
      }),
      minHeight: {
        touch: '44px',
        screen: '100dvh',
      },
      minWidth: {
        touch: '44px',
      },
      height: {
        screen: '100dvh',
      },
    },
  },
  plugins: [],
};
