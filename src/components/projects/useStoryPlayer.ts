import { useCallback, useEffect, useState, type KeyboardEvent } from 'react'
import { useReducedMotion } from 'framer-motion'

export interface StoryPlayer {
  step: number
  stepCount: number
  playing: boolean
  goTo: (step: number) => void
  next: () => void
  prev: () => void
  togglePlay: () => void
  replay: () => void
}

/**
 * Steps through a story once `active` is true. Reduced-motion users get no autoplay
 * and move through the steps by hand.
 */
export function useStoryPlayer(stepCount: number, intervalMs: number, active: boolean): StoryPlayer {
  const prefersReducedMotion = useReducedMotion()
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (active && !prefersReducedMotion) setPlaying(true)
  }, [active, prefersReducedMotion])

  useEffect(() => {
    if (!playing) return
    if (step >= stepCount - 1) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(() => setStep((s) => s + 1), intervalMs)
    return () => clearTimeout(timer)
  }, [playing, step, stepCount, intervalMs])

  const goTo = useCallback(
    (target: number) => {
      setPlaying(false)
      setStep(Math.max(0, Math.min(stepCount - 1, target)))
    },
    [stepCount],
  )

  const togglePlay = () => {
    if (playing) {
      setPlaying(false)
      return
    }
    if (step >= stepCount - 1) setStep(0)
    setPlaying(true)
  }

  const replay = () => {
    setStep(0)
    setPlaying(!prefersReducedMotion)
  }

  return {
    step,
    stepCount,
    playing,
    goTo,
    next: () => goTo(step + 1),
    prev: () => goTo(step - 1),
    togglePlay,
    replay,
  }
}

export function storyKeyHandler(player: StoryPlayer) {
  return (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      player.next()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      player.prev()
    }
  }
}
