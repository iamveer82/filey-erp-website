import { useEffect, useState } from 'react'
import { LATEST_RELEASE_URL, REPO_URL } from './constants'
import type { OS } from './constants'

const LATEST_RELEASE_API = 'https://api.github.com/repos/iamveer82/Filey-erp/releases/latest'

export interface Installer {
  url: string
  size: string
  /** Only true when the published release contains this installer. */
  available?: boolean
  architecture?: string
}

export interface LatestRelease {
  version: string
  releaseUrl: string
  windowsExe: Installer
  windowsMsi: Installer
  linuxDeb: Installer
  linuxRpm: Installer
  macDmg: Installer | null
  live: boolean
}

const unavailable: Installer = { url: LATEST_RELEASE_URL, size: '', available: false }
const FALLBACK: LatestRelease = {
  version: '', releaseUrl: LATEST_RELEASE_URL,
  windowsExe: unavailable, windowsMsi: unavailable,
  linuxDeb: unavailable, linuxRpm: unavailable, macDmg: null, live: false,
}

/** Never invent an installer filename or mix assets from different releases. */
export function parseLatestRelease(value: unknown): LatestRelease {
  if (!value || typeof value !== 'object' || !('assets' in value) || !Array.isArray(value.assets)) return FALLBACK
  const assets: unknown[] = value.assets
  const pick = (pattern: RegExp): Installer | null => {
    const asset = assets.find((item: unknown) => {
      if (!item || typeof item !== 'object') return false
      const row = item as Record<string, unknown>
      return typeof row.name === 'string' && pattern.test(row.name) &&
        typeof row.browser_download_url === 'string' &&
        row.browser_download_url.toLowerCase().startsWith(`${REPO_URL}/releases/download/`.toLowerCase())
    }) as Record<string, unknown> | undefined
    if (!asset) return null
    const name = String(asset.name)
    return {
      url: String(asset.browser_download_url), available: true,
      size: typeof asset.size === 'number' && Number.isFinite(asset.size) && asset.size > 0 ? `${(asset.size / 1048576).toFixed(1)} MB` : '',
      architecture: /aarch64|arm64/i.test(name) ? 'Apple Silicon' : /x64|x86_64|amd64/i.test(name) ? '64-bit' : undefined,
    }
  }
  const windowsExe = pick(/_x64-setup\.exe$/)
  const windowsMsi = pick(/_x64_en-US\.msi$/)
  const linuxDeb = pick(/_amd64\.deb$/)
  const linuxRpm = pick(/\.x86_64\.rpm$/)
  const macDmg = pick(/\.dmg$/)
  if (!windowsExe && !windowsMsi && !linuxDeb && !linuxRpm && !macDmg) return FALLBACK
  return {
    version: 'tag_name' in value && typeof value.tag_name === 'string' ? value.tag_name.replace(/^v/, '') : '',
    releaseUrl: LATEST_RELEASE_URL,
    windowsExe: windowsExe ?? unavailable, windowsMsi: windowsMsi ?? unavailable,
    linuxDeb: linuxDeb ?? unavailable, linuxRpm: linuxRpm ?? unavailable, macDmg, live: true,
  }
}

export function installerForOS(release: LatestRelease, os: OS): string {
  if (os === 'windows') return release.windowsExe.available ? release.windowsExe.url : release.windowsMsi.available ? release.windowsMsi.url : release.releaseUrl
  if (os === 'linux') return release.linuxDeb.available ? release.linuxDeb.url : release.linuxRpm.available ? release.linuxRpm.url : release.releaseUrl
  return release.macDmg?.url ?? release.releaseUrl
}

// One request shared by the hero, downloads and sign-up screens in this page.
let latest: Promise<LatestRelease> | undefined
export function useLatestRelease(): LatestRelease {
  const [release, setRelease] = useState<LatestRelease>(FALLBACK)
  useEffect(() => {
    let active = true
    latest ??= fetch(LATEST_RELEASE_API, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(10000),
    }).then(response => {
      if (!response.ok) throw new Error('Release details unavailable')
      return response.json()
    }).then(parseLatestRelease).catch(() => FALLBACK)
    void latest.then(value => { if (active) setRelease(value) })
    return () => { active = false }
  }, [])
  return release
}
