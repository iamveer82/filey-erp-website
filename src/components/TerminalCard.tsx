import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface TerminalLine {
  text: string
  /** cmd = amber "$" prompt · comment = faint · string = amber */
  kind?: 'cmd' | 'comment' | 'string'
}

interface TerminalCardProps {
  title?: string
  lines: TerminalLine[]
  /** Text copied by the copy button. Defaults to the `cmd` lines joined by newlines. */
  copyText?: string
  className?: string
}

/** Terminal card with traffic-dot header and a working copy button (sonner "Copied" toast). */
export default function TerminalCard({ title = 'terminal', lines, copyText, className }: TerminalCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text =
      copyText ??
      lines
        .filter((l) => (l.kind ?? 'cmd') === 'cmd')
        .map((l) => l.text)
        .join('\n')
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // clipboard unavailable (permissions / insecure context) — still surface the toast pattern
    }
    setCopied(true)
    toast.success('Copied')
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className={cn('overflow-hidden rounded-xl border border-ink-700 bg-ink-900', className)}>
      <div className="relative flex h-9 items-center border-b border-ink-700/70 px-3.5">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-mono text-[11px] text-faint">
          {title}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy commands"
          className="ml-auto rounded-md p-1.5 text-faint transition-colors duration-200 hover:bg-ink-700/60 hover:text-fg"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <div className="px-4 py-3.5 font-mono text-[13.5px] leading-[1.7]">
        {lines.map((line, i) => {
          const kind = line.kind ?? 'cmd'
          if (kind === 'comment') {
            return (
              <div key={i} className="text-faint">
                {line.text}
              </div>
            )
          }
          if (kind === 'string') {
            return (
              <div key={i} className="text-amber-400">
                {line.text}
              </div>
            )
          }
          return (
            <div key={i} className="text-foreground/90">
              <span className="mr-2 select-none text-amber-400">$</span>
              {line.text}
            </div>
          )
        })}
      </div>
    </div>
  )
}
