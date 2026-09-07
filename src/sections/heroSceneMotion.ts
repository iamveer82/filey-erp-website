export type HeroSceneMode = 'desktop' | 'compact'
export type PaperPose = { x: number; y: number; z: number; scale: number; rx: number; ry: number; rz: number; bend: number; visible: boolean }

const phase = (time: number, start: number, duration: number) => {
  const value = Math.max(0, Math.min(1, (time - start) / duration))
  return value * value * (3 - 2 * value)
}
const mix = (from: number, to: number, value: number) => from + (to - from) * value

/** Screen-space destinations with real depth and pitch during the reveal.
 * Perspective compensation in the renderer keeps the final text size stable. */
export function heroSceneMotion(width: number, height: number, mode: HeroSceneMode, progress: number) {
  const compact = mode === 'compact'
  const short = compact && height + (width <= 800 ? 64 : 72) < 680
  const time = Math.max(0, Math.min(1, progress)) * (compact ? 4.75 : 0.998)
  const anchor = height * (compact ? (short ? 0.75 : 0.72) : 0.73)
  const logoProgress = phase(time, compact ? 0.12 : 0.08, compact ? 0.7 : 0.8)
  const logoSize = compact ? (short ? 176 : width <= 639 ? 208 : 240) : 260
  const logo: PaperPose = {
    x: 0, y: anchor + logoProgress * Math.min(compact ? 74 : 48, height * (compact ? 0.1 : 0.055)),
    z: 170, scale: mix(1, compact ? 0.64 : 0.78, logoProgress),
    rx: Math.sin(logoProgress * Math.PI) * 0.045,
    ry: Math.sin(logoProgress * Math.PI) * -0.055,
    rz: 0, bend: 0, visible: true,
  }
  const spread = Math.min((width - 380) / 2, 470)
  const lift = height * (compact ? 0.37 : Math.min(0.39, 310 / height))
  const finalX = [-1, -0.52, 0, 0.52, 1]
  const finalY = [-0.19, -0.85, -1, -0.85, -0.19]
  const finalRotation = [11, 6, 0, -6, -11]
  const papers: PaperPose[] = Array.from({ length: 5 }, (_, index) => {
    if (compact) {
      const start = 0.2 + index * 0.9
      const rise = phase(time, start, 0.45)
      const stack = index < 4 ? phase(time, start + 0.9, 0.35) : 0
      const settle = index === 4 ? phase(time, 4.25, 0.5) : 0
      return {
        x: (index % 2 ? 3 : -3) * rise * (1 - settle),
        y: mix(anchor + 18, anchor - lift, rise) - 12 * stack,
        z: mix(-120, 75 + index * 8, rise) - 55 * stack,
        scale: mix(0.38, 1, rise) - 0.06 * stack,
        rx: Math.sin(rise * Math.PI) * 0.28,
        ry: (index % 2 ? -1 : 1) * (1 - rise) * 0.6,
        rz: (index % 2 ? -1 : 1) * 0.021 * rise * (1 - settle),
        bend: Math.sin(rise * Math.PI) * 13,
        visible: time >= start,
      }
    }
    const peek = phase(time, 0.08 + index * 0.015, 0.19)
    const fan = phase(time, 0.31 + index * 0.022, 0.6)
    return {
      x: mix((index - 2) * 6, spread * finalX[index], fan),
      y: mix(mix(anchor + 18, anchor - 115, peek), anchor + lift * finalY[index], fan),
      z: mix(-120, 22 + (2 - Math.abs(index - 2)) * 14, fan),
      scale: mix(mix(0.4, 0.56, peek), 1, fan),
      rx: mix(-0.4, 0, fan),
      ry: (index - 2) * 0.16 * Math.sin(fan * Math.PI),
      rz: finalRotation[index] * Math.PI / 180 * fan,
      bend: Math.sin(fan * Math.PI) * 18,
      visible: time > 0.08 + index * 0.015,
    }
  })
  return { logo, papers, logoSize, paperWidth: compact ? Math.min(360, width - 48) : 250, paperHeight: short ? 320 : 350 }
}
