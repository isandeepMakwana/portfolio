import { Plane, TrainFront } from 'lucide-react'

export default function ProjectCardPreview({ slug }: { slug: string }) {
  if (slug === 'mindpilot') {
    return (
      <div className="h-24 flex flex-col justify-center gap-2 font-mono text-[10px] text-violet-300" aria-hidden="true">
        <span className="self-end rounded-xl rounded-tr-sm border border-violet-500/40 px-2 py-1">Order a paneer wrap</span>
        <div className="flex items-center gap-1.5">
          {['search_restaurants', 'get_menu', 'add_to_cart'].map((tool, i) => (
            <span key={tool} className="flex items-center gap-1.5">
              <span className="rounded border border-violet-500/40 px-1.5 py-0.5">{tool}</span>
              {i < 2 && <span className="text-violet-500/60">→</span>}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (slug === 'flight-alerts') {
    return (
      <div className="h-24 relative" aria-hidden="true">
        <svg viewBox="0 0 200 80" className="w-full h-full">
          <path d="M 15 65 Q 100 0 185 65" fill="none" stroke="#22d3ee" strokeOpacity="0.6" strokeWidth="1.5" strokeDasharray="4 5" />
          <circle cx="15" cy="65" r="4" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
          <circle cx="185" cy="65" r="4" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
        </svg>
        <Plane className="absolute left-[58%] top-[22%] w-6 h-6 text-cyan-300 rotate-45 transition-transform duration-300 group-hover:translate-x-2" />
      </div>
    )
  }

  return (
    <div className="h-24 relative flex items-center" aria-hidden="true">
      <div className="absolute left-0 right-0 top-1/2 h-px bg-green-500/50" />
      <div className="absolute left-0 right-0 top-1/2 flex justify-between">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="-mt-1 w-2 h-2 rounded-full bg-green-500/70" />
        ))}
      </div>
      <TrainFront className="relative left-[40%] -mt-8 w-7 h-7 text-green-300 transition-transform duration-300 group-hover:translate-x-3" />
    </div>
  )
}
