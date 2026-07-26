import { useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, CheckCircle2, Download, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { MIN_PASSWORD, RESEND_COOLDOWN, resendOtp, signUp, verifyOtp } from '@/lib/signup'
import { downloadUrlForOS, osLabel } from '@/lib/constants'
import { detectOS } from '@/lib/os'

type Step = 'form' | 'code' | 'done'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const fieldClass =
  'h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-amber-500'

export default function SignUpDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [step, setStep] = useState<Step>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  const os = detectOS()

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // Start clean each time the dialog is reopened.
  useEffect(() => {
    if (open) return
    const t = setTimeout(() => {
      setStep('form')
      setEmail('')
      setPassword('')
      setConfirm('')
      setCode('')
      setErr(null)
      setCooldown(0)
    }, 200)
    return () => clearTimeout(t)
  }, [open])

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!EMAIL_RE.test(email.trim())) return setErr('Enter a valid email address.')
    if (password.length < MIN_PASSWORD)
      return setErr(`Password must be at least ${MIN_PASSWORD} characters.`)
    if (password !== confirm) return setErr('Passwords do not match.')
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">
            {step === 'form' && 'Create your Filey account'}
            {step === 'code' && 'Enter the code'}
            {step === 'done' && "You're all set"}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' && 'Free to start. Your data stays on your machine.'}
            {step === 'code' && <>We sent a 6-digit code to {email}.</>}
            {step === 'done' && 'Filey runs as a desktop app — download it to get started.'}
          </DialogDescription>
        </DialogHeader>

        {err && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700"
          >
            <AlertCircle className="mt-px h-[15px] w-[15px] shrink-0" />
            <span>{err}</span>
          </p>
        )}

        {step === 'form' && (
          <form onSubmit={submitForm} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="su-email" className="text-sm font-medium text-zinc-700">
                Email
              </label>
              <input
                id="su-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={fieldClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="su-pw" className="text-sm font-medium text-zinc-700">
                Password
              </label>
              <input
                id="su-pw"
                type="password"
                autoComplete="new-password"
                className={fieldClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-zinc-500">At least {MIN_PASSWORD} characters</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="su-pw2" className="text-sm font-medium text-zinc-700">
                Confirm password
              </label>
              <input
                id="su-pw2"
                type="password"
                autoComplete="new-password"
                className={fieldClass}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="btn-gradient flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-[#1A1206] transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
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
            <InputOTP maxLength={6} value={code} onChange={(v) => setCode(v.replace(/\D/g, ''))}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <button
              type="submit"
              disabled={busy || code.length < 6}
              className="btn-gradient flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-[#1A1206] transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
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
            <a
              href="#download"
              onClick={() => onOpenChange(false)}
              className="block text-center text-xs font-medium text-zinc-500 hover:text-zinc-900"
            >
              Other platforms and install options
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
