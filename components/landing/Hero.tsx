"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Hero() {
  const scrollToOnboarding = () => {
    document.getElementById("onboarding")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-950/30 to-[#0f1117]" />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#2563EB"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <motion.div
        className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-16 top-40 h-64 w-64 rounded-full bg-emerald-600/10 blur-3xl"
        animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-10 left-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400"
        >
          AI Commodity Risk Intelligence
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl font-bold tracking-tight text-white sm:text-5xl"
        >
          Know your costs before they change.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400"
        >
          Monitor commodity markets with AI-powered forecasts and understand how
          price changes impact your business before they affect your bottom line.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10"
        >
          <Button
            onClick={scrollToOnboarding}
            size="lg"
            className="h-12 rounded-xl bg-[#2563EB] px-8 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.02] hover:bg-[#1d4ed8] active:scale-[0.98]"
          >
            Get Started
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
