import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { Check, FileText, Github, HardDrive, ShieldCheck, Star, Users, Wifi } from 'lucide-react'
import SectionHeader from '@/components/SectionHeader'
import Reveal from '@/components/Reveal'
import { Switch } from '@/components/ui/switch'
import { EASE_EXPO, SPRING } from '@/sections/modules/helpers'
import { cn } from '@/lib/utils'

/* ------------------------------ card shell ------------------------------- */

interface BentoCardProps {
  index: string
  title: string
  copy: string
  delay: number
  className?: string
  children: ReactNode
}

function BentoCard({ index, title, copy, delay, className, children }: BentoCardProps) {
  return (
    <Reveal delay={delay} start="top 85%" className={className}>
      <div className="group relative h-full rounded-xl border border-ink-700/70 bg-ink-850 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-mint-400/40 hover:shadow-[0_0_32px_rgba(52,211,153,0.08),inset_0_1px_0_rgba(255,255,255,0.04)]">
        <span className="absolute right-5 top-5 font-mono text-[11px] text-faint">{index}</span>
        <h3 className="max-w-[85%] font-display text-[clamp(1.25rem,2vw,1.625rem)] font-semibold leading-[1.15] tracking-[-0.015em] text-fg">
          {title}
        </h3>
        <p className="mt-2.5 text-sm leading-[1.6] text-muted-foreground">{copy}</p>
        {children}
      </div>
    </Reveal>
  )
}

/* --------------------------- A — offline-first --------------------------- */

function OfflineVisual() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [offline, setOffline] = useState(true)
  const [orders, setOrders] = useState(41)

  // KPI keeps ticking (random ±1 every 2.5s) once visible — still running offline.
  useEffect(() => {
    if (!inView) return
    const id = window.setInterval(() => {
      setOrders((v) => v + (Math.random() < 0.65 ? 1 : -1))
    }, 2500)
    return () => window.clearInterval(id)
  }, [inView])

  return (
    <div ref={ref} className="mt-6 grid gap-4 sm:grid-cols-2">
      {/* Connectivity state */}
      <div className="flex flex-col rounded-lg border border-ink-700 bg-ink-900/60 p-4">
        <div className="relative flex h-24 items-center justify-center">
          <Wifi
            className={cn('h-11 w-11 transition-colors duration-300', offline ? 'text-faint' : 'text-sky-400')}
            strokeWidth={1.5}
          />
          {/* strike-through when offline */}
          <motion.span
            initial={false}
            animate={{ scaleX: offline ? 1 : 0, opacity: offline ? 1 : 0 }}
            transition={{ duration: 0.3, ease: EASE_EXPO }}
            className="absolute h-[3px] w-16 origin-center -rotate-[24deg] rounded-full bg-rose-400"
          />
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-ink-700/60 pt-3">
          <div>
            <p className="text-[13px] font-medium text-fg">Go offline</p>
            <div className="mt-0.5 h-4">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={offline ? 'offline' : 'online'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className={cn('font-mono text-[10.5px]', offline ? 'text-mint-300' : 'text-sky-400')}
                >
                  {offline ? '● local SQLite — 0 ms latency' : '● online — optional Supabase sync'}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          <Switch checked={offline} onCheckedChange={setOffline} aria-label="Go offline" />
        </div>
      </div>

      {/* KPI that never stops counting */}
      <div className="flex flex-col rounded-lg border border-ink-700 bg-ink-900/60 p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Orders today</p>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-mint-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            live
          </span>
        </div>
        <div className="mt-3 flex h-11 items-baseline overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={orders}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE_EXPO }}
              className="font-mono text-4xl font-semibold tabular-nums text-fg"
            >
              {orders}
            </motion.span>
          </AnimatePresence>
        </div>
        <p className="mt-auto pt-3 font-mono text-[10px] leading-relaxed text-faint">
          keeps counting — no connection needed
        </p>
      </div>
    </div>
  )
}

