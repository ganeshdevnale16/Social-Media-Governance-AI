import { useState } from "react";
import ProgressNav from "../components/ProgressNavigation";
import UploadData from "../components/UploadData";
import CompetitorAnalysis from "../components/CompetitorAnalysis";

import { DEFAULT_OVERVIEW_CARDS, DEFAULT_SUMMARY_CARDS, SummaryCard, SourceCard } from "../components/PerceptionDashboard";

const ACCENT_COLORS = ["#ef4444", "#6366f1", "#10b981", "#f59e0b", "#8b5cf6"];

const COUNT_BADGE_STYLES = [
  { bg: "#fef2f2", color: "#b91c1c", border: "#fca5a5" },
  { bg: "#f0f0ff", color: "#4f46e5", border: "#c7d2fe" },
  { bg: "#ecfdf5", color: "#047857", border: "#6ee7b7" },
  { bg: "#fffbeb", color: "#b45309", border: "#fcd34d" },
  { bg: "#f5f3ff", color: "#6d28d9", border: "#c4b5fd" },
];


const THEME_PCTS = {
  "Suspicious Claims & Information": [30, 20, 15, 20, 15],
  "Response Accountability": [39, 34, 27],
  "Customer Escalation Signals": [34, 26, 22, 18],
  "Resolution Orientation": [30, 26, 24, 20],
  "Brand Promise Consistency": [42, 32, 26],
  "Fraud & Impersonation Signals": [34, 28, 22, 16],
  "Tone & Professionalism": [32, 28, 22, 18],
  "Transparency & Disclosure": [36, 26, 22, 16],
  "Community Sentiment Shift": [38, 28, 20, 14],
  "Moderation Governance": [34, 28, 22, 16],
  "Misinformation & Clarification": [40, 28, 20, 12],
};

// Dummy lens definitions for tooltip
const LENS_DEFINITIONS = {
  "Suspicious Claims & Information": "Measures the presence of potentially misleading, exaggerated, or unverified information about the brand circulating on social media.",
  // This lens evaluates claims made by users, influencers, or unofficial sources that may create confusion, misinformation, or reputational risk if left unaddressed.",
  "Response Accountability": "Measures whether the brand acknowledges customer queries, complaints, or issues in comments and how consistently it provides responses.",
  "Resolution Orientation": "Evaluates whether brand replies attempt to resolve the issue (guidance, support contact, escalation) rather than giving generic responses.",
  "Transparency & Disclosure": "Assesses whether the brand provides clear, honest information in posts and replies, including disclaimers, clarifications, or corrections.",
  "Tone & Professionalism": "Evaluates whether brand communication in posts and responses maintains a respectful, professional, and brand-aligned tone even in negative conversations.",
  "Misinformation & Clarification": "Identifies instances where incorrect claims, rumors, or fake information appear in comments and whether the brand actively corrects them.",
  "Fraud & Impersonation Signals": "Detects comments referencing fake websites, fake job offers, fraudulent numbers, or impersonation accounts affecting the brand.",
  "Moderation Governance": "Evaluates how the brand handles abusive, spam, or harmful comments (ignoring, deleting, addressing, or moderating).",
  "Customer Escalation Signals": "Identifies comments indicating unresolved issues, repeated complaints, or customers asking for higher-level intervention.",
  "Community Sentiment Shift": "Observes when comment threads show collective dissatisfaction or trust loss, indicating potential reputational risk.",
  "Brand Promise Consistency": "Assesses whether customer comments indicate a gap between brand claims in posts and the actual experience shared by users.",
};


const LENS_TO_FILE = {
  "Suspicious Claims & Information": `${import.meta.env.BASE_URL}Excels/Suspicious Claims & Information.xlsx`,
  "Response Accountability": `${import.meta.env.BASE_URL}Excels/Response Accountability.xlsx`,
  "Customer Escalation Signals": `${import.meta.env.BASE_URL}Excels/Customer Escalation Signals.xlsx`,
  "Resolution Orientation": `${import.meta.env.BASE_URL}Excels/Resolution Orientation.xlsx`,
  "Brand Promise Consistency": `${import.meta.env.BASE_URL}Excels/Brand Promise Consistency.xlsx`,
  "Fraud & Impersonation Signals": `${import.meta.env.BASE_URL}Excels/Fraud & Impersonation Signals.xlsx`,
  "Tone & Professionalism": `${import.meta.env.BASE_URL}Excels/Tone & Professionalism.xlsx`,
  "Transparency & Disclosure": `${import.meta.env.BASE_URL}Excels/Transparency & Disclosure.xlsx`,
  "Community Sentiment Shift": `${import.meta.env.BASE_URL}Excels/Community Sentiment Shift.xlsx`,
  "Moderation Governance": `${import.meta.env.BASE_URL}Excels/Moderation Governance.xlsx`,
  "Misinformation & Clarification": `${import.meta.env.BASE_URL}Excels/Misinformation & Clarification.xlsx`,
};

