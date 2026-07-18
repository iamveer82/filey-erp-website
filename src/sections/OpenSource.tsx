import { useRef } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useGSAP } from '@gsap/react'
import { BookOpen, CircleDot, Map, Star } from 'lucide-react'
import SectionHeader from '@/components/SectionHeader'
import { gsap, prefersReducedMotion } from '@/lib/scroll'
import { CONTRIBUTING_URL, ISSUES_URL, LICENSE_URL, REPO_URL, ROADMAP_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'

/* ---------------------------------- data ---------------------------------- */

const LICENSE_POINTS = [
  'Free forever — no tiers, no seats',
  'Commercial use allowed',
  'Modify & redistribute (source stays open)',
  'No telemetry, no phone-home',
]

const CONTRIBUTE_LINKS = [
  { icon: BookOpen, label: 'Contributing guide', href: CONTRIBUTING_URL },
  { icon: Map, label: 'Roadmap', href: ROADMAP_URL },
  { icon: CircleDot, label: 'Open an issue', href: ISSUES_URL },
]

const STACK: { sigil: string; name: string; role: string }[] = [
  { sigil: 'T2', name: 'Tauri 2', role: 'Rust desktop shell' },
  { sigil: 'Rs', name: 'Rust', role: 'Native core' },
  { sigil: 'Re', name: 'React 19', role: 'UI' },
  { sigil: 'TS', name: 'TypeScript', role: 'Type safety' },
  { sigil: 'Vi', name: 'Vite', role: 'Build tooling' },
  { sigil: 'Tw', name: 'Tailwind CSS', role: 'Styling' },
  { sigil: 'Rc', name: 'Recharts', role: 'Charts' },
  { sigil: 'Sb', name: 'Supabase', role: 'Optional cloud (Postgres + RLS)' },
  { sigil: 'Sq', name: 'SQLite', role: 'Local-first storage' },
  { sigil: 'Pd', name: 'pdf-lib', role: '100% local PDF toolkit' },
]

/* ------------------------------ drawn check ------------------------------- */

function DrawnCheck({ delay = 0 }: { delay?: number }) {
  const reduced = useReducedMotion()
  return (
    <svg
      viewBox="0 0 16 16"
      className="mt-0.5 h-4 w-4 shrink-0 text-mint-400"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <motion.path
        d="M3 8.5 6.5 12 13 4"
        initial={{ pathLength: reduced ? 1 : 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay }}
      />
    </svg>
  )
}

/* --------------------------- tilting ticket card --------------------------- */

function TiltCard({ children, href }: { children: ReactNode; href: string }) {
  const rotate = useMotionValue(0)
  const spring = useSpring(rotate, { stiffness: 300, damping: 20 })
  const reduced = useReducedMotion()

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (reduced || window.matchMedia('(pointer: coarse)').matches) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    rotate.set(px * 3) // ±1.5°
  }
  const onLeave = () => rotate.set(0)

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ rotate: spring }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ y: -2 }}
      className="block rounded-lg border border-ink-700/70 bg-ink-900/60 p-4 transition-colors duration-200 hover:border-mint-400/40"
    >
      {children}
    </motion.a>
  )
}

/* --------------------------------- section -------------------------------- */

export default function OpenSource() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '.os-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.os-grid', start: 'top 85%', once: true },
        },
      )
      gsap.fromTo(
        '.os-chip',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.04,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.os-stack', start: 'top 85%', once: true },
        },
      )
    },
    { scope: sectionRef },
  )

  return (
    <section
      id="open-source"
      ref={sectionRef}
      className="relative border-t border-ink-700/60 py-28 lg:py-40"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="07"
          label="open source"
          title="Open to the core."
          lead="Filey ERP is AGPL-3.0. Use it free, forever — self-host it, audit it, modify it, even sell your modified version. The only rule: keep it open."
        />

        {/* top row: license + contribute */}
        <div className="os-grid grid gap-5 lg:grid-cols-2">
          {/* Card A — license */}
          <div className="os-card relative rounded-xl border border-ink-700/70 bg-ink-850 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:p-8">
            <span
              aria-hidden
              className="absolute right-5 top-5 font-mono text-[11px] uppercase tracking-[0.18em] text-faint"
            >
              AGPL
            </span>
            <h3 className="font-display text-[40px] font-bold leading-none text-mint-400">AGPL-3.0</h3>
            <ul className="mt-6 space-y-3">
              {LICENSE_POINTS.map((point, i) => (
                <li key={point} className="flex items-start gap-3 text-[15px] text-muted-foreground">
                  <DrawnCheck delay={0.1 + i * 0.08} />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-mint-400 px-6 text-[15px] font-semibold text-ink-950 transition-all duration-200 hover:bg-mint-300 hover:shadow-[0_0_24px_rgba(52,211,153,0.25)] active:scale-[0.98] active:bg-mint-500"
              >
                <Star className="h-4 w-4" />
                Star on GitHub
              </a>
              <a
                href={LICENSE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-ink-600 px-6 text-[15px] font-semibold text-fg transition-colors duration-200 hover:border-mint-400/50 hover:bg-mint-400/5 active:scale-[0.98]"
              >
                Read the license
              </a>
            </div>
          </div>

          {/* Card B — contribute */}
          <div className="os-card rounded-xl border border-ink-700/70 bg-ink-850 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:p-8">
            <h3 className="font-display text-[22px] font-semibold text-fg">Build it with us</h3>
            <p className="mt-3 text-[15px] leading-[1.6] text-muted-foreground">
              Bug reports, features, templates, translations — contributions welcome. The roadmap is
              public.
            </p>
            <div className="mt-6 space-y-1">
              {CONTRIBUTE_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-lg px-2 py-2.5 font-mono text-[13px] text-muted-foreground transition-colors duration-200 hover:bg-mint-400/5 hover:text-mint-400"
                >
                  <Icon className="h-4 w-4 text-faint transition-colors duration-200 group-hover:text-mint-400" />
                  {label}
                  <span aria-hidden className="ml-auto transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              ))}
            </div>
            <div className="mt-6">
              <TiltCard href={ISSUES_URL}>
                <span className="inline-block rounded-full border border-mint-400/40 bg-mint-400/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-mint-400">
                  good first issue
                </span>
                <p className="mt-2.5 text-sm text-muted-foreground">
                  Add dark-mode toggle to receipt preview{' '}
                  <span className="font-mono text-faint">#214</span>
                </p>
              </TiltCard>
            </div>
          </div>
        </div>

        {/* tech stack grid */}
        <div className="os-stack mt-14">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-mint-400">
              {'// '}stack
            </p>
            <p className="text-[13px] text-faint">
              The same stack this website is built on — minus the Rust shell.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            {STACK.map((t) => (
              <div
                key={t.name}
                className={cn(
                  'os-chip rounded-lg border border-ink-700 bg-ink-850 p-4',
                  'transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-mint-400/50',
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-700 bg-ink-800 font-mono text-[11px] font-medium text-mint-400">
                  {t.sigil}
                </span>
                <p className="mt-3 text-sm font-semibold text-fg">{t.name}</p>
                <p className="mt-1 font-mono text-[10.5px] leading-[1.5] text-faint">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
