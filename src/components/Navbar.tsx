"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { brand } from "@/config/brand";

const navLinks = [
  { href: "/#workforce", label: "Workforce" },
  { href: "/#architecture", label: "Architecture" },
  { href: "/#benchmarks", label: "Benchmarks" },
  { href: "/demo", label: "Sandbox" },
  { href: "/docs", label: "Docs & MCP" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#fbfbfd]/80 backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto flex h-13 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1d1d1f] text-white transition-transform duration-300 group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 4L4.5 19h3.8l1.6-3.4h4.2L15.7 19h3.8L12 4z" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
            {brand.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((item) => {
            const active =
              item.href !== "/" &&
              !item.href.startsWith("/#") &&
              pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-medium tracking-tight transition-colors ${
                  active
                    ? "text-[#1d1d1f]"
                    : "text-[#6e6e73] hover:text-[#1d1d1f]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/contact"
            className="text-xs font-medium text-[#0071e3] transition-opacity hover:opacity-80"
          >
            Book an Audit
          </Link>
          <Link
            href="/demo"
            className="rounded-full bg-[#1d1d1f] px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-black/80"
          >
            Live Sandbox
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-lg p-1.5 text-[#1d1d1f] md:hidden"
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="animate-step-in border-t border-black/[0.06] bg-[#fbfbfd]/95 px-4 py-4 backdrop-blur-2xl md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#1d1d1f] hover:bg-black/[0.04]"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-black/[0.06] pt-3">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="rounded-full border border-black/15 px-4 py-2 text-center text-sm font-medium text-[#1d1d1f]"
              >
                Book an Audit
              </Link>
              <Link
                href="/demo"
                onClick={() => setOpen(false)}
                className="rounded-full bg-[#1d1d1f] px-4 py-2 text-center text-sm font-medium text-white"
              >
                Live Sandbox
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
