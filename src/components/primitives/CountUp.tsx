import { useEffect, useState } from 'react'
import { animate } from 'motion/react'
import { useCalmMotion } from '@/motion/useReducedMotion'
import { duration, ease } from '@/motion/tokens'

/**
 * Counts up once when it appears. Used for the agent bar's tally and the
 * document counters — the numbers are the headline there, so they earn a beat.
 */
export function CountUp({ to, className = '' }: { to: number; className?: string }) {
  const calm = useCalmMotion()
  const [value, setValue] = useState(calm ? to : 0)

  useEffect(() => {
    if (calm) {
      setValue(to)
      return
    }
    const controls = animate(0, to, {
      duration: duration.slow * 1.6,
      ease: ease.standard,
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [to, calm])

  return <span className={className}>{value}</span>
}
