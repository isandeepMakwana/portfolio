import { useEffect, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from 'framer-motion'
import { BellRing, Code2, Database, MapPin, Plane, Send, Smartphone, Webhook, Zap } from 'lucide-react'
import PhoneFrame from './PhoneFrame'

const P0 = { x: 60, y: 250 }
const P1 = { x: 500, y: -30 }
const P2 = { x: 940, y: 250 }
const ARC_PATH = `M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`

const pointAt = (t: number) => ({
  x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x,
  y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y,
})

const angleAt = (t: number) => {
  const dx = 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x)
  const dy = 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y)
  return (Math.atan2(dy, dx) * 180) / Math.PI
}

const CHECKPOINTS = [
  { t: 0.12, label: 'Subscribe (App · SMS · Email)', icon: Smartphone, built: 'Built the first version: subscribe, flight-detail and provider-callback APIs in FastAPI.' },
  { t: 0.38, label: 'Provider webhook', icon: Webhook, built: 'Webhooks are acknowledged immediately; cache invalidation and pushes run in background tasks.' },
  { t: 0.64, label: 'Background work + Redis lock', icon: Database, built: 'A Redis distributed lock keeps SMS-schedule sync to one instance; batch state reads use a 60s cache.' },
  { t: 0.9, label: 'Push to phone', icon: Send, built: 'Firebase Cloud Messaging delivers the change; a typed error model keeps the client contract clear.' },
]

const PIPELINE = [
  { label: 'Mobile App', icon: Smartphone },
  { label: 'FastAPI', icon: Zap },
  { label: 'MongoDB / Redis', icon: Database },
  { label: 'FCM', icon: BellRing },
]

