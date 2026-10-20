import { useRef, useState, type ReactNode } from 'react'
import { useInView } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import type { AccentClasses } from './accents'

interface StoryFrameProps {
  title: string
  accent: AccentClasses
  children: (state: { active: boolean; playKey: number }) => ReactNode
}

export default function StoryFrame({ title, accent, children }: StoryFrameProps) {
  const ref = useRef<HTMLDivElement>(null)
  const active = useInView(ref, { once: true, amount: 0.35 })
  const [playKey, setPlayKey] = useState(0)

  return (
    <section ref={ref} className="rounded-2xl border border-slate-700/60 bg-slate-900/70 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2 font-mono text-sm text-slate-300">
          <span className={`w-2 h-2 rounded-full ${accent.bgSolid} animate-pulse`} />
          {title}
        </div>
        <button
          onClick={() => setPlayKey((key) => key + 1)}
          className={`inline-flex items-center gap-2 rounded-lg border ${accent.border} px-3 py-2 min-h-[40px] font-mono text-xs ${accent.text} hover:bg-white/5 transition-colors cursor-pointer`}
          aria-label="Replay the story animation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Replay
        </button>
      </div>
      <div className="p-5 md:p-8">{children({ active, playKey })}</div>
    </section>
  )
}
