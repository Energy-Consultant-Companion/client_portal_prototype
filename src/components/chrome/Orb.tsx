import { GemSmoke } from '@paper-design/shaders-react'
import { useCalmMotion } from '@/motion/useReducedMotion'

/*
 * The iridescent sphere that stands for the agent. It is the one place in an
 * otherwise ink-and-paper interface where something is alive, which is exactly
 * the point: it appears next to text the system wrote, never next to Katrin's.
 *
 * Same shader and parameters as the design file, so it matches frame for frame.
 */
export function Orb({ size = 22 }: { size?: number }) {
  const calm = useCalmMotion()

  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-clip rounded-full bg-black"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <GemSmoke
        speed={calm ? 0 : 1}
        size={0.8}
        outerDistortion={0.8}
        innerDistortion={1}
        outerGlow={0}
        innerGlow={1}
        offset={0}
        scale={1}
        angle={0}
        shape="circle"
        colorInner="#080234"
        colors={['#4435FF', '#30B092', '#FFFFFF']}
        colorBack="#00000000"
        style={{ width: size, height: size }}
      />
    </span>
  )
}
