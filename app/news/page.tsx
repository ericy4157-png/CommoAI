import type { Metadata } from "next";
import { AlertCircle, Newspaper } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { NewsFeed } from "@/components/news/NewsFeed";
import { getMarketNews } from "@/lib/news";

export const metadata: Metadata = {
  title: "News — Commo-AI",
  description:
    "Recent headlines on market shocks, supply chain disruptions, geopolitical conflict, and natural disasters affecting commodity markets.",
};

export const revalidate = 1800;
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const data = await getMarketNews();
  const usingRss = data.source === "rss";

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <main className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15">
              <Newspaper className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                Market Intelligence
              </p>
              <h1 className="mt-1 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Global Risk News
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
                Real headlines on market shocks, supply chain disruptions, wars,
                and natural disasters that can move commodity prices and
                operating costs.
              </p>
            </div>
          </div>

          {data.articles.length === 0 ? (
            <div className="mt-8 flex gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                Unable to load headlines right now. Add a{" "}
                <code className="text-red-100">CURRENTS_API_KEY</code> to{" "}
                <code className="text-red-100">.env.local</code> (free at{" "}
                <a
                  href="https://currentsapi.services/en/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-2 hover:text-white"
                >
                  currentsapi.services
                </a>
                ) and refresh, or try again later.
              </p>
            </div>
          ) : usingRss ? (
            <div className="mt-8 flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                Showing filtered headlines from BBC and NPR RSS feeds. Add a
                free{" "}
                <a
                  href="https://currentsapi.services/en/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-2 hover:text-white"
                >
                  Currents API
                </a>{" "}
                key as <code className="text-amber-100">CURRENTS_API_KEY</code>{" "}
                in <code className="text-amber-100">.env.local</code> for broader
                multi-source coverage (~600 requests/day free).
              </p>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">
              Updated {new Date(data.fetchedAt).toLocaleString()} · Sources via
              Currents API
            </p>
          )}

          <div className="mt-10">
            <NewsFeed data={data} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
