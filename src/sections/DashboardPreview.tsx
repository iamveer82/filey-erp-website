import { useEffect, useRef } from 'react'
import type { MouseEvent } from 'react'
import { animate, useInView, useMotionValue, useReducedMotion } from 'framer-motion'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Package,
  Search,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import AppWindow from '@/components/AppWindow'
import Reveal from '@/components/Reveal'
import SectionHeader from '@/components/SectionHeader'
import { scrollToHash } from '@/lib/scroll'
import {
  PREVIEW_CHART,
  PREVIEW_LOW_STOCK,
  PREVIEW_TOP_PRODUCTS,
  fmtAED,
  fmtCompact,
} from '@/sections/demo/data'
import { cn } from '@/lib/utils'

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
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color ?? '#FBBF24' }} />
          {entry.name}: {fmtAED(Number(entry.value ?? 0))}
        </p>
      ))}
    </div>
  )
}

/* --------------------------- count-up-on-scroll -------------------------- */

/** KPI number — tweens up once when 60% visible; final value under reduced motion. */
function PreviewCount({
  value,
  prefix = '',
  className,
}: {
  value: number
  prefix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduced = useReducedMotion()
  const mv = useMotionValue(0)

  useEffect(() => {
    return mv.on('change', (v) => {
      if (ref.current) ref.current.textContent = prefix + Math.round(v).toLocaleString('en-US')
    })
  }, [mv, prefix])

  useEffect(() => {
    if (!inView || reduced) return
    const controls = animate(mv, value, { duration: 1.4, ease: 'easeOut' })
    return () => controls.stop()
  }, [inView, reduced, value, mv])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString('en-US')}
    </span>
  )
}

/* --------------------------------- sidebar -------------------------------- */

const SIDE_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: BarChart3, label: 'Reports', active: false },
  { icon: ShoppingCart, label: 'Orders', active: false },
  { icon: FileText, label: 'Invoicing', active: false },
  { icon: Users, label: 'CRM', active: false },
  { icon: Package, label: 'Inventory', active: false },
  { icon: Wallet, label: 'Accounting', active: false },
]

function PreviewSidebar() {
  return (
    <nav aria-label="Modules" className="flex w-14 flex-col items-stretch gap-1 px-2 py-3 lg:w-48">
      {SIDE_ITEMS.map((item) => (
        <span
          key={item.label}
          className={cn(
            'relative flex h-10 items-center justify-center gap-2.5 rounded-lg lg:justify-start lg:px-3',
            item.active ? 'bg-amber-400/10 text-amber-400' : 'text-faint',
          )}
        >
          {item.active && (
            <span className="absolute -left-2 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-amber-400" />
          )}
          <item.icon className="h-[18px] w-[18px] shrink-0" />
          <span className="hidden text-[13px] font-medium lg:inline">{item.label}</span>
        </span>
      ))}
    </nav>
  )
}

/* --------------------------------- activity ------------------------------- */

const ACTIVITY = [
  { dot: 'bg-emerald-400', text: 'Invoice #1042 paid', meta: 'AED 8,750' },
  { dot: 'bg-sky-400', text: 'Quote #233 sent to Oasis Fitness', meta: '#0233' },
  { dot: 'bg-amber-400', text: 'PO #88 received from Gulf Metals', meta: '#0088' },
]

/* --------------------------------- section -------------------------------- */

