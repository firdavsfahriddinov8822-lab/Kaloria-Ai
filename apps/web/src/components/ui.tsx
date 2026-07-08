import React from "react";
import { useApp } from "@/state/AppContext";

type Div = React.HTMLAttributes<HTMLDivElement>;
type BtnEl = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Card({ className = "", ...rest }: Div) {
  return (
    <div
      className={`bg-elev/80 card-glass hairline border border-line/60 rounded-2xl p-4 shadow-card ${className}`}
      {...rest}
    />
  );
}

export function Btn({
  className = "",
  variant = "primary",
  size = "md",
  ...rest
}: BtnEl & {
  variant?: "primary" | "ghost" | "danger" | "success" | "gradient";
  size?: "sm" | "md" | "lg";
}) {
  const base =
    "rounded-xl font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-4 text-lg",
  }[size];
  const styles = {
    primary: "bg-cal text-bg hover:brightness-110 shadow-glow-cal",
    gradient: "bg-cal-gradient text-bg hover:brightness-110 shadow-glow-cal",
    ghost: "bg-elev2 text-ink hover:bg-elev3 border border-line/60",
    danger: "bg-danger text-ink hover:brightness-110",
    success: "bg-success text-bg hover:brightness-110",
  }[variant];
  return <button className={`${base} ${sizes} ${styles} ${className}`} {...rest} />;
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-dim text-sm mb-1">{label}</span>
      {children}
      {hint && <span className="block text-mute text-xs mt-1">{hint}</span>}
    </label>
  );
}

export function NumInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      inputMode="decimal"
      className="w-full bg-elev2 border border-line/60 focus:border-cal rounded-xl px-3 py-3 text-ink outline-none tnum transition"
      {...props}
    />
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full bg-elev2 border border-line/60 focus:border-cal rounded-xl px-3 py-3 text-ink outline-none transition"
      {...props}
    />
  );
}

export function Ring({
  value,
  max,
  size = 120,
  color = "#FFB020",
  label,
}: {
  value: number;
  max: number;
  size?: number;
  color?: string;
  label?: string;
}) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / Math.max(1, max)));
  const dash = c * pct;
  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="#1C2440"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${c - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        fill="none"
      />
      <text
        x="50%"
        y="46%"
        textAnchor="middle"
        className="tnum fill-ink"
        style={{ fontFamily: "Space Grotesk", fontSize: 22, fontWeight: 700 }}
      >
        {Math.round(value)}
      </text>
      {label && (
        <text
          x="50%"
          y="64%"
          textAnchor="middle"
          className="fill-dim"
          style={{ fontSize: 11 }}
        >
          {label}
        </text>
      )}
    </svg>
  );
}

export function GradientRing({
  value,
  max,
  size = 200,
  thickness = 14,
  gradient = ["#FFB020", "#FF5A3C"],
  bgTrack = "#1C2440",
  centerLabel,
  centerSub,
  glowClass = "shadow-glow-cal",
}: {
  value: number;
  max: number;
  size?: number;
  thickness?: number;
  gradient?: [string, string];
  bgTrack?: string;
  centerLabel?: React.ReactNode;
  centerSub?: React.ReactNode;
  glowClass?: string;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / Math.max(1, max)));
  const dash = c * pct;
  const gradId = React.useId();

  return (
    <div className={`relative inline-block rounded-full ${glowClass}`}>
      <svg width={size} height={size} className="block">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={bgTrack}
          strokeWidth={thickness}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gradId})`}
          strokeWidth={thickness}
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          fill="none"
          style={{ transition: "stroke-dasharray 500ms cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {centerLabel && (
          <div className="font-display text-5xl tnum text-ink leading-none">
            {centerLabel}
          </div>
        )}
        {centerSub && (
          <div className="text-dim text-xs mt-1 uppercase tracking-wide">
            {centerSub}
          </div>
        )}
      </div>
    </div>
  );
}

export function Bar({
  value,
  max,
  color = "#2DD4BF",
  height = 8,
}: {
  value: number;
  max: number;
  color?: string;
  height?: number;
}) {
  const pct = Math.min(100, (value / Math.max(1, max)) * 100);
  return (
    <div
      className="w-full bg-elev2 rounded-full overflow-hidden"
      style={{ height }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: color,
          transition: "width 400ms cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; labelUz: string; disabled?: boolean; hint?: string }[];
}) {
  return (
    <div className="inline-flex bg-elev2 rounded-xl p-1 flex-wrap gap-1">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => !o.disabled && onChange(o.value)}
            disabled={o.disabled}
            title={o.hint}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
              o.disabled
                ? "text-mute opacity-50 line-through cursor-not-allowed"
                : active
                  ? "bg-cal text-bg shadow-glow-cal"
                  : "text-dim hover:text-ink"
            }`}
          >
            {o.labelUz}
            {o.disabled && " ✓"}
          </button>
        );
      })}
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="absolute inset-0"
        onClick={onClose}
        role="button"
        aria-label="close"
      />
      <div className="relative w-full sm:max-w-md bg-elev border-t border-line rounded-t-3xl sm:rounded-3xl p-5 animate-fade-up">
        {title && <h2 className="font-display text-lg mb-3">{title}</h2>}
        {children}
      </div>
    </div>
  );
}

