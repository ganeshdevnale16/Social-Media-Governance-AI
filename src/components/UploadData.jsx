import { useState, useEffect, useRef } from "react";
import { UploadCloud, FileText, X, Loader2, Link2, Pause, Play } from "lucide-react";
import Chart from "chart.js/auto";
import mockResult from "../mock/per_lens_insights.json";

const STEP0_STATS = {
  totalPosts: "19,671",
  platforms: 5,
  languages: 14,
  timePeriod: "Jan 2026 – Mar 2026",
};

const PLATFORM_DATA = [
  { label: "Amazon",    pct: 47, color: "#004F59" },
  { label: "Flipkart",  pct: 38, color: "#004F59" },
  { label: "Facebook",  pct: 9, color: "#004F59" },
  { label: "Instagram", pct:  4, color: "#004F59" },
  { label: "Others",    pct:  2, color: "#004F59" },
];

const CLASSIFICATION_DATA = [
  { category: "Suspicious Claims & Information",  pct: 2 },
  { category: "Response Accountability",  pct: 25 },
  { category: "Customer Escalation Signals",          pct: 22 },
  { category: "Resolution Orientation",    pct: 18 },
  { category: "Brand Promise Consistency",      pct: 16 },
  { category: "Fraud & Impersonation Signals",         pct: 6 },
  { category: "Tone & Professionalism",       pct: 4 },
  { category: "Transparency & Disclosure",       pct: 3 },
  { category: "Community Sentiment Shift",     pct: 3 },
  { category: "Moderation Governance",        pct: 2 },
  { category: "Misinformation & Clarification",           pct: 1 },
];

const SENTIMENT_DATA = { positive: 33, neutral: 46, negative: 21 };


