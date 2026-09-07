import { useState } from 'react'
import { ArrowRight, ArrowUpRight, Check, FileText, Package, Users, ChartNoAxesCombined, Laptop, Cloud, ShieldCheck, BookOpen } from 'lucide-react'
import LiveDemo from './LiveDemo'

const examples = [
  { label: 'Draft an invoice', request: 'Create an invoice for my customer using the products in this order.', steps: ['Find the saved customer and order.', 'Prepare a draft with the linked products.', 'Open the invoice for your review.'] },
  { label: 'Look up a record', request: 'Find the invoices that still have an outstanding balance.', steps: ['Read the invoices in your workspace.', 'Check their status and outstanding amounts.', 'Return the matching records to review.'] },
  { label: 'Work with PDFs', request: 'Combine these purchase documents into one PDF.', steps: ['Use the files you have selected.', 'Run the supported PDF merge tool.', 'Save the combined document.'] },
]
const regions = [
  { name: 'United Arab Emirates', code: 'AE', tax: 'VAT & TRN', currency: 'AED', detail: 'Tax invoice layouts, tax ID fields and saved document settings for UAE businesses.' },
  { name: 'India', code: 'IN', tax: 'GST & GSTIN', currency: 'INR', detail: 'GST labels, GSTIN format checks and country settings that stay with your documents.' },
  { name: 'European Union', code: 'EU', tax: 'Country-specific VAT', currency: 'EUR and more', detail: 'Choose an individual member state and configure the relevant tax labels and document rates.' },
]

export default function ProductStory() {
  const [example, setExample] = useState(0)
  const [region, setRegion] = useState(0)
  const selected = examples[example]
  const country = regions[region]
  return <>
    <section id="features" className="site-section product-intro">
      <div className="site-container">
        <div className="section-heading centered" data-reveal><h2>The whole picture.<br />Without the busywork.</h2><p>Keep customers, documents and stock together. Spend less time entering the same details twice.</p></div>
        <div className="workflow" data-reveal aria-label="A connected sales workflow">
          {['Quotation', 'Order', 'Invoice', 'Payment'].map((label, index) => <div key={label}><FileText strokeWidth={1.3} size={27} /><span>{label}</span>{index < 3 && <ArrowRight className="workflow-arrow" size={18} />}</div>)}
        </div>
        <div className="capability-grid" data-reveal>
          <article><Users size={22} strokeWidth={1.5} /><h3>Know your customers.</h3><p>Keep contact details, documents and follow-ups close to the relationship.</p></article>
          <article><Package size={22} strokeWidth={1.5} /><h3>Stay on top of stock.</h3><p>Bring products, purchasing and inventory movements into the same workspace.</p></article>
          <article><FileText size={22} strokeWidth={1.5} /><h3>Make paperwork lighter.</h3><p>Create quotes, invoices and receipts. Keep your documents and PDF tools at hand.</p></article>
          <article><ChartNoAxesCombined size={22} strokeWidth={1.5} /><h3>See where you stand.</h3><p>Bring sales, outstanding balances and business reports into view.</p></article>
        </div>
      </div>
    </section>
    <LiveDemo />
    <section id="ai" className="site-section ai-story">
      <div className="site-container ai-layout">
        <div className="section-heading" data-reveal><p className="eyebrow">Meet Filey AI</p><h2>A little help.<br />A lot less admin.</h2><p>Ask in your own words. Filey AI works with your records and supported tools, within the permissions you choose.</p>
          <div className="ai-support"><span><ShieldCheck size={18} /> Your permissions</span><span><BookOpen size={18} /> Saved instructions</span></div>
          <p className="small-note">Connect your own AI provider. Usage limits and provider charges apply.</p>
        </div>
        <div className="ai-example" data-reveal>
          <div className="example-select" role="group" aria-label="AI request examples">{examples.map((item, i) => <button key={item.label} aria-pressed={i === example} onClick={() => setExample(i)}>{item.label}</button>)}</div>
          <blockquote key={selected.request}>“{selected.request}”</blockquote>
          <div className="example-steps" aria-live="polite">{selected.steps.map(step => <p key={step}><Check size={17} />{step}</p>)}</div>
          <p className="small-note">Illustrative workflow. This preview does not send a request to an AI provider.</p>
        </div>
      </div>
    </section>
    <section className="site-section next-update">
      <div className="site-container">
        <div className="section-heading" data-reveal><p className="eyebrow">Coming in the next update</p><h2>More connected.<br />Still unmistakably Filey.</h2><p>A refined workspace, clearer reports and more control over where your business lives.</p></div>
        <div className="update-layout" data-reveal>
          <div className="workspace-card">
            <div className="storage-visual" aria-hidden="true"><Laptop size={72} strokeWidth={1} /><div className="storage-connection"><span /><img src="/filey-mark.png" width="90" height="90" alt="" /><span /></div><Cloud size={68} strokeWidth={1} /></div>
            <h3>Your desktop. Your choice.</h3><p>Use a local workspace or a connected cloud workspace. Keep each store separate and choose when to transfer data.</p><span className="workspace-note">Free local invoicing is on the way.</span>
          </div>
          <div className="update-details">
            <article><span className="update-icon"><Users size={22} /></span><div><h3>A CRM that keeps the context.</h3><p>Companies, people, leads, deals and tasks together, with board and table views.</p></div></article>
            <article><span className="update-icon"><ChartNoAxesCombined size={22} /></span><div><h3>Reports with a clear purpose.</h3><p>Section insights collected in Reports. Overview charts connected to your actual invoice, receipt and expense records.</p></div></article>
            <article><span className="update-icon"><BookOpen size={22} /></span><div><h3>Help, right where you need it.</h3><p>A consistent interface, documentation and a searchable Help Center inside Filey.</p></div></article>
          </div>
        </div>
        <div className="countries-layout" data-reveal>
          <div className="section-heading"><h2>Made for business.<br />Wherever you are.</h2><p>Country-aware documents and independent currency settings are coming in the next update.</p><div className="country-tabs" role="group" aria-label="Country feature preview">{regions.map((item, i) => <button aria-pressed={i === region} key={item.code} onClick={() => setRegion(i)}>{item.name}</button>)}</div></div>
          <article className="country-paper" aria-live="polite"><span className="country-code" aria-hidden="true">{country.code}</span><h3>{country.name}</h3><dl><div><dt>Tax fields</dt><dd>{country.tax}</dd></div><div><dt>Currency</dt><dd>{country.currency}</dd></div></dl><p>{country.detail}</p><span className="small-note">Document configuration, not certified tax filing. Review your local requirements.</span></article>
        </div>
        <a className="text-link update-link" href="https://github.com/iamveer82/Filey-erp/releases">Follow the next release <ArrowUpRight size={16} /></a>
      </div>
    </section>
  </>
}
