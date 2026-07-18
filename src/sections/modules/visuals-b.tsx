import { useEffect, useState } from 'react'
import { animate, motion } from 'framer-motion'
import { FileText, ScrollText, Users } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { EASE_EXPO, MiniTile, SPRING, StatusChip, riseItem, staggerParent } from './helpers'
import { cn } from '@/lib/utils'

/* ---------------------------------- CRM ---------------------------------- */

function DealCard({ company, value, moving = false }: { company: string; value: string; moving?: boolean }) {
  return (
    <motion.div
      layoutId={moving ? 'mx-crm-deal-oasis' : undefined}
      transition={SPRING}
      className={cn(
        'rounded-md border bg-ink-900 p-2 text-left',
        moving ? 'z-10 border-mint-400/50 shadow-[0_8px_24px_-8px_rgba(52,211,153,0.35)]' : 'border-ink-700',
      )}
    >
      <p className="truncate text-[11px] font-semibold text-fg">{company}</p>
      <p className="mt-0.5 font-mono text-[10px] tabular-nums text-amber-300">{value}</p>
    </motion.div>
  )
}

function WonTotal({ moved }: { moved: boolean }) {
  const [val, setVal] = useState(5400)
  useEffect(() => {
    if (!moved) return
    const controls = animate(5400, 47400, {
      duration: 0.8,
      delay: 0.4,
      ease: 'easeOut',
      onUpdate: (v) => setVal(Math.round(v)),
    })
    return () => controls.stop()
  }, [moved])
  return <>AED {val.toLocaleString('en-US')}</>
}

/** 06 — CRM: 3-column mini kanban; one deal springs New → Won on activation. */
export function CrmVisual() {
  const [moved, setMoved] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setMoved(true), 600)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className="w-full max-w-[460px]">
      <motion.div variants={riseItem} className="grid grid-cols-3 gap-2">
        {/* New */}
        <MiniTile className="p-2">
          <div className="mb-2 flex items-center justify-between px-0.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-sky-400">New</p>
            <span className="font-mono text-[10px] text-faint">{moved ? 1 : 2}</span>
          </div>
          <div className="space-y-1.5">
            <DealCard company="Al Noor Hardware" value="AED 24,000" />
            {!moved && <DealCard company="Oasis Fitness" value="AED 42,000" moving />}
          </div>
        </MiniTile>
        {/* Negotiation */}
        <MiniTile className="p-2">
          <div className="mb-2 flex items-center justify-between px-0.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-amber-300">Negotiation</p>
            <span className="font-mono text-[10px] text-faint">1</span>
          </div>
          <div className="space-y-1.5">
            <DealCard company="Sahara Logistics" value="AED 67,500" />
          </div>
        </MiniTile>
        {/* Won */}
        <MiniTile className={cn('p-2 transition-colors duration-300', moved && 'border-mint-400/40')}>
          <div className="mb-2 flex items-center justify-between px-0.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mint-400">Won</p>
            <span className="font-mono text-[10px] tabular-nums text-mint-300">
              <WonTotal moved={moved} />
            </span>
          </div>
          <div className="space-y-1.5">
            <DealCard company="Cedar Café" value="AED 5,400" />
            {moved && <DealCard company="Oasis Fitness" value="AED 42,000" moving />}
          </div>
        </MiniTile>
      </motion.div>
      <motion.p variants={riseItem} className="mt-3 text-center font-mono text-[10px] tracking-[0.14em] text-faint">
        every move is logged to the customer timeline
      </motion.p>
    </motion.div>
  )
}

/* ------------------------ Suppliers & Purchasing ------------------------- */

const SUPPLIERS = [
  { name: 'Gulf Metals', category: 'Metals', spend: 86400, pct: 100 },
  { name: 'Al Noor Packaging', category: 'Packaging', spend: 41200, pct: 48 },
  { name: 'Desert Logistics', category: 'Freight', spend: 28900, pct: 33 },
]

/** 07 — Suppliers & Purchasing: supplier rows with spend + mini horizontal bars. */
export function SuppliersVisual() {
  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className="w-full max-w-[440px]">
      <motion.div variants={riseItem}>
        <MiniTile className="divide-y divide-ink-700/60 px-3.5">
          {SUPPLIERS.map((s, i) => (
            <div key={s.name} className="py-2.5 transition-colors duration-200 hover:bg-mint-400/5">
              <div className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-fg">{s.name}</span>
                <StatusChip tone={i === 0 ? 'mint' : 'neutral'}>{s.category}</StatusChip>
                <span className="shrink-0 font-mono text-[11.5px] tabular-nums text-fg">
                  AED {s.spend.toLocaleString('en-US')}
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-700">
                <motion.div
                  className="h-full rounded-full bg-mint-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ duration: 1, ease: EASE_EXPO, delay: 0.25 + i * 0.12 }}
                />
              </div>
            </div>
          ))}
        </MiniTile>
      </motion.div>
      <motion.p variants={riseItem} className="mt-3 text-center font-mono text-[10px] tracking-[0.14em] text-faint">
        spend by supplier · trailing 12 months
      </motion.p>
    </motion.div>
  )
}

/* -------------------------------- Reports -------------------------------- */

const PL_ROWS = [
  { label: 'Revenue', value: 'AED 248,530.00', cls: 'text-fg' },
  { label: 'COGS', value: '−AED 141,220.00', cls: 'text-muted-foreground' },
  { label: 'VAT collected (5%)', value: '−AED 12,426.50', cls: 'text-muted-foreground' },
]

