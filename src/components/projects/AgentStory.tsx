import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Check, CheckCircle2, Code2, Globe2, Loader2, Server, ShieldAlert, ShoppingCart, Smartphone, User, Wrench, XCircle } from 'lucide-react'
import { useStorySteps } from './useStorySteps'

type Mode = 'agent' | 'ask'

const TOOL_STEPS = ['LLM planner → search_restaurants', 'get_menu', 'add_to_cart']

const BUILT_NOTES: Record<Mode, string> = {
  agent: 'The planner fills each MCP tool\'s arguments from its JSON schema, and checkout is blocked until the user confirms.',
  ask: 'Request middleware hides LLMs an admin has blocked for the user\'s country; rules are managed from an admin UI.',
}

const appear = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
} as const

export default function AgentStory({ active, playKey }: { active: boolean; playKey: number }) {
  const [mode, setMode] = useState<Mode>('agent')

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Assistant mode" className="inline-flex rounded-lg border border-slate-700 p-1 font-mono text-sm">
        {(['ask', 'agent'] as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 min-h-[40px] rounded-md capitalize transition-colors cursor-pointer ${mode === m ? 'bg-violet-500/20 text-violet-300' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {m} mode
          </button>
        ))}
      </div>
      <StoryRun key={`${mode}-${playKey}`} mode={mode} active={active} />
    </div>
  )
}

function StoryRun({ mode, active }: { mode: Mode; active: boolean }) {
  const lastStep = mode === 'agent' ? 5 : 3
  const step = useStorySteps(lastStep, 1100, active, 0)
  const [decision, setDecision] = useState<'confirmed' | 'cancelled' | null>(null)

  return (
    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
      <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 p-4 min-h-[420px] space-y-3">
        {mode === 'agent' ? (
          <AgentChat step={step} decision={decision} onDecide={setDecision} />
        ) : (
          <AskChat step={step} />
        )}
      </div>

      <div className="space-y-4">
        <Architecture mode={mode} step={step} />
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 px-4 py-3 flex gap-3">
          <Code2 className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-200 leading-6">
            <span className="font-mono text-violet-400">What I built: </span>
            {BUILT_NOTES[mode]}
          </p>
        </div>
      </div>
    </div>
  )
}

function UserBubble({ children }: { children: ReactNode }) {
  return (
    <motion.div {...appear} className="flex justify-end gap-2">
      <p className="max-w-[80%] rounded-2xl rounded-tr-sm bg-violet-500/20 border border-violet-500/30 px-3 py-2 text-sm text-slate-100">{children}</p>
      <User className="w-6 h-6 p-1 rounded-full bg-slate-800 text-slate-300 shrink-0" />
    </motion.div>
  )
}

function StepChip({ label, done, icon }: { label: string; done: boolean; icon: ReactNode }) {
  return (
    <motion.div {...appear} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-xs text-slate-300">
      <span className="flex items-center gap-2">{icon}{label}</span>
      {done ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />}
    </motion.div>
  )
}

