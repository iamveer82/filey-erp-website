import { memo, useRef, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, useScroll } from 'framer-motion'
import { useGSAP } from '@gsap/react'
import {
  BarChart3,
  Download,
  FileText,
  LayoutDashboard,
  Package,
  Play,
  Plus,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import AppWindow from '@/components/AppWindow'
import MagneticButton from '@/components/MagneticButton'
import { gsap, prefersReducedMotion, scrollToHash } from '@/lib/scroll'
import { RELEASES_URL, RELEASE_TAG, downloadUrlForOS } from '@/lib/constants'
import { detectOS } from '@/lib/os'
import { cn } from '@/lib/utils'

gsap.registerPlugin(useGSAP)

/* ---------------------------------- data --------------------------------- */

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: BarChart3, label: 'Reports', active: false },
  { icon: ShoppingCart, label: 'Orders', active: false },
  { icon: FileText, label: 'Invoicing', active: false },
  { icon: Users, label: 'CRM', active: false },
  { icon: Package, label: 'Inventory', active: false },
  { icon: Wallet, label: 'Accounting', active: false },
]

const KPIS = [
  { label: 'Revenue', value: 'AED 13,730.75', delta: '+12.4%', up: true, red: false },
  { label: 'Orders', value: '24', delta: '+8.2%', up: true, red: false },
  { label: 'Active customers', value: '6', delta: '+3.1%', up: true, red: false },
  { label: 'Outstanding', value: 'AED 10,710.75', delta: '-4.6%', up: false, red: true },
]

/** 8 days — Invoiced (amber gradient bars) vs Received (white bars), relative heights. */
const SALES_BARS = [
  { d: 'Sat', inv: 72, rec: 55 },
  { d: 'Sun', inv: 48, rec: 44 },
  { d: 'Mon', inv: 84, rec: 63 },
  { d: 'Tue', inv: 58, rec: 52 },
  { d: 'Wed', inv: 92, rec: 70 },
  { d: 'Thu', inv: 66, rec: 60 },
  { d: 'Fri', inv: 78, rec: 58 },
  { d: 'Sat', inv: 52, rec: 47 },
]

const RECENT_INVOICES = [
  { id: 'INV-1045', customer: 'Northwind Labs', amount: 'AED 2400.00', status: 'Paid' },
  { id: 'INV-1046', customer: 'Contoso Ltd', amount: 'AED 1180.50', status: 'Pending' },
  { id: 'INV-1047', customer: 'Fabrikam Inc', amount: 'AED 3990.00', status: 'Overdue' },
] as const

const STATUS_PILL: Record<(typeof RECENT_INVOICES)[number]['status'], string> = {
  Paid: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400',
  Pending: 'border-amber-400/40 bg-amber-400/10 text-amber-400',
  Overdue: 'border-red-400/40 bg-red-400/10 text-red-400',
}

/* --------------------------- perpetual micro-anim ------------------------ */

const FloatLoop = memo(function FloatLoop({
  children,
  className,
  duration = 6,
  distance = 8,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  duration?: number
  distance?: number
  delay?: number
}) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {children}
    </motion.div>
  )
})

function DecoTag({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <div className={cn('hero-tag absolute z-10 hidden xl:block', className)}>
      <FloatLoop duration={6} distance={8} delay={delay}>
        <span className="rounded-full border border-zinc-200 bg-white/80 px-3 py-1 font-mono text-[11px] text-zinc-500 backdrop-blur-sm">
          {children}
        </span>
      </FloatLoop>
    </div>
  )
}

/* ----------------------------- app-window mock ---------------------------- */

