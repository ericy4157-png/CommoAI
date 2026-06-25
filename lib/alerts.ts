import type { Alert, PriceFeatures, PricePoint } from "./types";

function rollingVolatility(history: PricePoint[], window: number): number[] {
  const vols: number[] = [];
  for (let i = window; i < history.length; i++) {
    const slice = history.slice(i - window, i);
    const returns = slice.slice(1).map((p, idx) => {
      const prev = slice[idx].close;
      return prev > 0 ? ((p.close - prev) / prev) * 100 : 0;
    });
    if (returns.length === 0) {
      vols.push(0);
      continue;
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance =
      returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
    vols.push(Math.sqrt(variance));
  }
  return vols;
}

function detectTrendReversal(
  history: PricePoint[],
  ma7: number,
  ma30: number,
): boolean {
  if (history.length < 10) return false;

  const recent = history.slice(-5);
  const closes = recent.map((p) => p.close);

  const shortAvg = closes.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const longAvg = closes.reduce((a, b) => a + b, 0) / closes.length;

  const wasAbove = shortAvg > longAvg;
  const nowAbove = ma7 > ma30;
  return wasAbove !== nowAbove;
}

export function computeAlerts(
  dailyChangePct: number,
  features: PriceFeatures,
  history: PricePoint[],
): Alert[] {
  const alerts: Alert[] = [];

  if (Math.abs(dailyChangePct) > 3) {
    alerts.push({
      type: "PRICE_SHOCK",
      severity: Math.abs(dailyChangePct) > 5 ? "critical" : "warning",
      message: `Oil moved ${dailyChangePct > 0 ? "+" : ""}${dailyChangePct.toFixed(2)}% in the last session — shock event detected.`,
    });
  }

  const volHistory = rollingVolatility(history, 7);
  if (volHistory.length > 0) {
    const avgVol =
      volHistory.reduce((a, b) => a + b, 0) / volHistory.length;
    if (avgVol > 0 && features.volatility > avgVol * 1.5) {
      alerts.push({
        type: "VOLATILITY_SPIKE",
        severity: "warning",
        message: `Volatility spike: current ${features.volatility.toFixed(2)}% vs recent average ${avgVol.toFixed(2)}%.`,
      });
    }
  }

  if (detectTrendReversal(history, features.ma7, features.ma30)) {
    alerts.push({
      type: "TREND_REVERSAL",
      severity: "warning",
      message:
        "Trend reversal detected: short-term moving average crossed long-term average.",
    });
  }

  return alerts;
}