/* --------------------------- B — open source ----------------------------- */

function OpenSourceVisual() {
  return (
    <div className="mt-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-600 text-fg">
          <Github className="h-[18px] w-[18px]" />
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 font-mono text-[11px] text-amber-300">
          <Star className="h-3 w-3 fill-amber-300" />
          Star on GitHub
        </span>
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-ink-700 bg-[#0A0F18] px-3.5 py-2.5">
        <p className="truncate font-mono text-[11.5px] leading-relaxed">
          <span className="text-mint-400">$ </span>
          <span className="text-fg">git clone</span>{' '}
          <span className="text-muted-foreground">https://github.com/iamveer82/Filey-erp.git</span>
        </p>
      </div>
    </div>
  )
}

/* ------------------------- C — privacy by design ------------------------- */

const PRIVACY_FILES = [
  { name: 'invoice.pdf', tone: 'text-mint-400' },
  { name: 'po.pdf', tone: 'text-sky-400' },
  { name: 'receipt.pdf', tone: 'text-amber-400' },
]

function PrivacyVisual() {
  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-2">
        {PRIVACY_FILES.map((f) => (
          <span
            key={f.name}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink-600 bg-ink-900 px-3 py-1.5 font-mono text-[11px] text-fg"
          >
            <FileText className={cn('h-3.5 w-3.5', f.tone)} />
            {f.name}
          </span>
        ))}
      </div>
      <div className="mt-3.5 flex items-center gap-2.5">
        <ShieldCheck className="h-4 w-4 text-mint-400" />
        <span className="font-mono text-[11px] text-faint line-through decoration-rose-400/70">uploading…</span>
        <span className="font-mono text-[11px] text-mint-300">0 bytes leave this device</span>
      </div>
    </div>
  )
}

/* ------------------------- D — FTA-ready invoicing ----------------------- */

function FtaVisual() {
  return (
    <div className="mt-5">
      <div className="w-fit rotate-[-1.5deg] rounded-md bg-paper p-3.5 text-paper-ink shadow-[0_12px_32px_-12px_rgba(0,0,0,0.55)]">
        <p className="font-display text-[11px] font-bold tracking-[0.06em]">TAX INVOICE</p>
        <p className="mt-0.5 font-mono text-[8.5px] tracking-wide opacity-60">TRN 1003 8492 7610 003</p>
        <div className="mt-2 flex items-baseline justify-between gap-6 border-t border-paper-ink/15 pt-1.5 text-[10.5px]">
          <span className="opacity-70">VAT 5%</span>
          <span className="font-mono font-semibold tabular-nums">AED 217.50</span>
        </div>
      </div>
    </div>
  )
}

/* ------------------------- E — signed auto-updates ----------------------- */

