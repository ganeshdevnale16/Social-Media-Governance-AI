import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useRef } from 'react'
import { Eye, Mail, Plus, Printer, Send, Trash2, X } from 'lucide-react'
import { useMpm } from '../MpmContext.jsx'
import { fmtDateTime, fmtTime, pct, reportAsText } from '../mockData.js'
import { FROM, buildEmail, reportEmail } from '../emailTemplates.js'
import { Card, DirTag, GREEN, PageHeader, RED, SourceIcon, VerdictBadge } from '../ui.jsx'

// ── Reports list ─────────────────────────────────────────────────────────────
export function ReportList() {
  const { incidents } = useMpm()
  const navigate = useNavigate()
  const ready = incidents.filter((i) => i.stage >= 5)
  return (
    <div className="p-6">
      <PageHeader title="Reports" subtitle="AI-generated management reports, one per trigger. Open a report to view, print or share it by e-mail." />
      {ready.length === 0 ? (
        <Card><p className="py-8 text-center text-sm text-neutral-500">No reports yet. Reports appear here once an investigation completes.</p></Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ready.map((i) => (
            <button key={i.id} onClick={() => navigate(`/market-monitor/report/${i.id}`)} className="border border-neutral-200 bg-white p-4 text-left shadow-sm transition hover:border-neutral-400">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{i.company.short}</p>
                <VerdictBadge verdict={i.result.verdict} />
              </div>
              <p className="mt-1 text-[11px] text-neutral-500">{i.id} · {fmtDateTime(i.triggerAt)}</p>
              <p className="mt-2 text-lg font-bold tabular-nums" style={{ color: i.stockPct < 0 ? RED : GREEN }}>{pct(i.stockPct)}</p>
              <p className="mt-1 text-[12px] text-neutral-700">{i.result.headline}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── E-mail body frame: links like "Open full report" open inside the app ────
function EmailFrame({ html, className, onNavigate }) {
  const ref = useRef(null)
  const navigate = useNavigate()
  const wire = () => {
    const doc = ref.current?.contentDocument
    if (!doc) return
    doc.querySelectorAll('a[href]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href') || ''
        const i = href.indexOf('market-monitor')
        if (i === -1) return
        e.preventDefault()
        onNavigate?.()
        navigate('/' + href.slice(i))
      })
    })
  }
  return <iframe ref={ref} title="E-mail body" srcDoc={html} onLoad={wire} className={className} />
}

// ── Share modal ──────────────────────────────────────────────────────────────
function ShareModal({ inc, onClose }) {
  const { settings, sendEmail, pushToast } = useMpm()
  const [to, setTo] = useState(settings.recipients.map((r) => r.email).join(', '))
  const [note, setNote] = useState('')
  const subject = `[MPM Report] ${inc.company.short}: ${inc.result.headline}`
  const body = (note ? note + '\n\n' : '') + reportAsText(inc)
  const list = to.split(',').map((s) => s.trim()).filter(Boolean)
  const send = () => {
    sendEmail({ incidentId: inc.id, type: 'Report shared', to: list, subject, note })
    pushToast({ tone: 'ok', title: 'Report shared', body: `Sent to ${list.length} recipient(s).` })
    onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col border border-neutral-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
          <h3 className="text-base font-semibold">Share report by e-mail</h3>
          <button onClick={onClose} aria-label="Close"><X className="size-4" /></button>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-3 p-5 text-sm">
          <label className="text-xs font-medium text-neutral-600">To (comma-separated)
            <input value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-medium text-neutral-600">Subject
            <input value={subject} readOnly className="mt-1 w-full border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700" />
          </label>
          <label className="text-xs font-medium text-neutral-600">Note (optional)
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm" placeholder="Add a note for the recipients" />
          </label>
          <p className="text-[11px] text-neutral-500">The preview shows exactly what recipients will receive.</p>
        </div>
        <div className="border-t border-neutral-200 bg-neutral-100 p-3 lg:border-l lg:border-t-0">
          <p className="mb-2 text-[11px] font-medium text-neutral-500">E-mail preview</p>
          <EmailFrame html={reportEmail(inc, settings, note).html} onNavigate={onClose} className="h-[60vh] w-full border border-neutral-200 bg-white" />
        </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-neutral-200 px-5 py-3">
          <a
            href={`mailto:${list.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
            className="inline-flex items-center gap-1.5 border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 hover:border-neutral-400"
          >
            <Mail className="size-3.5" /> Open in mail app
          </a>
          <button onClick={send} disabled={!list.length} className="inline-flex items-center gap-1.5 bg-[#86bc25] px-4 py-2 text-xs font-semibold text-white hover:bg-[#76a820] disabled:opacity-50">
            <Send className="size-3.5" /> Send report
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Report view ──────────────────────────────────────────────────────────────
export default function ReportView() {
  const { id } = useParams()
  const { incidents, settings } = useMpm()
  const [sharing, setSharing] = useState(false)
  const inc = incidents.find((i) => i.id === id)
  if (!inc || inc.stage < 5) {
    return (
      <div className="p-6"><Card><p className="py-6 text-center text-sm text-neutral-500">{inc ? 'Report is still being prepared.' : 'Report not found.'} <Link className="font-medium text-[#86bc25]" to="/market-monitor/reports">Back to reports</Link></p></Card></div>
    )
  }
  const r = inc.result
  const issued = new Date(new Date(inc.triggerAt).getTime() + 10500)
  const secs = Math.round((issued - new Date(inc.triggerAt)) / 1000)

  return (
    <div className="p-6">
      <PageHeader
        title="Management report"
        subtitle={`${inc.company.name} · ${inc.id}`}
        right={
          <div className="flex gap-2 print:hidden">
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:border-neutral-400">
              <Printer className="size-3.5" /> Print / PDF
            </button>
            <button onClick={() => setSharing(true)} className="inline-flex items-center gap-1.5 bg-[#86bc25] px-3 py-2 text-xs font-semibold text-white hover:bg-[#76a820]">
              <Send className="size-3.5" /> Share by e-mail
            </button>
          </div>
        }
      />

      <div className="mx-auto max-w-4xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-neutral-900 pb-3">
          <div>
            <p className="text-xs text-neutral-500">Material Price Movement Report · NSE/SURV/62122 · SEBI LODR Reg. 30(11)</p>
            <h1 className="mt-1 text-2xl font-semibold">{inc.company.short} ({inc.company.symbol})</h1>
          </div>
          <div className="text-right text-xs text-neutral-500">
            <p>Trigger {fmtDateTime(inc.triggerAt)} IST</p>
            <p>Issued {fmtTime(issued)} IST · <span className="font-semibold text-[#5d8a12]">{secs}s after trigger (target ≤ 3–4 h)</span></p>
          </div>
        </div>

        <div className={`mt-5 flex flex-wrap items-center gap-4 p-4 ${r.verdict === 'YES' ? 'bg-red-50' : 'bg-[#86bc25]/10'}`}>
          <VerdictBadge verdict={r.verdict} size="lg" />
          <p className="text-[15px] font-semibold">{r.headline}</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ['Share move', pct(inc.stockPct), inc.stockPct < 0 ? RED : GREEN],
            ['NIFTY 50', pct(inc.indexPct), '#404040'],
            ['Index-adjusted', pct(r.adj), Math.abs(r.adj) >= settings.threshold ? RED : GREEN],
            ['Window', r.preOpen ? 'Pre-9:30' : 'Post-9:30', '#404040'],
          ].map(([l, v, c]) => (
            <div key={l} className="border border-neutral-200 p-3">
              <p className="text-[11px] text-neutral-500">{l}</p>
              <p className="text-lg font-bold tabular-nums" style={{ color: c }}>{v}</p>
            </div>
          ))}
        </div>

        <h4 className="mt-6 text-sm font-semibold">AI summary</h4>
        <p className="mt-1 text-[14px] leading-relaxed text-neutral-800">{r.insight}</p>

        <h4 className="mt-6 text-sm font-semibold">Potential rumours, ranked</h4>
        <table className="mt-2 w-full text-sm">
          <thead><tr className="border-b border-neutral-200 text-left text-xs text-neutral-500"><th className="py-2 font-medium">#</th><th className="py-2 font-medium">Story</th><th className="py-2 font-medium">Direction</th><th className="py-2 font-medium">Sources</th><th className="py-2 text-right font-medium">Confidence</th></tr></thead>
          <tbody>
            {r.clusters.map((c, i) => (
              <tr key={c.id} className="border-b border-neutral-100 align-top">
                <td className="py-2 text-neutral-400">{i + 1}</td>
                <td className="py-2 pr-3">{c.title}<p className="text-[11px] text-neutral-500">First seen {fmtTime(c.firstSeen)} · {c.items} items · reach {c.reach}</p></td>
                <td className="py-2"><DirTag dir={c.direction} /></td>
                <td className="py-2 text-[12px] text-neutral-600">{c.sources.join(', ')}</td>
                <td className="py-2 text-right font-semibold tabular-nums">{Math.round(c.confidence * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h4 className="mt-6 text-sm font-semibold">Key evidence</h4>
        <ul className="mt-2 flex flex-col gap-1.5">
          {r.evidence.filter((e) => e[5] >= 0.5).map((e, i) => (
            <li key={i} className="flex items-center gap-2 text-[13px]">
              <SourceIcon name={e[0]} size={14} />
              <span className="w-12 tabular-nums text-neutral-500">{fmtTime(e[2])}</span>
              <span className="break-all text-[#3a6c00]">{e[1]}</span>
              <span className="ml-auto shrink-0 text-[12px] text-neutral-500">{e[3]}</span>
            </li>
          ))}
        </ul>

        <h4 className="mt-6 text-sm font-semibold">Suggested next steps for review</h4>
        <ul className="mt-1 list-disc pl-5 text-[14px] leading-relaxed text-neutral-800">
          {r.actions.map((a, i) => <li key={i}>{a}</li>)}
        </ul>

        <p className="mt-8 border-t border-neutral-200 pt-3 text-[11px] text-neutral-500">
          {r.evidence.length} evidence items retained with source, link and timestamp. This report is an input for NSE’s own assessment and is not a regulatory determination.
        </p>
      </div>
      {sharing && <ShareModal inc={inc} onClose={() => setSharing(false)} />}
    </div>
  )
}

// ── Alerts & e-mail log ──────────────────────────────────────────────────────
function EmailPreview({ entry, onClose }) {
  const { incidents, settings } = useMpm()
  const inc = incidents.find((i) => i.id === entry.incidentId)
  const mail = buildEmail(entry, inc, settings)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col border border-neutral-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
          <h3 className="text-base font-semibold">{entry.type}</h3>
          <button onClick={onClose} aria-label="Close"><X className="size-4" /></button>
        </div>
        <dl className="grid grid-cols-[70px_1fr] gap-x-3 gap-y-1 border-b border-neutral-200 px-5 py-3 text-[13px]">
          <dt className="text-neutral-500">From</dt><dd>{FROM}</dd>
          <dt className="text-neutral-500">To</dt><dd>{entry.to.join(', ')}</dd>
          <dt className="text-neutral-500">Subject</dt><dd className="font-semibold">{mail?.subject || entry.subject}</dd>
          <dt className="text-neutral-500">Sent</dt><dd>{fmtDateTime(entry.at)} · {entry.status}</dd>
        </dl>
        <div className="min-h-0 flex-1 bg-neutral-100 p-3">
          {mail ? <EmailFrame html={mail.html} onNavigate={onClose} className="h-[62vh] w-full border border-neutral-200 bg-white" />
            : <p className="p-6 text-center text-sm text-neutral-500">The investigation for this e-mail is no longer in memory.</p>}
        </div>
      </div>
    </div>
  )
}

export function AlertsLog() {
  const { emails } = useMpm()
  const [preview, setPreview] = useState(null)
  return (
    <div className="p-6">
      <PageHeader title="Alerts & e-mail log" subtitle="Every trigger alert and report sent to configured members. " />
      <Card>
        {emails.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">No alerts sent yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-neutral-200 text-left text-xs text-neutral-500"><th className="py-2 font-medium">Time</th><th className="py-2 font-medium">Type</th><th className="py-2 font-medium">Subject</th><th className="py-2 font-medium">Recipients</th><th className="py-2 font-medium">Status</th><th className="py-2 font-medium"></th></tr></thead>
            <tbody>
              {emails.map((m) => (
                <tr key={m.id} className="border-b border-neutral-100 align-top">
                  <td className="py-2.5 tabular-nums">{fmtTime(m.at)}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 text-[11px] font-semibold ${m.type === 'Trigger alert' ? 'bg-red-50 text-[#DA291C]' : 'bg-[#86bc25]/15 text-[#4f7a0c]'}`}>{m.type}</span>
                  </td>
                  <td className="py-2.5 pr-3">
                    {m.subject}
                    {m.incidentId && <Link to={`/market-monitor/incident/${m.incidentId}`} className="ml-2 text-[12px] font-medium text-[#86bc25] hover:underline">View</Link>}
                  </td>
                  <td className="py-2.5 text-[12px] text-neutral-600">{m.to.join(', ')}</td>
                  <td className="whitespace-nowrap py-2.5 pr-3 text-[12px] text-neutral-600">{m.status}</td>
                  <td className="whitespace-nowrap py-2.5 text-right">
                    <button onClick={() => setPreview(m)} className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap border border-neutral-300 px-2 py-1 text-[11px] font-medium text-neutral-700 hover:border-neutral-400">
                      <Eye className="size-3.5" /> Preview e-mail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      {preview && <EmailPreview entry={preview} onClose={() => setPreview(null)} />}
    </div>
  )
}

// ── Settings ─────────────────────────────────────────────────────────────────
export function MpmSettings() {
  const { settings, setSettings, clearHistory, companies, sources, addCompany, removeCompany, addSource, removeSource } = useMpm()
  const [co, setCo] = useState({ symbol: '', name: '', prevClose: '', sector: '' })
  const [coErr, setCoErr] = useState('')
  const [src, setSrc] = useState({ label: '', type: 'News', url: '' })
  const [srcErr, setSrcErr] = useState('')
  const submitCompany = () => {
    if (!co.symbol.trim()) return setCoErr('Enter the NSE symbol, for example ICICIBANK.')
    if (!(+co.prevClose > 0)) return setCoErr('Enter the previous close as a number, for example 1245.50.')
    if (!addCompany({ ...co, prevClose: +co.prevClose })) return setCoErr(`${co.symbol.toUpperCase()} is already in the list.`)
    setCo({ symbol: '', name: '', prevClose: '', sector: '' }); setCoErr('')
  }
  const submitSource = () => {
    if (!src.label.trim()) return setSrcErr('Enter a source name, for example Moneycontrol.')
    if (!addSource(src)) return setSrcErr(`${src.label} is already in the list.`)
    setSrc({ label: '', type: 'News', url: '' }); setSrcErr('')
  }
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }))
  const toggle = (k, id) => set(k, settings[k].includes(id) ? settings[k].filter((x) => x !== id) : [...settings[k], id])
  const addRecipient = () => {
    if (!/\S+@\S+\.\S+/.test(email)) return
    set('recipients', [...settings.recipients, { name: name || email, email }])
    setName(''); setEmail('')
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Settings"
        subtitle="Trigger rules, companies to monitor, sources and alert recipients."
        right={
          <button onClick={() => { if (window.confirm('Clear all investigations, reports and e-mail log?')) clearHistory() }} className="inline-flex items-center gap-1.5 border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:border-[#DA291C] hover:text-[#DA291C]">
            <Trash2 className="size-3.5" /> Clear history
          </button>
        }
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Trigger rules">
          <label className="block text-xs font-medium text-neutral-600">Threshold — move vs previous close (%)</label>
          <div className="mt-2 flex items-center gap-3">
            <input type="range" min="1" max="10" step="0.5" value={settings.threshold} onChange={(e) => set('threshold', +e.target.value)} className="flex-1 accent-[#86bc25]" />
            <span className="w-14 text-right text-lg font-bold tabular-nums">±{settings.threshold}%</span>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.indexAdjust} onChange={(e) => set('indexAdjust', e.target.checked)} className="accent-[#86bc25]" />
            Adjust for NIFTY 50 movement when assessing materiality
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={settings.autoEmailReport} onChange={(e) => set('autoEmailReport', e.target.checked)} className="accent-[#86bc25]" />
            E-mail the report automatically when ready
          </label>
          <p className="mt-3 text-[11px] text-neutral-500">Pre-9:30 (opening) and post-9:30 (intraday) moves are assessed separately.</p>
        </Card>

        <Card title="Companies monitored">
          <ul className="mb-4 flex flex-col divide-y divide-neutral-100">
            {companies.map((c) => (
              <li key={c.symbol} className="flex items-center gap-2 py-1.5 text-sm">
                <input type="checkbox" checked={settings.watchlist.includes(c.symbol)} onChange={() => toggle('watchlist', c.symbol)} className="accent-[#86bc25]" />
                <span className="font-medium">{c.short}</span>
                <span className="text-xs text-neutral-500">{c.symbol}</span>
                <span className="ml-auto text-xs tabular-nums text-neutral-500">Prev close ₹{Number(c.prevClose).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                {c.custom ? (
                  <button aria-label={`Remove ${c.symbol}`} onClick={() => removeCompany(c.symbol)}><Trash2 className="size-4 text-neutral-400 hover:text-[#DA291C]" /></button>
                ) : <span className="size-4" />}
              </li>
            ))}
          </ul>
          <p className="mb-2 text-xs font-medium text-neutral-600">Add a company</p>
          <div className="grid grid-cols-2 gap-2">
            <input value={co.symbol} onChange={(e) => setCo({ ...co, symbol: e.target.value })} placeholder="NSE symbol, e.g. ICICIBANK" className="border border-neutral-300 px-3 py-2 text-sm uppercase placeholder:normal-case" />
            <input value={co.name} onChange={(e) => setCo({ ...co, name: e.target.value })} placeholder="Company name" className="border border-neutral-300 px-3 py-2 text-sm" />
            <input value={co.prevClose} onChange={(e) => setCo({ ...co, prevClose: e.target.value })} placeholder="Previous close (₹)" inputMode="decimal" className="border border-neutral-300 px-3 py-2 text-sm" />
            <input value={co.sector} onChange={(e) => setCo({ ...co, sector: e.target.value })} placeholder="Sector (optional)" className="border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-[12px] text-[#DA291C]">{coErr}</p>
            <button onClick={submitCompany} className="inline-flex shrink-0 items-center gap-1 bg-neutral-900 px-3 py-2 text-xs font-semibold text-white"><Plus className="size-3.5" />Add company</button>
          </div>
        </Card>

        <Card title="Alert recipients" subtitle="Members who receive trigger alerts and reports">
          <ul className="mb-3 flex flex-col divide-y divide-neutral-100">
            {settings.recipients.map((r) => (
              <li key={r.email} className="flex items-center justify-between py-2 text-sm">
                <div><p className="font-medium">{r.name}</p><p className="text-xs text-neutral-500">{r.email}</p></div>
                <button aria-label={`Remove ${r.email}`} onClick={() => set('recipients', settings.recipients.filter((x) => x.email !== r.email))}>
                  <Trash2 className="size-4 text-neutral-400 hover:text-[#DA291C]" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="min-w-0 flex-1 border border-neutral-300 px-3 py-2 text-sm" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@company.com" className="min-w-0 flex-[2] border border-neutral-300 px-3 py-2 text-sm" />
            <button onClick={addRecipient} className="inline-flex items-center gap-1 bg-neutral-900 px-3 py-2 text-xs font-semibold text-white"><Plus className="size-3.5" />Add</button>
          </div>
        </Card>

        <Card title="Sources monitored">
          <ul className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {sources.map((s) => (
              <li key={s.id} className="flex items-center gap-2 border border-neutral-200 p-2 text-sm">
                <label className="flex min-w-0 flex-1 items-center gap-2">
                  <input type="checkbox" checked={settings.sources.includes(s.id)} onChange={() => toggle('sources', s.id)} className="accent-[#86bc25]" />
                  <SourceIcon name={s.label} />
                  <span className="truncate">{s.label}</span>
                  {s.custom && <span className="truncate text-[11px] text-neutral-400">{s.type}</span>}
                </label>
                {s.custom && (
                  <button aria-label={`Remove ${s.label}`} onClick={() => removeSource(s.id)}><Trash2 className="size-4 text-neutral-400 hover:text-[#DA291C]" /></button>
                )}
              </li>
            ))}
          </ul>
          <p className="mb-2 text-xs font-medium text-neutral-600">Add a source</p>
          <div className="grid grid-cols-2 gap-2">
            <input value={src.label} onChange={(e) => setSrc({ ...src, label: e.target.value })} placeholder="Name, e.g. Moneycontrol" className="border border-neutral-300 px-3 py-2 text-sm" />
            <select value={src.type} onChange={(e) => setSrc({ ...src, type: e.target.value })} className="border border-neutral-300 bg-white px-3 py-2 text-sm">
              {['News', 'Social', 'Forum', 'Blog', 'Regulatory', 'Other'].map((t) => <option key={t}>{t}</option>)}
            </select>
            <input value={src.url} onChange={(e) => setSrc({ ...src, url: e.target.value })} placeholder="Website or handle (optional), e.g. moneycontrol.com" className="col-span-2 border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-[12px] text-[#DA291C]">{srcErr}</p>
            <button onClick={submitSource} className="inline-flex shrink-0 items-center gap-1 bg-neutral-900 px-3 py-2 text-xs font-semibold text-white"><Plus className="size-3.5" />Add source</button>
          </div>
          <p className="mt-2 text-[11px] text-neutral-500">New sources are scanned on the next trigger and their items appear in the evidence log.</p>
        </Card>
      </div>
    </div>
  )
}
