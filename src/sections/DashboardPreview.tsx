import { useEffect, useRef, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { animate, useInView, useMotionValue, useReducedMotion } from 'framer-motion'
import { useGSAP } from '@gsap/react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  FileText,
  LayoutDashboard,
  Package,
  Search,
  ShoppingCart,
  TrendingUp,
  Users,
  Wrench,
} from 'lucide-react'
import AppWindow from '@/components/AppWindow'
import Reveal from '@/components/Reveal'
import SectionHeader from '@/components/SectionHeader'
import { gsap, prefersReducedMotion, scrollToHash } from '@/lib/scroll'
import {
  PREVIEW_ACTIVITY,
  PREVIEW_CHART,
  PREVIEW_LOW_STOCK,
  PREVIEW_TOP_PRODUCTS,
  fmtAED,
  fmtCompact,
} from '@/sections/demo/data'
import { cn } from '@/lib/utils'

gsap.registerPlugin(useGSAP)

/* ------------------------------ dark tooltip ----------------------------- */

interface TooltipEntry {
  value?: number | string
  name?: string
  color?: string
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 shadow-xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="mt-1 flex items-center gap-2 font-mono text-[11px] tabular-nums text-fg">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color ?? '#34D399' }} />
          {entry.name}: {fmtAED(Number(entry.value ?? 0))}
        </p>
      ))}
    </div>
  )
}

/* ------------------------- scrub/static count number --------------------- */

/**
 * KPI number. Desktop pin: GSAP owns textContent (scrub-linked 0 → target).
 * Static fallback (mobile / no pin): tweens up once when 60% visible.
 * Reduced motion: final value, no animation.
 */
function PreviewCount({
  value,
  prefix = '',
  enabled,
  className,
}: {
  value: number
  prefix?: string
  /** true when the pinned scrub timeline is NOT controlling this number */
  enabled: boolean
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduced = useReducedMotion()
  const mv = useMotionValue(0)

  useEffect(() => {
    if (!enabled) return
    return mv.on('change', (v) => {
      if (ref.current) ref.current.textContent = prefix + Math.round(v).toLocaleString('en-US')
    })
  }, [enabled, mv, prefix])

  useEffect(() => {
    if (!enabled || !inView || reduced) return
    const controls = animate(mv, value, { duration: 1.4, ease: 'easeOut' })
    return () => controls.stop()
  }, [enabled, inView, reduced, value, mv])

  return (
    <span ref={ref} className={className} data-value={value} data-prefix={prefix}>
      {prefix}
      {value.toLocaleString('en-US')}
    </span>
  )
}

/* --------------------------------- sidebar -------------------------------- */

const SIDE_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: Package, label: 'Inventory', active: false },
  { icon: ShoppingCart, label: 'Orders', active: false },
  { icon: FileText, label: 'Invoicing', active: false },
  { icon: Users, label: 'CRM', active: false },
  { icon: Wrench, label: 'Settings', active: false },
]

function PreviewSidebar() {
  return (
    <nav aria-label="Modules" className="flex w-14 flex-col items-stretch gap-1 px-2 py-3 lg:w-48">
      {SIDE_ITEMS.map((item) => (
        <span
          key={item.label}
          className={cn(
            'dp-side-item relative flex h-10 items-center justify-center gap-2.5 rounded-lg lg:justify-start lg:px-3',
            item.active ? 'bg-mint-400/10 text-mint-400' : 'text-faint',
          )}
        >
          {item.active && (
            <span className="absolute -left-2 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-mint-400" />
          )}
          <item.icon className="h-[18px] w-[18px] shrink-0" />
          <span className="hidden text-[13px] font-medium lg:inline">{item.label}</span>
        </span>
      ))}
    </nav>
  )
}

/* -------------------------------- callouts -------------------------------- */

function Callout({ children, className, dotAt = 'bottom' }: { children: ReactNode; className?: string; dotAt?: 'top' | 'bottom' }) {
  return (
    <div className={cn('dp-callout pointer-events-none absolute hidden xl:block', className)} aria-hidden>
      <div className={cn('flex flex-col', dotAt === 'top' ? 'flex-col-reverse items-start' : 'items-start')}>
        <span className="whitespace-nowrap rounded-full border border-ink-600 bg-ink-900/85 px-3 py-1 font-mono text-[11px] text-muted-foreground shadow-lg backdrop-blur-sm">
          <span className="mr-1.5 text-mint-400">●</span>
          {children}
        </span>
        <span className="ml-6 h-10 w-px bg-gradient-to-b from-mint-400/70 to-ink-600" />
        <span className="-mt-px ml-[23px] h-1.5 w-1.5 rounded-full bg-mint-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
      </div>
    </div>
  )
}

