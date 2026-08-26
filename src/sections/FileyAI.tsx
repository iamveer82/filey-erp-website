import { Bot, FileText, MessageCircle, Mic, Sparkles } from 'lucide-react'
import Reveal from '@/components/Reveal'
import FileyBot from '@/components/FileyBot'
import { cn } from '@/lib/utils'

/* ---------------------------------- data ---------------------------------- */

const CAPABILITIES = [
  {
    icon: FileText,
    title: 'Drafts documents',
    desc: '"PO for Rennox, OIL SN 500, qty 39.22, rate 3890" — it decodes your words and fills every field.',
  },
  {
    icon: MessageCircle,
    title: 'Answers on WhatsApp',
    desc: 'Pair your number and the agent responds to messages, sends PDFs and voice replies — from your phone.',
  },
  {
    icon: Sparkles,
    title: 'Runs tools for you',
    desc: 'Merge PDFs, chase overdue invoices, look up any record — it uses the same tools you do, in the background.',
  },
  {
    icon: Mic,
    title: 'Voice input & output',
    desc: 'Speak your request, hear the answer. Voice notes on WhatsApp are transcribed and acted on.',
  },
]

/* ------------------------------ mock chat --------------------------------- */

const CHAT = [
  { role: 'user' as const, text: 'Draft a purchase order for Rennox, I\u2019m buying OIL SN 500, qty 39.22 and rate is 3890' },
  { role: 'agent' as const, text: 'Purchase order PO-20260718-4821 created.\n\n· Supplier: Rennox\n· OIL SN 500 × 39.22 @ 3,890 = AED 152,660\n\nOpen Purchase Orders to review and send.' },
]

/* --------------------------------- section --------------------------------- */

export default function FileyAI() {
  return (
    <section id="ai" className="relative border-t border-zinc-200 py-28 lg:py-36">
      <div className="container-page">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* copy */}
          <div>
            <Reveal>
              <p className="label-mono">{'// '}02 — Filey AI</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-4 text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-zinc-900">
                Not a chatbot.
                <br />
                <span className="text-amber-600">An agent that works.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-lg text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-[1.6] text-zinc-600">
                Filey AI has full tool access — everything you can do in the app, it can do
                for you. It plans multi-step tasks, delegates to sub-agents, and asks for
                approval before anything irreversible.
              </p>
            </Reveal>

            <div className="mt-8 space-y-5">
              {CAPABILITIES.map((c, i) => (
                <Reveal key={c.title} delay={0.15 + i * 0.06}>
                  <div className="flex items-start gap-3.5">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600">
                      <c.icon size={16} />
                    </span>
                    <div>
                      <p className="text-[14px] font-semibold text-zinc-900">{c.title}</p>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-zinc-500">{c.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* mock chat with bot face */}
          <Reveal delay={0.2}>
            <div className="relative">
              {/* floating bot face above the chat */}
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-10">
                <FileyBot size={72} />
              </div>
              <div className="card overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              {/* chat header */}
              <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-3.5">
                <FileyBot size={36} />
                <div>
                  <p className="text-[14px] font-semibold text-zinc-900">Filey AI</p>
                  <p className="text-[10.5px] text-emerald-600 font-medium">● online</p>
                </div>
              </div>

              {/* messages */}
              <div className="space-y-4 p-5">
                {CHAT.map((m, i) => (
                  <div key={i} className={cn(m.role === 'user' ? 'flex justify-end' : 'flex justify-start')}>
                    <div
                      className={cn(
                        'max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-[13px] leading-relaxed',
                        m.role === 'user'
                          ? 'rounded-br-md bg-zinc-900 text-white'
                          : 'rounded-bl-md border border-zinc-200 bg-zinc-50 text-zinc-800'
                      )}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {/* typing indicator */}
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-zinc-200 bg-zinc-50 px-3 py-2">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>

              {/* composer hint */}
              <div className="border-t border-zinc-100 px-5 py-3">
                <p className="text-[11px] text-zinc-400">
                  Also available on WhatsApp — pair your number and talk to your business from anywhere.
                </p>
              </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
