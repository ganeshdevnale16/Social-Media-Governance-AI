import { useState } from "react";

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
    "Response Accountability": [32, 28, 22, 18],
    "Customer Escalation Signals": [34, 26, 22, 18],
    "Resolution Orientation": [30, 26, 24, 20],
    "Brand Promise Consistency": [35, 27, 22, 16],
    "Fraud & Impersonation Signals": [34, 28, 22, 16],
    "Tone & Professionalism": [32, 28, 22, 18],
    "Transparency & Disclosure": [36, 26, 22, 16],
    "Community Sentiment Shift": [38, 28, 20, 14],
    "Moderation Governance": [34, 28, 22, 16],
    "Misinformation & Clarification": [40, 28, 20, 12],
};

const LENS_DEFINITIONS = {
    "Suspicious Claims & Information":
        "Measures the presence of potentially misleading, exaggerated, or unverified information about the brand circulating on social media.",
    "Response Accountability":
        "Measures whether the brand acknowledges customer queries, complaints, or issues in comments and how consistently it provides responses.",
    "Resolution Orientation":
        "Evaluates whether brand replies attempt to resolve the issue rather than giving generic responses.",
    "Transparency & Disclosure":
        "Assesses whether the brand provides clear, honest information in posts and replies, including disclaimers and clarifications.",
    "Tone & Professionalism":
        "Evaluates whether brand communication maintains a respectful, professional, and brand-aligned tone even in negative conversations.",
    "Misinformation & Clarification":
        "Identifies instances where incorrect claims or rumors appear in comments and whether the brand actively corrects them.",
    "Fraud & Impersonation Signals":
        "Detects comments referencing fake websites, fake job offers, fraudulent numbers, or impersonation accounts affecting the brand.",
    "Moderation Governance":
        "Evaluates how the brand handles abusive, spam, or harmful comments.",
    "Customer Escalation Signals":
        "Identifies comments indicating unresolved issues, repeated complaints, or customers asking for higher-level intervention.",
    "Community Sentiment Shift":
        "Observes when comment threads show collective dissatisfaction or trust loss, indicating potential reputational risk.",
    "Brand Promise Consistency":
        "Assesses whether customer comments indicate a gap between brand claims in posts and the actual experience shared by users.",
};

const LENS_TO_FILE = {
    "Suspicious Claims & Information": "Suspicious-Claims-Information.xlsx",
    "Response Accountability": "Response-Accountability.xlsx",
    "Customer Escalation Signals": "Customer-Escalation-Signals.xlsx",
    "Resolution Orientation": "Resolution-Orientation.xlsx",
    "Brand Promise Consistency": "Brand-Promise-Consistency.xlsx",
    "Fraud & Impersonation Signals": "Fraud-Impersonation-Signals.xlsx",
    "Tone & Professionalism": "Tone-Professionalism.xlsx",
    "Transparency & Disclosure": "Transparency-Disclosure.xlsx",
    "Community Sentiment Shift": "Community-Sentiment-Shift.xlsx",
    "Moderation Governance": "Moderation-Governance.xlsx",
    "Misinformation & Clarification": "Misinformation-Clarification.xlsx",
};

