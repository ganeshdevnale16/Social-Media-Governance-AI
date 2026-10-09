import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { INCIDENTS_INITIAL } from "../mock/IncidentsData.js";


const C = {
  primary: "#004A50",
  primaryDark: "#007680",
  primaryMid: "#80C1C5",
  primaryLight: "#4DA7AE",
  bg: "#f5f5f5",
  white: "#ffffff",
  black: "#000000",
  gray50: "#f5f5f5",
  gray100: "#BBBCBC",
  gray200: "#A7A8AA",
  gray400: "#97999B",
  gray600: "#75787B",
  gray800: "#63666A",
};

// ─── Helper function to group incidents by platform category ─────────────────
function getPlatformCategory(platform) {
  const bloggingPlatforms = ["Quora", "Reddit"];
  const jobPlatforms = ["Kit Job", "Bebee"];
  const appPlatforms = ["App Store"];
  const suspiciousPlatforms = ["Web Page", "Domain", "Website"];

  if (bloggingPlatforms.some(p => platform?.includes(p))) return "Blogging Websites";
  if (jobPlatforms.some(p => platform?.includes(p))) return "Job Websites";
  if (appPlatforms.some(p => platform?.includes(p))) return "Apps/Apks";
  if (suspiciousPlatforms.some(p => platform?.includes(p))) return "Suspicious/Similar Domains";
  return "Suspicious/Similar Domains";
}

// ─── Compute data from incidents ────────────────────────────────────────────
function computeSummaryData() {
  const grouped = {};

  // Group incidents by platform category
  INCIDENTS_INITIAL.forEach(incident => {
    const category = getPlatformCategory(incident.platform);
    if (!grouped[category]) {
      grouped[category] = { incidents: [], closed: 0 };
    }
    grouped[category].incidents.push(incident);
    if (incident.ticketStatus === "Resolved") {
      grouped[category].closed++;
    }
  });

  // Build summary arrays
  const customerCare = Object.entries(grouped).map(([cat, data]) => ({
    cat,
    incidents: data.incidents.length,
    unique: data.incidents.length, // Using total count as unique for now
  }));

  const catShare = Object.entries(grouped).map(([name, data], idx) => ({
    name,
    value: data.incidents.length,
    color: [C.primary, C.primaryDark, C.primaryLight, C.primaryMid][idx % 4],
  }));

  const webAppStatus = Object.entries(grouped).map(([cat, data], idx) => ({
    cat,
    reported: data.incidents.length,
    unique: data.incidents.length,
    closed: data.closed,
  }));

  return {
    customerCare,
    catShare,
    webAppStatus,
    totalIncidents: INCIDENTS_INITIAL.length,
    totalUnique: INCIDENTS_INITIAL.length,
  };
}

const summaryData = computeSummaryData();
const customerCare = summaryData.customerCare;
const catShare = summaryData.catShare;
const webAppStatus = summaryData.webAppStatus;
const TOTAL_INCIDENTS = summaryData.totalIncidents;
const TOTAL_UNIQUE = summaryData.totalUnique;


const jobPromotions = summaryData.catShare.filter(c => c.name === "Job Websites").map(c => ({ name: c.name, value: c.value }));


// ─── Generate dynamic category trend data ──────────────────────────────────────
function generateCategoryTrendData() {
  const trends = {};
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  // Month multipliers to create variation in trend (progressive increase)
  const monthMultipliers = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3];

  // For each category from catShare, distribute total incidents across months with variation
  catShare.forEach(({ name, value: total }) => {
    // Calculate sum of multipliers to properly scale
    const multiplierSum = monthMultipliers.reduce((a, b) => a + b, 0);

    // Calculate exact proportional amounts
    const monthData = months.map((month, idx) => {
      return {
        date: month,
        exactAmount: (total * monthMultipliers[idx]) / multiplierSum,
      };
    });

    // Distribute using floor for months 0-4, remainder goes to month 5
    let remainingIncidents = total;
    const distributedData = monthData.map((item, idx) => {
      let incidents;
      if (idx < monthData.length - 1) {
        // Use floor for all months except the last
        incidents = Math.floor(item.exactAmount);
      } else {
        // Last month gets the remainder to ensure exact total
        incidents = remainingIncidents;
      }
      remainingIncidents -= incidents;

      return {
        date: item.date,
        incidents: incidents,
        unique: Math.floor(incidents * 0.7),
      };
    });

    trends[name] = distributedData;
  });

  return trends;
}

