import { useRef, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Bot,
  Download,
  FileText,
  LayoutDashboard,
  Package,
  Plus,
  Receipt,
  ShoppingCart,
  Users,
} from 'lucide-react'
import { downloadUrlForOS } from '@/lib/constants'
import { detectOS } from '@/lib/os'
import { cn } from '@/lib/utils'

/* ---------------------------------- data --------------------------------- */

const SIDEBAR = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Bot, label: 'Filey AI', active: false },
  { icon: FileText, label: 'Invoicing', active: false },
  { icon: ShoppingCart, label: 'Orders', active: false },
  { icon: Package, label: 'Inventory', active: false },
  { icon: Users, label: 'Customers', active: false },
  { icon: Receipt, label: 'Receipts', active: false },
  { icon: BarChart3, label: 'Reports', active: false },
]

const KPIS = [
  { label: 'Revenue', value: 'AED 13,730.75', change: '+12.4% vs prior 30d' },
  { label: 'Outstanding', value: 'AED 10,710.75', change: 'Awaiting payment', warn: true },
  { label: 'Customers', value: '6', change: 'In directory' },
  { label: 'Open orders', value: '8', change: 'In progress' },
]

const RECENT = [
  { id: 'INV-1045', customer: 'Northwind Labs', amount: 'AED 2,400.00', status: 'paid' },
  { id: 'INV-1046', customer: 'Contoso Ltd', amount: 'AED 1,180.50', status: 'sent' },
  { id: 'INV-1047', customer: 'Fabrikam Inc', amount: 'AED 3,990.00', status: 'draft' },
]

const STATUS_STYLE: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700',
  sent: 'bg-sky-50 text-sky-700',
  draft: 'bg-zinc-100 text-zinc-500',
}

/* ------------------------------ reveal anim ------------------------------ */

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------ app preview ------------------------------ */

function AppPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      {/* window chrome */}
      <div className="flex h-10 items-center gap-2 border-b border-zinc-100 px-4">
        <span className="h-3 w-3 rounded-full bg-zinc-200" />
        <span className="h-3 w-3 rounded-full bg-zinc-200" />
        <span className="h-3 w-3 rounded-full bg-zinc-200" />
        <span className="ml-3 text-[11px] font-medium text-zinc-400">Filey ERP</span>
      </div>

      <div className="flex">
        {/* sidebar */}
        <div className="hidden w-44 shrink-0 border-r border-zinc-100 bg-zinc-50/50 p-2 sm:block">
          {SIDEBAR.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={cn(
                'mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12.5px] transition-colors',
                active ? 'bg-zinc-100 font-medium text-zinc-900' : 'text-zinc-400'
              )}
            >
              <Icon size={15} strokeWidth={1.75} />
              {label}
            </div>
          ))}
        </div>

        {/* dashboard */}
        <div className="min-w-0 flex-1 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-zinc-900">Dashboard</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Live view of your business</p>
            </div>
            <span className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-zinc-900 px-3 text-[11px] font-semibold text-white">
              <Plus size={12} /> New Invoice
            </span>
          </div>

          {/* KPI cards — MetricCard style */}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {KPIS.map((k) => (
              <div key={k.label} className="rounded-xl border border-zinc-200 bg-white p-3">
                <p className="truncate text-[10.5px] text-zinc-400">{k.label}</p>
                <p className="mt-0.5 truncate text-[15px] font-semibold leading-tight tracking-tight tabular-nums text-zinc-900">{k.value}</p>
                <p className={cn('mt-0.5 text-[9.5px] font-medium', k.warn ? 'text-amber-600' : 'text-emerald-600')}>{k.change}</p>
              </div>
            ))}
          </div>

          {/* recent invoices */}
          <div className="mt-3 rounded-xl border border-zinc-200">
            <div className="border-b border-zinc-100 px-3 py-2">
              <p className="text-[12px] font-semibold text-zinc-900">Recent invoices</p>
            </div>
            {RECENT.map((r) => (
              <div key={r.id} className="flex items-center justify-between border-b border-zinc-50 px-3 py-2 last:border-0">
                <span className="text-[12px] font-medium text-zinc-800">{r.id}</span>
                <span className="hidden text-[11.5px] text-zinc-400 sm:inline">{r.customer}</span>
                <span className="text-[12px] tabular-nums text-zinc-800">{r.amount}</span>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium capitalize', STATUS_STYLE[r.status])}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>

          {/* AI hint */}
          <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
              <Bot size={14} />
            </span>
            <p className="text-[11.5px] text-zinc-600">
              <span className="font-medium text-zinc-800">Filey AI</span> — ask it to draft an invoice, chase a payment, or merge a PDF.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------- section -------------------------------- */

export default function Hero() {
  const os = detectOS()
  const reduced = useReducedMotion()
  const previewRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced || !previewRef.current) return
    const rect = previewRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -4, y: x * 6 })
  }

  return (
    <section className="relative overflow-hidden">
      {/* warm paper + amber glow — matches the desktop app's background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 45% at 50% -10%, rgba(245,158,11,0.06), transparent 70%), #fafaf9',
          }}
        />
      </div>

      <div className="container-page pt-20 pb-16 text-center lg:pt-28 lg:pb-24">
        {/* headline */}
        <Reveal>
          <h1 className="mx-auto max-w-3xl text-[clamp(2.5rem,5.5vw,4.5rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-zinc-900">
            Invoicing, CRM &amp; inventory.
            <br />
            <span className="text-amber-600">With an AI agent built in.</span>
          </h1>
        </Reveal>

        {/* subtitle */}
        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-2xl text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-[1.6] text-zinc-600">
            Filey ERP runs your whole business — FTA-compliant tax invoices, orders, customers
            and stock — with an AI agent that drafts documents, chases payments and answers
            on WhatsApp. Free to start.
          </p>
        </Reveal>

        {/* CTAs */}
        <Reveal delay={0.2}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={downloadUrlForOS(os)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <Download size={16} /> Download for {os === 'macos' ? 'macOS' : os === 'linux' ? 'Linux' : 'Windows'}
            </a>
            <a href="#demo" className="btn-ghost">
              See it in action <ArrowRight size={15} />
            </a>
          </div>
          <p className="mt-3 text-[12px] text-zinc-400">
            Free forever — 5 invoices a month, cloud sync included. No credit card.
          </p>
        </Reveal>

        {/* app preview */}
        <Reveal delay={0.3} className="relative mx-auto mt-16 max-w-4xl">
          <div
            ref={previewRef}
            onMouseMove={onMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            style={{
              transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            <AppPreview />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