const DEFAULT_DATA = [
    {
        lens: "Suspicious Claims & Information",
        count: 243,
        percentage: 11,
        top_themes: [
            "Unverified product claims",
            "Misleading pricing info",
            "Fake testimonials",
            "Exaggerated benefits",
        ],
        key_insights: [
            "High volume of unverified claims circulating in comment threads",
            "Users frequently cite unofficial sources as evidence",
            "Brand has not issued formal clarifications on key disputed claims",
        ],
    },
    {
        lens: "Response Accountability",
        count: 198,
        percentage: 9,
        top_themes: [
            "Unanswered queries",
            "Delayed responses",
            "Generic auto-replies",
            "Missed escalations",
        ],
        key_insights: [
            "Only 38% of direct queries received a brand response",
            "Average response time exceeds 48 hours",
            "Generic replies dominate over personalised engagement",
        ],
    },
    {
        lens: "Customer Escalation Signals",
        count: 187,
        percentage: 8,
        top_themes: [
            "Repeat complaint loops",
            "Demand for supervisor",
            "Refund escalations",
            "Unresolved service issues",
        ],
        key_insights: [
            "Recurring complainants represent 22% of escalation volume",
            "Refund-related escalations doubled in the last 30 days",
            "No visible resolution path communicated publicly",
        ],
    },
    {
        lens: "Resolution Orientation",
        count: 176,
        percentage: 8,
        top_themes: [
            "Support contact shared",
            "Issue acknowledged",
            "Follow-up promised",
            "Directed to DMs",
        ],
        key_insights: [
            "60% of brand replies include actionable next steps",
            "Support redirection to DMs is the most common resolution tactic",
            "Public resolution rate remains low at under 20%",
        ],
    },
    {
        lens: "Brand Promise Consistency",
        count: 165,
        percentage: 7,
        top_themes: [
            "Delivery vs claims gap",
            "Quality inconsistency",
            "Pricing promise breach",
            "Service expectation mismatch",
        ],
        key_insights: [
            "Users frequently cite gap between ad promises and reality",
            "Product quality mentions skew 3:1 negative",
            "Delivery timeframe complaints surged after recent campaign",
        ],
    },
    {
        lens: "Fraud & Impersonation Signals",
        count: 212,
        percentage: 10,
        top_themes: [
            "Fake job postings",
            "Impersonation accounts",
            "Fraudulent contact numbers",
            "Phishing links shared",
        ],
        key_insights: [
            "3 active impersonation accounts identified across platforms",
            "Fraudulent helpline numbers appearing in comment sections",
            "Users reporting unsolicited messages from fake brand handles",
        ],
    },
    {
        lens: "Tone & Professionalism",
        count: 154,
        percentage: 7,
        top_themes: [
            "Dismissive replies",
            "Condescending tone",
            "Off-brand language",
            "Overly formal responses",
        ],
        key_insights: [
            "15% of brand replies flagged for tone inconsistency",
            "Dismissive language observed in high-traffic complaint threads",
            "Community managers appear undertrained on empathy protocols",
        ],
    },
    {
        lens: "Transparency & Disclosure",
        count: 143,
        percentage: 6,
        top_themes: [
            "Hidden fees undisclosed",
            "Unclear T&C references",
            "Missing disclaimers",
            "No clarification on outages",
        ],
        key_insights: [
            "Users calling out lack of proactive communication on service issues",
            "Hidden fee complaints spiked after billing cycle update",
            "No official statement found addressing top transparency concerns",
        ],
    },
    {
        lens: "Community Sentiment Shift",
        count: 178,
        percentage: 8,
        top_themes: [
            "Trust erosion threads",
            "Collective negative spikes",
            "Loyalty questioning",
            "Competitor comparisons",
        ],
        key_insights: [
            "Three high-engagement threads show cascading negative sentiment",
            "Brand loyalists declining as detractors rise in comment volume",
            "Competitor mentions increasing in dissatisfied user threads",
        ],
    },
    {
        lens: "Moderation Governance",
        count: 132,
        percentage: 6,
        top_themes: [
            "Spam left unmoderated",
            "Abusive comments unaddressed",
            "Deleted user complaints",
            "Inconsistent moderation",
        ],
        key_insights: [
            "Spam accounts active for 48+ hours without removal",
            "Abusive replies to customer complaints remain visible",
            "Selective deletion creating perception of censorship",
        ],
    },
    {
        lens: "Misinformation & Clarification",
        count: 443,
        percentage: 20,
        top_themes: [
            "Incorrect product info spread",
            "Rumours about brand actions",
            "Outdated info circulating",
            "No official counter-narrative",
        ],
        key_insights: [
            "Highest-volume lens — misinformation driving 20% of all flagged mentions",
            "Brand has issued zero public corrections in the last 14 days",
            "Viral rumour thread accumulated 4,200+ engagements without response",
        ],
    },
];

