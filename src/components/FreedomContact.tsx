import { useEffect, useState } from 'react'

/* "Get Freedom" — the plan is sold by conversation, not by checkout, so the
 * button collects a name and a number and emails the owner through the
 * `lead-contact` edge function. That function is public by design (a visitor
 * has no session) and rate limits by IP, so nothing secret lives here. */

const ENDPOINT = 'https://voyrjqgaypiylwskkwpr.functions.supabase.co/lead-contact'

export default function FreedomContact({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  // Escape closes, and the page behind must not scroll while this is up.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const send = async () => {
    setBusy(true)
    setErr('')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, source: 'website' }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok || body?.error) throw new Error(body?.error ?? 'Please try again.')
      setDone(true)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-zinc-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center">
            <p className="font-display text-xl font-semibold text-zinc-900">Thank you</p>
            <p className="mt-2 text-sm leading-[1.6] text-zinc-600">
              We have your details and we&rsquo;ll be in touch shortly about Filey
              Freedom.
            </p>
            <button
              onClick={onClose}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg border border-zinc-300 text-sm font-semibold text-zinc-900 hover:border-amber-500 hover:bg-amber-50"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-display text-xl font-semibold text-zinc-900">
              Get Filey Freedom
            </h3>
            <p className="mt-2 text-sm leading-[1.6] text-zinc-600">
              AED 1,499, paid once, yours for good. Leave your details and we&rsquo;ll
              get in touch to set it up.
            </p>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">
                  Your name
                </span>
                <input
                  className="mt-1 h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-amber-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">
                  Phone
                </span>
                <input
                  className="mt-1 h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-amber-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+971 50 000 0000"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">
                  Email (optional)
                </span>
                <input
                  className="mt-1 h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none focus:border-amber-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </label>
            </div>

            {err && <p className="mt-3 text-sm font-medium text-red-600">{err}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-zinc-300 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={send}
                disabled={busy || !name.trim() || !phone.trim()}
                className="btn-gradient inline-flex h-11 flex-1 items-center justify-center rounded-lg text-sm font-semibold text-[#1A1206] disabled:opacity-50"
              >
                {busy ? 'Sending…' : 'Request Freedom'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
