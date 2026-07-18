import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { Check } from 'lucide-react'
import { EASE_BACK, EASE_EXPO, MiniTile, StatusChip, riseItem, staggerParent } from './helpers'
import { cn } from '@/lib/utils'

/* ------------------------------- Overview -------------------------------- */

const SPARK = [
  { m: 'Aug', rev: 182, exp: 120 },
  { m: 'Sep', rev: 190, exp: 122 },
  { m: 'Oct', rev: 188, exp: 124 },
  { m: 'Nov', rev: 198, exp: 126 },
  { m: 'Dec', rev: 210, exp: 128 },
  { m: 'Jan', rev: 206, exp: 130 },
  { m: 'Feb', rev: 218, exp: 132 },
  { m: 'Mar', rev: 226, exp: 134 },
  { m: 'Apr', rev: 224, exp: 136 },
  { m: 'May', rev: 236, exp: 138 },
  { m: 'Jun', rev: 242, exp: 140 },
  { m: 'Jul', rev: 248, exp: 141 },
]

const OVERVIEW_KPIS = [
  { label: 'Revenue (Jul)', value: 'AED 48,250', delta: '▲ 12.4%', tone: 'text-emerald-400' },
  { label: 'Open orders', value: '132', delta: '▲ 8', tone: 'text-sky-400' },
  { label: 'Low stock', value: '7', delta: '2 critical', tone: 'text-amber-400' },
  { label: 'Suppliers', value: '36', delta: '▲ 2', tone: 'text-emerald-400' },
]

/** 01 — Overview: 2×2 mini KPI grid + sparkline area chart + mono footnote. */
export function OverviewVisual() {
  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className="w-full max-w-[440px]">
      <div className="grid grid-cols-2 gap-2.5">
        {OVERVIEW_KPIS.map((kpi) => (
          <motion.div key={kpi.label} variants={riseItem}>
            <MiniTile className="p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">{kpi.label}</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-fg">{kpi.value}</p>
              <p className={cn('mt-0.5 font-mono text-[10px] tabular-nums', kpi.tone)}>{kpi.delta}</p>
            </MiniTile>
          </motion.div>
        ))}
      </div>
      <motion.div variants={riseItem} className="mt-3">
        <MiniTile className="p-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Revenue vs expenses</p>
            <p className="font-mono text-[10px] text-faint">12 months</p>
          </div>
          <div className="mt-2 h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SPARK} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="mx-spark-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FBBF24" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#FBBF24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="exp"
                  stroke="#FAFAFA"
                  strokeOpacity={0.5}
                  strokeWidth={1.5}
                  fill="none"
                  isAnimationActive
                  animationDuration={1200}
                />
                <Area
                  type="monotone"
                  dataKey="rev"
                  stroke="#FBBF24"
                  strokeWidth={2}
                  fill="url(#mx-spark-rev)"
                  isAnimationActive
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </MiniTile>
      </motion.div>
      <motion.p variants={riseItem} className="mt-3 text-center font-mono text-[10px] tracking-[0.14em] text-faint">
        items · suppliers · low stock · activity
      </motion.p>
    </motion.div>
  )
}

/* ------------------------------- Inventory ------------------------------- */

type StockStatus = 'In stock' | 'Low' | 'Reorder'

const STOCK_TONE: Record<StockStatus, 'emerald' | 'amber' | 'rose'> = {
  'In stock': 'emerald',
  Low: 'amber',
  Reorder: 'rose',
}

const STOCK_BAR: Record<StockStatus, string> = {
  'In stock': 'bg-emerald-400',
  Low: 'bg-amber-400',
  Reorder: 'bg-rose-400',
}

const INVENTORY_ROWS: { sku: string; name: string; stock: number; status: StockStatus }[] = [
  { sku: 'SKU-1001', name: 'Pallet jack', stock: 86, status: 'In stock' },
  { sku: 'SKU-1042', name: 'Hex bolt M8 (box)', stock: 12, status: 'Reorder' },
  { sku: 'SKU-1077', name: 'Industrial shelving unit', stock: 64, status: 'In stock' },
]

