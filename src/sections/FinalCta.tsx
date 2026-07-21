import { useRef } from 'react'
import type { MouseEvent } from 'react'
import { useGSAP } from '@gsap/react'
import { Download } from 'lucide-react'
import MagneticButton from '@/components/MagneticButton'
import { gsap, prefersReducedMotion, scrollToHash } from '@/lib/scroll'

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
      tl.fromTo('.fc-eyebrow', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 })
        .fromTo(
          '.fc-word',
          { yPercent: 110 },
          { yPercent: 0, duration: 0.9, stagger: 0.06 },
          '-=0.2',
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

  const handlePricing = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollToHash('#pricing')
  }

  return (
    <section id="get-started" ref={sectionRef} className="relative border-t border-zinc-200">
      <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
        <p className="fc-eyebrow font-mono text-xs font-medium uppercase tracking-[0.18em] text-amber-600">
          {'// '}ready when you are
        </p>

        <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.0] tracking-[-0.03em] text-zinc-900">
          <span className="block overflow-hidden pb-[0.14em]">
            <span className="fc-word inline-block will-change-transform">Run</span>{' '}
            <span className="fc-word inline-block will-change-transform">your</span>{' '}
            <span className="fc-word inline-block will-change-transform">business.</span>
          </span>
          <span className="block overflow-hidden pb-[0.18em]">
            <span className="fc-word inline-block text-amber-600 will-change-transform">Own</span>{' '}
            <span className="fc-word inline-block text-amber-600 will-change-transform">your</span>{' '}
            <span className="fc-word inline-block text-amber-600 will-change-transform">tools.</span>
          </span>
        </h2>

        <p className="fc-reveal mx-auto mt-6 max-w-xl text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-[1.6] text-zinc-600">
          Download Filey ERP free — 20 invoices a month, offline included. Upgrade to Pro once,
          whenever you&rsquo;re ready.
        </p>

        <div className="fc-reveal mt-9 flex flex-wrap items-center justify-center gap-3">
          <MagneticButton>
            <a
              href="#download"
              onClick={handleDownload}
              className="btn-gradient inline-flex h-[52px] items-center gap-2 rounded-lg px-8 text-base font-semibold text-[#1A1206] transition-all duration-200 hover:shadow-[0_0_24px_rgba(251,191,36,0.3)] active:scale-[0.98]"
            >
              <Download className="h-5 w-5" />
              Download free
            </a>
          </MagneticButton>
          <MagneticButton>
            <a
              href="#pricing"
              onClick={handlePricing}
              className="inline-flex h-[52px] items-center gap-2 rounded-lg border border-zinc-300 px-8 text-base font-semibold text-zinc-900 transition-colors duration-200 hover:border-amber-500 hover:bg-amber-50 active:scale-[0.98]"
            >
              See pricing
            </a>
          </MagneticButton>
        </div>

        <p className="fc-reveal mt-7 font-mono text-[11px] text-zinc-400">
          18.9 MB{' '}
          <span className="mx-2 text-zinc-300">·</span> no subscription
        </p>
      </div>
    </section>
  )
}
