import React from "react";

export function Sparkline({
  data,
  width = 120,
  height = 36,
  color = "#FFB020",
  fillOpacity = 0.15,
  strokeWidth = 2,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
  strokeWidth?: number;
}) {
  if (data.length === 0) return <svg width={width} height={height} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });
  const line = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const area =
    `M0,${height} ${points.map(([x, y]) => `L${x},${y}`).join(" ")} L${width},${height} Z`;
  const gradId = React.useId();
  return (
    <svg width={width} height={height} className="block">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {points.length > 0 &&
        (() => {
          const last = points[points.length - 1]!;
          return <circle cx={last[0]} cy={last[1]} r={3} fill={color} />;
        })()}
    </svg>
  );
}

interface ChartPoint {
  date: string;
  value: number;
}

export function WeightChart({
  points,
  targetKg,
  height = 220,
  color = "#2DD4BF",
  targetColor = "#FFB020",
}: {
  points: ChartPoint[];
  targetKg?: number;
  height?: number;
  color?: string;
  targetColor?: string;
}) {
  const [width, setWidth] = React.useState(320);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 320;
      setWidth(Math.max(200, w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const padL = 32;
  const padR = 8;
  const padT = 12;
  const padB = 22;
  const w = width;
  const h = height;
  const iw = w - padL - padR;
  const ih = h - padT - padB;

  if (points.length === 0) {
    return (
      <div ref={ref} className="w-full">
        <svg width={w} height={h}>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            fill="#5A6788"
            style={{ fontSize: 12 }}
          >
            No data yet
          </text>
        </svg>
      </div>
    );
  }

  const values = points.map((p) => p.value);
  if (typeof targetKg === "number") values.push(targetKg);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const span = rawMax - rawMin || 1;
  const pad = span * 0.15;
  const min = rawMin - pad;
  const max = rawMax + pad;
  const range = max - min;

  const step = points.length > 1 ? iw / (points.length - 1) : iw;
  const xy = points.map((p, i) => {
    const x = padL + i * step;
    const y = padT + (1 - (p.value - min) / range) * ih;
    return [x, y] as const;
  });

  const line = xy.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");

  // 7-day moving average
  const window = 7;
  const ma = points.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = points.slice(start, i + 1);
    const avg = slice.reduce((s, p) => s + p.value, 0) / slice.length;
    return avg;
  });
  const maXy = ma.map((v, i) => {
    const x = padL + i * step;
    const y = padT + (1 - (v - min) / range) * ih;
    return [x, y] as const;
  });
  const maLine = maXy
    .map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`))
    .join(" ");

  const gridLines = 3;
  const grid = Array.from({ length: gridLines + 1 }).map((_, i) => {
    const y = padT + (ih * i) / gridLines;
    const v = max - (range * i) / gridLines;
    return { y, v };
  });

  const targetY =
    typeof targetKg === "number"
      ? padT + (1 - (targetKg - min) / range) * ih
      : null;

  const gradId = React.useId();
  const lastXy = xy[xy.length - 1]!;
  const firstXy = xy[0]!;
  const areaPath = `${line} L${lastXy[0]},${padT + ih} L${firstXy[0]},${padT + ih} Z`;

  return (
    <div ref={ref} className="w-full">
      <svg width={w} height={h} className="block">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {grid.map((g, i) => (
          <g key={i}>
            <line
              x1={padL}
              x2={w - padR}
              y1={g.y}
              y2={g.y}
              stroke="#1C2440"
              strokeDasharray="3 4"
            />
            <text
              x={padL - 4}
              y={g.y + 3}
              textAnchor="end"
              fill="#5A6788"
              style={{ fontSize: 10, fontVariantNumeric: "tabular-nums" }}
            >
              {g.v.toFixed(0)}
            </text>
          </g>
        ))}
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path
          d={maLine}
          fill="none"
          stroke={color}
          strokeOpacity="0.35"
          strokeWidth={2}
          strokeDasharray="4 4"
        />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {targetY !== null && (
          <g>
            <line
              x1={padL}
              x2={w - padR}
              y1={targetY}
              y2={targetY}
              stroke={targetColor}
              strokeDasharray="6 4"
              strokeWidth={1.5}
            />
            <text
              x={w - padR}
              y={targetY - 4}
              textAnchor="end"
              fill={targetColor}
              style={{ fontSize: 10, fontWeight: 600 }}
            >
              target {targetKg}
            </text>
          </g>
        )}
        {xy.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i === xy.length - 1 ? 4 : 2.5}
            fill={color}
            stroke="#080B1A"
            strokeWidth={i === xy.length - 1 ? 2 : 0}
          />
        ))}
        {/* x-axis first & last label */}
        <text
          x={padL}
          y={h - 4}
          fill="#5A6788"
          style={{ fontSize: 10 }}
        >
          {points[0]!.date.slice(5)}
        </text>
        <text
          x={w - padR}
          y={h - 4}
          textAnchor="end"
          fill="#5A6788"
          style={{ fontSize: 10 }}
        >
          {points[points.length - 1]!.date.slice(5)}
        </text>
      </svg>
    </div>
  );
}
