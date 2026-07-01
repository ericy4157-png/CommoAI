import type { OnboardingData } from "./onboarding";
import type {
  Alert,
  PriceFeatures,
  RiskFactorDetail,
  RiskLevel,
  RiskReport,
  TrendSignal,
} from "./types";
import { computeTruckingImpact } from "./trucking-impact";

interface MarketSnapshot {
  price: number;
  dailyChangePct: number;
  features: PriceFeatures;
  trend: TrendSignal;
  alerts: Alert[];
}

interface ExposureProfile {
  energyWeight: number;
  spendWeight: number;
  passThroughAbility: number;
  contractProtection: number;
  sizeMultiplier: number;
  industryFuelSensitivity: number;
  industryLabel: string;
  primaryCostChannels: string[];
}

function energyShareWeight(share: string): number {
  if (share.startsWith("Over 40")) return 4;
  if (share.startsWith("25%")) return 3;
  if (share.startsWith("10%")) return 2;
  return 1;
}

function spendWeight(spend: string): number {
  if (spend.startsWith("Over")) return 4;
  if (spend.startsWith("$10,000")) return 3;
  if (spend.startsWith("$2,500")) return 2;
  return 1;
}

function passThroughScore(flexibility: string): number {
  if (flexibility.startsWith("We can pass most")) return 3;
  if (flexibility.startsWith("We can pass some")) return 2;
  return 0;
}

function contractProtectionScore(contract: string): number {
  if (contract.startsWith("Locked")) return 3;
  if (contract.startsWith("Partial")) return 2;
  return 0;
}

function sizeMultiplier(size: string): number {
  if (size === "250+") return 1.15;
  if (size === "51–250") return 1.05;
  if (size === "11–50") return 1;
  return 0.9;
}

function industryProfile(industry: string): Pick<
  ExposureProfile,
  "industryFuelSensitivity" | "industryLabel" | "primaryCostChannels"
> {
  const profiles: Record<
    string,
    Pick<
      ExposureProfile,
      "industryFuelSensitivity" | "industryLabel" | "primaryCostChannels"
    >
  > = {
    Transportation: {
      industryFuelSensitivity: 4,
      industryLabel: "fleet fuel and freight rates",
      primaryCostChannels: [
        "diesel and DEF for vehicles",
        "carrier surcharges on inbound/outbound freight",
        "driver retention costs when fuel allowances shift",
      ],
    },
    Construction: {
      industryFuelSensitivity: 3,
      industryLabel: "equipment fuel and material delivery",
      primaryCostChannels: [
        "diesel for heavy equipment and job-site generators",
        "asphalt, resin, and plastic input costs tied to oil",
        "subcontractor fuel surcharges on earthmoving and hauling",
      ],
    },
    Manufacturing: {
      industryFuelSensitivity: 3,
      industryLabel: "energy inputs and logistics",
      primaryCostChannels: [
        "plant energy and boiler fuel",
        "petrochemical-based raw materials",
        "outbound freight and packaging resin costs",
      ],
    },
    Agriculture: {
      industryFuelSensitivity: 3,
      industryLabel: "diesel for machinery and irrigation",
      primaryCostChannels: [
        "tractor and harvester diesel",
        "fertilizer and chemical inputs linked to natural gas/oil",
        "crop transport and cold-chain fuel costs",
      ],
    },
    Restaurant: {
      industryFuelSensitivity: 2,
      industryLabel: "delivery and utility costs",
      primaryCostChannels: [
        "food distributor delivery fees",
        "cooking fuel and utility bills",
        "packaging and disposable goods tied to petroleum",
      ],
    },
    Retail: {
      industryFuelSensitivity: 2,
      industryLabel: "shipping and supplier pricing",
      primaryCostChannels: [
        "inbound freight from suppliers",
        "last-mile delivery if you operate e-commerce",
        "plastic packaging and imported goods pricing",
      ],
    },
    Other: {
      industryFuelSensitivity: 2,
      industryLabel: "energy and logistics costs",
      primaryCostChannels: [
        "direct fuel or utility spend",
        "supplier price increases passed through logistics",
        "contractor and vendor surcharges",
      ],
    },
  };

  return profiles[industry] ?? profiles.Other;
}

