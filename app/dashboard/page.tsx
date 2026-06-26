import { Dashboard } from "@/components/Dashboard";
import { DashboardHeader } from "@/components/DashboardHeader";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0f1117]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardHeader />
        <Dashboard />
      </div>
    </div>
  );
}
