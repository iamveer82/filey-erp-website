import { useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useGSAP } from '@gsap/react'
import { BookOpen } from 'lucide-react'
import SectionHeader from '@/components/SectionHeader'
import TerminalCard from '@/components/TerminalCard'
import type { TerminalLine } from '@/components/TerminalCard'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/scroll'
import { REPO_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'

/* ---------------------------------- data ---------------------------------- */

const PREREQS = ['Node.js 20+', 'Rust toolchain (desktop)', 'Free Supabase project']

interface Step {
  num: string
  title: string
  body?: string
  terminal: { title: string; lines: TerminalLine[]; copyText?: string }
  chip?: string
}

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Clone the repo',
    terminal: {
      title: 'bash',
      lines: [
        { text: 'git clone https://github.com/iamveer82/Filey-erp.git' },
        { text: 'cd Filey-erp' },
      ],
    },
  },
  {
    num: '02',
    title: 'Create the database',
    body: "In your free Supabase project, open the SQL editor and run supabase/schema.sql — it's idempotent and sets up row-level security for you. Then enable email auth.",
    terminal: {
      title: 'supabase — sql editor',
      lines: [{ text: '# supabase/schema.sql → paste & run in the SQL editor', kind: 'comment' }],
      copyText: 'supabase/schema.sql',
    },
    chip: 'RLS included',
  },
  {
    num: '03',
    title: 'Configure environment',
    terminal: {
      title: 'bash',
      lines: [
        { text: 'cp .env.example .env' },
        { text: '# VITE_SUPABASE_URL=https://your-project.supabase.co', kind: 'comment' },
        { text: '# VITE_SUPABASE_ANON_KEY=your-anon-key', kind: 'comment' },
      ],
    },
  },
  {
    num: '04',
    title: 'Run it',
    body: 'Browser mode uses the same Supabase backend; desktop mode adds the local SQLite offline layer.',
    terminal: { title: 'bash', lines: [] }, // rendered by RunItTerminal (tabbed toggle)
  },
  {
    num: '05',
    title: 'Build your own installers',
    body: 'Signed bundles land in src-tauri/target/release/bundle/ — .exe/.msi on Windows, .AppImage/.deb/.rpm on Linux, .dmg on macOS.',
    terminal: {
      title: 'bash',
      lines: [{ text: 'npm run tauri build' }],
    },
    chip: 'outputs: src-tauri/target/release/bundle/',
  },
]

const RUN_VARIANTS = {
  browser: [{ text: 'npm ci' }, { text: 'npm run dev' }] as TerminalLine[],
  desktop: [{ text: 'npm ci' }, { text: 'npm run tauri dev' }] as TerminalLine[],
}

/* ------------------------- step 4 — tabbed terminal ------------------------ */

function RunItTerminal() {
  const [variant, setVariant] = useState<'browser' | 'desktop'>('browser')
  return (
    <div>
      <div
          className="mb-2.5 inline-flex items-center gap-1 rounded-lg border border-ink-700 bg-ink-900 p-1"
          role="tablist"
          aria-label="Run variant"
        >
          {(['browser', 'desktop'] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={variant === v}
              onClick={() => setVariant(v)}
              className={cn(
                'rounded-md px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-200',
                variant === v ? 'bg-amber-400/10 text-amber-400' : 'text-faint hover:text-muted-foreground',
              )}
            >
              {v}
            </button>
          ))}
      </div>
      <TerminalCard title={variant === 'browser' ? 'bash — browser' : 'bash — desktop'} lines={RUN_VARIANTS[variant]} />
    </div>
  )
}

/* --------------------------------- section -------------------------------- */

