import { useRef } from 'react'
import type { ReactNode, MouseEvent } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { prefersReducedMotion } from '@/lib/scroll'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  /** Max translate toward cursor in px (design: 6) */
  strength?: number
}

/**
 * Magnetic hover wrapper for primary CTAs — translates the child toward the
 * cursor (max `strength` px) and springs back on leave. Disabled for touch
 * pointers and reduced motion.
 */
export default function MagneticButton({ children, className, strength = 6 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 20, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 300, damping: 20, mass: 0.4 })

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion() || window.matchMedia('(pointer: coarse)').matches) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    const clamp = (v: number) => Math.max(-strength, Math.min(strength, v))
    x.set(clamp(relX * 0.25))
    y.set(clamp(relY * 0.25))
  }

  const onMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  )
}
