"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronRight, Copy, RotateCcw } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const ENVS = [
  {
    id: "DEV",
    title: "Development",
    url: "https://dev.anayabotanics.anaya.site",
    release: "v2.15.0-dev",
    commit: "a91f4c2",
    workers: "4 isolated PHP 8.3 workers",
    latency: "284 ms p95",
    notes: "Full SSH/SFTP, browser code editor, and Builder AI draft workspace.",
  },
  {
    id: "QA",
    title: "QA Staging",
    url: "https://qa.anayabotanics.anaya.site",
    release: "v2.15.0-rc1",
    commit: "7d8e10b",
    workers: "8 workers · 2 zones",
    latency: "262 ms p95",
    notes: "Automated WooCommerce checkout smoke tests + Revenue AI PR verification.",
  },
  {
    id: "PROD",
    title: "Production",
    url: "https://anayabotanics.com",
    release: "v2.14.0",
    commit: "4c22e90",
    workers: "24 workers · Auto-scales 16×",
    latency: "318 ms p95",
    notes: "Multi-zone HPOS MySQL + Redis object cache + 1-click instant rollback.",
  },
] as const;

const MCP_CLIENTS = [
  {
    id: "claude",
    label: "Claude",
    filename: "claude_desktop_config.json",
    snippet: `{
  "mcpServers": {
    "anaya-commerceops": {
      "url": "https://anaya.ai/api/mcp",
      "headers": { "Authorization": "Bearer anaya_role_editor_..." }
    }
  }
}`,
  },
  {
    id: "gemini",
    label: "Gemini",
    filename: "jsonrpc-tools-call.json",
    snippet: `POST https://anaya.ai/api/mcp
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": { "name": "list_revenue_incidents", "arguments": { "status": "open" } }
}`,
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    filename: "anaya-mcp-scopes.txt",
    snippet: `# Zero per-token markup over Model Context Protocol
Connector: Anaya CommerceOps MCP (/api/mcp)
Tools:
  • get_store_health        (Viewer)
  • run_catalog_seo_audit   (Viewer)
  • query_analytics         (Viewer)
  • propose_builder_change  (Editor -> QA only)`,
  },
] as const;

const RBAC_ROLES = [
  {
    role: "Owner",
    scope: "Production deploys, 1-click rollbacks, billing & WooCommerce keys",
  },
  {
    role: "Admin",
    scope: "DEV/QA promotions, APM alerts, environment variables & backups",
  },
  {
    role: "Editor",
    scope: "Builder AI drafts, Catalog/SEO fixes & QA staging verification",
  },
  {
    role: "Viewer",
    scope: "Read-only Analytics AI queries, APM traces & audit log inspection",
  },
];

const SECURITY_GUARANTEES = [
  {
    title: "Shadow Clone Migration",
    detail: "We replicate wp-content & HPOS tables into QA with zero downtime before DNS cutover.",
  },
  {
    title: "Hourly Immutable Snapshots",
    detail: "Atomic ZFS database + release state checkpoints retain instant 1.2s rollback history.",
  },
  {
    title: "PCI-Aware Isolation",
    detail: "Strict container network boundaries keep Stripe/Adyen webhooks isolated from noisy plugins.",
  },
];

