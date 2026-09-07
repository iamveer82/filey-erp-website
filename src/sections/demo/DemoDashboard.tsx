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
  DEMO_CHARTS,
  DEMO_KPIS,
  CATEGORY_SALES,
  PERIODS,
  fmtAED,
  fmtCompact,
  fmtInt,
} from '@/sections/demo/data'
import type { Period } from '@/sections/demo/data'
import { cn } from '@/lib/utils'

/* ------------------------------ clean tooltip ----------------------------- */

interface TooltipEntry {
  value?: number | string
  name?: string
  color?: string
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-[10px] px-2.5 py-2 text-[12px] shadow-lg"
      style={{
        background: '#fff',
        border: '1px solid hsl(240 5.9% 90%)',
        color: 'hsl(240 6% 10%)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      }}
    >
      <p className="mb-1 text-[10px] uppercase tracking-wide text-zinc-400">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-1.5 tabular-nums text-zinc-800">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color ?? '#F59E0B' }} />
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

  const axisTick = { fontSize: 11, fill: '#9ca3af' }

  return (
    <div className="flex flex-col gap-4">
      {/* header row: label + period segmented control */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] text-muted-foreground">Overview — Falcon Trading LLC</p>
        <div className="flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white p-0.5" role="group" aria-label="Period">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={cn(
                'relative rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors duration-200',
                period === p ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-600',
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards — MetricCard style from the desktop app */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-zinc-200 bg-white p-3.5 transition-colors duration-200 hover:border-zinc-300"
          >
            <p className="truncate text-[11px] text-zinc-400">{kpi.label}</p>
            <p className="mt-1 truncate text-[18px] font-semibold leading-tight tracking-tight tabular-nums text-zinc-900">
              <TweenNumber value={kpi.value} format={(v) => `${kpi.prefix ?? ''}${fmtInt(v)}`} />
            </p>
            <p
              className={cn(
                'mt-0.5 flex items-center gap-1 text-[10.5px] font-medium',
                kpi.tone === 'emerald' && 'text-emerald-600',
                kpi.tone === 'sky' && 'text-sky-600',
                kpi.tone === 'amber' && 'text-amber-600',
              )}
            >
              {kpi.tone !== 'amber' && <TrendingUp className="h-3 w-3" />}
              {kpi.delta}
            </p>
          </div>
        ))}
      </div>

      {/* chart + donut — same layout as the real dashboard */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_300px]">
        {/* Sales vs Payments bar chart */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-zinc-900">Revenue — {period}</p>
              <p className="text-[11.5px] text-zinc-400 mt-0.5">Invoiced across all customers</p>
            </div>
            <span className="flex items-center gap-1.5 text-[10.5px] text-zinc-400">
              <span className="h-1.5 w-3 rounded-full bg-amber-400" />
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
                <AreaChart data={DEMO_CHARTS[period]} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="demoRevFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={28}
                  />
                  <YAxis
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    tickFormatter={fmtCompact}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                  <Area
                    type="monotone"
                    dataKey="rev"
                    name="Revenue"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fill="url(#demoRevFill)"
                    dot={false}
                    activeDot={{ r: 3, strokeWidth: 0 }}
                    isAnimationActive={!reduced}
                    animationDuration={900}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Customer segments donut with centre total */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-[14px] font-semibold text-zinc-900">Customer segments</p>
          <p className="text-[11.5px] text-zinc-400 mt-0.5">By segment tag</p>
          <div className="relative mx-auto mt-3 h-[140px] w-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_SALES}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="88%"
                  paddingAngle={2}
                  cornerRadius={3}
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
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <p className="text-[18px] font-semibold text-zinc-900 tabular-nums leading-none">6</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">customers</p>
              </div>
            </div>
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
                    className="absolute inset-0 rounded-md border border-amber-300 bg-amber-50"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative h-2 w-2 rounded-sm" style={{ background: c.color }} />
                <span className="relative text-[12px] text-zinc-600">{c.name}</span>
                <span className="relative ml-auto text-[11px] tabular-nums text-zinc-400">{c.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* recent activity — live feed */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[14px] font-semibold text-zinc-900">Recent activity</p>
          <span className="flex items-center gap-1.5 text-[10.5px] font-medium text-emerald-600">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Sample
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
                className="flex items-center justify-between rounded-md px-2 py-2 transition-colors duration-200 hover:bg-zinc-50"
              >
                <span className="flex items-center gap-2 text-[12.5px] text-zinc-600">
                  <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', item.dot)} />
                  {item.text}
                </span>
                <span className="ml-3 shrink-0 text-[11px] tabular-nums text-zinc-400">{item.meta}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  )
}
