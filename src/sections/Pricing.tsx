import { Check } from 'lucide-react'
import Reveal from '@/components/Reveal'
import { cn } from '@/lib/utils'

/* ---------------------------------- data ---------------------------------- */

const FREE_FEATURES = [
  '20 invoices / month',
  'Offline mode — data stays on your device',
  'Invoicing, CRM & inventory',
  '3 invoice templates',
  'Community support',
]

const PRO_FEATURES = [
  'Unlimited invoices',
  'Full offline access to every module',
  'All 10+ FTA-compliant templates',
  'PDF toolkit — merge, split, compress, watermark',
  'Reports & statements of account',
  'Automatic updates',
  'Priority support',
]

/* ------------------------------- feature list ------------------------------ */

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-8 border-t border-zinc-100">
      {items.map((f) => (
        <li
          key={f}
          className="flex items-start gap-3 border-b border-zinc-100 py-3 text-sm leading-[1.55] text-zinc-600"
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
          {f}
        </li>
      ))}
    </ul>
  )
}

/* --------------------------------- section --------------------------------- */

export default function Pricing() {
  return (
    <section id="pricing" className="relative border-t border-zinc-200 py-28 lg:py-40">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* centered header — SectionHeader rhythm, light */}
        <Reveal className="mx-auto mb-14 max-w-3xl text-center lg:mb-20" y={24} duration={0.9} start="top 80%">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-amber-600">
            {'// '}03 — pricing
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.0] tracking-[-0.03em] text-zinc-900">
            Simple, honest pricing.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-[1.6] text-zinc-600">
            Start free. Upgrade once — own it forever. No subscriptions.
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
          {/* ------------------------------- Free ------------------------------- */}
          <Reveal delay={0.1} className="h-full">
            <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-zinc-900">Free</h3>
              </div>
              <p className="mt-6 font-display text-5xl font-semibold tracking-[-0.03em] text-zinc-900">$0</p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">forever</p>

              <FeatureList items={FREE_FEATURES} />

              <div className="mt-auto pt-8">
                <a
                  href="#download"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-zinc-300 text-sm font-semibold text-zinc-900 transition-colors duration-200 hover:border-amber-500 hover:bg-amber-50 active:scale-[0.98]"
                >
                  Download free
                </a>
              </div>
            </div>
          </Reveal>

          {/* -------------------------------- Pro -------------------------------- */}
          <Reveal delay={0.2} className="h-full">
            <div className="relative flex h-full flex-col rounded-xl border border-amber-400 bg-white p-8 shadow-[0_8px_40px_-12px_rgba(245,158,11,0.25)]">
              <span className="btn-gradient absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[#1A1206]">
                Most popular
              </span>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-zinc-900">Pro</h3>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-amber-600">
                  One-time payment
                </span>
              </div>
              <p className="mt-6 font-display text-5xl font-semibold tracking-[-0.03em] text-zinc-900">$49</p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">
                pay once, own it forever
              </p>

              <FeatureList items={PRO_FEATURES} />

              <div className="mt-auto pt-8">
                <a
                  href="#download"
                  className={cn(
                    'btn-gradient inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold text-[#1A1206]',
                    'transition-all duration-200 hover:shadow-[0_0_28px_rgba(251,191,36,0.25)] active:scale-[0.98]',
                  )}
                >
                  Get Pro — $49 once
                </a>
                <p className="mt-3 text-center font-mono text-[10.5px] text-zinc-400">
                  Lifetime license · 30-day money-back guarantee
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.3} y={16}>
          <p className="mt-8 text-center font-mono text-[11px] text-zinc-400">
            Prices in USD. VAT may apply at checkout.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
