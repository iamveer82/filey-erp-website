import { lazy, Suspense, useState } from 'react'
import { ArrowUpRight, BookOpen, Boxes, FileText, LayoutDashboard, PanelLeft, Search, UsersRound } from 'lucide-react'
import DemoInvoicing from '@/sections/demo/DemoInvoicing'
import { REPO_URL } from '@/lib/constants'
import './LiveDemo.css'

const DemoCrm = lazy(() => import('@/sections/demo/DemoCrm'))
const DemoInventory = lazy(() => import('@/sections/demo/DemoInventory'))
const DemoDashboard = lazy(() => import('@/sections/demo/DemoDashboard'))

const TABS = [
  { id: 'dashboard', label: 'Overview', group: 'Business', icon: LayoutDashboard },
  { id: 'invoicing', label: 'Invoicing', group: 'Sales', icon: FileText },
  { id: 'crm', label: 'CRM', group: 'Sales', icon: UsersRound },
  { id: 'inventory', label: 'Inventory', group: 'Inventory', icon: Boxes },
] as const

type DemoTab = typeof TABS[number]['id']

export default function LiveDemo() {
  const [tab, setTab] = useState<DemoTab>('dashboard')
  const [sidebarHidden, setSidebarHidden] = useState(false)
  const [query, setQuery] = useState('')
  const [newInvoice, setNewInvoice] = useState(false)
  const active = TABS.find(item => item.id === tab)!
  const searchResults = TABS.filter(item => item.label.toLowerCase().includes(query.trim().toLowerCase()))

  const navigate = (next: DemoTab, createInvoice = false) => {
    setNewInvoice(createInvoice)
    setTab(next)
    setQuery('')
  }

  return (
    <section id="demo" className="site-section live-demo" aria-labelledby="demo-title">
      <div className="site-container">
        <header className="section-heading live-demo-heading">
          <h2 id="demo-title">This is your workspace.</h2>
          <p>Explore Filey’s desktop layouts with sample data. Open an invoice, move a deal, or check your stock.</p>
        </header>

        <div className={`filey-desktop-demo${sidebarHidden ? ' fd-sidebar-hidden' : ''}`}>
          <aside className="fd-sidebar" aria-label="Filey preview navigation">
            <div className="fd-brand"><img src="/filey-mark.png" alt="" width="34" height="34" /><strong>Filey</strong></div>
            <nav className="fd-navigation" aria-label="Choose a Filey preview">
              {['Business', 'Sales', 'Inventory'].map(group => <div className="fd-nav-group" key={group}>
                <p>{group}</p>
                {TABS.filter(item => item.group === group).map(({ id, label, icon: Icon }) => <button
                  key={id} id={`demo-control-${id}`} type="button" className="fd-nav-item"
                  aria-pressed={tab === id} aria-controls="demo-panel" onClick={() => navigate(id)}
                ><Icon size={16} strokeWidth={1.7} aria-hidden="true" />{label}</button>)}
              </div>)}
            </nav>
            <div className="fd-sidebar-links">
              <a href={REPO_URL + '#readme'} target="_blank" rel="noopener noreferrer"><BookOpen size={15} aria-hidden="true" />Documentation</a>
              <a href="#download"><ArrowUpRight size={15} aria-hidden="true" />Get the desktop app</a>
            </div>
            <div className="fd-account"><span className="fd-avatar">FT</span><div><strong>Falcon Trading</strong><small>Sample workspace</small></div></div>
          </aside>
          <div className="fd-main">
            <div className="fd-app-header">
              <button className="fd-sidebar-toggle" type="button" aria-label="Toggle preview sidebar" aria-expanded={!sidebarHidden} onClick={() => setSidebarHidden(hidden => !hidden)}><PanelLeft size={17} aria-hidden="true" /></button>
              <span className="fd-current-page">{active.label}</span>
              <form className="fd-global-search" role="search" onSubmit={event => { event.preventDefault(); if (searchResults[0]) navigate(searchResults[0].id) }}>
                <Search size={15} aria-hidden="true" />
                <input aria-label="Find a preview section" placeholder="Search sections…" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') setQuery('') }} />
                {query.trim() && <div className="fd-search-results">
                  {searchResults.length ? searchResults.map(item => <button key={item.id} type="button" onClick={() => navigate(item.id)}>{item.label}<ArrowUpRight size={14} aria-hidden="true" /></button>) : <p>No matching sections.</p>}
                </div>}
              </form>
              <span className="fd-sample-badge">Sample data</span>
              <span className="fd-avatar fd-header-avatar" aria-label="Falcon Trading sample account">FT</span>
            </div>
            <div id="demo-panel" className="fd-page-content" role="region" aria-label={`${active.label} preview`} aria-describedby="demo-limits" tabIndex={0}>
              <Suspense key={tab} fallback={<p className="demo-loading" role="status">Loading {active.label.toLowerCase()}…</p>}>
                {tab === 'invoicing' && <DemoInvoicing initialNew={newInvoice} />}
                {tab === 'crm' && <DemoCrm />}
                {tab === 'inventory' && <DemoInventory />}
                {tab === 'dashboard' && <DemoDashboard onNewInvoice={() => navigate('invoicing', true)} onViewInvoices={() => navigate('invoicing')} />}
              </Suspense>
            </div>
          </div>
        </div>
        <p id="demo-limits" className="demo-limits">
          Preview of the next desktop update. Sample changes reset when you switch sections. Your real business data stays in the app.
        </p>
      </div>
    </section>
  )
}
