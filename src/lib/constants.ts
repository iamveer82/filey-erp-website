export const REPO_URL = 'https://github.com/iamveer82/Filey-erp'
export const RELEASES_URL = `${REPO_URL}/releases`
export const ISSUES_URL = `${REPO_URL}/issues`
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`
export const CONTRIBUTING_URL = `${REPO_URL}/blob/main/CONTRIBUTING.md`
export const ROADMAP_URL = `${REPO_URL}/blob/main/ROADMAP.md`

export const LATEST_RELEASE_URL = `${RELEASES_URL}/latest`

export type OS = 'windows' | 'macos' | 'linux'

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
