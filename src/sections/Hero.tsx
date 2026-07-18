import { memo, useRef, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useGSAP } from '@gsap/react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import {
  Download,
  FileText,
  LayoutDashboard,
  Package,
  Play,
  ShoppingCart,
  TrendingUp,
  Users,
  Wrench,
} from 'lucide-react'
import AppWindow from '@/components/AppWindow'
import MagneticButton from '@/components/MagneticButton'
import { gsap, prefersReducedMotion, scrollToHash } from '@/lib/scroll'
import { RELEASES_URL, RELEASE_CODENAME, RELEASE_TAG, downloadUrlForOS, osLabel } from '@/lib/constants'
import { detectOS } from '@/lib/os'
import { cn } from '@/lib/utils'

gsap.registerPlugin(useGSAP)

/* ---------------------------------- data --------------------------------- */

const CHART = [
  { m: 'Aug', rev: 21, exp: 15 },
  { m: 'Sep', rev: 24, exp: 16 },
  { m: 'Oct', rev: 23, exp: 17 },
  { m: 'Nov', rev: 27, exp: 18 },
  { m: 'Dec', rev: 31, exp: 19 },
  { m: 'Jan', rev: 29, exp: 20 },
  { m: 'Feb', rev: 33, exp: 21 },
  { m: 'Mar', rev: 36, exp: 22 },
  { m: 'Apr', rev: 35, exp: 23 },
  { m: 'May', rev: 40, exp: 24 },
  { m: 'Jun', rev: 44, exp: 26 },
  { m: 'Jul', rev: 48, exp: 27 },
]

const RAIL_ICONS = [LayoutDashboard, Package, ShoppingCart, FileText, Users, Wrench]

