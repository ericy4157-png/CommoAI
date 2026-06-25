import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f1117]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-800 pb-6">
          <h1 className="text-2xl font-bold text-white">Commo AI</h1>
          <p className="mt-1 text-sm text-slate-400">
            WTI crude oil insights for trucking operators
          </p>
        </div>
        <Dashboard />
      </div>
    </div>
  );
}
