import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AlertTriangle, ArrowDown, ArrowUp, ClipboardList, Download, PackageMinus, Pencil, Plus, RotateCcw, Search, X } from 'lucide-react'
import { applySampleStockEntry, SAMPLE_PRODUCTS, sampleInventoryTotals, type SampleMovement, type SampleProduct, type StockEntryMode } from './inventorySample'
import './DemoInventory.css'

const money = (value: number) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', minimumFractionDigits: 2 }).format(value)
type SortKey = 'sku' | 'name' | 'category' | 'quantity' | 'reorder' | 'price' | 'batch' | 'issued'
type Panel = { kind: 'product'; product?: SampleProduct } | { kind: 'stock'; product: SampleProduct; mode?: StockEntryMode } | { kind: 'stocktake' }
const columns: { key: SortKey; label: string }[] = [{ key: 'sku', label: 'SKU' }, { key: 'name', label: 'Item' }, { key: 'category', label: 'Category' }, { key: 'quantity', label: 'Stock' }, { key: 'reorder', label: 'Reorder at' }, { key: 'price', label: 'Unit price' }, { key: 'batch', label: 'Batch' }, { key: 'issued', label: 'Issued out' }]

export default function DemoInventory() {
  const [products, setProducts] = useState<SampleProduct[]>(SAMPLE_PRODUCTS)
  const [movements, setMovements] = useState<SampleMovement[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [batch, setBatch] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; direction: 1 | -1 }>({ key: 'sku', direction: 1 })
  const [panel, setPanel] = useState<Panel | null>(null)
  const [message, setMessage] = useState('')
  const totals = sampleInventoryTotals(products)
  const categories = [...new Set(products.map((product) => product.category || 'Unsorted'))].sort()
  const batches = [...new Set(products.map((product) => product.batch).filter(Boolean))].sort()
  const lowStock = products.filter((product) => product.quantity <= product.reorder)
  const rows = products.filter((product) => {
    const matchesCategory = category === 'all' || (category === '__low__' ? product.quantity > 0 && product.quantity <= product.reorder : category === '__out__' ? product.quantity === 0 : (product.category || 'Unsorted') === category)
    return matchesCategory && [product.sku, product.name, product.category, product.batch].join(' ').toLowerCase().includes(query.trim().toLowerCase()) && (!batch || product.batch === batch)
  }).sort((a, b) => {
    const left = a[sort.key], right = b[sort.key]
    return (typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right))) * sort.direction
  })
  function clearFilters() { setQuery(''); setCategory('all'); setBatch('') }
  function reset() { setProducts(SAMPLE_PRODUCTS); setMovements([]); clearFilters(); setMessage('Sample inventory restored.') }
  function exportProducts() {
    const encode = (value: string | number) => {
      let text = String(value)
      if (/^[=+@-]/.test(text)) text = "'" + text
      return '"' + text.replace(/"/g, '""') + '"'
    }
    const csv = [columns.map((column) => column.label), ...products.map((product) => columns.map((column) => product[column.key]))].map((row) => row.map(encode).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'filey-sample-products.csv'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('Sample inventory exported as CSV.')
  }

  return (
    <div className="fd-inventory">
      <header className="fd-page-heading">
        <div><h3>Inventory</h3><p>Stock levels and reorder alerts</p></div>
        <div className="fd-inventory-actions">
          <button type="button" className="fd-button" onClick={reset}><RotateCcw size={14} aria-hidden="true" />Reset sample</button>
          <button type="button" className="fd-button" onClick={exportProducts}><Download size={14} aria-hidden="true" />Export</button>
          <button type="button" className="fd-button" onClick={() => setPanel({ kind: 'stocktake' })}><ClipboardList size={14} aria-hidden="true" />Stocktake</button>
          <button type="button" className="fd-button fd-button-primary" onClick={() => setPanel({ kind: 'product' })}><Plus size={15} aria-hidden="true" />Add item</button>
        </div>
      </header>
      <div className="fd-inventory-kpis">
        {[{ label: 'Total SKUs', value: totals.skus, detail: `${categories.length} categories` }, { label: 'Stock Value', value: money(totals.value), detail: 'At cost' }, { label: 'Low Stock', value: totals.low, detail: totals.low ? 'Needs reorder' : 'All good' }, { label: 'Out of Stock', value: totals.out, detail: totals.out ? 'Restock needed' : 'None' }].map((metric) => <div key={metric.label}><p>{metric.label}</p><strong>{metric.value}</strong><span>{metric.detail}</span></div>)}
      </div>
      {!!lowStock.length && <section className="fd-inventory-alerts" aria-labelledby="fd-stock-alerts-title">
        <h4 id="fd-stock-alerts-title">Stock Alerts</h4>
        <div className="fd-inventory-alert-summary"><AlertTriangle size={18} aria-hidden="true" /><span className="fd-chip fd-inventory-danger">{totals.out} out</span><span className="fd-chip">{totals.low - totals.out} low</span><button type="button" onClick={clearFilters}>View all inventory</button></div>
        <div className="fd-inventory-alert-items">{lowStock.slice(0, 6).map((product) => <button type="button" key={product.id} onClick={() => setPanel({ kind: 'stock', product, mode: 'in' })} aria-label={`Receive stock for ${product.name}`}><span><strong>{product.name}</strong><small>{product.sku}</small></span><span className="fd-inventory-alert-qty">{product.quantity}<span className={`fd-chip ${product.quantity === 0 ? 'fd-inventory-danger' : ''}`}>{product.quantity === 0 ? 'Out' : 'Low'}</span></span></button>)}</div>
      </section>}
      <div className="fd-inventory-records">
        <div className="fd-toolbar fd-inventory-toolbar">
          <label className="fd-inventory-search"><Search size={15} aria-hidden="true" /><input className="fd-input" aria-label="Search inventory" placeholder="Search SKU, name or category" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <div className="fd-inventory-filters" role="group" aria-label="Filter inventory">
            {[{ value: 'all', label: 'All', count: products.length }, { value: '__low__', label: 'Low stock', count: totals.low - totals.out }, { value: '__out__', label: 'Out of stock', count: totals.out }, ...categories.map((name) => ({ value: name, label: name, count: undefined }))].map((filter) => <button className="fd-button" type="button" key={filter.value} aria-pressed={category === filter.value} onClick={() => setCategory(filter.value)}>{filter.label}{filter.count !== undefined && <span>{filter.count}</span>}</button>)}
          </div>
          {!!batches.length && <select className="fd-input" aria-label="Filter by batch" value={batch} onChange={(event) => setBatch(event.target.value)}><option value="">All batches</option>{batches.map((value) => <option key={value}>{value}</option>)}</select>}
          <span className="fd-inventory-shown">{rows.length} shown</span>
          {(query || category !== 'all' || batch) && <button type="button" className="fd-inventory-text-button" onClick={clearFilters}>Clear filters</button>}
        </div>
        <div className="fd-table-wrap fd-inventory-table-wrap" role="region" aria-label="Inventory records" tabIndex={0}>
          <table className="fd-table fd-inventory-table"><thead><tr>{columns.map((column) => <th scope="col" key={column.key} aria-sort={sort.key === column.key ? sort.direction === 1 ? 'ascending' : 'descending' : undefined}><button type="button" onClick={() => setSort((previous) => ({ key: column.key, direction: previous.key === column.key && previous.direction === 1 ? -1 : 1 }))}>{column.label}{sort.key === column.key && (sort.direction === 1 ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />)}</button></th>)}<th scope="col" className="fd-inventory-pinned">Actions</th></tr></thead><tbody>
            {rows.map((product) => <tr key={product.id}>
              <td>{product.sku}</td><td><button type="button" className="fd-inventory-name" onClick={() => setPanel({ kind: 'product', product })}>{product.name}</button></td><td><span className="fd-chip">{product.category || 'Unsorted'}</span></td><td><span className="fd-inventory-stock"><strong>{product.quantity}</strong><span className={`fd-chip ${product.quantity === 0 ? 'fd-inventory-danger' : product.quantity > product.reorder ? 'fd-inventory-success' : ''}`}>{product.quantity === 0 ? 'Out' : product.quantity <= product.reorder ? 'Low' : 'OK'}</span></span></td><td>{product.reorder}</td><td>{money(product.price)}</td><td>{product.batch || '—'}</td><td>{product.issued || '—'}</td>
              <td className="fd-inventory-pinned"><div className="fd-inventory-row-actions"><button type="button" className="fd-button" aria-label={`Stock entry for ${product.name}`} title="Stock entry" onClick={() => setPanel({ kind: 'stock', product })}><PackageMinus size={15} aria-hidden="true" /></button><button type="button" className="fd-button" aria-label={`Edit ${product.name}`} title="Edit item" onClick={() => setPanel({ kind: 'product', product })}><Pencil size={14} aria-hidden="true" /></button></div></td>
            </tr>)}
            {!rows.length && <tr><td colSpan={9} className="fd-empty">No products match your filters.</td></tr>}
          </tbody></table>
        </div>
      </div>
      <p className="fd-inventory-note">Add items, receive or issue stock, and try a physical count. Changes reset when you leave this preview.</p>
      <p className="fd-inventory-announcement" role="status">{message}</p>
      {panel?.kind === 'product' && <ProductDialog product={panel.product} products={products} onClose={() => setPanel(null)} onSave={(product) => {
        setProducts((previous) => panel.product ? previous.map((item) => item.id === product.id ? product : item) : [...previous, product])
        clearFilters()
        setMessage(`${product.name} saved in the sample inventory.`)
      }} />}
      {panel?.kind === 'stock' && <StockEntryDialog product={panel.product} products={products} history={movements.filter((movement) => movement.productId === panel.product.id)} initialMode={panel.mode || 'out'} onClose={() => setPanel(null)} onSave={(next, movement) => {
        setProducts(next)
        setMovements((previous) => [...previous, movement])
        setMessage(`Stock updated for ${panel.product.name}. ${next.find((item) => item.id === panel.product.id)?.quantity} now in stock.`)
      }} />}
      {panel?.kind === 'stocktake' && <StocktakeDialog products={products} onClose={() => setPanel(null)} onSave={(next, entries) => {
        setProducts(next)
        setMovements((previous) => [...previous, ...entries])
        setMessage(`Sample stocktake posted: ${entries.length} adjustments.`)
      }} />}
    </div>
  )
}

function InventoryDialog({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const id = useId()
  useEffect(() => { dialog.current?.showModal() }, [])
  function close() { dialog.current?.close(); onClose() }
  return <dialog ref={dialog} className="fd-inventory-dialog" aria-labelledby={id} aria-describedby={id + '-description'} onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) close() }}><div className="fd-inventory-dialog-heading"><h3 id={id}>{title}</h3><button type="button" className="fd-button" aria-label="Close inventory dialog" onClick={close}><X size={16} aria-hidden="true" /></button></div><p id={id + '-description'}>{description}</p>{children}</dialog>
}

