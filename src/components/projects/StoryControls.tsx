import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import type { AccentClasses } from './accents'
import type { StoryPlayer } from './useStoryPlayer'

interface StoryControlsProps {
  player: StoryPlayer
  labels: string[]
  accent: AccentClasses
}

const iconButton =
  'inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-700 text-slate-300 hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/80'

export default function StoryControls({ player, labels, accent }: StoryControlsProps) {
  const { step, stepCount, playing } = player
  const atEnd = step >= stepCount - 1

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2">
        <button type="button" onClick={player.prev} disabled={step === 0} className={iconButton} aria-label="Previous step">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={atEnd && !playing ? player.replay : player.togglePlay}
          className={iconButton}
          aria-label={playing ? 'Pause story' : atEnd ? 'Replay story' : 'Play story'}
        >
          {playing ? <Pause className="w-4 h-4" /> : atEnd ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button type="button" onClick={player.next} disabled={atEnd} className={iconButton} aria-label="Next step">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-1 items-center gap-1" role="group" aria-label="Story steps">
        {labels.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => player.goTo(i)}
            aria-label={`Step ${i + 1}: ${label}`}
            aria-current={i === step ? 'step' : undefined}
            className="group flex-1 py-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/80 rounded"
          >
            <span
              className={`block h-1.5 rounded-full transition-colors duration-300 ${
                i < step ? `${accent.bgSolid} opacity-60` : i === step ? accent.bgSolid : 'bg-slate-700 group-hover:bg-slate-500'
              }`}
            />
          </button>
        ))}
      </div>

      <span className="font-mono text-xs text-slate-400 tabular-nums whitespace-nowrap">
        {step + 1} / {stepCount}
      </span>
    </div>
  )
}
