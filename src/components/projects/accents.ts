import type { ProjectAccent } from '../../data/projects'

export interface AccentClasses {
  text: string
  bg: string
  bgSolid: string
  border: string
  ring: string
  glow: string
  stroke: string
  hex: string
  hoverCard: string
}

// Full class strings so Tailwind can find them in source.
export const ACCENTS: Record<ProjectAccent, AccentClasses> = {
  violet: {
    text: 'text-violet-400',
    bg: 'bg-violet-500/10',
    bgSolid: 'bg-violet-500',
    border: 'border-violet-500/30',
    ring: 'ring-violet-500/40',
    glow: 'shadow-violet-500/20',
    stroke: 'stroke-violet-400',
    hex: '#a78bfa',
    hoverCard: 'hover:border-violet-400/70 hover:shadow-violet-500/20',
  },
  cyan: {
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    bgSolid: 'bg-cyan-500',
    border: 'border-cyan-500/30',
    ring: 'ring-cyan-500/40',
    glow: 'shadow-cyan-500/20',
    stroke: 'stroke-cyan-400',
    hex: '#22d3ee',
    hoverCard: 'hover:border-cyan-400/70 hover:shadow-cyan-500/20',
  },
  green: {
    text: 'text-green-400',
    bg: 'bg-green-500/10',
    bgSolid: 'bg-green-500',
    border: 'border-green-500/30',
    ring: 'ring-green-500/40',
    glow: 'shadow-green-500/20',
    stroke: 'stroke-green-400',
    hex: '#4ade80',
    hoverCard: 'hover:border-green-400/70 hover:shadow-green-500/20',
  },
}
