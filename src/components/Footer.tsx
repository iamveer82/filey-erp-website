import { ArrowUpRight } from 'lucide-react'
import { REPO_URL, ISSUES_URL, RELEASES_URL, LICENSE_URL } from '@/lib/constants'

export default function Footer() {
  return <footer className="site-footer">
    <div className="site-container">
      <div className="footer-top"><a href="#top" className="wordmark"><img src="/filey-mark.png" alt="" width="44" height="44" />Filey ERP</a><p>A clearer way to run your business.</p></div>
      <div className="footer-links">
        <div><h3>Product</h3><a href="#features">Features</a><a href="#demo">Live demo</a><a href="#pricing">Pricing</a><a href="#download">Download</a></div>
        <div><h3>Resources</h3><a href={REPO_URL + '#readme'}>Documentation <ArrowUpRight size={13} /></a><a href={ISSUES_URL}>Help & feedback <ArrowUpRight size={13} /></a><a href={RELEASES_URL}>Release notes <ArrowUpRight size={13} /></a><a href="#faq">FAQ</a></div>
        <div><h3>Open source</h3><a href={REPO_URL}>GitHub <ArrowUpRight size={13} /></a><a href={LICENSE_URL}>AGPL-3.0 license <ArrowUpRight size={13} /></a><a href="#run-locally">Build from source</a></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Filey ERP. All rights reserved.</span><span>Built for the work you do.</span></div>
    </div>
  </footer>
}