function ProductDialog({ product, products, onClose, onSave }: { product?: SampleProduct; products: SampleProduct[]; onClose: () => void; onSave: (product: SampleProduct) => void }) {
  const [error, setError] = useState('')
  function save(event: FormEvent<HTMLFormElement>, close: () => void) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const text = (key: string) => String(form.get(key) || '').trim()
    const next: SampleProduct = { id: product?.id ?? Math.max(0, ...products.map((item) => item.id)) + 1, name: text('name'), sku: text('sku'), category: text('category'), batch: text('batch'), quantity: product?.quantity ?? Number(text('quantity')), reorder: Number(text('reorder')), cost: Number(text('cost')), price: Number(text('price')), issued: product?.issued || 0 }
    if (!next.name || !next.sku) { setError('Enter an item name and SKU.'); return }
    if (products.some((item) => item.id !== next.id && item.sku.toLowerCase() === next.sku.toLowerCase())) { setError('That SKU is already used by another sample item.'); return }
    if (![next.quantity, next.reorder].every((value) => Number.isSafeInteger(value) && value >= 0) || ![next.price, next.cost].every((value) => Number.isFinite(value) && value >= 0 && value <= 1000000000)) { setError('Enter valid quantities and prices of zero or more.'); return }
    onSave(next)
    close()
  }
  return <InventoryDialog title={product ? 'Edit product' : 'Add product'} description="Changes apply to this sample inventory only." onClose={onClose}><form onSubmit={(event) => save(event, () => event.currentTarget.closest('dialog')?.close())}>
    <div className="fd-inventory-form">
      {[{ name: 'name', label: 'Item name', required: true }, { name: 'sku', label: 'SKU', required: true }, { name: 'category', label: 'Category' }, { name: 'batch', label: 'Batch / lot number' }].map((field) => <label key={field.name}>{field.label}{field.required ? ' *' : ''}<input className="fd-input" name={field.name} required={field.required} maxLength={150} defaultValue={product?.[field.name as 'name' | 'sku' | 'category' | 'batch'] || ''} /></label>)}
      {[{ name: 'price', label: 'Unit price (AED)', step: '0.01' }, { name: 'cost', label: 'Cost price (AED)', step: '0.01' }, { name: 'quantity', label: 'Quantity', step: '1' }, { name: 'reorder', label: 'Reorder level', step: '1' }].map((field) => <label key={field.name}>{field.label}<input className="fd-input" name={field.name} type="number" min={0} max={1000000000} step={field.step} required readOnly={field.name === 'quantity' && !!product} defaultValue={product?.[field.name as 'price' | 'cost' | 'quantity' | 'reorder'] ?? 0} />{field.name === 'quantity' && product && <small>Use Stock entry to change the count and keep its history.</small>}</label>)}
    </div>
    {error && <p className="fd-inventory-error" role="alert">{error}</p>}
    <div className="fd-inventory-dialog-actions"><button type="button" className="fd-button" onClick={(event) => event.currentTarget.closest('dialog')?.close()}>Cancel</button><button type="submit" className="fd-button fd-button-primary">{product ? 'Save changes' : 'Save product'}</button></div>
  </form></InventoryDialog>
}

