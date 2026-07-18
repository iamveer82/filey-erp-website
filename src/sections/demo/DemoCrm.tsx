import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TweenNumber from '@/sections/demo/TweenNumber'
import { CRM_STAGES, CRM_STAGE_IDS, INITIAL_DEALS, fmtAED } from '@/sections/demo/data'
import type { CrmStage, Deal } from '@/sections/demo/data'
import { cn } from '@/lib/utils'

/* ------------------------------ confetti burst --------------------------- */

const CONFETTI = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2
  const dist = 34 + ((i * 29) % 22)
  return {
    x: Math.round(Math.cos(angle) * dist),
    y: Math.round(Math.sin(angle) * dist * 0.7) - 10,
    r: ((i * 47) % 140) - 70,
    size: 4 + ((i * 13) % 3),
    delay: (i % 4) * 0.02,
    color: ['#F59E0B', '#FBBF24', '#F97316', '#FCD34D'][i % 4],
  }
})

/** One-shot emerald ring + confetti burst when a deal lands in Won (keyed re-mount per drop). */
function WonFx({ pulseKey }: { pulseKey: number }) {
  if (pulseKey === 0) return null
  return (
    <span key={pulseKey}>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 block rounded-xl border-2 border-emerald-400/80"
        initial={{ opacity: 0.8, scale: 0.985 }}
        animate={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <span aria-hidden className="pointer-events-none absolute right-5 top-4 z-20 block">
        {CONFETTI.map((c, i) => (
          <motion.span
            key={`${pulseKey}-${i}`}
            className="absolute block rounded-[2px]"
            style={{ width: c.size, height: c.size, background: c.color }}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
            animate={{ opacity: 0, x: c.x, y: c.y, rotate: c.r }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: c.delay }}
          />
        ))}
      </span>
    </span>
  )
}

/* -------------------------------- deal card ------------------------------ */

function DealCardBody({ deal, lifted = false }: { deal: Deal; lifted?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        lifted
          ? 'rotate-[1.5deg] scale-[1.04] border-amber-400/40 bg-ink-800 shadow-[0_18px_50px_-10px_rgba(0,0,0,0.8)]'
          : 'border-ink-700 bg-ink-850 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
      )}
    >
      <p className="text-[13px] font-semibold leading-tight text-fg">{deal.company}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="font-mono text-[12px] tabular-nums text-amber-400">{fmtAED(deal.value)}</span>
        <span className="rounded-full border border-ink-600 px-2 py-px font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
          {deal.tag}
        </span>
      </div>
    </div>
  )
}

function SortableDealCard({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id })

  // Origin column shows a dashed placeholder while the card is lifted
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className="h-[74px] rounded-lg border border-dashed border-ink-600 bg-ink-800/40"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className="cursor-grab touch-manipulation transition-colors duration-200 hover:[&>div]:border-ink-600 active:cursor-grabbing"
    >
      <DealCardBody deal={deal} />
    </div>
  )
}

/* --------------------------------- column -------------------------------- */

interface ColumnProps {
  stage: (typeof CRM_STAGES)[number]
  deals: Deal[]
  isTarget: boolean
  pulseKey: number
}

function StageColumn({ stage, deals, isTarget, pulseKey }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: stage.id })
  const total = deals.reduce((s, d) => s + d.value, 0)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative flex min-h-[300px] min-w-[260px] snap-start flex-col rounded-xl border bg-ink-900/50 p-2.5 transition-colors duration-200 lg:min-w-0',
        isTarget ? 'border-amber-400/50 bg-amber-400/[0.03]' : 'border-ink-700/70',
      )}
    >
      {/* header: name + count + live total */}
      <div className="flex items-center gap-2 px-1 pb-2.5">
        <span className="h-2 w-2 rounded-full" style={{ background: stage.color }} />
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{stage.label}</span>
        <span className="rounded-full border border-ink-600 px-1.5 py-px font-mono text-[10px] tabular-nums text-faint">
          {deals.length}
        </span>
        <span className="ml-auto font-mono text-[11px] font-medium tabular-nums text-fg">
          <TweenNumber value={total} format={fmtAED} />
        </span>
      </div>

      <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-2">
          <AnimatePresence initial={false}>
            {deals.map((d) => (
              <motion.div
                key={d.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <SortableDealCard deal={d} />
              </motion.div>
            ))}
          </AnimatePresence>
          {deals.length === 0 && (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-ink-600/70 py-8 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
              Drop deals here
            </div>
          )}
        </div>
      </SortableContext>

      {stage.id === 'won' && <WonFx pulseKey={pulseKey} />}
    </div>
  )
}

/* --------------------------------- board --------------------------------- */

export default function DemoCrm() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [wonPulse, setWonPulse] = useState(0)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // 200ms press delay so the columns stay scrollable on touch
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null

  const columnOf = (id: string): CrmStage | null => {
    if (CRM_STAGE_IDS.includes(id as CrmStage)) return id as CrmStage
    return deals.find((d) => d.id === id)?.stage ?? null
  }
  const overColumn = overId ? columnOf(overId) : null

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id))
  const onDragOver = (e: DragOverEvent) => setOverId(e.over ? String(e.over.id) : null)

  const onDragEnd = (e: DragEndEvent) => {
    const id = String(e.active.id)
    const over = e.over ? String(e.over.id) : null
    setActiveId(null)
    setOverId(null)
    if (!over || id === over) return

    const dragged = deals.find((d) => d.id === id)
    if (!dragged) return
    const fromStage = dragged.stage
    const toStage = columnOf(over)
    if (!toStage) return

    const rest = deals.filter((d) => d.id !== id)
    let insertAt: number
    if (CRM_STAGE_IDS.includes(over as CrmStage)) {
      // dropped on the column itself → append after that stage's last card
      const idxs = rest.map((d, i) => (d.stage === toStage ? i : -1)).filter((i) => i >= 0)
      insertAt = idxs.length ? idxs[idxs.length - 1] + 1 : rest.length
    } else {
      const at = rest.findIndex((d) => d.id === over)
      insertAt = at >= 0 ? at : rest.length
    }
    const next = [...rest]
    next.splice(insertAt, 0, { ...dragged, stage: toStage })
    setDeals(next)

    if (toStage === 'won' && fromStage !== 'won') setWonPulse((k) => k + 1)
  }

  const onDragCancel = () => {
    setActiveId(null)
    setOverId(null)
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
          {CRM_STAGES.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              deals={deals.filter((d) => d.stage === stage.id)}
              isTarget={overColumn === stage.id && activeId !== null}
              pulseKey={wonPulse}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
          {activeDeal ? (
            <div className="w-[240px]">
              <DealCardBody deal={activeDeal} lifted />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <p className="mt-3 text-center font-mono text-[11px] text-faint">
        In the app, every move is logged to the customer timeline — try dragging a deal to Won.
      </p>
    </div>
  )
}
