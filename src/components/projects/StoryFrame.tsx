import { useRef, type ReactNode } from 'react'
import { useInView } from 'framer-motion'
import type { AccentClasses } from './accents'

interface StoryFrameProps {
  title: string
  accent: AccentClasses
  children: (state: { active: boolean }) => ReactNode
}

export default function StoryFrame({ title, accent, children }: StoryFrameProps) {
  const ref = useRef<HTMLDivElement>(null)
  const active = useInView(ref, { once: true, amount: 0.35 })

  return (
    <section ref={ref} className="rounded-2xl border border-slate-700/60 bg-slate-900/70 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2 font-mono text-sm text-slate-300">
          <span className={`w-2 h-2 rounded-full ${accent.bgSolid} animate-pulse motion-reduce:animate-none`} />
          {title}
        </div>
        <span className="hidden sm:block font-mono text-xs text-slate-500">Use ← → to step through</span>
      </div>
      <div className="p-5 md:p-8">{children({ active })}</div>
    </section>
  )
}