const categoryTrendData = generateCategoryTrendData();


// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: "8px 12px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <p style={{ fontWeight: 600, marginBottom: 4, color: C.black }}>{d.cat}</p>
      <p style={{ color: C.primaryDark, margin: "2px 0" }}>Incidents: <strong>{d.incidents}</strong></p>
      <p style={{ color: C.gray600, margin: "2px 0" }}>Unique: <strong>{d.unique}</strong></p>
    </div>
  );
};

const WebAppStatusTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        fontSize: 13, // default font size
      }}
    >
      <p
        style={{
          fontWeight: 500,
          fontSize: 14,
          color: "#000",
          marginBottom: 6,
        }}
      >
        {label}
      </p>

      {payload.map((item) => (
        <p
          key={item.dataKey}
          style={{
            margin: "4px 0",
            color: item.color, // uses bar color
            fontSize: 12,      // value font size
            fontWeight: 500,
          }}
        >
          {item.name}:{" "}
          <strong
            style={{
              fontSize: 13,
              color: "#111827",
              fontWeight: 700,
            }}
          >
            {item.value}
          </strong>
        </p>
      ))}
    </div>
  );
};


// ─── Trend Tooltip ────────────────────────────────────────────────────────────
const TrendTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: "8px 12px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <p style={{ fontWeight: 600, marginBottom: 4, color: C.black }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.dataKey === "incidents" ? C.primaryDark : C.primary, margin: "2px 0" }}>
          {p.dataKey.charAt(0).toUpperCase() + p.dataKey.slice(1)}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};


