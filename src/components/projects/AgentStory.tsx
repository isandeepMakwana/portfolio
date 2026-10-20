import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUp, Bot, Brain, Check, Cpu, FileText, Folder, Server, Smartphone, Sparkles, type LucideIcon } from 'lucide-react'
import PhoneFrame from './PhoneFrame'
import StoryControls from './StoryControls'
import { StepCaption } from './StoryParts'
import { ACCENTS } from './accents'
import { storyKeyHandler, useStoryPlayer } from './useStoryPlayer'

const accent = ACCENTS.violet

type Mode = 'agent' | 'ask'

type Zone = 'phone' | 'cloud' | 'partners'

interface LaneNode {
  id: string
  label: string
  zone: Zone
  y: number
  icon: LucideIcon
}

interface LaneEdge {
  from: string
  to: string
  label?: string
  stream?: boolean
}

interface MindStep {
  label: string
  title: string
  text: string
  nodes: string[]
  edges: LaneEdge[]
  note?: { node: string; text: string; below?: boolean }
}

const AGENT_NODES: LaneNode[] = [
  { id: 'phone', label: 'MindPilot app', zone: 'phone', y: 60, icon: Smartphone },
  { id: 'device', label: 'On-device agent', zone: 'phone', y: 125, icon: Cpu },
  { id: 'files', label: 'Your files', zone: 'phone', y: 192, icon: Folder },
  { id: 'gateway', label: 'Agent gateway · Java', zone: 'cloud', y: 92, icon: Server },
  { id: 'manus', label: 'Manus', zone: 'partners', y: 70, icon: Bot },
  { id: 'chatgpt', label: 'ChatGPT', zone: 'partners', y: 150, icon: Bot },
]

const AGENT_STEPS: MindStep[] = [
  { label: 'Pick an agent', title: 'Agent mode', text: 'New in ColorOS 17, powered by Manus and ChatGPT.', nodes: ['phone'], edges: [] },
  {
    label: 'Say it', title: 'Say it', text: 'One sentence describes the whole goal.',
    nodes: ['phone', 'gateway'], edges: [{ from: 'phone', to: 'gateway', label: 'goal' }],
  },
  {
    label: 'Allow files', title: 'You stay in control', text: 'The agent only touches files you allow, and it works on them on the phone.',
    nodes: ['phone', 'device', 'files'],
    edges: [{ from: 'phone', to: 'device', label: 'permission' }],
    note: { node: 'files', text: 'stays on phone', below: true },
  },
  {
    label: 'Free allowance', title: 'Free to start', text: 'OPPO includes a free allowance, or you can connect your own account.',
    nodes: ['gateway'], edges: [], note: { node: 'gateway', text: 'quota check' },
  },
  {
    label: 'Plan', title: 'It plans first', text: 'The cloud agent breaks the goal into steps.',
    nodes: ['gateway', 'manus'], edges: [{ from: 'gateway', to: 'manus', label: 'plan' }],
  },
  {
    label: 'Live progress', title: 'Cloud plans, phone acts', text: 'Each next step streams down to the phone. The on-device agent carries it out and finds your bookings locally.',
    nodes: ['manus', 'gateway', 'device', 'files'],
    edges: [
      { from: 'manus', to: 'gateway', label: 'next step', stream: true },
      { from: 'gateway', to: 'device', label: 'steps', stream: true },
      { from: 'device', to: 'files', label: 'read' },
    ],
    note: { node: 'files', text: 'stays on phone', below: true },
  },
  {
    label: 'Rename files', title: 'Renamed on your phone', text: 'Files are read and renamed on the phone, not stored in the cloud.',
    nodes: ['device', 'files'], edges: [{ from: 'device', to: 'files', label: 'rename' }],
    note: { node: 'files', text: 'stays on phone', below: true },
  },
  {
    label: 'Solved', title: 'Solved it', text: 'An itinerary built from your files and the web, saved on your phone.',
    nodes: ['device', 'phone', 'files'],
    edges: [{ from: 'device', to: 'phone', label: 'itinerary' }],
    note: { node: 'files', text: 'stays on phone', below: true },
  },
]