/* --------------------------------- section -------------------------------- */

export default function DashboardPreview() {
  const rootRef = useRef<HTMLElement>(null)
  const [pinActive, setPinActive] = useState(false)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Desktop, motion allowed → pinned, scrubbed 3-phase choreography (+=150%)
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        setPinActive(true)

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: '.dp-pin',
            start: 'top top',
            end: '+=150%',
            scrub: 0.5,
            pin: true,
            anticipatePin: 1,
          },
        })

        // Phase 1 (0–35%): window assembles
        tl.fromTo(
          '.dp-window',
          { scale: 0.82, rotateX: 12, y: 120, opacity: 0, transformPerspective: 1400 },
          { scale: 1, rotateX: 0, y: 0, opacity: 1, duration: 0.35, ease: 'power1.out' },
          0,
        )
        tl.fromTo('.dp-glow', { opacity: 0 }, { opacity: 0.5, duration: 0.3 }, 0.02)

        // Phase 2 (35–70%): internal assembly
        tl.fromTo(
          '.dp-kpi',
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.09, stagger: 0.025, ease: 'back.out(1.7)' },
          0.35,
        )
        tl.fromTo('.dp-side-item', { opacity: 0.25 }, { opacity: 1, duration: 0.05, stagger: 0.03 }, 0.36)

        // scrub-linked count-ups
        gsap.utils.toArray<HTMLElement>('.dp-count').forEach((el) => {
          const target = Number(el.dataset.value ?? '0')
          const prefix = el.dataset.prefix ?? ''
          const obj = { v: 0 }
          tl.fromTo(
            obj,
            { v: 0 },
            {
              v: target,
              duration: 0.22,
              ease: 'power1.out',
              onUpdate: () => {
                el.textContent = prefix + Math.round(obj.v).toLocaleString('en-US')
              },
            },
            0.38,
          )
        })

        // chart draws left → right via a clip mask
        tl.fromTo(
          '.dp-chart-clip',
          { clipPath: 'inset(0% 100% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.26 },
          0.42,
        )

        // Phase 3 (70–100%): annotation callouts, then hold
        tl.fromTo(
          '.dp-callout',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.12, stagger: 0.05, ease: 'power2.out' },
          0.72,
        )
        tl.to({}, { duration: 0.06 }, 0.94)

        return () => setPinActive(false)
      })

      // Mobile / reduced motion → no pin, simple reveal-up
      mm.add('(max-width: 1023px), (prefers-reduced-motion: reduce)', () => {
        if (prefersReducedMotion()) return
        gsap.fromTo(
          '.dp-window',
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'expo.out',
            scrollTrigger: { trigger: '.dp-pin', start: 'top 82%', once: true },
          },
        )
      })

      return () => mm.revert()
    },
    { scope: rootRef },
  )

  const handleDemo = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollToHash('#demo')
  }

  return (
    <section id="dashboard" ref={rootRef} className="relative border-t border-ink-700/60 pt-28 lg:pt-40">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHeader
          align="center"
          index="03"
          label="dashboard preview"
          title="Mission control for your business."
          lead="The Overview module turns your day into four numbers and one chart. This is live UI — the same components the desktop app renders."
        />
      </div>

      {/* pinned viewport (static on < lg / reduced motion) */}
      <div className="dp-pin relative flex min-h-[100dvh] items-center">
        <div className="relative mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-8">
          {/* mint glow */}
          <div
            aria-hidden
            className="dp-glow absolute -inset-6 rounded-full opacity-50 blur-3xl"
            style={{ background: 'radial-gradient(closest-side, rgba(52,211,153,0.16), transparent)' }}
          />

          <AppWindow
            title="Filey ERP — Overview"
            className="dp-window relative will-change-transform"
            sidebar={<PreviewSidebar />}
          >
            {/* top bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-[18px] font-semibold text-fg">Good morning, Falcon Trading</p>
                <p className="mt-0.5 font-mono text-[11px] text-faint">Sat, Jul 18 2026</p>
              </div>
              <div className="hidden items-center gap-2 rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-1.5 font-mono text-[11px] text-faint sm:flex">
                <Search className="h-3.5 w-3.5" />
                Quick search
                <kbd className="rounded border border-ink-600 px-1.5 py-px text-[10px]">⌘K</kbd>
              </div>
            </div>

            {/* KPI cards */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Revenue */}
              <div className="dp-kpi rounded-xl border border-ink-700/70 bg-ink-900/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-200 hover:border-mint-400/40">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Revenue (Jul)</p>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-mint-400">
                    <TrendingUp className="h-3 w-3" />
                    12.4%
                  </span>
                </div>
                <p className="mt-2 font-mono text-[clamp(1.25rem,2vw,1.625rem)] font-semibold tabular-nums text-fg">
                  <PreviewCount value={248530} prefix="AED " enabled={!pinActive} className="dp-count" />
                </p>
                <svg viewBox="0 0 96 24" className="mt-2 h-6 w-full" aria-hidden>
                  <polyline
                    points="0,19 12,17 24,18 36,14 48,15 60,11 72,8 84,6 96,3"
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {/* Open orders */}
              <div className="dp-kpi rounded-xl border border-ink-700/70 bg-ink-900/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-200 hover:border-mint-400/40">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Open orders</p>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-sky-400">
                    <TrendingUp className="h-3 w-3" />8
                  </span>
                </div>
                <p className="mt-2 font-mono text-[clamp(1.25rem,2vw,1.625rem)] font-semibold tabular-nums text-fg">
                  <PreviewCount value={132} enabled={!pinActive} className="dp-count" />
                </p>
                <p className="mt-2 font-mono text-[10px] text-faint">14 due this week</p>
              </div>
              {/* Low stock */}
              <div className="dp-kpi rounded-xl border border-ink-700/70 bg-ink-900/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-200 hover:border-mint-400/40">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Low-stock alerts</p>
                  <span className="font-mono text-[10px] text-amber-400">2 critical</span>
                </div>
                <p className="mt-2 font-mono text-[clamp(1.25rem,2vw,1.625rem)] font-semibold tabular-nums text-fg">
                  <PreviewCount value={7} enabled={!pinActive} className="dp-count" />
                </p>
                <p className="mt-2 font-mono text-[10px] text-faint">reorder points hit</p>
              </div>
              {/* Active customers */}
              <div className="dp-kpi rounded-xl border border-ink-700/70 bg-ink-900/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-200 hover:border-mint-400/40">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Active customers</p>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-mint-400">
                    <TrendingUp className="h-3 w-3" />
                    3.1%
                  </span>
                </div>
                <p className="mt-2 font-mono text-[clamp(1.25rem,2vw,1.625rem)] font-semibold tabular-nums text-fg">
                  <PreviewCount value={1284} enabled={!pinActive} className="dp-count" />
                </p>
                <p className="mt-2 font-mono text-[10px] text-faint">last 90 days</p>
              </div>
            </div>

            {/* chart + right column */}
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_288px]">
              {/* main chart */}
              <div className="rounded-xl border border-ink-700/70 bg-ink-900/60 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Revenue vs expenses</p>
                  <div className="flex items-center gap-3 font-mono text-[10px] text-faint">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-3 rounded-full bg-mint-400" />
                      Revenue
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-3 rounded-full bg-amber-400" />
                      Expenses
                    </span>
                  </div>
                </div>
                <div className="dp-chart-clip h-[220px] lg:h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PREVIEW_CHART} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dpRevFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#34D399" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(148,163,184,0.08)" strokeDasharray="4 6" vertical={false} />
                      <XAxis
                        dataKey="m"
                        tick={{ fill: '#5A6B80', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(148,163,184,0.15)' }}
                      />
                      <YAxis
                        tick={{ fill: '#5A6B80', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                        tickLine={false}
                        axisLine={false}
                        width={44}
                        tickFormatter={fmtCompact}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(52,211,153,0.3)' }} />
                      <Area
                        type="monotone"
                        dataKey="rev"
                        name="Revenue"
                        stroke="#34D399"
                        strokeWidth={2}
                        fill="url(#dpRevFill)"
                        dot={false}
                        isAnimationActive={!pinActive && !reduced}
                        animationDuration={1200}
                      />
                      <Area
                        type="monotone"
                        dataKey="exp"
                        name="Expenses"
                        stroke="#FBBF24"
                        strokeWidth={1.5}
                        fill="none"
                        dot={false}
                        isAnimationActive={!pinActive && !reduced}
                        animationDuration={1200}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* right column (w-72) */}
              <div className="flex flex-col gap-3">
                {/* top products */}
                <div className="rounded-xl border border-ink-700/70 bg-ink-900/60 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Top products</p>
                  <div className="mt-2.5 space-y-2">
                    {PREVIEW_TOP_PRODUCTS.map((p) => (
                      <div key={p.name} className="flex items-center gap-2">
                        <span className="w-[86px] truncate text-[11.5px] text-muted-foreground">{p.name}</span>
                        <span className="h-1 flex-1 overflow-hidden rounded-full bg-ink-700">
                          <span
                            className="block h-full rounded-full bg-mint-400"
                            style={{ width: `${(p.sold / 86) * 100}%` }}
                          />
                        </span>
                        <span className="w-6 text-right font-mono text-[11px] tabular-nums text-fg">{p.sold}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* low stock */}
                <div className="rounded-xl border border-ink-700/70 bg-ink-900/60 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Low stock</p>
                  <div className="mt-2 space-y-1.5">
                    {PREVIEW_LOW_STOCK.map((s) => (
                      <div key={s.name} className="flex items-center justify-between gap-2">
                        <span className="text-[11.5px] text-muted-foreground">{s.name}</span>
                        <span
                          className={cn(
                            'rounded-full px-2 py-px font-mono text-[10px] tabular-nums',
                            s.tone === 'rose' ? 'bg-rose-400/10 text-rose-400' : 'bg-amber-400/10 text-amber-400',
                          )}
                        >
                          {s.left} left
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* activity */}
                <div className="rounded-xl border border-ink-700/70 bg-ink-900/60 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Activity</p>
                  <div className="mt-2 space-y-1.5">
                    {PREVIEW_ACTIVITY.map((a) => (
                      <div key={a.text} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 truncate text-[11.5px] text-muted-foreground">
                          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', a.dot)} />
                          <span className="truncate">{a.text}</span>
                        </span>
                        <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-faint">{a.meta}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AppWindow>

          {/* annotation callouts (Phase 3, xl only) */}
          <Callout className="-top-12 left-[6%]">Live KPIs — always offline-fast</Callout>
          <Callout className="-top-12 right-[6%]">Reorder alerts before you run dry</Callout>
          <Callout className="-bottom-12 left-[30%]" dotAt="top">
            Revenue vs expenses, 12 months
          </Callout>

          {/* callouts become small captions below xl */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 xl:hidden">
            <span className="font-mono text-[11px] text-faint">
              <span className="mr-1.5 text-mint-400">●</span>Live KPIs — always offline-fast
            </span>
            <span className="font-mono text-[11px] text-faint">
              <span className="mr-1.5 text-mint-400">●</span>Reorder alerts before you run dry
            </span>
            <span className="font-mono text-[11px] text-faint">
              <span className="mr-1.5 text-mint-400">●</span>Revenue vs expenses, 12 months
            </span>
          </div>
        </div>
      </div>

      {/* CTA + hairline divider after unpin */}
      <div className="mx-auto max-w-7xl px-5 pb-28 pt-10 sm:px-8 lg:pb-36">
        <Reveal className="text-center" y={24}>
          <a
            href="#demo"
            onClick={handleDemo}
            className="group inline-flex items-center gap-2 font-mono text-[13px] text-muted-foreground transition-colors duration-200 hover:text-mint-400"
          >
            Want to touch it? Try the live demo
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-y-0.5">
              ↓
            </span>
          </a>
        </Reveal>
        <Reveal className="mt-16 lg:mt-20" y={0}>
          <div
            aria-hidden
            className="h-px w-full"
            style={{ background: 'linear-gradient(90deg, transparent, #1E2C40, transparent)' }}
          />
        </Reveal>
      </div>
    </section>
  )
}
