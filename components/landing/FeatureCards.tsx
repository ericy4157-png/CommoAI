"use client";

import { motion } from "framer-motion";
import { BellRing, Bot, TrendingUp } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Live Commodity Prices",
    description: "Track real-time oil prices and historical trends.",
  },
  {
    icon: Bot,
    title: "AI Market Analysis",
    description: "Receive simple explanations of market movements.",
  },
  {
    icon: BellRing,
    title: "Early Risk Alerts",
    description: "Know when price changes could impact your business.",
  },
];

export function FeatureCards() {
  return (
    <div className="mx-auto mb-10 grid max-w-4xl gap-4 sm:grid-cols-3">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 * index }}
          className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
            <feature.icon className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            {feature.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
            {feature.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
