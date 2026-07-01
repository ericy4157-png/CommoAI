export const ONBOARDING_STORAGE_KEY = "commo-onboarding";

export interface OnboardingData {
  companyName: string;
  industry: string;
  companySize: string;
  commodity: "oil";
  monthlyEnergySpend: string;
  energyCostShare: string;
  pricingFlexibility: string;
  fuelContractType: string;
  geographicFocus: string;
  businessDescription: string;
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

export const MONTHLY_ENERGY_SPEND_OPTIONS = [
  "Under $2,500",
  "$2,500 – $10,000",
  "$10,000 – $50,000",
  "Over $50,000",
] as const;

export const ENERGY_COST_SHARE_OPTIONS = [
  "Under 10% of operating costs",
  "10% – 25% of operating costs",
  "25% – 40% of operating costs",
  "Over 40% of operating costs",
] as const;

export const PRICING_FLEXIBILITY_OPTIONS = [
  "We can pass most fuel/energy costs to customers",
  "We can pass some costs with a lag",
  "Our prices are mostly fixed — we absorb cost swings",
] as const;

export const FUEL_CONTRACT_OPTIONS = [
  "Spot market — no fuel/energy contracts",
  "Partial hedging or short-term contracts",
  "Locked in with longer-term contracts",
] as const;

export const GEOGRAPHIC_FOCUS_OPTIONS = [
  "United States",
  "North America",
  "Global operations",
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
    data.companyName?.trim() &&
      data.industry &&
      data.companySize &&
      data.monthlyEnergySpend &&
      data.energyCostShare &&
      data.pricingFlexibility &&
      data.fuelContractType &&
      data.geographicFocus &&
      data.commodity,
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
    const parsed = JSON.parse(raw) as Partial<OnboardingData>;
    if (!isOnboardingValid(parsed)) return null;
    return parsed as OnboardingData;
  } catch {
    return null;
  }
}
