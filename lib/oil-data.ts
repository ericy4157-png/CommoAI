import { computeAlerts } from "./alerts";
import { computeTruckingImpact } from "./trucking-impact";
import { computeTrend } from "./trend-engine";
import type { PriceFeatures, PricePoint, PricesResponse } from "./types";

const TICKER = "CL=F";
const HISTORY_DAYS = 90;

function computeFeatures(history: PricePoint[]): PriceFeatures {
  const closes = history.map((p) => p.close);
  const n = closes.length;

  const ma7 =
    n >= 7
      ? closes.slice(-7).reduce((a, b) => a + b, 0) / 7
      : closes.reduce((a, b) => a + b, 0) / n;

  const ma30 =
    n >= 30
      ? closes.slice(-30).reduce((a, b) => a + b, 0) / 30
      : closes.reduce((a, b) => a + b, 0) / n;

  const returns: number[] = [];
  const volWindow = Math.min(30, n - 1);
  for (let i = n - volWindow; i < n; i++) {
    if (i > 0 && closes[i - 1] > 0) {
      returns.push(((closes[i] - closes[i - 1]) / closes[i - 1]) * 100);
    }
  }
  const mean =
    returns.length > 0
      ? returns.reduce((a, b) => a + b, 0) / returns.length
      : 0;
  const variance =
    returns.length > 0
      ? returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length
      : 0;
  const volatility = Math.sqrt(variance);

  let momentum7d = 0;
  if (n >= 8 && closes[n - 8] > 0) {
    momentum7d = ((closes[n - 1] - closes[n - 8]) / closes[n - 8]) * 100;
  }

  return { ma7, ma30, volatility, momentum7d };
}

async function fetchYahooHistory(): Promise<PricePoint[]> {
  const { default: YahooFinance } = await import("yahoo-finance2");
  const yahooFinance = new YahooFinance();

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - HISTORY_DAYS - 10);

  const result = await yahooFinance.chart(TICKER, {
    period1: start,
    period2: end,
    interval: "1d",
  });

  return result.quotes
    .filter((row) => row.close != null)
    .map((row) => ({
      date: row.date.toISOString().split("T")[0],
      close: row.close as number,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getOilPrices(): Promise<PricesResponse> {
  const history = await fetchYahooHistory();

  if (history.length < 2) {
    throw new Error("Insufficient oil price data from Yahoo Finance");
  }

  const latest = history[history.length - 1];
  const previous = history[history.length - 2];
  const dailyChangePct =
    previous.close > 0
      ? ((latest.close - previous.close) / previous.close) * 100
      : 0;

  const features = computeFeatures(history);
  const trend = computeTrend(features, dailyChangePct);
  const alerts = computeAlerts(dailyChangePct, features, history);
  const truckingImpact = computeTruckingImpact(
    latest.close,
    dailyChangePct,
    features,
    trend,
  );

  return {
    price: latest.close,
    dailyChangePct,
    history,
    features,
    trend,
    alerts,
    truckingImpact,
    fetchedAt: new Date().toISOString(),
  };
}
