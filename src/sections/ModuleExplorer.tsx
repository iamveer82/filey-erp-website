import { useCallback, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SectionHeader from '@/components/SectionHeader'
import Reveal from '@/components/Reveal'
import { EASE_EXPO, riseItem, staggerParent } from '@/sections/modules/helpers'
import {
  InventoryVisual,
  InvoicingVisual,
  OrdersVisual,
  OverviewVisual,
  QuotationsVisual,
} from '@/sections/modules/visuals-a'
import {
  CrmVisual,
  PdfToolkitVisual,
  ReportsVisual,
  SettingsVisual,
  SuppliersVisual,
} from '@/sections/modules/visuals-b'
import { cn } from '@/lib/utils'

interface ModuleDef {
  id: string
  name: string
  role: string
  bullets: string[]
  Visual: ComponentType
}

const MODULES: ModuleDef[] = [
  {
    id: 'overview',
    name: 'Overview',
    role: 'The whole business at a glance',
    bullets: [
      'Revenue, orders & low-stock KPIs in one glance',
      'Revenue vs expenses, 12 months',
      'Live activity feed from every module',
    ],
    Visual: OverviewVisual,
  },
  {
    id: 'inventory',
    name: 'Inventory',
    role: 'Stock that counts itself',
    bullets: [
      'SKU catalog with live stock levels',
      'Low-stock & reorder alerts built in',
      'Categories, adjustments & stock counts',
    ],
    Visual: InventoryVisual,
  },
  {
    id: 'orders',
    name: 'Orders',
    role: 'From quote to fulfilled',
    bullets: [
      'Placed → packed → shipped → fulfilled tracking',
      'Linked directly to quotes & invoices',
      'Every status visible at a glance',
    ],
    Visual: OrdersVisual,
  },
  {
    id: 'invoicing',
    name: 'Invoicing',
    role: 'FTA-compliant, out of the box',
    bullets: [
      '10 templates with live preview',
      'Optional VAT, auto-filled company branding',
      'Print & PDF export',
    ],
    Visual: InvoicingVisual,
  },
  {
    id: 'quotations',
    name: 'Quotations',
    role: 'Quotes that close faster',
    bullets: [
      'Per-line discounts & VAT columns',
      'Convert to invoice in one click',
      'Same 10-template engine as invoicing',
    ],
    Visual: QuotationsVisual,
  },
  {
    id: 'crm',
    name: 'CRM',
    role: 'A pipeline you can drag',
    bullets: [
      'Drag-and-drop kanban stages',
      'Live deal totals per column',
      'Every move logged to the customer timeline',
    ],
    Visual: CrmVisual,
  },
  {
    id: 'suppliers',
    name: 'Suppliers & Purchasing',
    role: 'Buy smarter, spend visibly',
    bullets: [
      'Supplier directory with spend totals',
      'Purchase orders, quote to receipt',
      'Spend by supplier at a glance',
    ],
    Visual: SuppliersVisual,
  },
  {
    id: 'reports',
    name: 'Reports',
    role: 'Numbers that reconcile',
    bullets: [
      'Revenue, COGS, VAT & net — always reconciled',
      'Statement of account with 6 templates',
      'Print-ready PDF exports',
    ],
    Visual: ReportsVisual,
  },
  {
    id: 'pdf',
    name: 'PDF Toolkit',
    role: '100% local. Zero uploads.',
    bullets: [
      'Merge, split, compress & watermark',
      'Files never leave this device',
      'Powered by pdf-lib — no server needed',
    ],
    Visual: PdfToolkitVisual,
  },
  {
    id: 'settings',
    name: 'Settings & Registry',
    role: 'Your ERP, your way',
    bullets: [
      'Enable only the modules you use',
      'Users & roles with permissions',
      'Full activity log',
    ],
    Visual: SettingsVisual,
  },
]

function indexLabel(i: number): string {
  return String(i + 1).padStart(2, '0')
}

export default function ModuleExplorer() {
  const [active, setActive] = useState(0)
  const hoverTimer = useRef<number | null>(null)
  const mod = MODULES[active]

  const clearHoverTimer = useCallback(() => {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current)
      hoverTimer.current = null
    }
  }, [])

  /** Hover activates tabs on desktop with an 80ms intent delay. */
  const handleHover = useCallback(
    (i: number) => {
      if (!window.matchMedia('(min-width: 1024px)').matches) return
      clearHoverTimer()
      hoverTimer.current = window.setTimeout(() => setActive(i), 80)
    },
    [clearHoverTimer],
  )

  return (
    <section id="features" className="relative border-t border-ink-700/60 py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="01"
          label="modules"
          title="Everything under one roof."
          lead="Nine business modules plus a module registry — enable only what you use, Odoo-style. Click through the stack:"
        />

        <div className="grid gap-10 lg:grid-cols-12">
          {/* Mobile: horizontal scroll-snap pill row */}
          <Reveal className="lg:hidden" y={24}>
            <div
              role="tablist"
              aria-label="Modules"
              className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 [scroll-snap-type:x_mandatory] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {MODULES.map((m, i) => (
                <button
                  key={m.id}
                  role="tab"
                  aria-selected={active === i}
                  onClick={() => setActive(i)}
                  className={cn(
                    'shrink-0 snap-start rounded-full border px-3.5 py-1.5 font-mono text-[11px] transition-colors duration-200',
                    active === i
                      ? 'border-mint-400/50 bg-mint-400/10 text-mint-300'
                      : 'border-ink-700 text-muted-foreground hover:border-ink-600 hover:text-fg',
                  )}
                >
                  {indexLabel(i)} · {m.name}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Desktop: vertical tab list (lg:col-span-5) */}
          <div role="tablist" aria-label="Modules" className="hidden flex-col gap-2 lg:col-span-5 lg:flex">
            {MODULES.map((m, i) => {
              const isActive = active === i
              return (
                <Reveal key={m.id} delay={i * 0.05} y={24}>
                  <button
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(i)}
                    onMouseEnter={() => handleHover(i)}
                    onMouseLeave={clearHoverTimer}
                    className={cn(
                      'relative flex w-full items-center gap-4 overflow-hidden rounded-lg border px-4 py-3 text-left transition-colors duration-200',
                      isActive
                        ? 'border-mint-400/50 bg-mint-400/5'
                        : 'border-ink-700/70 hover:border-ink-600 hover:bg-ink-800/40',
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="module-tab-bar"
                        className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-mint-400"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span
                      className={cn(
                        'w-6 shrink-0 font-mono text-[11px] transition-colors duration-200',
                        isActive ? 'text-mint-400' : 'text-faint',
                      )}
                    >
                      {indexLabel(i)}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-[18px] font-semibold leading-[1.15] tracking-[-0.015em] text-fg">
                        {m.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{m.role}</span>
                    </span>
                  </button>
                </Reveal>
              )
            })}
          </div>

          {/* Stage panel (lg:col-span-7) */}
          <Reveal className="lg:col-span-7" y={32}>
            <div className="min-h-[420px] overflow-hidden rounded-xl border border-ink-700/70 bg-ink-850 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:min-h-[480px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.35, ease: EASE_EXPO }}
                  className="flex min-h-[372px] flex-col lg:min-h-[432px]"
                >
                  {/* Panel header: mono index + name + role */}
                  <div className="flex items-baseline gap-3 border-b border-ink-700/60 pb-4">
                    <span className="font-mono text-[11px] text-mint-400">{indexLabel(active)}</span>
                    <h3 className="font-display text-[22px] font-semibold leading-none tracking-[-0.015em] text-fg">
                      {mod.name}
                    </h3>
                    <span className="hidden truncate font-mono text-[11px] text-faint sm:inline">{mod.role}</span>
                  </div>

                  {/* Mini-visual (~280px, centered) */}
                  <div className="flex min-h-[280px] flex-1 items-center justify-center py-6">
                    <mod.Visual />
                  </div>

                  {/* Bullets */}
                  <motion.ul
                    variants={staggerParent}
                    initial="hidden"
                    animate="show"
                    className="space-y-1.5 border-t border-ink-700/60 pt-4"
                  >
                    {mod.bullets.map((b) => (
                      <motion.li key={b} variants={riseItem} className="flex items-baseline text-sm text-muted-foreground">
                        <span className="mr-2 text-mint-400">▸</span>
                        {b}
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
