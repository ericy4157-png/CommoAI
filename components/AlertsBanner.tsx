"use client";

import type { Alert } from "@/lib/types";
import { useState } from "react";

interface AlertsBannerProps {
  alerts: Alert[];
}

const SEVERITY_STYLES = {
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  critical: "border-red-500/40 bg-red-500/10 text-red-200",
};

export function AlertsBanner({ alerts }: AlertsBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = alerts.filter((a) => !dismissed.has(a.type));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((alert) => (
        <div
          key={alert.type}
          className={`flex items-start justify-between gap-4 rounded-lg border px-4 py-3 text-sm ${SEVERITY_STYLES[alert.severity]}`}
        >
          <div>
            <span className="font-semibold uppercase tracking-wide text-xs opacity-80">
              {alert.type.replace("_", " ")}
            </span>
            <p className="mt-1">{alert.message}</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setDismissed((prev) => new Set([...prev, alert.type]))
            }
            className="shrink-0 text-xs opacity-60 hover:opacity-100"
            aria-label="Dismiss alert"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
