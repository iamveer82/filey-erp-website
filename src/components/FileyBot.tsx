import { useEffect, useRef, useState } from 'react'

/* FileyBot — a lightweight animated bot face for the website.
   Captures the desktop BloubBot's essence: a morphing amber blob with eyes
   that track the cursor and occasionally wink. Self-contained, no deps. */

export default function FileyBot({ size = 120 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null)
  const [gaze, setGaze] = useState({ x: 0, y: 0 })
  const [winking, setWinking] = useState(false)
  const [blink, setBlink] = useState(false)

  // Eyes follow the cursor within ~8px of centre
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const max = 8
      const angle = Math.atan2(dy, dx)
      setGaze({
        x: dist < 40 ? (dx / 40) * max : Math.cos(angle) * max,
        y: dist < 40 ? (dy / 40) * max : Math.sin(angle) * max,
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // Blink every 3–5 s
  useEffect(() => {
    const blink = () => {
      setBlink(true)
      setTimeout(() => setBlink(false), 150)
      setTimeout(blink, 3000 + Math.random() * 2000)
    }
    const t = setTimeout(blink, 2000)
    return () => clearTimeout(t)
  }, [])

  // Wink every 8–14 s
  useEffect(() => {
    const wink = () => {
      setWinking(true)
      setTimeout(() => setWinking(false), 600)
      setTimeout(wink, 8000 + Math.random() * 6000)
    }
    const t = setTimeout(wink, 6000)
    return () => clearTimeout(t)
  }, [])

  const eyeH = blink ? 2 : winking ? 2 : 14
  const leftEyeH = winking ? 2 : eyeH

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="drop-shadow-[0_4px_12px_rgba(245,158,11,0.25)]"
      aria-hidden
    >
      {/* blob body — organic breathing via CSS animation on the path */}
      <path
        d="M50 8 C72 8, 92 24, 92 50 C92 76, 72 92, 50 92 C28 92, 8 76, 8 50 C8 24, 28 8, 50 8 Z"
        fill="#F59E0B"
      >
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.03;0.99;1;1.02;1"
          dur="4s"
          repeatCount="indefinite"
          additive="sum"
        />
      </path>

      {/* subtle highlight */}
      <ellipse cx="38" cy="30" rx="18" ry="12" fill="rgba(255,255,255,0.15)" />

      {/* eyes — track cursor, blink, wink */}
      <g style={{ transform: `translate(${gaze.x}px, ${gaze.y}px)` }}>
        {/* left eye */}
        {winking ? (
          <rect x={30} y={44} width={14} height={3} rx={1.5} fill="#1A1206" />
        ) : (
          <ellipse cx={37} cy={48} rx={7} ry={leftEyeH / 2} fill="#1A1206">
            <animate attributeName="ry" values="7;7;0.8;7;7" dur="4s" repeatCount="indefinite" keyTimes="0;0.9;0.93;0.96;1" />
          </ellipse>
        )}
        {/* right eye */}
        <ellipse cx={63} cy={48} rx={7} ry={eyeH / 2} fill="#1A1206">
          <animate attributeName="ry" values="7;7;0.8;7;7" dur="4s" repeatCount="indefinite" keyTimes="0;0.9;0.93;0.96;1" />
        </ellipse>
      </g>

      {/* subtle mouth — a gentle curve */}
      <path
        d="M42 66 Q50 72, 58 66"
        stroke="#1A1206"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity={winking ? 0.7 : 0.4}
      />
    </svg>
  )
}