const ASK_NODES: LaneNode[] = [
  { id: 'phone', label: 'MindPilot app', zone: 'phone', y: 105, icon: Smartphone },
  { id: 'ask', label: 'Ask service · Python', zone: 'cloud', y: 105, icon: Server },
  { id: 'mind', label: 'Mind Space notes', zone: 'cloud', y: 190, icon: Brain },
  { id: 'gemini', label: 'Gemini', zone: 'partners', y: 60, icon: Bot },
  { id: 'perplexity', label: 'Perplexity', zone: 'partners', y: 105, icon: Bot },
  { id: 'chatgpt', label: 'ChatGPT', zone: 'partners', y: 150, icon: Bot },
  { id: 'backup', label: 'Backup model', zone: 'partners', y: 195, icon: Bot },
]

const ASK_STEPS: MindStep[] = [
  { label: 'Ask mode', title: 'Ask mode', text: 'Launched in ColorOS 16.', nodes: ['phone'], edges: [] },
  {
    label: 'Ask', title: 'Ask anything', text: 'The question goes to the Ask service.',
    nodes: ['phone', 'ask'], edges: [{ from: 'phone', to: 'ask', label: 'question' }],
  },
  {
    label: 'Understand', title: 'Understands the question', text: 'A safety check runs first, then the service detects intent and picks the right models.',
    nodes: ['ask'], edges: [], note: { node: 'ask', text: 'safety · intent · models' },
  },
  {
    label: 'Mind Space', title: 'Remembers what you saved', text: 'Only the most relevant Mind Space notes are added to the question.',
    nodes: ['ask', 'mind'], edges: [{ from: 'mind', to: 'ask', label: 'relevant notes' }],
  },
  {
    label: 'Three answers', title: 'Three answers, side by side', text: 'All three stream at once, with no waiting for the slowest.',
    nodes: ['ask', 'gemini', 'perplexity', 'chatgpt', 'phone'],
    edges: [
      { from: 'gemini', to: 'ask', stream: true },
      { from: 'perplexity', to: 'ask', label: 'parallel streams', stream: true },
      { from: 'chatgpt', to: 'ask', stream: true },
      { from: 'ask', to: 'phone', label: 'live stream', stream: true },
    ],
  },
  { label: 'Compare', title: 'Compare and choose', text: 'Sources sit next to the answer, and the user picks the one they like.', nodes: ['phone'], edges: [] },
  {
    label: 'Never stuck', title: 'Never stuck', text: 'If a model is slow to start, the cloud quietly swaps in another. The phone keeps streaming.',
    nodes: ['ask', 'backup', 'phone'],
    edges: [{ from: 'backup', to: 'ask', label: 'backup', stream: true }, { from: 'ask', to: 'phone', label: 'live stream', stream: true }],
    note: { node: 'ask', text: 'slow start → swap' },
  },
]

const MODES: Record<Mode, { label: string; nodes: LaneNode[]; steps: MindStep[] }> = {
  agent: { label: 'Agent mode · ColorOS 17', nodes: AGENT_NODES, steps: AGENT_STEPS },
  ask: { label: 'Ask mode · ColorOS 16', nodes: ASK_NODES, steps: ASK_STEPS },
}

