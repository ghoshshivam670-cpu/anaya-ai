"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Play, RotateCcw } from "lucide-react";
import { synthesizeBuilderPatch } from "@/lib/agents";

interface LiveScenario {
  id: "revenue" | "builder" | "analytics";
  label: string;
  role: string;
  beforeMetric: string;
  afterMetric: string;
  prompt: string;
  steps: string[];
  diffLines: Array<{ type: "ctx" | "del" | "add" | "hunk"; text: string }>;
  outcome: string;
  deployedOutcome: string;
}

const SCENARIOS: LiveScenario[] = [
  {
    id: "revenue",
    label: "Revenue AI",
    role: "Guards",
    beforeMetric: "2,840ms p99",
    afterMetric: "312ms p95",
    prompt:
      "POST /?wc-ajax=checkout p99 jumped to 2,840ms — trace slow hook, price the leak, and open fix PR.",
    steps: [
      "Tracing dynamic checkout spans across PHP-FPM & HPOS MySQL",
      "Root cause: loyalty plugin calling get_post_meta() 148x per cart",
      "Revenue impact priced: -$1,480/hr across mobile checkout drop-off",
      "PR #418 staged in QA · 12/12 checkout probes passing at 312ms",
    ],
    diffLines: [
      { type: "hunk", text: "@@ includes/checkout-hook.php · line 42 @@" },
      { type: "ctx", text: "function anaya_calculate_cart_loyalty_tier($cart) {" },
      { type: "del", text: "-  foreach ($cart->get_cart() as $item) {" },
      { type: "del", text: "-    $tier = get_post_meta($item['product_id'], '_loyalty_mult', true);" },
      { type: "del", text: "-  }" },
      { type: "add", text: "+  $ids = wp_list_pluck($cart->get_cart(), 'product_id');" },
      { type: "add", text: "+  $cached = wp_cache_get('loyalty_' . md5(implode(',', $ids)));" },
      { type: "add", text: "+  if (false === $cached) $cached = anaya_batch_fetch_hpos($ids);" },
      { type: "ctx", text: "}" },
    ],
    outcome: "PR #418 verified in QA · Kept 1 click from rollback",
    deployedOutcome: "PR #418 live on PROD · Checkout p95 restored to 312ms",
  },
  {
    id: "builder",
    label: "Builder AI",
    role: "Ships",
    beforeMetric: "Threshold $75",
    afterMetric: "QA Smoke 12/12",
    prompt:
      "Add a live free-shipping progress bar at $50 inside the WooCommerce cart drawer and verify checkout.",
    steps: [
      "Branching isolated QA environment qa-shipping-50",
      "Updating templates/cart/shipping-progress.php & fragment key",
      "Running synthetic mobile cart & ?wc-ajax=update_order_review",
      "All 12 smoke tests green · Staged & kept one click from rollback",
    ],
    diffLines: [
      { type: "hunk", text: "@@ templates/cart/shipping-progress.php · line 8 @@" },
      { type: "del", text: "- $threshold = (int) get_option('anaya_free_shipping_threshold', 75);" },
      { type: "add", text: "+ $threshold = 50;" },
      { type: "ctx", text: "  $remaining = max(0, $threshold - WC()->cart->get_subtotal());" },
      { type: "add", text: "+ echo $remaining === 0 ? 'Unlocked: Free Express Shipping' : ...;" },
    ],
    outcome: "Live on qa.anayabotanics.anaya.site · Awaiting Owner approval",
    deployedOutcome: "Release v2.15.0 live on PROD · Snapshot v2.14.0 retained",
  },
  {
    id: "analytics",
    label: "Analytics AI",
    role: "Decides",
    beforeMetric: "-14.2% Mobile",
    afterMetric: "+$18.4k/mo Impact",
    prompt:
      "Why did mobile conversion drop 14% after 18:00 across WooCommerce, GA4, and Stripe?",
    steps: [
      "Joining 4,180 WooCommerce sessions with Stripe PaymentIntent logs",
      "18:02 anomaly: uncached carrier quote API stalled ?wc-ajax at 3.4s",
      "Mobile Safari abandoned 14.2% at Payment while Desktop waited",
      "Enable 15m Redis transient on carrier quotes -> +$18.4k/mo projected",
    ],
    diffLines: [
      { type: "hunk", text: "@@ WooCommerce + GA4 + Stripe Cohort Correlation @@" },
      { type: "add", text: "16:00   310ms   3.8% conversion   baseline" },
      { type: "del", text: "18:00  2840ms   2.1% conversion   uncached carrier stall" },
      { type: "add", text: "20:00   315ms   3.9% conversion   PR #418 deployed" },
    ],
    outcome: "Report ready · Linked to Revenue AI PR #418",
    deployedOutcome: "Alert rule pinned to Revenue AI · Anomaly resolved",
  },
];