function StockEntryDialog({ product, products, history, initialMode, onClose, onSave }: { product: SampleProduct; products: SampleProduct[]; history: SampleMovement[]; initialMode: StockEntryMode; onClose: () => void; onSave: (products: SampleProduct[], movement: SampleMovement) => void }) {
  const [mode, setMode] = useState<StockEntryMode>(initialMode)
  const [quantity, setQuantity] = useState('')
  const [reference, setReference] = useState('')
  const [error, setError] = useState('')
  const number = Number(quantity)
  const after = quantity === '' ? product.quantity : mode === 'out' ? product.quantity - number : mode === 'in' ? product.quantity + number : number
  function save(event: FormEvent<HTMLFormElement>, close: () => void) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      const result = applySampleStockEntry(products, product.id, mode, Number(form.get('quantity')), String(form.get('reference') || ''), String(form.get('note') || ''), String(form.get('date') || ''))
      onSave(result.products, result.movement)
      close()
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not record this sample stock entry.') }
  }
  return <InventoryDialog title={`Stock entry — ${product.name}`} description="Record a movement in the sample inventory. Nothing is sent or saved to an account." onClose={onClose}><form onSubmit={(event) => save(event, () => event.currentTarget.closest('dialog')?.close())}>
    <div className="fd-inventory-entry-modes" role="group" aria-label="Stock entry type">{([{ id: 'out', label: 'Stock out' }, { id: 'in', label: 'Stock in' }, { id: 'adjust', label: 'Adjust' }] as const).map((entry) => <button type="button" className="fd-button" key={entry.id} aria-pressed={mode === entry.id} onClick={() => { setMode(entry.id); setError('') }}>{entry.label}</button>)}</div>
    <div className="fd-inventory-stock-summary"><div><span>In stock</span><strong>{product.quantity}</strong></div><div><span>Issued out</span><strong>{product.issued}</strong></div>{quantity !== '' && Number.isSafeInteger(after) && after >= 0 && <div><span>After this</span><strong>{after} left</strong></div>}</div>
    <div className="fd-inventory-form">
      <label>{mode === 'out' ? 'Invoice / reference *' : 'Reference (optional)'}<input className="fd-input" name="reference" required={mode === 'out'} value={reference} onChange={(event) => setReference(event.target.value)} maxLength={150} placeholder={mode === 'out' ? 'INV-2026-0001' : 'GRN / PO / supplier reference'} /></label>
      <label>{mode === 'adjust' ? 'Counted quantity *' : 'Quantity *'}<input className="fd-input" name="quantity" type="number" min={mode === 'adjust' ? 0 : 1} max={mode === 'out' ? product.quantity : 1000000000} step={1} required value={quantity} onChange={(event) => { setQuantity(event.target.value); setError('') }} placeholder={mode === 'adjust' ? String(product.quantity) : '0'} />{mode === 'out' && number > product.quantity && <small className="fd-inventory-error">Only {product.quantity} in stock.</small>}</label>
      <label>Date<input className="fd-input" name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></label>
      <label>Note (optional)<input className="fd-input" name="note" maxLength={300} placeholder="Reason for this movement" /></label>
    </div>
    {!!history.length && <section className="fd-inventory-history" aria-label="Sample movement history"><h4>Movement history</h4>{[...history].reverse().map((movement, index) => <div key={index}><span>{movement.reference || (movement.mode === 'in' ? 'Stock in' : movement.mode === 'out' ? 'Stock out' : 'Adjustment')}<small>{movement.note}</small></span><span className={movement.quantity < 0 ? 'fd-inventory-danger' : 'fd-inventory-success'}>{movement.quantity > 0 ? '+' : ''}{movement.quantity}<small>{movement.date}</small></span></div>)}</section>}
    {error && <p className="fd-inventory-error" role="alert">{error}</p>}
    <div className="fd-inventory-dialog-actions"><button type="button" className="fd-button" onClick={(event) => event.currentTarget.closest('dialog')?.close()}>Cancel</button><button type="submit" className="fd-button fd-button-primary" disabled={quantity === '' || !Number.isSafeInteger(number) || number < (mode === 'adjust' ? 0 : 1) || after < 0 || (mode === 'adjust' && number === product.quantity) || (mode === 'out' && !reference.trim())}>{mode === 'out' ? 'Stock out' : mode === 'in' ? 'Stock in' : 'Adjust count'}</button></div>
  </form></InventoryDialog>
}

