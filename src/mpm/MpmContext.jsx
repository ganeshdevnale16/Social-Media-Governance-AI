import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { COMPANIES, SOURCES, INDEX, DEFAULT_RECIPIENTS, SCENARIOS, buildInvestigation, buildSeries } from './mockData.js'

const MpmContext = createContext(null)
export const useMpm = () => useContext(MpmContext)

// Pipeline stages for each incident (timings are compressed for the demo;
// production target is a full report within 3–4 hours of the trigger)
export const STAGES = [
  { key: 'trigger', label: 'Trigger detected', at: 0 },
  { key: 'alert', label: 'Alert e-mailed', at: 1200 },
  { key: 'pull', label: 'Pulling data from sources', at: 2400 },
  { key: 'classify', label: 'AI identification & clustering', at: 6500 },
  { key: 'assess', label: 'Material movement assessment', at: 8500 },
  { key: 'report', label: 'Report ready & shared', at: 10500 },
]

// ── Persistence: keeps investigations, reports, e-mail log and settings across
// page refresh and when a link from an e-mail opens the app in a new tab.
const STORE_KEY = 'mpm-state-v1'
function loadStored() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    // finish any pipeline that was interrupted by a reload
    data.incidents = (data.incidents || []).map((i) => {
      const elapsed = Date.now() - new Date(i.triggerAt).getTime()
      let stage = 0
      STAGES.forEach((s, k) => { if (elapsed >= s.at) stage = k })
      return { ...i, stage: Math.max(i.stage, stage) }
    })
    return data
  } catch {
    return null
  }
}

const newQuote = (c) => {
  const start = c.prevClose * (1 + (Math.random() - 0.5) * 0.008)
  return { symbol: c.symbol, price: start, history: Array.from({ length: 40 }, () => start), shock: null }
}
const initialQuotes = (companies) => {
  const q = {}
  companies.forEach((c) => { q[c.symbol] = newQuote(c) })
  q[INDEX.symbol] = { symbol: INDEX.symbol, price: INDEX.prevClose * 1.001, history: [], shock: null }
  return q
}

