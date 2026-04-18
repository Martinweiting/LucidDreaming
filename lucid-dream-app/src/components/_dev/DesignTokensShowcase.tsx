import { Link } from 'react-router-dom';
import {
  color,
  typography,
  spacing,
  radius,
  shadow,
  motion,
  zIndex,
} from '../../design-tokens/tokens';

interface DesignTokensShowcaseProps {
  readonly title?: string;
}

export default function DesignTokensShowcase({
  title = '設計 Token 總覽',
}: DesignTokensShowcaseProps): JSX.Element {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10 flex flex-col gap-3 border-b border-subtle pb-6">
        <p className="text-caption uppercase tracking-wider text-tertiary">開發用 · /dev/tokens</p>
        <h1 className="font-serif text-display font-light text-primary">{title}</h1>
        <p className="font-serif text-body text-secondary">
          此頁呈現目前所有設計 token。正式路由不會出現此頁面。
        </p>
        <Link
          to="/"
          className="mt-2 inline-flex min-h-touch items-center text-small text-accent-default transition-colors duration-normal hover:text-accent-hover"
        >
          ← 返回首頁
        </Link>
      </header>

      <Section heading="色彩 — 背景與表面">
        <Swatches entries={Object.entries(color.bg).map(([k, v]) => [`bg.${k}`, v])} />
      </Section>

      <Section heading="色彩 — 邊框">
        <Swatches entries={Object.entries(color.border).map(([k, v]) => [`border.${k}`, v])} />
      </Section>

      <Section heading="色彩 — 文字">
        <Swatches
          entries={Object.entries(color.text).map(([k, v]) => [`text.${k}`, v])}
          textSample
        />
      </Section>

      <Section heading="色彩 — 強調（唯一）">
        <Swatches entries={Object.entries(color.accent).map(([k, v]) => [`accent.${k}`, v])} />
      </Section>

      <Section heading="色彩 — 語意">
        <Swatches entries={Object.entries(color.semantic).map(([k, v]) => [`semantic.${k}`, v])} />
      </Section>

      <Section heading="字體家族">
        <div className="space-y-4">
          <TypographyRow label="font-ui" cls="font-ui text-bodyLg" sample="系統介面文字 UI text" />
          <TypographyRow
            label="font-serif"
            cls="font-serif text-bodyLg"
            sample="內文以 Noto Serif TC 呈現，適合長段落的夢境書寫與閱讀。"
          />
          <TypographyRow
            label="font-mono"
            cls="font-mono text-body"
            sample="mono 僅保留給程式碼或 debug"
          />
        </div>
      </Section>

      <Section heading="字級階梯">
        <div className="space-y-3">
          {(Object.keys(typography.fontSize) as (keyof typeof typography.fontSize)[]).map((k) => (
            <div key={k} className="flex items-baseline gap-4 border-b border-subtle pb-3">
              <span className="w-24 shrink-0 font-mono text-caption text-tertiary">{k}</span>
              <span
                className={`font-serif text-primary ${fontSizeClass(k)}`}
              >
                昨夜我在浮空的城市裡行走
              </span>
              <span className="ml-auto font-mono text-caption text-tertiary">
                {typography.fontSize[k]}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section heading="字重">
        <div className="space-y-2">
          <WeightRow weight="light" />
          <WeightRow weight="regular" />
          <WeightRow weight="medium" />
          <WeightRow weight="semibold" />
        </div>
      </Section>

      <Section heading="行高與字距">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-md border border-subtle bg-raised p-4">
            <p className="mb-2 font-mono text-caption text-tertiary">lineHeight.normal</p>
            <p className="font-serif text-body text-primary">
              這是一段示範文字，用來檢視預設的 line-height 是否適合夢境描述的長段落閱讀節奏。
            </p>
          </div>
          <div className="rounded-md border border-subtle bg-raised p-4">
            <p className="mb-2 font-mono text-caption text-tertiary">lineHeight.relaxed</p>
            <p className="font-serif text-body text-primary leading-relaxed">
              這是一段示範文字，用來檢視預設的 line-height 是否適合夢境描述的長段落閱讀節奏。
            </p>
          </div>
        </div>
      </Section>

      <Section heading="間距刻度">
        <div className="space-y-2">
          {(Object.keys(spacing) as (keyof typeof spacing)[]).map((k) => (
            <div key={k} className="flex items-center gap-3">
              <span className="w-10 shrink-0 font-mono text-caption text-tertiary">{k}</span>
              <span className="font-mono text-caption text-tertiary">{spacing[k]}</span>
              <span
                className="h-2 bg-accent-muted"
                style={{ width: spacing[k] }}
                aria-hidden
              />
            </div>
          ))}
        </div>
      </Section>

      <Section heading="圓角">
        <div className="flex flex-wrap gap-4">
          {(Object.keys(radius) as (keyof typeof radius)[]).map((k) => (
            <div key={k} className="flex flex-col items-center gap-2">
              <div
                className="h-16 w-16 border border-subtle bg-surface"
                style={{ borderRadius: radius[k] }}
                aria-hidden
              />
              <span className="font-mono text-caption text-tertiary">{k}</span>
              <span className="font-mono text-caption text-tertiary">{radius[k]}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section heading="陰影（夜間低對比）">
        <div className="flex flex-wrap gap-6">
          {(Object.keys(shadow) as (keyof typeof shadow)[]).map((k) => (
            <div key={k} className="flex flex-col items-center gap-2">
              <div
                className="flex h-20 w-28 items-center justify-center rounded-md bg-raised font-mono text-caption text-tertiary"
                style={{ boxShadow: shadow[k] }}
              >
                {k}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section heading="動畫 — duration 與 easing">
        <div className="space-y-3">
          {(Object.keys(motion.duration) as (keyof typeof motion.duration)[]).map((k) => (
            <HoverDemo key={k} duration={motion.duration[k]} label={`duration.${k}`} />
          ))}
        </div>
        <p className="mt-4 text-small text-tertiary">
          所有 duration 均 ≤ 250ms。
        </p>
      </Section>

      <Section heading="z-index 階層">
        <div className="space-y-2">
          {(Object.keys(zIndex) as (keyof typeof zIndex)[]).map((k) => (
            <div key={k} className="flex items-center gap-4">
              <span className="w-24 shrink-0 font-mono text-caption text-tertiary">z.{k}</span>
              <span className="font-mono text-caption text-secondary">{zIndex[k]}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section heading="互動元件示範">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="min-h-touch min-w-touch rounded-md border border-strong bg-surface px-4 py-2 text-body text-primary transition-colors duration-normal hover:border-focus hover:bg-raised"
          >
            次要按鈕
          </button>
          <button
            type="button"
            className="min-h-touch min-w-touch rounded-md bg-accent-default px-4 py-2 text-body font-medium text-accent-contrast transition-colors duration-normal hover:bg-accent-hover"
          >
            主要按鈕
          </button>
          <button
            type="button"
            className="min-h-touch min-w-touch rounded-md px-4 py-2 text-body text-secondary transition-colors duration-normal hover:text-primary"
          >
            文字按鈕
          </button>
          <input
            type="text"
            placeholder="輸入夢境關鍵字…"
            className="min-h-touch rounded-md border border-default bg-overlay px-3 py-2 text-body text-primary placeholder:text-tertiary focus:border-focus"
          />
        </div>
      </Section>
    </main>
  );
}

interface SectionProps {
  readonly heading: string;
  readonly children: React.ReactNode;
}

function Section({ heading, children }: SectionProps): JSX.Element {
  return (
    <section className="mb-12">
      <h2 className="mb-4 font-serif text-title font-medium text-primary">{heading}</h2>
      {children}
    </section>
  );
}

type SwatchEntry = readonly [string, string];

interface SwatchesProps {
  readonly entries: ReadonlyArray<SwatchEntry>;
  readonly textSample?: boolean;
}

function Swatches({ entries, textSample = false }: SwatchesProps): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {entries.map(([name, value]) => (
        <div
          key={name}
          className="overflow-hidden rounded-md border border-subtle bg-raised"
        >
          <div
            className="h-16 w-full border-b border-subtle"
            style={textSample ? { backgroundColor: color.bg.raised } : { backgroundColor: value }}
          >
            {textSample && (
              <div
                className="flex h-full items-center justify-center font-serif text-body"
                style={{ color: value }}
              >
                夢境文字
              </div>
            )}
          </div>
          <div className="px-3 py-2">
            <p className="font-mono text-caption text-secondary">{name}</p>
            <p className="font-mono text-caption text-tertiary">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

interface TypographyRowProps {
  readonly label: string;
  readonly cls: string;
  readonly sample: string;
}

function TypographyRow({ label, cls, sample }: TypographyRowProps): JSX.Element {
  return (
    <div className="flex items-baseline gap-4 border-b border-subtle pb-3">
      <span className="w-24 shrink-0 font-mono text-caption text-tertiary">{label}</span>
      <span className={`${cls} text-primary`}>{sample}</span>
    </div>
  );
}

interface WeightRowProps {
  readonly weight: 'light' | 'regular' | 'medium' | 'semibold';
}

function WeightRow({ weight }: WeightRowProps): JSX.Element {
  const weightMap: Record<WeightRowProps['weight'], string> = {
    light: 'font-light',
    regular: 'font-regular',
    medium: 'font-medium',
    semibold: 'font-semibold',
  };
  return (
    <div className="flex items-baseline gap-4">
      <span className="w-24 shrink-0 font-mono text-caption text-tertiary">{weight}</span>
      <span className={`font-serif text-bodyLg text-primary ${weightMap[weight]}`}>
        月光下的夢境書寫
      </span>
    </div>
  );
}

interface HoverDemoProps {
  readonly duration: string;
  readonly label: string;
}

function HoverDemo({ duration, label }: HoverDemoProps): JSX.Element {
  return (
    <div className="flex items-center gap-4">
      <span className="w-28 shrink-0 font-mono text-caption text-tertiary">{label}</span>
      <span className="font-mono text-caption text-tertiary">{duration}</span>
      <div
        className="group h-8 w-40 cursor-pointer overflow-hidden rounded-md border border-subtle bg-overlay"
        style={{ transitionDuration: duration }}
      >
        <div
          className="h-full w-0 bg-accent-muted transition-[width] group-hover:w-full"
          style={{ transitionDuration: duration, transitionTimingFunction: motion.easing.standard }}
          aria-hidden
        />
      </div>
      <span className="text-caption text-tertiary">滑過觀察</span>
    </div>
  );
}

function fontSizeClass(key: keyof typeof typography.fontSize): string {
  const map: Record<keyof typeof typography.fontSize, string> = {
    caption: 'text-caption',
    small: 'text-small',
    body: 'text-body',
    bodyLg: 'text-bodyLg',
    title: 'text-title',
    heading: 'text-heading',
    display: 'text-display',
  };
  return map[key];
}