// ── Overview Cards Data (icon + count + label) ────────────────────────────────
const DEFAULT_OVERVIEW_CARDS = [
    { label: "Total number of mentions", count: 19671, icon: "mentions" },
    { label: "Number of positive mentions", count: 7618, icon: "positive" },
    { label: "Number of negative mentions", count: 3464, icon: "negative" },
    { label: "Number of neutral mentions", count: 8589, icon: "neutral" },
];

// ── Source Breakdown Cards Data (progress bar style) ──────────────────────────
const DEFAULT_SUMMARY_CARDS = [
    { label: "Amazon", count: 1048, percentage: 47, color: "#3b82f6" },
    { label: "Flipkart", count: 848, percentage: 38, color: "#8b5cf6" },
    { label: "Facebook", count: 201, percentage: 9, color: "#10b981" },
    { label: "Instagram", count: 89, percentage: 4, color: "#f59e0b" },
    { label: "Others", count: 45, percentage: 2, color: "#ef4444" },
];

// ── Icons (all black) ─────────────────────────────────────────────────────────
function IconMentions() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                stroke="#111827"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="9" cy="10" r="1" fill="#111827" />
            <circle cx="12" cy="10" r="1" fill="#111827" />
            <circle cx="15" cy="10" r="1" fill="#111827" />
        </svg>
    );
}

function IconPositive() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#111827" strokeWidth="1.8" />
            <path
                d="M8 13.5s1.5 2.5 4 2.5 4-2.5 4-2.5"
                stroke="#111827"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="9" cy="9.5" r="1.2" fill="#111827" />
            <circle cx="15" cy="9.5" r="1.2" fill="#111827" />
        </svg>
    );
}

function IconNegative() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#111827" strokeWidth="1.8" />
            <path
                d="M8 16s1.5-2.5 4-2.5 4 2.5 4 2.5"
                stroke="#111827"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="9" cy="9.5" r="1.2" fill="#111827" />
            <circle cx="15" cy="9.5" r="1.2" fill="#111827" />
        </svg>
    );
}

function IconNeutral() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#111827" strokeWidth="1.8" />
            <line
                x1="8.5"
                y1="14.5"
                x2="15.5"
                y2="14.5"
                stroke="#111827"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <circle cx="9" cy="9.5" r="1.2" fill="#111827" />
            <circle cx="15" cy="9.5" r="1.2" fill="#111827" />
        </svg>
    );
}

const ICON_MAP = {
    mentions: IconMentions,
    positive: IconPositive,
    negative: IconNegative,
    neutral: IconNeutral,
};

// ── Summary Card ──────────────────────────────────────────────────────────────
function SummaryCard({ label, count, icon }) {
    const IconComponent = ICON_MAP[icon];

    return (
        <div
            style={{
                flex: "1 1 0",
                background: "#ffffff",
                border: "0.5px solid #e5e7eb",
                padding: "16px 14px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                transition: "box-shadow 0.15s ease",
                textAlign: "center",
            }}
            onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
        >
            {/* Icon Box */}
            <div
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 14,
                    background: "#f9fafb",
                    border: "0.5px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                {IconComponent && <IconComponent />}
            </div>

            {/* Count */}
            <span
                style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "#111827",
                    lineHeight: 1,
                    letterSpacing: "-1px",
                }}
            >
                {count.toLocaleString()}
            </span>

            {/* Label */}
            <span
                style={{
                    fontSize: 12,
                    color: "#6b7280",
                    fontWeight: 500,
                    lineHeight: 1.5,
                    maxWidth: 150,
                }}
            >
                {label}
            </span>
        </div>
    );
}

