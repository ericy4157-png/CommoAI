import Link from "next/link";
import { Home } from "lucide-react";

export function HomeButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white"
    >
      <Home className="h-4 w-4" />
      Home
    </Link>
  );
}
