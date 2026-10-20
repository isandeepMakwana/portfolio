import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import type { AccentClasses } from './accents'

export function PushBanner({ id, app, icon: Icon, text, iconClass }: { id: string; app: string; icon: LucideIcon; text?: string; iconClass: string }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: -28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="rounded-2xl border border-slate-600 bg-slate-800/95 px-3 py-2 shadow-lg shadow-black/40 backdrop-blur"
        >
          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Icon className={`w-3 h-3 ${iconClass}`} /> {app}
            </span>
            <span className="text-slate-500">now</span>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-slate-100">{text}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export interface LaneItem {
  key: string
  label: string
  icon: LucideIcon
}

export function EventLane({ items, lit, accent }: { items: LaneItem[]; lit: string[]; accent: AccentClasses }) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Why the card changed">
      <span className="font-mono text-[11px] uppercase tracking-widest text-slate-500 mr-1">Behind the card</span>
      {items.map(({ key, label, icon: Icon }) => {
        const on = lit.includes(key)
        return (
          <motion.span
            key={key}
            animate={on ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={{ duration: 0.45 }}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] transition-colors duration-300 ${
              on ? `${accent.border} ${accent.bg} ${accent.text}` : 'border-slate-700/70 text-slate-500'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </motion.span>
        )
      })}
    </div>
  )
}

export function StepCaption({ id, title, text, accent }: { id: string; title: string; text?: string; accent: AccentClasses }) {
  return (
    <div className="min-h-[76px]" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <p className={`font-mono text-base font-semibold ${accent.text}`}>{title}</p>
          {text && <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
