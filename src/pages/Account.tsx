import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { ArrowUpRight, Check, Globe, KeyRound, Loader2, LogOut, Monitor, User } from 'lucide-react'
import BuyPlan from '@/components/BuyPlan'
import {
  APP_URL,
  MIN_PASSWORD,
  SignInRequired,
  changePassword,
  getAccount,
  getSession,
  signedInRecently,
  openBillingPortal,
  signOut,
  useSession,
  type Account as AccountData,
} from '@/lib/auth'

// The signed-in visitor's corner of the website: who they are, what they
// pay for, the web app their plan includes, and their password. Everything
// is read with their own session, so RLS decides what shows — never this page.

const date = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

export default function Account() {
  const session = useSession()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [account, setAccount] = useState<AccountData | null>(null)
  const [error, setError] = useState('')
  const [expired, setExpired] = useState(false)
  const [portalBusy, setPortalBusy] = useState(false)
  const [portalError, setPortalError] = useState('')
  // Signing out from here goes home; without this the "must be signed in"
  // redirect below wins the race and lands on the login page instead.
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!session) return
    let live = true
    getAccount()
      .then((a) => {
        if (!live) return
        // The header's "Open Filey" lands here; with a plan, go straight in.
        if (params.get('open') === '1' && a.web) window.location.replace(APP_URL)
        else setAccount(a)
      })
      .catch((e) => {
        if (!live) return
        if (e instanceof SignInRequired) setExpired(true)
        else setError(e instanceof Error ? e.message : String(e))
      })
    return () => { live = false }
  }, [session, params])

  if (leaving) return null
  if (!session || expired) return <Navigate to={`/login?next=${encodeURIComponent('/account' + (params.get('open') ? '?open=1' : ''))}`} replace />

  const manage = async () => {
    setPortalBusy(true)
    setPortalError('')
    try {
      await openBillingPortal()
    } catch (e) {
      setPortalError(e instanceof Error ? e.message : String(e))
      setPortalBusy(false)
    }
  }

  const planName = account ? [account.pro && 'Pro', account.ultra && 'Ultra'].filter(Boolean).join(' + ') || 'Basic' : ''

  return <div className="account-page">
    <div className="site-container">
      <header className="account-head">
        <h1>Your account</h1>
        <p>{session.email}</p>
      </header>

      {error && <p className="account-error" role="alert">{error}</p>}
      {!account && !error && <p className="account-loading" role="status"><Loader2 size={16} className="buy-spin" /> Loading your account…</p>}

      {account && <div className="account-grid">
        <section className="account-card" aria-labelledby="acct-web">
          <h2 id="acct-web"><Globe size={17} /> Filey on the web</h2>
          {account.web ? <>
            <p>Your {account.pro || account.ultra ? planName : 'workspace'} includes Filey in the browser. Sign in there with this same email.</p>
            <a className="site-button" href={APP_URL}>Open Filey <ArrowUpRight size={16} /></a>
          </> : <>
            <p>Filey on the web is part of Pro and Ultra. On Basic, Filey runs free on your own computer.</p>
            <div className="account-actions">
              <BuyPlan plan="pro" label="Get Pro" quiet />
              <BuyPlan plan="ultra" label="Get Ultra" primary quiet />
            </div>
            <a className="account-link" href="/#download">Download the free desktop app</a>
          </>}
        </section>

        <section className="account-card" aria-labelledby="acct-plan">
          <h2 id="acct-plan"><Check size={17} /> Plan and billing</h2>
          <dl className="account-list">
            <div><dt>Plan</dt><dd>{planName}{account.grandfathered && !account.pro && !account.ultra ? ' (early-access cloud)' : ''}</dd></div>
            {account.pro && <>
              <div><dt>Pro</dt><dd>{account.pro.status === 'past_due' ? 'Payment retrying' : 'Active'}</dd></div>
              <div><dt>Renews</dt><dd>{date(account.pro.renews)}</dd></div>
            </>}
            {account.ultra && <div><dt>Ultra since</dt><dd>{date(account.ultra.since)}</dd></div>}
          </dl>
          {account.ultra && <>
            <h3>Ultra devices</h3>
            <ul className="account-devices">
              {account.ultra.devices.length === 0 && <li>No computer activated yet — sign in to the desktop app and it activates itself.</li>}
              {account.ultra.devices.map((d) => <li key={d.name + d.since}><Monitor size={14} /> {d.name}<span>{d.active ? `since ${date(d.since)}` : 'released'}</span></li>)}
            </ul>
            <p className="account-note">Two device slots. Free one from Settings → Licence in the app.</p>
          </>}
          {account.pro && <button type="button" className="site-button site-button-secondary" disabled={portalBusy} onClick={() => void manage()}>
            {portalBusy ? <>Opening <Loader2 size={15} className="buy-spin" /></> : <>Manage billing <ArrowUpRight size={16} /></>}
          </button>}
          {portalError && <p className="buy-error" role="alert">{portalError}</p>}
          {!account.pro && !account.ultra && <p className="account-note">Compare plans on the <Link to="/#pricing">pricing page</Link>.</p>}
          {account.ultra && !account.pro && <p className="account-note">Receipts for Ultra come by email from Dodo Payments.</p>}
        </section>

        <section className="account-card" aria-labelledby="acct-info">
          <h2 id="acct-info"><User size={17} /> Account information</h2>
          <dl className="account-list">
            <div><dt>Email</dt><dd>{account.email}</dd></div>
            <div><dt>Name</dt><dd>{account.name || '—'}</dd></div>
            <div><dt>Company</dt><dd>{account.company || '—'}</dd></div>
            <div><dt>Member since</dt><dd>{date(account.createdAt)}</dd></div>
            <div><dt>Last sign-in</dt><dd>{date(account.lastSignIn)}</dd></div>
          </dl>
          <p className="account-note">Change your name and company in the app, under Settings → Account.</p>
        </section>

        <PasswordCard />
      </div>}

      <button type="button" className="account-signout" onClick={() => { setLeaving(true); navigate('/'); void signOut() }}><LogOut size={15} /> Sign out</button>
    </div>
  </div>
}

