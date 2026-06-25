import type {
  PriceFeatures,
  RiskLevel,
  TrendSignal,
  TruckingImpact,
} from "./types";

const ACTIONS: Record<RiskLevel, string> = {
  High: "Consider locking fuel contracts",
  Medium: "Expect higher operating costs soon",
  Low: "No immediate action required",
};

export function computeTruckingImpact(
  price: number,
  dailyChangePct: number,
  features: PriceFeatures,
  trend: TrendSignal,
): TruckingImpact {
  let score = 0;
  const factors: string[] = [];

  if (trend.label === "upward_pressure" || trend.label === "unstable") {
    score += 2;
    factors.push("Rising oil trend increases diesel cost risk");
  }

  if (features.momentum7d > 2) {
    score += 2;
    factors.push(`Strong 7-day momentum (+${features.momentum7d.toFixed(2)}%)`);
  } else if (features.momentum7d > 0) {
    score += 1;
    factors.push("Positive weekly momentum");
  }

  if (features.volatility > 2) {
    score += 1;
    factors.push("High volatility creates margin pressure");
  }

  if (dailyChangePct > 2) {
    score += 1;
    factors.push(`Today's +${dailyChangePct.toFixed(2)}% move raises near-term fuel costs`);
  }

  if (trend.label === "downward_pressure") {
    score -= 2;
    factors.push("Falling oil trend eases diesel cost pressure");
  }

  if (features.momentum7d < -2) {
    score -= 1;
    factors.push("Negative weekly momentum may lower fuel expenses");
  }

  let riskLevel: RiskLevel = "Low";
  if (score >= 4) riskLevel = "High";
  else if (score >= 2) riskLevel = "Medium";

  const explanation = buildExplanation(riskLevel, price, factors);

  return {
    riskLevel,
    explanation,
    suggestedAction: ACTIONS[riskLevel],
    factors,
  };
}

function buildExplanation(
  riskLevel: RiskLevel,
  price: number,
  factors: string[],
): string {
  const base = `At $${price.toFixed(2)}/bbl WTI, trucking operators face ${riskLevel.toLowerCase()} diesel and shipping cost risk.`;
  if (factors.length === 0) {
    return `${base} Market conditions appear relatively calm for fuel budgeting.`;
  }
  return `${base} Key drivers: ${factors.slice(0, 2).join("; ")}.`;
}

export function heuristicAnalyzeFallback(
  price: number,
  dailyChangePct: number,
  features: PriceFeatures,
  trend: TrendSignal,
): {
  explanation: string;
  shortTermDirection: "up" | "down" | "stable";
  truckingImpact: TruckingImpact;
} {
  const truckingImpact = computeTruckingImpact(
    price,
    dailyChangePct,
    features,
    trend,
  );

  let shortTermDirection: "up" | "down" | "stable" = "stable";
  if (
    trend.label === "upward_pressure" ||
    (trend.label === "unstable" && dailyChangePct > 0)
  ) {
    shortTermDirection = "up";
  } else if (
    trend.label === "downward_pressure" ||
    (trend.label === "unstable" && dailyChangePct < 0)
  ) {
    shortTermDirection = "down";
  }

  const directionText =
    shortTermDirection === "up"
      ? "prices may continue rising"
      : shortTermDirection === "down"
        ? "prices may soften"
        : "prices may stay range-bound";

  const explanation = `WTI crude is at $${price.toFixed(2)} (${dailyChangePct >= 0 ? "+" : ""}${dailyChangePct.toFixed(2)}% today). The trend signal is "${trend.displayLabel}" with ${features.volatility.toFixed(2)}% volatility. Over the next 1–2 weeks, ${directionText}, which affects diesel costs and operating margins for trucking fleets.`;

  return { explanation, shortTermDirection, truckingImpact };
}
