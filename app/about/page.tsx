import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";

export const metadata: Metadata = {
  title: "About — Commo-AI",
  description:
    "Learn how Commo-AI helps SMEs anticipate commodity market impacts on operating costs.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <main className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            The Product
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            What is Commo-AI?
          </h1>

          <div className="mt-10 space-y-6 text-lg leading-relaxed text-slate-400">
            <p>
              Commo-AI is an advanced commodity risk platform that helps
              small-medium enterprises anticipate how changes in global
              commodity markets will affect their operating costs.
            </p>
            <p>
              Instead of requiring businesses to interpret market data
              themselves, Commo-AI translates signals such as commodity price
              movements, geopolitical events, weather disruptions, and supply
              chain issues into signals that are specific to their industry.
            </p>
            <p>
              The early warnings and insights allow businesses to make more
              informed purchasing, pricing, and overall decisions before
              supplier costs increase. This helps businesses reduce uncertainty
              when buying, which naturally protects profit margins. This also
              replaces reactive decision making with predictive decision making.
            </p>
          </div>

          <section className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/50 p-8 sm:p-10">
            <h2 className="text-2xl font-semibold text-white">
              What differentiates us from other tools
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-slate-400">
              <p>
                Our platform stands out because it doesn&apos;t just explain
                what is happening—it predicts what is likely to happen next and
                tells businesses what they should do before a problem occurs.
              </p>
              <p>
                While most analytics tools and AI assistants like ChatGPT are
                reactive, meaning they answer questions after a user asks them,
                our platform is proactive. It continuously monitors commodity
                markets, company data, and relevant news to identify risks and
                opportunities in advance, providing forecasts, alerts, and
                recommended actions tailored to the business.
              </p>
              <p>
                Instead of making users figure out what questions to ask, the
                platform delivers timely insights automatically, helping
                companies make faster, more informed decisions before market
                changes affect their operations.
              </p>
            </div>
          </section>

          <div className="mt-12">
            <Link
              href="/#onboarding"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-8 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.02] hover:bg-[#1d4ed8] active:scale-[0.98]"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
