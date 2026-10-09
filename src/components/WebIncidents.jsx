import { useState, useMemo, useRef, useEffect  } from "react";
import { ExternalLink } from "lucide-react";
import {
  BadgeCheck,     // Taken Down
  CircleOff,      // No Action
  Gavel, 
  ChevronDown,
} from "lucide-react";
import { fontString } from "chart.js/helpers";
import {INCIDENTS_INITIAL} from "../mock/IncidentsData.js";

function downloadCSV(data, filename) {
  if (!data?.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h] ?? "";
      const str = String(val);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}



const PriorityBadge = ({ priority }) => {
  const config = {
    // Critical: { dot: "bg-red-500",    text: "text-red-700",    bg: "bg-red-50",    border: "border-red-200" },
    High:     { dot: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
    // Medium:   { dot: "bg-[#86BC25]",  text: "text-[#5a8019]",  bg: "bg-[#f3fae0]", border: "border-[#cce87a]" },
    Low:      { dot: "bg-blue-500",   text: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200" },
  };
  const c = config[priority] || config.Low;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border ${c.bg} ${c.text} ${c.border}`}
      style={{ fontWeight: 600, fontSize: "9px", letterSpacing: "0.02em", whiteSpace: "nowrap" }}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {priority}
    </span>
  );
};

const CategoryBadge = ({ category }) => {
  const config = {
    "Phishing":            {     border: "border-gray-200" },
    "Social Media":        {  border: "border-gray-200" },
    "Counterfeit":         {  border: "border-gray-200" },
    "Fake Handles":     {   border: "border-gray-200" },
    "Fake Customer Care No": { border: "border-gray-200" },
    "Fake App":            {    border: "border-gray-200" },
  };
  const c = config[category] || { border: "border-gray-200" };
  return (
      <span
        className={`inline-block px-1 py-1 border ${c.bg} ${c.text} ${c.border}`}
        style={{
          fontSize: "9px",
          fontWeight: 600,
          letterSpacing: "0.05em",
          whiteSpace: "normal",
          wordBreak: "break-word",
          lineHeight: "1.2",
          maxWidth: "100%",
          textAlign: "center",
        }}
      >
        {category.toUpperCase()}
      </span>
  );
};


const TicketStatusChip = ({ status, onMarkResolve }) => {
  if (!status || status === "NA") {
    return <span style={{ fontSize: "9px" }} className="text-gray-300 font-medium">—</span>;
  }

  const positive = ["Resolved", "Completed", "Takedown Sent", "Sent"];
  const isPositive = positive.includes(status);

  const CheckIcon = () => (
    <svg className="w-3.5 h-3.5 text-[#86BC25] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );

  const WarnIcon = () => (
    <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );

  if (status === "Unresolved") {
    return (
      <div className="flex flex-col gap-1.5 items-start">
        {/* Status label */}
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600" style={{ fontSize: "10px", whiteSpace: "nowrap" }}>
          <WarnIcon />
          Unresolved
        </span>
        {/* Mark Resolve button — always visible */}
        <button
          onClick={onMarkResolve}
          className="inline-flex items-center gap-1 px-1 py-1 font-bold text-[#26890d] border border-[#26890d] bg-white cursor-pointer"
          style={{ fontSize: "10px", whiteSpace: "nowrap", lineHeight: 1.4 }}
        >
          <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Mark Resolve
        </button>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600" style={{ fontSize: "10px", whiteSpace: "nowrap" }}>
      {isPositive ? <CheckIcon /> : <WarnIcon />}
      {status}
    </span>
  );
};

const StatusChip = ({ status }) => {
  const config = {
    "Taken Down": {
      icon: BadgeCheck,
      text: "text-[#5a8019]",
    },
    "No Action": {
      icon: CircleOff,
      text: "text-amber-600",
    },
    "Recommended to Legal": {
      icon: Gavel,
      text: "text-red-600",
    },
  };

  const c = config[status];

  if (!c) {
    return <span className="text-gray-300 text-xs font-medium">—</span>;
  }

  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold ${c.text}`}
      style={{
        fontSize: "10px",
        whiteSpace: "normal",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        lineHeight: "1.2",
        maxWidth: "100%",
      }}
    >
      <Icon size={10} strokeWidth={2.2} />
      <span>{status}</span>
    </span>
  );
};