function buildExposureProfile(company: OnboardingData): ExposureProfile {
  const industry = industryProfile(company.industry);
  return {
    energyWeight: energyShareWeight(company.energyCostShare),
    spendWeight: spendWeight(company.monthlyEnergySpend),
    passThroughAbility: passThroughScore(company.pricingFlexibility),
    contractProtection: contractProtectionScore(company.fuelContractType),
    sizeMultiplier: sizeMultiplier(company.companySize),
    ...industry,
  };
}

function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 6) return "High";
  if (score >= 3) return "Medium";
  return "Low";
}

function buildRiskFactorDetails(
  company: OnboardingData,
  market: MarketSnapshot,
  exposure: ExposureProfile,
): RiskFactorDetail[] {
  const { price, dailyChangePct, features, trend, alerts } = market;
  const factors: RiskFactorDetail[] = [];

  if (trend.label === "upward_pressure" || trend.label === "unstable") {
    const severity =
      trend.label === "unstable" && Math.abs(dailyChangePct) > 3
        ? "high"
        : trend.label === "upward_pressure"
          ? "medium"
          : "medium";
    factors.push({
      driver: `Oil trend: ${trend.displayLabel}`,
      marketContext: `WTI is in a ${trend.displayLabel.toLowerCase()} regime at $${price.toFixed(2)}/bbl, signaling sustained pressure on petroleum-linked costs.`,
      companyImpact: `${company.companyName}'s ${exposure.industryLabel} costs are likely to rise over the next 1–2 weeks because ${exposure.primaryCostChannels[0]} typically reprices with crude. With energy at ${company.energyCostShare.toLowerCase()}, this trend hits your P&L ${exposure.passThroughAbility < 2 ? "directly" : "unless you can reprice quickly"}.`,
      severity,
      timeframe: "1–2 weeks",
    });
  }

  if (features.momentum7d > 1.5 || features.momentum7d < -1.5) {
    const rising = features.momentum7d > 0;
    factors.push({
      driver: `7-day momentum ${rising ? "+" : ""}${features.momentum7d.toFixed(2)}%`,
      marketContext: `Crude has moved ${rising ? "higher" : "lower"} consistently over the past week, which suppliers and carriers often use to justify ${rising ? "surcharges" : "temporary relief"}.`,
      companyImpact: rising
        ? `As a ${company.industry.toLowerCase()} operator spending ${company.monthlyEnergySpend.toLowerCase()} on energy, momentum-driven increases can show up in invoices before your team adjusts budgets — especially on ${company.fuelContractType.toLowerCase()}.`
        : `Falling momentum may ease pressure on ${exposure.primaryCostChannels[1]}, giving ${company.companyName} brief room to renegotiate vendor terms if contracts are renewing soon.`,
      severity: rising
        ? features.momentum7d > 3
          ? "high"
          : "medium"
        : "low",
      timeframe: "1–3 weeks",
    });
  }

  if (features.volatility > 2) {
    factors.push({
      driver: `Elevated volatility (${features.volatility.toFixed(2)}%)`,
      marketContext: `Large day-to-day swings make it harder to forecast energy and freight costs accurately.`,
      companyImpact: `For ${company.companyName} (${company.companySize}), volatile crude increases planning risk: ${company.pricingFlexibility.toLowerCase()}, so margin uncertainty is ${exposure.passThroughAbility < 2 ? "high" : "moderate"} when quotes and contracts were priced on stable assumptions.`,
      severity: features.volatility > 2.5 ? "high" : "medium",
      timeframe: "Ongoing",
    });
  }

  if (Math.abs(dailyChangePct) > 2) {
    const shock = Math.abs(dailyChangePct) > 3;
    factors.push({
      driver: `Today's ${dailyChangePct >= 0 ? "+" : ""}${dailyChangePct.toFixed(2)}% price move`,
      marketContext: shock
        ? "A sharp single-session move often triggers emergency fuel surcharges and supplier price letters."
        : "A notable daily move can reset supplier expectations even if the trend is not yet confirmed.",
      companyImpact: shock
        ? `${company.companyName} should expect carriers and fuel vendors in ${company.geographicFocus.toLowerCase()} to cite this move when adjusting rates. With ${company.fuelContractType.toLowerCase()}, your exposure is ${exposure.contractProtection < 2 ? "immediate" : "partially buffered"}.`
        : `Monitor vendor communications this week — ${company.industry} suppliers frequently reference daily crude headlines when pushing ${dailyChangePct > 0 ? "increases" : "discounts"}.`,
      severity: shock ? "high" : "medium",
      timeframe: "Days to 1 week",
    });
  }

  for (const alert of alerts) {
    factors.push({
      driver: alert.type.replace(/_/g, " ").toLowerCase(),
      marketContext: alert.message,
      companyImpact: mapAlertToCompanyImpact(alert.type, company, exposure),
      severity: alert.severity === "critical" ? "high" : "medium",
      timeframe: "Immediate",
    });
  }

  if (factors.length === 0) {
    factors.push({
      driver: "Stable market conditions",
      marketContext: `WTI at $${price.toFixed(2)}/bbl with limited momentum and normal volatility.`,
      companyImpact: `${company.companyName} faces no urgent commodity shock, but ${exposure.industryLabel} costs should still be reviewed quarterly given ${company.energyCostShare.toLowerCase()}.`,
      severity: "low",
      timeframe: "1–4 weeks",
    });
  }

  return factors;
}

