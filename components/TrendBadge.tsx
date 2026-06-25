import type { TrendSignal } from "@/lib/types";

const STYLES: Record<
  TrendSignal["label"],
  { bg: string; text: string; dot: string }
> = {
  upward_pressure: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  downward_pressure: {
    bg: "bg-red-500/15",
    text: "text-red-400",
    dot: "bg-red-400",
  },
  stable: {
    bg: "bg-slate-500/15",
    text: "text-slate-300",
    dot: "bg-slate-400",
  },
  unstable: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
};

interface TrendBadgeProps {
  trend: TrendSignal;
}

export function TrendBadge({ trend }: TrendBadgeProps) {
  const style = STYLES[trend.label];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${style.bg} ${style.text}`}
    >
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {trend.displayLabel}
      <span className="text-xs opacity-70">
        ({Math.round(trend.confidence * 100)}%)
      </span>
    </div>
  );
}
