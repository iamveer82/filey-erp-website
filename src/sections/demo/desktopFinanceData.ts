export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'
export type InvoiceLine = { id: number; description: string; qty: number; rate: number }
export type SampleInvoice = {
  id: number; number: string; customer: string; date: string; due: string;
  status: InvoiceStatus; template: string; lines: InvoiceLine[]; discount: number; tax: number; paid: number;
}
export const SAMPLE_TODAY = '2026-09-07'
export const DEMO_CATALOG = [
  { description: 'Industrial shelving unit', rate: 850 },
  { description: 'Hex bolt M8 (box)', rate: 45 },
  { description: 'Pallet jack', rate: 1250 },
  { description: 'Drill press', rate: 2400 },
  { description: 'Pallet wrap (roll)', rate: 35 },
]
export const DEMO_CUSTOMERS = [
  { name: 'Al Noor Hardware LLC', segment: 'Wholesale' },
  { name: 'Desert Rose Catering', segment: 'Services' },
  { name: 'Gulf Print Works', segment: 'Services' },
  { name: 'Oasis Fitness', segment: 'Retail' },
  { name: 'Palm Electronics', segment: 'Retail' },
  { name: 'Sahara Logistics', segment: 'Wholesale' },
]
export const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100
export const money = (value: number) => `AED ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const shortMoney = (value: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
export const displayDate = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })

export function invoiceTotals(invoice: Pick<SampleInvoice, 'lines' | 'discount' | 'tax'>) {
  const subtotal = roundMoney(invoice.lines.reduce((sum, line) => sum + roundMoney(line.qty * line.rate), 0))
  const discount = roundMoney(subtotal * invoice.discount / 100)
  const tax = roundMoney((subtotal - discount) * invoice.tax / 100)
  return { subtotal, discount, tax, total: roundMoney(subtotal - discount + tax) }
}

const seed = (id: number, customer: number, date: string, due: string, status: InvoiceStatus, product: number, qty: number, paid = 0): SampleInvoice => {
  const invoice: SampleInvoice = { id, number: `INV-${id}`, customer: DEMO_CUSTOMERS[customer].name, date, due, status, template: 'Classic', lines: [{ id: 1, ...DEMO_CATALOG[product], qty }], discount: 0, tax: 5, paid }
  if (status === 'paid') invoice.paid = invoiceTotals(invoice).total
  return invoice
}
export const SAMPLE_INVOICES = [
  seed(1051, 0, '2026-09-07', '2026-09-21', 'draft', 0, 2),
  seed(1050, 1, '2026-09-06', '2026-09-20', 'paid', 2, 2),
  seed(1049, 2, '2026-09-05', '2026-09-19', 'sent', 3, 3, 2000),
  seed(1048, 3, '2026-09-03', '2026-09-17', 'paid', 0, 5),
  seed(1047, 0, '2026-09-02', '2026-09-04', 'overdue', 1, 80),
  seed(1046, 5, '2026-08-28', '2026-09-11', 'paid', 2, 4),
  seed(1045, 4, '2026-08-19', '2026-09-12', 'sent', 0, 10, 4000),
  seed(1044, 2, '2026-08-05', '2026-08-19', 'paid', 3, 2),
  seed(1043, 0, '2026-07-20', '2026-08-03', 'paid', 1, 100),
]
export const SAMPLE_RECEIPTS = SAMPLE_INVOICES.filter(invoice => invoice.paid > 0).map(invoice => ({ date: invoice.date, amount: invoice.paid }))
export const SAMPLE_EXPENSES = [
  { date: '2026-09-01', amount: 1200, category: 'Rent' },
  { date: '2026-09-04', amount: 450, category: 'Delivery' },
  { date: '2026-09-06', amount: 680, category: 'Supplies' },
  { date: '2026-08-31', amount: 2100, category: 'Rent' },
  { date: '2026-08-25', amount: 850, category: 'Delivery' },
  { date: '2026-08-11', amount: 420, category: 'Supplies' },
  { date: '2026-07-25', amount: 1700, category: 'Rent' },
]

export function invoiceSummary(invoices: SampleInvoice[]) {
  const posted = invoices.filter(invoice => invoice.status !== 'draft')
  const billed = roundMoney(posted.reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0))
  const paid = roundMoney(posted.reduce((sum, invoice) => sum + invoice.paid, 0))
  const overdue = posted.filter(invoice => invoice.due < SAMPLE_TODAY && invoiceTotals(invoice).total > invoice.paid)
  return { billed, paid, pending: roundMoney(billed - paid), overdue: roundMoney(overdue.reduce((sum, invoice) => sum + invoiceTotals(invoice).total - invoice.paid, 0)), overdueCount: overdue.length, postedCount: posted.length }
}

export function chartRows(days: number) {
  const end = new Date(`${SAMPLE_TODAY}T00:00:00Z`)
  return Array.from({ length: days }, (_, index) => {
    const day = new Date(end)
    day.setUTCDate(end.getUTCDate() - days + 1 + index)
    const date = day.toISOString().slice(0, 10)
    return {
      date, label: day.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
      invoiced: roundMoney(SAMPLE_INVOICES.filter(invoice => invoice.date === date && invoice.status !== 'draft').reduce((sum, invoice) => sum + invoiceTotals(invoice).total, 0)),
      received: roundMoney(SAMPLE_RECEIPTS.filter(receipt => receipt.date === date).reduce((sum, receipt) => sum + receipt.amount, 0)),
      expenses: roundMoney(SAMPLE_EXPENSES.filter(expense => expense.date === date).reduce((sum, expense) => sum + expense.amount, 0)),
    }
  })
}

export function draftError(invoice: SampleInvoice, existing: SampleInvoice[]) {
  if (!invoice.number.trim()) return 'Enter an invoice number.'
  if (existing.some(row => row.id !== invoice.id && row.number.toLowerCase() === invoice.number.trim().toLowerCase())) return 'This invoice number already exists.'
  if (!invoice.customer.trim()) return 'Select a customer.'
  const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
  if (!validDate(invoice.date) || !validDate(invoice.due) || invoice.due < invoice.date) return 'Set an invoice date and a due date on or after it.'
  if (!invoice.lines.length || invoice.lines.some(line => !line.description.trim() || !Number.isFinite(line.qty) || line.qty <= 0 || !Number.isFinite(line.rate) || line.rate < 0)) return 'Add an item with a description, positive quantity and valid price.'
  if (![invoice.discount, invoice.tax].every(value => Number.isFinite(value) && value >= 0 && value <= 100)) return 'Discount and tax rates must be between 0 and 100.'
  return ''
}

export function newDraft(existing: SampleInvoice[]): SampleInvoice {
  const id = Math.max(1051, ...existing.map(invoice => invoice.id)) + 1
  return { id, number: `INV-${id}`, customer: '', date: SAMPLE_TODAY, due: '2026-09-21', status: 'draft', template: 'Classic', lines: [{ id: 1, description: '', qty: 1, rate: 0 }], discount: 0, tax: 5, paid: 0 }
}

export function saveSampleDraft(invoice: SampleInvoice, existing: SampleInvoice[]) {
  const error = draftError(invoice, existing)
  if (error) throw new Error(error)
  const saved: SampleInvoice = { ...invoice, number: invoice.number.trim(), customer: invoice.customer.trim(), status: 'draft', paid: 0, lines: invoice.lines.map(line => ({ ...line })) }
  return existing.some(row => row.id === saved.id) ? existing.map(row => row.id === saved.id ? saved : row) : [saved, ...existing]
}
