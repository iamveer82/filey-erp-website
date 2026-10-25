import { useEffect, useState } from 'react'
import { ArrowUpRight, Check, Tag } from 'lucide-react'
import FreedomContact from '@/components/FreedomContact'
import BuyPlan from '@/components/BuyPlan'
import { BASIC, PAID, type Plan } from '@/lib/plans'
import { SUPPORT_EMAIL } from '@/lib/constants'
import { getAccount, useSession } from '@/lib/auth'

const DISCOUNT_MAIL = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Discount on a Filey plan')}`

// Two plans, one decision: try it, then own it. Basic is a 14-day trial of the
// whole app on your computer. Freedom buys the local app outright, forever.
// Pro is off sale for now.
//
// Paid plans need a Filey account: BuyPlan sends a signed-in visitor straight
// to Dodo's hosted checkout, and everyone else to sign up first.
function Features({ plan }: { plan: Plan }) {
  return <ul>{plan.features.map(item => <li key={item}><Check size={16} />{item}</li>)}</ul>
}

export default function Pricing() {
  const [contact, setContact] = useState(false)
  const session = useSession()
  // Someone who already paid should not be offered the same thing again: the
  // card states the purchase instead of a buy button. Signed out, or if the
  // account cannot be read, the buy path stays as it is.
  const [plan, setPlan] = useState<{ token: string; owned: boolean } | null>(null)
  const owned = !!(session && plan?.token === session.access_token && plan.owned)
  useEffect(() => {
    if (!session) return
    const token = session.access_token
    let live = true
    getAccount()
      .then((account) => { if (live) setPlan({ token, owned: !!account.ultra }) })
      .catch(() => { /* unknown plan: leave the buy path in place */ })
    return () => { live = false }
  }, [session])
  return <section id="pricing" className="site-section pricing-section">
    <div className="site-container">
      <div className="section-heading centered" data-reveal><h2>Start free.<br />Make it yours.</h2><p>Try every app free for 14 days. Then pay once to own it for life.</p></div>
      <div className="pricing-offer" data-reveal>
        <Tag size={18} aria-hidden="true" />
        <p><strong>Looking for a better price?</strong> Contact our support team to get a discount on your plan.</p>
        <a href={DISCOUNT_MAIL} className="site-button">Contact support <ArrowUpRight size={16} /></a>
      </div>
      <div className="pricing-grid" data-reveal>
        <article className="price-plan"><div className="plan-heading"><h3>{BASIC.name}</h3><span>{BASIC.tagline}</span></div><p className="price">{BASIC.price}<span>{BASIC.period}</span></p>
          <Features plan={BASIC} />
          <a href="#download" className="site-button site-button-secondary">Download free <ArrowUpRight size={16} /></a>
          <p className="plan-note">{BASIC.note}</p>
        </article>
        <article className="price-plan freedom-plan"><div className="plan-heading"><h3>{PAID.ultra.name}</h3><span>{PAID.ultra.tagline}</span></div><p className="price">{PAID.ultra.price}<span>{PAID.ultra.period}</span></p>
          <Features plan={PAID.ultra} />
          {owned
            ? <p className="account-owned"><Check size={16} aria-hidden="true" /> You already own Freedom. There is nothing left to buy.</p>
            : <BuyPlan plan="ultra" label={PAID.ultra.cta} primary />}
          <p className="plan-note">{PAID.ultra.note} <button type="button" className="plan-link" onClick={() => setContact(true)}>Questions first?</button></p>
        </article>
      </div>
      <p className="pricing-fine">Prices in UAE dirhams. Dodo Payments, our merchant of record, adds any applicable tax at checkout. Freedom is a lifetime license with a 30-day money-back guarantee.</p>
    </div><FreedomContact open={contact} onClose={() => setContact(false)} />
  </section>
}
