"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ChevronRight } from "lucide-react";
import { FAULT_BLUEPRINTS, synthesizeBuilderPatch } from "@/lib/agents";
import { CodeDiffView } from "@/components/ui/CodeDiffView";
import { Reveal } from "@/components/ui/Reveal";

type AgentTab = "revenue" | "builder" | "analytics";

const BUILDER_PRESETS = [
  "Add a free express shipping progress bar at $60 in the cart drawer",
  "Activate a 15% VIP launch discount automatically at checkout",
  "Hide the top promotional shipping banner during flash maintenance",
];

const ANALYTICS_PRESETS = [
  {
    id: "mobile_drop",
    question: "Why did mobile checkout conversion dip 14% after 18:00?",
    headline: "Loyalty N+1 lookup added +2.4s to mobile ?wc-ajax=checkout",
    metric: "$1,480/hr recovered",
    points: [
      { label: "16:00", latency: 310, conv: 3.8, orders: 142 },
      { label: "17:00", latency: 325, conv: 3.7, orders: 138 },
      { label: "18:00", latency: 2680, conv: 2.2, orders: 79 },
      { label: "19:00", latency: 2840, conv: 2.1, orders: 74 },
      { label: "20:00", latency: 315, conv: 3.9, orders: 151 },
    ],
    diagnosis:
      "At 18:02, plugin v1.8.4 began invoking uncached get_post_meta() 148 times per cart. Revenue AI staged an HPOS batch-cache PR; mobile conversion recovered to 3.9%.",
  },
  {
    id: "plugin_overhead",
    question: "Which WooCommerce plugin adds the highest checkout latency?",
    headline: "Live Carrier Quote Plugin accounts for 64% of p95 cart delay",
    metric: "1,120 ms savable",
    points: [
      { label: "Core WC", latency: 140, conv: 4.1, orders: 164 },
      { label: "HPOS", latency: 42, conv: 4.1, orders: 166 },
      { label: "Stripe", latency: 95, conv: 4.0, orders: 159 },
      { label: "Carrier", latency: 1120, conv: 2.9, orders: 108 },
      { label: "Cached", latency: 295, conv: 4.0, orders: 161 },
    ],
    diagnosis:
      "Synchronous carrier quotes lack Redis transient caching. Enabling a 15-minute stale-while-revalidate transient trims p95 cart refresh from 1.4s to 295ms.",
  },
];

const WORKFORCE_CAPABILITIES = [
  {
    agent: "Revenue AI",
    role: "Guards",
    dot: "bg-[#30d158]",
    summary:
      "Continuous synthetic probes validate cart fragments, coupon calculation, tax hooks, and gateway webhooks every 60 seconds.",
    bullets: [
      "Traces MySQL N+1 loops to exact plugin file & line number",
      "Calculates live hourly dollar revenue at risk across devices",
      "Opens ready-to-verify PRs in QA before shipping to PROD",
    ],
  },
  {
    agent: "Builder AI",
    role: "Ships",
    dot: "bg-[#2997ff]",
    summary:
      "Translates plain-English merchandising and integration requests into scoped theme and mu-plugin patches with automated QA.",
    bullets: [
      "Branches isolated QA instance for every change request",
      "Runs 12 synthetic ?wc-ajax=checkout smoke probes pre-merge",
      "Retains immutable ZFS + git snapshot for 1-click rollback",
    ],
  },
  {
    agent: "Analytics AI",
    role: "Decides",
    dot: "bg-[#ffd60a]",
    summary:
      "Joins WooCommerce HPOS order tables, GA4 funnel events, and Stripe PaymentIntents to explain margin and conversion shifts.",
    bullets: [
      "Answers natural-language queries with correlated latency charts",
      "Surfaces hidden third-party script or carrier API slowdowns",
      "Exports cohort findings directly into Revenue AI alerts",
    ],
  },
];

