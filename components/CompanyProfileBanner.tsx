"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function CompanyProfileBanner() {
  return (
    <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <p>
        Complete your company profile to unlock a personalized risk report.{" "}
        <Link
          href="/#onboarding"
          className="font-medium underline underline-offset-2 hover:text-white"
        >
          Add company details
        </Link>
      </p>
    </div>
  );
}
