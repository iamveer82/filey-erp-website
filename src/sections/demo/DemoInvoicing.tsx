import { useState, type ReactNode } from 'react'
import { ArrowLeft, Check, Eye, FileText, Pencil, Plus, Save, Search, Trash2 } from 'lucide-react'
import { DEMO_CATALOG, DEMO_CUSTOMERS, displayDate, invoiceSummary, invoiceTotals, money, newDraft, SAMPLE_INVOICES, saveSampleDraft, type InvoiceLine, type InvoiceStatus, type SampleInvoice } from './desktopFinanceData'
import './DesktopFinance.css'

function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return <section className="fd-invoice-step"><h4><span>{number}</span>{title}</h4>{children}</section>
}

function InvoicePaper({ invoice }: { invoice: SampleInvoice }) {
  const totals = invoiceTotals(invoice)
  return <article className="fd-invoice-paper" data-template={invoice.template} aria-label={'Invoice preview ' + invoice.number}>
    <div className="fd-paper-heading"><div><strong>FALCON TRADING LLC</strong><p>Dubai, United Arab Emirates</p><p>Sample company</p></div><div><h4>TAX INVOICE</h4><span>{invoice.number}</span></div></div>
    <div className="fd-paper-address"><div><span>BILL TO</span><strong>{invoice.customer || 'Your customer'}</strong><p>United Arab Emirates</p></div><dl><div><dt>Invoice date</dt><dd>{invoice.date ? displayDate(invoice.date) : '—'}</dd></div><div><dt>Due date</dt><dd>{invoice.due ? displayDate(invoice.due) : '—'}</dd></div></dl></div>
    <table><thead><tr><th>Description</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>{invoice.lines.map(line => <tr key={line.id}><td>{line.description || 'Item description'}</td><td>{line.qty}</td><td>{line.rate.toFixed(2)}</td><td>{(line.qty * line.rate).toFixed(2)}</td></tr>)}</tbody></table>
    <dl className="fd-paper-totals"><div><dt>Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>{invoice.discount > 0 && <div><dt>Discount ({invoice.discount}%)</dt><dd>−{money(totals.discount)}</dd></div>}<div><dt>VAT ({invoice.tax}%)</dt><dd>{money(totals.tax)}</dd></div><div className="fd-paper-total"><dt>Total</dt><dd>{money(totals.total)}</dd></div></dl>
    <footer><strong>Thank you for your business.</strong><p>This is a sample invoice preview.</p><span>Made with Filey</span></footer>
  </article>
}

