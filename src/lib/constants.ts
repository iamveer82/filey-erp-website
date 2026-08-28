export const REPO_URL = 'https://github.com/iamveer82/Filey-erp'
export const RELEASES_URL = `${REPO_URL}/releases`
export const ISSUES_URL = `${REPO_URL}/issues`
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`
export const CONTRIBUTING_URL = `${REPO_URL}/blob/main/CONTRIBUTING.md`
export const ROADMAP_URL = `${REPO_URL}/blob/main/ROADMAP.md`

// ponytail: bumped by hand each release, which is why the links sat on 2.3.10
// for five releases — and then on 2.3.19 for another five, through the release
// that fixed a crash on every new sign-in. It has now drifted twice, so the
// condition this comment set has been met: derive it from
// releases/latest/download/latest.json (the updater manifest, already public
// and always current) instead of trusting anyone to remember this line.
export const APP_VERSION = '2.10.0'
export const RELEASE_TAG = `v${APP_VERSION}`
export const RELEASE_CODENAME = 'Latest'

// GitHub replaces spaces in an asset's filename with dots on upload, which is
// why these read "Filey.ERP" while the bundler emits "Filey ERP".
const DL = `${RELEASES_URL}/download/${RELEASE_TAG}`
export const DOWNLOAD_URLS = {
  windowsExe: `${DL}/Filey.ERP_${APP_VERSION}_x64-setup.exe`,
  windowsMsi: `${DL}/Filey.ERP_${APP_VERSION}_x64_en-US.msi`,
  // No AppImage. It is the one Linux format that has never built — linuxdeploy
  // fails in CI and the release carries deb and rpm only. A linuxAppImage entry
  // lived here pointing at a file that never existed once, 404ing for every
  // Linux visitor; don't re-add one without checking the release first.
  linuxDeb: `${DL}/Filey.ERP_${APP_VERSION}_amd64.deb`,
  linuxRpm: `${DL}/Filey.ERP-${APP_VERSION}-1.x86_64.rpm`,
} as const

export type OS = 'windows' | 'macos' | 'linux'

/* downloadUrlForOS lived here and returned a link built from the pinned
 * APP_VERSION above. That is the mechanism that drifted, so it is gone rather
 * than fixed — use installerForOS() from useLatestRelease, which reads the
 * actual published release. The constants below it are the offline fallback
 * for that hook, not something to link to directly. */

export function osLabel(os: OS): string {
  switch (os) {
    case 'windows':
      return 'Windows'
    case 'macos':
      return 'macOS'
    case 'linux':
      return 'Linux'
  }
}
