import OpenAI from "openai";
import {
  computeCompanyRiskReport,
  computeGenericRiskReport,
} from "./company-risk";
import type { OnboardingData } from "./onboarding";
import { heuristicAnalyzeFallback } from "./trucking-impact";
import type { AnalyzeRequest, AnalyzeResponse, RiskReport } from "./types";

const MODEL = "gpt-4o-mini";
const MAX_RETRIES = 2;

function getClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function buildPrompt(input: AnalyzeRequest): string {
  return JSON.stringify(
    {
      oilPrice: input.price,
      dailyChangePct: input.dailyChangePct,
      movingAverage7d: input.features.ma7,
      movingAverage30d: input.features.ma30,
      volatility: input.features.volatility,
      momentum7d: input.features.momentum7d,
      trendSignal: input.trend.displayLabel,
      trendFactors: input.trend.factors,
      activeAlerts: input.alerts.map((a) => a.message),
      companyProfile: input.company ?? null,
    },
    null,
    2,
  );
}

const SYSTEM_PROMPT = `You are a senior commodity risk analyst writing personalized risk reports for small and medium businesses.

Given structured oil market data and optional company profile, return ONLY valid JSON with this exact shape:
{
  "explanation": "2-3 sentences on why price may be moving and short-term outlook",
  "shortTermDirection": "up" | "down" | "stable",
  "truckingImpact": {
    "riskLevel": "Low" | "Medium" | "High",
    "summary": "One sentence headline risk assessment for this specific company",
    "explanation": "2-3 sentences on primary cost exposure for THIS company",
    "suggestedAction": "Single highest-priority action",
    "factors": ["short bullet", "short bullet"],
    "executiveSummary": "3-4 sentence executive summary naming the company and tying market to their industry",
    "costExposure": "Detailed paragraph on how WTI affects their specific cost structure (fuel spend, energy share, contracts)",
    "marginImpact": "Detailed paragraph on margin/cash-flow impact given their pricing flexibility and size",
    "operationalImplications": ["specific implication 1", "specific implication 2", "specific implication 3"],
    "riskFactorBreakdown": [
      {
        "driver": "name of risk driver",
        "marketContext": "what is happening in the market",
        "companyImpact": "what it means for THIS company specifically",
        "severity": "low" | "medium" | "high",
        "timeframe": "e.g. 1-2 weeks"
      }
    ],
    "recommendedActions": ["prioritized action 1", "action 2", "action 3"],
    "watchItems": ["metric or event to monitor"],
    "timeframe": "e.g. 1-4 week outlook"
  }
}

When company profile is provided, every section must reference their industry, size, energy spend, contracts, and pricing flexibility. Be specific and practical — write like a consultant's briefing, not generic market commentary. No markdown.`;

async function callWithRetry(
  client: OpenAI,
  userPrompt: string,
): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        max_tokens: 1800,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });
      return (response.choices[0]?.message?.content ?? "").trim();
    } catch (err) {
      lastError = err;
      const status = (err as { status?: number }).status;
      if (attempt < MAX_RETRIES && (status === 429 || (status && status >= 500))) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function isRiskLevel(value: string): value is RiskReport["riskLevel"] {
  return value === "High" || value === "Medium" || value === "Low";
}

function isSeverity(
  value: string,
): value is RiskReport["riskFactorBreakdown"][number]["severity"] {
  return value === "low" || value === "medium" || value === "high";
}

function parseResponse(raw: string): AnalyzeResponse | null {
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned) as {
      explanation?: string;
      shortTermDirection?: string;
      truckingImpact?: Partial<RiskReport>;
    };

    const impact = parsed.truckingImpact;
    if (!parsed.explanation || !impact?.riskLevel || !isRiskLevel(impact.riskLevel)) {
      return null;
    }

    const dir = parsed.shortTermDirection;
    const shortTermDirection =
      dir === "up" || dir === "down" || dir === "stable" ? dir : "stable";

    const riskFactorBreakdown = (impact.riskFactorBreakdown ?? []).map((item) => ({
      driver: item.driver ?? "Market driver",
      marketContext: item.marketContext ?? "",
      companyImpact: item.companyImpact ?? "",
      severity: item.severity && isSeverity(item.severity) ? item.severity : "medium",
      timeframe: item.timeframe ?? "1–2 weeks",
    }));

    const report: RiskReport = {
      riskLevel: impact.riskLevel,
      summary: impact.summary ?? impact.explanation ?? "",
      explanation: impact.explanation ?? "",
      suggestedAction: impact.suggestedAction ?? "",
      factors: impact.factors ?? [],
      executiveSummary: impact.executiveSummary ?? impact.summary ?? "",
      costExposure: impact.costExposure ?? "",
      marginImpact: impact.marginImpact ?? "",
      operationalImplications: impact.operationalImplications ?? [],
      riskFactorBreakdown,
      recommendedActions: impact.recommendedActions ?? [],
      watchItems: impact.watchItems ?? [],
      timeframe: impact.timeframe ?? "1–4 weeks",
    };

    return {
      explanation: parsed.explanation,
      shortTermDirection,
      truckingImpact: report,
      source: "llm",
    };
  } catch {
    return null;
  }
}

function buildHeuristicResponse(input: AnalyzeRequest): AnalyzeResponse {
  const market = {
    price: input.price,
    dailyChangePct: input.dailyChangePct,
    features: input.features,
    trend: input.trend,
    alerts: input.alerts,
  };

  const report = input.company
    ? computeCompanyRiskReport(input.company as OnboardingData, market)
    : computeGenericRiskReport(market);

  const fallback = heuristicAnalyzeFallback(
    input.price,
    input.dailyChangePct,
    input.features,
    input.trend,
  );

  return {
    explanation: input.company
      ? `${fallback.explanation} This outlook is personalized for ${input.company.companyName} (${input.company.industry}).`
      : fallback.explanation,
    shortTermDirection: fallback.shortTermDirection,
    truckingImpact: report,
    source: "heuristic",
  };
}

export async function analyzeOilMarket(
  input: AnalyzeRequest,
): Promise<AnalyzeResponse> {
  const fallback = buildHeuristicResponse(input);

  const client = getClient();
  if (!client) {
    return fallback;
  }

  try {
    const userPrompt = `Analyze this WTI crude oil market snapshot:\n\n${buildPrompt(input)}`;
    const raw = await callWithRetry(client, userPrompt);
    const parsed = parseResponse(raw);
    if (parsed) return parsed;
  } catch {
    // fall through to heuristic
  }

  return fallback;
}
