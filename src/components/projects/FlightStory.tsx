import { useEffect, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { BellRing, MapPin, Plane, Smartphone, Timer, Zap } from 'lucide-react'
import PhoneFrame from './PhoneFrame'
import StoryControls from './StoryControls'
import { EventLane, PushBanner, StepCaption, type LaneItem } from './StoryParts'
import { ACCENTS } from './accents'
import { storyKeyHandler, useStoryPlayer } from './useStoryPlayer'

const accent = ACCENTS.cyan

const P0 = { x: 60, y: 230 }
const P1 = { x: 500, y: -20 }
const P2 = { x: 940, y: 230 }
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

const LANE: LaneItem[] = [
  { key: 'subscribe', label: 'App · SMS · email', icon: Smartphone },
  { key: 'provider', label: 'Provider push', icon: Zap },
  { key: 'poll', label: 'Smart poll', icon: Timer },
  { key: 'push', label: 'Push to phone', icon: BellRing },
]

const ZONES = ['Before the airport', 'At the airport', 'In the air & arrival']

// Poll ticks bunch up as departure (the end of the airport zone) gets closer.
const POLL_TICKS = Array.from({ length: 16 }, (_, i) => 3 + 63 * (1 - (1 - i / 15) ** 2.4))

type Tone = 'neutral' | 'cyan' | 'green' | 'amber' | 'red'

interface FlightStep {
  label: string
  clock: string
  title: string
  text: string
  at: number
  flight: number
  faded?: boolean
  cancelled?: boolean
  lane: string[]
  push?: string
  card?: { pill: string; tone: Tone; headline: string; detail: string; rows: [string, string][]; inAir?: boolean }
}

const JOURNEY: FlightStep[] = [
  {
    label: 'Flight added', clock: 'T-3 days', title: 'Add your flight',
    text: 'From the app, a forwarded booking SMS (an LLM reads the flight number and date) or email check.',
    at: 6, flight: 0, lane: ['subscribe'],
    card: { pill: 'Scheduled', tone: 'neutral', headline: '09:10 → 11:20', detail: 'Mon 12 Nov · On-time rate 86%', rows: [['Seat', '14C']] },
  },
  {
    label: 'Quiet watching', clock: 'T-1 day', title: 'Quiet watching',
    text: 'Checks are rare while the flight is days away.',
    at: 22, flight: 0, lane: ['poll'],
    card: { pill: 'Scheduled', tone: 'neutral', headline: 'Tomorrow 09:10', detail: 'Delhi 24° · Mumbai 31°', rows: [['Seat', '14C']] },
  },
  {
    label: 'Check-in', clock: 'T-3h', title: 'Know where to go',
    text: 'Terminal and check-in counters as soon as they are known.',
    at: 36, flight: 0, lane: ['provider', 'push'], push: 'Check-in: Counters D1–D6 · Terminal 3',
    card: { pill: 'Check-in open', tone: 'cyan', headline: 'Counters D1–D6', detail: 'Terminal 3', rows: [['Seat', '14C'], ['Terminal', 'T3']] },
  },
  {
    label: 'Delayed', clock: 'T-2h', title: 'Delays, instantly',
    text: 'The provider pushes the change. The cloud verifies it and updates your card.',
    at: 42, flight: 0, lane: ['provider', 'push'], push: 'AI 865 delayed 25 min · New departure 09:35',
    card: { pill: 'Delayed 25 min', tone: 'amber', headline: '09:35 → 11:45', detail: 'was 09:10', rows: [['Seat', '14C'], ['Terminal', 'T3']] },
  },
  {
    label: 'Gate change', clock: 'T-75m', title: 'Gate change',
    text: 'Only real changes trigger a notification.',
    at: 48, flight: 0, lane: ['provider', 'push'], push: 'Gate changed: 14 → 22',
    card: { pill: 'Delayed 25 min', tone: 'amber', headline: 'Gate 22', detail: 'was Gate 14', rows: [['Seat', '14C'], ['Terminal', 'T3']] },
  },
  {
    label: 'Boarding', clock: 'T-40m', title: 'Boarding started',
    text: 'The card turns into a boarding pass reminder.',
    at: 54, flight: 0, lane: ['provider', 'push'], push: 'Boarding now at Gate 22',
    card: { pill: 'Boarding', tone: 'green', headline: 'Boarding now', detail: 'Gate 22 · Seat 14C', rows: [['Gate', '22'], ['Terminal', 'T3']] },
  },
  {
    label: 'Final call', clock: 'T-20m', title: 'Final call',
    text: 'Hard to miss.',
    at: 60, flight: 0, lane: ['provider', 'push'], push: 'Final call at Gate 22',
    card: { pill: 'Final call', tone: 'red', headline: 'Final call', detail: 'Gate 22', rows: [['Gate', '22'], ['Seat', '14C']] },
  },
  {
    label: 'Gate closed', clock: 'T-10m', title: 'Gate closed',
    text: 'The card follows every airport stage, without a push for each one.',
    at: 65, flight: 0, lane: ['provider'],
    card: { pill: 'Gate closed', tone: 'neutral', headline: 'Gate closed', detail: 'Departing 09:35', rows: [['Gate', '22'], ['Seat', '14C']] },
  },
  {
    label: 'In flight', clock: 'Airborne', title: 'In the air',
    text: 'The estimated landing time keeps updating, and the baggage belt often appears before you land.',
    at: 80, flight: 0.5, lane: ['poll'],
    card: { pill: 'In flight', tone: 'cyan', headline: 'Lands 11:45', detail: 'Estimated · updating', rows: [['Arrives', 'T2'], ['Baggage belt', '7']], inAir: true },
  },
  {
    label: 'Landed', clock: 'Landed', title: 'Landed',
    text: 'Terminal, baggage belt and exit, before you unbuckle.',
    at: 91, flight: 1, lane: ['provider', 'push'], push: 'Landed 11:42 · Baggage belt 7 · Exit Gate 3',
    card: { pill: 'Arrived', tone: 'green', headline: 'Landed 11:42', detail: 'Terminal 2', rows: [['Baggage belt', '7'], ['Exit', 'Gate 3']] },
  },
  {
    label: 'Baggage', clock: '+15 min', title: 'Collect your bags',
    text: 'The belt is usually known before you land. If the airport changes it after landing, the card and a push follow.',
    at: 96, flight: 1, lane: ['provider', 'push'], push: 'Baggage belt changed: 7 → 9',
    card: { pill: 'Arrived', tone: 'green', headline: 'Baggage belt 9', detail: 'was Belt 7', rows: [['Baggage belt', '9'], ['Exit', 'Gate 3']] },
  },
  {
    label: 'Card hides', clock: 'Next day', title: 'Then it gets out of the way',
    text: 'Finished flights stop being tracked and the card hides.',
    at: 100, flight: 1, faded: true, lane: [],
  },
]

const SCENARIOS = {
  journey: { label: 'Normal trip', steps: JOURNEY },
  cancelled: {
    label: 'What if it\'s cancelled?',
    steps: [
      ...JOURNEY.slice(0, 3),
      {
        label: 'Cancelled', clock: 'T-2h', title: 'Cancelled',
        text: 'The card turns red and stays visible for a day so you see it, then hides. Tracking stops.',
        at: 42, flight: 0, faded: true, cancelled: true, lane: ['provider', 'push'], push: 'AI 865 on 12 Nov is cancelled',
        card: { pill: 'Cancelled', tone: 'red', headline: 'Flight cancelled', detail: 'Tracking stopped', rows: [['Seat', '14C']] },
      } satisfies FlightStep,
    ],
  },
} as const

type ScenarioKey = keyof typeof SCENARIOS

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-slate-700/60 text-slate-200',
  cyan: 'bg-cyan-500/15 text-cyan-300',
  green: 'bg-green-500/15 text-green-300',
  amber: 'bg-amber-500/15 text-amber-300',
  red: 'bg-red-500/15 text-red-300',
}

