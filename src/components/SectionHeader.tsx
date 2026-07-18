import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import Reveal from '@/components/Reveal'

interface SectionHeaderProps {
  /** Mono index, e.g. "01" → renders "// 01 — features" */
  index: string
  /** Eyebrow label, e.g. "features" */
  label: string
  /** H2 content */
  title: ReactNode
  /** Optional accent word(s) rendered in Instrument Serif italic mint-300 after the title */
  accent?: string
  /** Lead paragraph */
  lead?: ReactNode
  align?: 'left' | 'center'
  className?: string
  /** Optional right-aligned content (links, status pills) */
  aside?: ReactNode
}

/** Shared section header: eyebrow → H2 (with optional serif accent word) → lead. */
export default function SectionHeader({
  index,
  label,
  title,
  accent,
  lead,
  align = 'left',
  className,
  aside,
}: SectionHeaderProps) {
  const centered = align === 'center'
  return (
    <Reveal
      className={cn(
        'mb-14 lg:mb-20',
        centered && 'mx-auto max-w-3xl text-center',
        className,
      )}
      y={24}
      duration={0.9}
      start="top 80%"
    >
      <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-mint-400">
        {'// '}
        {index} — {label}
      </p>
      <div className={cn('mt-4 flex flex-wrap items-end gap-x-8 gap-y-4', centered && 'justify-center')}>
        <h2 className="font-display text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.0] tracking-[-0.03em] text-fg">
          {title}
          {accent ? (
            <>
              {' '}
              <span className="font-serif font-normal italic text-mint-300">{accent}</span>
            </>
          ) : null}
        </h2>
        {aside ? <div className={cn(centered ? 'mx-auto' : 'ml-auto')}>{aside}</div> : null}
      </div>
      {lead ? (
        <p
          className={cn(
            'mt-5 max-w-2xl text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-[1.6] text-muted-foreground',
            centered && 'mx-auto',
          )}
        >
          {lead}
        </p>
      ) : null}
    </Reveal>
  )
}