function mapAlertToCompanyImpact(
  type: Alert["type"],
  company: OnboardingData,
  exposure: ExposureProfile,
): string {
  switch (type) {
    case "PRICE_SHOCK":
      return `Sudden crude moves disproportionately affect ${company.industry.toLowerCase()} businesses that buy on spot. ${company.companyName} should alert procurement and review whether customer pricing can absorb a fuel surcharge.`;
    case "VOLATILITY_SPIKE":
      return `Budget variance will widen for a ${company.companySize} company until volatility subsides. Consider shorter vendor quote windows and scenario plans for ${exposure.primaryCostChannels[0]}.`;
    case "TREND_REVERSAL":
      return `A trend reversal may reset supplier negotiations — useful if ${company.companyName} has renewals coming up and ${company.fuelContractType.toLowerCase()}.`;
    default:
      return `Review how this signal flows into ${exposure.primaryCostChannels[0]} for ${company.companyName}.`;
  }
}

function buildCostExposure(
  company: OnboardingData,
  exposure: ExposureProfile,
  price: number,
): string {
  return `${company.companyName} reports ${company.monthlyEnergySpend.toLowerCase()} in monthly energy/fuel spend, representing ${company.energyCostShare.toLowerCase()}. At current WTI of $${price.toFixed(2)}/bbl, petroleum-linked costs flow into your business through ${exposure.primaryCostChannels.join(", ")}. Your ${company.geographicFocus.toLowerCase()} footprint means local diesel and freight spreads may diverge slightly from WTI, but directionally they track crude. Contract posture (${company.fuelContractType.toLowerCase()}) ${exposure.contractProtection >= 2 ? "provides some buffer" : "leaves you fully exposed to spot moves"}.`;
}

function buildMarginImpact(
  company: OnboardingData,
  exposure: ExposureProfile,
  riskLevel: RiskLevel,
): string {
  const absorption =
    exposure.passThroughAbility === 0
      ? "Because your pricing is largely fixed, margin compression is likely when energy rises."
      : exposure.passThroughAbility === 2
        ? "You can recover some costs over time, but expect a 2–6 week lag that squeezes cash flow."
        : "Your ability to pass costs through limits margin damage, though customer pushback may cap how much you recover.";

  return `For a ${company.companySize} ${company.industry.toLowerCase()} business, ${riskLevel.toLowerCase()} oil risk typically translates to ${riskLevel === "High" ? "3–8%" : riskLevel === "Medium" ? "1–4%" : "under 2%"} potential margin pressure over the next month if crude moves against you — scaled by your energy share and industry sensitivity. ${absorption}`;
}

