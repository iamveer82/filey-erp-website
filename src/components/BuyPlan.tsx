import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowUpRight, Loader2 } from 'lucide-react'
import { APP_URL, MfaRequired, SignInRequired, checkout, useSession } from '@/lib/auth'
import type { PaidPlan } from '@/lib/plans'

// Buying needs a Filey account: the purchase is attached to it, so the plan
// is simply there the next time the buyer opens the app. Signed in → straight
// to Dodo's checkout. Signed out → create an account (or sign in) first; that
// page carries on to the checkout by itself.
export default function BuyPlan({ plan, label, primary, quiet }: { plan: PaidPlan; label: string; primary?: boolean; quiet?: boolean }) {
  const session = useSession()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)

  const buy = async () => {
    if (!session) {
      navigate(`/signup?plan=${plan}`)
      return
    }
    setBusy(true)
    setError('')
    setNeedsVerification(false)
    try {
      await checkout(plan) // navigates away to Dodo
    } catch (err) {
      if (err instanceof SignInRequired) navigate(`/login?plan=${plan}`)
      else setError(err instanceof Error ? err.message : String(err))
      setNeedsVerification(err instanceof MfaRequired)
      setBusy(false)
    }
  }

  return <div className="buy-form">
    <button type="button" onClick={() => void buy()} disabled={busy} className={primary ? 'site-button' : 'site-button site-button-secondary'}>
      {busy ? <>Opening checkout <Loader2 size={15} className="buy-spin" /></> : <>{label} <ArrowUpRight size={16} /></>}
    </button>
    {error && <p className="buy-error" role="alert">{error}</p>}
    {needsVerification && <a className="account-link" href={APP_URL}>Open Filey to verify and choose your plan</a>}
    {!quiet && <p className="buy-hint">{session ? `Signed in as ${session.email}` : 'Create a free account first — it takes a minute.'}</p>}
  </div>
}
