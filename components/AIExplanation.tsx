import type { AnalyzeResponse } from "@/lib/types";

interface AIExplanationProps {
  analysis: AnalyzeResponse | null;
  loading: boolean;
  error: string | null;
}

const DIRECTION_LABELS = {
  up: "Bullish (1–2 weeks)",
  down: "Bearish (1–2 weeks)",
  stable: "Range-bound (1–2 weeks)",
};

export function AIExplanation({ analysis, loading, error }: AIExplanationProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300">AI Explanation</h2>
        {analysis && (
          <span className="text-xs text-slate-500">
            via {analysis.source === "llm" ? "GPT-4o-mini" : "heuristic"}
          </span>
        )}
      </div>

      {loading && (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 w-full rounded bg-slate-800" />
          <div className="h-4 w-5/6 rounded bg-slate-800" />
          <div className="h-4 w-4/6 rounded bg-slate-800" />
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {analysis && !loading && (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-300">
            {analysis.explanation}
          </p>
          <div className="inline-flex rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-400">
            Short-term: {DIRECTION_LABELS[analysis.shortTermDirection]}
          </div>
        </div>
      )}
    </div>
  );
}