const QUICK_PROMPTS = [
  "Trace slow checkout hook",
  "Lower free shipping to $50",
  "Audit SEO & missing alt text",
];

function buildCustomScenario(promptText: string): LiveScenario {
  const lower = promptText.toLowerCase();

  if (lower.includes("seo") || lower.includes("alt") || lower.includes("catalog")) {
    return {
      id: "builder",
      label: "Catalog & SEO AI",
      role: "Audits",
      beforeMetric: "2 SKU Issues",
      afterMetric: "98/100 SEO Score",
      prompt: promptText,
      steps: [
        "Scanning WooCommerce REST product taxonomy & image alt metadata",
        "Found ANB-CRM-03 missing alt attribute; ANB-SPF-04 set to Uncategorized",
        "Generating descriptive botanical alt tags & assigning Sun Care category",
        "Catalog QA audit 6/6 SKUs passing · Zero schema regressions",
      ],
      diffLines: [
        { type: "hunk", text: "@@ wp-json/wc/v3/products/ANB-SPF-04 & ANB-CRM-03 @@" },
        { type: "del", text: "- category: 'Uncategorized' | alt_text: ''" },
        { type: "add", text: "+ category: 'Sun Care'      | seo_score: 96/100" },
        { type: "add", text: "+ alt_text: 'Anaya Botanics mineral SPF 50 fluid bottle'" },
      ],
      outcome: "2 catalog fixes staged in QA · Ready for 1-click apply",
      deployedOutcome: "Catalog hygiene updated in PROD · SEO index 97/100",
    };
  }

  if (
    lower.includes("slow") ||
    lower.includes("hook") ||
    lower.includes("trace") ||
    lower.includes("checkout")
  ) {
    return {
      ...SCENARIOS[0],
      prompt: promptText,
    };
  }

  const generated = synthesizeBuilderPatch(promptText);
  const diffLines: LiveScenario["diffLines"] = generated.diffText
    .split("\n")
    .slice(0, 7)
    .map((line) => {
      if (line.startsWith("@@")) return { type: "hunk", text: line };
      if (line.startsWith("-") && !line.startsWith("---")) return { type: "del", text: line };
      if (line.startsWith("+") && !line.startsWith("+++")) return { type: "add", text: line };
      return { type: "ctx", text: line };
    });

  return {
    id: "builder",
    label: "Builder AI",
    role: "Live",
    beforeMetric: "Dev Draft",
    afterMetric: "309ms QA Pass",
    prompt: promptText,
    steps: [
      "Parsing instruction against WooCommerce HPOS store schema",
      "Branching QA sandbox & generating scoped theme/plugin diff",
      `Applying: ${generated.summary}`,
      "12/12 synthetic checkout probes green at 309ms p95",
    ],
    diffLines,
    outcome: "Verified in QA · Open Sandbox to persist in SQLite",
    deployedOutcome: "Promoted to PROD · Open Sandbox for full diff history",
  };
}

