"use client";

import { useCallback, useEffect, useState } from "react";
import { AIExplanation } from "@/components/AIExplanation";
import { AlertsBanner } from "@/components/AlertsBanner";
import { BusinessImpact } from "@/components/BusinessImpact";
import { PriceChart } from "@/components/PriceChart";
import { PriceHeader } from "@/components/PriceHeader";
import type { AnalyzeResponse, PricesResponse } from "@/lib/types";

export function Dashboard() {
  const [prices, setPrices] = useState<PricesResponse | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [pricesError, setPricesError] = useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);

  const fetchAnalysis = useCallback(async (data: PricesResponse) => {
    setLoadingAnalyze(true);
    setAnalyzeError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: data.price,
          dailyChangePct: data.dailyChangePct,
          features: data.features,
          trend: data.trend,
          alerts: data.alerts,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Analysis failed");
      }
      const result = (await res.json()) as AnalyzeResponse;
      setAnalysis(result);
    } catch (err) {
      setAnalyzeError(
        err instanceof Error ? err.message : "Failed to load AI analysis",
      );
      setAnalysis({
        explanation: data.truckingImpact.explanation,
        shortTermDirection:
          data.trend.label === "upward_pressure"
            ? "up"
            : data.trend.label === "downward_pressure"
              ? "down"
              : "stable",
        truckingImpact: data.truckingImpact,
        source: "heuristic",
      });
    } finally {
      setLoadingAnalyze(false);
    }
  }, []);

  const fetchPrices = useCallback(async () => {
    setLoadingPrices(true);
    setPricesError(null);
    try {
      const res = await fetch("/api/prices");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch prices");
      }
      const data = (await res.json()) as PricesResponse;
      setPrices(data);
      await fetchAnalysis(data);
    } catch (err) {
      setPricesError(
        err instanceof Error ? err.message : "Failed to load dashboard",
      );
    } finally {
      setLoadingPrices(false);
    }
  }, [fetchAnalysis]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  if (loadingPrices && !prices) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-slate-400 animate-pulse">Loading oil market data…</p>
      </div>
    );
  }

  if (pricesError && !prices) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-red-400">{pricesError}</p>
        <button
          type="button"
          onClick={fetchPrices}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!prices) return null;

  const displayImpact = analysis?.truckingImpact ?? prices.truckingImpact;

  return (
    <div className="space-y-6">
      <AlertsBanner alerts={prices.alerts} />
      <PriceHeader data={prices} />
      <PriceChart history={prices.history} />

      <div className="grid gap-6 lg:grid-cols-2">
        <AIExplanation
          analysis={analysis}
          loading={loadingAnalyze}
          error={analyzeError}
        />
        <BusinessImpact impact={displayImpact} loading={loadingAnalyze} />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={fetchPrices}
          disabled={loadingPrices}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          {loadingPrices ? "Refreshing…" : "Refresh Data"}
        </button>
      </div>
    </div>
  );
}
