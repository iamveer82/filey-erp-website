export const REPO_URL = 'https://github.com/iamveer82/Filey-erp'
export const RELEASES_URL = `${REPO_URL}/releases`
export const ISSUES_URL = `${REPO_URL}/issues`
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`
export const CONTRIBUTING_URL = `${REPO_URL}/blob/main/CONTRIBUTING.md`
export const ROADMAP_URL = `${REPO_URL}/blob/main/ROADMAP.md`

export const APP_VERSION = '2.3.9'
export const RELEASE_TAG = `v${APP_VERSION}`
export const RELEASE_CODENAME = 'Latest'

const DL = `${RELEASES_URL}/download/${RELEASE_TAG}`
export const DOWNLOAD_URLS = {
  windowsExe: `${DL}/Filey.ERP_2.3.9_x64-setup.exe`,
  windowsMsi: `${DL}/Filey.ERP_2.3.9_x64_en-US.msi`,
  linuxAppImage: `${DL}/Filey.ERP_2.3.9_amd64.AppImage`,
  linuxDeb: `${DL}/Filey.ERP_2.3.9_amd64.deb`,
  linuxRpm: `${DL}/Filey.ERP-2.3.9-1.x86_64.rpm`,
} as const

export type OS = 'windows' | 'macos' | 'linux'

/** Recommended download target per OS: direct installer on Win/Linux, releases page on macOS. */
export function downloadUrlForOS(os: OS): string {
  switch (os) {
    case 'windows':
      return DOWNLOAD_URLS.windowsExe
    case 'linux':
      return DOWNLOAD_URLS.linuxAppImage
    case 'macos':
      return RELEASES_URL
  }
}

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