function PctRing({ pct, color }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ position: "relative", width: 56, height: 56 }}>
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle cx="28" cy="28" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 600,
        color,
      }}>
        {pct.toFixed(0)}%
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div style={{
      width: "0.5px",
      background: "#e5e7eb",
      margin: "0 16px",
      alignSelf: "stretch",
    }} />
  );
}

function LensCard({ item, index }) {
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const badge = COUNT_BADGE_STYLES[index % COUNT_BADGE_STYLES.length];
  const [tipVisible, setTipVisible] = useState(false);
  const normalizedLens = item.lens?.trim();

  const themePcts =
    THEME_PCTS[normalizedLens] ??
    item.top_themes.map(() => null);
    console.log("Lens:", JSON.stringify(item.lens));
    console.log("Theme Pcts:", THEME_PCTS[item.lens]);

  const definition =
    LENS_DEFINITIONS[item.lens] ??
    `Analyzes responses through the "${item.lens}" perspective to surface patterns and insights.`;

  const downloadExcel = () => {
    const normalizedLens = item.lens?.trim();
    const filePath = LENS_TO_FILE[normalizedLens];

    if (!filePath) return;
    const actualFileName = filePath.split("/").pop();

    const link = document.createElement("a");

    link.href = filePath;

    link.download = actualFileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div style={{
      background: "#ffffff",
      border: "0.5px solid #e5e7eb",
      borderRadius: 16,
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      marginBottom: 12,
      position: "relative",
      overflow: "visible",          // must be visible for tooltip to show
    }}>

      {/* Left accent bar */}
      <div style={{
        position: "absolute",
        left: 0, top: 0, bottom: 0,
        width: 3,
        background: `linear-gradient(180deg, ${accent}, ${accent}99)`,
        borderRadius: "3px 0 0 3px",
      }} />

      {/* ── Lens Name + Tooltip ───────────────────────────────────────── */}
      <div
        // style={{ minWidth: 220, maxWidth: 220, paddingLeft: 12, position: "relative" }}
        style={{
          minWidth: 240,
          maxWidth: 240,
          paddingLeft: 12,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 12,
        }}

        onMouseEnter={() => setTipVisible(true)}
        onMouseLeave={() => setTipVisible(false)}
      >
        <span style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#111827",
          lineHeight: 1.4,
          borderBottom: `1.5px dashed ${accent}`,
          cursor: "help",
          paddingBottom: 1,
        }}>
          {item.lens}
        </span>
        <div className="mt-5">
          <button
            onClick={downloadExcel}
            style={{
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: "#ffffff",
              background: accent,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Download
          </button>
        </div>
        {/* Tooltip bubble */}
        {tipVisible && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            left: 0,
            zIndex: 999,
            background: "#1f2937",
            color: "#f9fafb",
            fontSize: 12,
            lineHeight: 1.6,
            padding: "10px 14px",
            borderRadius: 10,
            width: 240,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            pointerEvents: "none",
          }}>
            {/* Caret */}
            <div style={{
              position: "absolute",
              top: -5,
              left: 16,
              width: 10,
              height: 10,
              background: "#1f2937",
              transform: "rotate(45deg)",
              borderRadius: 2,
            }} />
            <span style={{ fontWeight: 600, color: accent, display: "block", marginBottom: 4 }}>
              {item.lens}
            </span>
            {definition}
          </div>
        )}
      </div>

      {/* Arrow icon */}
      <div style={{ padding: "0 8px", flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: "#9ca3af" }}>
          <path
            d="M4 10h12M12 6l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <Divider />

      {/* ── Count ─────────────────────────────────────────────────────── */}
      <div style={{ minWidth: 80, maxWidth: 80, display: "flex", justifyContent: "center" }}>
        <span style={{
          background: badge.bg,
          color: badge.color,
          border: `0.5px solid ${badge.border}`,
          fontFamily: "monospace",
          fontSize: 18,
          fontWeight: 500,
          padding: "6px 14px",
          borderRadius: 10,
          whiteSpace: "nowrap",
        }}>
          {item.count}
        </span>
      </div>

      <Divider />

      {/* ── Top Themes — uniform fixed-height boxes with real % ─────── */}
      <div style={{ minWidth: 220, maxWidth: 220, display: "flex", flexDirection: "column", gap: 6 }}>
        {item.top_themes?.map((theme, i) => (
          <div key={i} style={{
            width: "100%",
            height: 48,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
            borderRadius: 10,
            background: "#f9fafb",
            border: "0.5px solid #e5e7eb",
            gap: 8,
          }}>
            <span style={{
              flex: 1,
              fontSize: 12,
              fontWeight: 500,
              color: "#374151",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {theme}
            </span>
            {themePcts[i] != null && (
              <span style={{
                flexShrink: 0,
                fontSize: 11,
                fontWeight: 700,
                color: accent,
                background: `${accent}15`,
                padding: "2px 7px",
                borderRadius: 8,
                whiteSpace: "nowrap",
              }}>
                {themePcts[i]}%
              </span>
            )}
          </div>
        ))}
      </div>

      <Divider />

      {/* ── Key Insights ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {item.key_insights?.map((insight, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            fontSize: 13,
            color: "#4b5563",
            lineHeight: 1.55,
          }}>
            <span style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: accent,
              flexShrink: 0,
              marginTop: 6,
            }} />
            {insight}
          </div>
        ))}
      </div>

      <Divider />

      {/* ── Percentage Ring ───────────────────────────────────────────── */}
      <div style={{ minWidth: 80, display: "flex", justifyContent: "center" }}>
        <PctRing pct={item.percentage} color={accent} />
      </div>

      {/* ── Download Excel Button ─────────────────────────────────────── */}
    </div>
  );
}



