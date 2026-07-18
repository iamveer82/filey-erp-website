import { useRef } from 'react'
import type { ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/scroll'

gsap.registerPlugin(ScrollTrigger)

interface RevealProps {
  children: ReactNode
  className?: string
  /** px to rise from (design default: 40) */
  y?: number
  delay?: number
  duration?: number
  /** ScrollTrigger start (design default: 'top 82%') */
  start?: string
}

/**
 * Reusable GSAP ScrollTrigger 'reveal-up' wrapper:
 * y 40 → 0, opacity 0 → 1, easeOutExpo-ish, fires once when entering the viewport.
 * Renders children unchanged when prefers-reduced-motion.
 */
export default function Reveal({
  children,
  className,
  y = 40,
  delay = 0,
  duration = 0.7,
  start = 'top 82%',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return
      gsap.fromTo(
        ref.current,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          delay,
          ease: 'expo.out',
          scrollTrigger: { trigger: ref.current, start, once: true },
        },
      )
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
