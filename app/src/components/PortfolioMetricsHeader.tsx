import React from "react";

interface DistributionSlice {
  symbol: string;
  percent: number; // 0-1
}

interface PortfolioMetricsHeaderProps {
  totalValue: number;
  activeCount: number;
  allocationValid: boolean;
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
  distribution: DistributionSlice[];
}

const mutedPalette = [
  "#4f8cff",
  "#5fb1f4",
  "#7ad0c2",
  "#c6b4f0",
  "#f0c987",
  "#e27d8c",
];

const MetricItem: React.FC<{ label: string; value: string; icon?: React.ReactNode; accent?: string }> = ({
  label,
  value,
  icon,
  accent,
}) => (
  <div
    className="is-flex is-align-items-center"
    style={{
      gap: "10px",
      padding: "10px 14px",
      border: "1px solid var(--border)",
      borderRadius: "10px",
      backgroundColor: "var(--surface)",
      minWidth: 0,
      flex: 1,
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: `1px solid ${accent ?? "var(--border)"}`,
        display: "grid",
        placeItems: "center",
        color: accent ?? "var(--muted)",
        fontSize: 14,
      }}
    >
      {icon}
    </div>
    <div className="is-flex is-flex-direction-column" style={{ minWidth: 0 }}>
      <span className="is-size-7" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <span className="has-text-weight-semibold" style={{ color: "var(--text)", wordBreak: "keep-all" }}>
        {value}
      </span>
    </div>
  </div>
);

const AllocationDonutChart: React.FC<{ distribution: DistributionSlice[] }> = ({ distribution }) => {
  const radius = 48;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  const slices = distribution
    .filter((d) => d.percent > 0)
    .map((d, index) => {
      const dash = d.percent * circumference;
      const dashArray = `${dash} ${circumference - dash}`;
      const rotation = (cumulative / circumference) * 360;
      cumulative += dash;
      const color = mutedPalette[index % mutedPalette.length];
      return { dashArray, rotation, color, symbol: d.symbol, percent: d.percent };
    });

  return (
    <div className="is-flex is-flex-direction-column is-align-items-center" style={{ gap: "10px" }}>
      <svg width={(radius + strokeWidth) * 2} height={(radius + strokeWidth) * 2}>
        <g transform={`translate(${radius + strokeWidth}, ${radius + strokeWidth})`}>
          {slices.map((slice, idx) => (
            <circle
              key={slice.symbol + idx}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={slice.dashArray}
              transform={`rotate(${slice.rotation - 90})`}
              strokeLinecap="butt"
            />
          ))}
          <circle r={radius} fill="transparent" stroke="var(--border)" strokeWidth={1} />
        </g>
      </svg>
      <div className="is-flex is-justify-content-center is-flex-wrap" style={{ gap: "10px", maxWidth: 320 }}>
        {slices.map((slice) => (
          <span key={slice.symbol} className="is-size-7" style={{ color: "var(--muted)" }}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: slice.color,
                marginRight: 6,
              }}
            />
            {slice.symbol} ({(slice.percent * 100).toFixed(1)}%)
          </span>
        ))}
      </div>
    </div>
  );
};

const PortfolioMetricsHeader: React.FC<PortfolioMetricsHeaderProps> = ({
  totalValue,
  activeCount,
  allocationValid,
  formatCurrency,
  formatPercent,
  distribution,
}) => {
  const targetLabel = allocationValid ? "100% sum" : "Invalid";
  const targetAccent = allocationValid ? "var(--success)" : "var(--danger)";

  return (
    <div className="mb-5" style={{ background: "var(--background)" }}>
      <div className="is-flex is-align-items-stretch" style={{ gap: "12px", marginBottom: "14px" }}>
        <MetricItem
          label="Total Value"
          value={formatCurrency(totalValue)}
          accent="var(--accent)"
          icon={<span>$</span>}
        />
        <MetricItem
          label="Active Stocks"
          value={String(activeCount)}
          accent="var(--muted)"
          icon={<span>Σ</span>}
        />
        <MetricItem
          label="Allocation Target"
          value={targetLabel}
          accent={targetAccent}
          icon={<span>◎</span>}
        />
      </div>
      <div className="box" style={{ padding: "16px", backgroundColor: "var(--surface)", boxShadow: "none" }}>
        <p className="is-size-6 has-text-weight-semibold mb-3">Allocation</p>
        <AllocationDonutChart distribution={distribution} />
      </div>
    </div>
  );
};

export default PortfolioMetricsHeader;
