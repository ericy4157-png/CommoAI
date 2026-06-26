"use client";

import { motion } from "framer-motion";
import { ArrowRight, Fuel } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COMMODITY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  INDUSTRY_OPTIONS,
  isOnboardingValid,
  saveOnboarding,
  type OnboardingData,
} from "@/lib/onboarding";

export function OnboardingCard() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [commodity, setCommodity] = useState("");

  const formData: Partial<OnboardingData> = {
    companyName,
    industry,
    companySize,
    commodity: commodity === "oil" ? "oil" : undefined,
  };

  const canContinue = isOnboardingValid(formData);

  const handleContinue = () => {
    if (!canContinue) return;
    saveOnboarding({
      companyName: companyName.trim(),
      industry,
      companySize,
      commodity: "oil",
    });
    router.push("/dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mx-auto w-full max-w-[700px] rounded-3xl border border-slate-800 bg-slate-900/80 p-10 shadow-xl shadow-black/40"
    >
      <h2 className="text-xl font-semibold text-white">Business Information</h2>
      <p className="mt-1 text-sm text-slate-400">
        Tell us about your company so we can personalize your insights.
      </p>

      <div className="mt-8 space-y-6">
        <motion.div
          className="space-y-2"
          whileFocus={{ scale: 1.005 }}
          transition={{ duration: 0.2 }}
        >
          <Label htmlFor="companyName" className="text-slate-300">
            Company Name
          </Label>
          <Input
            id="companyName"
            placeholder="Acme Construction"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="h-11 rounded-xl border-slate-700 bg-slate-800/50 px-4 text-base text-white transition-all duration-200 focus-visible:ring-[#2563EB]/30"
          />
        </motion.div>

        <div className="space-y-2">
          <Label className="text-slate-300">Industry</Label>
          <Select
            value={industry}
            onValueChange={(v) => setIndustry(v ?? "")}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-slate-700 bg-slate-800/50 px-4 transition-all duration-200">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300">Company Size</Label>
          <Select
            value={companySize}
            onValueChange={(v) => setCompanySize(v ?? "")}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-slate-700 bg-slate-800/50 px-4 transition-all duration-200">
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="my-8 border-t border-slate-800" />

      <h3 className="text-lg font-semibold text-white">Commodity Selection</h3>
      <p className="mt-2 text-sm text-slate-400">
        Which commodity has the biggest impact on your business?
      </p>

      <div className="mt-4 space-y-2">
        <Select
          value={commodity}
          onValueChange={(v) => setCommodity(v ?? "")}
        >
          <SelectTrigger className="h-11 w-full rounded-xl border-slate-700 bg-slate-800/50 px-4 transition-all duration-200">
            <SelectValue placeholder="Select a commodity" />
          </SelectTrigger>
          <SelectContent>
            {COMMODITY_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={!option.enabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
          <Fuel className="h-4 w-4" />
        </div>
        <p className="text-sm leading-relaxed text-slate-400">
          We&apos;ll personalize forecasts and business insights based on this
          commodity.
        </p>
      </div>

      <Button
        onClick={handleContinue}
        disabled={!canContinue}
        className="mt-8 h-12 w-full rounded-xl bg-[#2563EB] text-base font-semibold text-white shadow-md transition-transform hover:scale-[1.02] hover:bg-[#1d4ed8] active:scale-[0.98] disabled:scale-100 disabled:opacity-50"
      >
        Continue
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </motion.div>
  );
}
