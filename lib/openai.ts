import OpenAI from "openai";
import { heuristicAnalyzeFallback } from "./trucking-impact";
import type { AnalyzeRequest, AnalyzeResponse } from "./types";

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
    },
    null,
    2,
  );
}

const SYSTEM_PROMPT = `You are a commodity risk analyst focused on trucking industry impacts.

Given structured oil market data, return ONLY valid JSON with this exact shape:
{
  "explanation": "2-3 sentences on why price may be moving and short-term outlook",
  "shortTermDirection": "up" | "down" | "stable",
  "truckingImpact": {
    "riskLevel": "Low" | "Medium" | "High",
    "explanation": "What this means for trucking (diesel, shipping costs, margins)",
    "suggestedAction": "One concrete action for fleet operators"
  }
}

Keep language simple and business-focused. No markdown.`;

async function callWithRetry(
  client: OpenAI,
  userPrompt: string,
): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        max_tokens: 512,
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

function parseResponse(raw: string): AnalyzeResponse | null {
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned) as {
      explanation?: string;
      shortTermDirection?: string;
      truckingImpact?: {
        riskLevel?: string;
        explanation?: string;
        suggestedAction?: string;
      };
    };

    if (!parsed.explanation || !parsed.truckingImpact?.riskLevel) {
      return null;
    }

    const risk = parsed.truckingImpact.riskLevel;
    const riskLevel =
      risk === "High" || risk === "Medium" || risk === "Low" ? risk : "Medium";

    const dir = parsed.shortTermDirection;
    const shortTermDirection =
      dir === "up" || dir === "down" || dir === "stable" ? dir : "stable";

    return {
      explanation: parsed.explanation,
      shortTermDirection,
      truckingImpact: {
        riskLevel,
        explanation: parsed.truckingImpact.explanation ?? "",
        suggestedAction: parsed.truckingImpact.suggestedAction ?? "",
        factors: [],
      },
      source: "llm",
    };
  } catch {
    return null;
  }
}

export async function analyzeOilMarket(
  input: AnalyzeRequest,
): Promise<AnalyzeResponse> {
  const fallback = heuristicAnalyzeFallback(
    input.price,
    input.dailyChangePct,
    input.features,
    input.trend,
  );

  const client = getClient();
  if (!client) {
    return { ...fallback, source: "heuristic" };
  }

  try {
    const userPrompt = `Analyze this WTI crude oil market snapshot:\n\n${buildPrompt(input)}`;
    const raw = await callWithRetry(client, userPrompt);
    const parsed = parseResponse(raw);
    if (parsed) return parsed;
  } catch {
    // fall through to heuristic
  }

  return { ...fallback, source: "heuristic" };
}
