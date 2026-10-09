// ─────────────────────────────────────────────────────────────────────────────
// E-mail templates for the MPM module.
// Table-based layout + inline styles so they render the same in Outlook, Gmail
// and mobile mail apps. In production, pass the returned HTML string as the
// `html` body to SMTP / SendGrid / Azure Communication Services.
// ─────────────────────────────────────────────────────────────────────────────
import { fmtDateTime, fmtINR, fmtTime, pct } from './mockData.js'

export const FROM = 'MPM Surveillance <mpm-alerts@example.com>'

const GREEN = '#86BC25'
const RED = '#DA291C'
const POS = '#1D9E75'
const INK = '#1a1a1a'
const MUTED = '#6b7280'
const LINE = '#e5e7eb'

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const appUrl = (path) => {
  try { return `${window.location.origin}${import.meta.env.BASE_URL}${path}` } catch { return path }
}
const dirColor = (d) => (d === 'negative' ? RED : d === 'positive' ? POS : MUTED)
const dirLabel = (d) => d.charAt(0).toUpperCase() + d.slice(1)

function shell({ preheader, title, body, ctaText, ctaHref }) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Segoe UI,Arial,Helvetica,sans-serif;color:${INK};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:100%;background:#ffffff;border:1px solid ${LINE};">
  <tr><td style="background:#000000;padding:14px 24px;">
    <div style="color:#ffffff;font-size:15px;font-weight:600;">Social Media Governance <span style="color:${GREEN};">|</span> Material Price Movement</div>
    <div style="color:#9ca3af;font-size:11px;margin-top:3px;">NSE/SURV/62122 · SEBI LODR Reg. 30(11)</div>
  </td></tr>
  <tr><td style="height:4px;background:${GREEN};line-height:4px;font-size:0;">&nbsp;</td></tr>
  ${body}
  ${ctaHref ? `<tr><td style="padding:8px 24px 24px;">
    <a href="${esc(ctaHref)}" style="display:inline-block;background:${GREEN};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 22px;">${esc(ctaText)}</a>
  </td></tr>` : ''}
  <tr><td style="padding:16px 24px;border-top:1px solid ${LINE};font-size:11px;line-height:1.6;color:${MUTED};">
    This is an automated message from the Material Price Movement monitoring system. The information is an input for NSE's own assessment and is not a regulatory determination. Do not forward outside the authorised distribution list.
  </td></tr>
</table>
</td></tr></table>
</body></html>`
}

function metricRow(items) {
  const w = Math.floor(100 / items.length)
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
  ${items.map(([label, value, color]) => `<td width="${w}%" style="padding:4px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${LINE};"><tr><td style="padding:10px 12px;">
      <div style="font-size:11px;color:${MUTED};">${esc(label)}</div>
      <div style="font-size:18px;font-weight:700;color:${color || INK};margin-top:2px;">${esc(value)}</div>
    </td></tr></table></td>`).join('')}
  </tr></table>`
}

