import { Link, useSearchParams } from 'react-router'
import { Check, Download } from 'lucide-react'
import { useSession } from '@/lib/auth'

// Where Dodo sends a buyer after payment — from the website store, or from a
// Buy button inside the app (`from=app`, which opened this in the browser).
//
// Nothing is granted here — the webhook does that, and it may land a second
// before or a second after this page paints. So this page never claims the
// plan is "active"; it tells the buyer the one thing left to do.
export default function Thanks() {
  const [params] = useSearchParams()
  // The backend still says cloud/freedom; the names people see are Pro/Ultra.
  const pro = ['cloud', 'pro'].includes(params.get('plan') ?? '')
  const name = pro ? 'Pro' : 'Ultra'
  const fromApp = params.get('from') === 'app'
  const session = useSession()
  // Dodo appends the outcome to the return URL; a declined card lands here too.
  const failed = /fail|cancel/i.test(params.get('status') ?? '')

  if (failed) return <div className="thanks-page">
    <div className="site-container">
      <h1>That payment didn't go through.</h1>
      <p className="thanks-lead">Nothing was charged. You can try again with another card, or pick a different plan.</p>
      <div className="thanks-actions">
        <a className="site-button" href="/#pricing">Back to plans</a>
      </div>
    </div>
  </div>

  return <div className="thanks-page">
    <div className="site-container">
      <p className="thanks-badge"><Check size={15} /> Payment received</p>
      <h1>Filey {name} is yours.</h1>
      <p className="thanks-lead">
        {pro
          ? 'Sync, unlimited invoices and one shared workspace for your team.'
          : 'Unlimited invoicing, fully offline, on two of your machines.'}
      </p>

      {fromApp ? (
        <ol className="thanks-steps">
          <li><strong>Switch back to Filey.</strong> It has been waiting for this payment and unlocks by itself within a few seconds.</li>
          <li>You can close this tab. Settings → Billing in the app shows your plan.</li>
        </ol>
      ) : (
        <ol className="thanks-steps">
          <li><strong>Open Filey</strong> — download it below if this is a new machine.</li>
          {session
            ? <li><strong>Sign in as {session.email}.</strong> Your purchase is attached to that account.</li>
            : <li><strong>Sign in with the account you paid from.</strong> Your purchase is attached to it.</li>}
          <li><strong>That's it.</strong> {name} switches on by itself — Settings → Billing will show your plan.</li>
        </ol>
      )}

      <p className="thanks-note">
        Your receipt comes by email from Dodo Payments, who handle billing and tax for Filey.
        Paid with a different address than you use in Filey? Sign in with the one you paid
        with, or send us the receipt and we'll move it across.
      </p>

      <div className="thanks-actions">
        {!fromApp && <a className="site-button" href="/#download"><Download size={16} /> Download Filey</a>}
        <Link className={fromApp ? 'site-button' : 'site-button site-button-secondary'} to="/">Back to gofiley.com</Link>
      </div>
    </div>
  </div>
}