function StockRow({ sku, name, stock, status }: { sku: string; name: string; stock: number; status: StockStatus }) {
  return (
    <>
      <span className="w-[74px] shrink-0 font-mono text-[11px] text-faint">{sku}</span>
      <span className="min-w-0 flex-1 truncate text-[12.5px] text-fg">{name}</span>
      <span className="hidden w-20 shrink-0 items-center gap-2 sm:flex">
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-ink-700">
          <motion.span
            className={cn('block h-full rounded-full', STOCK_BAR[status])}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (stock / 250) * 100)}%` }}
            transition={{ duration: 0.9, ease: EASE_EXPO, delay: 0.2 }}
          />
        </span>
        <span className="w-7 text-right font-mono text-[11px] tabular-nums text-muted-foreground">{stock}</span>
      </span>
      <StatusChip tone={STOCK_TONE[status]} className="w-[82px] justify-center">
        {status}
      </StatusChip>
    </>
  )
}

/** The wrap roll: bar drains 42 → 19, then its chip flips In stock → Low. */
function AnimatedWrapRow() {
  const [low, setLow] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setLow(true), 1500)
    return () => window.clearTimeout(t)
  }, [])
  const status: StockStatus = low ? 'Low' : 'In stock'
  const stock = low ? 19 : 42
  return (
    <>
      <span className="w-[74px] shrink-0 font-mono text-[11px] text-faint">SKU-1103</span>
      <span className="min-w-0 flex-1 truncate text-[12.5px] text-fg">Pallet wrap (roll)</span>
      <span className="hidden w-20 shrink-0 items-center gap-2 sm:flex">
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-ink-700">
          <motion.span
            className={cn('block h-full rounded-full', STOCK_BAR[status])}
            initial={false}
            animate={{ width: `${(stock / 250) * 100}%` }}
            transition={{ duration: 0.9, ease: EASE_EXPO }}
          />
        </span>
        <span className="w-7 text-right font-mono text-[11px] tabular-nums text-muted-foreground">{stock}</span>
      </span>
      <span className="inline-flex w-[82px] shrink-0 justify-center [perspective:400px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={status}
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: -90, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_EXPO }}
            className="inline-flex"
          >
            <StatusChip tone={STOCK_TONE[status]} className="w-[82px] justify-center">
              {status}
            </StatusChip>
          </motion.span>
        </AnimatePresence>
      </span>
    </>
  )
}

/** 02 — Inventory: 4-row product table; one row drains and flips to Low. */
export function InventoryVisual() {
  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className="w-full max-w-[460px]">
      <motion.div variants={riseItem}>
        <MiniTile className="divide-y divide-ink-700/60 px-3.5">
          {INVENTORY_ROWS.map((row) => (
            <div
              key={row.sku}
              className="flex items-center gap-3 py-2.5 transition-colors duration-200 hover:bg-amber-400/5"
            >
              <StockRow {...row} />
            </div>
          ))}
          <div className="flex items-center gap-3 py-2.5 transition-colors duration-200 hover:bg-amber-400/5">
            <AnimatedWrapRow />
          </div>
        </MiniTile>
      </motion.div>
      <motion.p variants={riseItem} className="mt-3 text-center font-mono text-[10px] tracking-[0.14em] text-faint">
        reorder alerts surface here and on the overview
      </motion.p>
    </motion.div>
  )
}

/* -------------------------------- Orders --------------------------------- */

const FULFILMENT_STEPS = ['Placed', 'Packed', 'Shipped', 'Fulfilled']

const ORDER_ROWS = [
  { id: 'SO-1042', customer: 'Al Noor Hardware', total: 'AED 8,750', status: 'Fulfilled', tone: 'emerald' as const },
  { id: 'SO-1043', customer: 'Desert Rose Catering', total: 'AED 2,300', status: 'Shipped', tone: 'sky' as const },
  { id: 'SO-1044', customer: 'Gulf Print Works', total: 'AED 15,200', status: 'Packed', tone: 'amber' as const },
]

/** 03 — Orders: 4-step fulfilment tracker + 3 order rows. */
export function OrdersVisual() {
  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className="w-full max-w-[460px]">
      <motion.div variants={riseItem}>
        <MiniTile className="p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">SO-1043 · fulfilment</p>
            <StatusChip tone="sky">Shipped</StatusChip>
          </div>
          <div className="relative mt-5">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-ink-700" />
            <motion.div
              className="absolute left-0 top-1/2 h-0.5 origin-left -translate-y-1/2 rounded-full bg-amber-400"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              style={{ width: '66.7%' }}
              transition={{ duration: 1.2, ease: EASE_EXPO, delay: 0.3 }}
            />
            <div className="relative flex justify-between">
              {FULFILMENT_STEPS.map((step, i) => {
                const done = i < 2
                const current = i === 2
                return (
                  <div key={step} className="flex flex-col items-center gap-1.5">
                    <span
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border',
                        done && 'border-emerald-400 bg-emerald-400 text-ink-950',
                        current && 'border-sky-400 bg-ink-900 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.4)]',
                        !done && !current && 'border-ink-600 bg-ink-900 text-faint',
                      )}
                    >
                      {done ? <Check className="h-3 w-3" strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                    </span>
                    <span className={cn('font-mono text-[9.5px] uppercase tracking-[0.1em]', done || current ? 'text-fg' : 'text-faint')}>
                      {step}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </MiniTile>
      </motion.div>
      <motion.div variants={riseItem} className="mt-3">
        <MiniTile className="divide-y divide-ink-700/60 px-3.5">
          {ORDER_ROWS.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-3 py-2.5 transition-colors duration-200 hover:bg-amber-400/5"
            >
              <span className="w-[72px] shrink-0 font-mono text-[11px] text-faint">{order.id}</span>
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-fg">{order.customer}</span>
              <span className="hidden shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground sm:inline">
                {order.total}
              </span>
              <StatusChip tone={order.tone} className="w-[82px] justify-center">
                {order.status}
              </StatusChip>
            </div>
          ))}
        </MiniTile>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------- Invoicing ------------------------------- */

/** 04 — Invoicing: paper tax invoice with PAID stamp + 10 template dots. */
export function InvoicingVisual() {
  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className="flex w-full justify-center">
      <motion.div
        variants={riseItem}
        className="relative w-[264px] rotate-[-1.5deg] rounded-md bg-paper p-4 text-paper-ink shadow-[0_16px_40px_-12px_rgba(0,0,0,0.55)]"
      >
        <div className="flex items-baseline justify-between">
          <p className="font-display text-[13px] font-bold tracking-[0.04em]">TAX INVOICE</p>
          <p className="font-mono text-[10px] opacity-70">INV-1051</p>
        </div>
        <p className="mt-0.5 font-mono text-[9px] tracking-wide opacity-60">TRN 1003 8492 7610 003</p>
        <div className="mt-2.5 space-y-1.5 border-t border-paper-ink/15 pt-2.5">
          <div className="flex items-baseline justify-between text-[11px]">
            <span>Industrial shelving unit ×2</span>
            <span className="font-mono tabular-nums">1,700.00</span>
          </div>
          <div className="flex items-baseline justify-between text-[11px]">
            <span>Delivery &amp; installation</span>
            <span className="font-mono tabular-nums">2,650.00</span>
          </div>
        </div>
        <div className="mt-2.5 space-y-1 border-t border-paper-ink/15 pt-2">
          <div className="flex items-baseline justify-between text-[10.5px] opacity-70">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">4,350.00</span>
          </div>
          <div className="flex items-baseline justify-between text-[10.5px] opacity-70">
            <span>VAT 5%</span>
            <span className="font-mono tabular-nums">217.50</span>
          </div>
          <div className="flex items-baseline justify-between border-t border-paper-ink/20 pt-1.5">
            <span className="text-[11px] font-semibold">Total</span>
            <span className="font-mono text-[15px] font-bold tabular-nums">AED 4,567.50</span>
          </div>
        </div>
        {/* 10 template dots — one amber */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className={cn('h-1.5 w-1.5 rounded-full', i === 1 ? 'bg-amber-500' : 'bg-paper-ink/20')}
            />
          ))}
        </div>
        {/* PAID stamp — appears on activation */}
        <motion.span
          initial={{ scale: 2.2, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: -12 }}
          transition={{ duration: 0.35, ease: EASE_BACK, delay: 0.5 }}
          className="absolute right-3 top-[38%] rounded border-2 border-emerald-400/90 px-2 py-0.5 font-mono text-[13px] font-bold tracking-[0.2em] text-emerald-400"
        >
          PAID
        </motion.span>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------ Quotations ------------------------------- */

const QUOTE_LINES = [
  { item: 'Pallet jack', qty: '×1', disc: '−5%', tax: '+5% VAT', amount: 'AED 1,187.50' },
  { item: 'Industrial shelving unit', qty: '×2', disc: '−5%', tax: '+5% VAT', amount: 'AED 1,615.00' },
]

/** 05 — Quotations: quote doc with per-line discount/tax columns + convert button. */
export function QuotationsVisual() {
  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className="w-full max-w-[440px]">
      <motion.div variants={riseItem}>
        <MiniTile className="p-4">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-[14px] font-semibold text-fg">QUOTATION</p>
            <p className="font-mono text-[10px] text-faint">QT-0233 · Oasis Fitness</p>
          </div>
          <div className="mt-3 flex items-center gap-2 border-b border-ink-700/70 pb-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
            <span className="flex-1">Item</span>
            <span className="w-12 text-right">Qty</span>
            <span className="w-10 text-right">Disc</span>
            <span className="w-14 text-right">Tax</span>
            <span className="w-20 text-right">Amount</span>
          </div>
          <div className="divide-y divide-ink-700/50">
            {QUOTE_LINES.map((line) => (
              <div key={line.item} className="flex items-center gap-2 py-2 text-[12px]">
                <span className="min-w-0 flex-1 truncate text-fg">{line.item}</span>
                <span className="w-12 text-right font-mono text-[11px] text-faint">{line.qty}</span>
                <span className="w-10 text-right font-mono text-[11px] text-amber-300">{line.disc}</span>
                <span className="w-14 text-right font-mono text-[11px] text-muted-foreground">{line.tax}</span>
                <span className="w-20 text-right font-mono text-[11px] tabular-nums text-fg">{line.amount}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-ink-700/70 pt-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Valid 30 days</span>
            <span className="font-mono text-[13px] font-semibold tabular-nums text-fg">AED 2,802.50</span>
          </div>
        </MiniTile>
      </motion.div>
      <motion.div variants={riseItem} className="mt-3 flex justify-end">
        <span className="inline-flex cursor-default items-center gap-1.5 rounded-lg border border-ink-600 px-3.5 py-2 text-[12.5px] font-medium text-fg transition-all duration-200 hover:border-amber-400/50 hover:bg-amber-400/5 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]">
          Convert to invoice →
        </span>
      </motion.div>
    </motion.div>
  )
}
