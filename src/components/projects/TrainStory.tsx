import { AnimatePresence, motion } from 'framer-motion'
import { Code2, TrainFront } from 'lucide-react'
import PhoneFrame from './PhoneFrame'
import { useStorySteps } from './useStorySteps'

const STATIONS = [
  { label: 'PNR Subscribed', card: { status: 'Subscribed', detail: 'Waiting for chart', tone: 'slate' }, built: 'Optimised the PNR subscribe flow and passenger data (coach, berth type).' },
  { label: 'Chart Prepared', card: { status: 'Chart prepared', detail: 'Coach B2 · Berth 34', tone: 'green' }, built: 'JWT WebView links replaced a partner API call on every card tap.' },
  { label: 'Platform Announced', card: { status: 'Platform 4', detail: 'Coach B2 · Berth 34', tone: 'green' }, built: 'Live tracking falls back safely on partner errors and keeps the last known delay.' },
  { label: 'Departed · Delay +12m', card: { status: 'Delayed +12 min', detail: 'Departed · Platform 4', tone: 'amber' }, built: 'Delay alerts fire even after departure when the delay minutes change.' },
  { label: 'Arrived', card: { status: 'Arrived', detail: 'Card hides after 24h', tone: 'green' }, built: 'Cancellation fan-out unsubscribes fully cancelled bookings and skips later webhooks.' },
]

const STATION_POSITIONS = [4, 27, 50, 73, 96]

const TONE_CLASSES: Record<string, string> = {
  slate: 'bg-slate-700/60 text-slate-300',
  green: 'bg-green-500/15 text-green-400',
  amber: 'bg-amber-500/15 text-amber-400',
}

export default function TrainStory({ active, playKey }: { active: boolean; playKey: number }) {
  const step = useStorySteps(STATIONS.length - 1, 1800, active, playKey)
  const station = STATIONS[step]

  return (
    <div className="grid lg:grid-cols-[1fr_240px] gap-8 items-center">
      <div>
        <div className="min-h-[88px] mb-6 flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="max-w-md rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3 flex gap-3"
              aria-live="polite"
            >
              <Code2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-200 leading-6">
                <span className="font-mono text-green-400">What I built: </span>
                {station.built}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative h-28">
          {/* Track */}
          <div className="absolute left-0 right-0 top-[72px] h-3 flex justify-between px-1">
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i} className="w-1 h-3 rounded-sm bg-slate-700" />
            ))}
          </div>
          <div className="absolute left-0 right-0 top-[72px] h-0.5 bg-slate-500" />
          <div className="absolute left-0 right-0 top-[83px] h-0.5 bg-slate-500" />
          <motion.div
            className="absolute left-0 top-[72px] h-0.5 bg-green-400 origin-left w-full"
            animate={{ scaleX: STATION_POSITIONS[step] / 100 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            style={{ boxShadow: '0 0 12px rgba(74, 222, 128, 0.7)' }}
          />

          {/* Stations */}
          {STATIONS.map((s, i) => (
            <div
              key={s.label}
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${STATION_POSITIONS[i]}%` }}
            >
              <span className={`hidden md:block font-mono text-[11px] whitespace-nowrap mb-2 transition-colors duration-300 ${i <= step ? 'text-slate-200' : 'text-slate-500'}`}>
                {s.label}
              </span>
              <span className="md:hidden font-mono text-[11px] mb-2 text-slate-500">{i + 1}</span>
              <span className={`w-px h-4 border-l border-dashed ${i <= step ? 'border-green-400' : 'border-slate-600'}`} />
              <span
                className={`mt-1 w-4 h-4 rounded-full border-2 bg-slate-900 transition-colors duration-300 ${i <= step ? 'border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]' : 'border-slate-500'}`}
              />
            </div>
          ))}

          {/* Train: the full-width wrapper is translated so x% maps to a share of the track */}
          <motion.div
            className="absolute inset-x-0 top-[50px] pointer-events-none"
            initial={false}
            animate={{ x: `${STATION_POSITIONS[step]}%` }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <div className="relative -translate-x-1/2 w-fit">
              <div className="absolute right-full top-1/2 -translate-y-1/2 h-1 w-16 bg-gradient-to-r from-transparent to-green-400/50 rounded-full" />
              <div className="flex items-center gap-1 rounded-md bg-green-500 px-2 py-1 shadow-lg shadow-green-500/40">
                <TrainFront className="w-4 h-4 text-black" />
                <span className="font-mono text-[10px] font-bold text-black">12301</span>
              </div>
            </div>
          </motion.div>
        </div>

        <p className="md:hidden mt-4 text-center font-mono text-sm text-slate-300">
          Station {step + 1}: {station.label}
        </p>
      </div>

      <PhoneFrame label={`Phone home screen showing the Train Card: ${station.card.status}, ${station.card.detail}`}>
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-3">
          <div className="flex items-center gap-2 text-slate-200 text-xs font-semibold">
            <TrainFront className="w-4 h-4 text-green-400" />
            Train Card
          </div>
          <p className="mt-2 font-mono text-[11px] text-slate-400">Rajdhani Exp · 12301</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="mt-3 space-y-2"
            >
              <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-mono ${TONE_CLASSES[station.card.tone]}`}>
                {station.card.status}
              </span>
              <p className="text-[11px] text-slate-300">{station.card.detail}</p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-3 h-1 rounded-full bg-slate-700 overflow-hidden">
            <motion.div
              className="h-full bg-green-400 origin-left"
              animate={{ scaleX: (step + 1) / STATIONS.length }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      </PhoneFrame>
    </div>
  )
}
