"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Check, CheckCircle2 } from "lucide-react";

const AUDIT_DELIVERABLES = [
  "Shadow DEV + QA clone running PHP 8.3 & HPOS MySQL",
  "Uncached 1× -> 16× k6 stress trace across /cart & /?wc-ajax=checkout",
  "Plugin-by-plugin APM waterfall isolating N+1 wp_postmeta queries",
  "Redis 7 object cache + Carrier API transient optimization brief",
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [platform, setPlatform] = useState("WooCommerce");
  const [monthlyOrders, setMonthlyOrders] = useState("10k-50k");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recommendedWorkers =
    monthlyOrders === "<10k"
      ? "8-12 PHP-FPM Pods"
      : monthlyOrders === "10k-50k"
      ? "16-24 Auto-Scaling Pods"
      : monthlyOrders === "50k-250k"
      ? "32-48 Multi-Zone Pods"
      : "64+ Dedicated HA Cluster";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          storeUrl,
          platform,
          monthlyOrders,
          notes,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        leadId?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.error || "Could not submit request.");
        return;
      }
      setSubmittedId(json.leadId || "confirmed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-[#fbfbfd] py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-wide text-[#6e6e73]">
              Store Performance Audit
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#1d1d1f] sm:text-5xl">
              Book an Anaya.ai evaluation.
            </h1>
            <p className="mt-3 text-sm text-[#6e6e73]">
              Share your store URL and monthly order volume. We&apos;ll benchmark
              uncached checkout speed and stage a shadow QA clone within 24 hours.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-12">
            <div className="rounded-[28px] bg-[#f5f5f7] p-7 lg:col-span-7 sm:p-9">
              {submittedId ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-[#30d158]" />
                  <h2 className="mt-4 text-xl font-semibold text-[#1d1d1f]">
                    Audit Request Recorded
                  </h2>
                  <p className="mt-2 text-sm text-[#6e6e73]">
                    Reference{" "}
                    <span className="font-mono text-[#1d1d1f]">
                      {submittedId}
                    </span>
                    . We&apos;ll follow up at{" "}
                    <span className="text-[#1d1d1f]">{email}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedId(null);
                      setName("");
                      setEmail("");
                      setStoreUrl("");
                      setNotes("");
                    }}
                    className="mt-6 rounded-full bg-[#1d1d1f] px-5 py-2 text-xs font-medium text-white hover:bg-black/80"
                  >
                    Submit Another Store
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-[#1d1d1f]">
                        Full Name
                      </label>
                      <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ananya Verma"
                        className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#1d1d1f]">
                        Work Email
                      </label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="founder@brand.com"
                        className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-[#1d1d1f]">
                        Store URL
                      </label>
                      <input
                        required
                        value={storeUrl}
                        onChange={(e) => setStoreUrl(e.target.value)}
                        placeholder="https://store.example.com"
                        className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 font-mono text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#1d1d1f]">
                          Platform
                        </label>
                        <select
                          value={platform}
                          onChange={(e) => setPlatform(e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3]"
                        >
                          <option value="WooCommerce">WooCommerce</option>
                          <option value="Headless WC">Headless WC</option>
                          <option value="Shopify">Shopify</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#1d1d1f]">
                          Monthly Orders
                        </label>
                        <select
                          value={monthlyOrders}
                          onChange={(e) => setMonthlyOrders(e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3]"
                        >
                          <option value="<10k">&lt; 10k / mo</option>
                          <option value="10k-50k">10k – 50k / mo</option>
                          <option value="50k-250k">50k – 250k / mo</option>
                          <option value="250k+">250k+ / mo</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1d1d1f]">
                      Current Bottlenecks
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Checkout latency spikes during flash drops..."
                      className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3]"
                    />
                  </div>

                  {error && (
                    <p className="rounded-xl bg-[#ff3b30]/15 px-3.5 py-2 text-xs text-[#c92a22]">
                      {error}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-[#6e6e73]">
                      Zero production downtime · Read-only evaluation
                    </span>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-full bg-[#1d1d1f] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-black/80 disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Request Audit"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right: Live Audit Scope Preview Card */}
            <div className="flex flex-col justify-between rounded-[28px] bg-[#111113] p-7 text-white hardware-frame-shadow lg:col-span-5 sm:p-8">
              <div>
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 text-xs">
                  <span className="font-semibold text-white">
                    Estimated Audit Blueprint
                  </span>
                  <span className="font-mono text-[#30d158]">{platform}</span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#09090b] p-3.5">
                    <div className="text-[11px] text-[#86868b]">Target Capacity</div>
                    <div className="mt-1 font-mono text-xs font-semibold text-white">
                      {recommendedWorkers}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#09090b] p-3.5">
                    <div className="text-[11px] text-[#86868b]">Target Checkout</div>
                    <div className="mt-1 font-mono text-xs font-semibold text-[#30d158]">
                      &lt; 350ms p95
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="text-xs font-semibold text-[#a1a1a6]">
                    Included in 24h Engineering Brief
                  </div>
                  {AUDIT_DELIVERABLES.map((item) => (
                    <div key={item} className="flex items-start gap-2.5 text-xs">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#30d158]/20 text-[#30d158]">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      <span className="text-[#d1d1d6]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-white/[0.08] pt-4 font-mono text-[11px] text-[#86868b]">
                Zero per-token markup · Keep QA separate from PROD
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
