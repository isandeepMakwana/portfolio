import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BellRing, Download, PersonStanding, Timer, TrainFront, Webhook } from 'lucide-react'
import PhoneFrame from './PhoneFrame'
import StoryControls from './StoryControls'
import { EventLane, PushBanner, StepCaption, type LaneItem } from './StoryParts'
import { ACCENTS } from './accents'
import { storyKeyHandler, useStoryPlayer } from './useStoryPlayer'

const accent = ACCENTS.green

const STATIONS = [
  { code: 'MMCT', name: 'Mumbai Central', at: 4 },
  { code: 'BVI', name: 'Borivali', at: 18, tag: 'You board' },
  { code: 'ST', name: 'Surat', at: 34 },
  { code: 'BRC', name: 'Vadodara', at: 50 },
  { code: 'RTM', name: 'Ratlam', at: 66 },
  { code: 'KOTA', name: 'Kota', at: 82, tag: 'You get off' },
  { code: 'NDLS', name: 'New Delhi', at: 96 },
]
const BOARD_AT = 18
const DEST_AT = 82
const DETOUR_FROM = 66
const DETOUR_TO = 96

const LANE: LaneItem[] = [
  { key: 'api', label: 'MakeMyTrip API', icon: Download },
  { key: 'webhook', label: 'MakeMyTrip webhook', icon: Webhook },
  { key: 'poll', label: 'Live poll', icon: Timer },
  { key: 'push', label: 'Push to phone', icon: BellRing },
]

type Tone = 'neutral' | 'green' | 'amber' | 'red'

interface TrainStep {
  label: string
  when: string
  title: string
  text: string
  trainAt: number
  trainFaded?: boolean
  diverted?: boolean
  traveller: 'platform' | 'onboard' | 'arrived'
  lane: string[]
  push?: string
  card?: { pill: string; tone: Tone; headline: string; detail: string; berth?: string }
}