// ── Source Breakdown Card (progress bar style) ────────────────────────────────
function SourceCard({ label, count, percentage, color }) {
    return (
        <div
            style={{
                flex: "1 1 0",
                background: "#ffffff",
                border: "0.5px solid #e5e7eb",
                // borderRadius: 14,
                padding: "18px 20px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                transition: "box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
        >
            {/* Top row: count + external link icon */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <span style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1, letterSpacing: "-0.5px" }}>
                    {count.toLocaleString()}
                </span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "#9ca3af", marginTop: 2 }}>
                    <path d="M2.5 11.5L11.5 2.5M11.5 2.5H6.5M11.5 2.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            {/* Label */}
            <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{label}</span>
            {/* Progress bar */}
            <div style={{ height: 4, borderRadius: 99, background: "#f3f4f6", overflow: "hidden", margin: "2px 0" }}>
                <div style={{ height: "100%", width: `${Math.min(percentage, 100)}%`, borderRadius: 99, background: color, transition: "width 0.6s ease" }} />
            </div>
            {/* Percentage */}
            <span style={{ fontSize: 12, color, fontWeight: 600 }}>{percentage}% of total</span>
        </div>
    );
}

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
                <circle
                    cx="28"
                    cy="28"
                    r={r}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="4"
                />
                <circle
                    cx="28"
                    cy="28"
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    color,
                }}
            >
                {pct.toFixed(0)}%
            </div>
        </div>
    );
}

function Divider() {
    return (
        <div
            style={{
                width: "0.5px",
                background: "#e5e7eb",
                margin: "0 16px",
                alignSelf: "stretch",
            }}
        />
    );
}

