import Reveal from '@/components/Reveal'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const QA = [
  {
    q: 'Is Filey ERP a subscription?',
    a: 'No. The Free plan costs nothing forever — 20 invoices a month with offline mode. Pro is a single one-time payment: pay once and own your license forever, updates included.',
  },
  {
    q: 'What happens when I hit 20 invoices in a month?',
    a: "Nothing scary — your data stays put and everything keeps working; you just can't create new invoices until the month rolls over or you upgrade to Pro for unlimited invoicing.",
  },
  {
    q: 'Does it work without internet?',
    a: 'Yes. Filey is offline-first: your data lives in a local database on your machine and every core feature works with no connection at all.',
  },
  {
    q: 'Is there a macOS version?',
    a: 'We ship signed Windows and Linux installers. On macOS you can build from source in about ten minutes — the Run locally section above walks through it.',
  },
  {
    q: 'Is my data private?',
    a: 'Completely. Your business data never leaves your device unless you choose to connect your own cloud workspace. The PDF toolkit processes files 100% locally.',
  },
]

export default function Faq() {
  return (
    <section id="faq" className="relative border-t border-zinc-200 py-28 lg:py-40">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        {/* centered header — SectionHeader rhythm, light */}
        <Reveal className="mx-auto mb-10 max-w-3xl text-center lg:mb-12" y={24} duration={0.9} start="top 80%">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-amber-600">
            {'// '}06 — faq
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.0] tracking-[-0.03em] text-zinc-900">
            Fair questions.
          </h2>
        </Reveal>
        <Accordion type="single" collapsible>
          {QA.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.08} y={24} duration={0.6}>
              <AccordionItem
                value={`item-${i}`}
                className="rounded-lg border-zinc-200 px-4 transition-colors duration-200 data-[state=open]:bg-white"
              >
                <AccordionTrigger className="py-5 font-display text-[17px] font-semibold text-zinc-900 hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-[15px] leading-[1.65] text-zinc-600">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            </Reveal>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