export default function FlightStory({ active, playKey }: { active: boolean; playKey: number }) {
  const prefersReducedMotion = useReducedMotion()
  const progress = useMotionValue(0)
  const planeX = useTransform(progress, (t) => pointAt(t).x)
  const planeY = useTransform(progress, (t) => pointAt(t).y)
  const planeAngle = useTransform(progress, angleAt)
  const [reached, setReached] = useState(0)

  useMotionValueEvent(progress, 'change', (t) => {
    setReached(CHECKPOINTS.filter((c) => t >= c.t).length)
  })

  useEffect(() => {
    if (!active) return
    if (prefersReducedMotion) {
      progress.set(1)
      return
    }
    progress.set(0)
    const controls = animate(progress, 1, { duration: 7, ease: 'easeInOut' })
    return () => controls.stop()
  }, [active, playKey, prefersReducedMotion, progress])

  const latest = reached > 0 ? CHECKPOINTS[reached - 1] : undefined
  const landed = reached === CHECKPOINTS.length

  return (
    <div className="grid lg:grid-cols-[1fr_240px] gap-8 items-center">
      <div className="space-y-6">
        <div className="relative rounded-xl border border-slate-700/60 bg-[radial-gradient(circle,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:18px_18px]">
          <div className="relative aspect-[10/3]">
            <svg viewBox="0 0 1000 300" className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
              <path d={ARC_PATH} fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="6 8" />
              <motion.path
                d={ARC_PATH}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="3"
                strokeLinecap="round"
                style={{ pathLength: progress, filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.8))' }}
              />
              {CHECKPOINTS.map((c, i) => {
                const p = pointAt(c.t)
                const isReached = i < reached
                return (
                  <g key={c.label}>
                    <circle cx={p.x} cy={p.y} r="16" fill="#0f172a" stroke={isReached ? '#22d3ee' : '#475569'} strokeWidth="2" />
                    <circle cx={p.x} cy={p.y} r="5" fill={isReached ? '#22d3ee' : '#475569'} />
                  </g>
                )
              })}
              <motion.g style={{ x: planeX, y: planeY, rotate: planeAngle }}>
                <path
                  d="M -16 -3 L 8 -3 L 16 0 L 8 3 L -16 3 Z M -4 -3 L -12 -14 L -7 -14 L 5 -3 Z M -4 3 L -12 14 L -7 14 L 5 3 Z M -16 -3 L -20 -9 L -16 -9 L -11 -3 Z M -16 3 L -20 9 L -16 9 L -11 3 Z"
                  fill="#f8fafc"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(248,250,252,0.6))' }}
                />
              </motion.g>
            </svg>

            {[{ p: P0, code: 'DEL' }, { p: P2, code: 'BOM' }].map(({ p, code }) => (
              <div
                key={code}
                className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center"
                style={{ left: `${p.x / 10}%`, top: `${(p.y / 300) * 100}%` }}
              >
                <MapPin className="w-6 h-6 text-cyan-400" />
                <span className="font-mono text-xs text-slate-200 absolute top-full mt-5">{code}</span>
              </div>
            ))}

            {CHECKPOINTS.map((c, i) => {
              const p = pointAt(c.t)
              return (
                <span
                  key={c.label}
                  className={`hidden md:block absolute -translate-x-1/2 mt-6 max-w-[150px] text-center font-mono text-[11px] leading-4 transition-colors duration-300 ${i < reached ? 'text-slate-100' : 'text-slate-500'}`}
                  style={{ left: `${p.x / 10}%`, top: `${(p.y / 300) * 100}%` }}
                >
                  {c.label}
                </span>
              )
            })}
          </div>
        </div>

        <div className="min-h-[72px]" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={reached}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 flex gap-3"
            >
              {latest ? <Code2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" /> : <Plane className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}
              <p className="text-sm text-slate-200 leading-6">
                {latest ? (
                  <>
                    <span className="font-mono text-cyan-400">{latest.label}: </span>
                    {latest.built}
                  </>
                ) : (
                  'Flight FL 204 · DEL → BOM is being tracked…'
                )}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {PIPELINE.map((stage, i) => {
            const Icon = stage.icon
            const lit = i < reached
            return (
              <div key={stage.label} className="flex items-center gap-2 md:gap-3">
                <div
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs transition-colors duration-300 ${lit ? 'border-cyan-400/60 text-cyan-300 bg-cyan-500/10' : 'border-slate-700 text-slate-500'}`}
                >
                  <Icon className="w-4 h-4" />
                  {stage.label}
                </div>
                {i < PIPELINE.length - 1 && <span className={`font-mono ${lit ? 'text-cyan-400' : 'text-slate-600'}`}>→</span>}
              </div>
            )
          })}
        </div>
      </div>

      <PhoneFrame label={landed ? 'Phone lock screen with a push notification: gate changed from 14 to 22, delayed 25 minutes' : 'Phone lock screen tracking flight FL 204 from Delhi to Mumbai'}>
        <div className="text-center mt-4">
          <p className="font-mono text-4xl text-slate-100">09:41</p>
          <p className="text-[11px] text-slate-400 mt-1">Tue, 20 Oct</p>
        </div>
        <div className="mt-8 min-h-[90px]">
          <AnimatePresence mode="wait">
            {landed ? (
              <motion.div
                key="push"
                initial={{ opacity: 0, y: -24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="rounded-2xl bg-slate-800/90 border border-slate-600 p-3"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
                    <Plane className="w-3.5 h-3.5 text-cyan-400" /> Flight Alerts
                  </span>
                  <span className="text-slate-500">now</span>
                </div>
                <p className="mt-2 text-[12px] text-slate-100">Gate changed: 14 → 22</p>
                <p className="text-[11px] text-amber-400">Delayed 25 min</p>
              </motion.div>
            ) : (
              <motion.div
                key="tracking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-dashed border-slate-700 p-3 text-center"
              >
                <p className="text-[11px] text-slate-400">Tracking FL 204</p>
                <p className="font-mono text-xs text-slate-300 mt-1">DEL → BOM</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PhoneFrame>
    </div>
  )
}
