import {
  BufferGeometry, CanvasTexture, Group, Material, Mesh, MeshBasicMaterial,
  PerspectiveCamera, PlaneGeometry, Scene, SRGBColorSpace, Texture, WebGLRenderer,
  DoubleSide,
} from 'three'
import { heroSceneMotion, type HeroSceneMode, type PaperPose } from './heroSceneMotion'

type Feature = { title: string; description: string; items: string[] }
export type HeroScene = { update: (progress: number) => void; dispose: () => void }

/** Draw the same accessible feature copy as a crisp, locally generated paper texture. */
function paperCanvas(feature: Feature, logo: HTMLImageElement, font: string, width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * 2)
  canvas.height = Math.round(height * 2)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas text rendering is unavailable')
  ctx.scale(2, 2)
  ctx.fillStyle = '#fffef9'
  ctx.strokeStyle = '#e5e1d7'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(0.5, 0.5, width - 1, height - 1, 13)
  ctx.fill()
  ctx.stroke()
  ctx.drawImage(logo, 88, 88, 338, 338, 22, 22, 25, 25)
  ctx.font = `500 12px ${font}`
  ctx.fillStyle = '#6b6861'
  ctx.fillText('Filey', 54, 39)

  const paragraph = (text: string, y: number, lineHeight: number) => {
    let line = ''
    for (const word of text.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word
      if (line && ctx.measureText(next).width > width - 44) {
        ctx.fillText(line, 22, y)
        y += lineHeight
        line = word
      } else line = next
    }
    if (line) ctx.fillText(line, 22, y)
    return y + lineHeight
  }
  ctx.fillStyle = '#29292c'
  ctx.font = `600 23px ${font}`
  let y = paragraph(feature.title, 81, 27)
  ctx.fillStyle = '#6b6861'
  ctx.font = `400 13px ${font}`
  y = paragraph(feature.description, y + 12, 20)
  ctx.strokeStyle = '#e5e1d7'
  ctx.beginPath()
  ctx.moveTo(22, y + 10)
  ctx.lineTo(width - 22, y + 10)
  ctx.stroke()
  ctx.fillStyle = '#29292c'
  ctx.font = `500 13px ${font}`
  feature.items.forEach((item, index) => ctx.fillText(item, 22, y + 36 + index * 25))
  return canvas
}

