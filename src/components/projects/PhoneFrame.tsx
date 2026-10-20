import type { ReactNode } from 'react'

interface PhoneFrameProps {
  children: ReactNode
  label: string
  overlay?: ReactNode
}

export default function PhoneFrame({ children, label, overlay }: PhoneFrameProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className="relative mx-auto w-[250px] h-[500px] rounded-[2.4rem] border-[6px] border-slate-700 bg-gradient-to-b from-slate-900 via-slate-950 to-[#0b1022] shadow-2xl shadow-black/60 overflow-hidden"
    >
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-black z-30" />
      <div className="flex items-center justify-between px-6 pt-3 text-[10px] font-mono text-slate-400">
        <span>9:41</span>
        <span>5G</span>
      </div>
      <div className="px-3 pt-5">{children}</div>
      {overlay && <div className="absolute inset-x-2 top-8 z-20">{overlay}</div>}
    </div>
  )
}