export default function DemoInvoicing({ initialNew = false }: { initialNew?: boolean }) {
  const [invoices, setInvoices] = useState<SampleInvoice[]>(SAMPLE_INVOICES)
  const [form, setForm] = useState<SampleInvoice | null>(() => initialNew ? newDraft(SAMPLE_INVOICES) : null)
  const [preview, setPreview] = useState<SampleInvoice | null>(null)
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const summary = invoiceSummary(invoices)
  const visible = invoices.filter(invoice => (filter === 'all' || invoice.status === filter) && (invoice.number + ' ' + invoice.customer).toLowerCase().includes(query.toLowerCase().trim()))

  function edit(invoice: SampleInvoice) {
    setForm({ ...invoice, lines: invoice.lines.map(line => ({ ...line })) })
    setError('')
    setNotice('')
  }
  function update(patch: Partial<SampleInvoice>) { setForm(previous => previous ? { ...previous, ...patch } : previous) }
  function updateLine(id: number, patch: Partial<InvoiceLine>) {
    if (form) update({ lines: form.lines.map(line => line.id === id ? { ...line, ...patch } : line) })
  }
  function save() {
    if (!form) return
    try {
      setInvoices(saveSampleDraft(form, invoices))
      setNotice(form.number.trim() + ' saved as a draft in this preview.')
      setForm(null)
      setFilter('all')
      setQuery('')
      setError('')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Check your invoice details.') }
  }

  if (preview) return <div className="fd-finance">
    <header className="fd-page-heading"><div><h3>Invoice preview</h3><p>{preview.number} · {preview.customer || 'New customer'}</p></div><button className="fd-button" onClick={() => setPreview(null)}><ArrowLeft size={14} />{form ? 'Back to editor' : 'Back to invoices'}</button></header>
    <div className="fd-preview-full"><InvoicePaper invoice={preview} /></div>
  </div>

  if (form) {
    const totals = invoiceTotals(form)
    return <div className="fd-finance">
      <header className="fd-page-heading">
        <div className="fd-editor-title"><button className="fd-fin-icon-button" aria-label="Back to invoice list" onClick={() => { setForm(null); setError('') }}><ArrowLeft size={18} /></button><div><h3>Create Invoice</h3><p>Create and review an invoice for your customer</p></div></div>
        <div className="fd-fin-actions"><span className="fd-fin-status" data-status="draft">draft</span><button className="fd-button" onClick={() => setPreview(form)}><Eye size={14} /> View</button><button className="fd-button fd-button-primary" onClick={save}><Save size={14} /> Save draft</button></div>
      </header>
      {error && <p className="fd-fin-error" role="alert">{error}</p>}
      <div className="fd-invoice-editor">
        <div className="fd-invoice-editor-fields">
          <Step number={1} title="Choose Template">
            <p className="fd-fin-hint">Select a template for your invoice</p>
            <div className="fd-template-options" role="group" aria-label="Invoice template">
              {['Classic', 'Modern', 'Minimal'].map(template => <button key={template} className="fd-template-option" aria-pressed={form.template === template} onClick={() => update({ template })}><span className="fd-template-mini" data-template={template}><i /><i /><i /><i /></span><span>{template}</span>{form.template === template && <Check size={13} />}</button>)}
            </div>
          </Step>
          <Step number={2} title="Invoice Details">
            <div className="fd-invoice-fields">
              <label className="fd-invoice-field fd-invoice-field-full">Customer<select className="fd-input" value={form.customer} onChange={event => update({ customer: event.target.value })}><option value="">Select saved customer…</option>{DEMO_CUSTOMERS.map(customer => <option key={customer.name}>{customer.name}</option>)}</select></label>
              <label className="fd-invoice-field">Invoice Number<input className="fd-input" value={form.number} onChange={event => update({ number: event.target.value })} /></label>
              <label className="fd-invoice-field">Currency<input className="fd-input" value="AED — UAE Dirham" readOnly /></label>
              <label className="fd-invoice-field">Invoice Date<input className="fd-input" type="date" value={form.date} onChange={event => update({ date: event.target.value })} /></label>
              <label className="fd-invoice-field">Due Date<input className="fd-input" type="date" min={form.date} value={form.due} onChange={event => update({ due: event.target.value })} /></label>
            </div>
          </Step>
          <Step number={3} title="Items">
            <datalist id="fd-invoice-catalog">{DEMO_CATALOG.map(item => <option key={item.description} value={item.description} />)}</datalist>
            <div className="fd-table-wrap"><table className="fd-table fd-invoice-items"><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit price</th><th>Amount</th><th><span className="sr-only">Remove</span></th></tr></thead><tbody>{form.lines.map((line, index) => <tr key={line.id}><td>{index + 1}</td><td><input className="fd-input" list="fd-invoice-catalog" aria-label={'Item ' + (index + 1) + ' description'} placeholder="Choose or enter an item" value={line.description} onChange={event => { const item = DEMO_CATALOG.find(item => item.description === event.target.value); updateLine(line.id, { description: event.target.value, rate: item?.rate ?? line.rate }) }} /></td><td><input className="fd-input" type="number" min="0.01" step="0.01" aria-label={'Item ' + (index + 1) + ' quantity'} value={line.qty} onChange={event => updateLine(line.id, { qty: Number(event.target.value) })} /></td><td><input className="fd-input" type="number" min="0" step="0.01" aria-label={'Item ' + (index + 1) + ' unit price'} value={line.rate} onChange={event => updateLine(line.id, { rate: Number(event.target.value) })} /></td><td className="fd-fin-number">{money(line.qty * line.rate)}</td><td><button className="fd-fin-icon-button" aria-label={'Remove item ' + (index + 1)} disabled={form.lines.length === 1} onClick={() => update({ lines: form.lines.filter(item => item.id !== line.id) })}><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>
            <button className="fd-button fd-add-item" onClick={() => update({ lines: [...form.lines, { id: Math.max(0, ...form.lines.map(line => line.id)) + 1, description: '', qty: 1, rate: 0 }] })}><Plus size={13} /> Add item</button>
          </Step>
          <Step number={4} title="Totals & Settings">
            <div className="fd-invoice-fields"><label className="fd-invoice-field">Discount (%)<input className="fd-input" type="number" min="0" max="100" value={form.discount} onChange={event => update({ discount: Number(event.target.value) })} /></label><label className="fd-invoice-field">VAT (%)<input className="fd-input" type="number" min="0" max="100" value={form.tax} onChange={event => update({ tax: Number(event.target.value) })} /></label></div>
            <dl className="fd-editor-totals"><div><dt>Subtotal</dt><dd>{money(totals.subtotal)}</dd></div><div><dt>Discount</dt><dd>−{money(totals.discount)}</dd></div><div><dt>VAT</dt><dd>{money(totals.tax)}</dd></div><div><dt>Total</dt><dd>{money(totals.total)}</dd></div></dl>
          </Step>
        </div>
        <aside className="fd-invoice-preview"><h4>Preview</h4><p>This is how your invoice will look</p><InvoicePaper invoice={form} /><p className="fd-fin-hint">PDF export and sending are available in the desktop app.</p></aside>
      </div>
    </div>
  }

  return <div className="fd-finance">
    <header className="fd-page-heading"><div><h3>Invoicing</h3><p>Create, send and track invoices</p></div><button className="fd-button fd-button-primary" onClick={() => edit(newDraft(invoices))}><Plus size={14} /> New invoice</button></header>
    <div className="fd-fin-metrics">
      {[{ label: 'Total billed', value: summary.billed, hint: summary.postedCount + ' invoices' }, { label: 'Paid', value: summary.paid, hint: 'Collected' }, { label: 'Pending', value: summary.pending, hint: 'Awaiting payment' }, { label: 'Overdue', value: summary.overdue, hint: summary.overdueCount + ' past due date' }].map(metric => <div className="fd-fin-metric" key={metric.label}><span>{metric.label}</span><strong>{money(metric.value)}</strong><small>{metric.hint}</small></div>)}
    </div>
    {notice && <p className="fd-fin-notice" role="status"><Check size={14} />{notice}</p>}
    <div className="fd-toolbar fd-invoice-toolbar">
      <label className="fd-fin-search"><Search size={14} aria-hidden="true" /><input className="fd-input" aria-label="Search invoices" placeholder="Search invoices by number or customer…" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <div className="fd-fin-filters" role="group" aria-label="Invoice status">{(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map(status => <button className="fd-chip" key={status} aria-pressed={filter === status} onClick={() => setFilter(status)}>{status === 'sent' ? 'Pending' : status.charAt(0).toUpperCase() + status.slice(1)}</button>)}</div>
    </div>
    <div className="fd-table-wrap fd-invoice-list">
      <table className="fd-table"><thead><tr><th>Invoice #</th><th>Customer</th><th>Template</th><th className="fd-fin-number">Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>{visible.map(invoice => <tr key={invoice.id}><td><button className="fd-fin-invoice-link" onClick={() => setPreview(invoice)}>{invoice.number}</button></td><td>{invoice.customer}</td><td className="fd-fin-muted">{invoice.template}</td><td className="fd-fin-number">{money(invoiceTotals(invoice).total)}</td><td><span className="fd-fin-status" data-status={invoice.status}>{invoice.status}</span>{invoice.paid > 0 && invoice.status !== 'paid' && <small className="fd-fin-balance">{money(invoiceTotals(invoice).total - invoice.paid)} due</small>}</td><td className="fd-fin-muted">{displayDate(invoice.date)}</td><td><div className="fd-fin-actions"><button className="fd-fin-icon-button" aria-label={'View ' + invoice.number} onClick={() => setPreview(invoice)}><Eye size={15} /></button>{invoice.status === 'draft' && <button className="fd-fin-icon-button" aria-label={'Edit ' + invoice.number} onClick={() => edit(invoice)}><Pencil size={14} /></button>}</div></td></tr>)}</tbody>
      </table>
      {!visible.length && <div className="fd-empty"><FileText size={24} /><p>No invoices match your filters.</p><button className="fd-button" onClick={() => { setQuery(''); setFilter('all') }}>Clear filters</button></div>}
      <div className="fd-invoice-table-footer">{visible.length} of {invoices.length} invoices<span>Sample workspace · AED</span></div>
    </div>
  </div>
}