export default function AgentStory({ active }: { active: boolean }) {
  const [mode, setMode] = useState<Mode>('agent')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a MindPilot mode">
        {(Object.keys(MODES) as Mode[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            aria-pressed={mode === key}
            className={`min-h-[44px] rounded-lg border px-3 font-mono text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/80 ${
              mode === key ? `${accent.border} ${accent.bg} ${accent.text}` : 'border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {MODES[key].label}
          </button>
        ))}
      </div>
      <MindRun key={mode} mode={mode} active={active} />
    </div>
  )
}

function MindRun({ mode, active }: { mode: Mode; active: boolean }) {
  const { nodes, steps } = MODES[mode]
  const player = useStoryPlayer(steps.length, 2200, active)
  const current = steps[player.step]

  return (
    <div
      tabIndex={0}
      aria-label={`MindPilot ${mode} story player. Use the left and right arrow keys to change steps.`}
      className="grid lg:grid-cols-[1fr_260px] gap-8 items-start rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
      onKeyDown={storyKeyHandler(player)}
    >
      <div className="space-y-6 min-w-0">
        <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {steps.map((s, i) => (
            <li
              key={s.label}
              className={`rounded-lg border px-2.5 py-2 font-mono text-[11px] transition-colors duration-300 ${
                i === player.step ? `${accent.border} ${accent.bg} ${accent.text}` : i < player.step ? 'border-slate-700 text-slate-300' : 'border-slate-800 text-slate-500'
              }`}
            >
              <span className="text-slate-500">{String(i + 1).padStart(2, '0')}</span> {s.label}
            </li>
          ))}
        </ol>

        <StepCaption id={`${mode}-${player.step}`} title={current.title} text={current.text} accent={accent} />
        <CloudLane mode={mode} nodes={nodes} step={current} stepKey={`${mode}-${player.step}`} />
        <StoryControls player={player} labels={steps.map((s) => s.label)} accent={accent} />
      </div>

      <PhoneFrame label={`MindPilot ${mode === 'agent' ? 'Agent' : 'Ask'} mode: ${current.title}`}>
        {mode === 'agent' ? <AgentScreen step={player.step} /> : <AskScreen step={player.step} />}
      </PhoneFrame>
    </div>
  )
}

const ZONES: { id: Zone; label: string; x: number }[] = [
  { id: 'phone', label: 'On your phone', x: 115 },
  { id: 'cloud', label: 'OPPO cloud', x: 345 },
  { id: 'partners', label: 'AI partners', x: 575 },
]
const ZONE_W = 214
const NODE_W = 184
const NODE_H = 36
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'

const zoneX = (zone: Zone) => ZONES.find((z) => z.id === zone)?.x ?? 0

const BASE_LINKS: Record<Mode, [string, string][]> = {
  agent: [['phone', 'gateway'], ['phone', 'device'], ['device', 'gateway'], ['device', 'files'], ['gateway', 'manus'], ['gateway', 'chatgpt']],
  ask: [['phone', 'ask'], ['ask', 'mind'], ['ask', 'gemini'], ['ask', 'perplexity'], ['ask', 'chatgpt'], ['ask', 'backup']],
}

function CloudLane({ mode, nodes, step, stepKey }: { mode: Mode; nodes: LaneNode[]; step: MindStep; stepKey: string }) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const point = (id: string) => ({ x: zoneX(byId[id].zone), y: byId[id].y })
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-3">
      <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">Behind the screen</p>

      <svg viewBox="0 0 690 248" className="mt-2 hidden sm:block w-full h-auto" aria-hidden="true">
        {ZONES.map((zone) => (
          <g key={zone.id}>
            <rect x={zone.x - ZONE_W / 2} y="4" width={ZONE_W} height="240" rx="12" fill="rgba(148,163,184,0.04)" stroke="#1e293b" />
            <text x={zone.x} y="24" textAnchor="middle" fontSize="10" letterSpacing="2" fontFamily={MONO} fill="#64748b">
              {zone.label.toUpperCase()}
            </text>
          </g>
        ))}

        {BASE_LINKS[mode].map(([from, to]) => {
          const a = point(from)
          const b = point(to)
          return <line key={`${from}-${to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#334155" strokeWidth="1.5" strokeDasharray="4 5" />
        })}

        {step.edges.map((edge) => {
          const a = point(edge.from)
          const b = point(edge.to)
          return (
            <g key={`${stepKey}-${edge.from}-${edge.to}`}>
              <motion.path
                d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`}
                stroke={accent.hex}
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
              {!prefersReducedMotion && (edge.stream ? [0, 0.33, 0.66] : [0]).map((delay) => (
                <motion.circle
                  key={delay}
                  r={edge.stream ? 3 : 4}
                  fill={accent.hex}
                  initial={{ cx: a.x, cy: a.y, opacity: 0 }}
                  animate={{ cx: [a.x, b.x], cy: [a.y, b.y], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear', delay: 0.45 + delay }}
                />
              ))}
            </g>
          )
        })}

        {nodes.map((n) => {
          const on = step.nodes.includes(n.id)
          const x = zoneX(n.zone)
          const Icon = n.icon
          return (
            <g key={n.id}>
              <rect
                x={x - NODE_W / 2}
                y={n.y - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx="9"
                fill={on ? '#1e1533' : '#0f172a'}
                stroke={on ? accent.hex : '#334155'}
                strokeWidth="1.5"
                style={{ transition: 'fill 300ms, stroke 300ms' }}
              />
              <Icon x={x - NODE_W / 2 + 12} y={n.y - 8} width={16} height={16} color={on ? '#c4b5fd' : '#475569'} strokeWidth={2} />
              <text x={x - NODE_W / 2 + 36} y={n.y + 4} fontSize="12" fontFamily={MONO} fill={on ? '#ede9fe' : '#64748b'} style={{ transition: 'fill 300ms' }}>
                {n.label}
              </text>
              {step.note?.node === n.id && (
                <motion.g key={stepKey} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                  <rect
                    x={x - 70}
                    y={step.note.below ? n.y + NODE_H / 2 + 6 : n.y - NODE_H / 2 - 24}
                    width="140"
                    height="18"
                    rx="9"
                    fill="#2e1065"
                    stroke={accent.hex}
                    strokeOpacity="0.6"
                  />
                  <text x={x} y={step.note.below ? n.y + NODE_H / 2 + 19 : n.y - NODE_H / 2 - 11} textAnchor="middle" fontSize="10" fontFamily={MONO} fill="#ddd6fe">
                    {step.note.text}
                  </text>
                </motion.g>
              )}
            </g>
          )
        })}

        {step.edges
          .filter((edge) => edge.label)
          .map((edge) => {
            const a = point(edge.from)
            const b = point(edge.to)
            const mx = (a.x + b.x) / 2
            const my = (a.y + b.y) / 2
            const w = (edge.label?.length ?? 0) * 6.4 + 14
            return (
              <motion.g key={`${stepKey}-label-${edge.from}-${edge.to}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                <rect x={mx - w / 2} y={my - 9} width={w} height="18" rx="9" fill="#0b1120" stroke={accent.hex} strokeOpacity="0.5" />
                <text x={mx} y={my + 3.5} textAnchor="middle" fontSize="10" fontFamily={MONO} fill="#c4b5fd">
                  {edge.label}
                </text>
              </motion.g>
            )
          })}
      </svg>

      <div className="mt-3 space-y-2 sm:hidden">
        {ZONES.map((zone) => (
          <div key={zone.id} className="rounded-lg border border-slate-800 bg-slate-900/40 p-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{zone.label}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {nodes
                .filter((n) => n.zone === zone.id)
                .map((n) => {
                  const on = step.nodes.includes(n.id)
                  const Icon = n.icon
                  return (
                    <span
                      key={n.id}
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] transition-colors duration-300 ${
                        on ? `${accent.border} ${accent.bg} text-violet-100` : 'border-slate-700 text-slate-500'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {n.label}
                      {step.note?.node === n.id && <span className="text-violet-300">· {step.note.text}</span>}
                    </span>
                  )
                })}
            </div>
          </div>
        ))}
        {step.edges.length > 0 && (
          <ul className="space-y-1 font-mono text-[11px] text-violet-200">
            {step.edges.map((edge) => (
              <li key={`${edge.from}-${edge.to}`}>
                {byId[edge.from].label} → {byId[edge.to].label}
                {edge.label && <span className="text-slate-400"> · {edge.label}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function ScreenHeader({ mode }: { mode: Mode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-white">
        <Sparkles className="w-3.5 h-3.5 text-violet-400" /> MindPilot
      </span>
      <span className="flex rounded-full bg-slate-800 p-0.5 text-[9px] font-semibold">
        <span className={`rounded-full px-2 py-0.5 ${mode === 'ask' ? 'bg-violet-500 text-white' : 'text-slate-400'}`}>Ask</span>
        <span className={`rounded-full px-2 py-0.5 ${mode === 'agent' ? 'bg-violet-500 text-white' : 'text-slate-400'}`}>Agent</span>
      </span>
    </div>
  )
}

const pop = {
  layout: true,
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
  transition: { duration: 0.35, ease: 'easeOut' },
} as const

const TYPE_SPEED = 22

function UserBubble({ text, afterTyping }: { text: string; afterTyping: boolean }) {
  return (
    <motion.div
      {...pop}
      transition={{ ...pop.transition, delay: afterTyping ? (text.length * TYPE_SPEED) / 1000 + 0.15 : 0 }}
      className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-violet-500 px-3 py-2 text-[11px] leading-4 text-white"
    >
      {text}
    </motion.div>
  )
}

function Composer({ placeholder, typing }: { placeholder: string; typing?: string }) {
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!typing) return
    setSent(false)
    const timer = setTimeout(() => setSent(true), typing.length * TYPE_SPEED + 150)
    return () => clearTimeout(timer)
  }, [typing])

  const showTyping = typing && !sent
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-2">
      <span className={`flex-1 truncate text-[10px] ${showTyping ? 'text-slate-100' : 'text-slate-500'}`}>
        {showTyping ? (
          <>
            <Typed text={typing} speed={TYPE_SPEED} />
            <span className="ml-px inline-block w-px h-3 align-middle bg-violet-300 animate-pulse" />
          </>
        ) : (
          placeholder
        )}
      </span>
      <span className="flex w-5 h-5 items-center justify-center rounded-full bg-violet-500">
        <ArrowUp className="w-3 h-3 text-white" />
      </span>
    </div>
  )
}

function Thinking({ label }: { label: string }) {
  return (
    <motion.div {...pop} className="flex items-center gap-2 self-start rounded-full bg-slate-800/80 px-2.5 py-1 text-[9px] text-slate-300">
      <span className="flex gap-0.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1 h-1 rounded-full bg-violet-300"
            animate={{ y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </span>
      {label}
    </motion.div>
  )
}

const PLAN = ['Find bookings', 'Read them', 'Rename files', 'Build itinerary']
const PLAN_DONE = [0, 0, 0, 0, 0, 2, 3, 4]

const FILES: [string, string][] = [
  ['IMG_2391.pdf', 'Flight_DEL-GOI_12Nov.pdf'],
  ['doc(3).pdf', 'Hotel_Calangute.pdf'],
  ['scan_0042.pdf', 'Train_GOI-MAO_15Nov.pdf'],
]

const AGENT_PROMPT = 'Organise my Goa trip files and make an itinerary.'

function AgentScreen({ step }: { step: number }) {
  const previouslyDone = step > 0 ? PLAN_DONE[step - 1] : 0

  return (
    <div className="relative h-[430px]">
      <ScreenHeader mode="agent" />
      <div className="absolute inset-x-0 top-8 bottom-11 flex flex-col justify-end gap-2 overflow-hidden pb-1">
        <AnimatePresence initial={false}>
        {step === 0 && (
          <motion.div key="picker" {...pop} className="space-y-3 text-center">
            <p className="text-[12px] text-slate-300">Choose an agent</p>
            <div className="flex justify-center gap-2 text-[10px]">
              <span className="rounded-full border border-violet-400 bg-violet-500/20 px-3 py-1 text-violet-200">Manus</span>
              <span className="rounded-full border border-slate-600 px-3 py-1 text-slate-300">ChatGPT</span>
            </div>
          </motion.div>
        )}
        {step >= 3 && (
          <motion.p key="allowance" {...pop} className="self-center rounded-full bg-slate-800 px-2.5 py-1 text-[9px] text-slate-300">
            Free allowance: 4 of 5 tasks left
          </motion.p>
        )}
        {step >= 1 && <UserBubble key="prompt" text={AGENT_PROMPT} afterTyping={step === 1} />}
        {step >= 4 && (
          <motion.div key="plan" {...pop} className="rounded-xl border border-slate-700 bg-slate-900 p-2.5">
            <p className="text-[10px] font-semibold text-slate-300">Plan</p>
            <ul className="mt-1.5 space-y-1">
              {PLAN.map((item, i) => {
                const done = i < PLAN_DONE[step]
                const tickDelay = Math.max(0, i - previouslyDone) * 0.4
                return (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: step === 4 ? i * 0.12 : 0 }}
                    className={`flex items-center gap-1.5 text-[10px] transition-colors duration-300 ${done ? 'text-slate-200' : 'text-slate-500'}`}
                  >
                    <span className="relative flex w-3.5 h-3.5 items-center justify-center rounded-full border border-slate-600">
                      <AnimatePresence>
                        {done && (
                          <motion.span
                            className="absolute inset-[-1px] flex items-center justify-center rounded-full bg-violet-500"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 18, delay: tickDelay }}
                          >
                            <Check className="w-2.5 h-2.5 text-white" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    {item}
                  </motion.li>
                )
              })}
            </ul>
          </motion.div>
        )}
        {(step === 4 || step === 5) && <Thinking key="thinking" label={step === 4 ? 'Manus is planning…' : 'Manus is working…'} />}
        {(step === 5 || step === 6) && (
          <motion.div key="files" {...pop} className="space-y-1">
            {FILES.map(([before, after], i) => (
              <motion.div
                key={before}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-2 py-1 text-[10px]"
              >
                <FileText className="w-3 h-3 shrink-0 text-violet-300" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={step === 6 ? after : before}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`truncate ${step === 6 ? 'text-violet-200' : 'text-slate-400'}`}
                  >
                    {step === 6 ? after : before}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
        {step === 7 && (
          <motion.div
            key="result"
            {...pop}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, boxShadow: ['0 0 0 0 rgba(139,92,246,0)', '0 0 24px 2px rgba(139,92,246,0.35)', '0 0 10px 0 rgba(139,92,246,0.15)'] }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="rounded-xl border border-violet-400/50 bg-violet-500/10 p-2.5"
          >
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-white">
              <Folder className="w-3.5 h-3.5 text-violet-300" /> Your 3-day Goa itinerary
            </p>
            <ul className="mt-1.5 space-y-0.5 text-[10px] text-slate-300">
              <li>Day 1 · Land 11:40, check in at Calangute</li>
              <li>Day 2 · Old Goa churches, Fontainhas walk</li>
              <li>Day 3 · Train to Madgaon 15:10</li>
            </ul>
            <div className="mt-2 flex gap-1.5 text-[9px]">
              <span className="rounded-full bg-violet-500 px-2 py-0.5 text-white">View webpage</span>
              <span className="rounded-full border border-slate-600 px-2 py-0.5 text-slate-300">Make slides</span>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
      <Composer placeholder="Say it and solve it" typing={step === 1 ? AGENT_PROMPT : undefined} />

      <AnimatePresence>
        {step === 2 && (
          <motion.div
            key="permission"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="absolute inset-x-[-12px] bottom-[-10px] rounded-t-3xl border-t border-slate-600 bg-slate-800 px-4 pt-4 pb-6"
          >
            <p className="text-[12px] font-semibold text-white">Allow MindPilot to access Files?</p>
            <p className="mt-1 text-[10px] text-slate-400">Used to find and organise your trip documents.</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <span className="rounded-full border border-slate-600 py-1.5 text-center text-slate-300">Deny</span>
              <span className="rounded-full bg-violet-500 py-1.5 text-center font-semibold text-white">Allow</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Typed({ text, speed, caret = false }: { text: string; speed: number; caret?: boolean }) {
  const reduced = useReducedMotion()
  const [count, setCount] = useState(reduced ? text.length : 0)

  useEffect(() => {
    if (reduced) {
      setCount(text.length)
      return
    }
    const timer = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(timer)
          return c
        }
        return c + 1
      })
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed, reduced])

  return (
    <>
      {text.slice(0, count)}
      {caret && count < text.length && <span className="ml-px inline-block w-1.5 h-2.5 align-middle bg-violet-300/80 animate-pulse" />}
    </>
  )
}

const ANSWERS = [
  { model: 'Gemini', text: 'Your note says: apply about 4 weeks before travel, with bank statements and a day-by-day plan.', speed: 22 },
  { model: 'Perplexity', text: 'A tourist visa is needed for Indian passport holders. Your saved checklist matches the official list.', speed: 30 },
  { model: 'ChatGPT', text: 'From your notes: passport, photo, itinerary, hotel bookings, last 6 months of bank statements.', speed: 26 },
]

const ASK_PROMPT = 'What did I save about Japan visa rules?'

function AskScreen({ step }: { step: number }) {
  return (
    <div className="relative h-[430px]">
      <ScreenHeader mode="ask" />
      <div className="absolute inset-x-0 top-8 bottom-11 flex flex-col justify-end gap-2 overflow-hidden pb-1">
        <AnimatePresence initial={false}>
        {step === 0 && (
          <motion.p key="hint" {...pop} className="text-center text-[12px] text-slate-300">
            Gemini · Perplexity · ChatGPT
          </motion.p>
        )}
        {step >= 1 && <UserBubble key="question" text={ASK_PROMPT} afterTyping={step === 1} />}
        {step === 2 && <Thinking key="checking" label="Checking your question…" />}
        {step >= 3 && (
          <motion.p key="mind" {...pop} className="flex items-center gap-1 self-start rounded-full bg-violet-500/15 px-2 py-0.5 text-[9px] text-violet-200">
            <Brain className="w-3 h-3" /> Using 2 notes from Mind Space
          </motion.p>
        )}
        {step >= 4 &&
          ANSWERS.map((a, i) => (
            <motion.div
              key={a.model}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-slate-700 bg-slate-900 p-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-violet-200">{a.model}</p>
                {step >= 5 && a.model === 'Perplexity' && <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[8px] text-slate-400">2 sources</span>}
              </div>
              <p className="mt-0.5 text-[10px] leading-[14px] text-slate-300">
                <Typed text={a.text} speed={a.speed} caret />
              </p>
            </motion.div>
          ))}
        {step >= 5 && (
          <motion.span key="compare" {...pop} className="self-center rounded-full bg-violet-500 px-3 py-1 text-[10px] font-semibold text-white">
            Compare side by side
          </motion.span>
        )}
        </AnimatePresence>
      </div>
      <Composer placeholder="Ask anything" typing={step === 1 ? ASK_PROMPT : undefined} />
    </div>
  )
}