const JOURNEY: TrainStep[] = [
  {
    label: 'Trip added', when: 'Booking day', title: 'Add your PNR',
    text: 'The cloud fetches the booking and the train\'s full route and timings from MakeMyTrip.',
    trainAt: 4, trainFaded: true, traveller: 'platform', lane: ['api'],
    card: { pill: 'Trip added', tone: 'neutral', headline: 'Fri 14 Nov · 17:24', detail: 'Waitlist WL 12' },
  },
  {
    label: 'Booking confirmed', when: 'Two days later', title: 'Booking status moves',
    text: 'Waitlist changes arrive by webhook, and the card follows them.',
    trainAt: 4, trainFaded: true, traveller: 'platform', lane: ['webhook', 'push'], push: 'PNR 4521…890 is now Confirmed',
    card: { pill: 'Confirmed', tone: 'green', headline: 'Fri 14 Nov · 17:24', detail: 'WL 12 → RAC 3 → Confirmed' },
  },
  {
    label: 'Chart prepared', when: '~4 hours before', title: 'Chart is out',
    text: 'Coach and berth appear on the home screen. No app to open.',
    trainAt: 4, trainFaded: true, traveller: 'platform', lane: ['webhook', 'push'], push: 'Chart prepared: Coach B2, Berth 34 (Lower)',
    card: { pill: 'Chart prepared', tone: 'green', headline: 'Coach B2 · Berth 34', detail: 'Lower berth · Departs 17:24', berth: 'B2 · 34' },
  },
  {
    label: 'Train started', when: '17:00', title: 'Live tracking starts',
    text: 'The cloud follows the train from its origin, before it reaches you.',
    trainAt: 10, traveller: 'platform', lane: ['webhook', 'poll'],
    card: { pill: 'Chart prepared', tone: 'green', headline: 'Coach B2 · Berth 34', detail: 'Started from Mumbai Central · 3 min late', berth: 'B2 · 34' },
  },
  {
    label: 'Arriving soon', when: '17:15', title: 'Get ready',
    text: 'The train is close to your station.',
    trainAt: 14, traveller: 'platform', lane: ['webhook', 'push'], push: 'Arriving at Borivali in 12 min',
    card: { pill: 'Arriving soon', tone: 'green', headline: 'In 12 min', detail: 'Borivali · Platform TBA', berth: 'B2 · 34' },
  },
  {
    label: 'Platform', when: '17:18', title: 'Platform announced',
    text: 'Shown the moment it\'s announced, or changed.',
    trainAt: 15, traveller: 'platform', lane: ['webhook', 'push'], push: 'Platform 4 at Borivali',
    card: { pill: 'Platform', tone: 'green', headline: 'Platform 4', detail: 'Borivali · arriving 17:27', berth: 'B2 · 34' },
  },
  {
    label: 'At your station', when: '17:27', title: 'It\'s here',
    text: 'The train has arrived at your boarding station.',
    trainAt: 18, traveller: 'platform', lane: ['webhook', 'push'], push: 'Your train is at Borivali, Platform 4',
    card: { pill: 'At your station', tone: 'green', headline: 'Arrived at Borivali', detail: 'Platform 4 · Coach B2', berth: 'B2 · 34' },
  },
  {
    label: 'Departed', when: '17:30', title: 'On board',
    text: 'The card becomes a journey tracker.',
    trainAt: 25, traveller: 'onboard', lane: ['webhook', 'push'], push: 'Departed Borivali · Next: Surat 19:52',
    card: { pill: 'Departed', tone: 'green', headline: 'Next: Surat 19:52', detail: 'On time', berth: 'B2 · 34' },
  },
  {
    label: 'Station by station', when: '23:40', title: 'Station by station',
    text: 'Current and next station update as the train runs, without a push for every stop.',
    trainAt: 54, traveller: 'onboard', lane: ['webhook', 'poll'],
    card: { pill: 'On the way', tone: 'green', headline: 'Next: Ratlam 01:05', detail: 'Passed Vadodara', berth: 'B2 · 34' },
  },
  {
    label: 'Running late', when: '00:20', title: 'Delays',
    text: 'Shown on top of the current stage, and cleared when the next real event arrives.',
    trainAt: 60, traveller: 'onboard', lane: ['poll', 'push'], push: 'Running 18 min late · Kota ETA 03:58',
    card: { pill: 'Running 18 min late', tone: 'amber', headline: 'Next: Ratlam 01:23', detail: 'Kota ETA 03:58', berth: 'B2 · 34' },
  },
  {
    label: 'Your stop is next', when: '03:40', title: 'Your stop is next',
    text: 'The card counts down to your destination.',
    trainAt: 77, traveller: 'onboard', lane: ['webhook'],
    card: { pill: 'Running 15 min late', tone: 'amber', headline: 'Kota next', detail: 'ETA 03:55', berth: 'B2 · 34' },
  },
  {
    label: 'Reached destination', when: '03:56', title: 'Journey complete',
    text: 'The card is about your trip, not the whole train\'s route. It stops at your station.',
    trainAt: DEST_AT, traveller: 'arrived', lane: ['webhook', 'push'], push: 'Arrived at Kota 03:56 · 16 min late',
    card: { pill: 'Reached destination', tone: 'green', headline: 'Arrived at Kota', detail: '03:56 · 16 min late', berth: 'B2 · 34' },
  },
  {
    label: 'Card hides', when: 'Next day', title: 'Then it cleans itself up',
    text: 'The card hides a day after the trip and tracking stops.',
    trainAt: 96, trainFaded: true, traveller: 'arrived', lane: [],
  },
]