export function MpmProvider({ children }) {
  const stored = useRef(loadStored()).current
  const [companies, setCompanies] = useState(stored?.companies || COMPANIES)
  const [sources, setSources] = useState(stored?.sources || SOURCES)
  const [quotes, setQuotes] = useState(() => initialQuotes(stored?.companies || COMPANIES))
  const [settings, setSettings] = useState(stored?.settings || {
    threshold: 3,
    indexAdjust: true,
    watchlist: COMPANIES.map((c) => c.symbol),
    recipients: DEFAULT_RECIPIENTS,
    sources: ['x', 'youtube', 'reddit', 'telegram', 'forums', 'news', 'bse', 'sebi'],
    autoEmailReport: true,
  })
  const [incidents, setIncidents] = useState(stored?.incidents || [])
  const [emails, setEmails] = useState(stored?.emails || [])
  const [toasts, setToasts] = useState([])
  const [paused, setPaused] = useState(false)

  const quotesRef = useRef(quotes)
  const settingsRef = useRef(settings)
  const incidentsRef = useRef(incidents)
  const companiesRef = useRef(companies)
  const sourcesRef = useRef(sources)
  useEffect(() => { companiesRef.current = companies }, [companies])
  useEffect(() => { sourcesRef.current = sources }, [sources])
  const pendingScenario = useRef({})
  useEffect(() => { quotesRef.current = quotes }, [quotes])
  useEffect(() => { settingsRef.current = settings }, [settings])
  useEffect(() => { incidentsRef.current = incidents }, [incidents])
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ settings, incidents, emails, companies, sources })) } catch { /* storage full or blocked */ }
  }, [settings, incidents, emails, companies, sources])

  const clearHistory = useCallback(() => {
    setIncidents([]); setEmails([])
    try { localStorage.removeItem(STORE_KEY) } catch { /* ignore */ }
  }, [])

  const pushToast = useCallback((t) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((ts) => [...ts, { id, ...t }])
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 6000)
  }, [])

  const sendEmail = useCallback((mail) => {
    const entry = { id: Math.random().toString(36).slice(2), at: new Date(), status: 'Delivered', ...mail }
    setEmails((e) => [entry, ...e])
    return entry
  }, [])

  const createIncident = useCallback((symbol, stockPct, indexPct, scenario) => {
    const company = companiesRef.current.find((c) => c.symbol === symbol)
    const s = settingsRef.current
    const customSources = sourcesRef.current.filter((x) => x.custom && s.sources.includes(x.id))
    const triggerAt = new Date()
    const id = `MPM-${triggerAt.getTime().toString().slice(-6)}`
    const result = buildInvestigation({ company, scenario, triggerAt, stockPct, indexPct: s.indexAdjust ? indexPct : 0, threshold: s.threshold, customSources })
    const series = buildSeries(triggerAt, stockPct, indexPct, symbol.length * 13)
    const inc = { id, company, scenario, triggerAt, stockPct, indexPct, stage: 0, result, series, direction: stockPct >= 0 ? 'up' : 'down' }
    setIncidents((list) => [inc, ...list])

    pushToast({
      tone: 'alert',
      title: `Price trigger: ${company.short} ${stockPct > 0 ? '+' : ''}${stockPct.toFixed(2)}%`,
      body: 'Alert e-mail sent. Data pulling started.',
      link: `/market-monitor/incident/${id}`,
    })

    STAGES.forEach((st, i) => {
      if (i === 0) return
      setTimeout(() => {
        setIncidents((list) => list.map((x) => (x.id === id ? { ...x, stage: Math.max(x.stage, i) } : x)))
        const rcpts = settingsRef.current.recipients.map((r) => r.email)
        if (st.key === 'alert') {
          sendEmail({
            incidentId: id, type: 'Trigger alert', to: rcpts,
            subject: `[MPM Alert] ${company.short} moved ${stockPct > 0 ? '+' : ''}${stockPct.toFixed(2)}% vs previous close`,
          })
        }
        if (st.key === 'report') {
          if (settingsRef.current.autoEmailReport) {
            sendEmail({
              incidentId: id, type: 'Management report', to: rcpts,
              subject: `[MPM Report] ${company.short}: ${result.headline}`,
            })
          }
          pushToast({
            tone: result.verdict === 'YES' ? 'alert' : 'ok',
            title: `Report ready: ${company.short}`,
            body: `Material movement: ${result.verdict}. ${result.headline}`,
            link: `/market-monitor/report/${id}`,
          })
        }
      }, st.at)
    })
    return id
  }, [pushToast, sendEmail])

  // Live feed tick (simulated). Production: websocket from market data vendor.
  useEffect(() => {
    if (paused) return
    const iv = setInterval(() => {
      const prev = quotesRef.current
      const next = {}
      const idx = prev[INDEX.symbol]
      let idxPrice = idx.price * (1 + (Math.random() - 0.5) * 0.0006)
      if (idx.shock) {
        idxPrice = idx.price + (idx.shock.target - idx.price) / Math.max(idx.shock.steps, 1)
      }
      next[INDEX.symbol] = {
        ...idx, price: idxPrice,
        shock: idx.shock && idx.shock.steps > 1 ? { ...idx.shock, steps: idx.shock.steps - 1 } : null,
      }
      companiesRef.current.forEach((c) => {
        const q = prev[c.symbol] || newQuote(c)
        let p = q.price * (1 + (Math.random() - 0.5) * 0.0016)
        if (q.shock) p = q.price + (q.shock.target - q.price) / Math.max(q.shock.steps, 1) + (Math.random() - 0.5) * c.prevClose * 0.0005
        next[c.symbol] = {
          ...q, price: p,
          history: [...q.history.slice(-59), p],
          shock: q.shock && q.shock.steps > 1 ? { ...q.shock, steps: q.shock.steps - 1 } : null,
        }
      })
      setQuotes(next)

      // trigger detection
      const s = settingsRef.current
      const idxChg = ((next[INDEX.symbol].price - INDEX.prevClose) / INDEX.prevClose) * 100
      companiesRef.current.forEach((c) => {
        if (!s.watchlist.includes(c.symbol) || !next[c.symbol]) return
        const chg = ((next[c.symbol].price - c.prevClose) / c.prevClose) * 100
        const scen = pendingScenario.current[c.symbol]
        // raw move crosses threshold → open an investigation (index adjustment is assessed inside)
        if (Math.abs(chg) >= s.threshold) {
          const open = incidentsRef.current.find((i) => i.company.symbol === c.symbol && Date.now() - new Date(i.triggerAt).getTime() < 5 * 60000)
          if (!open && !next[c.symbol].shock) {
            const scenario = scen || (chg > 0 ? 'spike-rumour' : 'crash-rumour')
            delete pendingScenario.current[c.symbol]
            incidentsRef.current = [{ company: c, triggerAt: new Date() }, ...incidentsRef.current]
            createIncident(c.symbol, +chg.toFixed(2), +idxChg.toFixed(2), scenario)
          }
        }
      })
    }, 1500)
    return () => clearInterval(iv)
  }, [paused, createIncident])

  // Demo control: inject a price shock that will cross the threshold
  const simulate = useCallback((symbol, scenarioKey) => {
    const sc = SCENARIOS[scenarioKey]
    const company = companiesRef.current.find((c) => c.symbol === symbol)
    const thr = settingsRef.current.threshold
    const sign = sc.direction === 'up' ? 1 : -1
    const move = scenarioKey === 'market-wide' ? thr + 1.2 : thr + 0.8 + Math.random() * 1.5
    pendingScenario.current[symbol] = scenarioKey
    setQuotes((q) => {
      const n = { ...q, [symbol]: { ...q[symbol], shock: { target: company.prevClose * (1 + (sign * move) / 100), steps: 5 } } }
      if (scenarioKey === 'market-wide') {
        n[INDEX.symbol] = { ...q[INDEX.symbol], shock: { target: INDEX.prevClose * (1 - (move - 1.1) / 100), steps: 5 } }
      }
      return n
    })
  }, [])

  const resetPrice = useCallback((symbol) => {
    const c = companiesRef.current.find((x) => x.symbol === symbol)
    setQuotes((q) => ({
      ...q,
      [symbol]: { ...q[symbol], shock: { target: c.prevClose * 1.002, steps: 4 } },
      [INDEX.symbol]: { ...q[INDEX.symbol], shock: { target: INDEX.prevClose * 1.001, steps: 4 } },
    }))
  }, [])

  // ── add / remove companies and sources ─────────────────────────────────────
  const addCompany = useCallback(({ symbol, name, prevClose, sector }) => {
    const sym = symbol.trim().toUpperCase().replace(/\s+/g, '')
    if (!sym || !(prevClose > 0) || companiesRef.current.some((c) => c.symbol === sym)) return false
    const c = { symbol: sym, name: name.trim() || sym, short: (name.trim() || sym).replace(/\s+(Ltd\.?|Limited)$/i, ''), prevClose: +prevClose, sector: sector.trim() || 'Other', custom: true }
    setCompanies((list) => [...list, c])
    setQuotes((q) => ({ ...q, [sym]: newQuote(c) }))
    setSettings((s) => ({ ...s, watchlist: [...s.watchlist, sym] }))
    return true
  }, [])
  const removeCompany = useCallback((symbol) => {
    setCompanies((list) => list.filter((c) => c.symbol !== symbol))
    setSettings((s) => ({ ...s, watchlist: s.watchlist.filter((x) => x !== symbol) }))
  }, [])
  const addSource = useCallback(({ label, type, url }) => {
    const l = label.trim()
    if (!l) return false
    const id = 'src-' + l.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    if (sourcesRef.current.some((x) => x.id === id || x.label.toLowerCase() === l.toLowerCase())) return false
    const badge = { News: 'NEWS', Social: 'SOC', Forum: 'FRM', Regulatory: 'REG', Blog: 'BLOG', Other: 'WEB' }[type] || 'WEB'
    setSources((list) => [...list, { id, label: l, type, url: url.trim(), logo: null, badge, custom: true }])
    setSettings((s) => ({ ...s, sources: [...s.sources, id] }))
    return true
  }, [])
  const removeSource = useCallback((id) => {
    setSources((list) => list.filter((x) => x.id !== id))
    setSettings((s) => ({ ...s, sources: s.sources.filter((x) => x !== id) }))
  }, [])

  const value = {
    companies, sources, addCompany, removeCompany, addSource, removeSource,
    quotes, settings, setSettings, incidents, emails, sendEmail, toasts, setToasts, pushToast,
    simulate, resetPrice, paused, setPaused, clearHistory,
  }
  return <MpmContext.Provider value={value}>{children}</MpmContext.Provider>
}