function StocktakeDialog({ products, onClose, onSave }: { products: SampleProduct[]; onClose: () => void; onSave: (products: SampleProduct[], movements: SampleMovement[]) => void }) {
  const [counts, setCounts] = useState<Record<number, string>>({})
  const [error, setError] = useState('')
  const changes = products.filter((product) => counts[product.id] !== undefined && counts[product.id].trim() !== '' && Number(counts[product.id]) !== product.quantity)
  function save(event: FormEvent<HTMLFormElement>, close: () => void) {
    event.preventDefault()
    let next = products
    const entries: SampleMovement[] = []
    try {
      for (const product of changes) {
        const result = applySampleStockEntry(next, product.id, 'adjust', Number(counts[product.id]), 'Stocktake', `Counted ${counts[product.id]}, book ${product.quantity}`, new Date().toISOString().slice(0, 10))
        next = result.products
        entries.push(result.movement)
      }
      if (!entries.length) return
      onSave(next, entries)
      close()
    } catch (error) { setError(error instanceof Error ? error.message : 'Check the entered counts.') }
  }
  return <InventoryDialog title="Stocktake: physical count" description="Leave a row blank to skip it. Posting updates only the sample inventory." onClose={onClose}><form onSubmit={(event) => save(event, () => event.currentTarget.closest('dialog')?.close())}>
    <div className="fd-table-wrap fd-inventory-count-wrap"><table className="fd-table"><thead><tr><th scope="col">Product</th><th scope="col">Book</th><th scope="col">Counted</th><th scope="col">Diff</th></tr></thead><tbody>{products.map((product) => {
      const raw = counts[product.id] ?? ''
      const difference = raw.trim() === '' || !Number.isFinite(Number(raw)) ? null : Number(raw) - product.quantity
      return <tr key={product.id}><td>{product.name}<small>{product.sku}</small></td><td>{product.quantity}</td><td><input className="fd-input" type="number" min={0} max={1000000000} step={1} aria-label={`Counted quantity for ${product.name}`} placeholder="—" value={raw} onChange={(event) => setCounts((previous) => ({ ...previous, [product.id]: event.target.value }))} /></td><td>{difference === null ? '—' : difference > 0 ? `+${difference}` : difference}</td></tr>
    })}</tbody></table></div>
    <p className="fd-inventory-note">{changes.length ? `${changes.length} products will be adjusted.` : 'No differences entered yet.'}</p>
    {error && <p className="fd-inventory-error" role="alert">{error}</p>}
    <div className="fd-inventory-dialog-actions"><button type="button" className="fd-button" onClick={(event) => event.currentTarget.closest('dialog')?.close()}>Cancel</button><button type="submit" className="fd-button fd-button-primary" disabled={!changes.length}>Post adjustments</button></div>
  </form></InventoryDialog>
}
