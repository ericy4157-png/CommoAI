import { TrendBadge } from "./TrendBadge";
import type { PricesResponse } from "@/lib/types";

interface PriceHeaderProps {
  data: Pick<PricesResponse, "price" | "dailyChangePct" | "trend" | "fetchedAt">;
}

export function PriceHeader({ data }: PriceHeaderProps) {
  const isUp = data.dailyChangePct >= 0;
  const changeColor = isUp ? "text-emerald-400" : "text-red-400";

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-slate-400">
          WTI Crude Oil (CL=F)
        </p>
        <div className="mt-1 flex items-baseline gap-3">
          <span className="text-4xl font-bold text-white sm:text-5xl">
            ${data.price.toFixed(2)}
          </span>
          <span className={`text-lg font-semibold ${changeColor}`}>
            {isUp ? "+" : ""}
            {data.dailyChangePct.toFixed(2)}%
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Updated {new Date(data.fetchedAt).toLocaleString()}
        </p>
      </div>
      <TrendBadge trend={data.trend} />
    </header>
  );
}