const ACTIVITY = [
  { dot: 'bg-mint-400', text: 'Invoice #1042 paid', value: 'AED 8,750' },
  { dot: 'bg-sky-400', text: 'PO sent to Gulf Metals', value: '#0088' },
  { dot: 'bg-amber-400', text: 'Stock alert: Hex bolt M8', value: '12 left' },
]

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
        <span className="rounded-full border border-ink-600 bg-ink-900/70 px-3 py-1 font-mono text-[11px] text-faint backdrop-blur-sm">
          {children}
        </span>
      </FloatLoop>
    </div>
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
        .fromTo('.hero-word-serif', { skewY: 4 }, { skewY: 0, duration: 0.9 }, '<+0.1')
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
        .fromTo('.hero-glow', { opacity: 0 }, { opacity: 1, duration: 1.4 }, '<')
        .fromTo('.hero-tag', { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.1 }, '-=1.0')

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
      gsap.to('.hero-headline', {
        y: 30,
        opacity: 0.4,
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
      {/* background layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 left-1/2 h-[640px] w-[1200px] -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(52,211,153,0.07), transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 hidden h-full w-1/2 lg:block"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(52,211,153,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 60% 45%, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 60% 45%, black 20%, transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-10 left-1/4 h-[420px] w-[600px] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(251,191,36,0.05), transparent 70%)' }}
      />

      {/* floating decorative mono tags */}
      <DecoTag className="right-10 top-28" delay={0}>
        SQLite · local-first
      </DecoTag>
      <DecoTag className="left-8 top-1/2" delay={1.2}>
        AGPL-3.0
      </DecoTag>
      <DecoTag className="bottom-36 right-24" delay={2.4}>
        FTA-compliant ✓
      </DecoTag>

      <div className="relative mx-auto grid min-h-[100svh] max-w-7xl grid-cols-1 items-center gap-16 px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-12 lg:pb-16 lg:pt-16">
        {/* ------------------------------ left column ------------------------------ */}
        <div className="lg:col-span-6">
          <div className="hero-headline">
            {/* eyebrow row */}
            <div className="hero-eyebrow flex flex-wrap items-center gap-3">
              <a
                href={RELEASES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ink-600 px-3 py-1 font-mono text-[11px] text-muted-foreground transition-colors duration-200 hover:border-mint-400/40 hover:text-fg"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint-400 opacity-60 motion-reduce:hidden" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint-400" />
                </span>
                {RELEASE_TAG} &ldquo;{RELEASE_CODENAME}&rdquo; — now shipping
              </a>
              <span className="h-1 w-1 rounded-full bg-ink-600" aria-hidden />
              <a
                href={RELEASES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] text-faint transition-colors duration-200 hover:text-muted-foreground"
              >
                Free &amp; open-source · AGPL-3.0
              </a>
            </div>

            {/* H1 — word-split, 3 masked lines */}
            <h1 className="mt-7 font-display text-[clamp(3rem,8vw,7rem)] font-bold leading-[0.95] tracking-[-0.035em] text-fg">
              <span className="block overflow-hidden pb-[0.14em]">
                <span className="hero-word inline-block will-change-transform">Your</span>{' '}
                <span className="hero-word inline-block will-change-transform">business.</span>
              </span>
              <span className="block overflow-hidden pb-[0.14em]">
                <span className="hero-word inline-block will-change-transform">Your</span>{' '}
                <span className="hero-word inline-block text-mint-400 will-change-transform">data.</span>
              </span>
              <span className="block overflow-hidden pb-[0.18em]">
                <span className="hero-word inline-block will-change-transform">Your</span>{' '}
                <span className="hero-word hero-word-serif inline-block font-serif font-normal italic text-mint-300 will-change-transform">
                  rules.
                </span>
              </span>
            </h1>
          </div>

          {/* lead */}
          <p className="hero-lead mt-6 max-w-xl text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-[1.6] text-muted-foreground">
            Filey ERP is a free, open-source ERP &amp; CRM for small businesses — inventory, orders,
            FTA-compliant invoicing and a drag-and-drop sales pipeline in one signed desktop app. It works
            fully offline. Your files never leave your machine.
          </p>

          {/* CTA row */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton className="hero-cta">
              <a
                href={downloadUrlForOS(os)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-mint-400 px-6 text-[15px] font-semibold text-ink-950 transition-all duration-200 hover:bg-mint-300 hover:shadow-[0_0_24px_rgba(52,211,153,0.25)] active:scale-[0.98] active:bg-mint-500"
              >
                <Download className="h-[18px] w-[18px]" />
                Download for {osLabel(os)}
              </a>
            </MagneticButton>
            <MagneticButton className="hero-cta">
              <a
                href="#demo"
                onClick={(e) => handleHash(e, '#demo')}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-ink-600 px-6 text-[15px] font-semibold text-fg transition-colors duration-200 hover:border-mint-400/50 hover:bg-mint-400/5 active:scale-[0.98]"
              >
                <Play className="h-4 w-4 text-mint-400" />
                Try the live demo
              </a>
            </MagneticButton>
          </div>
          <div>
            <a
              href="#run-locally"
              onClick={(e) => handleHash(e, '#run-locally')}
              className="hero-cta group mt-4 inline-flex items-center gap-1.5 font-mono text-[13px] text-muted-foreground transition-colors duration-200 hover:text-mint-400"
            >
              or run from source — 5 commands
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>

          {/* micro-proof row */}
          <p className="hero-proof mt-8 font-mono text-[11px] text-faint">
            {RELEASE_TAG} <span className="mx-2 text-ink-600">·</span> 18.9 MB Windows installer{' '}
            <span className="mx-2 text-ink-600">·</span> Linux builds{' '}
            <span className="mx-2 text-ink-600">·</span> No account required
          </p>
        </div>

        {/* ------------------------------ right column ----------------------------- */}
        <div className="lg:col-span-6">
          <div className="hero-window-wrap relative mx-auto w-full max-w-[560px] lg:max-w-none">
            {/* mint glow layer */}
            <div
              aria-hidden
              className="hero-glow absolute -inset-8 rounded-full bg-mint-400/25 blur-3xl"
            />
            <FloatLoop duration={7} distance={10} className="relative">
              {/* mobile 0.9 scale lives on its own wrapper to avoid transform clashes */}
              <div className="max-lg:scale-90 max-lg:[transform-origin:top_center]">
                <motion.div
                  className="hero-window"
                  style={{ rotateX: tiltRX, rotateY: tiltRY, transformPerspective: 1000 }}
                  onMouseMove={onTiltMove}
                  onMouseLeave={onTiltLeave}
                >
                <AppWindow
                  title="Filey ERP — Overview"
                  contentClassName="p-3.5 sm:p-4"
                  sidebar={
                    <div className="flex w-14 flex-col items-stretch gap-1 px-2 py-3">
                      {RAIL_ICONS.map((Icon, i) => (
                        <div
                          key={i}
                          className={cn(
                            'relative flex h-10 items-center justify-center rounded-lg transition-colors duration-200',
                            i === 0
                              ? 'bg-mint-400/10 text-mint-400'
                              : 'text-faint hover:bg-ink-700/40 hover:text-muted-foreground',
                          )}
                        >
                          {i === 0 && (
                            <span className="absolute -left-2 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-mint-400" />
                          )}
                          <Icon className="h-[18px] w-[18px]" />
                        </div>
                      ))}
                    </div>
                  }
                >
                  {/* KPI cards */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="rounded-lg border border-ink-700/70 bg-ink-900/60 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Revenue</p>
                      <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-fg sm:text-base">
                        AED 48,250
                      </p>
                      <p className="mt-1 flex items-center gap-1 font-mono text-[10px] text-mint-400">
                        <TrendingUp className="h-3 w-3" />
                        12.4%
                      </p>
                    </div>
                    <div className="rounded-lg border border-ink-700/70 bg-ink-900/60 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Open orders</p>
                      <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-fg sm:text-base">132</p>
                      <p className="mt-1 flex items-center gap-1 font-mono text-[10px] text-sky-400">
                        <TrendingUp className="h-3 w-3" />8 this week
                      </p>
                    </div>
                    <div className="rounded-lg border border-ink-700/70 bg-ink-900/60 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Low stock</p>
                      <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-amber-400 sm:text-base">7</p>
                      <p className="mt-1 font-mono text-[10px] text-faint">2 critical</p>
                    </div>
                  </div>

                  {/* revenue vs expenses chart */}
                  <div className="mt-2.5 h-36 rounded-lg border border-ink-700/70 bg-ink-900/60 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={CHART} margin={{ top: 8, right: 6, left: 6, bottom: 2 }}>
                        <defs>
                          <linearGradient id="heroRevFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#34D399" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="rev"
                          stroke="#34D399"
                          strokeWidth={2}
                          fill="url(#heroRevFill)"
                          isAnimationActive={!reduced}
                          animationDuration={1200}
                          dot={false}
                        />
                        <Area
                          type="monotone"
                          dataKey="exp"
                          stroke="#FBBF24"
                          strokeWidth={1.5}
                          fill="none"
                          isAnimationActive={!reduced}
                          animationDuration={1200}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* activity feed */}
                  <div className="mt-2.5 space-y-1.5">
                    {ACTIVITY.map((row) => (
                      <div
                        key={row.text}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors duration-200 hover:bg-mint-400/5"
                      >
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className={cn('h-1.5 w-1.5 rounded-full', row.dot)} />
                          {row.text}
                        </span>
                        <span className="font-mono text-[11px] tabular-nums text-faint">{row.value}</span>
                      </div>
                    ))}
                  </div>
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
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">scroll</span>
        <span className="h-8 w-px animate-scroll-cue bg-mint-400/70 motion-reduce:animate-none" />
      </motion.div>
    </section>
  )
}
