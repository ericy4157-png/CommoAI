"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Fuel } from "lucide-react";
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
  ENERGY_COST_SHARE_OPTIONS,
  FUEL_CONTRACT_OPTIONS,
  GEOGRAPHIC_FOCUS_OPTIONS,
  INDUSTRY_OPTIONS,
  MONTHLY_ENERGY_SPEND_OPTIONS,
  PRICING_FLEXIBILITY_OPTIONS,
  isOnboardingValid,
  saveOnboarding,
  type OnboardingData,
} from "@/lib/onboarding";

const STEPS = [
  { id: 1, title: "Company basics" },
  { id: 2, title: "Cost exposure" },
  { id: 3, title: "Commodity" },
] as const;

export function OnboardingCard() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [monthlyEnergySpend, setMonthlyEnergySpend] = useState("");
  const [energyCostShare, setEnergyCostShare] = useState("");
  const [pricingFlexibility, setPricingFlexibility] = useState("");
  const [fuelContractType, setFuelContractType] = useState("");
  const [geographicFocus, setGeographicFocus] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [commodity, setCommodity] = useState("");

  const formData: Partial<OnboardingData> = {
    companyName,
    industry,
    companySize,
    monthlyEnergySpend,
    energyCostShare,
    pricingFlexibility,
    fuelContractType,
    geographicFocus,
    businessDescription,
    commodity: commodity === "oil" ? "oil" : undefined,
  };

  const step1Valid = Boolean(
    companyName.trim() && industry && companySize,
  );
  const step2Valid = Boolean(
    monthlyEnergySpend &&
      energyCostShare &&
      pricingFlexibility &&
      fuelContractType &&
      geographicFocus,
  );
  const canContinue = isOnboardingValid(formData);
  const companyLabel = companyName.trim() || "your company";

  const handleContinue = () => {
    if (!canContinue) return;
    saveOnboarding({
      companyName: companyName.trim(),
      industry,
      companySize,
      monthlyEnergySpend,
      energyCostShare,
      pricingFlexibility,
      fuelContractType,
      geographicFocus,
      businessDescription: businessDescription.trim(),
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
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {STEPS[step - 1].title}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Step {step} of {STEPS.length} — we use this to build your risk
            report.
          </p>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-2 w-8 rounded-full transition-colors ${
                s.id <= step ? "bg-blue-500" : "bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-slate-300">
                Company Name
              </Label>
              <Input
                id="companyName"
                placeholder="Acme Construction"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-11 rounded-xl border-slate-700 bg-slate-800/50 px-4 text-base text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Industry</Label>
              <Select value={industry} onValueChange={(v) => setIndustry(v ?? "")}>
                <SelectTrigger className="h-11 w-full rounded-xl border-slate-700 bg-slate-800/50">
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
                <SelectTrigger className="h-11 w-full rounded-xl border-slate-700 bg-slate-800/50">
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

            <div className="space-y-2">
              <Label htmlFor="businessDescription" className="text-slate-300">
                What does your company do? (optional)
              </Label>
              <textarea
                id="businessDescription"
                rows={3}
                placeholder="e.g. Regional LTL trucking across the Midwest, mostly food distributors"
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-6"
          >
            <p className="text-sm leading-relaxed text-slate-400">
              These details determine how oil price moves flow into your costs,
              margins, and cash flow.
            </p>

            <div className="space-y-2">
              <Label className="text-slate-300">
                Monthly fuel / energy spend
              </Label>
              <Select
                value={monthlyEnergySpend}
                onValueChange={(v) => setMonthlyEnergySpend(v ?? "")}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-slate-700 bg-slate-800/50">
                  <SelectValue placeholder="Select monthly spend range" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHLY_ENERGY_SPEND_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">
                Energy as share of operating costs
              </Label>
              <Select
                value={energyCostShare}
                onValueChange={(v) => setEnergyCostShare(v ?? "")}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-slate-700 bg-slate-800/50">
                  <SelectValue placeholder="Select cost share" />
                </SelectTrigger>
                <SelectContent>
                  {ENERGY_COST_SHARE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">
                Can you pass fuel/energy costs to customers?
              </Label>
              <Select
                value={pricingFlexibility}
                onValueChange={(v) => setPricingFlexibility(v ?? "")}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-slate-700 bg-slate-800/50">
                  <SelectValue placeholder="Select pricing flexibility" />
                </SelectTrigger>
                <SelectContent>
                  {PRICING_FLEXIBILITY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Fuel / energy contract type</Label>
              <Select
                value={fuelContractType}
                onValueChange={(v) => setFuelContractType(v ?? "")}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-slate-700 bg-slate-800/50">
                  <SelectValue placeholder="Select contract posture" />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_CONTRACT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Geographic focus</Label>
              <Select
                value={geographicFocus}
                onValueChange={(v) => setGeographicFocus(v ?? "")}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-slate-700 bg-slate-800/50">
                  <SelectValue placeholder="Select operating region" />
                </SelectTrigger>
                <SelectContent>
                  {GEOGRAPHIC_FOCUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-6"
          >
            <p className="text-sm text-slate-400">
              Which commodity has the biggest impact on your business?
            </p>

            <Select value={commodity} onValueChange={(v) => setCommodity(v ?? "")}>
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-700 bg-slate-800/50">
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

            <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                <Fuel className="h-4 w-4" />
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                We&apos;ll generate a detailed risk report explaining how current
                oil market conditions affect {companyLabel}&apos;s costs,
                margins, and recommended actions.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            className="h-12 flex-1 rounded-xl border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}

        {step < 3 ? (
          <Button
            type="button"
            disabled={step === 1 ? !step1Valid : !step2Valid}
            onClick={() => setStep((s) => s + 1)}
            className="h-12 flex-1 rounded-xl bg-[#2563EB] text-base font-semibold text-white hover:bg-[#1d4ed8]"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            className="h-12 flex-1 rounded-xl bg-[#2563EB] text-base font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50"
          >
            View Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
