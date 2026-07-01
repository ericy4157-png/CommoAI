import type { RiskFactorSeverity, RiskReport } from "@/lib/types";

interface BusinessImpactProps {
  impact: RiskReport | null;
  loading: boolean;
  companyName?: string | null;
}

const RISK_STYLES = {
  Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  High: "bg-red-500/15 text-red-400 border-red-500/30",
};

const SEVERITY_STYLES: Record<RiskFactorSeverity, string> = {
  low: "text-emerald-400 bg-emerald-500/10",
  medium: "text-amber-400 bg-amber-500/10",
  high: "text-red-400 bg-red-500/10",
};

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function BusinessImpact({
  impact,
  loading,
  companyName,
}: BusinessImpactProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 lg:col-span-2">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-300">
          {companyName
            ? `Risk Report — ${companyName}`
            : "Business Risk Report"}
        </h2>
        {impact?.timeframe && (
          <span className="text-xs text-slate-500">{impact.timeframe}</span>
        )}
      </div>

      {loading && !impact && (
        <div className="space-y-3 animate-pulse">
          <div className="h-6 w-24 rounded bg-slate-800" />
          <div className="h-4 w-full rounded bg-slate-800" />
          <div className="h-20 w-full rounded bg-slate-800" />
          <div className="h-20 w-full rounded bg-slate-800" />
        </div>
      )}

      {impact && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-start gap-4">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${RISK_STYLES[impact.riskLevel]}`}
            >
              {impact.riskLevel} Risk
            </span>
            <p className="flex-1 text-sm leading-relaxed text-slate-300">
              {impact.executiveSummary || impact.summary}
            </p>
          </div>

          <ReportSection title="Cost Exposure">
            <p className="text-sm leading-relaxed text-slate-300">
              {impact.costExposure || impact.explanation}
            </p>
          </ReportSection>

          <ReportSection title="Margin & Cash Flow Impact">
            <p className="text-sm leading-relaxed text-slate-300">
              {impact.marginImpact}
            </p>
          </ReportSection>

          {impact.riskFactorBreakdown.length > 0 && (
            <ReportSection title="Risk Factor Analysis">
              <div className="space-y-3">
                {impact.riskFactorBreakdown.map((factor) => (
                  <div
                    key={`${factor.driver}-${factor.timeframe}`}
                    className="rounded-lg border border-slate-800 bg-slate-800/40 p-4"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-white">
                        {factor.driver}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${SEVERITY_STYLES[factor.severity]}`}
                      >
                        {factor.severity}
                      </span>
                      <span className="text-xs text-slate-500">
                        {factor.timeframe}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-400">
                      <span className="font-medium text-slate-300">
                        Market:{" "}
                      </span>
                      {factor.marketContext}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">
                      <span className="font-medium text-blue-300">
                        For your company:{" "}
                      </span>
                      {factor.companyImpact}
                    </p>
                  </div>
                ))}
              </div>
            </ReportSection>
          )}

          {impact.operationalImplications.length > 0 && (
            <ReportSection title="Operational Implications">
              <ul className="space-y-2 text-sm text-slate-300">
                {impact.operationalImplications.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-slate-600">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </ReportSection>
          )}

          {impact.recommendedActions.length > 0 && (
            <ReportSection title="Recommended Actions">
              <ol className="space-y-2 text-sm text-slate-300">
                {impact.recommendedActions.map((action, index) => (
                  <li key={action} className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-400">
                      {index + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ol>
            </ReportSection>
          )}

          {impact.watchItems.length > 0 && (
            <ReportSection title="Watch List">
              <ul className="space-y-1 text-xs text-slate-400">
                {impact.watchItems.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-slate-600">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </ReportSection>
          )}
        </div>
      )}
    </div>
  );
}
