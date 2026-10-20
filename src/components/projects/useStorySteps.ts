import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Advances from step 0 to `lastStep` every `intervalMs` once `active` is true.
 * Changing `playKey` restarts the sequence; reduced-motion users see the final step at once.
 */
export function useStorySteps(lastStep: number, intervalMs: number, active: boolean, playKey: number) {
  const prefersReducedMotion = useReducedMotion()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!active) return
    if (prefersReducedMotion) {
      setStep(lastStep)
      return
    }
    setStep(0)
    const timer = setInterval(() => {
      setStep((current) => {
        if (current >= lastStep) {
          clearInterval(timer)
          return current
        }
        return current + 1
      })
    }, intervalMs)
    return () => clearInterval(timer)
  }, [active, playKey, lastStep, intervalMs, prefersReducedMotion])

  return step
}
