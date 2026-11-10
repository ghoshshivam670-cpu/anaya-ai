import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { McpPlayground } from "@/components/docs/McpPlayground";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/demo/state",
    desc: "Sandbox state, DEV/QA/PROD nodes & catalog SEO audit",
  },
  {
    method: "POST",
    path: "/api/demo/checkout",
    desc: "Simulated /?wc-ajax=checkout order & latency telemetry",
  },
  {
    method: "POST",
    path: "/api/demo/fault",
    desc: "Inject or clear checkout regressions (N+1, 401, Carrier)",
  },
  {
    method: "POST",
    path: "/api/woocommerce/test",
    desc: "Validate read-only WooCommerce REST v3 credentials",
  },
  {
    method: "POST",
    path: "/api/demo/builder",
    desc: "Stage plain-English diffs in QA & execute 1-click rollback",
  },
  {
    method: "POST",
    path: "/api/mcp",
    desc: "Model Context Protocol JSON-RPC 2.0 endpoint",
  },
] as const;

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-[#fbfbfd] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-wide text-[#6e6e73]">
              Developer &amp; Operator Reference
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#1d1d1f] sm:text-5xl">
              Architecture, WooCommerce Connector &amp; MCP.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-[#6e6e73]">
              Evaluate Anaya.ai locally with the Built-in Sandbox Store, validate
              any WooCommerce REST v3 endpoint, or connect Claude, ChatGPT, and
              Gemini directly via Model Context Protocol.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-[24px] bg-[#f5f5f7] p-6">
              <h2 className="text-sm font-semibold text-[#1d1d1f]">
                1. Isolated Dev, QA &amp; Prod
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#6e6e73]">
                Builder AI and Revenue AI stage patches in QA first. Synthetic
                checkout probes run before Owners promote to Production.
              </p>
            </div>

            <div className="rounded-[24px] bg-[#f5f5f7] p-6">
              <h2 className="text-sm font-semibold text-[#1d1d1f]">
                2. WooCommerce REST v3
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#6e6e73]">
                Generate a Read-only REST key in WooCommerce -&gt; Settings -&gt;
                REST API and test it live inside the{" "}
                <Link href="/demo" className="text-[#0071e3] hover:underline">
                  Sandbox
                </Link>
                .
              </p>
            </div>

            <div className="rounded-[24px] bg-[#f5f5f7] p-6">
              <h2 className="text-sm font-semibold text-[#1d1d1f]">
                3. RBAC &amp; Audit Trail
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#6e6e73]">
                Every staging patch, metadata repair, and Production rollback is
                role-gated (`Owner`, `Admin`, `Editor`, `Viewer`) and recorded.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <McpPlayground />
          </div>

          <div className="mt-10 rounded-[28px] bg-[#f5f5f7] p-7">
            <h2 className="text-sm font-semibold text-[#1d1d1f]">
              Workspace API Endpoints
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {ENDPOINTS.map((ep) => (
                <div
                  key={ep.path}
                  className="flex items-start justify-between gap-3 rounded-2xl bg-white p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                          ep.method === "GET"
                            ? "bg-[#30d158]/15 text-[#1c7c35]"
                            : "bg-[#0071e3]/12 text-[#0071e3]"
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs font-medium text-[#1d1d1f]">
                        {ep.path}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-[#6e6e73]">{ep.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
