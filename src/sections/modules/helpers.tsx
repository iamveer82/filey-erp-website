import type { ReactNode } from 'react'
import type { Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

/** easeOutExpo-ish per design.md motion system */
export const EASE_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** back-out ease for the PAID stamp / pops */
export const EASE_BACK: [number, number, number, number] = [0.34, 1.56, 0.64, 1]

/** Snappy spring per design.md (drag / layout moves) */
export const SPRING = { type: 'spring', stiffness: 400, damping: 30 } as const

/** Mini-visual children stagger 0.06s (design home.md §3) */
export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

export const riseItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_EXPO } },
}

export type Tone = 'amber' | 'emerald' | 'rose' | 'sky' | 'violet' | 'neutral'

const TONE_CLASSES: Record<Tone, string> = {
  amber: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  emerald: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400',
  rose: 'border-rose-400/40 bg-rose-400/10 text-rose-400',
  sky: 'border-sky-400/40 bg-sky-400/10 text-sky-400',
  violet: 'border-violet-400/40 bg-violet-400/10 text-violet-400',
  neutral: 'border-ink-600 bg-ink-800/60 text-muted-foreground',
}

/** Small status pill chip used across the mini module mocks. */
export function StatusChip({ tone = 'neutral', className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Hairline panel tile used inside module visuals. */
export function MiniTile({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-lg border border-ink-700 bg-ink-900/60', className)}>{children}</div>
  )
}