export default function RunLocally() {
  const sectionRef = useRef<HTMLElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (prefersReducedMotion()) return

      // Rail fill scrubbed to section scroll
      gsap.fromTo(
        fillRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: stepsRef.current, start: 'top 75%', end: 'bottom 55%', scrub: 0.5 },
        },
      )

      // Step cards reveal-up, stagger 0.15s
      gsap.fromTo(
        '.rl-step',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: 'expo.out',
          scrollTrigger: { trigger: stepsRef.current, start: 'top 80%', once: true },
        },
      )

      // Node dots light amber when their card enters
      gsap.utils.toArray<HTMLElement>('.rl-step').forEach((step) => {
        const dot = step.querySelector('.rl-dot')
        if (!dot) return
        ScrollTrigger.create({
          trigger: step,
          start: 'top 80%',
          once: true,
          onEnter: () =>
            gsap.to(dot, {
              backgroundColor: '#FBBF24',
              borderColor: '#FBBF24',
              boxShadow: '0 0 0 6px rgba(251,191,36,0.15)',
              duration: 0.4,
              ease: 'power2.out',
            }),
        })
      })
    },
    { scope: sectionRef },
  )

  return (
    <section
      id="run-locally"
      ref={sectionRef}
      className="relative border-t border-ink-700/60 py-28 lg:py-40"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10">
        {/* ------------------------------ left (sticky) ----------------------------- */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              index="06"
              label="run locally"
              title="From git clone to first invoice in ~5 minutes."
              lead="Prefer the source? Filey is a standard React + Tauri project. Node 20, a free Supabase project, and five commands is all it takes."
              className="mb-8 lg:mb-8"
            />
            <p className="mb-5 text-sm leading-[1.6] text-faint">
              For developers who want to self-host or contribute.
            </p>
            <div className="flex flex-wrap gap-2">
              {PREREQS.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-ink-600 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {p}
                </span>
              ))}
            </div>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-6 inline-flex h-11 items-center gap-2 rounded-lg border border-ink-600 px-6 text-[15px] font-semibold text-fg transition-colors duration-200 hover:border-amber-400/50 hover:bg-amber-400/5 active:scale-[0.98]"
            >
              <BookOpen className="h-4 w-4 text-amber-400" />
              Read the README
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </div>

        {/* ------------------------------ right (steps) ----------------------------- */}
        <div ref={stepsRef} className="relative lg:col-span-8">
          {/* rail + scroll-progress fill (hidden < md) */}
          <div aria-hidden className="absolute bottom-4 left-0 top-4 hidden w-px bg-ink-700 md:block">
            <div
              ref={fillRef}
              className="h-full w-full origin-top bg-amber-400"
              style={{ transform: reduced ? 'scaleY(1)' : 'scaleY(0)' }}
            />
          </div>

          <ol className="space-y-6 md:pl-12">
            {STEPS.map((step) => (
              <li key={step.num} className="rl-step relative">
                {/* node dot on the rail */}
                <span
                  aria-hidden
                  className={cn(
                    'rl-dot absolute -left-[52.5px] top-7 hidden h-2.5 w-2.5 rounded-full border md:block',
                    reduced ? 'border-amber-400 bg-amber-400' : 'border-ink-600 bg-ink-950',
                  )}
                  style={reduced ? { boxShadow: '0 0 0 6px rgba(251,191,36,0.15)' } : undefined}
                />
                <div className="rounded-xl border border-ink-700/70 bg-ink-850 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-faint">{step.num}</span>
                    <h3 className="font-display text-[17px] font-semibold text-fg">{step.title}</h3>
                    {step.chip && (
                      <span className="ml-auto hidden rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-400 sm:inline-block">
                        {step.chip}
                      </span>
                    )}
                  </div>
                  {step.body && (
                    <p className="mt-3 text-sm leading-[1.6] text-muted-foreground">{step.body}</p>
                  )}
                  <div className="mt-4">
                    {step.num === '04' ? (
                      <RunItTerminal />
                    ) : (
                      <TerminalCard
                        title={step.terminal.title}
                        lines={step.terminal.lines}
                        copyText={step.terminal.copyText}
                      />
                    )}
                  </div>
                  {step.chip && (
                    <span className="mt-3 inline-block rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-400 sm:hidden">
                      {step.chip}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
