import SectionHeader from '@/components/SectionHeader'
import Reveal from '@/components/Reveal'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const MASCOT_SRC = `${import.meta.env.BASE_URL}mascot.png`

const QA = [
  {
    q: 'Is Filey ERP really free?',
    a: "Yes. It's AGPL-3.0 open source: no subscriptions, no seat limits, no feature gates, no telemetry. You can use it commercially, modify it, and self-host it forever.",
  },
  {
    q: 'Does it work without internet?',
    a: 'Fully. The desktop app runs on a local SQLite database — invoicing, inventory, CRM and the PDF toolkit all work offline. Supabase cloud sync is optional, for teams that want multi-user access.',
  },
  {
    q: 'Is there a macOS version?',
    a: 'Not as a prebuilt download yet. Because Filey is a standard Tauri project, macOS users can build a signed .dmg from source in about five minutes: git clone, npm ci, npm run tauri build. Signed macOS builds are on the public roadmap.',
  },
  {
    q: 'Where does my data live?',
    a: 'On your machine. Your database is a local file, and the PDF toolkit processes documents locally — files never leave your device. If you enable Supabase, your data lives in your own Supabase project, which you control.',
  },
  {
    q: 'Can I use it for my business / modify it?',
    a: "Yes — AGPL-3.0 explicitly allows commercial use and modification. If you distribute a modified version, you must share its source under the same license. That's the whole deal.",
  },
]

export default function Faq() {
  return (
    <section id="faq" className="relative border-t border-ink-700/60 py-28 lg:py-40">
      {/* mascot, mirrored, left of the header (xl only) */}
      <img
        src={MASCOT_SRC}
        alt=""
        width={100}
        height={100}
        loading="lazy"
        aria-hidden
        className="pointer-events-none absolute left-[max(2rem,calc(50%-44rem))] top-28 hidden h-[100px] w-[100px] -scale-x-100 drop-shadow-[0_10px_24px_rgba(0,0,0,0.5)] xl:block"
      />
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeader index="08" label="faq" title="Fair questions." align="center" className="mb-10 lg:mb-12" />
        <Accordion type="single" collapsible>
          {QA.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.08} y={24} duration={0.6}>
              <AccordionItem value={`item-${i}`} className="border-ink-700/60">
                <AccordionTrigger className="py-5 font-display text-[17px] font-semibold text-fg hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-[15px] leading-[1.65] text-muted-foreground">
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
