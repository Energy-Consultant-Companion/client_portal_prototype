import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { springPill, transition } from '@/motion/tokens'
import { useCalmMotion } from '@/motion/useReducedMotion'
import { ArrowRightIcon, CheckIcon } from '@/icons'

/*
 * The shared vocabulary. Every measurement here came from get_computed_styles
 * on the artboards — pill buttons are 46px on the consultant side and 52px on
 * the client's primary action, chips are 42px, and the radius is always full.
 */

// ───────────────────────────────────────────────────────────── Eyebrow label

/** The mono, caps, letter-spaced label above nearly every group in the design. */
export function Eyebrow({
  children,
  tone = 'subtle',
  className = '',
}: {
  children: ReactNode
  tone?: 'subtle' | 'muted' | 'fg' | 'brand' | 'error' | 'inverse'
  className?: string
}) {
  const colors = {
    subtle: 'text-fg-subtle',
    muted: 'text-fg-muted',
    fg: 'text-fg',
    brand: 'text-brand',
    error: 'text-feedback-error',
    inverse: 'text-fg-inverse-muted',
  }
  return <div className={`label-caps ${colors[tone]} ${className}`}>{children}</div>
}

// ─────────────────────────────────────────────────────────────────── Buttons

type ButtonVariant = 'primary' | 'dark' | 'secondary' | 'quiet' | 'ghost'