// ─── Dumbbell Chart ───────────────────────────────────────────────────────────
function CustomerCareDumbbellChart() {
  const maxVal = Math.max(...customerCare.map((d) => d.incidents));


  const DumbbellShape = (props) => {
    const { x, y, width, height, incidents, unique } = props;
    if (!width || !height) return null;
    const Left_padding = 18;
    const scale = width / incidents;
    const x1 = x + Left_padding + unique * scale;
    const x2 = x + Left_padding + width;
    const cy = y + height / 2;
    return (
      <g>
        <line x1={x1} y1={cy} x2={x2} y2={cy} stroke="rgba(68,102,7,0.35)" strokeWidth={2.5} />
        <circle cx={x1} cy={cy} r={6} fill={C.gray400} />
        <circle cx={x2} cy={cy} r={6} fill={C.primaryDark} />
        <text x={x1 - 10} y={cy} textAnchor="end" dominantBaseline="middle" fontSize={9} fontWeight={500} fill={C.gray600}>{unique}</text>
        <text x={x2 + 10} y={cy} textAnchor="start" dominantBaseline="middle" fontSize={9} fontWeight={500} fill={C.primaryDark}>{incidents}</text>
      </g>
    );
  };


  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 16, fontSize: 11, color: C.gray600, marginBottom: 6, justifyContent: "flex-end" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.gray400, display: "inline-block" }} />
          Unique
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.primaryDark, display: "inline-block" }} />
          Incidents
        </span>
      </div>
      <p style={{ fontSize: 11, marginBottom: 12, color: C.gray600 }}>
        <span style={{ color: C.primaryDark, fontWeight: 700 }}>Total Incidents: {TOTAL_INCIDENTS}</span>
        <span style={{ margin: "0 6px" }}>|</span>
        <span style={{ color: C.gray600, fontWeight: 700 }}>Total Unique: {TOTAL_UNIQUE}</span>
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={customerCare} layout="vertical" margin={{ top: 8, right: 40, bottom: 8, left: 0 }} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke={C.gray100} />
          <XAxis type="number" domain={[0, maxVal + 10]} tick={{ fontSize: 10, fill: C.gray400 }} tickLine={false} axisLine={false} tickCount={6} />
          <YAxis type="category" dataKey="cat" width={160} tick={{ fontSize: 11, fill: C.gray600 }} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload;
              if (!d) return null;
              return (
                <div style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>{d.cat}</p>
                  <p style={{ color: C.primaryDark, margin: "2px 0" }}>Incidents: <strong>{d.incidents}</strong></p>
                  <p style={{ color: C.gray600, margin: "2px 0" }}>Unique: <strong>{d.unique}</strong></p>
                </div>
              );
            }}
          />
          <Bar
            dataKey="incidents"
            fill="transparent"
            isAnimationActive={false}
            shape={(props) => <DumbbellShape {...props} incidents={props.incidents} unique={props.unique} />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


// ─── Area Chart Component ─────────────────────────────────────────────────────
function CategoriesTrendChart({ height = 260, data }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="gradIncidents" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.primaryDark} stopOpacity={0.5} />
            <stop offset="100%" stopColor={C.primaryDark} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="gradUnique" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.primary} stopOpacity={0.55} />
            <stop offset="100%" stopColor={C.primary} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="4 4"
          stroke={C.gray100}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: C.gray400 }}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis
          tick={{ fontSize: 11, fill: C.gray400 }}
          axisLine={false}
          tickLine={false}
          width={36}
          tickCount={5}
        />
        <Tooltip content={<TrendTip />} />
        {/* Unique rendered FIRST so it appears behind Incidents */}
        <Area
          type="monotone"
          dataKey="unique"
          stroke={C.primary}
          strokeWidth={2}
          fill="url(#gradUnique)"
          dot={false}
          activeDot={{ r: 5, fill: C.primary, strokeWidth: 0 }}
          name="Unique Incidents"
        />
        <Area
          type="monotone"
          dataKey="incidents"
          stroke={C.primaryDark}
          strokeWidth={2}
          fill="url(#gradIncidents)"
          dot={false}
          activeDot={{ r: 5, fill: C.primaryDark, strokeWidth: 0 }}
          name="Total Incidents"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}


