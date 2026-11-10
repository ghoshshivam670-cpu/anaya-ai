"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Play, RefreshCw, Terminal } from "lucide-react";
import type { McpToolSpec } from "@/lib/mcp/tools";

export function McpPlayground() {
  const [tools, setTools] = useState<McpToolSpec[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [selectedTool, setSelectedTool] = useState<string>("get_store_health");
  const [argsText, setArgsText] = useState<string>("{}");
  const [output, setOutput] = useState<string>("");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/mcp");
        if (!res.ok) return;
        const json = (await res.json()) as { tools: McpToolSpec[] };
        setTools(json.tools || []);
        if (json.tools?.[0]) {
          setSelectedTool(json.tools[0].name);
          setArgsText(JSON.stringify(json.tools[0].sampleArgs, null, 2));
        }
      } finally {
        setLoadingTools(false);
      }
    })();
  }, []);

  function handleSelectTool(name: string) {
    setSelectedTool(name);
    const spec = tools.find((t) => t.name === name);
    setArgsText(JSON.stringify(spec?.sampleArgs || {}, null, 2));
    setOutput("");
    setLatencyMs(null);
  }

  function handleCopyPayload() {
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(argsText || "{}") as Record<string, unknown>;
    } catch {
      parsed = {};
    }
    const payload = JSON.stringify(
      {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: selectedTool, arguments: parsed },
      },
      null,
      2
    );
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(payload);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 1800);
    }
  }

  async function handleExecute() {
    setRunning(true);
    const started = performance.now();
    try {
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(argsText || "{}") as Record<string, unknown>;
      } catch {
        setOutput(JSON.stringify({ error: "Invalid JSON arguments" }, null, 2));
        return;
      }

      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/call",
          params: { name: selectedTool, arguments: parsed },
        }),
      });
      const json = await res.json();
      setLatencyMs(Math.max(1, Math.round(performance.now() - started)));
      setOutput(JSON.stringify(json, null, 2));
    } finally {
      setRunning(false);
    }
  }

  const activeSpec = tools.find((t) => t.name === selectedTool);

  return (
    <div className="overflow-hidden rounded-[28px] bg-[#111113] text-white hardware-frame-shadow">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] bg-[#16161a] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <Terminal className="h-4 w-4 text-[#30d158]" />
          <h2 className="text-sm font-semibold text-white">
            Model Context Protocol (MCP) Playground
          </h2>
        </div>
        <span className="font-mono text-[11px] text-[#86868b]">
          JSON-RPC 2.0 · /api/mcp
        </span>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-12 sm:p-8">
        <div className="space-y-2 lg:col-span-5">
          {loadingTools ? (
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-[#09090b] p-4 text-xs text-[#86868b]">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Loading live MCP tool manifest...
            </div>
          ) : (
            tools.map((tool) => (
              <button
                key={tool.name}
                type="button"
                onClick={() => handleSelectTool(tool.name)}
                className={`w-full rounded-2xl border p-3.5 text-left transition ${
                  selectedTool === tool.name
                    ? "border-white/30 bg-white/[0.08]"
                    : "border-white/[0.06] bg-[#09090b] hover:border-white/15"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-white">
                    {tool.name}
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-[#d1d1d6]">
                    {tool.permissionRole}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-[#86868b]">
                  {tool.description}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="space-y-3 lg:col-span-7">
          {activeSpec && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#09090b] p-3.5 text-xs text-[#d1d1d6]">
              <span className="font-mono text-[#30d158]">{activeSpec.name}</span>:{" "}
              {activeSpec.description}
            </div>
          )}

          <div>
            <label className="block font-mono text-[11px] text-[#86868b]">
              JSON-RPC Arguments
            </label>
            <textarea
              rows={4}
              value={argsText}
              onChange={(e) => setArgsText(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-white/10 bg-[#09090b] p-3.5 font-mono text-xs text-white outline-none focus:border-[#2997ff]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={running}
                onClick={handleExecute}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {running ? "Calling /api/mcp..." : "Invoke MCP Tool"}
              </button>
              <button
                type="button"
                onClick={handleCopyPayload}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#2c2c30] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#3a3a3c]"
              >
                {copiedPayload ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#30d158]" />
                    Copied JSON-RPC
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#a1a1a6]" />
                    Copy JSON-RPC
                  </>
                )}
              </button>
            </div>

            {latencyMs !== null && (
              <span className="font-mono text-[11px] text-[#30d158]">
                200 OK · {latencyMs} ms
              </span>
            )}
          </div>

          {output && (
            <pre className="code-scroll animate-step-in max-h-80 overflow-auto rounded-2xl border border-white/[0.08] bg-[#09090b] p-4 font-mono text-[11px] leading-relaxed text-[#d1d1d6]">
              {output}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