function LensCard({ item, index }) {
    const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
    const badge = COUNT_BADGE_STYLES[index % COUNT_BADGE_STYLES.length];
    const [tipVisible, setTipVisible] = useState(false);
    const themePcts = THEME_PCTS[item.lens] ?? item.top_themes.map(() => null);
    const definition =
        LENS_DEFINITIONS[item.lens] ??
        `Analyzes responses through the "${item.lens}" perspective to surface patterns and insights.`;

    const downloadExcel = () => {
        const fileName = LENS_TO_FILE[item.lens?.trim()];
        if (!fileName) return;
        const link = document.createElement("a");
        link.href = `/Social-Media-Governance/${fileName}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div
            style={{
                background: "#ffffff",
                border: "0.5px solid #e5e7eb",
                borderRadius: 16,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                marginBottom: 12,
                position: "relative",
                overflow: "visible",
            }}
        >
            {/* Left accent bar */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    background: accent,
                    borderRadius: "3px 0 0 3px",
                }}
            />

            {/* Lens Name + Tooltip */}
            <div
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
                <span
                    style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#111827",
                        lineHeight: 1.4,
                        borderBottom: `1.5px dashed ${accent}`,
                        cursor: "help",
                        paddingBottom: 1,
                    }}
                >
                    {item.lens}
                </span>
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
                        width: "fit-content",
                    }}
                >
                    Download
                </button>
                {tipVisible && (
                    <div
                        style={{
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
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: -5,
                                left: 16,
                                width: 10,
                                height: 10,
                                background: "#1f2937",
                                transform: "rotate(45deg)",
                                borderRadius: 2,
                            }}
                        />
                        <span
                            style={{
                                fontWeight: 600,
                                color: accent,
                                display: "block",
                                marginBottom: 4,
                            }}
                        >
                            {item.lens}
                        </span>
                        {definition}
                    </div>
                )}
            </div>

            {/* Arrow */}
            <div style={{ padding: "0 8px", flexShrink: 0 }}>
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    style={{ color: "#9ca3af" }}
                >
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

            {/* Count */}
            <div
                style={{
                    minWidth: 80,
                    maxWidth: 80,
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <span
                    style={{
                        background: badge.bg,
                        color: badge.color,
                        border: `0.5px solid ${badge.border}`,
                        fontFamily: "monospace",
                        fontSize: 18,
                        fontWeight: 500,
                        padding: "6px 14px",
                        borderRadius: 10,
                        whiteSpace: "nowrap",
                    }}
                >
                    {item.count}
                </span>
            </div>

            <Divider />

            {/* Top Themes */}
            <div
                style={{
                    minWidth: 220,
                    maxWidth: 220,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                }}
            >
                {item.top_themes?.map((theme, i) => (
                    <div
                        key={i}
                        style={{
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
                        }}
                    >
                        <span
                            style={{
                                flex: 1,
                                fontSize: 12,
                                fontWeight: 500,
                                color: "#374151",
                                lineHeight: 1.4,
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {theme}
                        </span>
                        {themePcts[i] != null && (
                            <span
                                style={{
                                    flexShrink: 0,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: accent,
                                    background: `${accent}20`,
                                    padding: "2px 7px",
                                    borderRadius: 8,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {themePcts[i]}%
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <Divider />

            {/* Key Insights */}
            <div
                style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}
            >
                {item.key_insights?.map((insight, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 8,
                            fontSize: 13,
                            color: "#4b5563",
                            lineHeight: 1.55,
                        }}
                    >
                        <span
                            style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: accent,
                                flexShrink: 0,
                                marginTop: 6,
                            }}
                        />
                        {insight}
                    </div>
                ))}
            </div>

            <Divider />

            {/* Ring */}
            <div style={{ minWidth: 80, display: "flex", justifyContent: "center" }}>
                <PctRing pct={item.percentage} color={accent} />
            </div>
        </div>
    );
}

// ── Main Dashboard Component ──────────────────────────────────────────────────

export { DEFAULT_OVERVIEW_CARDS, DEFAULT_SUMMARY_CARDS, SummaryCard, SourceCard };

export default function GovernanceDashboard({
    result = DEFAULT_DATA,
    overviewCards = DEFAULT_OVERVIEW_CARDS,
    summaryCards = DEFAULT_SUMMARY_CARDS,
}) {
    return (
        <div
            style={{
                padding: "28px 32px",
                minHeight: "100vh",
                background: "#f9fafb",
            }}
        >

            <div
                style={{
                    marginBottom: 16,
                    padding: "10px 16px",
                    background: "#f9fafb",
                    border: "0.5px solid #e5e7eb",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="1.8" />
                    <line x1="12" y1="8" x2="12" y2="12" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="1" fill="#9ca3af" />
                </svg>
                <span style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
                    Data reflects social media mentions collected across all monitored platforms from October 2025 to December 2025 for analysis of customer sentiment, engagement and brand perception.
                </span>
            </div>


            {/* ── Source Breakdown Cards Section (progress bar style) ── */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div className="flex items-center gap-2">
                        <div className="w-[6px] h-[20px] bg-[#86BC25] rounded-full"></div>
                        <h2 className="text-[22px] font-semibold text-[#111111] leading-none">Social Media</h2>
                    </div>
                    <span style={{ fontSize: 12, color: "#818385", background: "#f3f4f6", fontWeight: 600, padding: "2px 9px",  border: "0.5px solid #e5e7eb" }}>
                        {summaryCards.length} sources
                    </span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    {summaryCards.map((card, i) => (
                        <SourceCard key={i} {...card} />
                    ))}
                </div>
            </div>



            {/* ── Overview Cards Section (icon + count + label) ── */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div className="flex items-center gap-2">
                        <div className="w-[6px] h-[30px] bg-[#86BC25] rounded-full"></div>
                        <h2 className="text-[22px] font-semibold text-[#111111] leading-none">Overview</h2>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    {overviewCards.map((card, i) => (
                        <SummaryCard key={i} {...card} />
                    ))}
                </div>
            </div>

            {/* ── Dashboard Section ── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 20,
                }}
            >
                <div className="flex items-center gap-2">
                    <div className="w-[6px] h-[30px] bg-[#86BC25] rounded-full"></div>
                    <h2 className="text-[22px] font-semibold text-[#111111] leading-none">
                        Dashboard
                    </h2>
                </div>
            </div>

            {/* Column Headers */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 24px 8px 36px",
                }}
            >
                {[
                    { label: "Lens", width: 240 },
                    { label: "", width: 36 },
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
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#6b7280",
                            paddingLeft: 12,
                        }}
                    >
                        {label}
                    </div>
                ))}
            </div>

            {/* Cards */}
            {result.map((item, i) => (
                <LensCard key={i} item={item} index={i} />
            ))}
        </div>
    );
}

