import { useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import './FreedomContact.css'

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
  const returnFocus = useRef<HTMLElement | null>(null)

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const fields = new FormData(form)
    const name = String(fields.get('name') || '').trim()
    const phone = String(fields.get('phone') || '').trim()
    const email = String(fields.get('email') || '').trim()
    if (!name) {
      setErr('Please enter your name.')
      form.querySelector<HTMLInputElement>('[name="name"]')?.focus()
      return
    }
    if (!/^\+?[\d\s().-]+$/.test(phone) || phone.replace(/\D/g, '').length < 6) {
      setErr('Please enter a valid phone number, including your country code.')
      form.querySelector<HTMLInputElement>('[name="phone"]')?.focus()
      return
    }
    setBusy(true)
    setErr('')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, source: 'website' }),
        signal: AbortSignal.timeout(20000),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok || body?.ok !== true)
        throw new Error(typeof body?.error === 'string' ? body.error : 'We could not confirm your request. Please try again.')
      setDone(true)
    } catch (e) {
      setErr(e instanceof Error && e.name === 'TimeoutError'
        ? 'The request took too long. Please check your connection and try again.'
        : e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose() }}>
      <DialogContent
        className="freedom-dialog"
        showCloseButton={false}
        onOpenAutoFocus={() => {
          returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        }}
        onCloseAutoFocus={(event) => {
          if (returnFocus.current?.isConnected) {
            event.preventDefault()
            returnFocus.current.focus()
          }
        }}
      >
        <div className="freedom-heading">
          <DialogTitle>{done ? 'Thank you' : 'Let’s talk Freedom.'}</DialogTitle>
          <DialogDescription>
            {done
              ? 'We have your details and we’ll be in touch shortly about Filey Freedom.'
              : 'Leave your details and we’ll get in touch about Filey Freedom and setting up your workspace.'}
          </DialogDescription>
        </div>

        {done ? (
          <DialogClose asChild>
            <button type="button" className="site-button freedom-done">Close</button>
          </DialogClose>
        ) : (
          <form onSubmit={(event) => void send(event)} aria-busy={busy}>
            <fieldset disabled={busy} className="freedom-fields">
              <label>
                <span>Your name</span>
                <input name="name" autoComplete="name" required maxLength={120} placeholder="Full name" value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label>
                <span>Phone</span>
                <input name="phone" type="tel" autoComplete="tel" required maxLength={40} placeholder="+971 50 000 0000" value={phone} onChange={(event) => setPhone(event.target.value)} />
              </label>
              <label>
                <span>Email <span className="freedom-optional">(optional)</span></span>
                <input name="email" type="email" autoComplete="email" maxLength={200} placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
            </fieldset>

            {err && <p className="freedom-error" role="alert">{err}</p>}

            <div className="freedom-actions">
              <DialogClose asChild>
                <button type="button" className="site-button site-button-secondary">Cancel</button>
              </DialogClose>
              <button type="submit" disabled={busy} className="site-button">
                {busy ? 'Sending…' : 'Request Freedom'}
              </button>
            </div>
          </form>
        )}
        <DialogClose asChild>
          <button type="button" className="site-button site-button-secondary freedom-close" aria-label="Close contact form">
            <X size={18} aria-hidden="true" />
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