function PlatformChart() {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: PLATFORM_DATA.map(d => d.label),
        datasets: [{
          data: PLATFORM_DATA.map(d => d.pct),
          backgroundColor: PLATFORM_DATA.map(d => d.color),
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x}%` } },
        },
        scales: {
          x: {
            max: 50,
            ticks: { callback: v => `${v}%`, font: { size: 11 } },
            grid: { color: "#f0f0f0" },
          },
          y: {
            ticks: { font: { size: 12, weight: "600" } },
            grid: { display: false },
          },
        },
      },
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, []);
  return (
    <div style={{ position: "relative", width: "100%", height: `${PLATFORM_DATA.length * 44 + 40}px` }}>
      <canvas ref={canvasRef} />
    </div>
  );
}


function SentimentChart() {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: ["Positive", "Neutral", "Negative"],
        datasets: [{
          data: [SENTIMENT_DATA.positive, SENTIMENT_DATA.neutral, SENTIMENT_DATA.negative],
          backgroundColor: ["#86BC25", "#94a3b8", "#ef4444"],
          borderWidth: 0,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } },
        },
      },
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, []);
  return (
    <div style={{ position: "relative", width: "100%", height: "200px" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}


function FadeIn({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
    }}>
      {children}
    </div>
  );
}


function SectionLabel({ text }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: "#9ca3af", marginBottom: 10,
    }}>
      {text}
    </p>
  );
}

function Step0Panel() {
  return (
    <FadeIn delay={300}>
      <div style={{
        marginTop: 16, background: "#fff",
        border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <SectionLabel text="Data overview" />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["Total posts processed", STEP0_STATS.totalPosts],
                ["Platforms covered",     STEP0_STATS.platforms],
                ["Languages detected",    STEP0_STATS.languages],
                ["Time period",           STEP0_STATS.timePeriod],
              ].map(([label, val], i, arr) => (
                <tr key={i} style={{ borderBottom: i < arr.length - 1 ? "1px solid #f7f7f7" : "none" }}>
                  <td style={{ padding: "10px 0", fontSize: 13, color: "#6b7280", width: "55%" }}>{label}</td>
                  <td style={{ padding: "10px 0", fontSize: 14, fontWeight: 700, color: "#111827", textAlign: "right" }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <SectionLabel text="Platform distribution" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 18px", marginBottom: 14 }}>
            {PLATFORM_DATA.map(p => (
              <span key={p.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#555" }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                {p.label} — {p.pct}%
              </span>
            ))}
          </div>
          <PlatformChart />
        </div>
      </div>
    </FadeIn>
  );
}

function Step2Panel() {
  return (
    <FadeIn delay={300}>
      <div style={{
        marginTop: 16, background: "#fff",
        border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <SectionLabel text="Category classification" />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                {["Category", "Share", "Distribution"].map((h, i) => (
                  <th key={i} style={{
                    padding: "6px 0",
                    fontSize: 10, fontWeight: 700, color: "#9ca3af",
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    textAlign: i === 0 ? "left" : "right",
                    paddingLeft: i === 2 ? 16 : 0,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLASSIFICATION_DATA.map((row, i) => (
                <tr key={i} style={{ borderBottom: i < CLASSIFICATION_DATA.length - 1 ? "1px solid #f7f7f7" : "none" }}>
                  <td style={{ padding: "9px 0", fontSize: 13, color: "#374151" }}>{row.category}</td>
                  <td style={{ padding: "9px 0", fontSize: 13, fontWeight: 700, color: "#86BC25", textAlign: "right" }}>{row.pct}%</td>
                  <td style={{ padding: "9px 0", paddingLeft: 16 }}>
                    <div style={{ width: 120, height: 5, background: "#f0f0f0", borderRadius: 999, overflow: "hidden", marginLeft: "auto" }}>
                      <div style={{ width: `${(row.pct / 40) * 100}%`, height: "100%", background: "#86BC25", borderRadius: 999 }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "center" }}>
          <div>
            <SectionLabel text="Sentiment distribution" />
            {[
              { label: "Positive", val: SENTIMENT_DATA.positive, color: "#86BC25", bg: "#f0f9e8" },
              { label: "Neutral",  val: SENTIMENT_DATA.neutral,  color: "#94a3b8", bg: "#f8fafc" },
              { label: "Negative", val: SENTIMENT_DATA.negative, color: "#ef4444", bg: "#fef2f2" },
            ].map(s => (
              <div key={s.label} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 12px", borderRadius: 10, background: s.bg,
                marginBottom: 8, border: `1px solid ${s.color}22`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                  <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{s.label}</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.val}%</span>
              </div>
            ))}
          </div>
          <SentimentChart />
        </div> */}
      </div>
    </FadeIn>
  );
}

function UploadData({ setStep, step, setResult }) {
  const [files,          setFiles]          = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [message,        setMessage]        = useState("");
  const [progress,       setProgress]       = useState(0);
  const [currentDetails, setCurrentDetails] = useState([]);
  const [showStep0Panel, setShowStep0Panel] = useState(false);
  const [showStep2Panel, setShowStep2Panel] = useState(false);
  const [showDetails,    setShowDetails]    = useState(true);
  const [isPaused,       setIsPaused]       = useState(false);
  const pausedRef                           = useRef(false);

  const handlePause  = () => { pausedRef.current = true;  setIsPaused(true);  };
  const handleResume = () => { pausedRef.current = false; setIsPaused(false); };

  const waitWhilePaused = () => new Promise(resolve => {
    const check = () => { if (!pausedRef.current) return resolve(); setTimeout(check, 200); };
    check();
  });

  const pauseAwareSleep = async (ms) => {
    const sliceMs = 200;
    const slices  = Math.ceil(ms / sliceMs);
    for (let i = 0; i < slices; i++) {
      await waitWhilePaused();
      await new Promise(r => setTimeout(r, Math.min(sliceMs, ms - i * sliceMs)));
    }
  };

  const handleFiles = (e) => {
    const f = e.target.files[0];
    if (f) { setFiles([f]); setProgress(0); }
  };

  const removeFile = (i) => {
    setFiles(files.filter((_, j) => j !== i));
    setProgress(0);
  };

  const runAgentFlow = async () => {
    for (let i = 1; i <= 20; i++) {
      await new Promise(r => setTimeout(r, 100));
      setProgress(Math.round((i / 20) * 100));
    }

    const agents = [
      {
        step: 0,
        message: "Social Data Ingestion Agent",
        time: 15000,
        details: [
          "Aggregating social conversations from uploaded dataset",
          "Interpreting data structure, format, and metadata",
          "Detecting encoding and content language variations",
          "Validating data schema and columns",
        ],
        onHalfway: () => { setShowDetails(false); setShowStep0Panel(true); },
      },
      {
        step: 1,
        message: "Data Cleaning Agent",
        time: 1000,
        details: [
          "Eliminating duplicate posts and redundant conversations",
          "Standardizing text structure for consistent analysis",
          "Removing incomplete or irrelevant entries",
          "Resolving encoding inconsistencies and special characters",
          "Harmonizing timestamps and numerical formats",
        ],
        onHalfway: null,
      },
      {
        step: 2,
        message: "AI Classification & Brand Lens Agent",
        time: 15000,
        details: [
          "Interpreting customer sentiment across conversations",
          "Structuring discussions into strategic brand categories",
          "Mapping conversations to key governance lenses",
          "Applying advanced AI models for semantic classification",
          "Evaluating classification confidence and relevance scores",
        ],
        onHalfway: () => { setShowDetails(false); setShowStep2Panel(true); },
      },
      {
        step: 3,
        message: "Brand Intelligence & Insight Agent",
        time: 13000,
        details: [
          "Measuring sentiment distribution across governance lenses",
          "Identifying dominant themes and emerging narratives",
          "Detecting potential reputation risks and customer pain points",
          "Generating strategic CX and brand perception insights",
          "Interpreting overall market sentiment and brand positioning",
        ],
        onHalfway: null,
      },
      {
        step: 4,
        message: "Reporting Agent",
        time: 1000,
        details: [
          "Consolidating findings into an executive-ready report",
          "Presenting sentiment and category performance metrics",
          "Highlighting key reputation drivers and improvement areas",
          "Delivering CXO-ready social intelligence insights",
        ],
        onHalfway: null,
      },
    ];

    for (const agent of agents) {
      setShowStep0Panel(false);
      setShowStep2Panel(false);
      setShowDetails(true);
      setStep(agent.step);
      setMessage(agent.message);
      setCurrentDetails(agent.details);

      if (agent.onHalfway) {
        await pauseAwareSleep(agent.time / 2);
        agent.onHalfway();
        await pauseAwareSleep(agent.time / 2);
      } else {
        await pauseAwareSleep(agent.time);
      }
    }

    setResult(mockResult);
    setStep(5);
    setLoading(false);
  };

  const handleNext = async () => {
    if (files.length === 0) { alert("Please upload a file"); return; }
    pausedRef.current = false;
    setIsPaused(false);
    setLoading(true);
    setShowStep0Panel(false);
    setShowStep2Panel(false);
    setShowDetails(true);
    await runAgentFlow();
  };

  /* ── Loading screen ── */
  if (loading && step >= 0) {
    return (
      <div className="w-full py-10 px-4 flex justify-center">
        <div style={{ width: "100%", maxWidth: 900 }}>

          <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #e5e7eb" }}>

            <div style={{ background: "#86BC25", padding: "20px 28px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
                {!isPaused && (
                  <span style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    background: "rgba(255,255,255,0.3)",
                    animation: "ping 1.2s cubic-bezier(0,0,0.2,1) infinite",
                  }} />
                )}
                <span style={{
                  position: "absolute", inset: 4, borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isPaused
                    ? <Pause size={20} color="#fff" />
                    : <Loader2 size={22} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
                  }
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <p style={{
                  color: "rgba(255,255,255,0.75)", fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3,
                }}>
                  {isPaused ? "Paused" : "Currently running"}
                </p>
                <h2 style={{ color: "#fff", fontSize: 17, fontWeight: 800, margin: 0 }}>{message}</h2>
              </div>

              <button
                onClick={isPaused ? handleResume : handlePause}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  borderRadius: 10, padding: "8px 16px",
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
              >
                {isPaused
                  ? <><Play  size={14} color="#fff" /> Resume</>
                  : <><Pause size={14} color="#fff" /> Pause</>
                }
              </button>
            </div>

            {isPaused && (
              <div style={{
                background: "#fffbeb", borderBottom: "1px solid #fde68a",
                padding: "10px 28px", display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: "#92400e", margin: 0, fontWeight: 500 }}>
                  Analysis paused — press Resume to continue from where it left off.
                </p>
              </div>
            )}

            <div style={{
              overflow: "hidden",
              maxHeight: showDetails ? "600px" : "0px",
              opacity: showDetails ? 1 : 0,
              transition: "max-height 0.5s ease, opacity 0.4s ease",
            }}>
              <div style={{ padding: "20px 28px", borderBottom: "1px solid #f0f0f0" }}>
                <SectionLabel text="What's happening" />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {currentDetails.map((detail, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{
                        marginTop: 3, width: 20, height: 20, borderRadius: "50%",
                        background: "#86BC2520", display: "flex", alignItems: "center",
                        justifyContent: "center", flexShrink: 0,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#86BC25" }} />
                      </span>
                      <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.5, margin: 0 }}>{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: "16px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>
                <span>Overall progress</span>
                <span>Step {step + 1} of 5</span>
              </div>
              <div style={{ width: "100%", background: "#f0f0f0", borderRadius: 999, height: 5, overflow: "hidden" }}>
                <div style={{
                  height: "100%", background: "#86BC25", borderRadius: 999,
                  width: `${((step + 1) / 5) * 100}%`,
                  transition: "width 0.7s ease",
                }} />
              </div>
            </div>
          </div>

          {step === 0 && showStep0Panel && <Step0Panel />}
          {step === 2 && showStep2Panel && <Step2Panel />}
        </div>

        <style>{`
          @keyframes ping { 75%,100%{transform:scale(1.8);opacity:0} }
          @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        `}</style>
      </div>
    );
  }

  /* ── Main upload page ── */
  return (
    <div className="w-full px-8 py-6">
      <h2 className="text-2xl font-bold text-[#222222] mb-8">Upload Data</h2>

      <div className="flex gap-6 items-stretch">

        <div className={`flex flex-col ${files.length === 0 ? "w-1/2" : "w-full"}`}>
          <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-[#86BC25] bg-white p-10 rounded-xl cursor-pointer hover:bg-[#86BC25]/10 transition flex-1 min-h-[220px]">
            <UploadCloud size={50} className="text-[#86BC25] mb-3" />
            <p className="text-[#222222] text-sm font-bold text-center">Click or Drag files here to upload</p>
            <p className="text-sm text-gray-500 mt-1">CSV • Excel</p>
            <input type="file" onChange={handleFiles} className="hidden" />
          </label>

          {files.length > 0 && (
            <div className="mt-4">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between border border-gray-200 bg-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition mb-3">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-[#86BC25]" />
                    <div>
                      <p className="text-sm font-medium text-[#222222]">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-[#DA291C] cursor-pointer">
                    <X size={18} />
                  </button>
                </div>
              ))}

              {loading && step < 0 && (
                <div className="mt-4 mb-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Uploading file...</span><span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#86BC25] h-2 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="bg-[#86BC25] text-white px-6 py-2 rounded-lg hover:bg-[#86BC25]/90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading && step < 0 ? "Uploading..." : "Start Analysis"}
                </button>
              </div>
            </div>
          )}
        </div>

        {files.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="flex-1 w-px bg-gray-200" />
            <span
              className="text-xs font-semibold text-gray-400 uppercase"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: "0.15em" }}
            >
              or
            </span>
            <div className="flex-1 w-px bg-gray-200" />
          </div>
        )}

        {files.length === 0 && (
          <div
            className="w-1/2 bg-white border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-center p-10 cursor-pointer hover:bg-gray-50 transition min-h-[220px]"
            style={{ position: "relative" }}
            onClick={() => alert("API Integration — coming soon")}
          >
            <span style={{
              position: "absolute", top: 16, right: 16,
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 11, fontWeight: 600,
              color: "#3B6D11", background: "#eaf3de",
              padding: "4px 10px", borderRadius: 999,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#86BC25" }} />
              Live pull
            </span>

            <Link2 size={50} className="text-[#86BC25] mb-3" />

            <p className="text-[#222222] text-xl font-bold">API Integration</p>
            <p className="text-sm text-gray-500 mt-1">Pull data directly from any REST endpoint</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default UploadData;