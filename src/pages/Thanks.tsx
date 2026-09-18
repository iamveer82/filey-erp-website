import { Link, useSearchParams } from 'react-router'
import { Check, Download } from 'lucide-react'

// Where Dodo sends a buyer after payment.
//
// Nothing is granted here — the webhook does that, and it may land a second
// before or a second after this page paints. So this page never claims the
// plan is "active"; it tells the buyer the one thing they must do, which is
// sign in to Filey with the address they just paid with.
export default function Thanks() {
  const [params] = useSearchParams()
  const plan = params.get('plan') === 'cloud' ? 'cloud' : 'freedom'

  return <main className="thanks-page">
    <div className="site-container">
      <p className="thanks-badge"><Check size={15} /> Payment received</p>
      <h1>{plan === 'cloud' ? 'Filey Cloud is yours.' : 'Filey Freedom is yours.'}</h1>
      <p className="thanks-lead">
        {plan === 'cloud'
          ? 'Sync, unlimited invoices and one shared workspace for your team.'
          : 'Unlimited invoicing, fully offline, on two of your machines.'}
      </p>

      <ol className="thanks-steps">
        <li><strong>Open Filey</strong> — download it below if this is a new machine.</li>
        <li><strong>Sign in with the email you just paid with.</strong> That address is what your purchase is attached to.</li>
        <li>
          {plan === 'cloud'
            ? <><strong>That's it.</strong> Cloud switches on by itself — Settings → Billing will show your plan.</>
            : <><strong>That's it.</strong> Your licence activates this device automatically — Settings → Licence will show it.</>}
        </li>
      </ol>

      <p className="thanks-note">
        Your receipt comes by email from Dodo Payments, who handle billing and tax for Filey.
        Paid with a different address than you use in Filey? Sign in with the one you paid
        with, or send us the receipt and we'll move it across.
      </p>

      <div className="thanks-actions">
        <a className="site-button" href="/#download"><Download size={16} /> Download Filey</a>
        <Link className="site-button site-button-secondary" to="/">Back to Filey</Link>
      </div>
    </div>
  </main>
}
