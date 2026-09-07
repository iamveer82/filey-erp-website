import { useMemo, useState } from 'react'
import { Download, Minus, Plus, Printer, X } from 'lucide-react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { CATALOG, CUSTOMERS, INVOICE_META, INVOICE_TEMPLATES, PDF_TOAST, fmtAED2, fmtInt, fmtNum2 } from '@/sections/demo/data'
import type { TemplateId } from '@/sections/demo/data'
import { cn } from '@/lib/utils'

/* --------------------------------- types --------------------------------- */

interface LineItem {
  id: string
  name: string
  qty: number
}

const STARTER_LINES: LineItem[] = [
  { id: 'l1', name: 'Pallet jack', qty: 1 },
  { id: 'l2', name: 'Industrial shelving unit', qty: 2 },
  { id: 'l3', name: 'Hex bolt M8 (box)', qty: 4 },
]

const priceOf = (name: string): number => CATALOG.find((c) => c.name === name)?.price ?? 0

/* ------------------------------ invoice paper ---------------------------- */

interface PaperProps {
  template: TemplateId
  customer: string
  lines: LineItem[]
  subtotal: number
  discountPct: number
  discount: number
  vatOn: boolean
  vat: number
  total: number
}

function InvoicePaper({ template, customer, lines, subtotal, discountPct, discount, vatOn, vat, total }: PaperProps) {
  const navy = template === 'navy'
  const mint = template === 'mint'
  const mono = template === 'mono'
  const accent = mint ? '#0E9F6E' : navy ? '#1E3A5F' : '#1A2330'

  const totalRows = (
    <>
      <div className="flex items-center justify-between py-1">
        <span className={cn('text-[10.5px]', navy ? 'opacity-70' : 'opacity-60')}>Subtotal</span>
        <span className="text-[11px] tabular-nums">{fmtNum2(subtotal)}</span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className={cn('text-[10.5px]', navy ? 'opacity-70' : 'opacity-60')}>Discount ({discountPct}%)</span>
        <span className="text-[11px] tabular-nums">−{fmtNum2(discount)}</span>
      </div>
      {vatOn && (
        <div className="flex items-center justify-between py-1">
          <span className={cn('text-[10.5px]', navy ? 'opacity-70' : 'opacity-60')}>VAT 5%</span>
          <span className="text-[11px] tabular-nums">{fmtNum2(vat)}</span>
        </div>
      )}
    </>
  )

  const itemsTable = (
    <table className="w-full text-left">
      <thead>
        <tr className={cn('border-b text-[9px] uppercase tracking-[0.12em]', navy ? 'border-black/20 opacity-60' : mint ? 'border-[#0E9F6E]/30 text-[#0E9F6E]' : 'border-paper-ink/30 opacity-60')}>
          <th className="py-1.5 pr-2 font-medium">Item</th>
          <th className="py-1.5 pr-2 text-right font-medium">Qty</th>
          <th className="py-1.5 pr-2 text-right font-medium">Price</th>
          <th className="py-1.5 text-right font-medium">Amount</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((l) => (
          <tr key={l.id} className={cn('border-b', navy ? 'border-black/10' : mint ? 'border-[#0E9F6E]/15' : 'border-paper-ink/10')}>
            <td className="py-1.5 pr-2 text-[11px] leading-tight">{l.name}</td>
            <td className="py-1.5 pr-2 text-right text-[11px] tabular-nums">{l.qty}</td>
            <td className="py-1.5 pr-2 text-right text-[11px] tabular-nums">{fmtInt(priceOf(l.name))}</td>
            <td className="py-1.5 text-right text-[11px] tabular-nums">{fmtInt(priceOf(l.name) * l.qty)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden',
        mono && 'font-mono',
        mint && 'border-l-4 border-[#0E9F6E]',
      )}
    >
      {/* header */}
      {navy ? (
        <div className="bg-[#1E3A5F] px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold leading-tight">{INVOICE_META.company}</p>
              <p className="mt-0.5 text-[9.5px] leading-relaxed opacity-75">
                {INVOICE_META.city} · {INVOICE_META.trn}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-bold tracking-[0.14em]">{INVOICE_META.title}</p>
              <p className="mt-0.5 text-[9.5px] opacity-75">
                {INVOICE_META.number} · {INVOICE_META.date}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div>
            <p className={cn('text-[13px] font-semibold leading-tight', mint && 'text-[#0E9F6E]')}>{INVOICE_META.company}</p>
            <p className="mt-0.5 text-[9.5px] leading-relaxed opacity-60">
              {INVOICE_META.city}
              <br />
              {INVOICE_META.trn}
            </p>
          </div>
          <div className="text-right">
            <p className={cn('text-[13px] font-bold tracking-[0.14em]', mint && 'text-[#0E9F6E]')}>{INVOICE_META.title}</p>
            <p className="mt-0.5 text-[9.5px] opacity-60">{INVOICE_META.number}</p>
            <p className="text-[9.5px] opacity-60">{INVOICE_META.date}</p>
          </div>
        </div>
      )}

      {/* bill to */}
      <div className="px-5 pt-3">
        <p className={cn('text-[9px] uppercase tracking-[0.16em]', mint ? 'text-[#0E9F6E]' : 'opacity-50')}>Bill to</p>
        <p className="mt-0.5 text-[12px] font-semibold leading-tight">{customer}</p>
      </div>

      {/* items (scroll-safe) */}
      <div className="mx-5 mt-2 min-h-0 flex-1 overflow-y-auto border-b border-t py-1" style={{ borderColor: mint ? 'rgba(14,159,110,0.25)' : 'rgba(26,35,48,0.15)' }}>
        {itemsTable}
      </div>

      {/* totals */}
      <div className="px-5 pb-3 pt-2">
        {mint ? (
          <div>
            <div className="ml-auto w-full max-w-[220px]">{totalRows}</div>
            <div className="mt-2 flex justify-end">
              <div className="flex items-center gap-3 rounded-full bg-[#0E9F6E]/10 px-4 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0E9F6E]">Total</span>
                <span className="text-[14px] font-semibold tabular-nums text-[#0E9F6E]">
                  {fmtAED2(total)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className={cn('ml-auto w-full max-w-[220px]', navy && 'text-right')}>
            {totalRows}
            <div className={cn('mt-1 flex items-center justify-between border-t pt-1.5', navy ? 'border-black/25' : 'border-paper-ink/30')}>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
                Total
              </span>
              <span className="text-[14px] font-bold tabular-nums" style={{ color: accent }}>
                {fmtAED2(total)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* footer */}
      <p className={cn('px-5 pb-4 text-center text-[9.5px]', navy ? 'opacity-50' : 'opacity-45')}>{INVOICE_META.thanks}</p>
    </div>
  )
}

/* ------------------------------- main tab -------------------------------- */

export default function DemoInvoicing() {
  const [customer, setCustomer] = useState(CUSTOMERS[0])
  const [lines, setLines] = useState<LineItem[]>(STARTER_LINES)
  const [discountPct, setDiscountPct] = useState(5)
  const [vatOn, setVatOn] = useState(true)
  const [template, setTemplate] = useState<TemplateId>('mint')
  const [lineSeq, setLineSeq] = useState(4)

  const totals = useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + priceOf(l.name) * l.qty, 0)
    const discount = (subtotal * discountPct) / 100
    const vat = vatOn ? (subtotal - discount) * 0.05 : 0
    return { subtotal, discount, vat, total: subtotal - discount + vat }
  }, [lines, discountPct, vatOn])

  const updateLine = (id: string, patch: Partial<LineItem>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))

  const addLine = () => {
    const unused = CATALOG.find((c) => !lines.some((l) => l.name === c.name)) ?? CATALOG[0]
    setLines((prev) => [...prev, { id: `l${lineSeq}`, name: unused.name, qty: 1 }])
    setLineSeq((s) => s + 1)
  }

  const pdfToast = () => toast.success(PDF_TOAST)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">
      {/* ------------------------------ left: controls ------------------------------ */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        {/* customer */}
        <label className="text-[10px] uppercase tracking-[0.12em] text-zinc-400" htmlFor="inv-customer">
          Customer
        </label>
        <Select value={customer} onValueChange={setCustomer}>
          <SelectTrigger id="inv-customer" className="mt-1.5 w-full border-zinc-200 bg-white text-[13px] text-zinc-900">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-zinc-200 bg-zinc-50 text-zinc-900">
            {CUSTOMERS.map((c) => (
              <SelectItem key={c} value={c} className="text-[13px]">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* line items editor */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Line items</p>
          <span className="text-[10px] text-zinc-400">{lines.length} / {CATALOG.length}</span>
        </div>
        <div className="mt-1.5 space-y-2">
            {lines.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-1.5"
              >
                <Select value={l.name} onValueChange={(name) => updateLine(l.id, { name })}>
                  <SelectTrigger
                    aria-label="Item"
                    className="h-8 min-w-0 flex-1 border-zinc-200 bg-white px-2 text-[12px] text-zinc-900 [&_span]:truncate"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-200 bg-zinc-50 text-zinc-900">
                    {CATALOG.map((c) => (
                      <SelectItem key={c.name} value={c.name} className="text-[12px]">
                        {c.name} — {fmtInt(c.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex shrink-0 items-center rounded-md border border-zinc-200">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => updateLine(l.id, { qty: Math.max(1, l.qty - 1) })}
                    className="flex h-8 w-6 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-900"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center text-[12px] tabular-nums text-zinc-900">{l.qty}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => updateLine(l.id, { qty: Math.min(99, l.qty + 1) })}
                    className="flex h-8 w-6 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-900"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="hidden w-14 shrink-0 text-right text-[11px] tabular-nums text-zinc-400 sm:inline">
                  {fmtInt(priceOf(l.name))}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${l.name}`}
                  disabled={lines.length <= 1}
                  onClick={() => setLines((prev) => prev.filter((x) => x.id !== l.id))}
                  className="flex h-8 w-6 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:text-rose-400 disabled:pointer-events-none disabled:opacity-30"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
        </div>
        <button
          type="button"
          onClick={addLine}
          disabled={lines.length >= CATALOG.length}
          className="mt-2 flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-zinc-200 text-[11px] text-zinc-400 transition-colors duration-200 hover:border-amber-400/50 hover:text-amber-400 disabled:pointer-events-none disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" /> Add line
        </button>

        {/* discount */}
        <div className="mt-4 flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-[0.12em] text-zinc-400" htmlFor="inv-discount">
            Discount
          </label>
          <span className="text-[11px] tabular-nums text-amber-400">{discountPct}%</span>
        </div>
        <Slider
          id="inv-discount"
          className="mt-2.5"
          value={[discountPct]}
          onValueChange={([v]) => setDiscountPct(v)}
          min={0}
          max={20}
          step={1}
        />

        {/* VAT switch */}
        <div className="mt-4 flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2.5">
          <label className="text-[10px] uppercase tracking-[0.12em] text-zinc-400" htmlFor="inv-vat">
            VAT 5%
          </label>
          <Switch id="inv-vat" checked={vatOn} onCheckedChange={setVatOn} />
        </div>

        {/* template swatches */}
        <p className="mt-4 text-[10px] uppercase tracking-[0.12em] text-zinc-400">Template</p>
        <div className="mt-1.5 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Invoice template">
          {INVOICE_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={template === t.id}
              onClick={() => setTemplate(t.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-all duration-200',
                template === t.id
                  ? 'border-amber-400/60 bg-amber-400/5'
                  : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50',
              )}
            >
              {/* mini doc thumbnail */}
              <span className="flex h-12 w-9 flex-col overflow-hidden rounded-[3px] bg-paper shadow-sm">
                <span className="h-2 w-full" style={{ background: t.id === 'mono' ? '#1A2330' : t.accent }} />
                <span className="mx-1 mt-1.5 h-px bg-paper-ink/30" />
                <span className="mx-1 mt-1 h-px bg-paper-ink/30" />
                <span className="mx-1 mt-1 h-px w-2/3 bg-paper-ink/30" />
                <span className="mx-1 mt-auto mb-1 h-1 w-1/2 rounded-full" style={{ background: t.id === 'mono' ? '#1A2330' : t.accent }} />
              </span>
              <span className={cn('text-[9.5px] leading-none', template === t.id ? 'text-amber-400' : 'text-zinc-400')}>
                {t.name}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-center text-[10px] text-zinc-400">3 of 10 templates in the app</p>

        {/* live totals */}
        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex items-center justify-between py-0.5 text-[12px]">
            <span className="text-zinc-400">Subtotal</span>
            <span className="tabular-nums text-zinc-900">{fmtAED2(totals.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between py-0.5 text-[12px]">
            <span className="text-zinc-400">Discount ({discountPct}%)</span>
            <span className="tabular-nums text-zinc-900">−{fmtAED2(totals.discount)}</span>
          </div>
          <div className={cn('flex items-center justify-between py-0.5 text-[12px]', !vatOn && 'opacity-40')}>
            <span className="text-zinc-400">VAT 5%</span>
            <span className="tabular-nums text-zinc-900">{fmtAED2(totals.vat)}</span>
          </div>
          <div className="my-1.5 h-px bg-zinc-100" />
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-zinc-900">Total</span>
            <span className="text-[20px] font-semibold tabular-nums text-amber-400">
              {fmtAED2(totals.total)}
            </span>
          </div>
        </div>

        {/* actions */}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={pdfToast}
            className="btn-gradient inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-[13.5px] font-semibold text-[#1A1206] transition-all duration-200 hover:shadow-[0_0_24px_rgba(251,191,36,0.25)] active:scale-[0.98]"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>
          <button
            type="button"
            onClick={pdfToast}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 text-[13.5px] font-semibold text-zinc-900 transition-colors duration-200 hover:border-amber-400/50 hover:bg-amber-400/5 active:scale-[0.98]"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      {/* ------------------------------ right: live paper ------------------------------ */}
      <div className="flex items-start justify-center rounded-xl border border-zinc-200/40 bg-white/30 p-4 lg:p-6">
        <div className="w-full max-w-[400px]">
          <div className="aspect-[1/1.414] max-h-[560px] w-full overflow-hidden rounded-lg bg-paper text-paper-ink shadow-[0_18px_50px_-12px_rgba(0,0,0,0.55)]">
            <InvoicePaper
              template={template}
              customer={customer}
              lines={lines}
              subtotal={totals.subtotal}
              discountPct={discountPct}
              discount={totals.discount}
              vatOn={vatOn}
              vat={totals.vat}
              total={totals.total}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
