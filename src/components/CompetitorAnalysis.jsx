import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LabelList
} from "recharts";
import { useState } from "react";

const CustomXAxisTick = ({ x, y, payload }) => {
  const words = payload.value.split(" ");

  return (
    <g transform={`translate(${x},${y})`}>
      {words.map((word, index) => (
        <text
          key={index}
          x={0}
          y={index * 12}
          dy={16}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={10}
        >
          {word}
        </text>
      ))}
    </g>
  );
};

function CompetitorAnalysis({
  data,
  strengths,
  competitorStrengths,
}) {

  const competitorData = [
  {
    lens: "Suspicious Claims & Information",
    ourBrand: 72,
    competitor: 68,
  },
  {
    lens: "Response Accountability",
    ourBrand: 85,
    competitor: 74,
  },
  {
    lens: "Customer Escalation Signals",
    ourBrand: 63,
    competitor: 71,
  },
  {
    lens: "Resolution Orientation",
    ourBrand: 78,
    competitor: 82,
  },
  {
    lens: "Brand Promise Consistency",
    ourBrand: 81,
    competitor: 70,
  },
  {
    lens: "Fraud & Impersonation Signals",
    ourBrand: 67,
    competitor: 61,
  },
  {
    lens: "Tone & Professionalism",
    ourBrand: 80,
    competitor: 86,
  },
  {
    lens: "Transparency & Disclosure",
    ourBrand: 76,
    competitor: 73,
  },
  {
    lens: "Community Sentiment Shift",
    ourBrand: 69,
    competitor: 77,
  },
  {
    lens: "Moderation Governance",
    ourBrand: 74,
    competitor: 68,
  },
  {
    lens: "Misinformation & Clarification",
    ourBrand: 83,
    competitor: 72,
  },
];
  return (
    <div>
      {/* Graph */}

      <div
  style={{
    background: "#fff",
    border: "1px solid #e5e7eb",
    padding: 20,
    marginBottom: 24,
  }}
>
  <div
    style={{
      fontSize: 18,
      fontWeight: 600,
      marginBottom: 20,
      color: "#111827",
    }}
  >
    Brand vs. Competitors
  </div>

  <ResponsiveContainer width="100%" height={320}>
    <BarChart
      data={data}
      margin={{
        top: 10,
        right: 5,
        bottom: 20,
        left: 0,
      }}
      barGap={0}
      barCategoryGap="30%"
    >
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="#e5e7eb"
        vertical={false}
      />

      <XAxis
        dataKey="lens"
        axisLine={false}
        tickLine={false}
        tickMargin={2}
        interval={0}
        height={70}
        tick={<CustomXAxisTick />}

      />

      <YAxis
        tick={{
          fontSize: 11,
          fill: "#6b7280",
        }}
        axisLine={false}
        tickLine={false}
        width={25}
      />

      <Tooltip content={<CompetitorTooltip />} />

      <Bar
      dataKey="ourBrand"
      fill="#86BC25"
      name="Brand"
      barSize={26}
    >
      <LabelList
        dataKey="ourBrand"
        position="top"
        formatter={(value) => `${value}%`}
        style={{
          fontSize: 11,
          fontWeight: 600,
          fill: "#374151",
        }}
      />
    </Bar>

    <Bar
      dataKey="competitor"
      fill="#3b82f6"
      name="Competitor"
      barSize={26}
    >
      <LabelList
        dataKey="competitor"
        position="top"
        formatter={(value) => `${value}%`}
        style={{
          fontSize: 11,
          fontWeight: 600,
          fill: "#374151",
        }}
      />
    </Bar>
    </BarChart>
  </ResponsiveContainer>

  {/* Legend */}

  <div
    style={{
      display: "flex",
      gap: 24,
      justifyContent: "center",
      marginTop: 16,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          background: "#86BC25",
        }}
      />
      <span style={{ fontSize: 13 }}>
        Brand
      </span>
    </div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          background: "#3b82f6",
        }}
      />
      <span style={{ fontSize: 13 }}>
        Competition
      </span>
    </div>
  </div>
</div>

      {/* Insights */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        {/* We are doing well */}

        <div
  style={{
    background: "#fff",
    borderLeft: "5px solid #86BC25",
    borderRadius: 0,
    padding: 10,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  }}
>
  <h3
    style={{
      background: "#fff",
      color: "#86BC25",
      padding: "10px 16px",
      borderRadius: 0,
      fontSize: 16,
      fontWeight: 500,
      marginBottom: 16,
    }}
  >
    Where the Brand is Performing Better
  </h3>

  {strengths.map((item) => (
    <div
      key={item.lens}
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 16,
        lineHeight: 1.6,
      }}
    >
      <span>▪</span>
      <div>
        <strong>{item.lens}:</strong> {item.insight}
      </div>
    </div>
  ))}
</div>

        {/* Competitor */}

  <div
  style={{
    background: "#fff",
    borderLeft: "5px solid #3b82f6",
    borderRadius: 0,
    padding: 10,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  }}
>
  <h3
    style={{
      background: "#fff",
      color: "#3b82f6",
      padding: "10px 16px",
      borderRadius: 0,
      fontSize: 16,
      fontWeight: 500,
      marginBottom: 16,
    }}
  >
    Where Competition is Performing Better
  </h3>

  {competitorStrengths.map((item) => (
    <div
      key={item.lens}
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 16,
        lineHeight: 1.6,
      }}
    >
      <span>▪</span>
      <div>
        <strong>{item.lens}:</strong> {item.insight}
      </div>
    </div>
  ))}
</div>
      </div>
    </div>
  );
}

function CompetitorTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        padding: 12,
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          fontWeight: 500,
          fontSize: 13,
          marginBottom: 8,
          color: "#111827",
        }}
      >
        {label}
      </div>

      {payload.map((entry) => (
        <div
          key={entry.name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            fontSize: 13,
          }}
        >
          <span style={{ color: entry.color }}>
            {entry.name}
          </span>

          <strong>{entry.value}%</strong>
        </div>
      ))}
    </div>
  );
}

export default CompetitorAnalysis