export default function FlightStory({ active }: { active: boolean }) {
  const [scenario, setScenario] = useState<ScenarioKey>('journey')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a scenario">
        {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setScenario(key)}
            aria-pressed={scenario === key}
            className={`min-h-[44px] rounded-lg border px-3 font-mono text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 ${
              scenario === key ? `${accent.border} ${accent.bg} ${accent.text}` : 'border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {SCENARIOS[key].label}
          </button>
        ))}
      </div>
      <FlightRun key={scenario} steps={SCENARIOS[scenario].steps} active={active} />
    </div>
  )
}

function FlightRun({ steps, active }: { steps: readonly FlightStep[]; active: boolean }) {
  const player = useStoryPlayer(steps.length, 2000, active)
  const current = steps[player.step]
  const zone = current.at < 33 ? 0 : current.at < 66 ? 1 : 2

  const flight = useMotionValue(0)
  const planeX = useTransform(flight, (t) => pointAt(t).x)
  const planeY = useTransform(flight, (t) => pointAt(t).y)
  const planeAngle = useTransform(flight, angleAt)

  useEffect(() => {
    const controls = animate(flight, current.flight, { duration: 1.2, ease: 'easeInOut' })
    return () => controls.stop()
  }, [current.flight, flight])

  return (
    <div
      tabIndex={0}
      aria-label="Flight story player. Use the left and right arrow keys to change steps."
      className="grid lg:grid-cols-[1fr_260px] gap-8 items-start rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
      onKeyDown={storyKeyHandler(player)}
    >
      <div className="space-y-6 min-w-0">
        <div className="rounded-xl border border-slate-700/60 bg-[radial-gradient(circle,rgba(148,163,184,0.10)_1px,transparent_1px)] [background-size:18px_18px] p-4">
          <div className="relative aspect-[10/2.6]">
            <svg viewBox="0 0 1000 260" className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
              <path
                d={ARC_PATH}
                fill="none"
                stroke={current.cancelled ? '#f87171' : '#475569'}
                strokeOpacity={current.cancelled ? 0.8 : 1}
                strokeWidth="2"
                strokeDasharray="6 8"
                style={{ transition: 'stroke 400ms' }}
              />
              <motion.path d={ARC_PATH} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" style={{ pathLength: flight }} />
              <motion.g style={{ x: planeX, y: planeY, rotate: planeAngle }} animate={{ opacity: current.faded ? 0.35 : 1 }}>
                <path
                  d="M -16 -3 L 8 -3 L 16 0 L 8 3 L -16 3 Z M -4 -3 L -12 -14 L -7 -14 L 5 -3 Z M -4 3 L -12 14 L -7 14 L 5 3 Z M -16 -3 L -20 -9 L -16 -9 L -11 -3 Z M -16 3 L -20 9 L -16 9 L -11 3 Z"
                  fill={current.cancelled ? '#f87171' : '#f8fafc'}
                />
              </motion.g>
            </svg>
            {[{ p: P0, code: 'DEL · T3' }, { p: P2, code: 'BOM · T2' }].map(({ p, code }) => (
              <div key={code} className="absolute -translate-x-1/2 flex flex-col items-center" style={{ left: `${p.x / 10}%`, top: `${(p.y / 260) * 100}%` }}>
                <MapPin className={`w-5 h-5 -translate-y-full transition-colors duration-300 ${current.cancelled && p === P2 ? 'text-red-400' : 'text-cyan-400'}`} />
                <span className="font-mono text-[11px] text-slate-300 whitespace-nowrap">{code}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="grid grid-cols-3 font-mono text-[10px] uppercase tracking-wider">
              {ZONES.map((name, i) => (
                <span
                  key={name}
                  className={`text-center transition-colors duration-300 ${
                    current.cancelled && i >= zone ? 'text-red-400/80' : i === zone ? 'text-cyan-300' : 'text-slate-500'
                  }`}
                >
                  {name}
                </span>
              ))}
            </div>
            <div className="relative mt-3 h-6">
              <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-700" />
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-slate-600" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-slate-600" />
              {POLL_TICKS.map((pos) => (
                <span key={pos} className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-slate-400/50" style={{ left: `${pos}%` }} />
              ))}
              <motion.div
                className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-cyan-400"
                animate={{ width: `${current.at}%` }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
              {current.cancelled && (
                <motion.div
                  className="absolute right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-red-400/80"
                  style={{ left: `${current.at}%` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
              )}
              <motion.span
                className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md border bg-slate-950 px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap transition-colors duration-300 ${
                  current.cancelled ? 'border-red-400/70 text-red-300' : 'border-cyan-400/60 text-cyan-300'
                }`}
                animate={{ left: `${Math.min(current.at, 96)}%` }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                {current.clock}
              </motion.span>
            </div>
            <p className="mt-2 font-mono text-[10px] text-slate-500">Tick marks = status checks. They get closer together as departure nears.</p>
          </div>
        </div>

        <StepCaption id={`${player.step}-${current.label}`} title={current.title} text={current.text} accent={accent} />
        <EventLane items={LANE} lit={current.lane} accent={accent} />
        <StoryControls player={player} labels={steps.map((s) => s.label)} accent={accent} />
      </div>

      <PhoneFrame
        label={current.card ? `Flight card: ${current.card.pill}. ${current.card.headline}. ${current.card.detail}` : 'Home screen with no upcoming flights'}
        overlay={<PushBanner id={`${player.step}`} app="Flight status" icon={Plane} text={current.push} iconClass="text-cyan-400" />}
      >
        <FlightCardScreen step={current} />
      </PhoneFrame>
    </div>
  )
}