export function Toasts() {
  const { state, dismissToast } = useApp();
  return (
    <div className="fixed top-4 left-0 right-0 flex flex-col items-center gap-2 z-50 px-4 pointer-events-none">
      {state.toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className={`px-4 py-2 rounded-xl text-sm shadow-card animate-fade-up pointer-events-auto ${
            t.kind === "error"
              ? "bg-danger text-ink"
              : t.kind === "warn"
                ? "bg-warn text-bg"
                : t.kind === "success"
                  ? "bg-success text-bg"
                  : "bg-elev2 text-ink border border-line"
          }`}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}

// ── New premium primitives ──────────────────────────────────────────

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-lg">{title}</h2>
        {subtitle && <div className="text-dim text-xs mt-0.5">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

export function StatTile({
  label,
  value,
  unit,
  color = "#EAF0FF",
  sub,
  bar,
}: {
  label: string;
  value: number | string;
  unit?: string;
  color?: string;
  sub?: string;
  bar?: { value: number; max: number };
}) {
  return (
    <div className="flex-1 bg-elev2/70 border border-line/40 rounded-2xl p-3 hairline">
      <div className="text-[11px] uppercase tracking-wide text-mute">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className="font-display text-xl tnum leading-none"
          style={{ color }}
        >
          {value}
        </span>
        {unit && <span className="text-dim text-xs">{unit}</span>}
      </div>
      {sub && <div className="text-mute text-xs mt-1">{sub}</div>}
      {bar && (
        <div className="mt-2">
          <Bar value={bar.value} max={bar.max} color={color} height={4} />
        </div>
      )}
    </div>
  );
}

export function Chip({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warn" | "danger" | "info" | "cal";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-elev2 text-dim border border-line/60",
    success: "bg-success/15 text-success border border-success/30",
    warn: "bg-warn/15 text-warn border border-warn/30",
    danger: "bg-danger/15 text-danger border border-danger/30",
    info: "bg-info/15 text-info border border-info/30",
    cal: "bg-cal/15 text-cal border border-cal/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function HealthBadge({
  status,
  labels,
}: {
  status: "good" | "watch" | "risk";
  labels?: { good: string; watch: string; risk: string };
}) {
  const map = {
    good: {
      tone: "success" as const,
      icon: "✓",
      text: labels?.good ?? "On track",
    },
    watch: {
      tone: "warn" as const,
      icon: "⚠",
      text: labels?.watch ?? "Watch",
    },
    risk: {
      tone: "danger" as const,
      icon: "✕",
      text: labels?.risk ?? "Risk",
    },
  }[status];
  return (
    <Chip tone={map.tone}>
      <span>{map.icon}</span>
      <span>{map.text}</span>
    </Chip>
  );
}

export function SkeletonCard({ height = 96 }: { height?: number }) {
  return <div className="skeleton" style={{ height }} />;
}

export function DangerBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-danger/12 border border-danger/40 text-danger rounded-xl p-3 text-sm animate-fade-up">
      {children}
    </div>
  );
}

export function InfoBanner({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: "info" | "warn" | "cal";
}) {
  const styles = {
    info: "bg-info/12 border-info/40 text-info",
    warn: "bg-warn/12 border-warn/40 text-warn",
    cal: "bg-cal/12 border-cal/40 text-cal",
  }[tone];
  return (
    <div className={`${styles} border rounded-xl p-3 text-sm animate-fade-up`}>
      {children}
    </div>
  );
}
