import { UploadCloud, Bot, FileText, Check, Loader2 } from "lucide-react";

const steps = [
  { label: "Data Uploading Agent", icon: UploadCloud },
  { label: "Data Cleaning Agent",  icon: Bot        },
  { label: "Classification Agent", icon: Bot        },
  { label: "Data Analysing Agent",       icon: Bot        },
  { label: "Generating Report",      icon: FileText   },
];

function ProgressNav({ step, bridgeLabels = [] }) {
  const lastIndex = steps.length - 1;
  const fraction  = step < 0 ? 0 : Math.min(step, lastIndex) / lastIndex;
  const CIRCLE    = 56;
  const HALF      = CIRCLE / 2;

  return (
    <div className="w-full py-6">
      <div className="max-w-6xl mx-auto px-8">

      
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingLeft: HALF,
            paddingRight: HALF,
            marginBottom: 6,
          }}
        >
          {Array.from({ length: lastIndex }).map((_, gapIndex) => {
            const label     = bridgeLabels[gapIndex] || "";
            const isVisible = step > gapIndex && label !== "";

            return (
              <div
                key={gapIndex}
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: isVisible ? "#86BC25" : "transparent",
                    background: isVisible ? "#f0f9e8" : "transparent",
                    padding: "2px 10px",
                    borderRadius: 20,
                    border: `1px solid ${isVisible ? "#86BC2555" : "transparent"}`,
                    whiteSpace: "nowrap",
                    transition: "all 0.5s ease",
                    display: "inline-block",
                    minWidth: 60,
                    textAlign: "center",
                  }}
                >
                  {label || "·"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="relative flex items-center justify-between">

          <div
            style={{
              position: "absolute",
              top: `${HALF - 2}px`,
              left: `${HALF}px`,
              right: `${HALF}px`,
              height: "4px",
            }}
          >
            <div style={{
              position: "absolute",
              inset: 0,
              background: "#e5e7eb",
              borderRadius: 9999,
            }} />
            <div
              style={{
                position: "absolute",
                top: 0, bottom: 0, left: 0,
                width: `${fraction * 100}%`,
                background: "#86BC25",
                borderRadius: 9999,
                transition: "width 0.7s ease",
              }}
            />
          </div>

          {steps.map((item, index) => {
            const Icon        = item.icon;
            const isCompleted = step > index;
            const isActive    = step === index;

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    width: CIRCLE,
                    height: CIRCLE,
                    flexShrink: 0,
                    borderRadius: "50%",
                    border: `2px solid ${
                      isCompleted ? "#86BC25"
                      : isActive   ? "#86BC25"
                      :              "#d1d5db"
                    }`,
                    background: isCompleted ? "#86BC25" : "#ffffff",
                    color: isCompleted ? "#fff"
                      : isActive ? "#86BC25"
                      : "#9ca3af",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.5s ease",
                    boxShadow: isActive ? "0 0 0 4px #86BC2522" : "none",
                  }}
                >
                  {isCompleted ? (
                    <Check size={24} />
                  ) : isActive ? (
                    <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Icon size={22} />
                  )}
                </div>

                <span
                  style={{
                    fontSize: 12,
                    marginTop: 10,
                    textAlign: "center",
                    lineHeight: 1.35,
                    maxWidth: 90,
                    color: isCompleted || isActive ? "#1f2937" : "#9ca3af",
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      </div>
    </div>
  );
}

export default ProgressNav;