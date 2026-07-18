import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AppWindowProps {
  /** Centered mono title, e.g. "Filey ERP — Overview" */
  title: string
  children: ReactNode
  className?: string
  /** Optional left icon rail / sidebar rendered between title bar and content */
  sidebar?: ReactNode
  contentClassName?: string
  /** Title-bar LED state (design: "● Online / offline-ready") */
  led?: 'online' | 'offline'
  ledLabel?: string
}

/**
 * App-window chrome used for every product mock (hero, dashboard preview, live demo).
 * Traffic dots left · centered mono title · status LED right · optional icon rail · content slot.
 */
export function AppWindow({
  title,
  children,
  className,
  sidebar,
  contentClassName,
  led = 'online',
  ledLabel = led === 'online' ? 'Online' : 'Offline-ready',
}: AppWindowProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-ink-600/70 bg-ink-900',
        'shadow-[0_24px_80px_-12px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)]',
        className,
      )}
    >
      {/* Title bar */}
      <div className="relative flex h-10 items-center justify-between border-b border-ink-700 bg-ink-800/80 px-4">
        <div className="flex items-center gap-2" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-mono text-[11px] text-faint">
          {title}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-faint">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              led === 'online' ? 'animate-pulse bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-amber-400',
            )}
          />
          <span className="hidden sm:inline">{ledLabel}</span>
        </span>
      </div>

      {/* Body: optional rail + content */}
      <div className="flex min-h-0">
        {sidebar ? (
          <div className="shrink-0 border-r border-ink-700 bg-ink-900/60">{sidebar}</div>
        ) : null}
        <div className={cn('min-w-0 flex-1 bg-ink-850 p-4 lg:p-6', contentClassName)}>{children}</div>
      </div>
    </div>
  )
}

export default AppWindow