function AgentChat({ step, decision, onDecide }: { step: number; decision: 'confirmed' | 'cancelled' | null; onDecide: (d: 'confirmed' | 'cancelled') => void }) {
  return (
    <>
      <UserBubble>Order a paneer wrap from somewhere nearby</UserBubble>

      {TOOL_STEPS.map((label, i) =>
        step >= i + 1 ? (
          <StepChip key={label} label={i === 0 ? label : `tool: ${label}`} done={step > i + 1} icon={<Wrench className="w-3.5 h-3.5 text-violet-400" />} />
        ) : null,
      )}

      {step >= 4 && (
        <motion.div {...appear} className="rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs font-mono text-slate-300 space-y-1.5">
          <p className="flex items-center gap-2 text-slate-200"><ShoppingCart className="w-3.5 h-3.5 text-violet-400" /> Cart · Paneer Wrap</p>
          <p className="flex justify-between"><span>Paneer Wrap × 1</span><span>₹229.00</span></p>
          <p className="flex justify-between"><span>Taxes & fees</span><span>₹28.40</span></p>
          <p className="flex justify-between border-t border-slate-700 pt-1.5 text-green-400"><span>Total</span><span>₹257.40</span></p>
        </motion.div>
      )}

      {step >= 5 && (
        <AnimatePresence mode="wait">
          {decision === null ? (
            <motion.div key="gate" {...appear} exit={{ opacity: 0 }} className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
              <p className="flex items-center gap-2 font-mono text-xs text-amber-400"><ShieldAlert className="w-4 h-4" /> Human-in-the-loop gate</p>
              <p className="mt-1 text-sm text-slate-200">Place this order? The agent will not check out without your OK.</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => onDecide('confirmed')} className="min-h-[40px] px-4 rounded-md bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition-colors cursor-pointer">Confirm</button>
                <button onClick={() => onDecide('cancelled')} className="min-h-[40px] px-4 rounded-md border border-slate-600 text-slate-300 text-sm hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="result" {...appear} className="flex gap-2 items-start" aria-live="polite">
              <Bot className="w-6 h-6 p-1 rounded-full bg-violet-500/20 text-violet-300 shrink-0" />
              <p className="rounded-2xl rounded-tl-sm bg-slate-800 px-3 py-2 text-sm text-slate-100 flex items-center gap-2">
                {decision === 'confirmed' ? (
                  <><Check className="w-4 h-4 text-green-400" /> Order placed. Arriving in about 30 minutes.</>
                ) : (
                  <><XCircle className="w-4 h-4 text-slate-400" /> Cancelled — nothing was ordered.</>
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  )
}

const MODELS = [
  { name: 'Model A', allowed: true },
  { name: 'Model B', allowed: true },
  { name: 'Model C', allowed: false },
]

function AskChat({ step }: { step: number }) {
  return (
    <>
      <UserBubble>Which AI models can I use here?</UserBubble>
      {step >= 1 && <StepChip label="Region middleware · country = IN" done={step > 1} icon={<Globe2 className="w-3.5 h-3.5 text-violet-400" />} />}
      {step >= 2 && <StepChip label="Admin rule · Model C blocked in IN" done={step > 2} icon={<ShieldAlert className="w-3.5 h-3.5 text-amber-400" />} />}
      {step >= 3 && (
        <motion.div {...appear} className="rounded-lg border border-slate-700 bg-slate-900 p-3 space-y-2">
          <p className="font-mono text-xs text-slate-400">Available models</p>
          {MODELS.map((m) => (
            <p key={m.name} className={`flex items-center justify-between text-sm ${m.allowed ? 'text-slate-100' : 'text-slate-500 line-through'}`}>
              {m.name}
              {m.allowed ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <span className="font-mono text-[11px] no-underline text-amber-400">hidden in IN</span>}
            </p>
          ))}
        </motion.div>
      )}
    </>
  )
}

function Node({ icon, title, subtitle, lit }: { icon: ReactNode; title: string; subtitle: string; lit: boolean }) {
  return (
    <div className={`rounded-lg border px-3 py-2 transition-colors duration-300 ${lit ? 'border-violet-400/60 bg-violet-500/10' : 'border-slate-700 bg-slate-900'}`}>
      <div className={`flex items-center gap-2 text-xs font-semibold ${lit ? 'text-violet-200' : 'text-slate-400'}`}>{icon}{title}</div>
      <p className="font-mono text-[10px] text-slate-500 mt-0.5">{subtitle}</p>
    </div>
  )
}

function Edge({ lit, vertical = false }: { lit: boolean; vertical?: boolean }) {
  return (
    <div className={`${vertical ? 'w-0.5 h-6 mx-auto' : 'h-0.5 flex-1 min-w-4'} rounded-full transition-colors duration-300 ${lit ? 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]' : 'bg-slate-700'}`} />
  )
}

function Architecture({ mode, step }: { mode: Mode; step: number }) {
  const agentLit = mode === 'agent'
  const toolsLit = agentLit && step >= 1 && step <= 4
  const askLit = mode === 'ask'

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 p-4">
      <p className="font-mono text-xs text-slate-400 mb-3">Architecture</p>
      <div className="flex items-center gap-2">
        <Node icon={<Smartphone className="w-3.5 h-3.5" />} title="Phone" subtitle="assistant app" lit />
        <Edge lit={agentLit} />
        <Node icon={<Server className="w-3.5 h-3.5" />} title="Agent gateway" subtitle="Java · Spring Boot" lit={agentLit} />
        <Edge lit={toolsLit} />
        <Node icon={<Wrench className="w-3.5 h-3.5" />} title="Partner tools" subtitle="MCP server" lit={toolsLit} />
      </div>
      <div className="w-[88px]">
        <Edge lit={askLit} vertical />
      </div>
      <div className="w-fit">
        <Node icon={<Bot className="w-3.5 h-3.5" />} title="Ask service" subtitle="Python · multi-LLM · SSE" lit={askLit} />
      </div>
    </div>
  )
}
