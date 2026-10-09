import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CircleCheck, CircleX, ExternalLink, FileText, LoaderCircle } from 'lucide-react'
import { CartesianGrid, ComposedChart, Legend, Line, ReferenceArea, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useMpm, STAGES } from '../MpmContext.jsx'
import { fmtDateTime, fmtTime, pct } from '../mockData.js'
import { AMBER, Card, DirTag, GREEN, PageHeader, POS, RED, SourceIcon, StageTracker, VerdictBadge } from '../ui.jsx'

export function IncidentList() {
  const { incidents } = useMpm()
  const navigate = useNavigate()
  return (
    <div className="p-6">
      <PageHeader title="Investigations" subtitle="Every price trigger opens an investigation: data is pulled from all sources and the AI identifies, clusters and ranks potential rumours." />
      <Card>
        {incidents.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">No investigations yet. Go to <Link className="font-medium text-[#86bc25]" to="/market-monitor">Live Monitor</Link> and simulate a price movement.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
                <th className="py-2 font-medium">ID</th><th className="py-2 font-medium">Company</th><th className="py-2 font-medium">Trigger</th>
                <th className="py-2 text-right font-medium">Move</th><th className="py-2 font-medium pl-6">Progress</th><th className="py-2 text-right font-medium">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((i) => (
                <tr key={i.id} onClick={() => navigate(`/market-monitor/incident/${i.id}`)} className="cursor-pointer border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 text-neutral-500">{i.id}</td>
                  <td className="py-3 font-semibold">{i.company.short}</td>
                  <td className="py-3">{fmtDateTime(i.triggerAt)}</td>
                  <td className="py-3 text-right font-semibold tabular-nums" style={{ color: i.stockPct < 0 ? RED : GREEN }}>{pct(i.stockPct)}</td>
                  <td className="py-3 pl-6 w-[30%]"><StageTracker stage={i.stage} compact /><p className="mt-1 text-[11px] text-neutral-500">{STAGES[i.stage].label}</p></td>
                  <td className="py-3 text-right">{i.stage >= 4 ? <VerdictBadge verdict={i.result.verdict} /> : <span className="text-[11px] text-amber-700">In progress</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}

function useTicker(active) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!active) return
    const iv = setInterval(() => setNow(Date.now()), 300)
    return () => clearInterval(iv)
  }, [active])
  return now
}

const dirColor = (d) => (d === 'negative' ? RED : d === 'positive' ? POS : '#9ca3af')

export default function Investigation() {
  const { id } = useParams()
  const { incidents, settings, sources } = useMpm()
  const inc = incidents.find((i) => i.id === id)
  const pulling = inc?.stage === 2
  const now = useTicker(pulling)

  if (!inc) {
    return (
      <div className="p-6">
        <Card><p className="py-6 text-center text-sm text-neutral-500">Investigation not found. <Link className="font-medium text-[#86bc25]" to="/market-monitor">Back to Live Monitor</Link></p></Card>
      </div>
    )
  }

  const r = inc.result
  const thr = settings.threshold
  const pullStart = new Date(inc.triggerAt).getTime() + STAGES[2].at
  const pullDur = STAGES[3].at - STAGES[2].at
  const pullFrac = inc.stage < 2 ? 0 : inc.stage > 2 ? 1 : Math.min(1, Math.max(0, (now - pullStart) / pullDur))
  const nearest = (d) => {
    const m = Math.round((new Date(d) - new Date(inc.triggerAt)) / 60000)
    return inc.series.reduce((a, b) => (Math.abs(b.m - m) < Math.abs(a.m - m) ? b : a))
  }
  const chartData = inc.series.map((p) => ({ ...p, adj: +(p.stock - p.index).toFixed(2) }))
  const yMin = Math.floor(Math.min(...chartData.map((d) => Math.min(d.stock, d.index)), -thr) - 1)
  const yMax = Math.ceil(Math.max(...chartData.map((d) => Math.max(d.stock, d.index)), thr) + 1)
  const triggerLabel = inc.series.find((p) => p.m === 0)?.t

  return (
    <div className="p-6">
      <PageHeader
        title={`${inc.company.short} — ${inc.stockPct < 0 ? 'Price crash' : 'Price spike'} investigation`}
        subtitle={`${inc.id} · Triggered ${fmtDateTime(inc.triggerAt)} IST · ${inc.company.name}`}
        right={
          <div className="flex items-center gap-2">
            {inc.stage >= 4 && <VerdictBadge verdict={r.verdict} size="lg" />}
            {inc.stage >= 5 && (
              <Link to={`/market-monitor/report/${inc.id}`} className="inline-flex items-center gap-1.5 bg-neutral-900 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-700">
                <FileText className="size-3.5" /> Open report
              </Link>
            )}
          </div>
        }
      />

      <Card className="mb-4" title="Trigger → Investigation → Evidence → Output">
        <StageTracker stage={inc.stage} triggerAt={inc.triggerAt} />
      </Card>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" title="Price & index movement" subtitle={`% change from previous close. Shaded band = ±${thr}% threshold. Dots = first detection of each evidence item.`}>
          <div className="mb-3 grid grid-cols-3 gap-3 text-center">
            <div className="border border-neutral-200 p-2"><p className="text-[11px] text-neutral-500">{inc.company.short}</p><p className="text-lg font-bold tabular-nums" style={{ color: inc.stockPct < 0 ? RED : GREEN }}>{pct(inc.stockPct)}</p></div>
            <div className="border border-neutral-200 p-2"><p className="text-[11px] text-neutral-500">NIFTY 50</p><p className="text-lg font-bold tabular-nums text-neutral-700">{pct(inc.indexPct)}</p></div>
            <div className="border border-neutral-200 p-2"><p className="text-[11px] text-neutral-500">Index-adjusted</p><p className="text-lg font-bold tabular-nums" style={{ color: Math.abs(r.adj) >= thr ? RED : GREEN }}>{pct(r.adj)}</p></div>
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 11, fill: '#6b7280' }} interval={7} />
                <YAxis domain={[yMin, yMax]} tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ fontSize: 12, borderRadius: 0 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceArea y1={-thr} y2={thr} fill="#86bc25" fillOpacity={0.07} />
                <ReferenceLine y={thr} stroke={GREEN} strokeDasharray="4 4" />
                <ReferenceLine y={-thr} stroke={RED} strokeDasharray="4 4" />
                {triggerLabel && <ReferenceLine x={triggerLabel} stroke={AMBER} strokeWidth={2} label={{ value: 'Trigger', position: 'insideTopRight', fill: AMBER, fontSize: 11 }} />}
                <Line type="monotone" dataKey="index" name="NIFTY 50" stroke="#9ca3af" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="stock" name={inc.company.short} stroke="#171717" strokeWidth={2.5} dot={false} />
                {inc.stage >= 3 && r.evidence.filter((e) => e[5] > 0).map((e, k) => {
                  const p = nearest(e[2])
                  return <ReferenceDot key={k} x={p.t} y={yMin + 0.4} r={3 + e[5] * 4} fill={dirColor(e[4])} stroke="white" />
                })}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Data pulled from sources" subtitle="Items scanned in the trigger window">
          <ul className="flex flex-col gap-2.5">
            {sources.filter((s) => settings.sources.includes(s.id)).map((s) => {
              const total = r.sourceHits[s.id] ?? 0
              const v = Math.round(total * pullFrac)
              return (
                <li key={s.id} className="flex items-center gap-2.5 text-sm">
                  <SourceIcon name={s.label} size={18} />
                  <span className="flex-1 text-neutral-700">{s.label}</span>
                  {inc.stage < 2 ? <span className="text-[11px] text-neutral-400">Queued</span>
                    : pulling ? <span className="inline-flex items-center gap-1 tabular-nums text-amber-700"><LoaderCircle className="size-3 animate-spin" />{v.toLocaleString('en-IN')}</span>
                      : <span className="font-semibold tabular-nums">{v.toLocaleString('en-IN')}</span>}
                </li>
              )
            })}
          </ul>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-[11px] text-neutral-500">
            Duplicate story detection, source credibility and propagation assessment are applied before clustering.
          </p>
        </Card>
      </div>

      {inc.stage < 3 ? (
        <Card><p className="flex items-center justify-center gap-2 py-8 text-sm text-neutral-500"><LoaderCircle className="size-4 animate-spin" /> Collecting data. AI identification and clustering starts once pulling finishes.</p></Card>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2" title="Potential rumour clusters" subtitle="AI groups related items into stories and ranks them by confidence that they explain the price move.">
              <div className="flex flex-col divide-y divide-neutral-100">
                {r.clusters.map((c, i) => (
                  <div key={c.id} className="grid grid-cols-[28px_1fr_90px] gap-3 py-3">
                    <span className="text-lg font-bold text-neutral-300">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{c.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-500">
                        <DirTag dir={c.direction} />
                        {c.official && <span className="border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-medium text-blue-700">Official source</span>}
                        {c.duplicate && <span className="border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-medium text-amber-700">Duplicate / old story</span>}
                        <span>{c.items} items · reach {c.reach} · first seen {fmtTime(c.firstSeen)}</span>
                      </div>
                      <p className="mt-1.5 text-[12px] text-neutral-600"><span className="font-medium text-neutral-800">Sources:</span> {c.sources.join(', ')} · <span className="font-medium text-neutral-800">Credibility:</span> {c.credibility}</p>
                      <p className="text-[12px] text-neutral-600"><span className="font-medium text-neutral-800">Propagation:</span> {c.propagation}</p>
                      <p className="text-[12px] text-neutral-600"><span className="font-medium text-neutral-800">Timing:</span> {c.timing}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold tabular-nums">{Math.round(c.confidence * 100)}%</p>
                      <p className="text-[10px] text-neutral-500">confidence</p>
                      <div className="mt-1 h-1.5 bg-neutral-100"><div className="h-full" style={{ width: `${c.confidence * 100}%`, background: dirColor(c.direction) }} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Timeline" subtitle="How the change happened">
              <ol className="relative ml-2 border-l border-neutral-200">
                {r.timeline.map(([at, kind, text], i) => (
                  <li key={i} className="mb-4 ml-4">
                    <span className="absolute -left-[5px] mt-1.5 size-2.5 rounded-full" style={{ background: kind === 'trigger' ? AMBER : kind === 'price' ? '#171717' : kind === 'check' ? '#2563eb' : '#9ca3af' }} />
                    <p className="text-[11px] font-semibold tabular-nums text-neutral-500">{fmtTime(at)}</p>
                    <p className="text-[13px] text-neutral-800">{text}</p>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          <Card className="mb-4" title="Evidence log" subtitle="Every item captured with source, link, time of detection, reach and AI relevance score.">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
                    <th className="py-2 font-medium">Source</th><th className="py-2 font-medium">Link</th><th className="py-2 font-medium">Detected</th>
                    <th className="py-2 font-medium">Engagement / reach</th><th className="py-2 font-medium">Direction</th><th className="py-2 font-medium">Cluster</th><th className="py-2 text-right font-medium">AI relevance</th>
                  </tr>
                </thead>
                <tbody>
                  {r.evidence.map((e, i) => (
                    <tr key={i} className="border-b border-neutral-100 align-top">
                      <td className="py-2.5"><span className="inline-flex items-center gap-2"><SourceIcon name={e[0]} />{e[0]}</span></td>
                      <td className="py-2.5 pr-3 text-[12px] text-[#3a6c00] break-all">{e[1]} {e[5] > 0 && <ExternalLink className="ml-0.5 inline size-3 text-neutral-400" />}</td>
                      <td className="py-2.5 tabular-nums">{fmtTime(e[2])}</td>
                      <td className="py-2.5 text-neutral-600">{e[3]}</td>
                      <td className="py-2.5"><DirTag dir={e[4]} /></td>
                      <td className="py-2.5 text-neutral-500">{e[6]}</td>
                      <td className="py-2.5 text-right font-semibold tabular-nums">{e[5] ? `${Math.round(e[5] * 100)}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Material movement assessment" subtitle="Checks aligned to the NSE/SURV/62122 framework">
            {inc.stage < 4 ? (
              <p className="flex items-center gap-2 py-4 text-sm text-neutral-500"><LoaderCircle className="size-4 animate-spin" /> Assessing…</p>
            ) : (
              <>
                <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {r.assessment.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 border border-neutral-200 p-3">
                      {(a.invert ? !a.ok : a.ok) ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-[#86bc25]" /> : <CircleX className="mt-0.5 size-4 shrink-0 text-neutral-400" />}
                      <div>
                        <p className="text-[13px] font-medium text-neutral-900">{a.label}</p>
                        <p className="text-[12px] text-neutral-600">{a.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className={`mt-4 flex flex-wrap items-center gap-3 p-4 ${r.verdict === 'YES' ? 'bg-red-50' : 'bg-[#86bc25]/10'}`}>
                  <VerdictBadge verdict={r.verdict} size="lg" />
                  <p className="text-sm font-semibold text-neutral-900">{r.headline}</p>
                </div>
              </>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
