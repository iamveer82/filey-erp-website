import { useState } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import FreedomContact from '@/components/FreedomContact'

export default function Pricing() {
  const [contact, setContact] = useState(false)
  return <section id="pricing" className="site-section pricing-section">
    <div className="site-container">
      <div className="section-heading centered" data-reveal><h2>Start free.<br />Make it yours.</h2><p>Room to begin. A one-time upgrade when you need more.</p></div>
      <div className="pricing-grid" data-reveal>
        <article className="price-plan"><div className="plan-heading"><h3>Free</h3><span>For getting started</span></div><p className="price">AED 0<span>Free to start</span></p>
          <ul>{['5 cloud invoices each month', 'CRM, inventory and core business tools', 'Cloud workspace and backup', 'Connect your own AI provider', 'Community support'].map(item => <li key={item}><Check size={16} />{item}</li>)}</ul>
          <a href="#download" className="site-button site-button-secondary">Download free <ArrowUpRight size={16} /></a>
          <p className="plan-note">Unlimited local invoicing is planned for the next desktop update.</p>
        </article>
        <article className="price-plan freedom-plan"><div className="plan-heading"><h3>Freedom</h3><span>Yours for the long run</span></div><p className="price">AED 1,499<span>One-time license</span></p>
          <ul>{['Unlimited invoicing', 'Local mode and cloud options', 'Two device slots', 'Documents without the Filey watermark', 'App updates and priority support'].map(item => <li key={item}><Check size={16} />{item}</li>)}</ul>
          <button onClick={() => setContact(true)} className="site-button">Ask about Freedom <ArrowUpRight size={16} /></button>
          <p className="plan-note">AI, messaging and other external services may have separate provider costs.</p>
        </article>
      </div>
      <p className="pricing-fine">Prices in AED. VAT may apply at checkout. Lifetime license · 30-day money-back guarantee.</p>
    </div><FreedomContact open={contact} onClose={() => setContact(false)} />
  </section>
}