function UpdatesVisual() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [updated, setUpdated] = useState(false)

  useEffect(() => {
    if (!inView) return
    const t = window.setTimeout(() => setUpdated(true), 600)
    return () => window.clearTimeout(t)
  }, [inView])

  return (
    <div ref={ref} className="mt-5">
      <div className="relative h-9">
        {/* v2.2.0 */}
        <motion.div
          initial={false}
          animate={{ opacity: updated ? 0 : 1, y: updated ? -6 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-600 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
            v2.2.0
          </span>
        </motion.div>
        {/* v2.2.1 + animated check */}
        <motion.div
          initial={false}
          animate={{ opacity: updated ? 1 : 0, y: updated ? 0 : 6 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-mint-400/50 bg-mint-400/10 px-3 py-1.5 font-mono text-[11px] text-mint-300">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: updated ? 1 : 0 }}
              transition={{ ...SPRING, delay: 0.15 }}
              className="flex"
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </motion.span>
            v2.2.1 — up to date
          </span>
        </motion.div>
      </div>
      <p className="mt-3 font-mono text-[10px] text-faint">signed builds · updates itself</p>
    </div>
  )
}

/* --------------------------- F — optional cloud -------------------------- */

function CloudVisual() {
  const [cloud, setCloud] = useState(false)
  const options = [
    { id: false, label: 'Local', Icon: HardDrive },
    { id: true, label: 'Supabase', Icon: Users },
  ] as const

  return (
    <div className="mt-5">
      <div className="inline-flex rounded-full border border-ink-700 bg-ink-900/60 p-1">
        {options.map(({ id, label, Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => setCloud(id)}
            aria-pressed={cloud === id}
            className={cn(
              'relative rounded-full px-3.5 py-1.5 font-mono text-[11px] transition-colors duration-200',
              cloud === id ? 'text-mint-300' : 'text-muted-foreground hover:text-fg',
            )}
          >
            {cloud === id && (
              <motion.span
                layoutId="why-cloud-pill"
                className="absolute inset-0 rounded-full border border-mint-400/40 bg-mint-400/10"
                transition={SPRING}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-3 h-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={cloud ? 'cloud' : 'local'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className={cn('font-mono text-[10.5px]', cloud ? 'text-sky-400' : 'text-mint-300')}
          >
            {cloud ? '● Supabase cloud — optional' : '● Local SQLite'}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* -------------------------------- section -------------------------------- */

export default function WhyFiley() {
  return (
    <section id="why" className="relative border-t border-ink-700/60 py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader
          index="02"
          label="why filey"
          title="Software you own, not rent."
          lead="No subscriptions, no forced cloud, no telemetry. Filey ERP is built like software used to be — and updated like it should be."
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:auto-rows-[minmax(180px,auto)]">
          {/* A — Offline-first (large) */}
          <BentoCard
            index="01"
            title="Works where the internet doesn't"
            copy="Your data lives in a local SQLite database on your machine. Filey runs at full speed in a warehouse, a basement, or at 30,000 feet. Add Supabase cloud sync later if — and only if — you want multi-user access."
            delay={0}
            className="lg:col-span-7 lg:row-span-2"
          >
            <OfflineVisual />
          </BentoCard>

          {/* B — Open source */}
          <BentoCard
            index="02"
            title="AGPL-3.0. Free forever."
            copy="Every line is on GitHub. Audit it, fork it, modify it, use it commercially. No tiers, no seat limits, no feature gates."
            delay={0.09}
            className="lg:col-span-5"
          >
            <OpenSourceVisual />
          </BentoCard>

          {/* C — Privacy by design */}
          <BentoCard
            index="03"
            title="Your files never leave the device"
            copy="The PDF toolkit — merge, split, compress, watermark — runs 100% locally. Nothing is uploaded, ever. There is no server to breach."
            delay={0.18}
            className="lg:col-span-5"
          >
            <PrivacyVisual />
          </BentoCard>

          {/* D — FTA-ready invoicing */}
          <BentoCard
            index="04"
            title="UAE VAT, out of the box"
            copy="Generate FTA-compliant tax invoices with your TRN, branding and 5% VAT handled — 10 templates, live preview, print & PDF."
            delay={0.27}
            className="lg:col-span-4"
          >
            <FtaVisual />
          </BentoCard>

          {/* E — Signed auto-updates */}
          <BentoCard
            index="05"
            title="Updates like a commercial app"
            copy="Signed desktop builds that update themselves. No command line required to stay current."
            delay={0.36}
            className="lg:col-span-4"
          >
            <UpdatesVisual />
          </BentoCard>

          {/* F — Optional cloud */}
          <BentoCard
            index="06"
            title="Cloud when you choose"
            copy="Start solo and local. When the team grows, flip on Supabase for org multi-tenancy, RBAC and sync. Same app, your call."
            delay={0.45}
            className="lg:col-span-4"
          >
            <CloudVisual />
          </BentoCard>
        </div>
      </div>
    </section>
  )
}