export function ArchitectureAndMcp() {
  const [selectedEnv, setSelectedEnv] = useState<"DEV" | "QA" | "PROD">("QA");
  const [selectedClient, setSelectedClient] = useState<
    "claude" | "gemini" | "chatgpt"
  >("claude");
  const [rolledBack, setRolledBack] = useState(false);
  const [copied, setCopied] = useState(false);

  const envObj = ENVS.find((e) => e.id === selectedEnv) || ENVS[1];
  const clientIdx = MCP_CLIENTS.findIndex((c) => c.id === selectedClient);
  const clientObj = MCP_CLIENTS[clientIdx >= 0 ? clientIdx : 0];

  function handleCopy() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(clientObj.snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  function handleRollbackToggle() {
    setSelectedEnv("PROD");
    setRolledBack((v) => !v);
  }

  return (
    <section id="architecture" className="bg-[#fbfbfd] py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-[#6e6e73]">
              Infrastructure &amp; Protocol
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#1d1d1f] sm:text-5xl">
              Isolated by design.
              <span className="block text-[#86868b]">
                Zero-markup AI with MCP.
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          {/* Bento Card 1: Visual DEV -> QA -> PROD Pipeline */}
          <Reveal delayMs={60} className="lg:col-span-6">
            <div className="flex h-full flex-col justify-between rounded-[28px] bg-[#f5f5f7] p-7 sm:p-9">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">
                  Three isolated environments per store.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6e6e73]">
                  Every store runs separated Dev, QA, and Production instances with
                  Magic Login, SSH/Git access, automated snapshots, and 1-click
                  production rollbacks.
                </p>

                {/* Visual Connected Pipeline Flow */}
                <div className="mt-6 flex items-center justify-between gap-2 rounded-2xl bg-white p-3 studio-shadow">
                  {ENVS.map((env, idx) => {
                    const isActive = selectedEnv === env.id;
                    const displayVersion =
                      env.id === "PROD" && rolledBack ? "v2.13.9" : env.release;
                    return (
                      <div key={env.id} className="flex flex-1 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedEnv(env.id)}
                          className={`apple-btn flex-1 rounded-xl px-3 py-2 text-left transition-all duration-300 ${
                            isActive
                              ? "bg-[#1d1d1f] text-white shadow-sm"
                              : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/10"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-semibold">
                              {env.id}
                            </span>
                            <span className="h-1.5 w-1.5 rounded-full bg-[#30d158]" />
                          </div>
                          <div
                            className={`mt-0.5 font-mono text-[10px] ${
                              isActive ? "text-[#a1a1a6]" : "text-[#6e6e73]"
                            }`}
                          >
                            {displayVersion}
                          </div>
                        </button>
                        {idx < ENVS.length - 1 && (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#86868b]" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div
                  key={`${envObj.id}-${rolledBack}`}
                  className="animate-panel-in mt-4 rounded-2xl bg-white p-5 studio-shadow"
                >
                  <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                    <span className="text-sm font-semibold text-[#1d1d1f]">
                      {envObj.title}
                    </span>
                    <span className="font-mono text-xs text-[#0071e3]">
                      {envObj.id === "PROD" && rolledBack
                        ? "v2.13.9 (restored in 1.2s)"
                        : envObj.release}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                    <div>
                      <div className="text-[#86868b]">Endpoint</div>
                      <div className="mt-0.5 truncate font-mono text-[#1d1d1f]">
                        {envObj.url}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#86868b]">Runtime &amp; Latency</div>
                      <div className="mt-0.5 font-mono text-[#1d1d1f]">
                        {envObj.latency} · #
                        {envObj.id === "PROD" && rolledBack
                          ? "3b19a12"
                          : envObj.commit}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[#6e6e73]">
                    {envObj.notes}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="font-mono text-[11px] text-[#6e6e73]">
                  {envObj.workers}
                </span>
                <button
                  type="button"
                  onClick={handleRollbackToggle}
                  className={`apple-btn inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium shadow-sm transition ${
                    rolledBack
                      ? "bg-[#1d1d1f] text-white hover:bg-black/85"
                      : "bg-white text-[#1d1d1f] hover:bg-black/5"
                  }`}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {rolledBack ? "Restore v2.14.0" : "Test 1-Click Rollback"}
                </button>
              </div>
            </div>
          </Reveal>

          {/* Bento Card 2: Bring Your Own Model (MCP) + RBAC */}
          <Reveal delayMs={140} className="lg:col-span-6">
            <div className="flex h-full flex-col justify-between rounded-[28px] bg-[#f5f5f7] p-7 sm:p-9">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">
                    Bring your own model via MCP.
                  </h3>
                  <Link
                    href="/docs"
                    className="inline-flex items-center gap-0.5 text-xs font-medium text-[#0071e3] hover:underline"
                  >
                    Open MCP Playground
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#6e6e73]">
                  Connect Claude, ChatGPT, or Gemini directly to your store
                  context with zero per-token markup, gated behind role-based
                  permissions.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
                  {/* Sliding Apple UISegmentedControl Pill */}
                  <div className="relative inline-grid grid-cols-3 rounded-full bg-black/[0.06] p-1">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-1 left-1 w-[calc((100%-8px)/3)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{
                        transform: `translateX(${Math.max(0, clientIdx) * 100}%)`,
                      }}
                    />
                    {MCP_CLIENTS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedClient(c.id)}
                        className={`relative z-10 w-20 rounded-full py-1.5 text-xs font-medium transition-colors duration-200 ${
                          selectedClient === c.id
                            ? "text-[#1d1d1f]"
                            : "text-[#6e6e73] hover:text-[#1d1d1f]"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="apple-btn inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-[#1d1d1f] shadow-sm transition hover:bg-black/5"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#30d158]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-[#6e6e73]" />
                        Copy Config
                      </>
                    )}
                  </button>
                </div>

                <div
                  key={clientObj.id}
                  className="animate-panel-in mt-4 overflow-hidden rounded-2xl bg-[#111113]"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2 font-mono text-[10px] text-[#86868b]">
                    <span>{clientObj.filename}</span>
                    <span>Zero Token Markup</span>
                  </div>
                  <pre className="code-scroll overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-[#d1d1d6]">
                    {clientObj.snippet}
                  </pre>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {RBAC_ROLES.map((item) => (
                  <div key={item.role} className="rounded-2xl bg-white p-3.5">
                    <div className="text-xs font-semibold text-[#1d1d1f]">
                      {item.role}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#6e6e73]">
                      {item.scope}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Security & Migration Guarantee Strip */}
        <Reveal delayMs={180}>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {SECURITY_GUARANTEES.map((g) => (
              <div
                key={g.title}
                className="apple-card rounded-2xl border border-black/[0.06] bg-white p-5 studio-shadow"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1d1d1f]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0071e3]" />
                  {g.title}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-[#6e6e73]">
                  {g.detail}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
