import { useState, useRef, useEffect } from 'react'
import { IconChevronDown } from './icons.jsx'

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"]

const PRESETS = [
  { label: "Last 7 Days",    getValue: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate()-6); return [s,e] } },
  { label: "Last Week",      getValue: () => { const n = new Date(); const day = n.getDay(); const s = new Date(n); s.setDate(n.getDate()-day-6); const e = new Date(n); e.setDate(n.getDate()-day); return [s,e] } },
  { label: "Last 30 Days",   getValue: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate()-29); return [s,e] } },
  { label: "Last Month",     getValue: () => { const n = new Date(); return [new Date(n.getFullYear(),n.getMonth()-1,1), new Date(n.getFullYear(),n.getMonth(),0)] } },
  { label: "Last 3 Months",  getValue: () => { const e = new Date(); const s = new Date(); s.setMonth(s.getMonth()-3); return [s,e] } },
]

function isSameDay(a, b) {
  return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
}
function isBetween(d, s, e) {
  if (!s || !e) return false
  const start = s < e ? s : e
  const end   = s < e ? e : s
  return d > start && d < end
}
function formatDate(d) {
  if (!d) return ''
  return `${MONTHS[d.getMonth()].slice(0,3)} ${String(d.getDate()).padStart(2,'0')}, ${d.getFullYear()}`
}

function CalendarMonth({ year, month, startDate, endDate, hoverDate, onDayClick, onDayHover }) {
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  const todayStart   = new Date(); todayStart.setHours(0,0,0,0)
  const effectiveEnd = hoverDate && startDate && !endDate ? hoverDate : endDate

  return (
    <div className="w-full">
      <p className="mb-3 text-center text-sm font-semibold text-neutral-800">
        {MONTHS[month]} {year}
      </p>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-medium text-neutral-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />

          const isFuture = date > todayStart
          const isStart  = isSameDay(date, startDate)
          const isEnd    = isSameDay(date, effectiveEnd)
          const isBoth   = isSameDay(startDate, effectiveEnd) && isStart
          const inRange  = isBetween(date, startDate, effectiveEnd)
          const isToday  = isSameDay(date, todayStart)

          if (isFuture) {
            return (
              <div
                key={date.getTime()}
                className="text-center text-sm py-1.5 select-none text-neutral-300 cursor-not-allowed"
              >
                {date.getDate()}
              </div>
            )
          }

          let bg = ''
          let textCls = 'text-neutral-700'
          let radius = '  '

          if (isBoth)       { bg = 'bg-brand'; textCls = 'text-white font-semibold'; radius = '  ' }
          else if (isStart) { bg = 'bg-brand'; textCls = 'text-white font-semibold'; radius = ' ' }
          else if (isEnd)   { bg = 'bg-brand'; textCls = 'text-white font-semibold'; radius = ' ' }
          else if (inRange) { bg = 'bg-brand/10'; textCls = 'text-brand'; radius = 'rounded-none' }

          return (
            <div
              key={date.getTime()}
              className={`text-center text-sm py-1.5 cursor-pointer select-none transition-colors
                ${bg} ${textCls} ${radius}
                ${!isStart && !isEnd && !inRange ? 'hover:bg-brand/10   ' : ''}
                ${isToday && !isStart && !isEnd && !inRange ? 'font-semibold underline decoration-brand/50' : ''}
              `}
              onClick={() => onDayClick(date)}
              onMouseEnter={() => !isFuture && onDayHover(date)}
            >
              {date.getDate()}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function DateRangePicker() {
  const today = new Date()
  const [open, setOpen]           = useState(false)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate]     = useState(null)
  const [hoverDate, setHoverDate] = useState(null)
  const [selecting, setSelecting] = useState(false)
  const [leftMonth, setLeftMonth] = useState(today.getMonth() > 0 ? today.getMonth()-1 : 0)
  const [leftYear, setLeftYear]   = useState(today.getFullYear())
  const [preset, setPreset]       = useState('')
  const ref = useRef()

  const todayYear  = today.getFullYear()
  const todayMonth = today.getMonth()

  let rightMonth = leftMonth + 1
  let rightYear  = leftYear
  if (rightMonth > 11) { rightMonth = 0; rightYear += 1 }

  // Disable next if right calendar is already at current month
  const canGoNext = !(rightYear === todayYear && rightMonth >= todayMonth)

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleDayClick(date) {
    const todayStart = new Date(); todayStart.setHours(0,0,0,0)
    if (date > todayStart) return
    if (!selecting || !startDate) {
      setStartDate(date); setEndDate(null); setSelecting(true); setPreset('')
    } else {
      if (date < startDate) { setEndDate(startDate); setStartDate(date) }
      else setEndDate(date)
      setSelecting(false)
    }
  }

  function handlePreset(val) {
    setPreset(val)
    if (!val) return
    const p = PRESETS.find(p => p.label === val)
    if (p) {
      const [s, en] = p.getValue()
      setStartDate(s); setEndDate(en); setSelecting(false)
      setLeftMonth(s.getMonth() > 0 ? s.getMonth()-1 : 0)
      setLeftYear(s.getFullYear())
    }
  }

  function prevMonth() {
    if (leftMonth === 0) { setLeftMonth(11); setLeftYear(y => y-1) }
    else setLeftMonth(m => m-1)
  }
  function nextMonth() {
    if (leftMonth === 11) { setLeftMonth(0); setLeftYear(y => y+1) }
    else setLeftMonth(m => m+1)
  }

  const label = startDate && endDate
    ? `${formatDate(startDate)} – ${formatDate(endDate)}`
    : 'Select Date Range'

  const hasSelection = startDate && endDate

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2    border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:border-neutral-400"
      >
        <svg className="size-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span>{label}</span>
        <IconChevronDown className={`size-4 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[580px] border border-neutral-200 bg-white p-5 shadow-2xl">
          {/* Preset pills */}
          <div className="mb-4 flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => handlePreset(p.label)}
                className={`border px-3 py-1 text-xs font-medium transition-colors
                  ${preset === p.label
                    ? 'border-brand bg-brand text-white'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-brand/40 hover:text-brand'
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Calendars */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="flex size-7 items-center justify-center    border border-neutral-200 text-neutral-500 hover:bg-neutral-100"
                >
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <span />
              </div>
              <CalendarMonth
                year={leftYear} month={leftMonth}
                startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                onDayClick={handleDayClick} onDayHover={setHoverDate}
              />
            </div>

            <div className="w-px self-stretch bg-neutral-100" />

            <div className="flex-1">
              <div className="mb-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={nextMonth}
                  disabled={!canGoNext}
                  className={`flex size-7 items-center justify-center    border border-neutral-200 transition-colors
                    ${canGoNext ? 'text-neutral-500 hover:bg-neutral-100' : 'text-neutral-300 cursor-not-allowed border-neutral-100'}`}
                >
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
              <CalendarMonth
                year={rightYear} month={rightMonth}
                startDate={startDate} endDate={endDate} hoverDate={hoverDate}
                onDayClick={handleDayClick} onDayHover={setHoverDate}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
            <p className="text-xs text-neutral-400">
              {selecting
                ? <span className="text-brand">Now select an end date…</span>
                : hasSelection
                  ? `${Math.round((endDate - startDate) / 86400000) + 1} days selected`
                  : 'Click a start date'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setStartDate(null); setEndDate(null); setSelecting(false); setPreset('') }}
                className="   px-4 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="   bg-brand px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-brand/90"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}