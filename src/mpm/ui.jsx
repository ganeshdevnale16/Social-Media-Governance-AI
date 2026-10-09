import { CircleCheck, LoaderCircle } from 'lucide-react'
import { SOURCES } from './mockData.js'
import { STAGES, useMpm } from './MpmContext.jsx'

export const GREEN = '#86bc25'
export const RED = '#DA291C'
export const POS = '#1D9E75'
export const AMBER = '#BA7517'

export function Card({ title, subtitle, right, children, className = '' }) {
  return (
    <div className={`border border-neutral-200 bg-white p-5 shadow-sm ${className}`}>
      {(title || right) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-base font-semibold text-neutral-900">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  )
}

export function PageHeader({ title, subtitle, right }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
        {subtitle && <p className="mt-0.5 max-w-3xl text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}


export function DirTag({ dir }) {
  const map = {
    positive: ['bg-emerald-50 text-emerald-700 border-emerald-200', 'Positive'],
    negative: ['bg-red-50 text-red-700 border-red-200', 'Negative'],
    neutral: ['bg-neutral-50 text-neutral-600 border-neutral-200', 'Neutral'],
  }
  const [cls, label] = map[dir] || map.neutral
  return <span className={`inline-block border px-1.5 py-0.5 text-[11px] font-medium ${cls}`}>{label}</span>
}

export function VerdictBadge({ verdict, size = 'sm' }) {
  const yes = verdict === 'YES'
  return (
    <span
      className={`inline-block font-semibold ${size === 'lg' ? 'px-3 py-1 text-base' : 'px-2 py-0.5 text-[11px]'} ${yes ? 'bg-[#DA291C] text-white' : 'bg-[#86bc25] text-white'}`}
    >
      Material: {yes ? 'Yes' : 'No'}
    </span>
  )
}

export function SourceIcon({ name, size = 16 }) {
  const ctx = useMpm()
  const s = (ctx?.sources || SOURCES).find((x) => x.label === name)
  if (s?.logo) return <img src={s.logo} alt="" style={{ width: size, height: size }} className="shrink-0 object-contain" />
  return (
    <span className="inline-flex shrink-0 items-center justify-center bg-neutral-800 text-[8px] font-bold text-white" style={{ width: size, height: size }}>
      {(s?.badge || '•').slice(0, 4)}
    </span>
  )
}

const fmtSec = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

export function StageTracker({ stage, compact = false, triggerAt }) {
  const last = STAGES.length - 1
  if (compact) {
    return (
      <ol className="grid grid-cols-6 gap-1">
        {STAGES.map((s, i) => {
          const done = i < stage || stage === last
          const active = i === stage && stage !== last
          return <li key={s.key} title={s.label} className={`h-1.5 ${done ? 'bg-[#86bc25]' : active ? 'bg-amber-400 animate-pulse' : 'bg-neutral-200'}`} />
        })}
      </ol>
    )
  }
  const progress = stage >= last ? 100 : (stage / last) * 100
  return (
    <div className="overflow-x-auto">
      <div className="relative min-w-[760px] px-2 pt-1">
        {/* connector line */}
        <div className="absolute left-[calc(100%/12)] right-[calc(100%/12)] top-[21px] h-[3px] bg-neutral-200">
          <div className="h-full bg-[#86bc25] transition-[width] duration-700 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <ol className="relative grid grid-cols-6">
          {STAGES.map((s, i) => {
            const done = i < stage || stage === last
            const active = i === stage && stage !== last
            const at = triggerAt ? new Date(new Date(triggerAt).getTime() + s.at) : null
            return (
              <li key={s.key} className="flex flex-col items-center px-2 text-center">
                <span
                  className={`relative z-10 flex size-[42px] items-center justify-center rounded-full border-[3px] text-sm font-bold transition-colors duration-300 ${
                    done ? 'border-[#86bc25] bg-[#86bc25] text-white'
                      : active ? 'border-amber-400 bg-white text-amber-600'
                        : 'border-neutral-200 bg-white text-neutral-400'}`}
                >
                  {done ? <CircleCheck className="size-5" /> : active ? <LoaderCircle className="size-5 animate-spin" /> : i + 1}
                  {active && <span className="absolute inset-[-6px] animate-ping rounded-full border-2 border-amber-300 opacity-60" />}
                </span>
                <p className={`mt-2.5 text-[13px] font-semibold leading-snug ${done || active ? 'text-neutral-900' : 'text-neutral-400'}`}>{s.label}</p>
                <p className={`mt-0.5 text-[11px] ${done ? 'text-[#5d8a12]' : active ? 'text-amber-600' : 'text-neutral-400'}`}>
                  {done ? (at ? fmtSec(at) : 'Done') : active ? 'In progress' : 'Waiting'}
                </p>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

export function Sparkline({ data, color, width = 120, height = 32 }) {
  if (!data?.length) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const r = max - min || 1
  const d = data.map((v, i) => `${i ? 'L' : 'M'}${((i / (data.length - 1)) * width).toFixed(1)} ${(height - ((v - min) / r) * height).toFixed(1)}`).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" />
    </svg>
  )
}
