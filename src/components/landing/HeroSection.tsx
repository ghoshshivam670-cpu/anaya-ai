"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { brand } from "@/config/brand";
import { LiveTypingTerminal } from "@/components/landing/LiveTypingTerminal";
import { Reveal } from "@/components/ui/Reveal";

const STACK_LOGOS = [
  "WooCommerce 9.x",
  "HPOS Order Tables",
  "PHP 8.3 FPM",
  "Redis 7 Object Cache",
  "MCP JSON-RPC 2.0",
  "Auto-Scale 16×",
];

const HERO_CURVE_POINTS = [
  {
    id: "1x",
    label: "1×",
    desc: "Baseline (25 VUs)",
    anayaMs: 308,
    legacyMs: 690,
    legacyStatus: "Static PHP Caps",
    pods: "4 Pods · HPOS + Redis",
    x: 56,
    anayaY: 143,
    legacyY: 132,
  },
  {
    id: "4x",
    label: "4×",
    desc: "Normal Promo (100 VUs)",
    anayaMs: 321,
    legacyMs: 1480,
    legacyStatus: "2.4% Worker Queuing",
    pods: "8 Pods · 0 Dropped",
    x: 188,
    anayaY: 142,
    legacyY: 108,
  },
  {
    id: "8x",
    label: "8×",
    desc: "Email Drop (200 VUs)",
    anayaMs: 334,
    legacyMs: 2890,
    legacyStatus: "8.9% Pool Saturation",
    pods: "14 Pods · 0 Dropped",
    x: 322,
    anayaY: 140,
    legacyY: 62,
  },
  {
    id: "16x",
    label: "16×",
    desc: "Flash Sale (400 VUs)",
    anayaMs: 338,
    legacyMs: 4680,
    legacyStatus: "18.4% 504 Timeouts",
    pods: "24 Pods · 0 Dropped",
    x: 454,
    anayaY: 138,
    legacyY: 14,
  },
] as const;

const INFRA_SPECS = [
  {
    num: "01",
    title: "HPOS Order Tables",
    metric: "148× -> 1× SQL",
    detail:
      "Routes checkout reads through indexed High-Performance Order Storage tables instead of scanning bloated wp_postmeta rows.",
  },
  {
    num: "02",
    title: "Isolated PHP 8.3 FPM",
    metric: "Zero Lockout",
    detail:
      "Dedicates reserved worker pools with OPcache JIT strictly for /cart and /?wc-ajax=checkout requests, shielded from crawler bursts.",
  },
  {
    num: "03",
    title: "HA Redis 7 Object Cache",
    metric: "<12ms Fragment",
    detail:
      "Pins session transients, loyalty multipliers, and carrier quotes in memory so dynamic cart drawers stay sub-second.",
  },
  {
    num: "04",
    title: "Sub-30s Kubernetes Scale",
    metric: "Up to 16× Burst",
    detail:
      "Horizontally scales isolated pods ahead of launch drops and influencer surges — keeping p95 steady at ~321ms.",
  },
];

