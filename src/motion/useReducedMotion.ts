import { useReducedMotion as useMotionPref } from 'motion/react'

/**
 * Motion already disables transform animations under prefers-reduced-motion,
 * but our custom sequences (count-ups, the line-by-line draft reveal, the
 * stagger delays) are hand-rolled, so they need to ask explicitly.
 */
export function useCalmMotion(): boolean {
  return useMotionPref() ?? false
}
