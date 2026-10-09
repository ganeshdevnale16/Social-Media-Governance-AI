// ─────────────────────────────────────────────────────────────────────────────
// Material Price Movement (MPM) module — demo data
// All prices, posts, handles, links and figures are SIMULATED for demo purposes.
// In production these come from: market data feed (NSE/BSE), news APIs,
// social listening APIs (X, YouTube, Reddit), forum crawlers, BSE/SEBI scrapers,
// and Azure OpenAI / Claude for classification, clustering and report writing.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.BASE_URL

export const COMPANIES = [
  { symbol: 'SBICARD', name: 'SBI Cards and Payment Services Ltd.', short: 'SBI Card', prevClose: 872.4, sector: 'Financial Services' },
  { symbol: 'NSE', name: 'National Stock Exchange of India Ltd.', short: 'NSE', prevClose: 4180.0, sector: 'Capital Markets' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', short: 'HDFC Bank', prevClose: 1712.3, sector: 'Banking' },
  { symbol: 'INFY', name: 'Infosys Ltd.', short: 'Infosys', prevClose: 1520.65, sector: 'IT Services' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', short: 'Tata Motors', prevClose: 698.2, sector: 'Automobile' },
]

export const INDEX = { symbol: 'NIFTY 50', prevClose: 25210.5 }

export const SOURCES = [
  { id: 'x', label: 'X', logo: `${BASE}channel-logos/X.png` },
  { id: 'youtube', label: 'YouTube', logo: `${BASE}channel-logos/Youtube.png` },
  { id: 'reddit', label: 'Reddit', logo: `${BASE}channel-logos/Reddit.png` },
  { id: 'telegram', label: 'Telegram', logo: `${BASE}channel-logos/Telegram.png` },
  { id: 'forums', label: 'Stock Forums', logo: `${BASE}channel-logos/WebPage.png` },
  { id: 'news', label: 'Digital News', logo: `${BASE}channel-logos/WebPage.png` },
  { id: 'bse', label: 'BSE Announcements', logo: null, badge: 'BSE' },
  { id: 'sebi', label: 'SEBI / Regulatory', logo: null, badge: 'SEBI' },
]

export const DEFAULT_RECIPIENTS = [
  { name: 'Surveillance Desk', email: 'surveillance.desk@example.com' },
  { name: 'Company Secretary', email: 'company.secretary@example.com' },
  { name: 'Head – Investor Relations', email: 'ir.head@example.com' },
]

export const SCENARIOS = {
  'spike-rumour': { label: 'Spike (rumour)', direction: 'up', kind: 'rumour' },
  'crash-rumour': { label: 'Crash (rumour)', direction: 'down', kind: 'rumour' },
  'spike-official': { label: 'Spike (official news)', direction: 'up', kind: 'official' },
  'market-wide': { label: 'Market-wide fall', direction: 'down', kind: 'market' },
}

// ── helpers ─────────────────────────────────────────────────────────────────
export const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
export const fmtDateTime = (d) =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
export const fmtINR = (v) =>
  '₹' + Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const pct = (v) => `${v > 0 ? '+' : ''}${Number(v).toFixed(2)}%`

const minutes = (base, m) => new Date(base.getTime() + m * 60000)

function seeded(seed) {
  let s = seed
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280) - 0.5
}

// Intraday series around the trigger (minute resolution), stock vs index % move
export function buildSeries(triggerAt, finalStockPct, finalIndexPct, seed = 7) {
  const rnd = seeded(seed)
  const pts = []
  const start = -120
  const end = 30
  for (let m = start; m <= end; m += 3) {
    // move concentrated in the 40 minutes before trigger
    const k = m <= -40 ? 0 : m >= 0 ? 1 : (1 - Math.cos(Math.PI * ((m + 40) / 40))) / 2
    const kIdx = m <= -90 ? 0 : m >= 0 ? 1 : (m + 90) / 90
    pts.push({
      t: fmtTime(minutes(triggerAt, m)),
      m,
      stock: +(0.25 + finalStockPct * k + rnd() * 0.25 + (m > 0 ? rnd() * 0.3 : 0)).toFixed(2),
      index: +(finalIndexPct * kIdx + rnd() * 0.08).toFixed(2),
    })
  }
  return pts
}

// ── AI investigation builder (simulated LLM output) ─────────────────────────
export function buildInvestigation({ company, scenario, triggerAt, stockPct, indexPct, threshold, customSources = [] }) {
  const c = company
  const t = (m) => minutes(triggerAt, m)
  const slug = c.short.toLowerCase().replace(/\s+/g, '-')
  const adj = +(stockPct - indexPct).toFixed(2)
  const crossed = Math.abs(adj) >= threshold
  const preOpen = triggerAt.getHours() < 9 || (triggerAt.getHours() === 9 && triggerAt.getMinutes() < 30)

  let clusters = []
  let evidence = []
  let timeline = []
  let sourceHits = {}
  let verdict
  let headline
  let insight
  let actions

  if (scenario === 'crash-rumour') {
    clusters = [
      {
        id: 'C1', title: `Unverified claim of a large promoter/anchor stake sale in ${c.short}`, direction: 'negative',
        confidence: 0.88, items: 17, reach: '1.4M', firstSeen: t(-46), sources: ['X', 'Telegram', 'Stock Forums'],
        credibility: 'Low', propagation: 'Fast — originated from an anonymous X handle, amplified by 3 finance influencer accounts and 2 Telegram tip channels within 15 min',
        timing: 'First post 46 min before trigger; sell volume rose 9 min after the main X thread',
      },
      {
        id: 'C2', title: `Speculation about regulatory action against ${c.short}`, direction: 'negative',
        confidence: 0.57, items: 8, reach: '310K', firstSeen: t(-18), sources: ['Reddit', 'X'],
        credibility: 'Low', propagation: 'Moderate — opinion posts, no source cited',
        timing: 'Appeared after the fall had started — likely reaction, not cause',
      },
      {
        id: 'C3', title: `Re-circulated old news article about ${c.short} (2021)`, direction: 'negative',
        confidence: 0.21, items: 6, reach: '72K', firstSeen: t(-10), sources: ['Digital News', 'X'], duplicate: true,
        credibility: 'Medium', propagation: 'Low — genuine but outdated story',
        timing: 'Timing does not match the move',
      },
    ]
    evidence = [
      ['X', `x.com/mkt_insider_7x/status/18…${slug}`, t(-46), '42.1K views · 1.3K reposts', 'negative', 0.92, 'C1'],
      ['Telegram', `t.me/tips_channel_sim/…`, t(-41), '18K subscribers', 'negative', 0.85, 'C1'],
      ['Stock Forums', `forum.example.in/thread/${slug}-block-deal`, t(-37), '236 replies', 'negative', 0.83, 'C1'],
      ['YouTube', `youtube.com/watch?v=sim_${slug}01`, t(-28), '61K views', 'negative', 0.74, 'C1'],
      ['X', `x.com/fin_guru_sim/status/18…`, t(-22), '214K views', 'negative', 0.78, 'C1'],
      ['Reddit', `reddit.com/r/IndianStockMarket/…/${slug}`, t(-18), '380 upvotes', 'negative', 0.57, 'C2'],
      ['Digital News', `news.example.com/markets/${slug}-shares-slump`, t(-6), 'Tier-1 outlet', 'neutral', 0.51, '—'],
      ['Digital News', `news.example.com/2021/${slug}-old-story`, t(-10), 'Republished', 'negative', 0.21, 'C3'],
      ['BSE Announcements', 'No corporate announcement in trigger window', t(0), '—', 'neutral', 0, '—'],
      ['SEBI / Regulatory', 'No order / press release found', t(0), '—', 'neutral', 0, '—'],
    ]
    timeline = [
      [t(-46), 'social', 'First post on X claims a large stake sale is imminent (anonymous handle).'],
      [t(-41), 'social', 'Claim forwarded in 2 Telegram tip channels.'],
      [t(-37), 'price', 'Sell volume picks up; price starts falling.'],
      [t(-22), 'social', 'Finance influencer amplifies the claim (214K views).'],
      [t(-18), 'social', 'Regulatory-action speculation appears on Reddit.'],
      [t(0), 'trigger', `Index-adjusted move crosses −${threshold}% threshold.`],
      [t(0), 'check', 'No BSE announcement or SEBI release found for the window.'],
    ]
    sourceHits = { x: 1920, youtube: 48, reddit: 236, telegram: 112, forums: 418, news: 81, bse: 0, sebi: 0 }
    verdict = crossed ? 'YES' : 'NO'
    headline = crossed ? 'Material movement — likely rumour-driven (negative)' : 'Below threshold after index adjustment'
    insight = `${c.short} fell ${pct(stockPct)} against ${pct(indexPct)} for NIFTY 50, an index-adjusted move of ${pct(adj)}. The fall closely follows an unverified claim, first posted on X ${fmtTime(t(-46))}, that a large stake sale was imminent. The claim spread through Telegram tip channels and finance influencers before and during the fall. No corporate announcement on BSE and no regulatory release supports the claim. Two other negative clusters were assessed as reactions or duplicates, not causes.`
    actions = [
      `Verify the stake-sale claim with ${c.short}'s promoter / major shareholders.`,
      'If untrue, the company may confirm / deny under SEBI LODR Regulation 30(11).',
      'Keep cluster C1 under watch; refresh in 60 minutes.',
    ]
  } else if (scenario === 'spike-rumour') {
    clusters = [
      {
        id: 'C1', title: `Claim of a strategic tie-up / stake acquisition by a global player in ${c.short}`, direction: 'positive',
        confidence: 0.84, items: 21, reach: '1.9M', firstSeen: t(-52), sources: ['X', 'YouTube', 'Stock Forums'],
        credibility: 'Low', propagation: 'Fast — started on a stock forum, picked up by 4 YouTube channels and X',
        timing: 'First post 52 min before trigger; buy volume rose within 12 min of the YouTube video',
      },
      {
        id: 'C2', title: `Speculation of a special dividend / buyback at ${c.short}`, direction: 'positive',
        confidence: 0.46, items: 7, reach: '120K', firstSeen: t(-20), sources: ['Telegram', 'Reddit'],
        credibility: 'Low', propagation: 'Moderate', timing: 'After the move began',
      },
    ]
    evidence = [
      ['Stock Forums', `forum.example.in/thread/${slug}-big-news`, t(-52), '310 replies', 'positive', 0.88, 'C1'],
      ['YouTube', `youtube.com/watch?v=sim_${slug}02`, t(-44), '96K views', 'positive', 0.82, 'C1'],
      ['X', `x.com/stocks_buzz_sim/status/18…`, t(-38), '128K views · 2.1K reposts', 'positive', 0.8, 'C1'],
      ['X', `x.com/trader_desk_sim/status/18…`, t(-31), '64K views', 'positive', 0.71, 'C1'],
      ['Telegram', `t.me/multibagger_sim/…`, t(-20), '22K subscribers', 'positive', 0.46, 'C2'],
      ['Reddit', `reddit.com/r/IndiaInvestments/…/${slug}`, t(-14), '150 upvotes', 'positive', 0.41, 'C2'],
      ['Digital News', `news.example.com/markets/${slug}-shares-surge`, t(-4), 'Tier-1 outlet', 'neutral', 0.48, '—'],
      ['BSE Announcements', 'No corporate announcement in trigger window', t(0), '—', 'neutral', 0, '—'],
    ]
    timeline = [
      [t(-52), 'social', 'Forum post claims a global player will acquire a stake.'],
      [t(-44), 'social', 'YouTube video repeats the claim (96K views).'],
      [t(-40), 'price', 'Buy volume rises; price starts climbing.'],
      [t(-38), 'social', 'Claim trends on X with 2.1K reposts.'],
      [t(0), 'trigger', `Index-adjusted move crosses +${threshold}% threshold.`],
      [t(0), 'check', 'No BSE announcement found for the window.'],
    ]
    sourceHits = { x: 2240, youtube: 74, reddit: 150, telegram: 96, forums: 512, news: 66, bse: 0, sebi: 0 }
    verdict = crossed ? 'YES' : 'NO'
    headline = crossed ? 'Material movement — likely rumour-driven (positive)' : 'Below threshold after index adjustment'
    insight = `${c.short} rose ${pct(stockPct)} while NIFTY 50 moved ${pct(indexPct)}, an index-adjusted move of ${pct(adj)}. The rise follows an unverified claim of a strategic tie-up / stake acquisition, which started on a stock forum ${fmtTime(t(-52))} and was amplified on YouTube and X. The company has made no disclosure on BSE about any such transaction. Positive rumours also need verification, as they can mislead investors.`
    actions = [
      `Seek confirmation from ${c.short} on the reported tie-up / stake acquisition.`,
      'If unconfirmed, the company may clarify under SEBI LODR Regulation 30(11).',
      'Keep cluster C1 under watch; refresh in 60 minutes.',
    ]
  } else if (scenario === 'spike-official') {
    clusters = [
      {
        id: 'C1', title: `${c.short} disclosed quarterly results on BSE — profit ahead of street estimates`, direction: 'positive',
        confidence: 0.95, items: 1, reach: 'Official', firstSeen: t(-70), sources: ['BSE Announcements'], official: true,
        credibility: 'High', propagation: 'Official filing, widely reported', timing: 'Filed 70 min before trigger; move matches direction',
      },
      {
        id: 'C2', title: 'Media and analyst coverage of the results', direction: 'positive',
        confidence: 0.7, items: 26, reach: '2.6M', firstSeen: t(-55), sources: ['Digital News', 'X', 'YouTube'],
        credibility: 'High', propagation: 'Derived from the official filing', timing: 'Follows the filing',
      },
    ]
    evidence = [
      ['BSE Announcements', `bseindia.com/…/AnnPdfOpen.aspx?Pname=sim_${slug}`, t(-70), 'Official filing', 'positive', 0.95, 'C1'],
      ['Digital News', `news.example.com/markets/${slug}-q2-results`, t(-55), 'Tier-1 outlet', 'positive', 0.74, 'C2'],
      ['X', `x.com/markets_desk_sim/status/18…`, t(-48), '98K views', 'positive', 0.68, 'C2'],
      ['YouTube', `youtube.com/watch?v=sim_${slug}03`, t(-30), '40K views', 'positive', 0.6, 'C2'],
    ]
    timeline = [
      [t(-70), 'check', 'Company files quarterly results on BSE.'],
      [t(-55), 'social', 'News outlets publish results coverage.'],
      [t(-40), 'price', 'Price rises steadily.'],
      [t(0), 'trigger', `Index-adjusted move crosses +${threshold}% threshold.`],
    ]
    sourceHits = { x: 740, youtube: 22, reddit: 58, telegram: 30, forums: 140, news: 88, bse: 1, sebi: 0 }
    verdict = crossed ? 'YES' : 'NO'
    headline = crossed ? 'Material movement — explained by official disclosure' : 'Below threshold after index adjustment'
    insight = `${c.short} rose ${pct(stockPct)} versus ${pct(indexPct)} for NIFTY 50 (index-adjusted ${pct(adj)}). The move is in the same direction as, and follows, the company's quarterly results filed on BSE ${fmtTime(t(-70))}. Public discussion refers to the official filing. No unverified market-moving rumour was found.`
    actions = [
      'No clarification required — movement is attributable to the company’s own disclosure.',
      'Archive report and evidence trail.',
    ]
  } else {
    clusters = [
      {
        id: 'C1', title: 'Broad market sell-off on weak global cues', direction: 'negative',
        confidence: 0.8, items: 44, reach: '6.1M', firstSeen: t(-90), sources: ['Digital News', 'X'],
        credibility: 'High', propagation: 'Market-wide coverage', timing: `${c.short} moved in line with the index`,
      },
    ]
    evidence = [
      ['Digital News', 'news.example.com/markets/nifty-sensex-fall', t(-90), 'Tier-1 outlet', 'negative', 0.8, 'C1'],
      ['X', 'x.com/markets_desk_sim/status/18…', t(-75), '320K views', 'negative', 0.62, 'C1'],
      ['Stock Forums', 'forum.example.in/thread/market-crash-today', t(-40), '450 replies', 'neutral', 0.3, '—'],
    ]
    timeline = [
      [t(-90), 'social', 'Global markets weak; broad selling in Indian equities.'],
      [t(-60), 'price', `${c.short} and NIFTY 50 fall together.`],
      [t(0), 'trigger', 'Raw move crosses threshold; index-adjusted move does not.'],
    ]
    sourceHits = { x: 3120, youtube: 51, reddit: 290, telegram: 140, forums: 620, news: 190, bse: 0, sebi: 0 }
    verdict = crossed ? 'YES' : 'NO'
    headline = crossed ? 'Material movement' : 'Not material — move is market-wide'
    insight = `${c.short} fell ${pct(stockPct)} but NIFTY 50 fell ${pct(indexPct)} over the same period. The index-adjusted move of ${pct(adj)} is below the ${threshold}% threshold. No company-specific rumour was found.`
    actions = ['No action required under the material price movement framework.', 'Monitoring continues automatically.']
  }

  // Sources added by the user: scan them and attach matching items as evidence
  customSources.forEach((src, k) => {
    const lead = clusters[0]
    sourceHits[src.id] = 40 + ((src.label.length * 37 + k * 53) % 260)
    const host = (src.url || src.label.toLowerCase().replace(/[^a-z0-9]+/g, '') + '.com').replace(/^https?:\/\//, '').replace(/\/$/, '')
    evidence.splice(Math.max(evidence.length - 1, 1), 0, [
      src.label, `${host}/…/${slug}`, t(-30 + k * 7), `${12 + (k * 17) % 90} mentions`,
      lead.direction, +(0.42 + ((k * 11) % 25) / 100).toFixed(2), lead.id,
    ])
    if (!lead.sources.includes(src.label)) lead.sources = [...lead.sources, src.label]
  })

  const assessment = [
    { label: `Price move vs previous close ≥ ${threshold}%`, ok: Math.abs(stockPct) >= threshold, detail: pct(stockPct) },
    { label: 'Index-adjusted move ≥ threshold', ok: crossed, detail: `${pct(adj)} (NIFTY ${pct(indexPct)})` },
    { label: 'Market window', ok: true, detail: preOpen ? 'Pre-9:30 (opening) assessment' : 'Post-9:30 (intraday) assessment' },
    { label: 'Market-moving information found in public domain', ok: clusters[0].confidence >= 0.6, detail: `${clusters.length} cluster(s), top confidence ${Math.round(clusters[0].confidence * 100)}%` },
    { label: 'Information already disclosed by company', ok: !!clusters[0].official, detail: clusters[0].official ? 'Yes — BSE filing found' : 'No matching BSE / SEBI disclosure', invert: true },
    { label: 'Direction & timing consistent with price move', ok: scenario !== 'market-wide', detail: clusters[0].timing },
  ]

  return { clusters, evidence, timeline, sourceHits, verdict, headline, insight, actions, assessment, adj, preOpen }
}

export function reportAsText(inc) {
  const lines = [
    `MATERIAL PRICE MOVEMENT REPORT — ${inc.company.short} (${inc.company.symbol})`,
    `Reference: NSE/SURV/62122 | SEBI LODR Reg. 30(11)`,
    `Trigger: ${fmtDateTime(inc.triggerAt)} IST`,
    '',
    `Material movement: ${inc.result.verdict} — ${inc.result.headline}`,
    `Price move: ${pct(inc.stockPct)} | NIFTY 50: ${pct(inc.indexPct)} | Index-adjusted: ${pct(inc.result.adj)}`,
    '',
    'AI SUMMARY',
    inc.result.insight,
    '',
    'TOP RUMOUR CLUSTERS',
    ...inc.result.clusters.map((c, i) => `${i + 1}. [${c.direction.toUpperCase()}] ${c.title} — confidence ${Math.round(c.confidence * 100)}%, ${c.items} items, reach ${c.reach}`),
    '',
    'KEY EVIDENCE',
    ...inc.result.evidence.slice(0, 6).map((e) => `- ${e[0]} | ${fmtTime(e[2])} | ${e[1]}`),
    '',
    'SUGGESTED NEXT STEPS',
    ...inc.result.actions.map((a) => `- ${a}`),
    '',
    'This report is an input for NSE assessment and is not a regulatory determination.',
  ]
  return lines.join('\n')
}
