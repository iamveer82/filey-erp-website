import { Apple, ArrowUpRight, Download as DownloadIcon, Monitor, Terminal } from 'lucide-react'
import { LATEST_RELEASE_URL } from '@/lib/constants'
import { useLatestRelease, type Installer } from '@/lib/useLatestRelease'
import './Download.css'

function InstallerLink({ installer, label }: { installer: Installer | null; label: string }) {
  if (!installer?.available) return null
  return <a className="site-button secondary" href={installer.url}>
    <DownloadIcon size={15} aria-hidden="true" /> {label}
    {installer.size && <span className="download-size">{installer.size}</span>}
  </a>
}

export default function Download() {
  const release = useLatestRelease()
  const windows = release.windowsExe.available || release.windowsMsi.available
  const linux = release.linuxDeb.available || release.linuxRpm.available
  const mac = release.macDmg?.available

  return <section id="download" className="site-section download-section" aria-labelledby="download-title">
    <div className="site-container download-layout">
      <div className="download-intro">
        <p className="download-eyebrow">At home on your desktop</p>
        <h2 id="download-title">Make room for better work.</h2>
        <p className="download-lead">Download Filey for your desktop. Your workspace goes with you.</p>
        <div className="download-wordmark" aria-hidden="true"><img src="/filey-mark.png" alt="" /><span>filey</span></div>
        <a href={LATEST_RELEASE_URL} className="site-button text" target="_blank" rel="noopener noreferrer">
          {release.live && release.version ? `Latest release · ${release.version}` : 'Browse latest release'} <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>

      <div className="download-platforms">
        <div className="download-platform">
          <Monitor size={24} strokeWidth={1.5} aria-hidden="true" />
          <div><h3>Windows</h3><p>{windows ? '64-bit desktop' : 'Check the latest release for availability.'}</p>
            <div className="download-actions"><InstallerLink installer={release.windowsExe} label="Download .exe" /><InstallerLink installer={release.windowsMsi} label=".msi" /></div>
          </div>
        </div>
        <div className="download-platform">
          <Apple size={24} strokeWidth={1.5} aria-hidden="true" />
          <div><h3>macOS</h3><p>{mac ? release.macDmg?.architecture || 'Desktop installer' : 'Check the latest release for availability.'}</p>
            <div className="download-actions"><InstallerLink installer={release.macDmg} label="Download .dmg" /></div>
            {mac && <p className="download-platform-note">See release notes for macOS installation requirements.</p>}
          </div>
        </div>
        <div className="download-platform">
          <Terminal size={24} strokeWidth={1.5} aria-hidden="true" />
          <div><h3>Linux</h3><p>{linux ? '64-bit · Debian / Ubuntu and Fedora / RHEL' : 'Check the latest release for availability.'}</p>
            <div className="download-actions"><InstallerLink installer={release.linuxDeb} label="Download .deb" /><InstallerLink installer={release.linuxRpm} label=".rpm" /></div>
          </div>
        </div>
        <p className="download-release-note">These installers are the current public release. The redesigned CRM, free local edition and new reporting experience are being prepared for the next app update.</p>
        {!release.live && <p className="download-release-note">Installer details are unavailable right now. <a href={LATEST_RELEASE_URL}>Browse GitHub releases</a> to choose a download.</p>}
      </div>
    </div>
  </section>
}
