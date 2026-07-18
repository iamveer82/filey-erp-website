import { cn } from '@/lib/utils'

const DEFAULT_ITEMS = [
  'OFFLINE-FIRST',
  'AGPL-3.0 OPEN SOURCE',
  'FTA-COMPLIANT INVOICING',
  'DRAG-AND-DROP CRM PIPELINE',
  '100% LOCAL PDF TOOLKIT',
  'DOUBLE-ENTRY ACCOUNTING',
  'SIGNED AUTO-UPDATES',
  'SQLITE INSIDE',
  'OPTIONAL SUPABASE CLOUD',
  'NO SUBSCRIPTION — EVER',
]

interface TickerProps {
  items?: string[]
  className?: string
}

/**
 * Capability ticker marquee — full-width hairline strip, mono items separated by ✦,
 * duplicated ×2 for a seamless 40s CSS loop. Pauses on hover; static under reduced motion.
 */
export default function Ticker({ items = DEFAULT_ITEMS, className }: TickerProps) {
  const loop = [...items, ...items]
  return (
    <div
      className={cn(
        'relative flex h-14 items-center overflow-hidden border-y border-ink-700/60 bg-ink-900/50',
        className,
      )}
      style={{
        maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
      }}
      aria-hidden
    >
      <div className="flex w-max animate-ticker items-center whitespace-nowrap hover:[animation-play-state:paused] motion-reduce:animate-none">
        {loop.map((item, i) => (
          <span
            key={i}
            className="flex items-center font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground"
          >
            <span className="px-5">{item}</span>
            <span className="text-mint-400">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
