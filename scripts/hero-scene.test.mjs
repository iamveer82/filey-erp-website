import assert from 'node:assert/strict'
import { test } from 'node:test'
import { heroSceneMotion } from '../src/sections/heroSceneMotion.ts'

test('3D reveal starts behind the folder and settles into readable desktop and mobile bounds', () => {
  const desktop = heroSceneMotion(1270, 648, 'desktop', 1)
  assert.equal(desktop.papers.length, 5)
  for (const paper of desktop.papers) {
    assert.equal(paper.visible, true)
    const halfWidth = (desktop.paperWidth * Math.cos(paper.rz) + desktop.paperHeight * Math.abs(Math.sin(paper.rz))) / 2
    const halfHeight = (desktop.paperHeight * Math.cos(paper.rz) + desktop.paperWidth * Math.abs(Math.sin(paper.rz))) / 2
    assert.ok(635 + paper.x - halfWidth >= 16)
    assert.ok(635 + paper.x + halfWidth <= 1254)
    assert.ok(paper.y - halfHeight >= 16)
    assert.ok(paper.y + halfHeight <= 632)
    assert.ok(Math.abs(paper.bend) < 1e-9)
  }
  for (const [width, height] of [[638, 536], [390, 780], [320, 496]]) {
    const initial = heroSceneMotion(width, height, 'compact', 0)
    assert.ok(initial.papers.every(paper => !paper.visible && paper.z < initial.logo.z))
    assert.ok(initial.logo.y + initial.logoSize / 2 < height)
    for (let index = 0; index < 5; index++) {
      const frame = heroSceneMotion(width, height, 'compact', (0.65 + index * 0.9) / 4.75)
      const paper = frame.papers[index]
      assert.ok(paper.visible)
      assert.ok(paper.y - frame.paperHeight / 2 >= 20)
      assert.ok(paper.y + frame.paperHeight / 2 <= height - 20)
      assert.ok(frame.paperWidth + 10 < width)
      assert.ok(paper.scale >= 0.99)
      assert.ok(Math.abs(paper.ry) < 0.001, 'Text faces the reader at each pause')
    }
    const final = heroSceneMotion(width, height, 'compact', 1)
    assert.ok(final.logo.y + final.logoSize * final.logo.scale / 2 < height)
  }
  assert.ok(heroSceneMotion(1270, 648, 'desktop', 0.65).papers.some(paper => Math.abs(paper.ry) > 0.1 && paper.bend > 4))
})
