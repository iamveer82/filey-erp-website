import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { MIN_PASSWORD, RESEND_COOLDOWN, resendOtp, signUp, verifyOtp } from '@/lib/signup'
import { REPO_URL } from '@/lib/constants'
import './SignUp.css'

/* The desktop app's auth screen, rebuilt for the web: one centred card on a
 * quiet canvas. Phone and Google are deliberately absent — both providers are
 * disabled in Supabase, so offering them would only produce errors. */

type Step = 'form' | 'code' | 'done'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LOGO_SRC = '/filey-mark.png'

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

export default function SignUp() {
  const [step, setStep] = useState<Step>('form')
  const [email, setEmail] = useState('')
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

  const submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (busy) return
    setErr(null)
    const fe: Record<string, string> = {}
    if (!EMAIL_RE.test(email.trim())) fe.email = 'Enter a valid email address'
    if (password.length < MIN_PASSWORD)
      fe.password = `Password must be at least ${MIN_PASSWORD} characters`
    if (password !== confirm) fe.confirm = 'Passwords do not match'
    setFieldErr(fe)
    if (Object.keys(fe).length) {
      e.currentTarget.querySelector<HTMLInputElement>(`#${Object.keys(fe)[0]}`)?.focus()
      return
    }

    setBusy(true)
    try {
      await signUp(email, password)
      setStep('code')
      setCooldown(RESEND_COOLDOWN)
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : String(e2))
    } finally {
      setBusy(false)
    }
  }

  const submitCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (busy || code.length !== 6) return
    setErr(null)
    setBusy(true)
    try {
      await verifyOtp(email, code)
      setStep('done')
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : String(e2))
    } finally {
      setBusy(false)
    }
  }

  const resend = async () => {
    if (busy || cooldown > 0) return
    setErr(null)
    setBusy(true)
    try {
      await resendOtp(email)
      setCooldown(RESEND_COOLDOWN)
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : String(e2))
    } finally {
      setBusy(false)
    }
  }

  const heading =
    step === 'form' ? 'Create your account' : step === 'code' ? 'Enter the code' : "You're all set"
  const sub =
    step === 'form' ? (
      'One account for your Filey desktop workspace.'
    ) : step === 'code' ? (
      <>
        Sent to <strong>{email}</strong>
      </>
    ) : (
      'Download Filey to start using your workspace.'
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
              <span>{err}</span>
            </p>
          )}

          {step === 'form' && (
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

              <Field
                id="password"
                label="Password"
                hint={`At least ${MIN_PASSWORD} characters`}
                error={fieldErr.password}
              >
                <div className="signup-input signup-input-password">
                  <Lock aria-hidden="true" />
                  <input
                    id="password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={MIN_PASSWORD}
                    aria-invalid={Boolean(fieldErr.password)}
                    aria-describedby={fieldErr.password ? 'password-hint password-error' : 'password-hint'}
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
              </fieldset>

              <button
                type="submit"
                disabled={busy}
                className="site-button signup-submit"
              >
                {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                {busy ? 'Creating…' : 'Create account'}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={submitCode} aria-busy={busy} className="signup-verification">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setStep('form')
                  setCode('')
                  setErr(null)
                }}
                className="signup-back"
              >
                <ArrowLeft size={16} aria-hidden="true" /> Change email
              </button>

              <div className="signup-field">
                <label htmlFor="verification-code">Email verification code</label>
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

              <button
                type="submit"
                disabled={busy || code.length < 6}
                className="site-button signup-submit"
              >
                {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                {busy ? 'Please wait…' : 'Verify email'}
              </button>

              <button
                type="button"
                disabled={busy || cooldown > 0}
                onClick={resend}
                className="signup-resend"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="signup-complete">
              <div className="signup-success" role="status">
                <CheckCircle2 size={22} aria-hidden="true" />
                <p>
                  Account created for <strong>{email}</strong>. Sign in with the
                  same email in the desktop app.
                </p>
              </div>
              <a
                href="/#download"
                className="site-button signup-submit"
              >
                <Download size={18} aria-hidden="true" />
                Choose your download
              </a>
              <p className="signup-hint">See the installers available for your computer.</p>
            </div>
          )}
        </div>

        {step !== 'done' && (
          <p className="signup-account-link">
            Already have an account?{' '}
            <a href="/#download">
              Sign in from the desktop app
            </a>
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
