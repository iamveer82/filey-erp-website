import { memo, useRef } from 'react'
import type { MouseEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useGSAP } from '@gsap/react'
import { Download, Star } from 'lucide-react'
import MagneticButton from '@/components/MagneticButton'
import { gsap, prefersReducedMotion, scrollToHash } from '@/lib/scroll'
import { RELEASE_TAG, REPO_URL } from '@/lib/constants'

const MASCOT_SRC = `${import.meta.env.BASE_URL}mascot.png`

/* ------------------------------ waving mascot ------------------------------ */

const WavingMascot = memo(function WavingMascot() {
  const reduced = useReducedMotion()
  if (reduced) {
    return (
      <img
        src={MASCOT_SRC}
        alt=""
        width={140}
        height={140}
        loading="lazy"
        className="mx-auto h-[140px] w-[140px] drop-shadow-[0_12px_32px_rgba(0,0,0,0.55)]"
      />
    )
  }
  return (
    <motion.div
      initial={{ y: -24, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ type: 'spring', stiffness: 170, damping: 12 }}
      className="mx-auto w-fit"
    >
      <motion.div
        animate={{ rotate: [-3, 3] }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      >
        <img
          src={MASCOT_SRC}
          alt=""
          width={140}
          height={140}
          loading="lazy"
          className="h-[140px] w-[140px] drop-shadow-[0_12px_32px_rgba(0,0,0,0.55)]"
        />
      </motion.div>
    </motion.div>
  )
})

/* --------------------------------- section --------------------------------- */

export default function FinalCta() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
      })
      tl.fromTo(
        '.fc-glow',
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' },
      )
        .fromTo('.fc-eyebrow', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.9')
        .fromTo(
          '.fc-word',
          { yPercent: 110 },
          { yPercent: 0, duration: 0.9, stagger: 0.06 },
          '-=0.3',
        )
        .fromTo(
          '.fc-reveal',
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 },
          '-=0.5',
        )
    },
    { scope: sectionRef },
  )

  const handleDownload = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollToHash('#download')
  }

  return (
    <section id="get-started" ref={sectionRef} className="relative overflow-hidden border-t border-ink-700/60">
      {/* strongest mint glow of the page */}
      <div
        aria-hidden
        className="fc-glow pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(52,211,153,0.12), transparent 70%)' }}
      />
      {/* dot grid masked behind */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(52,211,153,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 60% 55% at 50% 50%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 55% at 50% 50%, black 20%, transparent 75%)',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-5 py-36 text-center sm:px-8">
        <WavingMascot />

        <p className="fc-eyebrow mt-8 font-mono text-xs font-medium uppercase tracking-[0.18em] text-mint-400">
          {'// '}ready when you are
        </p>

        <h2 className="mt-5 font-display text-[clamp(3rem,8vw,7rem)] font-bold leading-[0.95] tracking-[-0.035em] text-fg">
          <span className="block overflow-hidden pb-[0.14em]">
            <span className="fc-word inline-block will-change-transform">Stop</span>{' '}
            <span className="fc-word inline-block will-change-transform">renting</span>{' '}
            <span className="fc-word inline-block will-change-transform">your</span>{' '}
            <span className="fc-word inline-block will-change-transform">software.</span>{' '}
          </span>
          <span className="block overflow-hidden pb-[0.18em]">
            <span className="fc-word inline-block font-serif font-normal italic text-mint-300 will-change-transform">
              Own
            </span>{' '}
            <span className="fc-word inline-block will-change-transform">your</span>{' '}
            <span className="fc-word inline-block will-change-transform">tools.</span>
          </span>
        </h2>

        <p className="fc-reveal mx-auto mt-6 max-w-xl text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-[1.6] text-muted-foreground">
          Download Filey ERP {RELEASE_TAG} — free forever, offline-first, open source. Your first
          invoice is five minutes away.
        </p>

        <div className="fc-reveal mt-9 flex flex-wrap items-center justify-center gap-3">
          <MagneticButton>
            <a
              href="#download"
              onClick={handleDownload}
              className="inline-flex h-[52px] items-center gap-2 rounded-lg bg-mint-400 px-8 text-base font-semibold text-ink-950 transition-all duration-200 hover:bg-mint-300 hover:shadow-[0_0_24px_rgba(52,211,153,0.25)] active:scale-[0.98] active:bg-mint-500"
            >
              <Download className="h-5 w-5" />
              Download Filey ERP
            </a>
          </MagneticButton>
          <MagneticButton>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[52px] items-center gap-2 rounded-lg border border-ink-600 px-8 text-base font-semibold text-fg transition-colors duration-200 hover:border-mint-400/50 hover:bg-mint-400/5 active:scale-[0.98]"
            >
              <Star className="h-[18px] w-[18px] text-amber-400" />
              Star on GitHub
            </a>
          </MagneticButton>
        </div>

        <p className="fc-reveal mt-7 font-mono text-[11px] text-faint">
          18.9 MB <span className="mx-2 text-ink-600">·</span> AGPL-3.0{' '}
          <span className="mx-2 text-ink-600">·</span> no account required
        </p>
      </div>
    </section>
  )
}
