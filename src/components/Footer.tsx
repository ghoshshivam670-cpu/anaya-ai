import Link from "next/link";
import { brand } from "@/config/brand";

export function Footer() {
  return (
    <footer className="border-t border-black/[0.08] bg-[#f5f5f7]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#1d1d1f] text-[11px] font-semibold text-white">
                A
              </span>
              <span className="text-sm font-semibold tracking-tight text-[#1d1d1f]">
                {brand.name}
              </span>
            </div>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-[#6e6e73]">
              {brand.description}
            </p>
            <p className="mt-4 font-mono text-[11px] text-[#86868b]">
              WooCommerce HPOS · Redis Object Cache · Model Context Protocol (MCP)
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold tracking-tight text-[#1d1d1f]">
              Platform
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-[#6e6e73]">
              <li>
                <Link href="/#workforce" className="hover:text-[#1d1d1f]">
                  Revenue, Builder &amp; Analytics AI
                </Link>
              </li>
              <li>
                <Link href="/#architecture" className="hover:text-[#1d1d1f]">
                  Dev, QA &amp; Production
                </Link>
              </li>
              <li>
                <Link href="/#benchmarks" className="hover:text-[#1d1d1f]">
                  16x Spike Benchmarks
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-[#1d1d1f]">
                  Interactive Store Sandbox
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold tracking-tight text-[#1d1d1f]">
              Developers
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-[#6e6e73]">
              <li>
                <Link href="/docs" className="hover:text-[#1d1d1f]">
                  Docs &amp; MCP Playground
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-[#1d1d1f]">
                  WooCommerce REST Connector
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#1d1d1f]">
                  Book an Architecture Audit
                </Link>
              </li>
              <li className="font-mono text-[11px] text-[#86868b]">{brand.email}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-black/[0.08] pt-6 text-[11px] text-[#86868b] sm:flex-row sm:items-center">
          <p>Copyright © 2026 {brand.name}. All rights reserved.</p>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#1d1d1f]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            All systems operational · 99.99% SLA
          </div>
        </div>
      </div>
    </footer>
  );
}
