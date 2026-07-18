import { useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { FileText, LayoutDashboard, Package, ShoppingCart, Users, Wrench } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AppWindow from '@/components/AppWindow'
import Reveal from '@/components/Reveal'
import SectionHeader from '@/components/SectionHeader'
import DemoCrm from '@/sections/demo/DemoCrm'
import DemoDashboard from '@/sections/demo/DemoDashboard'
import DemoInventory from '@/sections/demo/DemoInventory'
import DemoInvoicing from '@/sections/demo/DemoInvoicing'
import { cn } from '@/lib/utils'

type DemoTab = 'dashboard' | 'invoicing' | 'crm' | 'inventory'

const TABS: { id: DemoTab; label: string; icon: typeof LayoutDashboard; rail: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, rail: 'Overview' },
  { id: 'invoicing', label: 'Invoicing', icon: FileText, rail: 'Invoicing' },
  { id: 'crm', label: 'CRM board', icon: Users, rail: 'CRM' },
  { id: 'inventory', label: 'Inventory', icon: Package, rail: 'Inventory' },
]

/** Decorative rail-only modules (not part of the demo tabs). */
const RAIL_EXTRA = [
  { icon: ShoppingCart, label: 'Orders' },
  { icon: Wrench, label: 'Settings' },
]

export default function LiveDemo() {
  const [tab, setTab] = useState<DemoTab>('dashboard')
  const sectionRef = useRef<HTMLElement>(null)
  // Activity-feed interval pauses when the section scrolls off-screen
  const inView = useInView(sectionRef, { amount: 0.15 })

  return (
    <section id="demo" ref={sectionRef} className="relative border-t border-ink-700/60 py-28 lg:py-40">
      {/* amber glow behind the demo window */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(251,191,36,0.06), transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHeader
          index="03"
          label="live demo"
          title="Don't watch. Do."
          lead="A hands-on slice of the real app — edit an invoice, drag deals through the pipeline, sort stock. No sign-up needed."
          aside={
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-amber-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute h-full w-full animate-ping rounded-full bg-amber-400 opacity-60 motion-reduce:hidden" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-amber-400" />
              </span>
              demo mode — sample data
            </span>
          }
        />

        <Reveal y={60} duration={0.9} start="top 75%">
          <div className="relative mx-auto max-w-[1200px]">
            <div
              aria-hidden
              className="absolute -inset-8 rounded-full bg-amber-400/10 blur-3xl"
            />
            <AppWindow
              title="Filey ERP — Demo workspace"
              className="relative"
              contentClassName="p-0 lg:p-0"
              sidebar={
                <nav aria-label="Demo modules" className="flex w-14 flex-col items-stretch gap-1 px-2 py-3 lg:w-44">
                  {TABS.map((t) => {
                    const active = tab === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        aria-label={t.rail}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'relative flex h-10 items-center justify-center gap-2.5 rounded-lg transition-colors duration-200 lg:justify-start lg:px-3',
                          active ? 'bg-amber-400/10 text-amber-400' : 'text-faint hover:bg-ink-700/40 hover:text-muted-foreground',
                        )}
                      >
                        {active && (
                          <span className="absolute -left-2 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-amber-400" />
                        )}
                        <t.icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="hidden text-[13px] font-medium lg:inline">{t.rail}</span>
                      </button>
                    )
                  })}
                  <span className="mx-2 my-1 h-px bg-ink-700/70 lg:mx-3" aria-hidden />
                  {RAIL_EXTRA.map((r) => (
                    <span
                      key={r.label}
                      aria-hidden
                      className="flex h-10 items-center justify-center gap-2.5 rounded-lg text-faint/50 lg:justify-start lg:px-3"
                    >
                      <r.icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="hidden text-[13px] font-medium lg:inline">{r.label}</span>
                    </span>
                  ))}
                </nav>
              }
            >
              {/* tab bar */}
              <Tabs value={tab} onValueChange={(v) => setTab(v as DemoTab)}>
                <div className="border-b border-ink-700 bg-ink-900/40 px-3 py-2">
                  <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0">
                    {TABS.map((t) => (
                      <TabsTrigger
                        key={t.id}
                        value={t.id}
                        className="relative flex-none rounded-md border-transparent px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.12em] text-muted-foreground shadow-none transition-colors duration-200 hover:text-fg data-[state=active]:bg-amber-400/10 data-[state=active]:text-amber-400 data-[state=active]:shadow-none dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-amber-400/10 dark:data-[state=active]:text-amber-400"
                      >
                        {t.label}
                        {tab === t.id && (
                          <motion.span
                            layoutId="demo-tab-underline"
                            className="absolute inset-x-2 -bottom-[9px] h-0.5 rounded-full bg-amber-400"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </Tabs>

              {/* panel area — mount-on-activate, crossfade + rise */}
              <div className="min-h-[560px] p-4 lg:p-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                    exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
                  >
                    {tab === 'dashboard' && <DemoDashboard running={inView} />}
                    {tab === 'invoicing' && <DemoInvoicing />}
                    {tab === 'crm' && <DemoCrm />}
                    {tab === 'inventory' && <DemoInventory />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </AppWindow>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
