import { useState } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import FreedomContact from '@/components/FreedomContact'

// Three plans, one decision: work on this device, or work everywhere.
// Free is the whole app locally with a monthly invoice allowance. Cloud is a
// dollar a month for sync. Freedom buys the local app outright, forever.
// Both paid plans are bought inside the app, because a licence and a
// subscription both attach to a signed-in account.
export default function Pricing() {
  const [contact, setContact] = useState(false)
  return <section id="pricing" className="site-section pricing-section">
    <div className="site-container">
      <div className="section-heading centered" data-reveal><h2>Start free.<br />Make it yours.</h2><p>A dollar a month to work everywhere, or one payment to own it outright.</p></div>
      <div className="pricing-grid" data-reveal>
        <article className="price-plan"><div className="plan-heading"><h3>Free</h3><span>For getting started</span></div><p className="price">AED 0<span>Free to start</span></p>
          <ul>{['The whole ERP and CRM on your device', '5 invoices each month', 'Inventory, accounting and PDF tools', 'Local backups you control', 'Local AI models or your own provider key', 'Community support'].map(item => <li key={item}><Check size={16} />{item}</li>)}</ul>
          <a href="#download" className="site-button site-button-secondary">Download free <ArrowUpRight size={16} /></a>
          <p className="plan-note">Everything runs on this machine. Hosted AI, messaging and other external services may have separate provider costs.</p>
        </article>
        <article className="price-plan"><div className="plan-heading"><h3>Cloud</h3><span>Work from anywhere</span></div><p className="price">$1<span>Per month, cancel any time</span></p>
          <ul>{['Sync every device you sign in on', 'Unlimited invoices — no monthly cap', 'Your team shares one workspace', 'Backed up off your machine', 'Conflicting edits held for review, never lost'].map(item => <li key={item}><Check size={16} />{item}</li>)}</ul>
          <a href="#download" className="site-button site-button-secondary">Get the app <ArrowUpRight size={16} /></a>
          <p className="plan-note">Subscribe inside Filey, in Settings → Billing. Your subscription follows your account, not your machine.</p>
        </article>
        <article className="price-plan freedom-plan"><div className="plan-heading"><h3>Freedom</h3><span>Yours for the long run</span></div><p className="price">AED 1,499<span>One-time license</span></p>
          <ul>{['Unlimited invoicing, no monthly cap', 'Works fully offline — no network to check in with', 'Two device slots', 'Documents without the Filey watermark', 'App updates and priority support'].map(item => <li key={item}><Check size={16} />{item}</li>)}</ul>
          <a href="#download" className="site-button">Buy in the app <ArrowUpRight size={16} /></a>
          <p className="plan-note">Add Cloud for $1/month if you want sync as well. <button type="button" className="plan-link" onClick={() => setContact(true)}>Questions first?</button></p>
        </article>
      </div>
      <p className="pricing-fine">Cloud billed in USD, Freedom in AED. Tax added at checkout by Dodo Payments, our merchant of record. Lifetime license · 30-day money-back guarantee.</p>
    </div><FreedomContact open={contact} onClose={() => setContact(false)} />
  </section>
}
