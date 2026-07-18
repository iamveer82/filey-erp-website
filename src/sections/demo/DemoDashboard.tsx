import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import TweenNumber from '@/sections/demo/TweenNumber'
import {
  ACTIVITY_EVENTS,
  CATEGORY_SALES,
  DEMO_CHARTS,
  DEMO_KPIS,
  PERIODS,
  fmtAED,
  fmtCompact,
  fmtInt,
} from '@/sections/demo/data'
import type { Period } from '@/sections/demo/data'
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
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color ?? '#34D399' }} />
          {entry.name}: {fmtAED(Number(entry.value ?? 0))}
        </p>
      ))}
    </div>
  )
}

/* ------------------------------ activity feed ---------------------------- */

interface FeedItem {
  key: string
  dot: string
  text: string
  meta: string
}

const INITIAL_FEED: FeedItem[] = ACTIVITY_EVENTS.slice(0, 4).map((e, i) => ({
  key: `${e.id}-${i}`,
  dot: e.dot,
  text: e.text,
  meta: e.meta,
}))

/* ------------------------------- main tab -------------------------------- */

export default function DemoDashboard({ running }: { running: boolean }) {
  const [period, setPeriod] = useState<Period>('30D')
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null)
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED)
  const nextRef = useRef(4)
  const seqRef = useRef(4)
  const reduced = useReducedMotion()

  // Live feed: a new row every 6s (max 4, oldest drops). Pauses when the tab
  // is hidden or the section is off-screen.
  useEffect(() => {
    if (!running) return
    const t = window.setInterval(() => {
      setFeed((prev) => {
        const e = ACTIVITY_EVENTS[nextRef.current % ACTIVITY_EVENTS.length]
        nextRef.current += 1
        seqRef.current += 1
        return [...prev, { key: `${e.id}-${seqRef.current}`, dot: e.dot, text: e.text, meta: e.meta }].slice(-4)
      })
    }, 6000)
    return () => window.clearInterval(t)
  }, [running])

  const kpis = DEMO_KPIS[period]

  return (
    <div className="flex flex-col gap-4">
      {/* header row: label + period segmented control */}
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Overview — Falcon Trading LLC</p>
        <div className="flex items-center gap-0.5 rounded-lg border border-ink-700 bg-ink-900/60 p-0.5" role="group" aria-label="Period">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={cn(
                'relative rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors duration-200',
                period === p ? 'text-mint-400' : 'text-faint hover:text-muted-foreground',
              )}
            >
              {period === p && (
                <motion.span
                  layoutId="demo-period-pill"
                  className="absolute inset-0 rounded-md bg-mint-400/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{p}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards — numbers re-tween on period change */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-ink-700/70 bg-ink-900/60 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-200 hover:border-mint-400/40"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">{kpi.label}</p>
            <p className="mt-1.5 font-mono text-lg font-semibold tabular-nums text-fg lg:text-xl">
              <TweenNumber value={kpi.value} format={(v) => `${kpi.prefix ?? ''}${fmtInt(v)}`} />
            </p>
            <p
              className={cn(
                'mt-1 flex items-center gap-1 font-mono text-[10px]',
                kpi.tone === 'mint' && 'text-mint-400',
                kpi.tone === 'sky' && 'text-sky-400',
                kpi.tone === 'amber' && 'text-amber-400',
              )}
            >
              {kpi.tone !== 'amber' && <TrendingUp className="h-3 w-3" />}
              {kpi.delta}
            </p>
          </div>
        ))}
      </div>

      {/* chart + donut */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_300px]">
        <div className="rounded-xl border border-ink-700/70 bg-ink-900/60 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Revenue — {period}</p>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-faint">
              <span className="h-1.5 w-3 rounded-full bg-mint-400" />
              Revenue
            </span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={period}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="h-[220px] lg:h-[260px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DEMO_CHARTS[period]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="demoRevFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34D399" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(148,163,184,0.08)" strokeDasharray="4 6" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#5A6B80', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(148,163,184,0.15)' }}
                    minTickGap={28}
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
                    fill="url(#demoRevFill)"
                    dot={false}
                    isAnimationActive={!reduced}
                    animationDuration={900}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* sales by category donut */}
        <div className="rounded-xl border border-ink-700/70 bg-ink-900/60 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Sales by category</p>
          <div className="mx-auto h-[140px] w-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_SALES}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="88%"
                  paddingAngle={3}
                  strokeWidth={0}
                  isAnimationActive={!reduced}
                  animationDuration={900}
                  onMouseEnter={(d) => setHoveredSlice(d.name)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  {CATEGORY_SALES.map((c) => (
                    <Cell
                      key={c.name}
                      fill={c.color}
                      opacity={hoveredSlice === null || hoveredSlice === c.name ? 1 : 0.35}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1">
            {CATEGORY_SALES.map((c) => (
              <li
                key={c.name}
                onMouseEnter={() => setHoveredSlice(c.name)}
                onMouseLeave={() => setHoveredSlice(null)}
                className="relative flex items-center gap-2 rounded-md px-2 py-1"
              >
                {hoveredSlice === c.name && (
                  <motion.span
                    layoutId="donut-legend-ring"
                    className="absolute inset-0 rounded-md border border-mint-400/40 bg-mint-400/5"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative h-2 w-2 rounded-sm" style={{ background: c.color }} />
                <span className="relative text-[12px] text-muted-foreground">{c.name}</span>
                <span className="relative ml-auto font-mono text-[11px] tabular-nums text-faint">{c.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* recent activity — live feed */}
      <div className="rounded-xl border border-ink-700/70 bg-ink-900/60 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Recent activity</p>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-mint-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute h-full w-full animate-ping rounded-full bg-mint-400 opacity-60 motion-reduce:hidden" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-mint-400" />
            </span>
            live
          </span>
        </div>
        <ul>
          <AnimatePresence initial={false} mode="popLayout">
            {feed.map((item) => (
              <motion.li
                key={item.key}
                layout
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center justify-between rounded-md px-2 py-2 transition-colors duration-200 hover:bg-mint-400/5"
              >
                <span className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                  <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', item.dot)} />
                  {item.text}
                </span>
                <span className="ml-3 shrink-0 font-mono text-[11px] tabular-nums text-faint">{item.meta}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  )
}
