import { useState } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import FreedomContact from '@/components/FreedomContact'
import BuyPlan from '@/components/BuyPlan'

// Three plans, one decision: work on this device, or work everywhere.
// Free is the whole app locally with a monthly invoice allowance. Cloud is
// $5 a month for sync. Freedom buys the local app outright, forever.
//
// Both paid plans are bought right here, with no account needed: the purchase
// is held against the buyer's email, and the app collects it the first time
// they sign in with that address.
export default function Pricing() {
  const [contact, setContact] = useState(false)
  return <section id="pricing" className="site-section pricing-section">
    <div className="site-container">
      <div className="section-heading centered" data-reveal><h2>Start free.<br />Make it yours.</h2><p>Five dollars a month to work everywhere, or one payment to own it outright.</p></div>
      <div className="pricing-grid" data-reveal>
        <article className="price-plan"><div className="plan-heading"><h3>Free</h3><span>For getting started</span></div><p className="price">$0<span>Free to start</span></p>
          <ul>{['The whole ERP and CRM on your device', '5 invoices each month', 'Inventory, accounting and PDF tools', 'Local backups you control', 'Local AI models or your own provider key', 'Community support'].map(item => <li key={item}><Check size={16} />{item}</li>)}</ul>
          <a href="#download" className="site-button site-button-secondary">Download free <ArrowUpRight size={16} /></a>
          <p className="plan-note">Everything runs on this machine. Hosted AI, messaging and other external services may have separate provider costs.</p>
        </article>
        <article className="price-plan"><div className="plan-heading"><h3>Cloud</h3><span>Work from anywhere</span></div><p className="price">$5<span>Per month, cancel any time</span></p>
          <ul>{['Sync every device you sign in on', 'Unlimited invoices — no monthly cap', 'Your team shares one workspace', 'Backed up off your machine', 'Conflicting edits held for review, never lost'].map(item => <li key={item}><Check size={16} />{item}</li>)}</ul>
          <BuyPlan plan="cloud" label="Subscribe" />
          <p className="plan-note">Your subscription follows your account, not your machine. Cancel any time from Billing inside the app.</p>
        </article>
        <article className="price-plan freedom-plan"><div className="plan-heading"><h3>Freedom</h3><span>Yours for the long run</span></div><p className="price">$100<span>One-time license</span></p>
          <ul>{['Unlimited invoicing, no monthly cap', 'Works fully offline — no network to check in with', 'Two device slots', 'Documents without the Filey watermark', 'App updates and priority support'].map(item => <li key={item}><Check size={16} />{item}</li>)}</ul>
          <BuyPlan plan="freedom" label="Buy Freedom" primary />
          <p className="plan-note">Add Cloud for $5/month if you want sync as well. <button type="button" className="plan-link" onClick={() => setContact(true)}>Questions first?</button></p>
        </article>
      </div>
      <p className="pricing-fine">Billed in USD. Tax added at checkout by Dodo Payments, our merchant of record. Lifetime license · 30-day money-back guarantee.</p>
    </div><FreedomContact open={contact} onClose={() => setContact(false)} />
  </section>
}
