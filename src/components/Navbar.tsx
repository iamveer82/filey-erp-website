import { useRef, useState } from 'react'
import { Menu, X, Sun, Moon, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { signOut, useSession } from '@/lib/auth'

const links = [['Features', '/#features'], ['Demo', '/#demo'], ['Pricing', '/#pricing'], ['Download', '/#download'], ['FAQ', '/#faq']]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const session = useSession()
  const menuButton = useRef<HTMLButtonElement>(null)
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')
  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.dataset.theme = next ? 'dark' : 'light'
    try { localStorage.setItem('filey-site-theme', next ? 'dark' : 'light') } catch { /* Theme still changes in this tab. */ }
  }
  return <header className="site-nav" onKeyDown={event => { if (event.key === 'Escape' && open) { setOpen(false); menuButton.current?.focus() } }}>
    <div className="site-container nav-inner">
      <a className="wordmark" href="/#top" aria-label="Filey ERP home" onClick={() => setOpen(false)}>
        <img src="/filey-mark.png" alt="" width="44" height="44" /><span>Filey<span className="wordmark-erp"> ERP</span></span>
      </a>
      <nav className="nav-desktop" aria-label="Primary">{links.map(([name, url]) => <a href={url} key={url}>{name}</a>)}</nav>
      <div className="nav-actions">
        <button className="icon-button" onClick={toggleTheme} aria-label={dark ? 'Use light appearance' : 'Use dark appearance'}>{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
        {session
          ? <Link className="nav-signin" to="/account" title={`Signed in as ${session.email}`}>Account</Link>
          : <Link className="nav-signin" to="/login">Sign in</Link>}
        {session
          // Filey on the web: /account sends Pro and Ultra straight in, and shows
          // everyone else what the web app needs.
          ? <Link className="site-button nav-signup" to="/account?open=1">Open Filey <ArrowUpRight size={15} /></Link>
          : <Link className="site-button nav-signup" to="/signup">Get started <ArrowUpRight size={15} /></Link>}
        <button ref={menuButton} className="icon-button nav-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
    </div>
    {open && <nav id="mobile-nav" className="nav-mobile" aria-label="Mobile navigation">
      {links.map(([name, url]) => <a href={url} key={url} onClick={() => setOpen(false)}>{name}<ArrowUpRight size={16} /></a>)}
      {session
        ? <>
          <Link to="/account?open=1" onClick={() => setOpen(false)}>Open Filey <ArrowUpRight size={16} /></Link>
          <Link to="/account" onClick={() => setOpen(false)}>Account <ArrowUpRight size={16} /></Link>
          <button type="button" onClick={() => { setOpen(false); void signOut() }}>Sign out ({session.email}) <ArrowUpRight size={16} /></button>
        </>
        : <>
          <Link to="/login" onClick={() => setOpen(false)}>Sign in <ArrowUpRight size={16} /></Link>
          <Link to="/signup" onClick={() => setOpen(false)}>Create account <ArrowUpRight size={16} /></Link>
        </>}
    </nav>}
  </header>
}