const FilterPill = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative flex items-center gap-1 text-xs">
      <span className="font-medium whitespace-nowrap text-gray-400">
        {label}
      </span>

      <span className="text-gray-300">|</span>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 bg-transparent cursor-pointer text-xs font-semibold text-gray-700"
      >
        <span>{value}</span>

        <ChevronDown
          className={`h-3 w-3 text-gray-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[120px] overflow-hidden rounded-md bg-white shadow-lg">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={`block cursor-pointer w-full px-3 py-2 text-left text-xs transition-colors
                ${
                  value === o
                    ? "bg-neutral-100 font-semibold text-gray-900"
                    : "text-gray-700 hover:bg-neutral-50"
                }`}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


const COLUMNS = [
  { label: "ID",                        width: 95 },
  { label: "Date",                      width: 80 },
  { label: "Brand",                     width: 70 },
  { label: "Platform",                  width: 69 },
  { label: "Category",                  width: 100 },
  { label: "Contact No",                width: 90 },
  { label: "Trademark Used",            width: 75 },
  { label: "Handle Name",               width: 90 },
  { label: "Priority",                  width: 80 },
  // { label: "Ticket ID",                 width: 90  },
  { label: "Ticket Status",             width: 93 },
  { label: "Take Down Status",          width: 105 },
];


export default function IncidentsTable() {
  // ── lift incidents into state so Mark Resolve can mutate it ──
  const [incidents, setIncidents] = useState(INCIDENTS_INITIAL);

  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(new Set());
  const [filters, setFilters]   = useState({
    priority: "All",
    category: "All",
    platform: "All",
    status:   "All",
    takedown: "All",
  });

  const priorities = ["All", "High", "Low"];
  const categories = ["All", ...new Set(incidents.map((i) => i.category))];
  const platforms  = ["All", ...new Set(incidents.map((i) => i.platform))];
  const statuses   = ["All", ...new Set(incidents.map((i) => i.ticketStatus))];
  const takedowns  = ["All", ...new Set(incidents.map((i) => i.takedownStatus))];

  const filtered = useMemo(() => {
    return incidents.filter((row) => {
      const q = search.toLowerCase();
      return (
        (!q || JSON.stringify(row).toLowerCase().includes(q)) &&
        (filters.priority === "All" || row.priority       === filters.priority) &&
        (filters.category === "All" || row.category       === filters.category) &&
        (filters.platform === "All" || row.platform       === filters.platform) &&
        (filters.status   === "All" || row.ticketStatus   === filters.status)   &&
        (filters.takedown === "All" || row.takedownStatus === filters.takedown)
      );
    });
  }, [incidents, search, filters]);

  // ── Mark a single incident as Resolved ───────────────────────────────────
  const handleMarkResolve = (id) => {
    setIncidents((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, ticketStatus: "Resolved" } : row
      )
    );
  };

  const toggleRow = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = (checked) => {
    setSelected(checked ? new Set(filtered.map((r) => r.id)) : new Set());
  };

  const allChecked  = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const someChecked = filtered.some((r) => selected.has(r.id));

  const handleSampleCSV = () => {
    downloadCSV(filtered, "incidents_export");
  };

  const tdBase = (extra = {}) => ({
    padding: "10px 12px",
    fontSize: 12,
    color: "#555",
    borderBottom: "1px solid #f0f0f0",
    verticalAlign: "top",
    wordBreak: "break-word",
    overflowWrap: "break-word",
    whiteSpace: "normal",
    ...extra,
  });

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#f5f5f5",
        minHeight: "100vh",
        height: "139vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .tbl-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(134,188,37,0.9) #f1f5f9;
        }
        .tbl-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .tbl-scroll::-webkit-scrollbar-track { background: #f8fafc; }
        .tbl-scroll::-webkit-scrollbar-thumb {
          background: rgba(134,188,37,0.9);
          border-radius: 9999px;
          border: 2px solid #f8fafc;
        }
        .tbl-scroll::-webkit-scrollbar-thumb:hover { background: rgba(104,147,25,0.95); }
        .inc-row:hover td { background: #f9fdf2 !important; }
        .inc-row.sel td   { background: #f3fae0 !important; }
      `}</style>

      <div
        className="max-w-screen-2xl mx-auto px-4 py-4"
        style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, width: "100%" }}
      >
        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3" style={{ flexShrink: 0 }}>
          <div className="flex items-center gap-3">
            <span className="h-8 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
            <h2 className="text-xl font-semibold text-neutral-900">Web/App Incidents</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-[#f3fae0] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0l-3 3m3-3l3 3" />
              </svg>
              Bulk Takedown
            </button>
            <button
              onClick={handleSampleCSV}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M8 12l4 4 4-4M12 4v12" />
              </svg>
              Sample CSV
            </button>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-white border border-gray-200 px-4 py-3 mb-3 shadow-sm" style={{ flexShrink: 0 }}>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 pb-1 border-b border-gray-100 mb-1">
            <FilterPill label="Priority"        value={filters.priority} options={priorities} onChange={(v) => setFilters((f) => ({ ...f, priority: v }))} />
            <FilterPill label="Category"        value={filters.category} options={categories} onChange={(v) => setFilters((f) => ({ ...f, category: v }))} />
            <FilterPill label="Platform"        value={filters.platform} options={platforms}  onChange={(v) => setFilters((f) => ({ ...f, platform: v }))} />
            <FilterPill label="Status"          value={filters.status}   options={statuses}   onChange={(v) => setFilters((f) => ({ ...f, status: v }))} />
            <FilterPill label="Takedown Status" value={filters.takedown} options={takedowns}  onChange={(v) => setFilters((f) => ({ ...f, takedown: v }))} />
            <button
              onClick={() => setFilters({ priority: "All", category: "All", platform: "All", status: "All", takedown: "All" })}
              className="ml-auto text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID or Handle..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 outline-none focus:border-[#86BC25] transition-colors bg-[#f9f9f9] placeholder:text-gray-400"
              />
            </div>
            <button className="px-3 py-1.5 text-xs font-semibold text-white bg-[#26890d] transition-colors">Submit</button>
            
            {/* <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Columns</span>
              <select className="text-xs border border-gray-200 px-2 py-1.5 outline-none bg-white text-gray-600 hover:border-[#86BC25] transition-colors cursor-pointer">
                <option>All</option>
                <option>Essential</option>
              </select>
              <button className="p-2 text-gray-400 hover:text-[#86BC25] border border-gray-200 bg-white hover:border-[#86BC25] transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M8 12l4 4 4-4M12 4v12" />
                </svg>
              </button>
            </div> */}
          </div>
        </div>

        {/* ── Table Card ── */}
        <div
          className="bg-white border border-gray-200 shadow-sm"
          style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          <div className="tbl-scroll" style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <table
              style={{
                borderCollapse: "separate",
                borderSpacing: 0,
                tableLayout: "fixed",
                width: "100%",
              }}
            >
              <colgroup>
                <col style={{ width: 30 }} />
                {COLUMNS.map((c) => <col key={c.label} style={{ width: c.width }} />)}
              </colgroup>

              <thead>
                <tr>
                  <th
                    style={{
                      position: "sticky", top: 0, zIndex: 20,
                      background: "#26890d",
                      padding: "3px 3px",
                      borderRight: "1px solid #78ab1a",
                      textAlign: "center",
                      width: 30,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(el) => { if (el) el.indeterminate = !allChecked && someChecked; }}
                      onChange={(e) => toggleAll(e.target.checked)}
                      style={{  width: 14, height: 14, cursor: "pointer", accentColor: "white" }}
                    />
                  </th>
                  {COLUMNS.map((col, i) => (
                    <th
                      key={col.label}
                      style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 20,
                        background: "#26890d",
                        color: "white",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "7px 3px",
                        textAlign: "center",

                        borderRight:
                          i < COLUMNS.length - 1
                            ? "1px solid #78ab1a"
                            : "none",

                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        lineHeight: "1.2",
                        verticalAlign: "middle",
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length + 1} style={{ textAlign: "center", padding: 48, color: "#bbb", fontSize: 13 }}>
                      No incidents match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, i) => {
                    const isSel = selected.has(row.id);
                    const rowBg = isSel ? "#f3fae0" : i % 2 === 0 ? "#fff" : "#fafafa";
                    const td = (extra = {}) => ({ ...tdBase({ background: rowBg }), ...extra });

                    return (
                      <tr key={row.id} className={`inc-row${isSel ? " sel" : ""}`}>
                        <td style={td({ textAlign: "center", verticalAlign: "middle" })}>
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => toggleRow(row.id)}
                            style={{ width: 12, height: 12, cursor: "pointer", accentColor: "#86BC25" }}
                          />
                        </td>
                        <td className="text-center" style={td({ fontSize: 10, color: "#888" })}>
                          <a
                            href={row.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#86BC25", fontSize: 10, fontFamily: "'DM Mono', monospace", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                          >
                            {row.id}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="text-center" style={td({ fontSize: 10, color: "#888", whiteSpace: "nowrap" })}>{row.date}</td>
                        <td style={td({ fontSize: 10, fontWeight: 500, color: "#222" })}>{row.brand}</td>
                        <td style={td({ fontSize: 10 })}>{row.platform}</td>
                        <td style={td()}><CategoryBadge category={row.category} /></td>
                        <td className="text-center" style={td({ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa" })}>{row.contactNo}</td>
                        <td style={td({ fontSize: 10, color: "#666" })}>{row.trademarkUsed}</td>
                        <td style={td({ fontSize: 10, color: "#555", wordBreak: "break-word" })}>{row.handleName}</td>
                        <td style={td()}><PriorityBadge priority={row.priority} /></td>
                        {/* <td className="text-center" style={td({ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#888" })}>{row.ticketId}</td> */}

                        {/* ── Ticket Status — uses TicketStatusChip with Mark Resolve ── */}
                        <td style={td()}>
                          <TicketStatusChip
                            status={row.ticketStatus}
                            onMarkResolve={() => handleMarkResolve(row.id)}
                          />
                        </td>

                        <td style={td()}><StatusChip status={row.takedownStatus} /></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Footer ── */}
          <div
            className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-[#fafafa]"
            style={{ flexShrink: 0 }}
          >
            <span className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{" "}
              <span className="font-semibold text-gray-600">{incidents.length}</span> results
              {selected.size > 0 && (
                <span className="ml-2 text-[#86BC25] font-semibold">· {selected.size} selected</span>
              )}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}


