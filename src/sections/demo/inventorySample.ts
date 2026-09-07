export type SampleProduct = {
  id: number
  sku: string
  name: string
  category: string
  quantity: number
  reorder: number
  price: number
  cost: number
  batch: string
  issued: number
}
export type StockEntryMode = 'out' | 'in' | 'adjust'
export type SampleMovement = { productId: number; mode: StockEntryMode; quantity: number; reference: string; note: string; date: string }
export const SAMPLE_PRODUCTS: SampleProduct[] = [
  { id: 1, sku: 'FUR-001', name: 'Ergonomic office chair', category: 'Furniture', quantity: 24, reorder: 8, price: 650, cost: 420, batch: 'LOT-2608', issued: 12 },
  { id: 2, sku: 'FUR-002', name: 'Standing desk', category: 'Furniture', quantity: 4, reorder: 5, price: 1200, cost: 780, batch: 'LOT-2608', issued: 6 },
  { id: 3, sku: 'ACC-001', name: 'Monitor arm', category: 'Accessories', quantity: 32, reorder: 10, price: 185, cost: 110, batch: 'LOT-2609', issued: 18 },
  { id: 4, sku: 'ACC-002', name: 'Desk organiser', category: 'Accessories', quantity: 0, reorder: 12, price: 65, cost: 32, batch: 'LOT-2607', issued: 40 },
  { id: 5, sku: 'SUP-001', name: 'A4 paper · 500 sheets', category: 'Supplies', quantity: 120, reorder: 30, price: 22, cost: 14, batch: 'LOT-2609', issued: 65 },
  { id: 6, sku: 'SUP-002', name: 'Notebook · A5', category: 'Supplies', quantity: 8, reorder: 20, price: 18, cost: 9, batch: 'LOT-2609', issued: 22 },
]

export function applySampleStockEntry(products: SampleProduct[], productId: number, mode: StockEntryMode, quantity: number, reference: string, note: string, date: string): { products: SampleProduct[]; movement: SampleMovement } {
  const product = products.find((item) => item.id === productId)
  if (!product) throw new Error('This sample product could not be found.')
  if (!['out', 'in', 'adjust'].includes(mode)) throw new Error('Choose a stock entry type.')
  if (!Number.isSafeInteger(quantity) || quantity < 0 || (mode !== 'adjust' && quantity === 0)) throw new Error(mode === 'adjust' ? 'Enter a whole counted quantity of zero or more.' : 'Enter a whole quantity greater than zero.')
  if (mode === 'out' && !reference.trim()) throw new Error('Add an invoice or reference for stock out.')
  if (mode === 'out' && quantity > product.quantity) throw new Error(`Only ${product.quantity} in stock.`)
  const delta = mode === 'out' ? -quantity : mode === 'in' ? quantity : quantity - product.quantity
  if (!delta) throw new Error('The counted quantity matches the current stock.')
  if (!Number.isSafeInteger(product.quantity + delta)) throw new Error('This stock quantity is too large.')
  return {
    products: products.map((item) => item.id === productId ? { ...item, quantity: item.quantity + delta, issued: item.issued + Math.max(0, -delta) } : item),
    movement: { productId, mode, quantity: delta, reference: reference.trim(), note: note.trim(), date },
  }
}

export function sampleInventoryTotals(products: SampleProduct[]) {
  return {
    skus: products.length,
    value: products.reduce((total, product) => total + product.quantity * product.cost, 0),
    low: products.filter((product) => product.quantity <= product.reorder).length,
    out: products.filter((product) => product.quantity === 0).length,
  }
}
