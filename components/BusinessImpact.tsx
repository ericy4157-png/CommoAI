import type { TruckingImpact } from "@/lib/types";

interface BusinessImpactProps {
  impact: TruckingImpact | null;
  loading: boolean;
}

const RISK_STYLES = {
  Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  High: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function BusinessImpact({ impact, loading }: BusinessImpactProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <h2 className="mb-3 text-sm font-semibold text-slate-300">
        Trucking Business Impact
      </h2>

      {loading && !impact && (
        <div className="space-y-2 animate-pulse">
          <div className="h-6 w-24 rounded bg-slate-800" />
          <div className="h-4 w-full rounded bg-slate-800" />
          <div className="h-4 w-3/4 rounded bg-slate-800" />
        </div>
      )}

      {impact && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
              Risk Level
            </p>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${RISK_STYLES[impact.riskLevel]}`}
            >
              {impact.riskLevel}
            </span>
          </div>

          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
              Impact
            </p>
            <p className="text-sm leading-relaxed text-slate-300">
              {impact.explanation}
            </p>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
            <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
              Suggested Action
            </p>
            <p className="text-sm font-medium text-white">
              {impact.suggestedAction}
            </p>
          </div>

          {impact.factors.length > 0 && (
            <ul className="space-y-1 text-xs text-slate-400">
              {impact.factors.map((factor) => (
                <li key={factor} className="flex gap-2">
                  <span className="text-slate-600">•</span>
                  {factor}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
