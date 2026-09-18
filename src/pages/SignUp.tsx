import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import {
  MIN_PASSWORD,
  RESEND_COOLDOWN,
  checkout,
  getSession,
  resendSignupCode,
  sendLoginCode,
  signIn,
  signOut,
  signUp,
  useSession,
  verifyLoginCode,
  verifySignupCode,
} from '@/lib/auth'
import { PAID, type PaidPlan } from '@/lib/plans'
import { REPO_URL } from '@/lib/constants'
import './SignUp.css'

/* The desktop app's auth screen, rebuilt for the web: one centred card on a
 * quiet canvas, serving both /signup and /login. Phone and Google are
 * deliberately absent — both providers are disabled in Supabase, so offering
 * them would only produce errors.
 *
 * Buying needs an account, so every Get Pro / Get Ultra button sends a
 * signed-out visitor here with ?plan=. Once they are in, finish() takes them
 * straight on to Dodo's checkout — no second click on the pricing page. */

type Mode = 'signup' | 'login'
type Step = 'form' | 'code' | 'done'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Fetching the code means leaving this page for the inbox — and a phone that
// switches to its mail app often reloads the tab on the way back. Remember
// that a code is on its way, so the visitor lands on the code step again
// instead of an empty form.
const PENDING = 'filey-site-pending-code'
function pendingCode(mode: Mode): string | null {
  try {
    const p = JSON.parse(sessionStorage.getItem(PENDING) ?? 'null') as { mode: Mode; email: string } | null
    return p?.mode === mode ? p.email : null
  } catch { return null }
}
function rememberCode(mode: Mode, email: string | null) {
  try {
    if (email) sessionStorage.setItem(PENDING, JSON.stringify({ mode, email }))
    else sessionStorage.removeItem(PENDING)
  } catch { /* private window: the form simply starts over */ }
}
const LOGO_SRC = '/filey-mark.png'
const message = (e: unknown) => (e instanceof Error ? e.message : String(e))

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="signup-field">
      <label htmlFor={id}>
        {label} <span className="signup-required" aria-hidden="true">*</span>
      </label>
      {children}
      {hint && <p id={`${id}-hint`} className="signup-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="signup-field-error" role="alert">{error}</p>}
    </div>
  )
}

