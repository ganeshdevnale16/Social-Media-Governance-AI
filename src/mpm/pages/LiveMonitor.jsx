import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, EllipsisVertical, Pause, Play, RotateCcw, TrendingDown, TrendingUp, Zap } from 'lucide-react'
import { useMpm } from '../MpmContext.jsx'
import { INDEX, SCENARIOS, fmtINR, fmtTime, pct } from '../mockData.js'
import { Card, PageHeader, Sparkline, StageTracker, VerdictBadge, GREEN, RED } from '../ui.jsx'

function Kpi({ label, value, sub, accent = '#171717' }) {
  return (
    <div className="border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums leading-none" style={{ color: accent }}>{value}</p>
      {sub && <p className="mt-1.5 text-[11px] text-neutral-500">{sub}</p>}
    </div>
  )
}

// Row action menu: ⋮ → Trigger → scenarios + reset.
// Rendered with fixed positioning so the table's scroll container doesn't clip it.
function RowMenu({ symbol, onSimulate, onReset }) {
  const [open, setOpen] = useState(null) // { top, right }
  const [level, setLevel] = useState('main')
  const btn = useRef(null)
  const menu = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (menu.current?.contains(e.target) || btn.current?.contains(e.target)) return
      setOpen(null)
    }
    const hide = () => setOpen(null)
    document.addEventListener('mousedown', close)
    window.addEventListener('resize', hide)
    window.addEventListener('scroll', hide, true)
    return () => {
      document.removeEventListener('mousedown', close)
      window.removeEventListener('resize', hide)
      window.removeEventListener('scroll', hide, true)
    }
  }, [open])

  const toggle = () => {
    if (open) return setOpen(null)
    const r = btn.current.getBoundingClientRect()
    setLevel('main')
    setOpen({ top: r.bottom + 4, right: window.innerWidth - r.right })
  }
  const run = (fn) => { fn(); setOpen(null) }
  const item = 'flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-neutral-100'

  return (
    <>
      <button ref={btn} onClick={toggle} aria-label={`Actions for ${symbol}`} aria-expanded={!!open}
        className={`inline-flex size-7 items-center justify-center hover:bg-neutral-100 ${open ? 'bg-neutral-100' : ''}`}>
        <EllipsisVertical className="size-4 text-neutral-600" />
      </button>
      {open && (
        <div ref={menu} role="menu" style={{ top: open.top, right: open.right }} className="fixed z-40 w-56 border border-neutral-200 bg-white py-1 shadow-lg">
          {level === 'main' ? (
            <button role="menuitem" onClick={() => setLevel('trigger')} className={item}>
              <Zap className="size-3.5 text-neutral-600" />
              <span className="flex-1">Trigger</span>
              <ChevronRight className="size-3.5 text-neutral-400" />
            </button>
          ) : (
            <>
              <button onClick={() => setLevel('main')} className="flex w-full items-center gap-1.5 border-b border-neutral-100 px-3 py-2 text-left text-[11px] font-semibold text-neutral-500 hover:bg-neutral-50">
                <ChevronLeft className="size-3.5" /> Trigger
              </button>
              {Object.entries(SCENARIOS).map(([k, s]) => (
                <button key={k} role="menuitem" onClick={() => run(() => onSimulate(symbol, k))} className={item}>
                  {s.direction === 'up' ? <TrendingUp className="size-3.5 text-[#5d8a12]" /> : <TrendingDown className="size-3.5 text-[#DA291C]" />}
                  <span className={s.direction === 'up' ? 'text-[#4f7a0c]' : 'text-[#DA291C]'}>{s.label}</span>
                </button>
              ))}
              <div className="my-1 border-t border-neutral-100" />
              <button role="menuitem" onClick={() => run(() => onReset(symbol))} className={item}>
                <RotateCcw className="size-3.5 text-neutral-600" /> Reset price to normal
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default function LiveMonitor() {
  const { companies, quotes, settings, incidents, emails, simulate, resetPrice, paused, setPaused } = useMpm()
  const navigate = useNavigate()
  const thr = settings.threshold
  const idx = quotes[INDEX.symbol]
  const idxChg = ((idx.price - INDEX.prevClose) / INDEX.prevClose) * 100
  const reports = incidents.filter((i) => i.stage >= 5).length
  const material = incidents.filter((i) => i.stage >= 4 && i.result.verdict === 'YES').length

  return (
    <div className="p-6">
      <PageHeader
        title="Live Price Monitor"
        subtitle={`Live price vs previous close for monitored companies. A move of ±${thr}% or more triggers an alert e-mail, pulls news and social data, and starts the AI investigation.`}
        right={
          <div className="flex items-center gap-2">
            <button onClick={() => setPaused((p) => !p)} className="inline-flex items-center gap-1.5 border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-neutral-400">
              {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
              {paused ? 'Resume feed' : 'Pause feed'}
            </button>
          </div>
        }
      />

      <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Companies monitored" value={settings.watchlist.length} sub="Live feed, 1.5s refresh" />
        <Kpi label="Triggers today" value={incidents.length} accent={incidents.length ? RED : '#171717'} sub="Investigations opened" />
        <Kpi label="Material movements" value={material} accent={material ? RED : '#171717'} sub={`${reports} report(s) issued`} />
        <Kpi label="Alerts e-mailed" value={emails.length} accent={GREEN} sub={`${settings.recipients.length} configured recipients`} />
      </section>

      <div>
        <Card
          title="Watchlist"
          subtitle="Change is measured from previous close. Status turns amber within 1% of the threshold."
          right={
            <div className="text-right text-xs">
              <p className="font-semibold text-neutral-900">{INDEX.symbol} {idx.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              <p style={{ color: idxChg < 0 ? RED : GREEN }} className="font-medium tabular-nums">{pct(idxChg)}</p>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
                  <th className="py-2 pr-3 font-medium">Company</th>
                  <th className="py-2 pr-3 text-right font-medium">Live price</th>
                  <th className="py-2 pr-3 text-right font-medium">Prev close</th>
                  <th className="py-2 pr-3 text-right font-medium">Change</th>
                  <th className="py-2 pr-3 text-right font-medium">Index-adj.</th>
                  <th className="py-2 pr-3 font-medium">Trend</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="w-10 py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {companies.filter((c) => settings.watchlist.includes(c.symbol) && quotes[c.symbol]).map((c) => {
                  const q = quotes[c.symbol]
                  const chg = ((q.price - c.prevClose) / c.prevClose) * 100
                  const adj = chg - (settings.indexAdjust ? idxChg : 0)
                  const inc = incidents.find((i) => i.company.symbol === c.symbol)
                  const triggered = Math.abs(chg) >= thr
                  const near = !triggered && Math.abs(chg) >= thr - 1
                  const color = chg < 0 ? RED : GREEN
                  return (
                    <tr key={c.symbol} className={`border-b border-neutral-100 ${triggered ? 'bg-red-50/60' : ''}`}>
                      <td className="py-2.5 pr-3">
                        <p className="font-semibold text-neutral-900">{c.short}</p>
                        <p className="text-[11px] text-neutral-500">{c.symbol} · {c.sector}</p>
                      </td>
                      <td className="py-2.5 pr-3 text-right font-semibold tabular-nums">{fmtINR(q.price)}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-neutral-500">{fmtINR(c.prevClose)}</td>
                      <td className="py-2.5 pr-3 text-right font-semibold tabular-nums" style={{ color }}>
                        <span className="inline-flex items-center gap-1">
                          {chg < 0 ? <TrendingDown className="size-3.5" /> : <TrendingUp className="size-3.5" />}
                          {pct(chg)}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-neutral-600">{pct(adj)}</td>
                      <td className="py-2.5 pr-3"><Sparkline data={q.history} color={color} /></td>
                      <td className="py-2.5">
                        {triggered ? (
                          <button onClick={() => inc && navigate(`/market-monitor/incident/${inc.id}`)} className="inline-flex items-center gap-1 bg-[#DA291C] px-2 py-0.5 text-[11px] font-semibold text-white">
                            <Zap className="size-3" /> Triggered
                          </button>
                        ) : near ? (
                          <span className="bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Near threshold</span>
                        ) : (
                          <span className="bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600">Normal</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        <RowMenu symbol={c.symbol} onSimulate={simulate} onReset={resetPrice} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      <Card className="mt-4" title="Recent triggers" subtitle="Each trigger runs the full pipeline. Target: report within 3–4 hours of the trigger.">
        {incidents.length === 0 ? (
          <p className="border-t border-dashed border-neutral-200 py-6 text-center text-sm text-neutral-500">
            No triggers yet. Use the ⋮ menu on any stock and choose Trigger to run a spike or crash.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-neutral-100">
            {incidents.slice(0, 6).map((i) => (
              <button key={i.id} onClick={() => navigate(`/market-monitor/incident/${i.id}`)} className="grid grid-cols-12 items-center gap-3 py-3 text-left hover:bg-neutral-50">
                <div className="col-span-3">
                  <p className="text-sm font-semibold">{i.company.short}</p>
                  <p className="text-[11px] text-neutral-500">{i.id} · {fmtTime(i.triggerAt)}</p>
                </div>
                <p className="col-span-2 text-sm font-semibold tabular-nums" style={{ color: i.stockPct < 0 ? RED : GREEN }}>{pct(i.stockPct)}</p>
                <div className="col-span-5"><StageTracker stage={i.stage} compact /></div>
                <div className="col-span-2 text-right">
                  {i.stage >= 4 ? <VerdictBadge verdict={i.result.verdict} /> : <span className="text-[11px] text-amber-700">Investigating…</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
