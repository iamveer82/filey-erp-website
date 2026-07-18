import { useEffect, useMemo, useState } from 'react'
import { ArrowUp, Search } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { INVENTORY, STATUS_COLORS } from '@/sections/demo/data'
import type { InventoryRow, StockStatus } from '@/sections/demo/data'
import { cn } from '@/lib/utils'

type SortKey = 'sku' | 'item' | 'category' | 'stock' | 'status'
type SortDir = 'asc' | 'desc'
type StatusFilter = 'All' | StockStatus

const STATUS_FILTERS: StatusFilter[] = ['All', 'In stock', 'Low', 'Reorder']

/** Severity order for sorting the Status column. */
const STATUS_RANK: Record<StockStatus, number> = { Reorder: 0, Low: 1, 'In stock': 2 }

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'sku', label: 'SKU' },
  { key: 'item', label: 'Item' },
  { key: 'category', label: 'Category' },
  { key: 'stock', label: 'Stock' },
  { key: 'status', label: 'Status' },
]

function StatusChip({ status }: { status: StockStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]',
        status === 'In stock' && 'border border-mint-400/40 text-mint-400',
        status === 'Low' && 'bg-amber-400/10 text-amber-400',
        status === 'Reorder' && 'bg-rose-400/10 text-rose-400',
      )}
    >
      {status === 'Reorder' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute h-full w-full animate-ping rounded-full bg-rose-400 opacity-60 motion-reduce:hidden" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-rose-400" />
        </span>
      )}
      {status}
    </span>
  )
}

export default function DemoInventory() {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'sku', dir: 'asc' })

  // 150ms debounce on the search input
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim().toLowerCase()), 150)
    return () => window.clearTimeout(t)
  }, [query])

  const rows = useMemo(() => {
    const filtered = INVENTORY.filter((r) => {
      const matchesQuery =
        debounced === '' ||
        r.sku.toLowerCase().includes(debounced) ||
        r.item.toLowerCase().includes(debounced)
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter
      return matchesQuery && matchesStatus
    })
    const dir = sort.dir === 'asc' ? 1 : -1
    const value = (r: InventoryRow): string | number =>
      sort.key === 'stock' ? r.stock : sort.key === 'status' ? STATUS_RANK[r.status] : r[sort.key]
    return [...filtered].sort((a, b) => {
      const va = value(a)
      const vb = value(b)
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
      return String(va).localeCompare(String(vb)) * dir
    })
  }, [debounced, statusFilter, sort])

  const toggleSort = (key: SortKey) =>
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  return (
    <div>
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-[280px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SKU or name…"
            aria-label="Search SKU or name"
            className="h-9 w-full rounded-lg border border-ink-600 bg-ink-850 pl-8 pr-3 font-mono text-[12px] text-fg placeholder:text-faint focus:border-mint-400/50 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              aria-pressed={statusFilter === s}
              className={cn(
                'rounded-full border px-2.5 py-1 font-mono text-[10.5px] transition-colors duration-200',
                statusFilter === s
                  ? 'border-mint-400/50 bg-mint-400/10 text-mint-400'
                  : 'border-ink-600 text-faint hover:text-muted-foreground',
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="ml-auto font-mono text-[10.5px] tabular-nums text-faint">
          {rows.length} of {INVENTORY.length} items
        </span>
      </div>

      {/* table */}
      <div className="mt-3 overflow-hidden rounded-xl border border-ink-700/70">
        <Table>
          <TableHeader>
            <TableRow className="border-ink-700 bg-ink-900/70 hover:bg-ink-900/70">
              {COLUMNS.map((col) => {
                const active = sort.key === col.key
                return (
                  <TableHead key={col.key} className="h-9 px-3">
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        'flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-200',
                        active ? 'text-mint-400' : 'text-faint hover:text-fg',
                      )}
                      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                      {col.label}
                      <ArrowUp
                        className={cn(
                          'h-3 w-3 transition-transform duration-200',
                          active ? 'opacity-100' : 'opacity-30',
                          active && sort.dir === 'desc' && 'rotate-180',
                        )}
                      />
                    </button>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.sku} className="border-ink-700/60 hover:bg-mint-400/5">
                <TableCell className="px-3 py-2.5 font-mono text-[11.5px] tabular-nums text-faint">{r.sku}</TableCell>
                <TableCell className="px-3 py-2.5 text-[13px] font-medium text-fg">{r.item}</TableCell>
                <TableCell className="px-3 py-2.5 text-[12px] text-muted-foreground">{r.category}</TableCell>
                <TableCell className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 text-right font-mono text-[12px] tabular-nums text-fg">{r.stock}</span>
                    <span className="h-1 w-[60px] overflow-hidden rounded-full bg-ink-700">
                      <span
                        className="block h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (r.stock / 250) * 100)}%`, background: STATUS_COLORS[r.status] }}
                      />
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-2.5">
                  <StatusChip status={r.status} />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow className="border-ink-700/60 hover:bg-transparent">
                <TableCell colSpan={5} className="px-3 py-10 text-center font-mono text-[11px] text-faint">
                  No items match — clear the search or filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="mt-3 text-center font-mono text-[11px] text-faint">
        Reorder alerts surface here and on the Overview dashboard.
      </p>
    </div>
  )
}