function FlightCardScreen({ step }: { step: FlightStep }) {
  const card = step.card
  return (
    <div className="pt-16">
      <p className="px-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">AI Mind Suggest</p>
      <AnimatePresence mode="wait">
        {card ? (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="mt-2 rounded-2xl border border-slate-700 bg-slate-900/90 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-300">
                <span className="w-4 h-4 rounded bg-cyan-500/20 flex items-center justify-center">
                  <Plane className="w-2.5 h-2.5 text-cyan-400" />
                </span>
                AI 865 · Seat 14C
              </span>
              <motion.span key={card.pill} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${TONE_CLASSES[card.tone]}`}>
                {card.pill}
              </motion.span>
            </div>

            <div className="mt-3 flex items-center justify-between font-mono">
              <span className="text-[15px] font-semibold text-white">DEL</span>
              <span className="relative flex-1 mx-2 h-px bg-slate-600">
                {card.inAir && (
                  <motion.span className="absolute -top-2" initial={{ left: '0%' }} animate={{ left: '50%' }} transition={{ duration: 1.2 }}>
                    <Plane className="w-4 h-4 text-cyan-300" />
                  </motion.span>
                )}
              </span>
              <span className="text-[15px] font-semibold text-white">BOM</span>
            </div>

            <motion.p key={card.headline} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-[17px] font-semibold leading-6 text-white">
              {card.headline}
            </motion.p>
            <motion.p
              key={card.detail}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-[11px] ${card.tone === 'amber' ? 'text-amber-300' : card.tone === 'red' ? 'text-red-300' : 'text-slate-300'} ${card.detail.startsWith('was') ? 'line-through decoration-slate-500' : ''}`}
            >
              {card.detail}
            </motion.p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {card.rows.map(([label, value]) => (
                <motion.div key={`${label}-${value}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-slate-800/80 px-2 py-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500">{label}</p>
                  <p className="text-[12px] font-semibold text-slate-100">{value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 rounded-2xl border border-dashed border-slate-700 p-4 text-center text-[11px] text-slate-500"
          >
            No upcoming flights
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