export function createHeroScene(
  host: HTMLElement,
  logoImage: HTMLImageElement,
  features: Feature[],
  mode: HeroSceneMode,
  initialProgress: number,
  onFailure: () => void,
): HeroScene {
  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.dataset.renderer = 'threejs'
  const geometries: BufferGeometry[] = []
  const materials: Material[] = []
  const textures: Texture[] = []
  let renderer: WebGLRenderer | undefined
  let resizeObserver: ResizeObserver | undefined
  let visibilityObserver: IntersectionObserver | undefined
  let frame = 0
  let disposed = false
  let visible = true
  let progress = initialProgress
  let width = host.clientWidth
  let height = host.clientHeight

  const dispose = () => {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    resizeObserver?.disconnect()
    visibilityObserver?.disconnect()
    canvas.removeEventListener('webglcontextlost', lostContext)
    document.removeEventListener('visibilitychange', requestRender)
    geometries.forEach((geometry) => geometry.dispose())
    materials.forEach((material) => material.dispose())
    textures.forEach((texture) => texture.dispose())
    renderer?.dispose()
    renderer?.forceContextLoss()
    canvas.remove()
  }
  const lostContext = (event: Event) => { event.preventDefault(); onFailure(); dispose() }
  let draw = () => {}
  function requestRender() {
    if (disposed || frame || !visible || document.hidden) return
    frame = requestAnimationFrame(() => { frame = 0; draw() })
  }

  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = SRGBColorSpace
    const scene = new Scene()
    const camera = new PerspectiveCamera(36, 1, 1, 5000)
    const font = getComputedStyle(host).fontFamily
    const texture = (source: HTMLCanvasElement) => {
      const result = new CanvasTexture(source)
      result.colorSpace = SRGBColorSpace
      result.anisotropy = Math.min(4, renderer!.capabilities.getMaxAnisotropy())
      textures.push(result)
      return result
    }
    const plane = (map: Texture, segmented = false) => {
      const geometry = new PlaneGeometry(1, 1, segmented ? 10 : 1, segmented ? 16 : 1)
      const material = new MeshBasicMaterial({ map, transparent: true, alphaTest: 0.02, side: DoubleSide })
      geometries.push(geometry)
      materials.push(material)
      return new Mesh(geometry, material)
    }
    const logoCanvas = document.createElement('canvas')
    logoCanvas.width = 512
    logoCanvas.height = 512
    const logoContext = logoCanvas.getContext('2d')
    if (!logoContext) throw new Error('Canvas image rendering is unavailable')
    logoContext.drawImage(logoImage, 88, 88, 338, 338, 0, 0, 512, 512)
    const logo = plane(texture(logoCanvas))
    scene.add(logo)

    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = 512
    shadowCanvas.height = 700
    const shadowContext = shadowCanvas.getContext('2d')
    if (!shadowContext) throw new Error('Canvas shading is unavailable')
    shadowContext.shadowColor = 'rgba(35, 28, 18, 0.22)'
    shadowContext.shadowBlur = 25
    shadowContext.shadowOffsetY = 10
    shadowContext.fillStyle = 'rgba(35, 28, 18, 0.14)'
    shadowContext.beginPath()
    shadowContext.roundRect(30, 30, 452, 630, 24)
    shadowContext.fill()
    const shadowTexture = texture(shadowCanvas)
    const initialPose = heroSceneMotion(width, height, mode, initialProgress)
    let paperSize = `${initialPose.paperWidth}:${initialPose.paperHeight}`
    const papers = features.map((feature) => {
      const group = new Group()
      const shadow = plane(shadowTexture)
      shadow.scale.set(1.12, 1.12, 1)
      shadow.position.set(0.014, -0.025, -3)
      shadow.material.depthWrite = false
      shadow.material.alphaTest = 0
      shadow.material.opacity = 0.45
      const face = plane(texture(paperCanvas(feature, logoImage, font, initialPose.paperWidth, initialPose.paperHeight)), true)
      group.add(shadow, face)
      scene.add(group)
      return { group, face }
    })

    const place = (object: Group | Mesh, pose: PaperPose, w: number, h: number) => {
      // Positions and type stay pixel-sized at rest, while pitch/bend retain real perspective.
      const perspective = (camera.position.z - pose.z) / camera.position.z
      object.position.set(pose.x * perspective, (height / 2 - pose.y) * perspective, pose.z)
      object.scale.set(w * pose.scale * perspective, h * pose.scale * perspective, 1)
      object.rotation.set(pose.rx, pose.ry, pose.rz)
      object.visible = pose.visible
    }
    draw = () => {
      if (disposed || !renderer) return
      try {
        const pose = heroSceneMotion(width, height, mode, progress)
        place(logo, pose.logo, pose.logoSize * 1.06, pose.logoSize * 1.06)
        papers.forEach(({ group, face }, index) => {
          const paper = pose.papers[index]
          place(group, paper, pose.paperWidth, pose.paperHeight)
          const points = face.geometry.attributes.position
          for (let vertex = 0; vertex < points.count; vertex++)
            points.setZ(vertex, Math.sin((points.getY(vertex) + 0.5) * Math.PI) * paper.bend)
          points.needsUpdate = true
        })
        renderer.render(scene, camera)
      } catch { onFailure(); dispose() }
    }
    const resize = () => {
      if (disposed || !renderer) return
      width = host.clientWidth
      height = host.clientHeight
      if (!width || !height) return
      const pose = heroSceneMotion(width, height, mode, progress)
      const nextSize = `${pose.paperWidth}:${pose.paperHeight}`
      if (nextSize !== paperSize) {
        papers.forEach(({ face }, index) => {
          const map = face.material.map!
          // Resizing the source requires a fresh GPU upload, with no old texture retained.
          map.dispose()
          map.image = paperCanvas(features[index], logoImage, font, pose.paperWidth, pose.paperHeight)
          map.needsUpdate = true
        })
        paperSize = nextSize
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mode === 'compact' ? 1.5 : 1.75))
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.position.z = height / (2 * Math.tan(18 * Math.PI / 180))
      camera.updateProjectionMatrix()
      requestRender()
    }
    canvas.addEventListener('webglcontextlost', lostContext)
    document.addEventListener('visibilitychange', requestRender)
    host.append(canvas)
    resize()
    cancelAnimationFrame(frame)
    frame = 0
    draw()
    if (disposed) throw new Error('The 3D scene could not render')
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (!visible) { cancelAnimationFrame(frame); frame = 0 }
      else requestRender()
    })
    visibilityObserver.observe(host)
    return { update(value) { progress = value; requestRender() }, dispose }
  } catch (error) {
    dispose()
    throw error
  }
}