// ── 1. Trigger alert ─────────────────────────────────────────────────────────
export function triggerAlertEmail(inc, settings) {
  const c = inc.company
  const price = c.prevClose * (1 + inc.stockPct / 100)
  const up = inc.stockPct >= 0
  const col = up ? POS : RED
  const adj = inc.stockPct - (settings.indexAdjust ? inc.indexPct : 0)
  const subject = `[MPM Alert] ${c.short} moved ${pct(inc.stockPct)} vs previous close`
  const body = `
  <tr><td style="padding:24px 24px 8px;">
    <div style="display:inline-block;background:${RED};color:#fff;font-size:11px;font-weight:700;padding:3px 8px;">PRICE TRIGGER</div>
    <h1 style="margin:12px 0 4px;font-size:22px;font-weight:600;">${esc(c.short)} ${up ? 'rose' : 'fell'} <span style="color:${col};">${pct(inc.stockPct)}</span> vs previous close</h1>
    <p style="margin:0;font-size:13px;color:${MUTED};">${esc(c.name)} (${esc(c.symbol)}) · Triggered ${fmtDateTime(inc.triggerAt)} IST · Ref ${esc(inc.id)}</p>
  </td></tr>
  <tr><td style="padding:12px 20px;">
    ${metricRow([
      ['Price at trigger', fmtINR(price), col],
      ['Previous close', fmtINR(c.prevClose)],
      ['NIFTY 50', pct(inc.indexPct)],
      ['Index-adjusted', pct(adj), Math.abs(adj) >= settings.threshold ? RED : INK],
    ])}
  </td></tr>
  <tr><td style="padding:8px 24px;font-size:14px;line-height:1.6;">
    The share price crossed the configured threshold of <b>±${settings.threshold}%</b>. The system has started an automatic investigation:
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:10px 0 4px;font-size:13px;">
      <tr><td style="padding:3px 8px 3px 0;color:${GREEN};font-weight:700;">✓</td><td>Alert sent to ${settings.recipients.length} configured members</td></tr>
      <tr><td style="padding:3px 8px 3px 0;color:#BA7517;font-weight:700;">●</td><td>Pulling data: X, YouTube, Reddit, Telegram, stock forums, digital news, BSE announcements, SEBI</td></tr>
      <tr><td style="padding:3px 8px 3px 0;color:${MUTED};font-weight:700;">○</td><td>AI rumour identification, clustering and direction classification</td></tr>
      <tr><td style="padding:3px 8px 3px 0;color:${MUTED};font-weight:700;">○</td><td>Material movement assessment and management report</td></tr>
    </table>
    <p style="margin:12px 0 0;background:#fffbeb;border-left:3px solid #BA7517;padding:10px 12px;font-size:13px;">
      The evidence-based report will follow by e-mail, target <b>within 3–4 hours</b> of the trigger. No action is needed yet.
    </p>
  </td></tr>`
  return {
    subject,
    html: shell({ preheader: `${c.short} ${pct(inc.stockPct)} — investigation started`, title: subject, body, ctaText: 'View live investigation', ctaHref: appUrl(`market-monitor/incident/${inc.id}`) }),
  }
}

