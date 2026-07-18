import type { OS } from './constants'

/** Detect the visitor's OS from the user agent. Windows is the default. */
export function detectOS(): OS {
  if (typeof navigator === 'undefined') return 'windows'
  const ua = navigator.userAgent
  if (/windows|win32|win64|wow64/i.test(ua)) return 'windows'
  if (/macintosh|mac os x|darwin/i.test(ua)) return 'macos'
  if (/linux|ubuntu|debian|fedora/i.test(ua)) return 'linux'
  return 'windows'
}
