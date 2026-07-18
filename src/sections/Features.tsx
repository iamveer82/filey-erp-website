import type { LucideIcon } from 'lucide-react'
import { BarChart3, FileStack, FileText, Package, ShoppingCart, Users } from 'lucide-react'
import SectionHeader from '@/components/SectionHeader'
import Reveal from '@/components/Reveal'

/* ---------------------------------- data ---------------------------------- */

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: FileText,
    title: 'Invoicing',
    description: 'FTA-compliant tax invoices with VAT, live preview and 10+ print-ready templates.',
  },
  {
    icon: Users,
    title: 'CRM pipeline',
    description: 'Drag deals across stages, track follow-ups and see your whole pipeline at a glance.',
  },
  {
    icon: Package,
    title: 'Inventory',
    description: 'Stock levels, reorder alerts and item history that update themselves as you sell.',
  },
  {
    icon: ShoppingCart,
    title: 'Orders & quoting',
    description: 'Quotes that convert to orders and invoices in one click — no re-typing.',
  },
  {
    icon: BarChart3,
    title: 'Reports',
    description: 'Revenue, expenses and statements of account that always reconcile.',
  },
  {
    icon: FileStack,
    title: 'PDF toolkit',
    description: 'Merge, split, compress and watermark PDFs — 100% local, files never leave your device.',
  },
]

/* --------------------------------- section -------------------------------- */

export default function Features() {
  return (
    <section id="features" className="relative border-t border-zinc-200 py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="01"
          label="features"
          title="Everything under one roof."
          lead="Invoicing, CRM, inventory, reports and a local PDF toolkit — every module included, no plugins to buy."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} y={24} delay={i * 0.06}>
              <div className="h-full rounded-xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-amber-400 hover:shadow-[0_12px_40px_-16px_rgba(245,158,11,0.18)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <feature.icon className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-zinc-900">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{feature.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
