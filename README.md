# Commo AI — Oil Price Dashboard

A simple web dashboard that tracks WTI crude oil prices, shows trends and charts, generates AI explanations of price movement, and provides trucking-focused business impact insights.

## Features

- **Live WTI price** from Yahoo Finance (`CL=F`)
- **30/60/90-day charts** via Recharts
- **Trend engine** — heuristic bullish/bearish/stable/unstable signals
- **AI explanations** — OpenAI GPT-4o-mini (with heuristic fallback)
- **Trucking impact** — risk level and suggested actions
- **Rule-based alerts** — price shocks, volatility spikes, trend reversals
- **Global risk news** — market shocks, supply chain, geopolitics, and natural disasters

## Tech Stack

- Next.js 16 (App Router)
- TypeScript + Tailwind CSS
- Recharts
- yahoo-finance2
- OpenAI API

## Getting Started

```bash
npm install
cp .env.example .env.local
# Add your OPENAI_API_KEY to .env.local (optional)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/prices` | GET | Oil price, history, features, trend, alerts |
| `/api/analyze` | POST | AI explanation + trucking impact |
| `/api/news` | GET | Market risk news headlines |

## Deploy (Vercel)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set `OPENAI_API_KEY` in environment variables
4. Deploy

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | Enables GPT-4o-mini explanations; without it, heuristic fallback is used |
| `CURRENTS_API_KEY` | No | Enables multi-source news on `/news`; without it, BBC/NPR RSS fallback is used |
