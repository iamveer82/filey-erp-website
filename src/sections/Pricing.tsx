import { useState } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import FreedomContact from '@/components/FreedomContact'
import BuyPlan from '@/components/BuyPlan'
import { BASIC, PAID, type Plan } from '@/lib/plans'

// Three plans, one decision: work on this device, or work everywhere.
// Basic is a 14-day trial of the whole app on your computer. Pro is 36 AED a
// month in the cloud. Freedom buys the local app outright, forever.
//
// Paid plans need a Filey account: BuyPlan sends a signed-in visitor straight
// to Dodo's hosted checkout, and everyone else to sign up first.
function Features({ plan }: { plan: Plan }) {
  return <ul>{plan.features.map(item => <li key={item}><Check size={16} />{item}</li>)}</ul>
}

export default function Pricing() {
  const [contact, setContact] = useState(false)
  return <section id="pricing" className="site-section pricing-section">
    <div className="site-container">
      <div className="section-heading centered" data-reveal><h2>Start free.<br />Make it yours.</h2><p>Try every app free for 14 days. Then pay once to own it, or 36 AED a month to work in the cloud.</p></div>
      <div className="pricing-grid" data-reveal>
        <article className="price-plan"><div className="plan-heading"><h3>{BASIC.name}</h3><span>{BASIC.tagline}</span></div><p className="price">{BASIC.price}<span>{BASIC.period}</span></p>
          <Features plan={BASIC} />
          <a href="#download" className="site-button site-button-secondary">Download free <ArrowUpRight size={16} /></a>
          <p className="plan-note">{BASIC.note}</p>
        </article>
        <article className="price-plan"><div className="plan-heading"><h3>{PAID.pro.name}</h3><span>{PAID.pro.tagline}</span></div><p className="price">{PAID.pro.price}<span>{PAID.pro.period}</span></p>
          <Features plan={PAID.pro} />
          <BuyPlan plan="pro" label={PAID.pro.cta} />
          <p className="plan-note">{PAID.pro.note}</p>
        </article>
        <article className="price-plan freedom-plan"><div className="plan-heading"><h3>{PAID.ultra.name}</h3><span>{PAID.ultra.tagline}</span></div><p className="price">{PAID.ultra.price}<span>{PAID.ultra.period}</span></p>
          <Features plan={PAID.ultra} />
          <BuyPlan plan="ultra" label={PAID.ultra.cta} primary />
          <p className="plan-note">{PAID.ultra.note} <button type="button" className="plan-link" onClick={() => setContact(true)}>Questions first?</button></p>
        </article>
      </div>
      <p className="pricing-fine">Prices in UAE dirhams. Dodo Payments, our merchant of record, adds any applicable tax at checkout. Freedom is a lifetime license with a 30-day money-back guarantee.</p>
    </div><FreedomContact open={contact} onClose={() => setContact(false)} />
  </section>
}
