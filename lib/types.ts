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

export type RiskFactorSeverity = "low" | "medium" | "high";

export interface RiskFactorDetail {
  driver: string;
  marketContext: string;
  companyImpact: string;
  severity: RiskFactorSeverity;
  timeframe: string;
}

export interface RiskReport extends TruckingImpact {
  summary: string;
  executiveSummary: string;
  costExposure: string;
  marginImpact: string;
  operationalImplications: string[];
  riskFactorBreakdown: RiskFactorDetail[];
  recommendedActions: string[];
  watchItems: string[];
  timeframe: string;
}

export interface PricesResponse {
  price: number;
  dailyChangePct: number;
  history: PricePoint[];
  features: PriceFeatures;
  trend: TrendSignal;
  alerts: Alert[];
  truckingImpact: RiskReport;
  fetchedAt: string;
}

export interface AnalyzeResponse {
  explanation: string;
  shortTermDirection: ShortTermDirection;
  truckingImpact: RiskReport;
  source: "llm" | "heuristic";
}

export interface AnalyzeRequest {
  price: number;
  dailyChangePct: number;
  features: PriceFeatures;
  trend: TrendSignal;
  alerts: Alert[];
  company?: {
    companyName: string;
    industry: string;
    companySize: string;
    commodity: "oil";
    monthlyEnergySpend: string;
    energyCostShare: string;
    pricingFlexibility: string;
    fuelContractType: string;
    geographicFocus: string;
    businessDescription?: string;
  };
}