// ── 2. Management report ─────────────────────────────────────────────────────
export function reportEmail(inc, settings, note) {
  const c = inc.company
  const r = inc.result
  const yes = r.verdict === 'YES'
  const subject = `[MPM Report] ${c.short}: ${r.headline}`
  const clusters = r.clusters.map((k, i) => `
    <tr>
      <td style="padding:8px 6px;border-bottom:1px solid ${LINE};color:${MUTED};vertical-align:top;">${i + 1}</td>
      <td style="padding:8px 6px;border-bottom:1px solid ${LINE};vertical-align:top;">
        <div style="font-weight:600;">${esc(k.title)}</div>
        <div style="font-size:12px;color:${MUTED};margin-top:2px;">First seen ${fmtTime(k.firstSeen)} · ${k.items} items · reach ${esc(k.reach)} · ${esc(k.sources.join(', '))}</div>
      </td>
      <td style="padding:8px 6px;border-bottom:1px solid ${LINE};vertical-align:top;color:${dirColor(k.direction)};font-weight:600;">${dirLabel(k.direction)}</td>
      <td align="right" style="padding:8px 6px;border-bottom:1px solid ${LINE};vertical-align:top;font-weight:700;">${Math.round(k.confidence * 100)}%</td>
    </tr>`).join('')
  const evidence = r.evidence.filter((e) => e[5] >= 0.5).slice(0, 6).map((e) => `
    <tr>
      <td style="padding:6px;border-bottom:1px solid ${LINE};white-space:nowrap;">${esc(e[0])}</td>
      <td style="padding:6px;border-bottom:1px solid ${LINE};white-space:nowrap;color:${MUTED};">${fmtTime(e[2])}</td>
      <td style="padding:6px;border-bottom:1px solid ${LINE};word-break:break-all;color:#3a6c00;">${esc(e[1])}</td>
      <td align="right" style="padding:6px;border-bottom:1px solid ${LINE};white-space:nowrap;">${Math.round(e[5] * 100)}%</td>
    </tr>`).join('')
  const body = `
  ${note ? `<tr><td style="padding:20px 24px 0;"><div style="background:#f9fafb;border-left:3px solid ${GREEN};padding:10px 12px;font-size:13px;line-height:1.6;"><b>Note from sender:</b> ${esc(note)}</div></td></tr>` : ''}
  <tr><td style="padding:24px 24px 8px;">
    <p style="margin:0;font-size:12px;color:${MUTED};">Material Price Movement Report · Ref ${esc(inc.id)}</p>
    <h1 style="margin:6px 0 4px;font-size:22px;font-weight:600;">${esc(c.short)} (${esc(c.symbol)})</h1>
    <p style="margin:0;font-size:13px;color:${MUTED};">Trigger ${fmtDateTime(inc.triggerAt)} IST · ${r.preOpen ? 'Pre-9:30 (opening)' : 'Post-9:30 (intraday)'} assessment</p>
  </td></tr>
  <tr><td style="padding:12px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${yes ? '#fef2f2' : '#f3f9e8'};"><tr>
      <td style="padding:14px 16px;width:150px;"><span style="display:inline-block;background:${yes ? RED : GREEN};color:#fff;font-weight:700;font-size:15px;padding:6px 12px;">Material: ${yes ? 'Yes' : 'No'}</span></td>
      <td style="padding:14px 16px 14px 0;font-size:15px;font-weight:600;">${esc(r.headline)}</td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:4px 20px;">
    ${metricRow([
      ['Share move', pct(inc.stockPct), inc.stockPct < 0 ? RED : POS],
      ['NIFTY 50', pct(inc.indexPct)],
      ['Index-adjusted', pct(r.adj), Math.abs(r.adj) >= settings.threshold ? RED : INK],
      ['Threshold', `±${settings.threshold}%`],
    ])}
  </td></tr>
  <tr><td style="padding:16px 24px 0;">
    <h2 style="margin:0 0 6px;font-size:15px;">AI summary</h2>
    <p style="margin:0;font-size:14px;line-height:1.65;">${esc(r.insight)}</p>
  </td></tr>
  <tr><td style="padding:18px 24px 0;">
    <h2 style="margin:0 0 6px;font-size:15px;">Potential rumours, ranked by confidence</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
      <tr style="color:${MUTED};font-size:11px;"><td style="padding:4px 6px;">#</td><td style="padding:4px 6px;">Story</td><td style="padding:4px 6px;">Direction</td><td align="right" style="padding:4px 6px;">Confidence</td></tr>
      ${clusters}
    </table>
  </td></tr>
  <tr><td style="padding:18px 24px 0;">
    <h2 style="margin:0 0 6px;font-size:15px;">Key evidence</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;">
      <tr style="color:${MUTED};font-size:11px;"><td style="padding:4px 6px;">Source</td><td style="padding:4px 6px;">Detected</td><td style="padding:4px 6px;">Link</td><td align="right" style="padding:4px 6px;">AI relevance</td></tr>
      ${evidence}
    </table>
    <p style="margin:6px 0 0;font-size:12px;color:${MUTED};">${r.evidence.length} evidence items retained with source, link and timestamp in the system.</p>
  </td></tr>
  ${settings.showNextSteps !== false ? `<tr><td style="padding:18px 24px 8px;">
    <h2 style="margin:0 0 6px;font-size:15px;">Suggested next steps for review</h2>
    <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.65;">${r.actions.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
  </td></tr>` : '<tr><td style="padding:0 0 8px;"></td></tr>'}`
  return {
    subject,
    html: shell({ preheader: `Material: ${yes ? 'Yes' : 'No'} — ${r.headline}`, title: subject, body, ctaText: 'Open full report', ctaHref: appUrl(`market-monitor/report/${inc.id}`) }),
  }
}

export function buildEmail(entry, inc, settings) {
  if (!inc) return null
  return entry.type === 'Trigger alert' ? triggerAlertEmail(inc, settings) : reportEmail(inc, settings, entry.note)
}
