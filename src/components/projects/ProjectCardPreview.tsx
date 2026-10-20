import { useRef, useState } from 'react'
import { motion, useAnimationFrame, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import { Check, Plane, Sparkles, TrainFront } from 'lucide-react'

interface PreviewProps {
  slug: string
  hovered: boolean
}

/**
 * A 0→1 progress value that loops every `durationMs` while the preview is on screen.
 * Hovering speeds it up smoothly; reduced-motion users get a still frame at `restAt`.
 */
function useLoop(durationMs: number, hovered: boolean, restAt: number) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.4 })
  const reduced = useReducedMotion()
  const progress = useMotionValue(reduced ? restAt : 0)
  const speed = useRef(1)

  useAnimationFrame((_, delta) => {
    if (reduced || !inView) return
    speed.current += ((hovered ? 1.8 : 1) - speed.current) * 0.08
    progress.set((progress.get() + (delta / durationMs) * speed.current) % 1)
  })

  return { ref, progress }
}

function useStage(progress: MotionValue<number>, stages: number) {
  const [stage, setStage] = useState(() => Math.floor(progress.get() * stages))
  useMotionValueEvent(progress, 'change', (p) => {
    const next = Math.floor(p * stages)
    setStage((current) => (current === next ? current : next))
  })
  return stage
}

const MODELS = ['Gemini', 'Perplexity', 'ChatGPT']
const PLAN = ['Plan', 'Act', 'Done']

function MindPilotPreview({ hovered }: { hovered: boolean }) {
  const { ref, progress } = useLoop(6000, hovered, 0.99)
  const stage = useStage(progress, 7)

  return (
    <div ref={ref} className="h-24 grid grid-cols-[1fr_auto_1fr] items-center gap-2 font-mono text-[9px] text-violet-300" aria-hidden="true">
      <div className="flex flex-col items-end gap-1">
        <span className="text-[8px] tracking-widest text-violet-500/70">ASK</span>
        {MODELS.map((model, i) => {
          const lit = stage === i || stage >= 3
          return (
            <span key={model} className="flex items-center gap-1">
              <span className={`rounded border px-1.5 py-0.5 transition-colors duration-300 ${lit ? 'border-violet-400 bg-violet-500/20 text-violet-100' : 'border-violet-500/30'}`}>{model}</span>
              <span className={`w-3 border-t border-dashed transition-colors duration-300 ${lit ? 'border-violet-300' : 'border-violet-500/40'}`} />
            </span>
          )
        })}
      </div>
      <motion.span
        className="flex items-center justify-center w-11 h-11 rounded-full border border-violet-400/60 bg-violet-500/10"
        animate={{ scale: [1, 1.08, 1], boxShadow: ['0 0 0 0 rgba(139,92,246,0)', '0 0 18px 2px rgba(139,92,246,0.35)', '0 0 0 0 rgba(139,92,246,0)'] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Sparkles className="w-5 h-5 text-violet-300" />
      </motion.span>
      <div className="flex flex-col items-start gap-1">
        <span className="text-[8px] tracking-widest text-violet-500/70">AGENT</span>
        {PLAN.map((item, i) => {
          const done = stage >= 3 + i
          return (
            <span key={item} className="flex items-center gap-1">
              <span className={`w-3 border-t border-dashed transition-colors duration-300 ${done ? 'border-violet-300' : 'border-violet-500/40'}`} />
              <span className={`flex items-center gap-1 rounded border px-1.5 py-0.5 transition-colors duration-300 ${done ? 'border-violet-400 bg-violet-500/20 text-violet-100' : 'border-violet-500/30'}`}>
                <motion.span animate={{ scale: done ? 1 : 0.4, opacity: done ? 1 : 0.35 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}>
                  <Check className="w-2.5 h-2.5" />
                </motion.span>
                {item}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

const P0 = { x: 15, y: 65 }
const P1 = { x: 100, y: 0 }
const P2 = { x: 185, y: 65 }
const ARC = `M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`
const arcPoint = (t: number) => ({
  x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x,
  y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y,
})
const arcAngle = (t: number) => {
  const dx = 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x)
  const dy = 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y)
  return (Math.atan2(dy, dx) * 180) / Math.PI
}

function FlightPreview({ hovered }: { hovered: boolean }) {
  const { ref, progress } = useLoop(4500, hovered, 0.55)
  const t = useTransform(progress, (p) => Math.min(1, p / 0.85))
  const x = useTransform(t, (v) => arcPoint(v).x)
  const y = useTransform(t, (v) => arcPoint(v).y)
  const rotate = useTransform(t, arcAngle)
  const planeOpacity = useTransform(progress, [0, 0.05, 0.85, 1], [0, 1, 1, 0])

  return (
    <div ref={ref} className="h-24" aria-hidden="true">
      <svg viewBox="0 0 200 80" className="w-full h-full overflow-visible">
        <path d={ARC} fill="none" stroke="#22d3ee" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="4 5" />
        <motion.path d={ARC} fill="none" stroke="#22d3ee" strokeOpacity="0.9" strokeWidth="1.5" style={{ pathLength: t }} />
        <circle cx={P0.x} cy={P0.y} r="4" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" />
        <circle cx={P2.x} cy={P2.y} r="4" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" />
        <motion.g style={{ x, y, rotate, opacity: planeOpacity }}>
          <g transform="rotate(45)">
            <Plane x={-8} y={-8} width={16} height={16} color="#67e8f9" />
          </g>
        </motion.g>
      </svg>
    </div>
  )
}

const TRAIN_STOPS = [4, 22, 40, 58, 76, 94]

function TrainPreview({ hovered }: { hovered: boolean }) {
  const { ref, progress } = useLoop(6000, hovered, 0.6)
  const left = useTransform(progress, (p) => `${4 + Math.min(1, p / 0.9) * 90}%`)
  const fill = useTransform(progress, (p) => `${Math.min(1, p / 0.9) * 90}%`)
  const passed = useStage(useTransform(progress, (p) => Math.min(0.999, p / 0.9)), 100)

  return (
    <div ref={ref} className="h-24 relative" aria-hidden="true">
      <div className="absolute left-[4%] right-[6%] top-1/2 h-px bg-green-500/30" />
      <motion.div className="absolute left-[4%] top-1/2 h-px bg-green-400" style={{ width: fill }} />
      {TRAIN_STOPS.map((stop) => (
        <span
          key={stop}
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-colors duration-300 ${4 + (passed / 100) * 90 >= stop ? 'bg-green-400' : 'bg-green-500/30'}`}
          style={{ left: `${stop}%` }}
        />
      ))}
      <motion.div className="absolute top-1/2 -translate-x-1/2 -translate-y-[calc(100%+6px)]" style={{ left }}>
        <TrainFront className="w-7 h-7 text-green-300" />
      </motion.div>
    </div>
  )
}

export default function ProjectCardPreview({ slug, hovered }: PreviewProps) {
  if (slug === 'mindpilot') return <MindPilotPreview hovered={hovered} />
  if (slug === 'flight-alerts') return <FlightPreview hovered={hovered} />
  return <TrainPreview hovered={hovered} />
}