export function LiveTypingTerminal() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [customPrompt, setCustomPrompt] = useState("");
  const [customRun, setCustomRun] = useState<LiveScenario | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [mergedInline, setMergedInline] = useState(false);

  const active = customRun ?? SCENARIOS[scenarioIdx];

  useEffect(() => {
    const timer = setInterval(() => {
      setCharCount((prev) => (prev < active.prompt.length ? prev + 2 : prev));
    }, 15);
    return () => clearInterval(timer);
  }, [active]);

  useEffect(() => {
    if (charCount < active.prompt.length) return;
    const stepTimer = setInterval(() => {
      setStepCount((prev) =>
        prev < active.steps.length + 1 ? prev + 1 : prev
      );
    }, 310);
    return () => clearInterval(stepTimer);
  }, [charCount, active]);

  useEffect(() => {
    if (userInteracted || customRun) return;
    if (stepCount <= active.steps.length) return;
    const nextTimer = setTimeout(() => {
      setMergedInline(false);
      setScenarioIdx((prev) => (prev + 1) % SCENARIOS.length);
      setCharCount(0);
      setStepCount(0);
    }, 4500);
    return () => clearTimeout(nextTimer);
  }, [userInteracted, customRun, stepCount, active.steps.length]);

  function selectScenario(idx: number) {
    setUserInteracted(true);
    setMergedInline(false);
    setCustomRun(null);
    setScenarioIdx(idx);
    setCharCount(0);
    setStepCount(0);
  }

  function runCustomPrompt(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setUserInteracted(true);
    setMergedInline(false);
    setCustomRun(buildCustomScenario(trimmed));
    setCharCount(0);
    setStepCount(0);
    setCustomPrompt("");
  }

  const typedPrompt = active.prompt.slice(0, charCount);
  const typingDone = charCount >= active.prompt.length;
  const runDone = typingDone && stepCount >= active.steps.length;
  const progressPct = !typingDone
    ? Math.round((charCount / Math.max(1, active.prompt.length)) * 35)
    : Math.min(100, 35 + Math.round((stepCount / active.steps.length) * 65));

  const currentStage = !typingDone
    ? "STAGE 01/04 · STREAM"
    : stepCount < 2
    ? "STAGE 02/04 · TRACE"
    : !runDone
    ? "STAGE 03/04 · SMOKE"
    : mergedInline
    ? "PROD DEPLOYED"
    : "STAGE 04/04 · READY";

  return (
    <div className="hero-enter-stage relative mx-auto mt-14 max-w-5xl">
      {/* Apple studio ambient depth */}
      <div className="animate-studio-glow pointer-events-none absolute -inset-x-10 -bottom-8 h-32 rounded-full bg-black/15 blur-3xl" />

      {/* Specular macOS Pro Frame */}
      <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-b from-white/25 via-white/[0.06] to-transparent p-[1px] hardware-frame-shadow">
        <div className="overflow-hidden rounded-[25px] bg-[#0d0d10] text-white">
          {/* Window Chrome */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#16161a]/95 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="font-mono text-[11px] text-[#86868b]">
                Anaya CommerceOps — anayabotanics.com
              </span>
              <span
                className={`hidden items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] transition-all duration-300 sm:inline-flex ${
                  mergedInline || runDone
                    ? "bg-[#30d158]/15 text-[#30d158]"
                    : "bg-white/[0.06] text-[#d1d1d6]"
                }`}
              >
                <span>{active.beforeMetric}</span>
                <span>-&gt;</span>
                <span>{active.afterMetric}</span>
              </span>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-black/55 p-1">
              {SCENARIOS.map((s, idx) => {
                const selected = !customRun && scenarioIdx === idx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectScenario(idx)}
                    className={`apple-btn rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-300 ${
                      selected
                        ? "bg-[#2c2c30] text-white shadow-sm"
                        : "text-[#86868b] hover:text-white"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setUserInteracted(true);
                  setMergedInline(false);
                  setCharCount(0);
                  setStepCount(0);
                }}
                className="apple-btn rounded-full p-1.5 text-[#86868b] transition hover:text-white"
                aria-label="Replay live stream"
                title="Replay"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Hairline Stream Progress Indicator */}
          <div className="h-[1.5px] w-full bg-white/[0.04]">
            <div
              className="h-full bg-gradient-to-r from-[#2997ff] to-[#30d158] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Main Inspector Body */}
          <div className="grid divide-y divide-white/[0.08] lg:grid-cols-12 lg:divide-x lg:divide-y-0">
            {/* Left: Live Agent Prompt & Telemetry Stream */}
            <div className="flex flex-col justify-between p-6 lg:col-span-6">
              <div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#30d158]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#30d158] animate-pulse" />
                    {active.label} · {active.role}
                  </span>
                  <span className="font-mono text-[10px] text-[#6e6e73]">
                    {currentStage}
                  </span>
                </div>

                <div className="mt-3 min-h-[56px] font-mono text-[13px] leading-relaxed text-[#f5f5f7]">
                  <span className="text-[#86868b]">$ </span>
                  {typedPrompt}
                  {!typingDone && (
                    <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-white align-middle" />
                  )}
                </div>

                <div className="mt-4 min-h-[124px] space-y-2.5 border-t border-white/[0.06] pt-4">
                  {!typingDone ? (
                    <p className="font-mono text-xs text-[#6e6e73]">
                      Attaching real-time WooCommerce telemetry probes...
                    </p>
                  ) : (
                    active.steps.slice(0, stepCount).map((line) => (
                      <div
                        key={line}
                        className="animate-step-in flex items-start gap-2.5 text-xs text-[#d1d1d6]"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#30d158]" />
                        <span>{line}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp}
                      type="button"
                      onClick={() => runCustomPrompt(qp)}
                      className="apple-btn rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] text-[#a1a1a6] transition hover:border-white/25 hover:text-white"
                    >
                      {qp}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    runCustomPrompt(customPrompt);
                  }}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-black/55 p-1.5 pl-4 transition focus-within:border-[#2997ff]/70"
                >
                  <input
                    type="text"
                    value={customPrompt}
                    onFocus={() => setUserInteracted(true)}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Type any WooCommerce task..."
                    className="flex-1 bg-transparent text-xs text-white placeholder:text-[#6e6e73] outline-none"
                  />
                  <button
                    type="submit"
                    className="apple-btn inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-semibold text-black transition hover:bg-white/90"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    Run
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Xcode Diff Inspector */}
            <div className="flex flex-col justify-between bg-[#09090b] p-6 lg:col-span-6">
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#86868b]">
                  <span className="font-mono">QA Patch &amp; Verification</span>
                  <span className="font-mono text-[#a1a1a6]">
                    {runDone ? "12/12 Probes Green" : "Staging QA Branch..."}
                  </span>
                </div>

                <div className="code-scroll mt-4 min-h-[192px] overflow-x-auto rounded-2xl border border-white/[0.07] bg-[#0d0d10] p-3 font-mono text-[11px] leading-[1.65]">
                  {stepCount >= 1 ? (
                    active.diffLines.map((line, i) => (
                      <div
                        key={`${i}-${line.text}`}
                        className={`animate-step-in whitespace-pre rounded px-2 py-0.5 ${
                          line.type === "del"
                            ? "bg-[#ff453a]/12 text-[#ff6961]"
                            : line.type === "add"
                            ? "bg-[#30d158]/12 text-[#32d74b]"
                            : line.type === "hunk"
                            ? "bg-[#0071e3]/12 text-[#64d2ff]"
                            : "text-[#8e8e93]"
                        }`}
                      >
                        {line.text}
                      </div>
                    ))
                  ) : (
                    <div className="space-y-2 px-2 py-1 text-[#636366]">
                      <div>&gt; Inspecting WooCommerce PHP-FPM &amp; HPOS workers</div>
                      <div>&gt; Capturing ?wc-ajax=checkout waterfall</div>
                      <div>&gt; Waiting for diagnostic diff synthesis...</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                <span
                  className={`font-mono text-[11px] transition-colors ${
                    mergedInline ? "text-[#30d158]" : "text-[#a1a1a6]"
                  }`}
                >
                  {runDone
                    ? mergedInline
                      ? active.deployedOutcome
                      : active.outcome
                    : "Running automated QA checkout checks..."}
                </span>

                <div className="flex items-center gap-3">
                  {runDone && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserInteracted(true);
                        setMergedInline((v) => !v);
                      }}
                      className={`apple-btn inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium transition ${
                        mergedInline
                          ? "bg-[#30d158]/20 text-[#30d158]"
                          : "bg-white text-black hover:bg-white/90"
                      }`}
                    >
                      {mergedInline && <Check className="h-3 w-3" />}
                      {mergedInline ? "Merged" : "1-Click Approve"}
                    </button>
                  )}

                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#2997ff] transition hover:underline"
                  >
                    Sandbox
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
