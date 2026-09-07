import { lazy, Suspense, useState } from 'react'
import DemoInvoicing from '@/sections/demo/DemoInvoicing'
import './LiveDemo.css'

const DemoCrm = lazy(() => import('@/sections/demo/DemoCrm'))
const DemoInventory = lazy(() => import('@/sections/demo/DemoInventory'))
const DemoDashboard = lazy(() => import('@/sections/demo/DemoDashboard'))

const TABS = [
  { id: 'invoicing', label: 'Invoicing' },
  { id: 'crm', label: 'CRM' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'dashboard', label: 'Dashboard' },
] as const

type DemoTab = typeof TABS[number]['id']

export default function LiveDemo() {
  const [tab, setTab] = useState<DemoTab>('invoicing')

  return (
    <section id="demo" className="site-section live-demo" aria-labelledby="demo-title">
      <div className="site-container">
        <header className="section-heading live-demo-heading">
          <h2 id="demo-title">Try a little Filey.</h2>
          <p>Edit an invoice, move a deal, or explore your stock. Sample data, no account needed.</p>
        </header>

        <div className="demo-selector" role="group" aria-label="Choose a Filey preview">
          {TABS.map((item) => (
            <button
              key={item.id}
              id={`demo-control-${item.id}`}
              type="button"
              className="demo-tab"
              aria-pressed={tab === item.id}
              aria-controls="demo-panel"
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          id="demo-panel"
          className="demo-workspace"
          role="region"
          aria-labelledby={`demo-control-${tab}`}
          aria-describedby="demo-limits"
          tabIndex={0}
        >
          <Suspense key={tab} fallback={<p className="demo-loading" role="status">Loading preview…</p>}>
            {tab === 'invoicing' && <DemoInvoicing />}
            {tab === 'crm' && <DemoCrm />}
            {tab === 'inventory' && <DemoInventory />}
            {tab === 'dashboard' && <DemoDashboard running={false} />}
          </Suspense>
        </div>
        <p id="demo-limits" className="demo-limits">
          Limited interactive preview. Changes reset when you switch sections. PDF export and printing are available in the app.
        </p>
      </div>
    </section>
  )
}
