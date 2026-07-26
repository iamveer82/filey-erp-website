import { useEffect, useState } from 'react'
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
import { REPO_URL, downloadUrlForOS, osLabel } from '@/lib/constants'
import { detectOS } from '@/lib/os'

/* The desktop app's auth screen, rebuilt for the web: one centred card on a
 * quiet canvas. Phone and Google are deliberately absent — both providers are
 * disabled in Supabase, so offering them would only produce errors. */

type Step = 'form' | 'code' | 'done'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LOGO_SRC = `${import.meta.env.BASE_URL}filey-logo.png`

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
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-zinc-700">
        {label} <span className="text-red-500">*</span>
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  )
}

const inputClass =
  'h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-amber-500'

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

  const os = detectOS()

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    const fe: Record<string, string> = {}
    if (!EMAIL_RE.test(email.trim())) fe.email = 'Enter a valid email address'
    if (password.length < MIN_PASSWORD)
      fe.password = `Password must be at least ${MIN_PASSWORD} characters`
    if (password !== confirm) fe.confirm = 'Passwords do not match'
    setFieldErr(fe)
    if (Object.keys(fe).length) return

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

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault()
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
      'Start managing your business in minutes.'
    ) : step === 'code' ? (
      <>
        Sent to <span className="font-medium text-zinc-900">{email}</span>
      </>
    ) : (
      'Filey runs as a desktop app — download it to get started.'
    )

  return (
    <div className="grid min-h-[100dvh] place-items-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link to="/" aria-label="Filey ERP — back to the homepage">
            <img src={LOGO_SRC} alt="" className="h-11 w-11 rounded-lg" width={44} height={44} />
          </Link>
          <h1 className="mt-4 font-display text-xl font-semibold tracking-tight text-zinc-900">
            {heading}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">{sub}</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {err && (
            <p
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700"
            >
              <AlertCircle className="mt-px h-[15px] w-[15px] shrink-0" />
              <span>{err}</span>
            </p>
          )}

          {step === 'form' && (
            <form onSubmit={submitForm} className="space-y-4">
              <Field id="email" label="Email" error={fieldErr.email}>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    className={inputClass}
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
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={inputClass}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <Field id="confirm" label="Confirm password" error={fieldErr.confirm}>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={inputClass}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <button
                type="submit"
                disabled={busy}
                className="btn-gradient flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-[#1A1206] transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy ? 'Creating…' : 'Create account'}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={submitCode} className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setStep('form')
                  setCode('')
                  setErr(null)
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>

              <div className="space-y-1.5">
                <span className="block text-sm font-medium text-zinc-700">6-digit code</span>
                <InputOTP maxLength={6} value={code} onChange={(v) => setCode(v.replace(/\D/g, ''))}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <button
                type="submit"
                disabled={busy || code.length < 6}
                className="btn-gradient flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-[#1A1206] transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy ? 'Verifying…' : 'Verify'}
              </button>

              <button
                type="button"
                disabled={busy || cooldown > 0}
                onClick={resend}
                className="w-full text-center text-xs font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-50"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg bg-emerald-50 px-3 py-3">
                <CheckCircle2 className="mt-px h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-sm text-emerald-900">
                  Account created for <span className="font-medium">{email}</span>. Sign in with the
                  same email in the desktop app.
                </p>
              </div>
              <a
                href={downloadUrlForOS(os)}
                className="btn-gradient flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-[#1A1206] transition-all duration-200 active:scale-[0.98]"
              >
                <Download className="h-[18px] w-[18px]" />
                Download for {osLabel(os)}
              </a>
              <Link
                to="/#download"
                className="block text-center text-xs font-medium text-zinc-500 hover:text-zinc-900"
              >
                Other platforms and install options
              </Link>
            </div>
          )}
        </div>

        {step !== 'done' && (
          <p className="mt-4 text-center text-xs text-zinc-500">
            Already have an account?{' '}
            <Link to="/#download" className="font-medium text-zinc-900">
              Sign in from the desktop app
            </Link>
          </p>
        )}

        <p className="mt-6 text-center text-[11px] text-zinc-400">
          Protected workspace ·{' '}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600">
            Open source
          </a>
        </p>
      </div>
    </div>
  )
}
