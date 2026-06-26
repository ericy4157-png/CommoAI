export const ONBOARDING_STORAGE_KEY = "commo-onboarding";

export interface OnboardingData {
  companyName: string;
  industry: string;
  companySize: string;
  commodity: "oil";
}

export const INDUSTRY_OPTIONS = [
  "Construction",
  "Transportation",
  "Manufacturing",
  "Agriculture",
  "Restaurant",
  "Retail",
  "Other",
] as const;

export const COMPANY_SIZE_OPTIONS = [
  "1–10 employees",
  "11–50",
  "51–250",
  "250+",
] as const;

export const COMMODITY_OPTIONS = [
  { value: "oil", label: "WTI Crude Oil", enabled: true },
  { value: "steel", label: "Steel (Coming Soon)", enabled: false },
  { value: "lumber", label: "Lumber (Coming Soon)", enabled: false },
  { value: "natural-gas", label: "Natural Gas (Coming Soon)", enabled: false },
  { value: "copper", label: "Copper (Coming Soon)", enabled: false },
  { value: "wheat", label: "Wheat (Coming Soon)", enabled: false },
] as const;

export function isOnboardingValid(
  data: Partial<OnboardingData>,
): boolean {
  return Boolean(
    data.companyName?.trim() && data.industry && data.commodity,
  );
}

export function saveOnboarding(data: OnboardingData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
}

export function getOnboarding(): OnboardingData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingData;
  } catch {
    return null;
  }
}
