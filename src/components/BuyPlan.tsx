import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Loader2 } from 'lucide-react'

// Buying from the website, where nobody is signed in.
//
// All we collect is an email. The edge function creates the Dodo checkout and
// the purchase is parked against that address; the first time the buyer signs
// in to Filey with it, the plan switches itself on. That is why the email
// matters more than it looks — it is the only thing tying a payment to an
// account that does not exist yet.
const FN = 'https://voyrjqgaypiylwskkwpr.functions.supabase.co/dodo'

export default function BuyPlan({ plan, label, primary }: { plan: 'cloud' | 'freedom'; label: string; primary?: boolean }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) input.current?.focus() }, [open])

  const buy = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch(FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'public_checkout', plan, email: email.trim() }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body?.url) throw new Error(body?.error || 'Checkout is unavailable right now. Please try again.')
      window.location.href = body.url
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setBusy(false)
    }
  }

  if (!open) return (
    <button type="button" onClick={() => setOpen(true)} className={primary ? 'site-button' : 'site-button site-button-secondary'}>
      {label} <ArrowUpRight size={16} />
    </button>
  )

  return <form onSubmit={buy} className="buy-form">
    <label htmlFor={`buy-${plan}`}>Email for your Filey account</label>
    <input
      id={`buy-${plan}`}
      ref={input}
      type="email"
      required
      autoComplete="email"
      placeholder="you@company.com"
      value={email}
      onChange={e => setEmail(e.target.value)}
      disabled={busy}
    />
    <button type="submit" className={primary ? 'site-button' : 'site-button site-button-secondary'} disabled={busy}>
      {busy ? <>Opening checkout <Loader2 size={15} className="buy-spin" /></> : <>Continue to payment <ArrowUpRight size={16} /></>}
    </button>
    {error && <p className="buy-error" role="alert">{error}</p>}
    <p className="buy-hint">Create your Filey account (or sign in) with this address and your plan is already there.</p>
  </form>
}