function buildOperationalImplications(
  company: OnboardingData,
  exposure: ExposureProfile,
  market: MarketSnapshot,
): string[] {
  const items: string[] = [
    `Procurement: validate whether vendors for ${exposure.primaryCostChannels[0]} have issued surcharge notices tied to $${market.price.toFixed(2)} WTI.`,
    `Finance: stress-test monthly cash flow assuming a ${market.features.momentum7d >= 0 ? "+5%" : "-5%"} move in energy line items (${company.monthlyEnergySpend.toLowerCase()} baseline).`,
  ];

  if (company.industry === "Transportation") {
    items.push(
      "Operations: review fuel card averages vs. rack diesel; adjust route planning and idle-time policies if costs are rising.",
    );
  } else if (company.industry === "Construction") {
    items.push(
      "Project management: flag active bids and fixed-price jobs where diesel and asphalt inputs were not escalated.",
    );
  } else if (company.industry === "Manufacturing") {
    items.push(
      "Production: check resin, lubricant, and packaging supplier contracts for crude-linked escalation clauses.",
    );
  } else {
    items.push(
      `Operations: align department heads on whether ${exposure.primaryCostChannels[1]} requires near-term budget adjustments.`,
    );
  }

  if (exposure.contractProtection < 2 && market.trend.label !== "downward_pressure") {
    items.push(
      "Risk: with limited hedging, prioritize locking quotes on high-volume fuel or freight purchases before suppliers widen spreads.",
    );
  }

  if (company.businessDescription.trim()) {
    items.push(
      `Context: given your focus on "${company.businessDescription.trim()}", monitor the specific vendors and routes named in your operations plan for early surcharge signals.`,
    );
  }

  return items;
}

function buildRecommendedActions(
  company: OnboardingData,
  exposure: ExposureProfile,
  riskLevel: RiskLevel,
  market: MarketSnapshot,
): string[] {
  const actions: string[] = [];

  if (riskLevel === "High") {
    actions.push(
      "Request written fuel/freight surcharge schedules from top 3 vendors within 5 business days.",
    );
    if (exposure.contractProtection < 2) {
      actions.push(
        "Evaluate short-term hedging or fixed-price fuel contracts for the next 30–90 days.",
      );
    }
    if (exposure.passThroughAbility < 2) {
      actions.push(
        "Model a price increase scenario for customers and identify minimum viable surcharge percentage.",
      );
    }
  } else if (riskLevel === "Medium") {
    actions.push(
      "Set a weekly crude price review with procurement to catch supplier letters early.",
    );
    actions.push(
      "Compare your energy spend run-rate against budget; adjust Q forecasts by 2–3% if momentum continues.",
    );
  } else {
    actions.push(
      "Maintain current contracts but document baseline fuel/freight rates for future negotiations.",
    );
  }

  if (market.features.volatility > 2) {
    actions.push(
      "Widen scenario planning bands — use high/low crude cases instead of a single forecast.",
    );
  }

  if (company.geographicFocus === "Global operations") {
    actions.push(
      "Track regional spreads (Brent vs. WTI, local diesel) — global ops rarely move uniformly with WTI alone.",
    );
  }

  return actions.slice(0, 5);
}

function buildWatchItems(market: MarketSnapshot): string[] {
  const items = [
    `7-day moving average vs. 30-day ($${market.features.ma7.toFixed(2)} vs. $${market.features.ma30.toFixed(2)})`,
    `Weekly momentum at ${market.features.momentum7d >= 0 ? "+" : ""}${market.features.momentum7d.toFixed(2)}%`,
    `Volatility at ${market.features.volatility.toFixed(2)}% (elevated above 2.5% is a stress signal)`,
  ];
  if (market.alerts.length > 0) {
    items.push(...market.alerts.map((a) => a.message));
  }
  return items;
}

