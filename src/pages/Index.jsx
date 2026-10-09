import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Index() {
  const navigate = useNavigate();

  const apps = [
    {
      id: 1,
      name: "Perception Lens - Early Signals",
      description: "AI-powered brand perception monitoring that detects emerging risks, identifies early warning signals, and enables proactive crisis management.",
      category: "Brand Perception AI - Early Signals",
      key: "/brand-perception",
      icon: "ti-eye",
      color: "blue",
    },
    {
      id: 2,
      name: "Digital Impersonation",
      description: "Identify and act on fake accounts, fraudulent handles, and unauthorised use of your brand across platforms.",
      category: "Digital Impersonation",
      key: "/brand_infridgement",
      icon: "ti-shield-x",
      color: "teal",
    },
    {
      id: 3,
      name: "Material Price Movement Analytics",
      description: "AI-powered price movement monitoring that detects material spikes and falls, traces the news and rumours behind them, and delivers an evidence-based report for timely verification.",
      category: "Material Price Movement",
      key: "/market-monitor",
      icon: "ti-chart-line",
      color: "dark",
    },
  ];

  const colorMap = {
    dark: {
      headerBg: "#EDEDED",
      iconColor: "#222222",
      labelColor: "#222222",
      linkColor: "#222222",
      borderColor: "#CFCFCF",
    },
    teal: {
      headerBg: "#E6F1FB",
      iconColor: "#185FA5",
      labelColor: "#185FA5",
      linkColor: "#185FA5",
      borderColor: "#B5D4F4",
    },
    blue: {
      headerBg: "#E8F3D3",
      iconColor: "#86BC25",
      labelColor: "#86BC25",
      linkColor: "#86BC25",
      borderColor: "#DDEDBD",
    },
  };

  return (
    <>
      {/* Load Tabler Icons font */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
      />
      <div
        style={{ fontFamily: "'Segoe UI', sans-serif" }}
        className="bg-[#f5f5f5] min-h-screen"
      >
        <Navbar name=" Social Media Governance" />

        <div
          className="max-w-6xl mx-auto px-10"
          style={{
            minHeight: "calc(100vh - 64px)",
            display: "flex",
            // alignItems:"center",
            alignItems: "flex-start",
            paddingTop: "50px"
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {apps.map((app) => {
              const c = colorMap[app.color];
              return (
                <div
                  key={app.id}
                  onClick={() => navigate(app.key)}
                  style={{
                    background: "#ffffff",
                    border: "0.5px solid #e2e8f0",
                    // borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    display: "flex",
                    flexDirection: "column",
                    minHeight:"240px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = c.borderColor;
                    e.currentTarget.style.boxShadow = `0 4px 16px 0 ${c.headerBg}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >

                  <div
                    style={{
                      background: c.headerBg,
                      padding: "20px 24px",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <i
                      className={`ti ${app.icon}`}
                      style={{
                        fontSize: "28px",
                        color: c.iconColor,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        letterSpacing: "0.07em",
                        textTransform: "uppercase",
                        color: c.labelColor,
                      }}
                    >
                      {app.category}
                    </span>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "18px 24px 0 24px", flex: 1 }}>
                    {/*<h2
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#0f172a",
                        marginBottom: "8px",
                        lineHeight: 1.35,
                      }}
                    >
                      {app.name}
                    </h2>*/}
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#64748b",
                        lineHeight: 1.6,
                      }}
                    >
                      {app.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      padding: "14px 24px 18px",
                      display: "flex",
                      alignItems: "center",
                      borderTop: "0.5px solid #f1f5f9",
                      marginTop: "16px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: c.linkColor,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      Launch module
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}


