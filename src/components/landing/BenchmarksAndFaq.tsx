"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const LOAD_STEPS = [
  {
    multiplier: "1×",
    vus: "25 concurrent shoppers",
    anayaCartMs: 224,
    anayaCheckoutMs: 308,
    legacyCheckoutMs: 690,
    legacyErrorRate: "0.2%",
    pods: 4,
  },
  {
    multiplier: "4×",
    vus: "100 concurrent shoppers",
    anayaCartMs: 236,
    anayaCheckoutMs: 321,
    legacyCheckoutMs: 1480,
    legacyErrorRate: "2.4%",
    pods: 8,
  },
  {
    multiplier: "8×",
    vus: "200 concurrent shoppers",
    anayaCartMs: 249,
    anayaCheckoutMs: 334,
    legacyCheckoutMs: 2890,
    legacyErrorRate: "8.9%",
    pods: 14,
  },
  {
    multiplier: "16×",
    vus: "400 concurrent shoppers",
    anayaCartMs: 261,
    anayaCheckoutMs: 348,
    legacyCheckoutMs: 4680,
    legacyErrorRate: "18.4%",
    pods: 24,
  },
] as const;

const VOLUME_ESTIMATES = [
  {
    id: "25k",
    label: "25k orders/mo",
    hoursSaved: 410,
    recoveredUsd: "$11.2k",
  },
  {
    id: "100k",
    label: "100k orders/mo",
    hoursSaved: 1640,
    recoveredUsd: "$44.8k",
  },
  {
    id: "250k",
    label: "250k orders/mo",
    hoursSaved: 4100,
    recoveredUsd: "$112.0k",
  },
] as const;

const FAQS = [
  {
    q: "How does Anaya.ai keep checkout sub-second without edge caching?",
    a: "Cart and checkout endpoints (/?wc-ajax=checkout) require live PHP and MySQL execution. Anaya.ai pairs custom-tuned PHP-FPM I/O workers, HPOS order tables, high-availability Redis object caching, and sub-30s horizontal scaling.",
  },
  {
    q: "Can AI agents modify my live production store unreviewed?",
    a: "Never. Builder AI and Revenue AI stage diffs exclusively into your isolated QA environment, run automated checkout smoke probes, and wait for Owner approval — always kept one click from rollback.",
  },
  {
    q: "How fast is zero-downtime migration from WP Engine, Kinsta, or Cloudways?",
    a: "Within 24 hours of onboarding, we spin up a shadow DEV + QA replica of your WooCommerce database and plugins, validate HPOS + Redis telemetry under synthetic k6 spikes, and execute DNS cutover in under 15 minutes with zero lost orders.",
  },
  {
    q: "Does Anaya.ai work with an existing WooCommerce store?",
    a: "Yes. You can test every workflow locally inside our built-in Demo Store right now or validate live WooCommerce REST v3 connectivity inside the Sandbox modal.",
  },
  {
    q: "What does Bring Your Own Model via MCP mean?",
    a: "Anaya.ai exposes a Model Context Protocol endpoint (/api/mcp) scoped to RBAC roles so your team's existing Claude, ChatGPT, or Gemini seats connect directly with zero token markup.",
  },
  {
    q: "How does Anaya.ai isolate noisy third-party plugins from Stripe payments?",
    a: "Checkout and webhook handlers run on priority PHP-FPM pools shielded from search bots, cron jobs, and third-party shipping quote timeouts using 15-minute Redis stale-while-revalidate caching.",
  },
];