function OverviewMock() {
  return (
    <div>
      {/* top bar */}
      <div className="-mx-3.5 -mt-3.5 flex items-center justify-between gap-3 border-b border-ink-700 px-4 py-3 sm:-mx-4 sm:-mt-4">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-fg">Welcome back, Shaban</p>
          <p className="font-mono text-[10px] text-faint">Sat, Jul 18 2026</p>
        </div>
        <span className="btn-gradient inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[11.5px] font-semibold text-[#1A1206]">
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          New Invoice
        </span>
      </div>

      {/* KPI cards */}
      <div className="mt-3.5 grid grid-cols-2 gap-2">
        {KPIS.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-ink-700/70 bg-ink-900/60 p-2.5">
            <p className="truncate font-mono text-[9px] uppercase tracking-[0.12em] text-faint">{kpi.label}</p>
            <p className="mt-1 truncate font-mono text-[12.5px] font-semibold tabular-nums text-fg">{kpi.value}</p>
            <p
              className={cn(
                'mt-1 flex items-center gap-1 font-mono text-[9.5px] tabular-nums',
                kpi.red ? 'text-red-400' : 'text-emerald-400',
              )}
            >
              {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {kpi.delta}
            </p>
          </div>
        ))}
      </div>

      {/* sales vs payments bar chart */}
      <div className="mt-2.5 rounded-lg border border-ink-700/70 bg-ink-900/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-mono text-[9.5px] uppercase tracking-[0.12em] text-faint">
            Sales vs Payments received
          </p>
          <div className="flex shrink-0 items-center gap-3 font-mono text-[9px] text-faint">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-2.5 rounded-[2px] bg-amber-400" />
              Invoiced
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-2.5 rounded-[2px] bg-fg/85" />
              Received
            </span>
          </div>
        </div>
        <div className="mt-3 flex h-24 items-end gap-1.5 sm:h-28">
          {SALES_BARS.map((bar, i) => (
            <div key={i} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1">
              <div className="flex items-end justify-center gap-[3px]">
                <div
                  className="w-1.5 rounded-[2px] bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 sm:w-2"
                  style={{ height: `${(bar.inv / 100) * 88}px` }}
                />
                <div
                  className="w-1.5 rounded-[2px] bg-fg/85 sm:w-2"
                  style={{ height: `${(bar.rec / 100) * 88}px` }}
                />
              </div>
              <span className="text-center font-mono text-[8px] uppercase tracking-wide text-faint">{bar.d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* recent invoices */}
      <div className="mt-2.5 rounded-lg border border-ink-700/70 bg-ink-900/60 px-3">
        <div className="flex items-center justify-between border-b border-ink-700/60 py-2">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-faint">Recent invoices</p>
          <p className="font-mono text-[9px] text-faint">July</p>
        </div>
        <div className="divide-y divide-ink-700/50">
          {RECENT_INVOICES.map((inv) => (
            <div key={inv.id} className="flex items-center gap-2.5 py-2">
              <span className="w-[62px] shrink-0 font-mono text-[10px] text-faint">{inv.id}</span>
              <span className="min-w-0 flex-1 truncate text-[11.5px] text-fg">{inv.customer}</span>
              <span className="hidden shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground sm:inline">
                {inv.amount}
              </span>
              <span
                className={cn(
                  'shrink-0 rounded-full border px-2 py-px font-mono text-[9px] uppercase tracking-[0.08em]',
                  STATUS_PILL[inv.status],
                )}
              >
                {inv.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OverviewSidebar() {
  return (
    <nav aria-label="Modules" className="flex w-11 flex-col gap-0.5 px-1.5 py-3 sm:w-40 sm:px-2">
      {/* Filey logo */}
      <div className="mb-2.5 flex items-center gap-2 px-1.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-400 font-display text-[12px] font-bold text-ink-950">
          F
        </span>
        <span className="hidden text-[13px] font-semibold tracking-tight text-fg sm:inline">
          Filey <span className="font-medium text-amber-400">ERP</span>
        </span>
      </div>
      {SIDEBAR_ITEMS.map((item) => (
        <span
          key={item.label}
          className={cn(
            'relative flex h-8 items-center justify-center gap-2.5 rounded-md sm:justify-start sm:px-2.5',
            item.active ? 'bg-amber-400/10 text-amber-400' : 'text-faint',
          )}
        >
          {item.active && (
            <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-amber-400" />
          )}
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="hidden truncate text-[12px] font-medium sm:inline">{item.label}</span>
        </span>
      ))}
    </nav>
  )
}

/* ---------------------------------- hero --------------------------------- */

export default function Hero() {
  const [os] = useState(() => detectOS())
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  // scroll cue fade (hides after 40px scrolled)
  const { scrollY } = useScroll()
  const cueOpacity = useTransform(scrollY, [0, 40], [1, 0])

  // pointer tilt (±2°, spring; disabled on touch / reduced motion)
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const tiltRX = useSpring(tiltX, { stiffness: 160, damping: 18 })
  const tiltRY = useSpring(tiltY, { stiffness: 160, damping: 18 })

  const onTiltMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced || window.matchMedia('(pointer: coarse)').matches) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    tiltY.set(px * 4) // rotateY ±2°
    tiltX.set(-py * 4) // rotateX ±2°
  }
  const onTiltLeave = () => {
    tiltX.set(0)
    tiltY.set(0)
  }

  useGSAP(
    () => {
      if (prefersReducedMotion()) return

      // load choreography (starts 0.2s after mount)
      const tl = gsap.timeline({ delay: 0.2, defaults: { ease: 'expo.out' } })
      tl.fromTo(
        '.hero-eyebrow',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5 },
      )
        .fromTo(
          '.hero-word',
          { yPercent: 110, rotate: 3 },
          { yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.055 },
          '-=0.15',
        )
        .fromTo('.hero-lead', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.6')
        .fromTo(
          '.hero-cta',
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
          '-=0.45',
        )
        .fromTo('.hero-proof', { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.15')
        .fromTo(
          '.hero-window',
          { opacity: 0, y: 60, rotateX: 10, transformPerspective: 1200 },
          { opacity: 1, y: 0, rotateX: 0, duration: 1.1 },
          '-=0.9',
        )
        .fromTo('.hero-tag', { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.1 }, '-=0.8')

      // on-scroll parallax (first 100vh, scrubbed)
      gsap.to('.hero-window-wrap', {
        y: -60,
        ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.hero-tag', {
        y: -120,
        ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    { scope: sectionRef },
  )

  const handleHash = (e: MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault()
    scrollToHash(hash)
  }

  return (
    <section id="top" ref={sectionRef} className="relative -mt-16 overflow-hidden">
      {/* floating decorative mono tags */}
      <DecoTag className="right-10 top-28" delay={0}>
        Offline-first
      </DecoTag>
      <DecoTag className="left-8 top-1/2" delay={1.2}>
        FTA-compliant ✓
      </DecoTag>
      <DecoTag className="bottom-36 right-24" delay={2.4}>
        One-time Pro — pay once
      </DecoTag>

      <div className="relative mx-auto grid min-h-[100svh] max-w-7xl grid-cols-1 items-center gap-16 px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-12 lg:pb-16 lg:pt-16">
        {/* ------------------------------ left column ------------------------------ */}
        <div className="lg:col-span-6">
          <div className="hero-headline">
            {/* eyebrow chip */}
            <div className="hero-eyebrow flex flex-wrap items-center gap-3">
              <a
                href={RELEASES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 font-mono text-[11px] text-zinc-600 transition-colors duration-200 hover:border-amber-400 hover:text-zinc-900"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60 motion-reduce:hidden" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                </span>
                {RELEASE_TAG} — now available
              </a>
            </div>

            {/* H1 — word-split, 3 masked lines */}
            <h1 className="mt-7 font-display text-[clamp(2.75rem,6vw,5rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-zinc-900">
              <span className="block overflow-hidden pb-[0.12em]">
                <span className="hero-word inline-block will-change-transform">Invoicing,</span>{' '}
                <span className="hero-word inline-block will-change-transform">CRM</span>{' '}
                <span className="hero-word inline-block will-change-transform">&amp;</span>{' '}
                <span className="hero-word inline-block will-change-transform">inventory.</span>
              </span>
              <span className="block overflow-hidden pb-[0.12em]">
                <span className="hero-word inline-block will-change-transform">One</span>{' '}
                <span className="hero-word inline-block will-change-transform">desktop</span>{' '}
                <span className="hero-word inline-block will-change-transform">app.</span>
              </span>
              <span className="block overflow-hidden pb-[0.14em]">
                <span className="hero-word inline-block text-amber-600 will-change-transform">Works</span>{' '}
                <span className="hero-word inline-block text-amber-600 will-change-transform">fully</span>{' '}
                <span className="hero-word inline-block text-amber-600 will-change-transform">offline.</span>
              </span>
            </h1>
          </div>

          {/* lead */}
          <p className="hero-lead mt-6 max-w-xl text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-[1.6] text-zinc-600">
            Filey ERP runs your whole business — FTA-compliant tax invoices, orders, customers and stock —
            from one signed desktop app. Free to start: 20 invoices a month, offline included.
          </p>

          {/* CTA row */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton className="hero-cta">
              <a
                href={downloadUrlForOS(os)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gradient inline-flex h-11 items-center gap-2 rounded-lg px-6 text-[15px] font-semibold text-[#1A1206] transition-all duration-200 active:scale-[0.98]"
              >
                <Download className="h-[18px] w-[18px]" />
                Download free
              </a>
            </MagneticButton>
            <MagneticButton className="hero-cta">
              <a
                href="#demo"
                onClick={(e) => handleHash(e, '#demo')}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-zinc-300 px-6 text-[15px] font-semibold text-zinc-900 transition-colors duration-200 hover:border-amber-500 hover:bg-amber-50 active:scale-[0.98]"
              >
                <Play className="h-4 w-4 text-amber-600" />
                Try the live demo
              </a>
            </MagneticButton>
          </div>

          {/* micro-proof row */}
          <p className="hero-proof mt-8 font-mono text-[11px] text-zinc-400">
            {RELEASE_TAG} <span className="mx-2 text-zinc-300">·</span> 18.9 MB Windows{' '}
            <span className="mx-2 text-zinc-300">·</span> Linux builds{' '}
            <span className="mx-2 text-zinc-300">·</span> No subscription
          </p>
        </div>

        {/* ------------------------------ right column ----------------------------- */}
        <div className="lg:col-span-6">
          <div className="hero-window-wrap relative mx-auto w-full max-w-[560px] lg:max-w-none">
            <FloatLoop duration={7} distance={10} className="relative">
              {/* mobile 0.9 scale lives on its own wrapper to avoid transform clashes */}
              <div className="max-lg:scale-90 max-lg:[transform-origin:top_center]">
                <motion.div
                  className="hero-window rounded-2xl shadow-[0_24px_80px_-24px_rgba(245,158,11,0.25)]"
                  style={{ rotateX: tiltRX, rotateY: tiltRY, transformPerspective: 1000 }}
                  onMouseMove={onTiltMove}
                  onMouseLeave={onTiltLeave}
                >
                  <AppWindow
                    title="Filey ERP — Overview"
                    contentClassName="p-3.5 sm:p-4"
                    sidebar={<OverviewSidebar />}
                  >
                    <OverviewMock />
                  </AppWindow>
                </motion.div>
              </div>
            </FloatLoop>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <motion.div
        style={{ opacity: cueOpacity }}
        className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        aria-hidden
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">scroll</span>
        <span className="h-8 w-px animate-scroll-cue bg-amber-400/70 motion-reduce:animate-none" />
      </motion.div>
    </section>
  )
}
