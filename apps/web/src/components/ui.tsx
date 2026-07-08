import React from "react";
import { useApp } from "@/state/AppContext";

type Div = React.HTMLAttributes<HTMLDivElement>;
type Btn = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Card({ className = "", ...rest }: Div) {
  return (
    <div
      className={`bg-elev border border-elev2 rounded-2xl p-4 ${className}`}
      {...rest}
    />
  );
}

export function Btn({
  className = "",
  variant = "primary",
  ...rest
}: Btn & { variant?: "primary" | "ghost" | "danger" }) {
  const base =
    "px-4 py-3 rounded-xl font-semibold transition active:scale-[0.98] disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-cal text-bg hover:brightness-110"
      : variant === "ghost"
        ? "bg-elev2 text-ink"
        : "bg-burn text-ink";
  return <button className={`${base} ${styles} ${className}`} {...rest} />;
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-dim text-sm mb-1">{label}</span>
      {children}
    </label>
  );
}

export function NumInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      inputMode="decimal"
      className="w-full bg-elev2 border border-elev2 focus:border-cal rounded-xl px-3 py-3 text-ink outline-none tnum"
      {...props}
    />
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      className="w-full bg-elev2 border border-elev2 focus:border-cal rounded-xl px-3 py-3 text-ink outline-none"
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

export function Bar({
  value,
  max,
  color = "#2DD4BF",
}: {
  value: number;
  max: number;
  color?: string;
}) {
  const pct = Math.min(100, (value / Math.max(1, max)) * 100);
  return (
    <div className="w-full h-2 bg-elev2 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, background: color }}
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
  options: { value: T; labelUz: string }[];
}) {
  return (
    <div className="inline-flex bg-elev2 rounded-xl p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
            value === o.value ? "bg-cal text-bg" : "text-dim"
          }`}
        >
          {o.labelUz}
        </button>
      ))}
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
      <div
        className="absolute inset-0"
        onClick={onClose}
        role="button"
        aria-label="close"
      />
      <div className="relative w-full sm:max-w-md bg-elev rounded-t-3xl sm:rounded-3xl p-4 border border-elev2">
        {title && (
          <h2 className="font-display text-lg mb-3">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}

export function Toasts() {
  const { state, dismissToast } = useApp();
  return (
    <div className="fixed top-4 left-0 right-0 flex flex-col items-center gap-2 z-50 px-4">
      {state.toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className={`px-4 py-2 rounded-xl text-sm shadow-lg ${
            t.kind === "error"
              ? "bg-burn text-ink"
              : t.kind === "warn"
                ? "bg-cal text-bg"
                : t.kind === "success"
                  ? "bg-body text-bg"
                  : "bg-elev2 text-ink"
          }`}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
