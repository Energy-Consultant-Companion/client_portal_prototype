import type { Transition, Variants } from 'motion/react'

/*
 * One place for every duration and easing in the prototype.
 * The design is restrained, so the motion is too: nothing bounces for
 * decoration, and every transform has a reason (it points at where the
 * content came from, or where it went).
 */

export const ease = {
  /** Default. Enters decisively, settles softly. */
  standard: [0.22, 0.61, 0.36, 1],
  /** Leaving the screen — no need to linger. */
  exit: [0.4, 0, 0.2, 1],
  /** Emphasised: the toast hand-offs between the two personas. */
  emphasis: [0.16, 1, 0.3, 1],
} as const

export const duration = {
  /** Hover, tap, dot state change. */
  fast: 0.16,
  /** The workhorse: route change, expand, fade-up. */
  base: 0.24,
  /** Progress fills, count-ups, the AI draft reveal. */
  slow: 0.4,
} as const

/** Progress bars and meters: firm, no overshoot. */
export const springFirm: Transition = {
  type: 'spring',
  stiffness: 240,
  damping: 30,
  mass: 0.8,
}

/** Layout pills (chips, filter tabs) sliding between options. */
export const springPill: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
  mass: 0.6,
}

export const transition = {
  fast: { duration: duration.fast, ease: ease.standard },
  base: { duration: duration.base, ease: ease.standard },
  slow: { duration: duration.slow, ease: ease.standard },
  exit: { duration: duration.fast, ease: ease.exit },
  emphasis: { duration: duration.slow, ease: ease.emphasis },
} satisfies Record<string, Transition>

/** Route change: crossfade with an 8px rise. Chrome stays put. */
export const routeVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: transition.base },
  exit: { opacity: 0, y: -4, transition: transition.exit },
}

/**
 * Lists (documents, deadlines, protocol rows) settle in on mount only —
 * re-renders must not re-stagger, or the app feels twitchy.
 */
export const listVariants: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.024, delayChildren: 0.04 } },
}

export const rowVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: transition.base },
}

/** A row arriving because of something the other persona just did. */
export const arrivalVariants: Variants = {
  initial: { opacity: 0, y: -8, backgroundColor: 'var(--color-brand-surface)' },
  animate: {
    opacity: 1,
    y: 0,
    backgroundColor: 'rgba(0,0,0,0)',
    transition: { ...transition.emphasis, backgroundColor: { duration: 1.6, delay: 0.4 } },
  },
}
