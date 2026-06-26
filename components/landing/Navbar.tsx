import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0f1117]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB]">
            <div className="h-3 w-3 rounded-full bg-white/90" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Commo-AI
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-400">
          <Link href="#about" className="transition-colors hover:text-white">
            About
          </Link>
          <Link href="#contact" className="transition-colors hover:text-white">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
