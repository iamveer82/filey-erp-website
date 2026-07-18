/**
 * Shared mock data for the live demo (§6) and dashboard preview (§5).
 * All values follow home.md exactly — currency is AED (FTA / 5% VAT context).
 */

/* ------------------------------- formatters ------------------------------ */

export const fmtInt = (v: number): string => Math.round(v).toLocaleString('en-US')
export const fmtAED = (v: number): string => `AED ${fmtInt(v)}`
export const fmtAED2 = (v: number): string =>
  `AED ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const fmtNum2 = (v: number): string =>
  v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const fmtCompact = (v: number): string => {
  const abs = Math.abs(v)
  if (abs >= 10000) return `${Math.round(v / 1000)}k`
  if (abs >= 1000) return `${Math.round(v / 100) / 10}k`
  return `${Math.round(v)}`
}

/* --------------------------- §5 — preview chart -------------------------- */

/** 12 months Aug → Jul, revenue climbs ~180k → 248,530, expenses ~120k → 141k (AED). */
export const PREVIEW_CHART = [
  { m: 'Aug', rev: 182400, exp: 120600 },
  { m: 'Sep', rev: 190800, exp: 123200 },
  { m: 'Oct', rev: 188300, exp: 122100 },
  { m: 'Nov', rev: 197100, exp: 126900 },
  { m: 'Dec', rev: 205600, exp: 129400 },
  { m: 'Jan', rev: 201200, exp: 128300 },
  { m: 'Feb', rev: 212900, exp: 131200 },
  { m: 'Mar', rev: 221700, exp: 133500 },
  { m: 'Apr', rev: 219100, exp: 132400 },
  { m: 'May', rev: 230400, exp: 136200 },
  { m: 'Jun', rev: 240100, exp: 138900 },
  { m: 'Jul', rev: 248530, exp: 141300 },
]

export const PREVIEW_TOP_PRODUCTS = [
  { name: 'Pallet jack', sold: 86 },
  { name: 'Shelving unit', sold: 64 },
  { name: 'Hex bolt M8', sold: 58 },
  { name: 'Drill press', sold: 41 },
]

export const PREVIEW_LOW_STOCK = [
  { name: 'Hex bolt M8', left: 12, tone: 'rose' as const },
  { name: 'Shelf bracket', left: 4, tone: 'rose' as const },
  { name: 'Pallet wrap', left: 19, tone: 'amber' as const },
]

export const PREVIEW_ACTIVITY = [
  { dot: 'bg-emerald-400', text: 'Invoice #1042 paid', meta: 'AED 8,750' },
  { dot: 'bg-sky-400', text: 'Quote #233 sent to Oasis Fitness', meta: '#0233' },
  { dot: 'bg-amber-400', text: 'PO #88 received from Gulf Metals', meta: '#0088' },
]

/* ------------------------- §6.1 — dashboard tab -------------------------- */

export type Period = '7D' | '30D' | '12M'
export const PERIODS: Period[] = ['7D', '30D', '12M']

export interface DemoKpi {
  label: string
  value: number
  prefix?: string
  delta: string
  tone: 'emerald' | 'sky' | 'amber'
}

/** Default 30D set is specified row-by-row in home.md; 7D/12M are the same KPIs at other scales. */
export const DEMO_KPIS: Record<Period, DemoKpi[]> = {
  '7D': [
    { label: 'Revenue', value: 14280, prefix: 'AED ', delta: '▲ 3.1%', tone: 'emerald' },
    { label: 'Orders', value: 9, delta: '▲ 2', tone: 'sky' },
    { label: 'Low stock', value: 3, delta: '1 critical', tone: 'amber' },
    { label: 'New customers', value: 3, delta: '▲ 1', tone: 'emerald' },
  ],
  '30D': [
    { label: 'Revenue', value: 61400, prefix: 'AED ', delta: '▲ 9.2%', tone: 'emerald' },
    { label: 'Orders', value: 41, delta: '▲ 5', tone: 'sky' },
    { label: 'Low stock', value: 3, delta: '1 critical', tone: 'amber' },
    { label: 'New customers', value: 12, delta: '▲ 4', tone: 'emerald' },
  ],
  '12M': [
    { label: 'Revenue', value: 688900, prefix: 'AED ', delta: '▲ 21.7%', tone: 'emerald' },
    { label: 'Orders', value: 462, delta: '▲ 38', tone: 'sky' },
    { label: 'Low stock', value: 3, delta: '1 critical', tone: 'amber' },
    { label: 'New customers', value: 128, delta: '▲ 17', tone: 'emerald' },
  ],
}

export interface RevPoint {
  label: string
  rev: number
}

/** 7D — daily, Jul 12 → Jul 18 2026 (sums to the 14,280 KPI). */
export const DEMO_CHART_7D: RevPoint[] = [
  { label: 'Jul 12', rev: 1740 },
  { label: 'Jul 13', rev: 2210 },
  { label: 'Jul 14', rev: 1890 },
  { label: 'Jul 15', rev: 2480 },
  { label: 'Jul 16', rev: 1620 },
  { label: 'Jul 17', rev: 2350 },
  { label: 'Jul 18', rev: 1990 },
]

/** 30D — daily, Jun 19 → Jul 18 2026 (deterministic walk, ≈ the 61,400 KPI). */
export const DEMO_CHART_30D: RevPoint[] = (() => {
  const out: RevPoint[] = []
  for (let i = 0; i < 30; i++) {
    const day = i <= 11 ? `Jun ${19 + i}` : `Jul ${i - 11}`
    const wave = Math.sin(i * 1.7) * 300 + Math.sin(i * 0.55) * 230
    const jitter = ((i * 37) % 11) * 45
    out.push({ label: day, rev: Math.max(620, Math.round(1550 + i * 20 + wave + jitter)) })
  }
  return out
})()

/** 12M — monthly Aug → Jul (sums to the 688,900 KPI). */
export const DEMO_CHART_12M: RevPoint[] = [
  { label: 'Aug', rev: 42300 },
  { label: 'Sep', rev: 45800 },
  { label: 'Oct', rev: 48100 },
  { label: 'Nov', rev: 46900 },
  { label: 'Dec', rev: 51600 },
  { label: 'Jan', rev: 56200 },
  { label: 'Feb', rev: 53800 },
  { label: 'Mar', rev: 58400 },
  { label: 'Apr', rev: 62900 },
  { label: 'May', rev: 66700 },
  { label: 'Jun', rev: 71300 },
  { label: 'Jul', rev: 84900 },
]

export const DEMO_CHARTS: Record<Period, RevPoint[]> = {
  '7D': DEMO_CHART_7D,
  '30D': DEMO_CHART_30D,
  '12M': DEMO_CHART_12M,
}

/** Sales by category donut (exact per home.md). */
export const CATEGORY_SALES = [
  { name: 'Hardware', value: 44, color: '#FBBF24' },
  { name: 'Tools', value: 27, color: '#F97316' },
  { name: 'Fittings', value: 18, color: '#38BDF8' },
  { name: 'Other', value: 11, color: '#A78BFA' },
]

export interface ActivityEvent {
  id: number
  dot: string
  text: string
  meta: string
}

/** 8 canned events cycled into the live feed every 6s. */
export const ACTIVITY_EVENTS: ActivityEvent[] = [
  { id: 1, dot: 'bg-emerald-400', text: 'Invoice #1051 paid', meta: 'AED 2,300' },
  { id: 2, dot: 'bg-sky-400', text: 'New lead: Marina Boutique', meta: 'CRM' },
  { id: 3, dot: 'bg-violet-400', text: 'Stock adjusted: Pallet wrap', meta: '+50' },
  { id: 4, dot: 'bg-amber-400', text: 'Quote #234 sent to Cedar Café', meta: 'AED 5,400' },
  { id: 5, dot: 'bg-sky-400', text: 'PO #89 received from Gulf Metals', meta: '#0089' },
  { id: 6, dot: 'bg-emerald-400', text: 'Deal won: Falcon Auto Parts', meta: 'AED 31,800' },
  { id: 7, dot: 'bg-rose-400', text: 'Stock alert: Shelf bracket 300mm', meta: '4 left' },
  { id: 8, dot: 'bg-sky-400', text: 'New customer: ByteBistro LLC', meta: 'CRM' },
]

/* ------------------------- §6.2 — invoicing tab -------------------------- */

export const CUSTOMERS = ['Al Noor Hardware LLC', 'Desert Rose Catering', 'Gulf Print Works']

export interface CatalogItem {
  name: string
  price: number
}

/** Catalog (name / price AED) — exact per home.md. */
export const CATALOG: CatalogItem[] = [
  { name: 'Industrial shelving unit', price: 850 },
  { name: 'Hex bolt M8 (box)', price: 45 },
  { name: 'Pallet jack', price: 1250 },
  { name: 'Drill press', price: 2400 },
  { name: 'Pallet wrap (roll)', price: 35 },
]

export type TemplateId = 'navy' | 'mint' | 'mono'

export const INVOICE_TEMPLATES: { id: TemplateId; name: string; accent: string }[] = [
  { id: 'navy', name: 'Classic Navy', accent: '#1E3A5F' },
  { id: 'mint', name: 'Modern Mint', accent: '#0E9F6E' },
  { id: 'mono', name: 'Minimal Mono', accent: '#1A2330' },
]

export const INVOICE_META = {
  company: 'Falcon Trading LLC',
  city: 'Dubai, UAE',
  trn: 'TRN 1003 8492 7610 003',
  title: 'TAX INVOICE',
  number: 'INV-1051',
  date: '18 Jul 2026',
  thanks: 'Thank you for your business',
}

export const PDF_TOAST = 'Demo mode — the desktop app exports print-ready, FTA-compliant PDFs.'

/* ---------------------------- §6.3 — CRM tab ----------------------------- */

export type CrmStage = 'new' | 'contacted' | 'negotiation' | 'won'

export const CRM_STAGES: { id: CrmStage; label: string; color: string }[] = [
  { id: 'new', label: 'New', color: '#38BDF8' },
  { id: 'contacted', label: 'Contacted', color: '#A78BFA' },
  { id: 'negotiation', label: 'Negotiation', color: '#FBBF24' },
  { id: 'won', label: 'Won', color: '#34D399' },
]

export const CRM_STAGE_IDS: CrmStage[] = ['new', 'contacted', 'negotiation', 'won']

export type DealTag = 'Hardware' | 'F&B' | 'Retail' | 'Services'

export interface Deal {
  id: string
  company: string
  value: number
  tag: DealTag
  stage: CrmStage
}

/** The 9 named deals from home.md §6.3, in their starting stages. */
export const INITIAL_DEALS: Deal[] = [
  { id: 'al-noor', company: 'Al Noor Hardware', value: 24000, tag: 'Hardware', stage: 'new' },
  { id: 'desert-rose', company: 'Desert Rose Catering', value: 8750, tag: 'F&B', stage: 'new' },
  { id: 'gulf-print', company: 'Gulf Print Works', value: 15200, tag: 'Services', stage: 'new' },
  { id: 'oasis', company: 'Oasis Fitness', value: 42000, tag: 'Services', stage: 'contacted' },
  { id: 'palm', company: 'Palm Electronics', value: 11300, tag: 'Retail', stage: 'contacted' },
  { id: 'sahara', company: 'Sahara Logistics', value: 67500, tag: 'Services', stage: 'negotiation' },
  { id: 'marina', company: 'Marina Boutique', value: 9900, tag: 'Retail', stage: 'negotiation' },
  { id: 'cedar', company: 'Cedar Café', value: 5400, tag: 'F&B', stage: 'won' },
  { id: 'falcon-auto', company: 'Falcon Auto Parts', value: 31800, tag: 'Hardware', stage: 'won' },
]

/* -------------------------- §6.4 — inventory tab ------------------------- */

export type StockStatus = 'In stock' | 'Low' | 'Reorder'

export interface InventoryRow {
  sku: string
  item: string
  category: string
  stock: number
  status: StockStatus
}

/** Exact rows from home.md §6.4. */
export const INVENTORY: InventoryRow[] = [
  { sku: 'SKU-1001', item: 'Pallet jack', category: 'Equipment', stock: 86, status: 'In stock' },
  { sku: 'SKU-1042', item: 'Hex bolt M8 (box)', category: 'Fasteners', stock: 12, status: 'Reorder' },
  { sku: 'SKU-1077', item: 'Industrial shelving unit', category: 'Storage', stock: 64, status: 'In stock' },
  { sku: 'SKU-1103', item: 'Pallet wrap (roll)', category: 'Packaging', stock: 19, status: 'Low' },
  { sku: 'SKU-1150', item: 'Drill press', category: 'Equipment', stock: 41, status: 'In stock' },
  { sku: 'SKU-1218', item: 'Shelf bracket 300mm', category: 'Fittings', stock: 4, status: 'Reorder' },
  { sku: 'SKU-1260', item: 'Work gloves (pair)', category: 'Safety', stock: 230, status: 'In stock' },
  { sku: 'SKU-1304', item: 'Label roll 100mm', category: 'Packaging', stock: 27, status: 'Low' },
]

/** Status → bar / chip tone. Bars scale as stock ÷ 250. */
export const STATUS_COLORS: Record<StockStatus, string> = {
  'In stock': '#34D399',
  Low: '#FBBF24',
  Reorder: '#FB7185',
}
