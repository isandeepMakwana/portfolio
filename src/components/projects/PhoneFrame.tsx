import type { ReactNode } from 'react'

export default function PhoneFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="relative mx-auto w-[220px] h-[420px] rounded-[2.2rem] border-[6px] border-slate-700 bg-slate-950 shadow-2xl shadow-black/60 overflow-hidden"
    >
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-black z-10" />
      <div className="flex items-center justify-between px-5 pt-3 text-[10px] font-mono text-slate-400">
        <span>9:41</span>
        <span>5G</span>
      </div>
      <div className="px-3 pt-6">{children}</div>
    </div>
  )
}