function PasswordCard() {
  // Just signed in (maybe by code, having forgotten the password): the
  // current one is not asked for. Read once — the window is minutes long.
  const [recent] = useState(() => signedInRecently(getSession()))
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setDone(false)
    if (next.length < MIN_PASSWORD) return setError(`The new password needs at least ${MIN_PASSWORD} characters.`)
    if (next !== confirm) return setError("The new passwords don't match.")
    if (current && next === current) return setError('Choose a password different from the current one.')
    setBusy(true)
    try {
      await changePassword(current, next)
      setDone(true)
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return <section className="account-card" aria-labelledby="acct-pw">
    <h2 id="acct-pw"><KeyRound size={17} /> Change password</h2>
    <form className="account-form" onSubmit={submit}>
      {recent
        ? <p className="account-note">You signed in a moment ago, so your current password isn't needed.</p>
        : <>
          <label htmlFor="pw-current">Current password</label>
          <input id="pw-current" type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} disabled={busy} />
        </>}
      <label htmlFor="pw-next">New password</label>
      <input id="pw-next" type="password" autoComplete="new-password" required minLength={MIN_PASSWORD} value={next} onChange={(e) => setNext(e.target.value)} disabled={busy} />
      <label htmlFor="pw-confirm">Confirm new password</label>
      <input id="pw-confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={busy} />
      {error && <p className="buy-error" role="alert">{error}</p>}
      {done && <p className="account-ok" role="status"><Check size={14} /> Password changed. Use it next time you sign in, here and in the app.</p>}
      <button type="submit" className="site-button site-button-secondary" disabled={busy}>
        {busy ? <>Saving <Loader2 size={15} className="buy-spin" /></> : 'Change password'}
      </button>
    </form>
    {!recent && <p className="account-note">Forgot it? Sign out, sign in with a code, then set a new one here.</p>}
  </section>
}