export default function DashboardPreview() {
  const reduced = useReducedMotion()

  const handleDemo = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollToHash('#demo')
  }

  return (
    <section id="dashboard" className="relative border-t border-ink-700/60 py-28 lg:py-40">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHeader
          align="center"
          index="02"
          label="dashboard"
          title="Your business at a glance."
          lead="KPIs, cash flow, low stock and activity — the moment you open the app."
        />
      </div>

      <Reveal className="relative mx-auto w-full max-w-[1200px] px-5 sm:px-8" y={40}>
        <AppWindow
          title="Filey ERP — Overview"
          className="relative"
          sidebar={<PreviewSidebar />}
        >
          {/* top bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-[18px] font-semibold text-fg">Welcome back, Shaban</p>
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
            <div className="rounded-xl border border-ink-700/70 bg-ink-900/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-200 hover:border-amber-400/40">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Revenue (Jul)</p>
                <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  12.4%
                </span>
              </div>
              <p className="mt-2 font-mono text-[clamp(1.25rem,2vw,1.625rem)] font-semibold tabular-nums text-fg">
                <PreviewCount value={248530} prefix="AED " />
              </p>
              <svg viewBox="0 0 96 24" className="mt-2 h-6 w-full" aria-hidden>
                <polyline
                  points="0,19 12,17 24,18 36,14 48,15 60,11 72,8 84,6 96,3"
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {/* Open orders */}
            <div className="rounded-xl border border-ink-700/70 bg-ink-900/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-200 hover:border-amber-400/40">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Open orders</p>
                <span className="flex items-center gap-1 font-mono text-[10px] text-sky-400">
                  <TrendingUp className="h-3 w-3" />8
                </span>
              </div>
              <p className="mt-2 font-mono text-[clamp(1.25rem,2vw,1.625rem)] font-semibold tabular-nums text-fg">
                <PreviewCount value={132} />
              </p>
              <p className="mt-2 font-mono text-[10px] text-faint">14 due this week</p>
            </div>
            {/* Low stock */}
            <div className="rounded-xl border border-ink-700/70 bg-ink-900/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-200 hover:border-amber-400/40">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Low-stock alerts</p>
                <span className="font-mono text-[10px] text-amber-400">2 critical</span>
              </div>
              <p className="mt-2 font-mono text-[clamp(1.25rem,2vw,1.625rem)] font-semibold tabular-nums text-fg">
                <PreviewCount value={7} />
              </p>
              <p className="mt-2 font-mono text-[10px] text-faint">reorder points hit</p>
            </div>
            {/* Active customers */}
            <div className="rounded-xl border border-ink-700/70 bg-ink-900/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-200 hover:border-amber-400/40">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Active customers</p>
                <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  3.1%
                </span>
              </div>
              <p className="mt-2 font-mono text-[clamp(1.25rem,2vw,1.625rem)] font-semibold tabular-nums text-fg">
                <PreviewCount value={1284} />
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
                    <span className="h-1.5 w-3 rounded-full bg-amber-400" />
                    Revenue
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-3 rounded-full bg-fg/70" />
                    Expenses
                  </span>
                </div>
              </div>
              <div className="h-[220px] lg:h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PREVIEW_CHART} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dpRevFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FBBF24" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#FBBF24" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(250,250,250,0.06)" strokeDasharray="4 6" vertical={false} />
                    <XAxis
                      dataKey="m"
                      tick={{ fill: '#5C5C63', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(250,250,250,0.12)' }}
                    />
                    <YAxis
                      tick={{ fill: '#5C5C63', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                      tickLine={false}
                      axisLine={false}
                      width={44}
                      tickFormatter={fmtCompact}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(251,191,36,0.3)' }} />
                    <Area
                      type="monotone"
                      dataKey="rev"
                      name="Revenue"
                      stroke="#FBBF24"
                      strokeWidth={2}
                      fill="url(#dpRevFill)"
                      dot={false}
                      isAnimationActive={!reduced}
                      animationDuration={1200}
                    />
                    <Area
                      type="monotone"
                      dataKey="exp"
                      name="Expenses"
                      stroke="#FAFAFA"
                      strokeOpacity={0.55}
                      strokeWidth={1.5}
                      fill="none"
                      dot={false}
                      isAnimationActive={!reduced}
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
                          className="block h-full rounded-full bg-amber-400"
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
                  {ACTIVITY.map((a) => (
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
      </Reveal>

      {/* CTA to the live demo */}
      <div className="mx-auto max-w-7xl px-5 pt-10 text-center sm:px-8">
        <Reveal y={24}>
          <a
            href="#demo"
            onClick={handleDemo}
            className="group inline-flex items-center gap-2 font-mono text-[13px] text-muted-foreground transition-colors duration-200 hover:text-amber-400"
          >
            See it working in the live demo
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-y-0.5">
              ↓
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
