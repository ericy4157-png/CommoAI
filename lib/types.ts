export type TrendLabel =
  | "upward_pressure"
  | "downward_pressure"
  | "stable"
  | "unstable";

export type RiskLevel = "Low" | "Medium" | "High";

export type ShortTermDirection = "up" | "down" | "stable";

export interface PricePoint {
  date: string;
  close: number;
}

export interface PriceFeatures {
  ma7: number;
  ma30: number;
  volatility: number;
  momentum7d: number;
}

export interface TrendSignal {
  label: TrendLabel;
  displayLabel: string;
  confidence: number;
  factors: string[];
}

export type AlertType = "PRICE_SHOCK" | "VOLATILITY_SPIKE" | "TREND_REVERSAL";

export interface Alert {
  type: AlertType;
  severity: "warning" | "critical";
  message: string;
}

export interface TruckingImpact {
  riskLevel: RiskLevel;
  explanation: string;
  suggestedAction: string;
  factors: string[];
}

export interface PricesResponse {
  price: number;
  dailyChangePct: number;
  history: PricePoint[];
  features: PriceFeatures;
  trend: TrendSignal;
  alerts: Alert[];
  truckingImpact: TruckingImpact;
  fetchedAt: string;
}

export interface AnalyzeResponse {
  explanation: string;
  shortTermDirection: ShortTermDirection;
  truckingImpact: TruckingImpact;
  source: "llm" | "heuristic";
}

export interface AnalyzeRequest {
  price: number;
  dailyChangePct: number;
  features: PriceFeatures;
  trend: TrendSignal;
  alerts: Alert[];
}
