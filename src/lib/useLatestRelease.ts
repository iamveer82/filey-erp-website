import { useEffect, useState } from 'react'
import { APP_VERSION, DOWNLOAD_URLS, REPO_URL } from './constants'
import type { OS } from './constants'

/* Download links used to be hand-written constants carrying a hand-bumped
 * version. They drifted three times — stuck on 2.3.10 for five releases, on
 * 2.3.19 for five more, and pointing at Linux files that had never been built
 * at all, 404ing for every Linux visitor with a confident file size beside it.
 *
 * The releases API is the only thing that is always right, so ask it. It sends
 * Access-Control-Allow-Origin: *, and returns the tag, the real asset names and
 * their real byte sizes — which is version drift, wrong sizes and dead links in
 * one call. Anything it doesn't answer for falls back to the baked constants,
 * so the page is never worse than it was before.
 *
 * Unauthenticated GitHub allows 60 requests/hour per IP. That is per visitor,
 * not per site, so it only bites behind a large shared NAT — and the fallback
 * covers that. */

const LATEST_RELEASE_API = 'https://api.github.com/repos/iamveer82/Filey-erp/releases/latest'

/** One downloadable installer, as the page needs to render it. */
export interface Installer {
  url: string
  /** Human size, e.g. "61.2 MB". Empty when unknown — render nothing, not a guess. */
  size: string
}

export interface LatestRelease {
  version: string
  releaseUrl: string
  windowsExe: Installer
  windowsMsi: Installer
  linuxDeb: Installer
  linuxRpm: Installer
  /** macOS ships only once a .dmg is actually in the release; null until then. */
  macDmg: Installer | null
  /** True once live data replaced the baked fallback. */
  live: boolean
}

interface ApiAsset {
  name: string
  size: number
  browser_download_url: string
}

function mb(bytes: number): string {
  return `${(bytes / 1048576).toFixed(1)} MB`
}

/** The baked constants, shaped like a release. Sizes are omitted rather than
 *  hardcoded — a stale number is worse than no number. */
const FALLBACK: LatestRelease = {
  version: APP_VERSION,
  releaseUrl: `${REPO_URL}/releases/latest`,
  windowsExe: { url: DOWNLOAD_URLS.windowsExe, size: '' },
  windowsMsi: { url: DOWNLOAD_URLS.windowsMsi, size: '' },
  linuxDeb: { url: DOWNLOAD_URLS.linuxDeb, size: '' },
  linuxRpm: { url: DOWNLOAD_URLS.linuxRpm, size: '' },
  macDmg: null,
  live: false,
}

/** Find the first asset whose name matches, ignoring updater signatures. */
function pick(assets: ApiAsset[], re: RegExp): Installer | null {
  const hit = assets.find((a) => !a.name.endsWith('.sig') && re.test(a.name))
  return hit ? { url: hit.browser_download_url, size: mb(hit.size) } : null
}

/** The one download to offer a visitor on this OS. macOS falls back to the
 *  releases page while no .dmg is published, so the button is never a 404. */
export function installerForOS(release: LatestRelease, os: OS): string {
  switch (os) {
    case 'windows':
      return release.windowsExe.url
    case 'linux':
      return release.linuxDeb.url
    case 'macos':
      return release.macDmg?.url ?? release.releaseUrl
  }
}

export function useLatestRelease(): LatestRelease {
  const [release, setRelease] = useState<LatestRelease>(FALLBACK)

  useEffect(() => {
    const ac = new AbortController()

    fetch(LATEST_RELEASE_API, {
      signal: ac.signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { tag_name?: string; html_url?: string; assets?: ApiAsset[] }) => {
        const assets = data.assets ?? []
        const exe = pick(assets, /_x64-setup\.exe$/)
        const msi = pick(assets, /_x64_en-US\.msi$/)
        const deb = pick(assets, /_amd64\.deb$/)
        const rpm = pick(assets, /\.x86_64\.rpm$/)

        // A release with no Windows installer means something is wrong with the
        // response, not with Windows. Keep the fallback rather than blank the page.
        if (!exe || !msi) return

        setRelease({
          version: (data.tag_name ?? `v${APP_VERSION}`).replace(/^v/, ''),
          releaseUrl: data.html_url ?? FALLBACK.releaseUrl,
          windowsExe: exe,
          windowsMsi: msi,
          linuxDeb: deb ?? FALLBACK.linuxDeb,
          linuxRpm: rpm ?? FALLBACK.linuxRpm,
          // Only advertise macOS when a .dmg is genuinely published.
          macDmg: pick(assets, /\.dmg$/),
          live: true,
        })
      })
      .catch(() => {
        /* offline, rate-limited, or blocked — the baked fallback already renders */
      })

    return () => ac.abort()
  }, [])

  return release
}