export default function SignUp({ mode }: { mode: Mode }) {
  const [params] = useSearchParams()
  const plan = (['pro', 'ultra'] as PaidPlan[]).find((p) => p === params.get('plan'))
  const session = useSession()
  const [step, setStep] = useState<Step>(() => (getSession() ? 'done' : pendingCode(mode) ? 'code' : 'form'))
  const [withCode, setWithCode] = useState(false)
  const [created, setCreated] = useState(false)
  const [email, setEmail] = useState(() => pendingCode(mode) ?? '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [code, setCode] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({})
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // Signed out in another tab while this one said "signed in": show the form.
  const view: Step = step === 'done' && !session ? 'form' : step

  const withPlan = (path: string) => (plan ? `${path}?plan=${plan}` : path)
  const planName = plan ? PAID[plan].name : ''
  const codeLogin = mode === 'login' && withCode

  /** Signed in. A plan brought them here, so carry on to paying for it. */
  const finish = async () => {
    setStep('done')
    if (!plan) return
    setBusy(true)
    try {
      await checkout(plan) // navigates away to Dodo
    } catch (e2) {
      setErr(message(e2))
      setBusy(false)
    }
  }

  const submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (busy) return
    setErr(null)
    const fe: Record<string, string> = {}
    if (!EMAIL_RE.test(email.trim())) fe.email = 'Enter a valid email address'
    if (mode === 'signup') {
      if (password.length < MIN_PASSWORD)
        fe.password = `Password must be at least ${MIN_PASSWORD} characters`
      if (password !== confirm) fe.confirm = 'Passwords do not match'
    } else if (!codeLogin && !password) fe.password = 'Enter your password'
    setFieldErr(fe)
    if (Object.keys(fe).length) {
      e.currentTarget.querySelector<HTMLInputElement>(`#${Object.keys(fe)[0]}`)?.focus()
      return
    }

    setBusy(true)
    try {
      if (mode === 'signup') {
        await signUp(email, password)
        setStep('code')
        rememberCode(mode, email.trim())
        setCooldown(RESEND_COOLDOWN)
      } else if (codeLogin) {
        await sendLoginCode(email)
        setStep('code')
        rememberCode(mode, email.trim())
        setCooldown(RESEND_COOLDOWN)
      } else {
        await signIn(email, password)
        setBusy(false)
        await finish()
        return
      }
    } catch (e2) {
      setErr(message(e2))
    }
    setBusy(false)
  }

  const submitCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (busy || code.length !== 6) return
    setErr(null)
    setBusy(true)
    try {
      if (mode === 'signup') {
        await verifySignupCode(email, code)
        setCreated(true)
      } else {
        await verifyLoginCode(email, code)
      }
      rememberCode(mode, null)
      setBusy(false)
      await finish()
    } catch (e2) {
      setErr(message(e2))
      setBusy(false)
    }
  }

  const resend = async () => {
    if (busy || cooldown > 0) return
    setErr(null)
    setBusy(true)
    try {
      await (mode === 'signup' ? resendSignupCode(email) : sendLoginCode(email))
      setCooldown(RESEND_COOLDOWN)
    } catch (e2) {
      setErr(message(e2))
    } finally {
      setBusy(false)
    }
  }

  const leave = async () => {
    await signOut()
    setStep('form')
    setCreated(false)
    setErr(null)
  }

  const heading =
    view === 'code'
      ? 'Enter the code'
      : view === 'done'
        ? plan
          ? `One step to ${planName}`
          : created
            ? "You're all set"
            : "You're signed in"
        : mode === 'signup'
          ? 'Create your account'
          : 'Welcome back'
  const sub =
    view === 'code' ? (
      <>
        Sent to <strong>{email}</strong>
      </>
    ) : view === 'done' ? (
      <>
        Signed in as <strong>{session?.email || email}</strong>
      </>
    ) : mode === 'signup' ? (
      plan ? `Create your free Filey account, then pay for ${planName}.` : 'One account for your Filey desktop workspace.'
    ) : plan ? (
      `Sign in, then pay for ${planName}.`
    ) : (
      'Sign in to your Filey account.'
    )

  return (
    <main className="signup-page" aria-labelledby="signup-title">
      <div className="signup-content">
        <header className="signup-heading">
          <Link to="/" aria-label="Filey ERP — back to the homepage">
            <img src={LOGO_SRC} alt="" width={72} height={72} />
          </Link>
          <div aria-live="polite">
            <h1 id="signup-title">{heading}</h1>
            <p>{sub}</p>
          </div>
        </header>

        <div className="signup-card">
          {err && (
            <p id="signup-error" role="alert" className="signup-error">
              <AlertCircle size={18} aria-hidden="true" />
              <span>
                {err}
                {mode === 'signup' && /already exists/i.test(err) && (
                  <>
                    {' '}
                    <Link to={withPlan('/login')}>Sign in instead</Link>
                  </>
                )}
              </span>
            </p>
          )}

          {view === 'form' && (
            <form onSubmit={submitForm} noValidate aria-busy={busy}>
              <fieldset disabled={busy} className="signup-fields">
                <legend className="sr-only">Account details. All fields are required.</legend>
                <Field id="email" label="Email" error={fieldErr.email}>
                  <div className="signup-input">
                    <Mail aria-hidden="true" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      aria-invalid={Boolean(fieldErr.email)}
                      aria-describedby={fieldErr.email ? 'email-error' : undefined}
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </Field>

                {!codeLogin && (
                  <Field
                    id="password"
                    label="Password"
                    hint={mode === 'signup' ? `At least ${MIN_PASSWORD} characters` : undefined}
                    error={fieldErr.password}
                  >
                    <div className="signup-input signup-input-password">
                      <Lock aria-hidden="true" />
                      <input
                        id="password"
                        name="password"
                        type={showPw ? 'text' : 'password'}
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                        required
                        minLength={mode === 'signup' ? MIN_PASSWORD : undefined}
                        aria-invalid={Boolean(fieldErr.password)}
                        aria-describedby={
                          fieldErr.password
                            ? mode === 'signup' ? 'password-hint password-error' : 'password-error'
                            : mode === 'signup' ? 'password-hint' : undefined
                        }
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        aria-label="Show password"
                        aria-pressed={showPw}
                        aria-controls="password"
                        onClick={() => setShowPw((v) => !v)}
                        className="signup-visibility"
                      >
                        {showPw ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                      </button>
                    </div>
                  </Field>
                )}

                {mode === 'signup' && (
                  <Field id="confirm" label="Confirm password" error={fieldErr.confirm}>
                    <div className="signup-input signup-input-password">
                      <Lock aria-hidden="true" />
                      <input
                        id="confirm"
                        name="confirm-password"
                        type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        aria-invalid={Boolean(fieldErr.confirm)}
                        aria-describedby={fieldErr.confirm ? 'confirm-error' : undefined}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                      />
                      <button
                        type="button"
                        aria-label="Show confirmation password"
                        aria-pressed={showConfirm}
                        aria-controls="confirm"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="signup-visibility"
                      >
                        {showConfirm ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                      </button>
                    </div>
                  </Field>
                )}
              </fieldset>

              <button type="submit" disabled={busy} className="site-button signup-submit">
                {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                {busy
                  ? 'Please wait…'
                  : mode === 'signup'
                    ? plan ? 'Create account and continue' : 'Create account'
                    : codeLogin ? 'Email me a code' : plan ? 'Sign in and continue' : 'Sign in'}
              </button>

              {mode === 'login' && (
                <button
                  type="button"
                  disabled={busy}
                  className="signup-resend"
                  onClick={() => {
                    setWithCode((v) => !v)
                    setErr(null)
                    setFieldErr({})
                  }}
                >
                  {withCode ? 'Use my password instead' : 'Forgot your password? Sign in with a code'}
                </button>
              )}
            </form>
          )}

          {view === 'code' && (
            <form onSubmit={submitCode} aria-busy={busy} className="signup-verification">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setStep('form')
                  rememberCode(mode, null)
                  setCode('')
                  setErr(null)
                }}
                className="signup-back"
              >
                <ArrowLeft size={16} aria-hidden="true" /> Change email
              </button>

              <div className="signup-field">
                <label htmlFor="verification-code">
                  {mode === 'signup' ? 'Email verification code' : 'Sign-in code'}
                </label>
                <p id="verification-hint" className="signup-hint">Enter the 6-digit code from your email.</p>
                <InputOTP
                  id="verification-code"
                  name="verification-code"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  required
                  disabled={busy}
                  aria-describedby={err ? 'verification-hint signup-error' : 'verification-hint'}
                  containerClassName="signup-otp"
                  value={code}
                  onChange={(v) => setCode(v.replace(/\D/g, ''))}
                >
                  <InputOTPGroup aria-hidden="true">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <button type="submit" disabled={busy || code.length < 6} className="site-button signup-submit">
                {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                {busy ? 'Please wait…' : mode === 'signup' ? 'Verify email' : 'Sign in'}
              </button>

              <button type="button" disabled={busy || cooldown > 0} onClick={resend} className="signup-resend">
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
              </button>
            </form>
          )}

          {view === 'done' && (
            <div className="signup-complete">
              <div className="signup-success" role="status">
                <CheckCircle2 size={22} aria-hidden="true" />
                <p>
                  {created ? 'Account created. ' : ''}
                  {plan
                    ? `Next is ${planName} checkout with Dodo Payments. The plan attaches to this account.`
                    : 'Use this same email in the desktop app — your workspace and plan follow your account.'}
                </p>
              </div>
              {plan ? (
                <button type="button" className="site-button signup-submit" disabled={busy} onClick={() => void finish()}>
                  {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                  {busy ? 'Opening checkout…' : <>Continue to payment <ArrowUpRight size={16} aria-hidden="true" /></>}
                </button>
              ) : (
                <>
                  <a href="/#download" className="site-button signup-submit">
                    <Download size={18} aria-hidden="true" />
                    Choose your download
                  </a>
                  <a href="/#pricing" className="signup-resend">See plans</a>
                </>
              )}
              <button type="button" className="signup-resend" disabled={busy} onClick={() => void leave()}>
                Not you? Sign out
              </button>
            </div>
          )}
        </div>

        {view !== 'done' && (
          <p className="signup-account-link">
            {mode === 'signup' ? (
              <>
                Already have an account? <Link to={withPlan('/login')}>Sign in</Link>
              </>
            ) : (
              <>
                New to Filey? <Link to={withPlan('/signup')}>Create an account</Link>
              </>
            )}
          </p>
        )}

        <p className="signup-footer">
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            Filey is open source
          </a>
        </p>
      </div>
    </main>
  )
}
