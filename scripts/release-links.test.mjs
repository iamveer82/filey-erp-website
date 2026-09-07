import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

// Use the already-installed TypeScript compiler; no browser or test dependency.
const repo = 'https://github.com/iamveer82/Filey-erp'
const releases = `${repo}/releases/latest`
const exports = {}
runInNewContext(ts.transpileModule(readFileSync(new URL('../src/lib/useLatestRelease.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, {
  exports,
  require: name => name === 'react' ? {} : { REPO_URL: repo, LATEST_RELEASE_URL: releases },
})
const { parseLatestRelease, installerForOS } = exports
const asset = name => ({ name, size: 1048576, browser_download_url: `${repo}/releases/download/v2.10.2/${name}` })

test('uses actual published assets and sizes, including Apple Silicon', () => {
  const release = parseLatestRelease({ tag_name: 'v2.10.2', assets: [
    asset('Filey.ERP_2.10.2_x64-setup.exe'), asset('Filey.ERP_2.10.2_x64_en-US.msi'),
    asset('Filey.ERP_2.10.2_amd64.deb'), asset('Filey.ERP-2.10.2-1.x86_64.rpm'), asset('Filey.ERP_2.10.2_aarch64.dmg'),
  ] })
  assert.equal(release.version, '2.10.2')
  assert.equal(release.live, true)
  assert.equal(release.windowsExe.size, '1.0 MB')
  assert.equal(release.macDmg.architecture, 'Apple Silicon')
  assert.equal(installerForOS(release, 'windows'), release.windowsExe.url)
  assert.equal(installerForOS(release, 'linux'), release.linuxDeb.url)
  assert.equal(installerForOS(release, 'macos'), release.macDmg.url)
})

test('does not require Windows assets or invent absent platform packages', () => {
  const release = parseLatestRelease({ tag_name: 'v2.10.2', assets: [asset('Filey.ERP-2.10.2-1.x86_64.rpm')] })
  assert.equal(release.live, true)
  assert.equal(release.linuxDeb.available, false)
  assert.equal(release.windowsExe.url, releases)
  assert.equal(release.macDmg, null)
  assert.equal(installerForOS(release, 'linux'), release.linuxRpm.url)
  assert.equal(installerForOS(release, 'windows'), releases)
})

test('falls back to the releases page without stale versions or sizes', () => {
  for (const input of [null, {}, { assets: [] }, { assets: 'invalid' }]) {
    const release = parseLatestRelease(input)
    assert.equal(release.live, false)
    assert.equal(release.version, '')
    for (const os of ['windows', 'macos', 'linux']) assert.equal(installerForOS(release, os), releases)
    assert.equal(release.windowsExe.size, '')
  }
})

test('ignores signatures, malformed assets and links outside the release repository', () => {
  const release = parseLatestRelease({ assets: [null, asset('Filey.ERP_2.10.2_x64-setup.exe.sig'),
    { ...asset('Filey.ERP_2.10.2_x64-setup.exe'), browser_download_url: 'https://other.example/app.exe' },
  ] })
  assert.equal(release.live, false)
  assert.equal(installerForOS(release, 'windows'), releases)
})