/** 08 — Reports: mini P&L summary that reconciles + statement chip. */
export function ReportsVisual() {
  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className="w-full max-w-[400px]">
      <motion.div variants={riseItem}>
        <MiniTile className="p-4">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-[14px] font-semibold text-fg">Profit &amp; loss</p>
            <p className="font-mono text-[10px] text-faint">Jul 2026</p>
          </div>
          <div className="mt-3">
            {PL_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between border-b border-ink-700/60 py-2 text-[12.5px]"
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className={cn('font-mono tabular-nums', row.cls)}>{row.value}</span>
              </div>
            ))}
            <div className="flex items-baseline justify-between pt-2.5">
              <span className="text-[13px] font-semibold text-fg">Net profit</span>
              <span className="font-mono text-[16px] font-semibold tabular-nums text-mint-300">AED 94,883.50</span>
            </div>
          </div>
        </MiniTile>
      </motion.div>
      <motion.div variants={riseItem} className="mt-3 flex justify-center">
        <StatusChip tone="mint" className="normal-case tracking-[0.04em]">
          Statement of account · 6 templates
        </StatusChip>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------ PDF Toolkit ------------------------------ */

const PDF_CHIPS = [
  { name: 'invoice.pdf', tone: 'text-mint-400', x: -104 },
  { name: 'po.pdf', tone: 'text-sky-400', x: 0 },
  { name: 'receipt.pdf', tone: 'text-amber-400', x: 104 },
]

/** 09 — PDF Toolkit: 3 file chips converge into one merged chip on activation. */
export function PdfToolkitVisual() {
  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className="w-full max-w-[440px]">
      <motion.div variants={riseItem}>
        <MiniTile className="relative h-28 overflow-hidden">
          {PDF_CHIPS.map((chip) => (
            <div key={chip.name} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.span
                initial={{ x: chip.x, opacity: 1, scale: 1 }}
                animate={{ x: 0, opacity: [1, 1, 0], scale: [1, 1, 0.6] }}
                transition={{
                  x: { duration: 0.7, ease: EASE_EXPO, delay: 0.15 },
                  opacity: { duration: 0.25, delay: 1.15, times: [0, 0.01, 1] },
                  scale: { duration: 0.25, delay: 1.15 },
                }}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-ink-600 bg-ink-900 px-3 py-1.5 font-mono text-[11px] text-fg"
              >
                <FileText className={cn('h-3.5 w-3.5', chip.tone)} />
                {chip.name}
              </motion.span>
            </div>
          ))}
          {/* merged result */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.25, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-mint-400/50 bg-mint-400/10 px-3.5 py-1.5 font-mono text-[11px] text-mint-300 shadow-[0_0_24px_rgba(52,211,153,0.2)]"
            >
              <FileText className="h-3.5 w-3.5" />
              merged.pdf
            </motion.span>
          </div>
        </MiniTile>
      </motion.div>
      <motion.p variants={riseItem} className="mt-3 text-center font-mono text-[10px] tracking-[0.14em] text-faint">
        merge · split · compress · watermark — files never leave this device
      </motion.p>
    </motion.div>
  )
}

/* -------------------------- Settings & Registry -------------------------- */

const REGISTRY_ROWS = [
  { id: 'invoicing', name: 'Invoicing', on: true },
  { id: 'crm', name: 'CRM', on: true },
  { id: 'pdf', name: 'PDF Toolkit', on: true },
  { id: 'payroll', name: 'Payroll', on: false },
]

/** 10 — Settings & Registry: working module toggles + users/roles + activity log rows. */
export function SettingsVisual() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(REGISTRY_ROWS.map((r) => [r.id, r.on])),
  )

  return (
    <motion.div variants={staggerParent} initial="hidden" animate="show" className="w-full max-w-[400px]">
      <motion.div variants={riseItem}>
        <MiniTile className="divide-y divide-ink-700/60 px-3.5">
          {REGISTRY_ROWS.map((row) => {
            const on = enabled[row.id] ?? false
            return (
              <div key={row.id} className="flex items-center gap-3 py-2.5">
                <span className={cn('flex-1 text-[12.5px] transition-colors duration-200', on ? 'text-fg' : 'text-faint')}>
                  {row.name}
                </span>
                <span className={cn('font-mono text-[10px] uppercase tracking-[0.12em]', on ? 'text-mint-300' : 'text-faint')}>
                  {on ? 'On' : 'Off'}
                </span>
                <Switch
                  checked={on}
                  onCheckedChange={(v) => setEnabled((prev) => ({ ...prev, [row.id]: v }))}
                  aria-label={`Enable ${row.name} module`}
                />
              </div>
            )
          })}
          <div className="flex items-center gap-3 py-2.5">
            <Users className="h-3.5 w-3.5 text-faint" />
            <span className="flex-1 text-[12.5px] text-fg">Users &amp; roles</span>
            <StatusChip>RBAC</StatusChip>
          </div>
          <div className="flex items-center gap-3 py-2.5">
            <ScrollText className="h-3.5 w-3.5 text-faint" />
            <span className="flex-1 text-[12.5px] text-fg">Activity log</span>
            <StatusChip tone="mint">Enabled</StatusChip>
          </div>
        </MiniTile>
      </motion.div>
      <motion.p variants={riseItem} className="mt-3 text-center font-mono text-[10px] tracking-[0.14em] text-faint">
        module registry — enable only what you use
      </motion.p>
    </motion.div>
  )
}
