import type { PriceFeatures, TrendLabel, TrendSignal } from "./types";

const TREND_DISPLAY: Record<TrendLabel, string> = {
  upward_pressure: "Upward Pressure",
  downward_pressure: "Downward Pressure",
  stable: "Stable",
  unstable: "Unstable",
};

export function computeTrend(
  features: PriceFeatures,
  dailyChangePct: number,
): TrendSignal {
  const { ma7, ma30, volatility, momentum7d } = features;
  const factors: string[] = [];
  let label: TrendLabel = "stable";
  let confidence = 0.5;

  const shockMove = Math.abs(dailyChangePct) > 3;
  const highVolatility = volatility > 2.5;

  if (shockMove || highVolatility) {
    label = "unstable";
    confidence = shockMove ? 0.85 : 0.7;
    if (shockMove) {
      factors.push(`Sharp daily move of ${dailyChangePct.toFixed(2)}%`);
    }
    if (highVolatility) {
      factors.push(`Elevated volatility at ${volatility.toFixed(2)}%`);
    }
  } else if (ma7 > ma30 && momentum7d > 0) {
    label = "upward_pressure";
    confidence = Math.min(0.9, 0.55 + Math.abs(momentum7d) / 20);
    factors.push("7-day MA above 30-day MA");
    factors.push(`Positive 7-day momentum of ${momentum7d.toFixed(2)}%`);
  } else if (ma7 < ma30 && momentum7d < 0) {
    label = "downward_pressure";
    confidence = Math.min(0.9, 0.55 + Math.abs(momentum7d) / 20);
    factors.push("7-day MA below 30-day MA");
    factors.push(`Negative 7-day momentum of ${momentum7d.toFixed(2)}%`);
  } else if (Math.abs(momentum7d) < 1 && volatility < 1.5) {
    label = "stable";
    confidence = 0.65;
    factors.push("Low momentum and volatility");
  } else if (ma7 > ma30) {
    label = "upward_pressure";
    confidence = 0.55;
    factors.push("7-day MA above 30-day MA");
  } else if (ma7 < ma30) {
    label = "downward_pressure";
    confidence = 0.55;
    factors.push("7-day MA below 30-day MA");
  }

  return {
    label,
    displayLabel: TREND_DISPLAY[label],
    confidence,
    factors,
  };
}