function ReportView({ result }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const totalCount = result?.reduce((sum, r) => sum + r.count, 0) ?? 0;
  
  const competitorData = [
  {
    lens: "Suspicious Claims & Information",
    ourBrand: 28.40,
    competitor: 24,
  },
  {
    lens: "Response Accountability",
    ourBrand: 25.20,
    competitor: 22,
  },
  {
    lens: "Customer Escalation Signals",
    ourBrand: 21.90,
    competitor: 22,
  },
  {
    lens: "Resolution Orientation",
    ourBrand: 18.30,
    competitor: 26,
  },
  {
    lens: "Brand Promise Consistency",
    ourBrand: 16.30,
    competitor: 8,
  },
  {
    lens: "Fraud & Impersonation Signals",
    ourBrand: 6,
    competitor: 16,
  },
  {
    lens: "Tone & Professionalism",
    ourBrand: 3.80,
    competitor: 6,
  },
  {
    lens: "Transparency & Disclosure",
    ourBrand: 22.50,
    competitor: 19,
  },
  {
    lens: "Community Sentiment Shift",
    ourBrand: 17.40,
    competitor: 24,
  },
  {
    lens: "Moderation Governance",
    ourBrand: 13.80,
    competitor: 11,
  },
  {
    lens: "Misinformation & Clarification",
    ourBrand: 9.60,
    competitor: 14,
  },
];

  const strengths = [
  {
    lens: "Response Accountability",
    insight:
      "The brand demonstrates stronger engagement by consistently acknowledging customer queries and complaints compared to competitors.",
  },
  {
    lens: "Brand Promise Consistency",
    insight:
      "Customer feedback indicates relatively fewer gaps between brand messaging and actual product/service experience.",
  },
];

 const competitorStrengths = [
  {
    lens: "Resolution Orientation",
    insight:
      "Competitors appear to provide more solution-oriented responses, offering clearer guidance or faster support pathways.",
  },
  {
    lens: "Fraud & Impersonation Signals",
    insight:
      "Competitors show slightly stronger visibility and takedown response around fraud, impersonation and fake job related concerns."  },
];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: "#111827", margin: 0 }}>
          Final Report
        </h2>
        <span style={{
          fontSize: 15,
          color: "#818385",
          background: "#f3f4f6",
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: 20,
          border: "0.5px solid #e5e7eb",
        }}>
          {result?.length} lenses · {totalCount.toLocaleString()} total responses
        </span>
      </div>

      {/* ── Source Breakdown Cards Section (progress bar style) ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div className="flex items-center gap-2">
            <div className="w-[6px] h-[20px] bg-[#86BC25] rounded-full"></div>
            <h2 className="text-[20px] font-semibold text-[#111111] leading-none">Social Media/ Summary</h2>
          </div>
          <span style={{ fontSize: 12, color: "#818385", background: "#f3f4f6", fontWeight: 600, padding: "2px 9px",  border: "0.5px solid #e5e7eb" }}>
            {DEFAULT_SUMMARY_CARDS.length} sources
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {DEFAULT_SUMMARY_CARDS.map((card, i) => (
            <SourceCard key={i} {...card} />
          ))}
        </div>
      </div>

      {/* ── Overview Cards Section (icon + count + label) ── */}
      {/* <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div className="flex items-center gap-2">
            <div className="w-[6px] h-[30px] bg-[#86BC25] rounded-full"></div>
            <h2 className="text-[22px] font-semibold text-[#111111] leading-none">Overview</h2>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {DEFAULT_OVERVIEW_CARDS.map((card, i) => (
            <SummaryCard key={i} {...card} />
          ))}
        </div>
      </div> */}

      {/* ── Dashboard Section ── */}
      <div
  style={{
    display: "flex",
    gap: 32,
    marginBottom: 24,
  }}