const SCENARIOS = {
  journey: { label: 'Normal trip', steps: JOURNEY },
  cancelled: {
    label: 'What if it\'s cancelled?',
    steps: [
      ...JOURNEY.slice(0, 3),
      {
        label: 'Cancelled', when: 'Travel day', title: 'Cancelled',
        text: 'The card says so clearly, tracking stops, and later partner updates for this booking are ignored.',
        trainAt: 4, trainFaded: true, traveller: 'platform', lane: ['webhook', 'push'], push: 'Train 12951 on 14 Nov is cancelled',
        card: { pill: 'Cancelled', tone: 'red', headline: 'Train cancelled', detail: 'Tracking stopped', berth: 'B2 · 34' },
      } satisfies TrainStep,
    ],
  },
  diverted: {
    label: 'What if it\'s diverted?',
    steps: [
      ...JOURNEY.slice(0, 8),
      {
        label: 'Diverted', when: '21:10', title: 'Diverted',
        text: 'If the new route skips your station, the card warns you.',
        trainAt: 42, diverted: true, traveller: 'onboard', lane: ['webhook', 'push'], push: 'Train diverted: may not stop at Kota',
        card: { pill: 'Diverted', tone: 'amber', headline: 'Train diverted', detail: 'May not stop at Kota', berth: 'B2 · 34' },
      } satisfies TrainStep,
    ],
  },
} as const

type ScenarioKey = keyof typeof SCENARIOS

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-slate-700/60 text-slate-200',
  green: 'bg-green-500/15 text-green-300',
  amber: 'bg-amber-500/15 text-amber-300',
  red: 'bg-red-500/15 text-red-300',
}

const progressOf = (step: TrainStep) =>
  step.traveller === 'platform' ? 0 : Math.min(1, Math.max(0, (step.trainAt - BOARD_AT) / (DEST_AT - BOARD_AT)))

