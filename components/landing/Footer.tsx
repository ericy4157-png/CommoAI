import Link from "next/link";

export function Footer() {
  return (
    <footer
      id="contact"
      className="mt-20 border-t border-slate-800 bg-[#0f1117] px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="font-semibold text-white">Commo-AI</p>
          <p className="mt-1 text-sm text-slate-400">
            AI-powered commodity risk intelligence for business owners.
          </p>
          <p className="mt-4 text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Commo-AI. All rights reserved.
          </p>
        </div>
        <nav
          id="about"
          className="flex gap-6 text-sm font-medium text-slate-400"
        >
          <Link href="#about" className="transition-colors hover:text-white">
            About
          </Link>
          <Link href="#contact" className="transition-colors hover:text-white">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
