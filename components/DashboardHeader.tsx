"use client";

import { useEffect, useState } from "react";
import { HomeButton } from "@/components/HomeButton";
import { getOnboarding } from "@/lib/onboarding";

export function DashboardHeader() {
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    const data = getOnboarding();
    if (data?.companyName) {
      setCompanyName(data.companyName);
    }
  }, []);

  return (
    <div className="mb-8 flex items-start justify-between gap-4 border-b border-slate-800 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Commo AI</h1>
        <p className="mt-1 text-sm text-slate-400">
          {companyName
            ? `Commodity insights for ${companyName}`
            : "WTI crude oil insights for your business"}
        </p>
      </div>
      <HomeButton />
    </div>
  );
}
