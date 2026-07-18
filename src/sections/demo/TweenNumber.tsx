import { useEffect, useRef } from 'react'
import { animate, useMotionValue, useReducedMotion } from 'framer-motion'

interface TweenNumberProps {
  /** Target value — tweens from the previous value whenever it changes. */
  value: number
  /** Format applied on every animation frame. */
  format: (v: number) => string
  className?: string
  duration?: number
}

/**
 * A number that re-tweens to `value` on change (KPI re-tween on period switch,
 * kanban column totals on drop). Writes via textContent — no per-frame re-render.
 * Reduced motion: snaps instantly.
 */
export default function TweenNumber({ value, format, className, duration = 0.5 }: TweenNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const mv = useMotionValue(value)
  const reduced = useReducedMotion()
  const formatRef = useRef(format)

  useEffect(() => {
    formatRef.current = format
  }, [format])

  useEffect(() => {
    return mv.on('change', (v) => {
      if (ref.current) ref.current.textContent = formatRef.current(v)
    })
  }, [mv])

  useEffect(() => {
    if (reduced) {
      mv.set(value)
      return
    }
    const controls = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [value, reduced, duration, mv])

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  )
}
