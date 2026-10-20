import { useEffect } from 'react'
import { MotionConfig, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, BadgeCheck, Bell, Database, Lock, Route, ShieldCheck, Sparkles, Terminal, Webhook, Wrench, type LucideIcon } from 'lucide-react'
import { PROJECTS, projectHref, type Project } from '../../data/projects'
import { ACCENTS } from './accents'
import StoryFrame from './StoryFrame'
import TrainStory from './TrainStory'
import FlightStory from './FlightStory'
import AgentStory from './AgentStory'

const BUILT_ICONS: Record<string, LucideIcon[]> = {
  mindpilot: [Sparkles, ShieldCheck, Lock, Wrench, Route],
  'flight-alerts': [BadgeCheck, Webhook, Database, Lock, ShieldCheck],
  'train-alerts': [Lock, Route, Bell, ShieldCheck, Wrench],
}

const STORY_TITLES: Record<string, string> = {
  mindpilot: 'Agent story · live demo',
  'flight-alerts': 'Flight story · DEL → BOM',
  'train-alerts': 'Journey story · PNR to arrival',
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.4, ease: 'easeOut' },
} as const

export default function ProjectPage({ project }: { project: Project }) {
  const accent = ACCENTS[project.accent]
  const index = PROJECTS.findIndex((p) => p.slug === project.slug)
  const next = PROJECTS[(index + 1) % PROJECTS.length]
  const icons = BUILT_ICONS[project.slug] ?? []

  useEffect(() => {
    window.scrollTo(0, 0)
    const previousTitle = document.title
    document.title = `${project.shortTitle} — Sandeep Makwana`
    return () => {
      document.title = previousTitle
    }
  }, [project])

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#0B1120] text-slate-100">
        <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0B1120]/85 backdrop-blur">
          <div className="container mx-auto px-6 py-3 flex items-center justify-between">
            <a href="#/projects" className="inline-flex items-center gap-2 min-h-[44px] font-mono text-sm text-green-400 hover:text-green-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to projects
            </a>
            <a href="#/" className="inline-flex items-center gap-2 min-h-[44px] font-mono text-sm text-slate-400 hover:text-slate-200 transition-colors" aria-label="Go to home page">
              <Terminal className="w-5 h-5 text-green-500" />
              <span className="hidden sm:inline">Sandeep Makwana</span>
            </a>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12 max-w-6xl space-y-14">
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
            <span className={`inline-block rounded-md border ${accent.border} ${accent.bg} px-3 py-1 font-mono text-xs tracking-widest ${accent.text}`}>
              CASE STUDY {project.id}
            </span>
            <h1 className="mt-4 font-mono text-4xl md:text-6xl font-bold text-white">{project.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{project.description}</p>
            <p className="mt-3 font-mono text-sm text-slate-400">My role: {project.role}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <span key={tech} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-300">
                  {tech}
                </span>
              ))}
            </div>
          </motion.section>

          <StoryFrame title={STORY_TITLES[project.slug] ?? 'Story'} accent={accent}>
            {({ active, playKey }) => (
              <>
                {project.slug === 'train-alerts' && <TrainStory active={active} playKey={playKey} />}
                {project.slug === 'flight-alerts' && <FlightStory active={active} playKey={playKey} />}
                {project.slug === 'mindpilot' && <AgentStory active={active} playKey={playKey} />}
              </>
            )}
          </StoryFrame>

          <motion.section {...fadeUp} className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-6">
              <h2 className="font-mono text-sm uppercase tracking-widest text-green-400">The problem</h2>
              <p className="mt-3 leading-7 text-slate-300">{project.useCase}</p>
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-6">
              <h2 className="font-mono text-sm uppercase tracking-widest text-sky-400">How it works</h2>
              <p className="mt-3 leading-7 text-slate-300">{project.howItWorks}</p>
            </div>
          </motion.section>

          <section>
            <motion.h2 {...fadeUp} className="font-mono text-2xl font-bold text-white">What I built</motion.h2>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.built.map((item, i) => {
                const Icon = icons[i] ?? Sparkles
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.35, ease: 'easeOut', delay: i * 0.05 }}
                    className={`rounded-xl border border-slate-700/60 bg-slate-900/70 p-5 hover:border-slate-500 transition-colors`}
                  >
                    <Icon className={`w-6 h-6 ${accent.text}`} />
                    <h3 className="mt-3 font-mono text-sm font-semibold text-slate-100">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
                  </motion.div>
                )
              })}
            </div>
          </section>

          <motion.a
            {...fadeUp}
            href={projectHref(next.slug)}
            className="group flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-900/70 p-6 hover:border-slate-500 transition-colors"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-slate-500">Next project</p>
              <p className={`mt-2 font-mono text-xl font-bold ${ACCENTS[next.accent].text}`}>{next.shortTitle}</p>
            </div>
            <ArrowRight className="w-6 h-6 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-200 transition-transform" />
          </motion.a>
        </main>
      </div>
    </MotionConfig>
  )
}