export default function TrainStory({ active }: { active: boolean }) {
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
            className={`min-h-[44px] rounded-lg border px-3 font-mono text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/80 ${
              scenario === key ? `${accent.border} ${accent.bg} ${accent.text}` : 'border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {SCENARIOS[key].label}
          </button>
        ))}
      </div>
      <TrainRun key={scenario} steps={SCENARIOS[scenario].steps} active={active} />
      <ManyTravellers />
    </div>
  )
}

function TrainRun({ steps, active }: { steps: readonly TrainStep[]; active: boolean }) {
  const player = useStoryPlayer(steps.length, 2000, active)
  const current = steps[player.step]
  const progress = progressOf(current)
  const isCancelled = current.card?.tone === 'red'

  return (
    <div
      tabIndex={0}
      aria-label="Train story player. Use the left and right arrow keys to change steps."
      className="grid lg:grid-cols-[1fr_260px] gap-8 items-start rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/60"
      onKeyDown={storyKeyHandler(player)}
    >
      <div className="space-y-6 min-w-0">
        <div className="relative h-36 rounded-xl border border-slate-700/60 bg-[radial-gradient(circle,rgba(148,163,184,0.10)_1px,transparent_1px)] [background-size:18px_18px] px-2">
          <div className="absolute left-[4%] right-[4%] bottom-12 h-1 rounded-full bg-slate-700" />
          <motion.div
            className={`absolute bottom-12 h-1 rounded-full ${isCancelled ? 'bg-red-500' : 'bg-green-400'}`}
            style={{ left: `${BOARD_AT}%` }}
            animate={{ width: `${progress * (DEST_AT - BOARD_AT)}%` }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
          />
          {isCancelled && (
            <motion.div
              className="absolute bottom-12 right-[4%] translate-y-px border-t-2 border-dashed border-red-400/80"
              style={{ left: `${current.trainAt}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}
          {current.diverted && (
            <>
              <motion.div
                className="absolute bottom-12 translate-y-px border-t-2 border-dashed border-amber-400/80"
                style={{ left: `${current.trainAt}%`, width: `${DETOUR_FROM - current.trainAt}%` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
              <svg viewBox="0 0 100 144" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                <motion.path
                  d={`M ${DETOUR_FROM} 96 C ${DETOUR_FROM + 6} 30, ${DETOUR_TO - 6} 30, ${DETOUR_TO} 96`}
                  fill="none"
                  stroke="#fbbf24"
                  strokeOpacity="0.85"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.3 }}
                />
              </svg>
              <motion.span
                className="absolute top-3 -translate-x-1/2 rounded border border-amber-400/60 bg-slate-950 px-1.5 py-0.5 font-mono text-[9px] text-amber-300 whitespace-nowrap"
                style={{ left: `${(DETOUR_FROM + DETOUR_TO) / 2}%` }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                New route
              </motion.span>
            </>
          )}

          {STATIONS.map((station) => {
            const isMine = Boolean(station.tag)
            const passed = current.trainAt >= station.at
            const cancelledAhead = isCancelled && !passed
            const skipped = current.diverted && station.code === 'KOTA'
            return (
              <div key={station.code} className="absolute bottom-0 -translate-x-1/2 flex flex-col items-center" style={{ left: `${station.at}%` }}>
                <span
                  className={`w-3 h-3 rounded-full border-2 mb-[42px] transition-colors duration-300 ${
                    cancelledAhead
                      ? 'border-red-400 bg-slate-950'
                      : skipped
                        ? 'border-amber-400 bg-slate-950 opacity-70'
                        : isMine
                        ? 'border-green-400 bg-slate-950'
                        : passed
                          ? 'border-slate-400 bg-slate-400'
                          : 'border-slate-600 bg-slate-950'
                  }`}
                />
                <span
                  className={`absolute bottom-5 font-mono text-[10px] whitespace-nowrap transition-colors duration-300 ${
                    cancelledAhead ? 'text-red-300/80' : skipped ? 'text-amber-300 line-through decoration-amber-400/70' : isMine ? 'text-green-300' : 'text-slate-400'
                  }`}
                >
                  <span className="md:hidden">{station.code}</span>
                  <span className="hidden md:inline">{station.name}</span>
                </span>
                {station.tag && (
                  <span
                    className={`absolute bottom-0 font-mono text-[9px] uppercase tracking-wider whitespace-nowrap ${
                      cancelledAhead ? 'text-red-400/80' : skipped ? 'text-amber-400' : 'text-green-500/80'
                    }`}
                  >
                    {skipped ? 'May skip' : station.tag}
                  </span>
                )}
              </div>
            )
          })}

          <motion.div
            className="absolute bottom-[54px] -translate-x-1/2"
            animate={{ left: `${current.trainAt}%`, opacity: current.trainFaded ? 0.35 : 1 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <div className="flex items-end gap-0.5">
              <span className={`w-5 h-4 rounded-sm ${isCancelled ? 'bg-red-400/60' : 'bg-slate-300/80'}`} />
              <span className={`w-5 h-4 rounded-sm ${isCancelled ? 'bg-red-400/60' : 'bg-slate-300/80'}`} />
              <span className={`flex items-center justify-center w-7 h-5 rounded-t-md rounded-br-xl ${isCancelled ? 'bg-red-400' : 'bg-green-400'}`}>
                <TrainFront className="w-3.5 h-3.5 text-slate-950" />
              </span>
            </div>
          </motion.div>

          <AnimatePresence>
            {current.traveller !== 'onboard' && (
              <motion.div
                key={current.traveller}
                className="absolute top-3 -translate-x-1/2"
                style={{ left: `${current.traveller === 'platform' ? BOARD_AT : DEST_AT}%` }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.35 }}
              >
                <PersonStanding className="w-5 h-5 text-green-300" aria-hidden="true" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <p className="font-mono text-xs text-slate-500">{current.when}</p>
          <StepCaption id={`${player.step}-${current.label}`} title={current.title} text={current.text} accent={accent} />
        </div>
        <EventLane items={LANE} lit={current.lane} accent={accent} />
        <StoryControls player={player} labels={steps.map((s) => s.label)} accent={accent} />
      </div>

      <PhoneFrame
        label={current.card ? `MakeMyTrip Train Card: ${current.card.pill}. ${current.card.headline}. ${current.card.detail}` : 'Home screen with no upcoming trips'}
        overlay={<PushBanner id={`${player.step}`} app="MakeMyTrip" icon={TrainFront} text={current.push} iconClass="text-green-400" />}
      >
        <TrainCardScreen step={current} progress={progress} />
      </PhoneFrame>
    </div>
  )
}

function TrainCardScreen({ step, progress }: { step: TrainStep; progress: number }) {
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
                <span className="w-4 h-4 rounded bg-green-500/20 flex items-center justify-center">
                  <TrainFront className="w-2.5 h-2.5 text-green-400" />
                </span>
                MakeMyTrip · Train
              </span>
              <motion.span key={card.pill} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${TONE_CLASSES[card.tone]}`}>
                {card.pill}
              </motion.span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">12951 Mumbai Rajdhani</p>
            <motion.p key={card.headline} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-[17px] font-semibold leading-6 text-white">
              {card.headline}
            </motion.p>
            <motion.p key={card.detail} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-[11px] ${card.tone === 'amber' ? 'text-amber-300' : card.tone === 'red' ? 'text-red-300' : 'text-slate-300'}`}>
              {card.detail}
            </motion.p>

            <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-slate-400">
              <span>BVI 17:24</span>
              <span>KOTA 03:40</span>
            </div>
            <div className="mt-1 h-1 rounded-full bg-slate-700 overflow-hidden">
              <motion.div
                className={`h-full ${card.tone === 'red' ? 'bg-red-400' : card.tone === 'amber' ? 'bg-amber-400' : 'bg-green-400'}`}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
              <span>PNR 4521…890</span>
              <span>{card.berth ?? 'Berth after chart'}</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 rounded-2xl border border-dashed border-slate-700 p-4 text-center text-[11px] text-slate-500"
          >
            No upcoming trips
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const TRAVELLERS = [
  { route: 'MMCT → NDLS', pnr: 'PNR 8830…112' },
  { route: 'BVI → KOTA', pnr: 'PNR 4521…890' },
  { route: 'ST → RTM', pnr: 'PNR 6107…455' },
]

function ManyTravellers() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-5">
      <p className={`font-mono text-sm font-semibold ${accent.text}`}>One train, many travellers</p>
      <p className="mt-1 text-sm leading-6 text-slate-400">
        Every booking on the same train shares one live record, so one update reaches everyone, and each card still shows its own stations.
      </p>
      <div className="mt-5 grid grid-cols-[auto_1fr] sm:grid-cols-[auto_auto_1fr] items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 font-mono text-[11px] text-slate-300">
          <Webhook className="w-3.5 h-3.5 text-green-400" /> MakeMyTrip update
        </div>
        <div className="relative hidden sm:block w-16 h-px bg-slate-700">
          <motion.span
            className="absolute -top-1 w-2 h-2 rounded-full bg-green-400"
            animate={prefersReducedMotion ? undefined : { left: ['0%', '100%'] }}
            transition={prefersReducedMotion ? undefined : { duration: 1, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 font-mono text-[11px] text-green-300 whitespace-nowrap">
            Train run · 12951 · 14 Nov
          </div>
          <div className="grid gap-2 flex-1">
            {TRAVELLERS.map((t, i) => (
              <motion.div
                key={t.pnr}
                className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-[11px]"
                animate={prefersReducedMotion ? undefined : { borderColor: ['rgb(51 65 85)', 'rgb(74 222 128)', 'rgb(51 65 85)'] }}
                transition={prefersReducedMotion ? undefined : { duration: 1, repeat: Infinity, repeatDelay: 1.5, delay: 1 + i * 0.12 }}
              >
                <span className="text-slate-200">{t.route}</span>
                <span className="text-amber-300">Running 18 min late</span>
                <span className="hidden md:inline text-slate-500">{t.pnr}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