>
  <button
  onClick={() => setActiveTab("dashboard")}
  style={{
    position: "relative",
    padding: "12px 4px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: activeTab === "dashboard" ? "#111827" : "#6b7280",
    fontWeight: activeTab === "dashboard" ? 600 : 500,
  }}
>
  Social Media Dashboard

  {activeTab === "dashboard" && (
    <div
      style={{
        position: "absolute",
        bottom: -1,
        left: 0,
        right: 0,
        height: 6,
        background: "#86BC25",
        borderRadius: "999px",
      }}
    />
  )}
</button>

  <button
  onClick={() => setActiveTab("competitor")}
  style={{
    position: "relative",
    padding: "12px 18px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color:
      activeTab === "competitor"
        ? "#111827"
        : "#6b7280",
    fontWeight:
      activeTab === "competitor"
        ? 600
        : 500,
    transition: "all 0.2s ease",
  }}
>
  Competitor Analysis

  {activeTab === "competitor" && (
    <div
      style={{
        position: "absolute",
        bottom: -3,
        left: "10%",
        width: "80%",
        height: 6,
        background: "#86BC25",
        borderRadius: 999,
      }}
    />
  )}
</button>
</div>

      
      {activeTab === "dashboard" ? (
  <>
    {/* Dashboard Section */}

    {/* <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-[6px] h-[30px] bg-[#86BC25] rounded-full"></div>
        <h2 className="text-[20px] font-semibold text-[#111111] leading-none">
          Dashboard
        </h2>
      </div>
    </div> */}

    {/* Column Headers */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 0px 10px 10px",
      }}
    >
      {[
        { label: "Lens", width: 300 },
        { label: "", width: 20 },
        { label: "Count", width: 112 },
        { label: "Top Themes", width: 252 },
        { label: "Key Insights", flex: true },
        { label: "Share", width: 112 },
      ].map(({ label, width, flex: isFlex }, i) => (
        <div
          key={i}
          style={{
            ...(isFlex
              ? { flex: 1 }
              : { minWidth: width, maxWidth: width }),
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#000",
          }}
        >
          {label}
        </div>
      ))}
    </div>

    {result?.map((item, i) => (
      <LensCard key={i} item={item} index={i} />
    ))}
  </>
) : (
  <CompetitorAnalysis
    data={competitorData}
    strengths={strengths}
    competitorStrengths={competitorStrengths}
  />
)}
    </div>
  );
}

function ReportPage() {
  const [step, setStep] = useState(-1);
  const [result, setResult] = useState(null);
  const [bridgeLabels, setBridgeLabels] = useState([
    "19,671 Social Media Mentions",
    "2,231 Actionable Mentions",
    "11 Brand Perception Lenses",
    "Insights",
  ]);

  const updateBridgeLabel = (gapIndex, text) => {
    setBridgeLabels(prev => {
      const next = [...prev];
      next[gapIndex] = text;
      return next;
    });
  };

  const renderContent = () => {
    if (step < 5) {
      return (
        <UploadData
          step={step}
          setStep={setStep}
          setResult={setResult}
          updateBridgeLabel={updateBridgeLabel}
        />
      );
    }
    return <ReportView result={result} />;
  };

  return (
    <div className="h-full">
      <div className="px-8">
        <ProgressNav step={step} bridgeLabels={bridgeLabels} />
        <div className="max-w-9xl mx-auto py-7">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default ReportPage;