// ─── Export Helpers ───────────────────────────────────────────────────────────
function exportCSV(data, filename) {
  if (!data?.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}


function exportPNG(containerRef, filename) {
  const node = containerRef?.current;
  if (!node) return;
  const doExport = () => {
    window.htmlToImage
      .toPng(node, { backgroundColor: "#ffffff", pixelRatio: 2, skipFonts: false })
      .then((dataUrl) => {
        const a = document.createElement("a");
        a.href = dataUrl; a.download = `${filename}.png`; a.click();
      })
      .catch((err) => console.error("Export failed:", err));
  };
  if (window.htmlToImage) {
    doExport();
  } else {
    const existing = document.getElementById("htmltoimage-script");
    if (existing) { existing.addEventListener("load", doExport); return; }
    const script = document.createElement("script");
    script.id = "htmltoimage-script";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.js";
    script.onload = doExport;
    script.onerror = () => console.error("Failed to load html-to-image");
    document.head.appendChild(script);
  }
}


// ─── Expand Modal ─────────────────────────────────────────────────────────────
function ExpandModal({ title, onClose, children }) {
  useEffect(() => {
    function handler(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col border border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
          <button type="button" onClick={onClose} className="flex size-8 items-center justify-center text-neutral-500 hover:bg-neutral-100">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}


// ─── Chart Menu ───────────────────────────────────────────────────────────────
function ChartMenu({ title, csvData, chartRef, onExpand }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);


  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);


  const menuItems = [
    {
      label: "Export to CSV",
      icon: (<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>),
      action: () => { exportCSV(csvData, title); setOpen(false); },
    },
    {
      label: "Export to PNG",
      icon: (<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>),
      action: () => { exportPNG(chartRef, title); setOpen(false); },
    },
    {
      label: "Expand",
      icon: (<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>),
      action: () => { onExpand(); setOpen(false); },
    },
  ];


  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex size-8 items-center justify-center border border-neutral-300 bg-white text-neutral-500 hover:border-neutral-400 hover:bg-neutral-50">
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-44 border border-neutral-200 bg-white py-1 shadow-lg">
          {menuItems.map(({ label, icon, action }) => (
            <button key={label} type="button" onClick={action} className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
              <span className="text-neutral-500">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, badge, badgeBg = C.primary, badgeText = C.white, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.black, fontFamily: "'DM Sans', sans-serif" }}>{title}</span>
        {badge && (
          <span style={{ background: badgeBg, color: badgeText, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>{badge}</span>
        )}
      </div>
      {sub && <p style={{ fontSize: 11, color: C.gray400, marginTop: 2 }}>{sub}</p>}
    </div>
  );
}


function Card({ children, className = "", cardRef }) {
  return (
    <div ref={cardRef} className={`bg-white px-5 py-2.5 border border-neutral-200 ${className}`}>
      {children}
    </div>
  );
}


function StatusCard({ iconSrc, value, label, children }) {
  const hasIcon = Boolean(iconSrc);
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center border border-neutral-200 bg-white p-4 text-center">
      {hasIcon ? <img src={iconSrc} alt="" className="size-6 shrink-0 object-contain" decoding="async" /> : null}
      <p className={`text-3xl font-bold leading-none tracking-tight text-black tabular-nums ${hasIcon ? "mt-3" : ""}`}>{value}</p>
      <p className="mt-1.5 text-xs font-medium leading-snug text-neutral-600">{label}</p>
      {children ? <div className="mt-auto w-full pt-2">{children}</div> : null}
    </div>
  );
}


const RADIAN = Math.PI / 180;
function DonutLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}


export default function WebSummary() {
  const [expanded, setExpanded] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Blogging Websites");


  const webAppStatusRef = useRef(null);
  const jobPromotionsRef = useRef(null);
  const categoryShareRef = useRef(null);
  const categoryTrendRef = useRef(null);
  const takedownPieRef = useRef(null);
  const customerCareRef = useRef(null);
  const offersRef = useRef(null);


  const csvMap = {
    webAppStatus: webAppStatus,
    jobPromotions: jobPromotions,
    categoryShare: catShare.map(({ name, value }) => ({ name, value })),
    categoryTrend: categoryTrendData[selectedCategory],
    customerCare: customerCare,
    offers: [],
  };


  const Legend2 = ({ items }) => (
    <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
      {items.map(({ c, l, op = 1 }) => (
        <span key={l} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.gray600 }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: c, opacity: op, display: "inline-block" }} />
          {l}
        </span>
      ))}
    </div>
  );


  return (
    <main className="min-h-0 flex-1 overflow-auto bg-neutral-100 p-4 lg:p-4">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="h-8 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
          <h2 className="text-xl font-semibold text-neutral-900">Web/App Summary</h2>
        </div>
      </div>


      {/* ── Status Cards ── */}
      <section className="mb-3 grid gap-3 grid-cols-3">
        <Link to="/web-incidents" className="block transition hover:shadow-lg focus:outline-none">
          <StatusCard iconSrc={`${import.meta.env.BASE_URL}/status-icons/Incidents.png`} value={INCIDENTS_INITIAL.length} label="Incidents Reported" />
        </Link>
        <Link to="/web-incidents" className="block transition hover:shadow-lg focus:outline-none">
          <StatusCard iconSrc={`${import.meta.env.BASE_URL}/status-icons/underReview.png`} value={INCIDENTS_INITIAL.length} label="Under Brand Review" />
        </Link>
        <Link to="/web-incidents" className="block transition hover:shadow-lg focus:outline-none">
          <StatusCard iconSrc={`${import.meta.env.BASE_URL}/status-icons/takedown.png`} value={INCIDENTS_INITIAL.filter(i => i.ticketStatus === "Resolved").length} label="Closed Incidents" />
        </Link>
        {/* <div className="col-span-2">
         <StatusCard label="Takedown Status">
           <div className="grid grid-cols-3 gap-0.5 border-t border-neutral-200 pt-2 text-center">
             {(() => {
               const takenDown = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "Taken Down").length;
               const noAction = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "No Action").length;
               const recommendedToLegal = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "Recommended to Legal").length;
               return [
                 [takenDown, "Taken down"],
                 [noAction, "No action"],
                 [recommendedToLegal, "Recommended to legal"]
               ];
             })().map(([v, l]) => (
               <div key={l} className="min-w-0 px-0.5">
                 <p className="text-lg font-semibold tabular-nums text-neutral-900">{v}</p>
                 <p className="mt-0.5 text-xs font-medium leading-tight text-neutral-500">{l}</p>
               </div>
             ))}
           </div>
         </StatusCard>
       </div> */}
      </section>


      {/* ── Row 1: Web/App Status + Takedown Status Pie ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card cardRef={webAppStatusRef}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <SectionHeader title="Web / App Status" />
            <ChartMenu title="Web App Status" csvData={csvMap.webAppStatus} chartRef={webAppStatusRef} onExpand={() => setExpanded("webAppStatus")} />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={webAppStatus} margin={{ top: 10, right: 5, bottom: 10, left: 0 }} barGap={10} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.gray100} vertical={false} />
              <XAxis dataKey="cat" tick={{ fontSize: 11, fill: C.gray600, fontWeight: 600 }} axisLine={false} tickLine={false} tickMargin={16} interval={0} height={60} />
              <YAxis tick={{ fontSize: 11, fill: C.gray400 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip content={<WebAppStatusTip />} />
              <Bar dataKey="reported" fill="#007680" name="Reported Volume" barSize={26} />
              <Bar dataKey="unique" fill="#ED8B00" name="Unique" barSize={26} />
              <Bar dataKey="closed" fill="#FFCD00" name="Closed" barSize={26} />
            </BarChart>
          </ResponsiveContainer>
          <Legend2 items={[{ c: "#007680", l: "Reported Volume" }, { c: "#ED8B00", l: "Unique" }, { c: "#FFCD00", l: "Closed" }]} />
        </Card>

        <Card cardRef={takedownPieRef}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <SectionHeader title="Takedown Status" />
            <ChartMenu title="Takedown Status" csvData={(() => {
              const takenDown = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "Taken Down").length;
              const noAction = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "No Action").length;
              const recommendedToLegal = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "Recommended to Legal").length;
              return [
                { status: "Taken Down", value: takenDown },
                { status: "No Action", value: noAction },
                { status: "Recommended to Legal", value: recommendedToLegal }
              ];
            })()} chartRef={takedownPieRef} onExpand={() => setExpanded("takedownStatusPie")} />
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {(() => {
                  const takenDown = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "Taken Down").length;
                  const noAction = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "No Action").length;
                  const recommendedToLegal = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "Recommended to Legal").length;
                  const pieData = [
                    { name: "Taken Down", value: takenDown, color: C.primaryDark },
                    { name: "No Action", value: noAction, color: C.primaryMid },
                    { name: "Recommended to Legal", value: recommendedToLegal, color: C.primary }
                  ];
                  return (
                    <>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={88} dataKey="value" labelLine={false} label={DonutLabel}>
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <text x="50%" y="47%" textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={C.black}>{INCIDENTS_INITIAL.length}</text>
                      <text x="50%" y="57%" textAnchor="middle" dominantBaseline="central" fontSize={11} fill={C.gray400}>Total Count</text>
                    </>
                  );
                })()}
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
            {(() => {
              const takenDown = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "Taken Down").length;
              const noAction = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "No Action").length;
              const recommendedToLegal = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "Recommended to Legal").length;
              return [
                { value: takenDown, label: "Taken Down", color: C.primaryDark },
                { value: noAction, label: "No Action", color: C.primaryMid },
                { value: recommendedToLegal, label: "Recommended to Legal", color: C.primary }
              ];
            })().map(({ value, label, color }) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.gray600 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                {label}: <strong style={{ color: C.black }}>{value}</strong>
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Row 2: Category Share + Incidents Trend ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14, marginBottom: 14 }}>
        <Card cardRef={categoryShareRef}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <SectionHeader title="Category Share" />
            <ChartMenu title="Category Share" csvData={csvMap.categoryShare} chartRef={categoryShareRef} onExpand={() => setExpanded("categoryShare")} />
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catShare} cx="50%" cy="50%" innerRadius={58} outerRadius={88} dataKey="value" labelLine={false} label={DonutLabel}>
                  {catShare.map((e, i) => <Cell key={i} fill={e.color} style={{ cursor: "pointer" }} onClick={() => setSelectedCategory(e.name)} />)}
                </Pie>
                <text x="50%" y="47%" textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={C.black}>{TOTAL_INCIDENTS}</text>
                <text x="50%" y="57%" textAnchor="middle" dominantBaseline="central" fontSize={11} fill={C.gray400}>Total Count</text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px", marginTop: 4 }}>
            {catShare.map((e) => (
              <span key={e.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: C.gray600 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                {e.name}: <strong style={{ color: C.black }}>{e.value}</strong>
              </span>
            ))}
          </div>
        </Card>

        <Card cardRef={categoryTrendRef}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.black }}>Incidents Trend ({selectedCategory})</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ChartMenu title="Categories Trend" csvData={csvMap.categoryTrend} chartRef={categoryTrendRef} onExpand={() => setExpanded("categoryTrend")} />
            </div>
          </div>
          <CategoriesTrendChart height={260} data={categoryTrendData[selectedCategory]} />
          <Legend2 items={[{ c: C.primaryDark, op: 0.9, l: "Total Incidents" }, { c: C.primary, l: "Unique Incidents" }]} />
        </Card>
      </div>


      {/* ── Expand Modals ── */}
      {expanded === "webAppStatus" && (
        <ExpandModal title="Web / App Status" onClose={() => setExpanded(null)}>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={webAppStatus} margin={{ top: 10, right: 20, bottom: 10, left: 0 }} barGap={10} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.gray100} vertical={false} />
              <XAxis dataKey="cat" tick={{ fontSize: 12, fill: C.gray600, fontWeight: 600 }} axisLine={false} tickLine={false} tickMargin={16} interval={0} height={90} />
              <YAxis tick={{ fontSize: 12, fill: C.gray400 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="reported" fill="#007680" radius={[0, 0, 0, 0]} name="Reported Volume" barSize={32} />
              <Bar dataKey="unique" fill="#ED8B00" radius={[0, 0, 0, 0]} name="Unique" barSize={32} />
              <Bar dataKey="closed" fill="#FFCD00" radius={[0, 0, 0, 0]} name="Closed" barSize={32} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            {[{ c: "#007680", l: "Reported Volume" }, { c: "#ED8B00", l: "Unique" }, { c: "#FFCD00", l: "Closed" }].map(({ c, l }) => (
              <span key={l} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.gray600 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: c, display: "inline-block" }} /> {l}
              </span>
            ))}
          </div>
        </ExpandModal>
      )}


      {expanded === "categoryShare" && (
        <ExpandModal title="Category Share" onClose={() => setExpanded(null)}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 48, paddingTop: 24, paddingBottom: 24 }}>
            <ResponsiveContainer width={300} height={300}>
              <PieChart>
                <Pie data={catShare} cx="50%" cy="50%" innerRadius={80} outerRadius={130} dataKey="value" labelLine={false} label={DonutLabel}>
                  {catShare.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <text x="50%" y="47%" textAnchor="middle" dominantBaseline="central" fontSize={32} fontWeight={800} fill={C.black}>{TOTAL_INCIDENTS}</text>
                <text x="50%" y="57%" textAnchor="middle" dominantBaseline="central" fontSize={13} fill={C.gray400}>Total Count</text>
              </PieChart>
            </ResponsiveContainer>
            <ul style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {catShare.map((e) => (
                <li key={e.name} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.gray600 }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                  <span>{e.name}: <strong style={{ color: C.black }}>{e.value}</strong></span>
                </li>
              ))}
            </ul>
          </div>
        </ExpandModal>
      )}


      {expanded === "categoryTrend" && (
        <ExpandModal
          title={`Incidents Trend (${selectedCategory})`}
          onClose={() => setExpanded(null)}
        >
          <CategoriesTrendChart
            height={400}
            data={categoryTrendData[selectedCategory]}
          />

          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              marginTop: 12,
            }}
          >
            {[
              { c: C.primaryDark, l: "Incidents" },
              { c: C.primary, l: "Unique" },
            ].map(({ c, l }) => (
              <span
                key={l}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: C.gray600,
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: c,
                    display: "inline-block",
                  }}
                />
                {l}
              </span>
            ))}
          </div>
        </ExpandModal>
      )}

      {expanded === "takedownStatusPie" && (
        <ExpandModal title="Takedown Status" onClose={() => setExpanded(null)}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 48, paddingTop: 24, paddingBottom: 24 }}>
            <ResponsiveContainer width={300} height={300}>
              <PieChart>
                {(() => {
                  const takenDown = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "Taken Down").length;
                  const noAction = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "No Action").length;
                  const recommendedToLegal = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "Recommended to Legal").length;
                  const pieData = [
                    { name: "Taken Down", value: takenDown, color: C.primaryDark },
                    { name: "No Action", value: noAction, color: C.primaryMid },
                    { name: "Recommended to Legal", value: recommendedToLegal, color: C.primary }
                  ];
                  return (
                    <>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={130} dataKey="value" labelLine={false} label={DonutLabel}>
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <text x="50%" y="47%" textAnchor="middle" dominantBaseline="central" fontSize={32} fontWeight={800} fill={C.black}>{INCIDENTS_INITIAL.length}</text>
                      <text x="50%" y="57%" textAnchor="middle" dominantBaseline="central" fontSize={13} fill={C.gray400}>Total Count</text>
                    </>
                  );
                })()}
              </PieChart>
            </ResponsiveContainer>
            <ul style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(() => {
                const takenDown = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "Taken Down").length;
                const noAction = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "No Action").length;
                const recommendedToLegal = INCIDENTS_INITIAL.filter(i => i.takedownStatus === "Recommended to Legal").length;
                return [
                  { value: takenDown, label: "Taken Down", color: C.primaryDark },
                  { value: noAction, label: "No Action", color: C.primaryMid },
                  { value: recommendedToLegal, label: "Recommended to Legal", color: C.primary }
                ];
              })().map(({ value, label, color }) => (
                <li key={label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.gray600 }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span>{label}: <strong style={{ color: C.black }}>{value}</strong></span>
                </li>
              ))}
            </ul>
          </div>
        </ExpandModal>
      )}


      {expanded === "customerCare" && (
        <ExpandModal title="Customer Care Number" onClose={() => setExpanded(null)}>
          <p style={{ fontSize: 13, marginBottom: 16, color: C.black }}>
            <span style={{ color: C.primary, fontWeight: 700 }}>Total Incidents Count : {TOTAL_INCIDENTS}</span>
            <span style={{ color: C.primary, fontWeight: 700, marginLeft: 10 }}>, Total Unique Count : {TOTAL_UNIQUE}</span>
          </p>
          <CustomerCareDumbbellChart />
        </ExpandModal>
      )}


      {expanded === "offers" && (
        <ExpandModal title="Offers" onClose={() => setExpanded(null)}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
            <p style={{ fontSize: 15, color: C.gray400, fontStyle: "italic" }}>No Data Found !</p>
          </div>
        </ExpandModal>
      )}
    </main>
  );
}

