import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { projectHref, type Project } from '../../data/projects'
import { ACCENTS } from './accents'
import ProjectCardPreview from './ProjectCardPreview'

export default function ProjectCard({ project, index, isDarkMode }: { project: Project; index: number; isDarkMode: boolean }) {
  const accent = ACCENTS[project.accent]
  const [hovered, setHovered] = useState(false)

  return (
    <motion.a
      href={projectHref(project.slug)}
      aria-label={`View the ${project.shortTitle} project and its interactive story`}
      className={`group relative flex flex-col rounded-xl border ${accent.border} ${accent.hoverCard} p-5 overflow-hidden shadow-lg shadow-transparent transition-[border-color,box-shadow] duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/80
        ${isDarkMode ? 'bg-zinc-900/60' : 'bg-white'}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 24, delay: index * 0.05 } }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <span className={`absolute inset-x-0 top-0 h-0.5 ${accent.bgSolid}`} />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] transition-none group-hover:translate-x-[400%] group-hover:transition-transform group-hover:duration-700 motion-reduce:hidden"
      />

      <div className="flex items-start justify-between gap-2">
        <span className={`font-mono text-sm ${accent.text}`}>{project.id}</span>
        <span className={`inline-flex items-center gap-1 rounded-full border ${accent.border} ${accent.bg} px-2 py-0.5 font-mono text-[10px] ${accent.text}`}>
          <Play className="w-2.5 h-2.5 fill-current" />
          Interactive story
        </span>
      </div>
      <h3 className={`mt-2 text-xl font-bold font-mono ${isDarkMode ? 'text-white' : 'text-black'}`}>{project.shortTitle}</h3>
      <p className="mt-1 font-mono text-xs text-zinc-500">{project.meta}</p>
      <p className={`mt-3 text-sm leading-6 ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>{project.tagline}</p>
      <div className="mt-4">
        <ProjectCardPreview slug={project.slug} hovered={hovered} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tech.slice(0, 4).map((tech) => (
          <span key={tech} className={`rounded-md border ${accent.border} px-2 py-0.5 font-mono text-[11px] ${accent.text}`}>
            {tech}
          </span>
        ))}
      </div>
      <span className="mt-auto pt-5">
        <span className={`inline-flex min-h-[44px] items-center gap-2 rounded-full ${accent.bgSolid} px-4 font-mono text-sm font-semibold text-slate-950 shadow-lg ${accent.glow} transition-[filter] duration-300 group-hover:brightness-110`}>
          View project
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </span>
    </motion.a>
  )
}