export function InteractiveWorkforce() {
  const gradId = useId();
  const [activeTab, setActiveTab] = useState<AgentTab>("revenue");
  const [selectedFault, setSelectedFault] = useState<
    "N_PLUS_1" | "PAYMENT_WEBHOOK" | "SHIPPING_API"
  >("N_PLUS_1");
  const [previewFixed, setPreviewFixed] = useState(false);
  const [selectedSpanIdx, setSelectedSpanIdx] = useState<number>(2);

  const [builderPrompt, setBuilderPrompt] = useState(BUILDER_PRESETS[0]);
  const [builderStaged, setBuilderStaged] = useState(false);
  const [simulatedBagUsd, setSimulatedBagUsd] = useState(44);

  const [analyticsId, setAnalyticsId] = useState(ANALYTICS_PRESETS[0].id);
  const [activePointIdx, setActivePointIdx] = useState<number>(2);

  const fault = FAULT_BLUEPRINTS[selectedFault];
  const inspectedSpan =
    fault.traces[selectedSpanIdx] || fault.traces[fault.traces.length - 1];
  const generatedPatch = synthesizeBuilderPatch(builderPrompt);
  const activeAnalytics =
    ANALYTICS_PRESETS.find((a) => a.id === analyticsId) || ANALYTICS_PRESETS[0];
  const activePoint =
    activeAnalytics.points[activePointIdx] || activeAnalytics.points[2];

  const previewThreshold =
    generatedPatch.configUpdates.freeShippingThreshold ?? 75;
  const previewDiscount =
    generatedPatch.configUpdates.promoDiscountPercent ?? 0;
  const previewBannerEnabled =
    generatedPatch.configUpdates.shippingBannerEnabled ?? true;

  const effectiveBagUsd =
    previewDiscount > 0
      ? Number((simulatedBagUsd * (1 - previewDiscount / 100)).toFixed(2))
      : simulatedBagUsd;
  const shippingProgressPct = Math.min(
    100,
    Math.round((effectiveBagUsd / Math.max(1, previewThreshold)) * 100)
  );
  const remainingUsd = Math.max(
    0,
    Number((previewThreshold - effectiveBagUsd).toFixed(2))
  );

  const convCoords = activeAnalytics.points.map((pt, idx) => {
    const x = 55 + idx * 96;
    const y = Math.round(145 - (pt.conv / 4.5) * 110);
    return { x, y, pt, idx };
  });
  const convLinePath = convCoords
    .map((c, idx) => `${idx === 0 ? "M" : "L"} ${c.x} ${c.y}`)
    .join(" ");
  const convAreaPath = `${convLinePath} L ${convCoords[convCoords.length - 1].x} 150 L ${convCoords[0].x} 150 Z`;

  return (
    <section id="workforce" className="bg-black py-28 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wide text-[#86868b]">
                Three AIs on top of managed hosting
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
                Guards. Ships. Decides.
                <span className="block text-[#86868b]">
                  Built into your store stack.
                </span>
              </h2>
            </div>

            <Link
              href="/demo"
              className="inline-flex items-center gap-1 self-start text-sm font-medium text-[#2997ff] hover:underline"
            >
              Try live in Sandbox
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        {/* Apple Segmented Tab Switcher */}
        <Reveal delayMs={80}>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex rounded-full bg-[#1c1c1e] p-1">
              {[
                { id: "revenue", label: "Revenue AI · Guards" },
                { id: "builder", label: "Builder AI · Ships" },
                { id: "analytics", label: "Analytics AI · Decides" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as AgentTab)}
                  className={`apple-btn rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 ${
                    activeTab === t.id
                      ? "bg-[#3a3a3c] text-white shadow-sm"
                      : "text-[#98989d] hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <p className="text-xs text-[#86868b]">
              {activeTab === "revenue" &&
                "Monitors checkout, cart, pricing, and payments 24/7 — prices regressions in dollars."}
              {activeTab === "builder" &&
                "Turns plain-English requests into QA-tested releases kept one click from rollback."}
              {activeTab === "analytics" &&
                "Answers deep operational questions across WooCommerce, GA4, and Stripe."}
            </p>
          </div>
        </Reveal>

        {/* Pro Display Interactive Stage */}
        <Reveal delayMs={140}>
          <div className="mt-6 rounded-[28px] border border-white/[0.08] bg-[#111113] p-6 sm:p-8">
            {activeTab === "revenue" && (
              <div className="animate-panel-in grid gap-8 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex rounded-full bg-black/50 p-1">
                      {(
                        [
                          ["N_PLUS_1", "N+1 Query"],
                          ["PAYMENT_WEBHOOK", "Webhook 401"],
                          ["SHIPPING_API", "Carrier API"],
                        ] as const
                      ).map(([code, label], idx) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setSelectedFault(code);
                            setPreviewFixed(false);
                            setSelectedSpanIdx(idx === 1 ? 1 : 2);
                          }}
                          className={`apple-btn rounded-full px-3 py-1 text-xs font-medium transition ${
                            selectedFault === code
                              ? "bg-white text-black"
                              : "text-[#86868b] hover:text-white"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewFixed((v) => !v)}
                      className={`apple-btn rounded-full px-4 py-1.5 text-xs font-medium transition ${
                        previewFixed
                          ? "bg-[#30d158]/20 text-[#30d158]"
                          : "bg-white text-black hover:bg-white/90"
                      }`}
                    >
                      {previewFixed ? "Verified in QA (312ms)" : "Apply Fix PR"}
                    </button>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        {previewFixed ? `Resolved: ${fault.title}` : fault.title}
                      </h3>
                      <span
                        className={`font-mono text-xs transition-colors ${
                          previewFixed ? "text-[#30d158]" : "text-[#ff453a]"
                        }`}
                      >
                        {previewFixed
                          ? "$0/hr at risk"
                          : `$${fault.revenueAtRiskPerHr}/hr at risk`}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-[#86868b]">
                      {fault.affectedEndpoint} · p99{" "}
                      {previewFixed ? "312 ms" : `${fault.p99LatencyMs} ms`}
                    </p>
                  </div>

                  {/* Time-Offset APM Gantt Waterfall */}
                  <div className="rounded-2xl border border-white/[0.06] bg-[#09090b] p-4">
                    <div className="mb-3 flex items-center justify-between font-mono text-[10px] text-[#6e6e73]">
                      <span>0ms</span>
                      <span>
                        {Math.round((previewFixed ? 312 : fault.p99LatencyMs) * 0.5)}
                        ms
                      </span>
                      <span>
                        {previewFixed ? "312ms" : `${fault.p99LatencyMs}ms`}
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {fault.traces.map((span, idx) => {
                        const totalMs = previewFixed ? 312 : fault.p99LatencyMs;
                        const effectiveMs =
                          previewFixed && span.status !== "ok"
                            ? 48
                            : span.durationMs;
                        const leftPct = previewFixed
                          ? Math.min(72, Math.round((span.startMs / 2840) * 65))
                          : Math.min(86, Math.round((span.startMs / totalMs) * 100));
                        const widthPct = Math.max(
                          6,
                          Math.min(
                            100 - leftPct,
                            Math.round((effectiveMs / totalMs) * 100)
                          )
                        );
                        const isSelected = selectedSpanIdx === idx;
                        return (
                          <button
                            key={span.name}
                            type="button"
                            onClick={() => setSelectedSpanIdx(idx)}
                            className={`block w-full rounded-xl p-1.5 text-left transition ${
                              isSelected ? "bg-white/[0.05]" : "hover:bg-white/[0.02]"
                            }`}
                          >
                            <div className="flex justify-between text-[11px]">
                              <span className="truncate pr-2 text-[#f5f5f7]">
                                {span.name}
                              </span>
                              <span className="shrink-0 font-mono text-[#86868b]">
                                {effectiveMs} ms
                              </span>
                            </div>
                            <div className="relative mt-1 h-2 w-full rounded-full bg-white/[0.06]">
                              <div
                                className={`absolute top-0 h-full rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                  previewFixed || span.status === "ok"
                                    ? "bg-[#30d158]"
                                    : span.status === "error"
                                    ? "bg-[#ff453a]"
                                    : "bg-[#ffd60a]"
                                }`}
                                style={{
                                  left: `${leftPct}%`,
                                  width: `${widthPct}%`,
                                }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {inspectedSpan && (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-[#d1d1d6]">
                            {inspectedSpan.layer}
                          </span>
                          <span className="text-[#a1a1a6]">
                            {previewFixed && inspectedSpan.status !== "ok"
                              ? "Resolved via batched HPOS read + Redis transient cache"
                              : inspectedSpan.detail}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-[#6e6e73]">
                          @{inspectedSpan.startMs}ms
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#09090b] lg:col-span-5">
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 text-[11px] text-[#86868b]">
                    <span className="font-mono">Pull Request Diff</span>
                    <span className="font-mono text-[#30d158]">PHP 8.3 Lint OK</span>
                  </div>
                  <div className="flex-1 p-3.5">
                    <CodeDiffView diff={fault.diffPatch} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "builder" && (
              <div className="animate-panel-in grid gap-8 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-6">
                  <label className="block text-xs font-medium text-[#86868b]">
                    Plain-English Change Request
                  </label>
                  <textarea
                    rows={3}
                    value={builderPrompt}
                    onChange={(e) => {
                      setBuilderPrompt(e.target.value);
                      setBuilderStaged(false);
                    }}
                    className="w-full rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-white outline-none focus:border-[#2997ff]"
                  />
                  <div className="flex flex-wrap gap-2">
                    {BUILDER_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setBuilderPrompt(preset);
                          setBuilderStaged(false);
                        }}
                        className="apple-btn rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-[#d1d1d6] transition hover:bg-white/10"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setBuilderStaged(true)}
                      className="apple-btn rounded-full bg-white px-5 py-2 text-xs font-semibold text-black transition hover:bg-white/90"
                    >
                      Stage &amp; Run QA Smoke Suite
                    </button>
                    <Link
                      href="/demo"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#2997ff] hover:underline"
                    >
                      Apply persistently in Sandbox
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  {builderStaged && (
                    <p className="animate-step-in font-mono text-xs text-[#30d158]">
                      ✓ 12/12 smoke tests passed (298ms) — {generatedPatch.summary}
                    </p>
                  )}
                </div>

                {/* Live Mini Cart Simulator + Syntax Diff */}
                <div className="space-y-4 lg:col-span-6">
                  <div className="rounded-2xl bg-white p-4 text-[#1d1d1f]">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6e6e73]">
                      <span className="font-semibold text-[#1d1d1f]">
                        QA Cart Drawer Preview
                      </span>
                      <div className="flex items-center gap-1 rounded-full bg-[#f5f5f7] p-0.5">
                        {[38, 64, 88].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setSimulatedBagUsd(amt)}
                            className={`apple-btn rounded-full px-2 py-0.5 font-mono text-[10px] transition ${
                              simulatedBagUsd === amt
                                ? "bg-[#1d1d1f] text-white"
                                : "text-[#6e6e73] hover:text-[#1d1d1f]"
                            }`}
                          >
                            ${amt}
                          </button>
                        ))}
                      </div>
                    </div>
                    {previewBannerEnabled ? (
                      <div className="mt-2.5 rounded-xl bg-[#f5f5f7] px-3.5 py-2.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            {generatedPatch.configUpdates.checkoutBannerText ||
                              `Free express shipping over $${previewThreshold}`}
                          </span>
                          {previewDiscount > 0 && (
                            <span className="rounded-full bg-[#1d1d1f] px-2 py-0.5 font-mono text-[10px] text-white">
                              -{previewDiscount}%
                            </span>
                          )}
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                          <div
                            className="h-full rounded-full bg-[#30d158] transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
                            style={{ width: `${shippingProgressPct}%` }}
                          />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-[#6e6e73]">
                          <span>Bag: ${effectiveBagUsd.toFixed(2)}</span>
                          <span>
                            {remainingUsd === 0
                              ? "Unlocked Free Express"
                              : `$${remainingUsd.toFixed(2)} away from $${previewThreshold}`}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2.5 rounded-xl bg-[#f5f5f7] px-3.5 py-2.5 font-mono text-[11px] text-[#6e6e73]">
                        Promotional shipping banner hidden in QA release
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#09090b]">
                    <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5 text-[11px] text-[#86868b]">
                      <span className="font-mono">Scoped QA Patch</span>
                      <span className="truncate font-mono text-white">
                        {generatedPatch.summary}
                      </span>
                    </div>
                    <div className="p-3.5">
                      <CodeDiffView diff={generatedPatch.diffText} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="animate-panel-in grid gap-8 lg:grid-cols-12">
                <div className="space-y-3 lg:col-span-5">
                  {ANALYTICS_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setAnalyticsId(preset.id);
                        setActivePointIdx(2);
                      }}
                      className={`apple-btn w-full rounded-2xl border p-4 text-left transition ${
                        analyticsId === preset.id
                          ? "border-white/30 bg-white/[0.08]"
                          : "border-white/[0.06] bg-black/30 hover:border-white/15"
                      }`}
                    >
                      <p className="text-sm font-medium text-white">
                        &ldquo;{preset.question}&rdquo;
                      </p>
                    </button>
                  ))}
                  <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-4">
                    <div className="font-mono text-xs text-[#30d158]">
                      {activeAnalytics.metric}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[#a1a1a6]">
                      {activeAnalytics.diagnosis}
                    </p>
                  </div>
                </div>

                {/* Swift Charts Style Dual-Series SVG Chart */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#09090b] p-6 lg:col-span-7">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">
                      {activeAnalytics.headline}
                    </h3>
                    <div className="flex items-center gap-3 font-mono text-[10px] text-[#86868b]">
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-sm bg-[#30d158]/60" />
                        Latency (ms)
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#2997ff]">
                        <span className="h-2 w-2 rounded-full bg-[#2997ff]" />
                        Conversion (%)
                      </span>
                    </div>
                  </div>

                  {/* Interactive Point Inspector Pill */}
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-1.5 font-mono text-[11px]">
                    <span className="text-[#86868b]">
                      Bucket:{" "}
                      <strong className="text-white">{activePoint.label}</strong>
                    </span>
                    <span className="text-[#d1d1d6]">
                      {activePoint.latency}ms p95 · {activePoint.conv}% conv ·{" "}
                      {activePoint.orders} orders/hr
                    </span>
                  </div>

                  <svg
                    viewBox="0 0 500 185"
                    className="mt-4 h-48 w-full overflow-visible"
                    role="img"
                    aria-label="Analytics AI latency and conversion correlation chart"
                  >
                    <defs>
                      <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2997ff" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#2997ff" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {[35, 75, 115, 150].map((y) => (
                      <line
                        key={y}
                        x1="20"
                        y1={y}
                        x2="480"
                        y2={y}
                        stroke="rgba(255,255,255,0.06)"
                        strokeDasharray="3 3"
                      />
                    ))}

                    {activeAnalytics.points.map((pt, idx) => {
                      const x = 55 + idx * 96;
                      const barHeight = Math.max(
                        12,
                        Math.min(125, Math.round((pt.latency / 2900) * 125))
                      );
                      const yBar = 150 - barHeight;
                      const isSpike = pt.latency > 900;
                      const isSelected = activePointIdx === idx;
                      return (
                        <g
                          key={`bar-${pt.label}`}
                          onClick={() => setActivePointIdx(idx)}
                          className="cursor-pointer"
                        >
                          <rect
                            x={x - 16}
                            y={yBar}
                            width="32"
                            height={barHeight}
                            rx="6"
                            fill={
                              isSpike
                                ? isSelected
                                  ? "rgba(255,69,58,0.68)"
                                  : "rgba(255,69,58,0.42)"
                                : isSelected
                                ? "rgba(48,209,88,0.5)"
                                : "rgba(48,209,88,0.28)"
                            }
                            style={{
                              transition:
                                "all 480ms cubic-bezier(0.22, 1, 0.36, 1)",
                            }}
                          />
                          <text
                            x={x}
                            y={yBar - 6}
                            textAnchor="middle"
                            fill={isSpike ? "#ff6961" : "#a1a1a6"}
                            fontSize="10"
                            fontFamily="monospace"
                            style={{
                              transition:
                                "all 480ms cubic-bezier(0.22, 1, 0.36, 1)",
                            }}
                          >
                            {pt.latency}ms
                          </text>
                          <text
                            x={x}
                            y="170"
                            textAnchor="middle"
                            fill={isSelected ? "#ffffff" : "#86868b"}
                            fontWeight={isSelected ? "700" : "400"}
                            fontSize="10"
                            fontFamily="monospace"
                          >
                            {pt.label}
                          </text>
                        </g>
                      );
                    })}

                    <path
                      d={convAreaPath}
                      fill={`url(#${gradId})`}
                      style={{
                        transition: "all 480ms cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                    />
                    <path
                      d={convLinePath}
                      fill="none"
                      stroke="#2997ff"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transition: "all 480ms cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                    />

                    {convCoords.map(({ x, y, pt, idx }) => (
                      <g
                        key={`conv-${pt.label}`}
                        onClick={() => setActivePointIdx(idx)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r={activePointIdx === idx ? 5.5 : 4.5}
                          fill="#2997ff"
                          stroke="#09090b"
                          strokeWidth="2"
                          style={{
                            transition:
                              "all 480ms cubic-bezier(0.22, 1, 0.36, 1)",
                          }}
                        />
                        <text
                          x={x}
                          y={y - 10}
                          textAnchor="middle"
                          fill="#64d2ff"
                          fontSize="10"
                          fontFamily="monospace"
                          style={{
                            transition:
                              "all 480ms cubic-bezier(0.22, 1, 0.36, 1)",
                          }}
                        >
                          {pt.conv}%
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* Detailed 3-AI Operational Matrix */}
        <Reveal delayMs={200}>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {WORKFORCE_CAPABILITIES.map((cap) => (
              <div
                key={cap.agent}
                className="apple-card rounded-[24px] border border-white/[0.08] bg-[#111113] p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                    <span className={`h-2 w-2 rounded-full ${cap.dot}`} />
                    {cap.agent}
                  </span>
                  <span className="font-mono text-[11px] text-[#86868b]">
                    {cap.role}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#a1a1a6]">
                  {cap.summary}
                </p>
                <ul className="mt-4 space-y-2 border-t border-white/[0.06] pt-4 text-[11px] text-[#d1d1d6]">
                  {cap.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#6e6e73]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