export function HeroSection() {
  const [curveIdx, setCurveIdx] = useState(1);
  const point = HERO_CURVE_POINTS[curveIdx];
  const isSurge = curveIdx >= 2;

  return (
    <>
      {/* Studio White Hero Band */}
      <section className="relative bg-[#fbfbfd] pb-24 pt-16 sm:pt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="hero-enter-1 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3.5 py-1 text-xs font-medium text-[#6e6e73] shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#30d158]" />
              Autonomous WooCommerce StoreOps · Sub-Second Hosting
            </div>

            <h1 className="hero-enter-2 mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#1d1d1f] sm:text-[64px] sm:leading-[1.03]">
              AI that runs the store.
              <span className="block text-[#86868b]">
                Not just the chatbot.
              </span>
            </h1>

            <p className="hero-enter-3 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#6e6e73] sm:text-[19px] sm:leading-[1.45]">
              Three autonomous AIs find and fix revenue leaks in high-traffic
              WooCommerce stores — slow pages, checkout bugs, launch-day crashes —
              on top of managed infrastructure kept one click from rollback.
            </p>

            <div className="hero-enter-4 mt-8 flex flex-wrap items-center justify-center gap-5">
              <Link
                href="/demo"
                className="apple-btn rounded-full bg-[#1d1d1f] px-6 py-3 text-sm font-medium text-white transition hover:bg-black/80"
              >
                Open Live Sandbox
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 text-sm font-medium text-[#0071e3] transition hover:underline"
              >
                Book an Audit
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <LiveTypingTerminal />

          {/* Clean Monochrome Stack Compatibility Bar */}
          <div className="mx-auto mt-14 flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-black/[0.06] pt-8">
            {STACK_LOGOS.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-tight text-[#6e6e73]"
              >
                <span className="h-1 w-1 rounded-full bg-[#86868b]" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Heroic Benchmark Strip + Interactive SVG Latency Curve (Apple Silver #f5f5f7) */}
      <section className="border-y border-black/[0.06] bg-[#f5f5f7] py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-xl">
                <p className="text-xs font-semibold tracking-wide text-[#6e6e73]">
                  Uncached Dynamic Performance
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#1d1d1f] sm:text-4xl">
                  Sub-second checkout, even when edge caches are bypassed.
                </h2>
              </div>

              {/* Sliding Apple UISegmentedControl Pill */}
              <div className="relative inline-grid grid-cols-4 self-start rounded-full bg-black/[0.06] p-1">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-1 left-1 w-[calc((100%-8px)/4)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: `translateX(${curveIdx * 100}%)` }}
                />
                {HERO_CURVE_POINTS.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCurveIdx(idx)}
                    className={`relative z-10 w-14 rounded-full py-1.5 font-mono text-xs font-medium transition-colors duration-200 ${
                      curveIdx === idx
                        ? "text-[#1d1d1f]"
                        : "text-[#6e6e73] hover:text-[#1d1d1f]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Typographic Metrics Row */}
          <Reveal delayMs={80}>
            <div className="mt-12 grid grid-cols-2 gap-8 border-t border-black/[0.08] pt-10 lg:grid-cols-4">
              {brand.heroMetrics.map((m) => (
                <div key={m.label}>
                  <div className="font-sans text-4xl font-semibold tracking-[-0.04em] text-[#1d1d1f] tabular-nums sm:text-5xl">
                    {m.value}
                  </div>
                  <div className="mt-2 text-sm font-medium text-[#1d1d1f]">
                    {m.label}
                  </div>
                  <div className="mt-0.5 text-xs text-[#6e6e73]">{m.detail}</div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Comparative Cards + Interactive SVG Telemetry Curve */}
          <Reveal delayMs={140}>
            <div className="mt-12 grid gap-6 lg:grid-cols-12">
              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-6 lg:grid-cols-1">
                <div className="apple-card studio-shadow studio-shadow-hover rounded-3xl bg-white p-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#6e6e73]">
                      Standard Fixed-Worker Host · {point.desc}
                    </span>
                    <span
                      className={`font-mono transition-colors ${
                        isSurge ? "text-[#ff3b30]" : "text-[#86868b]"
                      }`}
                    >
                      {point.legacyStatus}
                    </span>
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-[#1d1d1f] tabular-nums">
                    {point.legacyMs.toLocaleString()} ms
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isSurge ? "bg-[#ff3b30]" : "bg-[#86868b]"
                      }`}
                      style={{
                        width: `${Math.min(96, Math.round((point.legacyMs / 4800) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="apple-card studio-shadow studio-shadow-hover rounded-3xl bg-[#1d1d1f] p-6 text-white">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#a1a1a6]">
                      {brand.name} Auto-Scaling Stack
                    </span>
                    <span className="font-mono text-[#30d158]">{point.pods}</span>
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-tight text-white tabular-nums">
                    {point.anayaMs} ms
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#30d158] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{
                        width: `${Math.max(14, Math.round((point.anayaMs / 4800) * 100) + 12)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Precision Interactive SVG Latency Curve */}
              <div className="apple-card studio-shadow studio-shadow-hover flex flex-col justify-between rounded-3xl bg-white p-6 lg:col-span-6">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#1d1d1f]">
                    p95 Checkout Latency ({point.label}:{" "}
                    {(point.legacyMs / point.anayaMs).toFixed(1)}× faster)
                  </span>
                  <div className="flex items-center gap-4 font-mono text-[11px]">
                    <span className="inline-flex items-center gap-1.5 text-[#1d1d1f]">
                      <span className="h-2 w-2 rounded-full bg-[#30d158]" />
                      Anaya.ai
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[#6e6e73]">
                      <span className="h-2 w-2 rounded-full bg-[#ff3b30]" />
                      Legacy Host
                    </span>
                  </div>
                </div>

                <svg
                  viewBox="0 0 480 175"
                  className="mt-4 h-44 w-full overflow-visible"
                  role="img"
                  aria-label="Checkout latency curve comparing Anaya.ai and legacy hosting across 1x to 16x load"
                >
                  {[28, 68, 108, 143].map((y) => (
                    <line
                      key={y}
                      x1="36"
                      y1={y}
                      x2="465"
                      y2={y}
                      stroke="rgba(0,0,0,0.06)"
                      strokeDasharray="3 3"
                    />
                  ))}
                  <text x="0" y="32" fill="#86868b" fontSize="10" fontFamily="monospace">
                    4.5s
                  </text>
                  <text x="0" y="72" fill="#86868b" fontSize="10" fontFamily="monospace">
                    3.0s
                  </text>
                  <text x="0" y="112" fill="#86868b" fontSize="10" fontFamily="monospace">
                    1.5s
                  </text>
                  <text x="0" y="147" fill="#86868b" fontSize="10" fontFamily="monospace">
                    300ms
                  </text>

                  <path
                    d="M 56 132 C 145 122, 235 90, 322 62 C 390 38, 430 20, 454 14"
                    fill="none"
                    stroke="#ff3b30"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 56 143 C 175 142, 310 140, 454 138"
                    fill="none"
                    stroke="#30d158"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Smooth Gliding Crosshair & Circles */}
                  <line
                    x1={point.x}
                    y1="8"
                    x2={point.x}
                    y2="152"
                    stroke="#0071e3"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    style={{ transition: "all 480ms cubic-bezier(0.22, 1, 0.36, 1)" }}
                  />
                  <circle
                    cx={point.x}
                    cy={point.anayaY}
                    r="5.5"
                    fill="#30d158"
                    stroke="#ffffff"
                    strokeWidth="2"
                    style={{ transition: "all 480ms cubic-bezier(0.22, 1, 0.36, 1)" }}
                  />
                  <circle
                    cx={point.x}
                    cy={point.legacyY}
                    r="5.5"
                    fill="#ff3b30"
                    stroke="#ffffff"
                    strokeWidth="2"
                    style={{ transition: "all 480ms cubic-bezier(0.22, 1, 0.36, 1)" }}
                  />

                  {HERO_CURVE_POINTS.map((p, idx) => (
                    <g
                      key={p.id}
                      onClick={() => setCurveIdx(idx)}
                      className="cursor-pointer"
                    >
                      <circle cx={p.x} cy="164" r="14" fill="transparent" />
                      <text
                        x={p.x}
                        y="168"
                        textAnchor="middle"
                        fill={curveIdx === idx ? "#0071e3" : "#86868b"}
                        fontWeight={curveIdx === idx ? "700" : "400"}
                        fontSize="10.5"
                        fontFamily="monospace"
                      >
                        {p.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </Reveal>

          {/* 4-Card Under-the-Hood Engineering Breakdown */}
          <Reveal delayMs={200}>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {INFRA_SPECS.map((spec) => (
                <div
                  key={spec.num}
                  className="apple-card studio-shadow rounded-2xl bg-white p-5"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-[#86868b]">{spec.num}</span>
                    <span className="rounded-full bg-[#30d158]/15 px-2 py-0.5 font-medium text-[#1c7c35]">
                      {spec.metric}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-[#1d1d1f]">
                    {spec.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#6e6e73]">
                    {spec.detail}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