const buttonBase =
  'inline-flex items-center justify-center gap-[9px] rounded-full whitespace-nowrap transition-colors disabled:opacity-40 disabled:pointer-events-none'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-brand-fg font-semibold tracking-tight hover:bg-brand-hover',
  dark: 'bg-fg text-fg-inverse font-semibold tracking-tight hover:bg-[#1d232b]',
  secondary: 'border border-border-strong text-fg font-medium hover:bg-surface-sunken',
  quiet: 'border border-border text-fg-muted hover:bg-surface-sunken hover:text-fg',
  ghost: 'text-fg-muted hover:text-fg',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  arrow,
  onClick,
  disabled,
  className = '',
  type = 'button',
}: {
  children: ReactNode
  variant?: ButtonVariant
  /** md = 46px (app chrome), lg = 52px (the client's one big commitment). */
  size?: 'sm' | 'md' | 'lg'
  arrow?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
}) {
  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-[46px] px-[22px] text-base',
    lg: 'h-[52px] px-[26px] text-base',
  }
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={transition.fast}
      className={`${buttonBase} ${buttonVariants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
      {arrow && <ArrowRightIcon size={15} />}
    </motion.button>
  )
}

// ───────────────────────────────────────────────────────────────────── Chips

/**
 * The 42px pill row used for every single-choice question. The selected fill is
 * a shared layout element, so choosing a different option slides the dark pill
 * across rather than blinking it on somewhere else.
 */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  name,
  size = 'md',
}: {
  options: readonly T[]
  value: T | null
  onChange: (v: T) => void
  /** Must be unique per row — it namespaces the sliding fill. */
  name: string
  size?: 'sm' | 'md'
}) {
  const heights = { sm: 'h-9 px-[16px] text-sm', md: 'h-[42px] px-[20px] text-base' }
  return (
    <div className="flex flex-wrap items-center gap-[10px]">
      {options.map((option) => {
        const selected = option === value
        return (
          <motion.button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            whileTap={{ scale: 0.97 }}
            transition={transition.fast}
            className={`relative shrink-0 rounded-full ${heights[size]} inline-flex items-center justify-center transition-colors ${
              selected
                ? 'text-fg-inverse font-medium'
                : 'border border-border-strong text-fg hover:bg-surface-sunken'
            }`}
          >
            {selected && (
              <motion.span
                layoutId={`chip-${name}`}
                transition={springPill}
                className="absolute inset-0 rounded-full bg-fg"
              />
            )}
            <span className="relative">{option}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

/** Multiple choice — no sliding fill, because more than one can be on. */
export function ChipMulti({
  options,
  value,
  onToggle,
}: {
  options: readonly string[]
  value: string[]
  onToggle: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-[10px]">
      {options.map((option) => {
        const selected = value.includes(option)
        return (
          <motion.button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            whileTap={{ scale: 0.97 }}
            animate={{
              backgroundColor: selected ? 'var(--color-fg)' : 'rgba(0,0,0,0)',
              color: selected ? 'var(--color-fg-inverse)' : 'var(--color-fg)',
            }}
            transition={transition.fast}
            className={`h-[42px] shrink-0 rounded-full px-[20px] text-base ${
              selected ? 'font-medium' : 'border border-border-strong hover:bg-surface-sunken'
            }`}
          >
            {option}
          </motion.button>
        )
      })}
    </div>
  )
}

/** Filter tabs above a table — same idea, smaller, with a count. */
export function FilterTabs({
  options,
  value,
  onChange,
  name,
}: {
  options: { id: string; label: string; count?: string; dot?: 'brand' | 'fg' | 'error'; danger?: boolean }[]
  value: string
  onChange: (id: string) => void
  name: string
}) {
  const dots = { brand: 'bg-brand', fg: 'bg-fg', error: 'bg-feedback-error' }
  return (
    <div className="flex flex-wrap items-center gap-xs">
      {options.map((o) => {
        const selected = o.id === value
        return (
          <motion.button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            whileTap={{ scale: 0.97 }}
            transition={transition.fast}
            className={`relative inline-flex h-[34px] shrink-0 items-center gap-[7px] rounded-full px-[14px] text-sm transition-colors ${
              selected
                ? 'text-fg-inverse font-medium'
                : o.danger
                  ? 'border border-feedback-error-border text-feedback-error hover:bg-feedback-error-surface'
                  : 'border border-border text-fg-muted hover:bg-surface-sunken hover:text-fg'
            }`}
          >
            {selected && (
              <motion.span
                layoutId={`tabs-${name}`}
                transition={springPill}
                className="absolute inset-0 rounded-full bg-fg"
              />
            )}
            {o.dot && !selected && <span className={`relative size-[5px] rounded-full ${dots[o.dot]}`} />}
            <span className="relative">{o.label}</span>
            {o.count && (
              <span
                className={`numeric-mono relative text-2xs ${selected ? 'text-fg-inverse-muted' : 'text-fg-subtle'}`}
              >
                {o.count}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────── Fields

/** A labelled input. The label is the mono caps eyebrow, same as everywhere. */
export function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  className = '',
  type = 'text',
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  hint?: string
  className?: string
  type?: string
}) {
  return (
    <label className={`flex flex-col gap-xs ${className}`}>
      <Eyebrow>{label}</Eyebrow>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-[46px] w-full rounded-md border border-border bg-surface px-[14px] text-base text-fg
                   shadow-[0_1px_2px_rgba(18,22,27,0.06)] transition-colors
                   placeholder:text-fg-subtle hover:border-border-strong focus:border-brand focus:outline-none"
      />
      {hint && <span className="text-sm text-fg-subtle">{hint}</span>}
    </label>
  )
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full rounded-lg border border-border bg-surface px-[18px] py-[16px] text-base
                 leading-[26px] text-fg transition-colors placeholder:text-fg-subtle
                 hover:border-border-strong focus:border-brand focus:outline-none"
    />
  )
}

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="group flex items-center gap-[10px] text-left"
    >
      <motion.span
        animate={{
          backgroundColor: checked ? 'var(--color-fg)' : 'rgba(0,0,0,0)',
          borderColor: checked ? 'var(--color-fg)' : 'var(--color-border-strong)',
        }}
        transition={transition.fast}
        className="flex size-[18px] shrink-0 items-center justify-center rounded-xs border"
      >
        <motion.span
          animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0.6 }}
          transition={transition.fast}
          className="text-fg-inverse"
        >
          <CheckIcon size={12} strokeWidth={2} />
        </motion.span>
      </motion.span>
      <span className={`text-base ${checked ? 'text-fg' : 'text-fg-muted group-hover:text-fg'}`}>
        {label}
      </span>
    </button>
  )
}

/** The Anfragen footer toggle. */
export function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="shrink-0"
    >
      <motion.span
        animate={{ backgroundColor: on ? 'var(--color-brand)' : 'var(--color-border-strong)' }}
        transition={transition.fast}
        className="flex h-[22px] w-[38px] items-center rounded-full p-[2px]"
      >
        <motion.span
          layout
          transition={springPill}
          className="size-[18px] rounded-full bg-surface shadow-[0_1px_2px_rgba(18,22,27,0.2)]"
          style={{ marginLeft: on ? 16 : 0 }}
        />
      </motion.span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────── Status

/**
 * State dot. `laeuft` breathes so „wird gelesen" reads as actually happening —
 * but an endlessly repeating animation is exactly what someone who asked for
 * reduced motion does not want, so it holds still for them.
 */
export function Dot({
  state,
  size = 6,
}: {
  state: 'erledigt' | 'laeuft' | 'kommt' | 'fehlt' | 'brand' | 'muted'
  size?: number
}) {
  const calm = useCalmMotion()
  const style = { width: size, height: size }
  if (state === 'laeuft' || state === 'brand') {
    const pulses = state === 'laeuft' && !calm
    return (
      <span className="relative flex shrink-0 items-center justify-center" style={style}>
        <motion.span
          className="absolute rounded-full bg-brand"
          style={style}
          animate={pulses ? { opacity: [1, 0.45, 1] } : { opacity: 1 }}
          transition={pulses ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
        />
      </span>
    )
  }
  const fills = {
    erledigt: 'bg-fg',
    fehlt: 'bg-feedback-error',
    kommt: 'border border-border-strong',
    muted: 'bg-fg-subtle',
  } as const
  return <span className={`shrink-0 rounded-full ${fills[state]}`} style={style} />
}

/**
 * Who is on it.
 *
 * The same field reads differently on each side of the product: the consultant
 * sees „SIE / KUNDSCHAFT", the client sees „FRAU HELD / SIE". Both views render
 * from one owner value, so they can never drift apart — which is the promise the
 * design makes out loud with „beide Seiten sehen das gleiche".
 */
export function OwnerTag({
  owner,
  note,
  align = 'left',
  audience = 'beraterin',
  separator = ' · ',
}: {
  owner: 'sie' | 'kundschaft' | 'gemeinsam' | 'niemand'
  note?: string
  align?: 'left' | 'right'
  audience?: 'beraterin' | 'kundschaft'
  separator?: string
}) {
  const labels = {
    beraterin: { sie: 'SIE', kundschaft: 'KUNDSCHAFT', gemeinsam: 'GEMEINSAM', niemand: 'NIEMAND' },
    kundschaft: { sie: 'FRAU HELD', kundschaft: 'SIE', gemeinsam: 'GEMEINSAM', niemand: 'NIEMAND' },
  }
  /** The party being addressed is the one that gets the darker treatment. */
  const emphasised = audience === 'beraterin' ? owner === 'sie' : owner === 'kundschaft'
  return (
    <div className={`label-caps text-fg-subtle ${align === 'right' ? 'text-right' : ''}`}>
      <span className={emphasised ? 'text-fg-muted' : undefined}>{labels[audience][owner]}</span>
      {note && (
        <span className={emphasised ? 'text-fg-muted' : undefined}>
          {separator}
          {note}
        </span>
      )}
    </div>
  )
}

/**
 * The segmented bar counting documents (9 slots) or evidence strength (3).
 * Segments fill left to right so an upload visibly advances the run.
 */
export function Meter({
  total,
  filled,
  failed = 0,
  width = 7,
  height = 12,
  gap = 2,
  tone = 'fg',
}: {
  total: number
  filled: number
  /** Trailing segments drawn in the error colour — „2 fehlen". */
  failed?: number
  width?: number
  height?: number
  gap?: number
  tone?: 'fg' | 'inverse'
}) {
  return (
    <span className="inline-flex shrink-0 items-center" style={{ gap }}>
      {Array.from({ length: total }, (_, i) => {
        const isFilled = i < filled
        const isFailed = i >= total - failed
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, scaleY: 0.4 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ ...transition.base, delay: i * 0.03 }}
            className={
              isFilled
                ? tone === 'inverse'
                  ? 'bg-fg-inverse'
                  : 'bg-fg'
                : isFailed
                  ? 'bg-feedback-error'
                  : 'bg-border-strong'
            }
            style={{ width, height, borderRadius: 1 }}
          />
        )
      })}
    </span>
  )
}

/** The multi-step progress bar (3 steps on intake, 6 on a case). */
export function Segments({
  total,
  current,
  width = 176,
  gap = 6,
}: {
  total: number
  /** 1-based. Segments before it are done, this one is brand, rest are idle. */
  current: number
  width?: number
  gap?: number
}) {
  return (
    <span className="inline-flex items-center" style={{ gap }}>
      {Array.from({ length: total }, (_, i) => {
        const done = i + 1 < current
        const active = i + 1 === current
        return (
          <motion.span
            key={i}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ ...transition.slow, delay: i * 0.06 }}
            className={done ? 'bg-fg' : active ? 'bg-brand' : 'bg-border-strong'}
            style={{ width, height: 3, borderRadius: 2 }}
          />
        )
      })}
    </span>
  )
}

/** Small square count badge in the rail. */
export function CountBadge({ value, tone = 'brand' }: { value: number; tone?: 'brand' | 'quiet' }) {
  if (tone === 'quiet') {
    return <span className="numeric-mono w-6 text-right text-2xs text-fg-subtle">{value}</span>
  }
  return (
    <span className="flex h-[18px] w-6 shrink-0 items-center justify-center rounded-xs bg-brand">
      <span className="numeric-mono text-2xs text-brand-fg">{value}</span>
    </span>
  )
}

/** A horizontal rule matching the design's hairlines. */
export function Rule({ className = '' }: { className?: string }) {
  return <div className={`h-px w-full bg-border ${className}`} />
}