function buildExecutiveSummary(
  company: OnboardingData,
  riskLevel: RiskLevel,
  market: MarketSnapshot,
): string {
  const direction =
    market.trend.label === "upward_pressure" || market.trend.label === "unstable"
      ? "rising"
      : market.trend.label === "downward_pressure"
        ? "easing"
        : "stable";

  return `${company.companyName} faces ${riskLevel.toLowerCase()} near-term commodity risk as WTI trades at $${market.price.toFixed(2)}/bbl (${market.dailyChangePct >= 0 ? "+" : ""}${market.dailyChangePct.toFixed(2)}% today) with ${direction} pressure on petroleum-linked costs. As a ${company.companySize} ${company.industry.toLowerCase()} operator in ${company.geographicFocus.toLowerCase()}, your exposure is shaped by ${company.energyCostShare.toLowerCase()}, ${company.fuelContractType.toLowerCase()}, and the fact that you ${company.pricingFlexibility.toLowerCase()}.`;
}

export function computeCompanyRiskReport(
  company: OnboardingData,
  market: MarketSnapshot,
): RiskReport {
  const baseImpact = computeTruckingImpact(
    market.price,
    market.dailyChangePct,
    market.features,
    market.trend,
  );

  const exposure = buildExposureProfile(company);

  let score = 0;
  if (baseImpact.riskLevel === "High") score += 3;
  else if (baseImpact.riskLevel === "Medium") score += 2;
  else score += 1;

  score += exposure.energyWeight - 1;
  score += exposure.spendWeight > 2 ? 1 : 0;
  score -= Math.min(exposure.passThroughAbility, 2);
  score -= Math.min(exposure.contractProtection, 2);
  score += exposure.industryFuelSensitivity > 3 ? 1 : 0;

  if (market.features.volatility > 2.5) score += 1;

  const riskLevel = scoreToRiskLevel(Math.round(score * exposure.sizeMultiplier));
  const riskFactorBreakdown = buildRiskFactorDetails(company, market, exposure);

  const suggestedActions = buildRecommendedActions(
    company,
    exposure,
    riskLevel,
    market,
  );

  return {
    riskLevel,
    summary: buildExecutiveSummary(company, riskLevel, market),
    explanation: buildCostExposure(company, exposure, market.price),
    suggestedAction: suggestedActions[0] ?? baseImpact.suggestedAction,
    factors: baseImpact.factors,
    executiveSummary: buildExecutiveSummary(company, riskLevel, market),
    costExposure: buildCostExposure(company, exposure, market.price),
    marginImpact: buildMarginImpact(company, exposure, riskLevel),
    operationalImplications: buildOperationalImplications(
      company,
      exposure,
      market,
    ),
    riskFactorBreakdown,
    recommendedActions: suggestedActions,
    watchItems: buildWatchItems(market),
    timeframe: "1–4 week outlook",
  };
}

export function computeGenericRiskReport(
  market: MarketSnapshot,
): RiskReport {
  const base = computeTruckingImpact(
    market.price,
    market.dailyChangePct,
    market.features,
    market.trend,
  );

  return {
    ...base,
    summary: base.explanation,
    executiveSummary: base.explanation,
    costExposure:
      "Complete your company profile on the home page to see personalized cost exposure analysis.",
    marginImpact:
      "Add your energy spend, pricing flexibility, and contract details to model margin impact for your business.",
    operationalImplications: base.factors.map(
      (f) => `Market signal: ${f}`,
    ),
    riskFactorBreakdown: base.factors.map((factor) => ({
      driver: factor,
      marketContext: factor,
      companyImpact:
        "Provide company details in onboarding to see how this driver affects your operations.",
      severity: "medium" as const,
      timeframe: "1–2 weeks",
    })),
    recommendedActions: [base.suggestedAction],
    watchItems: market.alerts.map((a) => a.message),
    timeframe: "1–2 weeks",
  };
}