export function BenchmarksAndFaq() {
  const [stepIdx, setStepIdx] = useState(1);
  const [volumeIdx, setVolumeIdx] = useState(1);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const current = LOAD_STEPS[stepIdx];
  const volume = VOLUME_ESTIMATES[volumeIdx];
  const speedup = (current.legacyCheckoutMs / current.anayaCheckoutMs).toFixed(1);

  return (
    <>
      <section
        id="benchmarks"
        className="border-t border-black/[0.06] bg-[#f5f5f7] py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold tracking-wide text-[#6e6e73]">
                  k6 Stress Telemetry
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#1d1d1f] sm:text-4xl">
                  Built for launch-day spikes up to 16× baseline.
                </h2>
              </div>

              {/* Sliding Segmented Control */}
              <div className="relative inline-grid grid-cols-4 self-start rounded-full bg-black/[0.06] p-1">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-1 left-1 w-[calc((100%-8px)/4)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: `translateX(${stepIdx * 100}%)` }}
                />
                {LOAD_STEPS.map((s, idx) => (
                  <button
                    key={s.multiplier}
                    type="button"
                    onClick={() => setStepIdx(idx)}
                    className={`relative z-10 w-14 rounded-full py-1.5 font-mono text-xs font-medium transition-colors duration-200 ${
                      stepIdx === idx
                        ? "text-[#1d1d1f]"
                        : "text-[#6e6e73] hover:text-[#1d1d1f]"
                    }`}
                  >
                    {s.multiplier}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delayMs={80}>
            <div className="mt-10 grid gap-6 lg:grid-cols-12">
              <div className="apple-card studio-shadow studio-shadow-hover rounded-[28px] bg-white p-7 lg:col-span-7 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-4 text-xs">
                  <span className="font-medium text-[#1d1d1f]">
                    {current.vus} · Edge Cache Disabled
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="rounded-full bg-[#30d158]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#1c7c35]">
                      {speedup}× faster checkout
                    </span>
                    <span className="text-[#6e6e73]">{current.pods} pods</span>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#1d1d1f]">
                        Anaya.ai Median Cart (/cart)
                      </span>
                      <span className="font-mono text-[#1d1d1f] tabular-nums">
                        {current.anayaCartMs} ms
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                      <div
                        className="h-full rounded-full bg-[#30d158] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        style={{
                          width: `${Math.round((current.anayaCartMs / 5000) * 100) + 5}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#1d1d1f]">
                        Anaya.ai Median Checkout (/?wc-ajax=checkout)
                      </span>
                      <span className="font-mono text-[#1d1d1f] tabular-nums">
                        {current.anayaCheckoutMs} ms · 0.0% errors
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                      <div
                        className="h-full rounded-full bg-[#0071e3] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        style={{
                          width: `${Math.round((current.anayaCheckoutMs / 5000) * 100) + 6}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#6e6e73]">
                        Legacy Fixed-Worker WooCommerce Host
                      </span>
                      <span className="font-mono text-[#ff3b30] tabular-nums">
                        {current.legacyCheckoutMs} ms · {current.legacyErrorRate}{" "}
                        failed
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                      <div
                        className="h-full rounded-full bg-[#ff3b30] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        style={{
                          width: `${Math.min(100, Math.round((current.legacyCheckoutMs / 5000) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Pod Scaling Visual Strip */}
                <div className="mt-6 flex items-center justify-between border-t border-black/[0.06] pt-4 text-[11px] text-[#6e6e73]">
                  <span>Kubernetes Horizontal Worker Scaling (&lt;30s)</span>
                  <div className="flex items-center gap-1" aria-hidden="true">
                    {Array.from({ length: 12 }).map((_, idx) => {
                      const active = idx < Math.round(current.pods / 2);
                      return (
                        <span
                          key={idx}
                          className={`h-2.5 w-1.5 rounded-full transition-all duration-300 ${
                            active ? "scale-y-110 bg-[#1d1d1f]" : "bg-black/10"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Revenue & Wait-Time Recovery Estimator + SEO */}
              <div className="flex flex-col justify-between gap-6 lg:col-span-5">
                <div className="apple-card studio-shadow rounded-[28px] bg-white p-7">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-[#1d1d1f]">
                      Checkout Impact Estimator
                    </h3>
                    <span className="font-mono text-[10px] text-[#6e6e73]">
                      1.8s -&gt; 321ms
                    </span>
                  </div>

                  <div className="mt-3 inline-flex rounded-full bg-[#f5f5f7] p-1">
                    {VOLUME_ESTIMATES.map((v, idx) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVolumeIdx(idx)}
                        className={`apple-btn rounded-full px-3 py-1 font-mono text-[10px] font-medium transition ${
                          volumeIdx === idx
                            ? "bg-[#1d1d1f] text-white"
                            : "text-[#6e6e73] hover:text-[#1d1d1f]"
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-[#f5f5f7] p-3.5">
                    <div>
                      <div className="text-[11px] text-[#6e6e73]">
                        Shopper Wait Reclaimed
                      </div>
                      <div className="mt-0.5 font-mono text-lg font-semibold text-[#1d1d1f] tabular-nums">
                        {volume.hoursSaved.toLocaleString()} hrs
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#6e6e73]">
                        Est. Checkout Lift
                      </div>
                      <div className="mt-0.5 font-mono text-lg font-semibold text-[#1c7c35] tabular-nums">
                        +{volume.recoveredUsd}/mo
                      </div>
                    </div>
                  </div>
                </div>

                <div className="apple-card studio-shadow rounded-[28px] bg-white p-7">
                  <h3 className="text-base font-semibold text-[#1d1d1f]">
                    Automated Catalog &amp; SEO Hygiene Audits
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#6e6e73]">
                    Continuously detects Uncategorized SKUs, missing product
                    image alt tags, and thin descriptions — test 1-click metadata
                    repair inside the Sandbox.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Smooth CSS Grid-Row Editorial FAQ + Apple Pro Final CTA */}
      <section className="bg-[#fbfbfd] py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-center text-3xl font-semibold tracking-[-0.03em] text-[#1d1d1f] sm:text-4xl">
              Frequently asked questions.
            </h2>
          </Reveal>

          <Reveal delayMs={80}>
            <div className="mt-12 divide-y divide-black/[0.08] border-y border-black/[0.08]">
              {FAQS.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={item.q} className="py-5">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <span className="text-sm font-semibold text-[#1d1d1f] sm:text-base">
                        {item.q}
                      </span>
                      <Plus
                        className={`h-4 w-4 shrink-0 text-[#6e6e73] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isOpen ? "rotate-45 text-[#1d1d1f]" : ""
                        }`}
                      />
                    </button>

                    <div
                      className="grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{
                        gridTemplateRows: isOpen ? "1fr" : "0fr",
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <div className="overflow-hidden">
                        <p className="pt-3 pr-8 text-xs leading-relaxed text-[#6e6e73] sm:text-sm">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>

        <Reveal delayMs={120}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mt-20 rounded-[32px] bg-[#1d1d1f] px-6 py-14 text-center text-white sm:px-12">
              <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                Experience Anaya.ai on a live WooCommerce Sandbox.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-[#a1a1a6]">
                Inject an N+1 query into checkout, trace it in Revenue AI, ship
                a storefront change via Builder AI, or connect your WooCommerce
                REST API.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
                <Link
                  href="/demo"
                  className="apple-btn rounded-full bg-white px-6 py-3 text-sm font-medium text-[#1d1d1f] transition hover:bg-white/90"
                >
                  Open Live Sandbox
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#2997ff] hover:underline"
                >
                  Book an Audit
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
