"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bug,
  Check,
  CheckCircle2,
  GitBranch,
  Lock,
  Minus,
  PlugZap,
  Plus,
  RefreshCw,
  RotateCcw,
  SearchCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import type { ApmSpan } from "@/lib/agents";
import { CodeDiffView } from "@/components/ui/CodeDiffView";

interface StoreConfig {
  id: string;
  storeName: string;
  mode: string;
  wooUrl: string;
  wooConnected: boolean;
  wooVersion: string;
  activeFault: string;
  shippingBannerEnabled: boolean;
  freeShippingThreshold: number;
  checkoutBannerText: string;
  promoDiscountPercent: number;
  redisObjectCache: boolean;
  hposEnabled: boolean;
  autoScalingActive: boolean;
}

interface EnvironmentNode {
  id: string;
  name: string;
  url: string;
  versionTag: string;
  commitSha: string;
  phpRuntime: string;
  workerPool: string;
  p95LatencyMs: number;
  uptimePercent: string;
  status: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  priceCents: number;
  stock: number;
  accentColor: string;
  shortDesc: string;
  description: string;
  altText: string;
  seoScore: number;
}

interface DemoOrder {
  id: string;
  orderNumber: string;
  customerEmail: string;
  itemsSummary: string;
  totalCents: number;
  status: string;
  checkoutMs: number;
  environment: string;
  createdAt: string;
}

interface RevenueIncident {
  id: string;
  title: string;
  faultType: string;
  severity: string;
  revenueAtRiskPerHr: number;
  affectedEndpoint: string;
  p99LatencyMs: number;
  traceJson: string;
  diffPatch: string;
  status: string;
  createdAt: string;
}

interface BuilderPatch {
  id: string;
  prompt: string;
  summary: string;
  targetEnv: string;
  diffText: string;
  smokeTestStatus: string;
  status: string;
  createdAt: string;
}

interface AuditEvent {
  id: string;
  actor: string;
  role: string;
  action: string;
  environment: string;
  detail: string;
  createdAt: string;
}

interface CatalogFinding {
  id: string;
  sku: string;
  name: string;
  category: string;
  seoScore: number;
  issues: string[];
}

interface DemoStatePayload {
  storeConfig: StoreConfig;
  environments: EnvironmentNode[];
  products: Product[];
  orders: DemoOrder[];
  incidents: RevenueIncident[];
  patches: BuilderPatch[];
  audits: AuditEvent[];
  catalogFindings: CatalogFinding[];
}

type ConsoleTab = "revenue" | "builder" | "analytics" | "infra";
type RbacRole = "Owner" | "Admin" | "Editor" | "Viewer";

function ProductPackagingGlyph({
  sku,
  color,
}: {
  sku: string;
  color: string;
}) {
  const renderShape = () => {
    if (sku.includes("CLN")) {
      // Cleanser pump bottle
      return (
        <>
          <path
            d="M11 4h6M14 4v3"
            stroke={color}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <rect
            x="8"
            y="8"
            width="12"
            height="16"
            rx="3.5"
            fill={color}
            opacity="0.2"
            stroke={color}
            strokeWidth="1.6"
          />
        </>
      );
    }
    if (sku.includes("CRM")) {
      // Skincare night cream jar
      return (
        <>
          <rect
            x="6.5"
            y="9"
            width="15"
            height="3.5"
            rx="1.5"
            fill={color}
            opacity="0.85"
          />
          <rect
            x="6"
            y="13"
            width="16"
            height="10"
            rx="4"
            fill={color}
            opacity="0.22"
            stroke={color}
            strokeWidth="1.6"
          />
        </>
      );
    }
    if (sku.includes("SPF")) {
      // Slender mineral fluid tube
      return (
        <>
          <path
            d="M9 5h10l-1.5 14h-7L9 5z"
            fill={color}
            opacity="0.22"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <rect
            x="11"
            y="20"
            width="6"
            height="3.5"
            rx="1"
            fill={color}
            opacity="0.85"
          />
        </>
      );
    }
    if (sku.includes("MST")) {
      // Botanical fine-mist atomizer
      return (
        <>
          <rect
            x="11.5"
            y="4"
            width="5"
            height="4"
            rx="1.2"
            fill={color}
            opacity="0.85"
          />
          <rect
            x="9"
            y="9"
            width="10"
            height="15"
            rx="5"
            fill={color}
            opacity="0.22"
            stroke={color}
            strokeWidth="1.6"
          />
        </>
      );
    }
    if (sku.includes("KIT")) {
      // Complete Ritual Kit studio box
      return (
        <>
          <rect
            x="5.5"
            y="7"
            width="17"
            height="16"
            rx="3"
            fill={color}
            opacity="0.22"
            stroke={color}
            strokeWidth="1.6"
          />
          <line
            x1="14"
            y1="7"
            x2="14"
            y2="23"
            stroke={color}
            strokeWidth="1.3"
          />
          <line
            x1="5.5"
            y1="12.5"
            x2="22.5"
            y2="12.5"
            stroke={color}
            strokeWidth="1.3"
          />
        </>
      );
    }
    // Serum dropper bottle default
    return (
      <>
        <path
          d="M12.5 3.5h3v3.5h-3z"
          fill={color}
          opacity="0.85"
        />
        <rect
          x="10.5"
          y="7"
          width="7"
          height="2.5"
          rx="1"
          fill={color}
          opacity="0.65"
        />
        <rect
          x="8.5"
          y="10"
          width="11"
          height="14"
          rx="3.5"
          fill={color}
          opacity="0.22"
          stroke={color}
          strokeWidth="1.6"
        />
      </>
    );
  };

  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-black/[0.06]"
      style={{ backgroundColor: `${color}14` }}
    >
      <svg
        viewBox="0 0 28 28"
        className="h-6 w-6"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {renderShape()}
      </svg>
    </div>
  );
}

export function DemoWorkbench() {
  const [data, setData] = useState<DemoStatePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyMsg, setBusyMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ConsoleTab>("revenue");
  const [role, setRole] = useState<RbacRole>("Owner");
  const [addedSkuId, setAddedSkuId] = useState<string | null>(null);

  const [cart, setCart] = useState<Record<string, number>>({});
  const [customerEmail, setCustomerEmail] = useState(
    "alex.merchant@anayabotanics.com"
  );
  const [checkoutBanner, setCheckoutBanner] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const [builderPrompt, setBuilderPrompt] = useState(
    "Lower free shipping threshold to $50 and show VIP banner"
  );

  const [wooModalOpen, setWooModalOpen] = useState(false);
  const [wooUrl, setWooUrl] = useState("");
  const [wooKey, setWooKey] = useState("");
  const [wooSecret, setWooSecret] = useState("");
  const [wooTestFeedback, setWooTestFeedback] = useState<{
    ok: boolean;
    message: string;
    productsCount?: number;
  } | null>(null);

  const loadState = useCallback(async () => {
    try {
      const res = await fetch("/api/demo/state", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load sandbox state");
      const json = (await res.json()) as DemoStatePayload;
      setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  const cartLines = useMemo(() => {
    if (!data) return [];
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([productId, qty]) => {
        const product = data.products.find((p) => p.id === productId);
        return product ? { product, qty } : null;
      })
      .filter((x): x is { product: Product; qty: number } => Boolean(x));
  }, [cart, data]);

  const subtotalCents = useMemo(
    () =>
      cartLines.reduce(
        (acc, line) => acc + line.product.priceCents * line.qty,
        0
      ),
    [cartLines]
  );

  const canDeployProd = role === "Owner";
  const canEditStage = role === "Owner" || role === "Admin" || role === "Editor";

  function handleAddToBag(productId: string) {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
    setAddedSkuId(productId);
    setTimeout(() => {
      setAddedSkuId((current) => (current === productId ? null : current));
    }, 800);
  }

  async function runAction(label: string, fn: () => Promise<void>) {
    setBusyMsg(label);
    try {
      await fn();
      await loadState();
    } finally {
      setBusyMsg(null);
    }
  }

  async function handleInjectFault(
    fault: "NONE" | "N_PLUS_1" | "PAYMENT_WEBHOOK" | "SHIPPING_API"
  ) {
    await runAction(
      fault === "NONE" ? "Clearing faults..." : `Injecting ${fault}...`,
      async () => {
        await fetch("/api/demo/fault", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fault }),
        });
        if (fault !== "NONE") setActiveTab("revenue");
      }
    );
  }

  async function handleCheckout() {
    if (cartLines.length === 0) return;
    await runAction("Executing POST /?wc-ajax=checkout...", async () => {
      const res = await fetch("/api/demo/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail,
          items: cartLines.map((l) => ({
            productId: l.product.id,
            quantity: l.qty,
          })),
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        order?: DemoOrder;
        telemetry?: { checkoutMs: number; failureReason?: string | null };
        error?: string;
      };
      if (json.ok && json.order) {
        setCart({});
        setCheckoutBanner({
          ok: true,
          message: `Order ${json.order.orderNumber} completed in ${json.telemetry?.checkoutMs}ms via /?wc-ajax=checkout`,
        });
      } else {
        setCheckoutBanner({
          ok: false,
          message:
            json.telemetry?.failureReason ||
            json.error ||
            "Checkout failed due to active fault.",
        });
      }
    });
  }

  async function handleLoadBurst() {
    if (!data || data.products.length === 0) return;
    await runAction("Simulating 5 concurrent checkouts...", async () => {
      const targetProducts = data.products.slice(0, 5);
      await Promise.all(
        targetProducts.map((p, idx) =>
          fetch("/api/demo/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerEmail: `burst.${idx + 1}@anayabotanics.com`,
              items: [{ productId: p.id, quantity: 1 }],
            }),
          })
        )
      );
      setCheckoutBanner({
        ok: data.storeConfig.activeFault !== "PAYMENT_WEBHOOK",
        message:
          data.storeConfig.activeFault === "NONE"
            ? "5 concurrent checkouts completed sub-second (~310ms) with 0 failures."
            : `5 burst checkouts ran under ${data.storeConfig.activeFault} — inspect Revenue AI & Analytics AI.`,
      });
    });
  }

  async function handleIncidentFix(id: string, stage: "qa" | "prod") {
    if (stage === "prod" && !canDeployProd) return;
    await runAction(
      stage === "qa"
        ? "Staging Revenue AI fix in QA..."
        : "Deploying fix to PROD...",
      async () => {
        await fetch(`/api/demo/incidents/${id}/fix`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage }),
        });
      }
    );
  }

  async function handleBuilderGenerate() {
    if (!canEditStage || !builderPrompt.trim()) return;
    await runAction(
      "Builder AI drafting diff & running QA smoke tests...",
      async () => {
        await fetch("/api/demo/builder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "generate", prompt: builderPrompt }),
        });
      }
    );
  }

  async function handleBuilderDeploy(
    patchId: string,
    action: "deploy" | "rollback"
  ) {
    if (!canDeployProd) return;
    await runAction(
      action === "deploy"
        ? "Promoting Builder AI patch to PROD..."
        : "Rolling back Production release...",
      async () => {
        await fetch("/api/demo/builder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, patchId }),
        });
      }
    );
  }

  async function handleEnvAction(
    action: "promote_dev_to_qa" | "promote_qa_to_prod" | "rollback_prod"
  ) {
    await runAction("Updating environment pipeline...", async () => {
      await fetch("/api/demo/environments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
    });
  }

  async function handleCatalogFix(productId: string) {
    if (!canEditStage) return;
    await runAction("Applying Catalog & SEO AI fix...", async () => {
      await fetch("/api/demo/catalog-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
    });
  }

  async function handleTestWoo() {
    setWooTestFeedback(null);
    setBusyMsg("Testing WooCommerce REST v3 endpoint...");
    try {
      const res = await fetch("/api/woocommerce/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          url: wooUrl,
          consumerKey: wooKey,
          consumerSecret: wooSecret,
        }),
      });
      const json = (await res.json()) as {
        connected: boolean;
        message: string;
        productsSample?: unknown[];
      };
      setWooTestFeedback({
        ok: json.connected,
        message: json.message,
        productsCount: json.productsSample?.length,
      });
      if (json.connected) {
        await loadState();
      }
    } finally {
      setBusyMsg(null);
    }
  }

  async function handleResetSandbox() {
    await runAction("Switching back to built-in sandbox...", async () => {
      await fetch("/api/woocommerce/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_sandbox" }),
      });
      setWooTestFeedback(null);
    });
  }

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[28px] bg-white p-14 text-center studio-shadow">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#1d1d1f]" />
          <p className="mt-3 text-sm font-medium text-[#6e6e73]">
            Preparing Anaya.ai Sandbox &amp; WooCommerce Telemetry...
          </p>
        </div>
      </div>
    );
  }

  const {
    storeConfig,
    environments,
    products,
    orders,
    incidents,
    patches,
    audits,
    catalogFindings,
  } = data;

  const discountCents =
    storeConfig.promoDiscountPercent > 0
      ? Math.round(subtotalCents * (storeConfig.promoDiscountPercent / 100))
      : 0;
  const afterDiscount = subtotalCents - discountCents;
  const thresholdCents = storeConfig.freeShippingThreshold * 100;
  const remainingForFreeShipping = Math.max(0, thresholdCents - afterDiscount);
  const freeShippingProgressPct =
    thresholdCents > 0
      ? Math.min(100, Math.round((afterDiscount / thresholdCents) * 100))
      : 100;
  const prodEnv = environments.find((e) => e.id === "PROD");

  const completedOrders = orders.filter((o) => o.status === "completed");
  const failedOrders = orders.filter((o) => o.status !== "completed");
  const grossRevenueUsd =
    completedOrders.reduce((acc, o) => acc + o.totalCents, 0) / 100;
  const avgCheckoutMs =
    orders.length > 0
      ? Math.round(
          orders.reduce((acc, o) => acc + o.checkoutMs, 0) / orders.length
        )
      : 312;

  const recentOrdersForChart = orders.slice(0, 10).reverse();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Studio Header Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-[24px] bg-white px-5 py-4 studio-shadow lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                storeConfig.activeFault === "NONE"
                  ? "bg-[#30d158]"
                  : "bg-[#ff3b30] animate-ping"
              }`}
            />
            <span className="text-sm font-semibold tracking-tight text-[#1d1d1f]">
              {storeConfig.storeName}
            </span>
          </div>
          <span className="rounded-full bg-[#f5f5f7] px-3 py-1 font-mono text-[11px] text-[#6e6e73]">
            {storeConfig.wooVersion}
          </span>
          {prodEnv && (
            <span
              className={`rounded-full px-3 py-1 font-mono text-[11px] ${
                prodEnv.status === "degraded"
                  ? "bg-[#ff3b30]/10 text-[#ff3b30]"
                  : "bg-[#30d158]/15 text-[#1c7c35]"
              }`}
            >
              PROD p95: {prodEnv.p95LatencyMs} ms
            </span>
          )}
          {/* Live mini checkout latency sparkline */}
          {recentOrdersForChart.length > 1 && (
            <div
              className="hidden items-end gap-0.5 rounded-full bg-[#f5f5f7] px-2.5 py-1.5 sm:flex"
              title="Recent /?wc-ajax=checkout latencies"
            >
              {recentOrdersForChart.map((ord) => (
                <span
                  key={ord.id}
                  className={`w-1 rounded-full ${
                    ord.checkoutMs > 800 || ord.status !== "completed"
                      ? "bg-[#ff3b30]"
                      : "bg-[#30d158]"
                  }`}
                  style={{
                    height: `${Math.max(5, Math.min(18, Math.round((ord.checkoutMs / 3200) * 18)))}px`,
                  }}
                />
              ))}
            </div>
          )}
          {busyMsg && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0071e3]">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              {busyMsg}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full bg-[#f5f5f7] px-3 py-1.5">
            <Lock className="h-3.5 w-3.5 text-[#6e6e73]" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as RbacRole)}
              className="bg-transparent text-xs font-medium text-[#1d1d1f] outline-none"
              aria-label="RBAC Persona Role"
            >
              <option value="Owner">Owner (Full Prod)</option>
              <option value="Admin">Admin (DEV/QA)</option>
              <option value="Editor">Editor (Stage Only)</option>
              <option value="Viewer">Viewer (Read Only)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setWooModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-black/80"
          >
            <PlugZap className="h-3.5 w-3.5" />
            {storeConfig.wooConnected ? "WooCommerce Connected" : "Connect WooCommerce"}
          </button>
        </div>
      </div>

      {/* Subtle RBAC feedback bar when downgraded */}
      {role !== "Owner" && (
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/80 px-4 py-2 text-xs text-[#6e6e73] studio-shadow">
          <span>
            Active RBAC Persona:{" "}
            <strong className="text-[#1d1d1f]">{role}</strong> —{" "}
            {role === "Viewer"
              ? "Staging & Production deploy controls are read-only."
              : "Production deploys & rollbacks require Owner approval."}
          </span>
          <button
            type="button"
            onClick={() => setRole("Owner")}
            className="font-medium text-[#0071e3] hover:underline"
          >
            Switch to Owner
          </button>
        </div>
      )}

      {/* Main Split Studio */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* LEFT: Clean Luxury D2C Sandbox Storefront + Fault Injector */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-[28px] bg-white p-6 studio-shadow">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3.5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[#1d1d1f]" />
                <h2 className="text-sm font-semibold text-[#1d1d1f]">
                  Anaya Botanics Storefront
                </h2>
              </div>
              <button
                type="button"
                onClick={handleLoadBurst}
                className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[11px] font-medium text-[#1d1d1f] transition hover:bg-black/10"
              >
                <Zap className="h-3 w-3 text-[#0071e3]" />
                Burst 5 Orders
              </button>
            </div>

            {storeConfig.shippingBannerEnabled && (
              <div className="mt-4 rounded-2xl bg-[#f5f5f7] px-4 py-2.5 text-xs text-[#1d1d1f]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">
                    {storeConfig.checkoutBannerText}
                  </span>
                  {storeConfig.promoDiscountPercent > 0 && (
                    <span className="rounded-full bg-[#1d1d1f] px-2 py-0.5 font-mono text-[10px] font-medium text-white">
                      -{storeConfig.promoDiscountPercent}%
                    </span>
                  )}
                </div>
                {subtotalCents > 0 && (
                  <>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                      <div
                        className="h-full rounded-full bg-[#30d158] transition-all duration-300"
                        style={{ width: `${freeShippingProgressPct}%` }}
                      />
                    </div>
                    <p className="mt-1.5 font-mono text-[11px] text-[#6e6e73]">
                      {remainingForFreeShipping === 0
                        ? "Unlocked: Free express shipping"
                        : `Add $${(remainingForFreeShipping / 100).toFixed(2)} more for free shipping`}
                    </p>
                  </>
                )}
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {products.map((product) => {
                const justAdded = addedSkuId === product.id;
                return (
                  <div
                    key={product.id}
                    className="apple-card flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-[#fbfbfd] p-3.5 hover:border-black/15"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2.5">
                        <ProductPackagingGlyph
                          sku={product.sku}
                          color={product.accentColor}
                        />
                        <div className="text-right">
                          <span className="block font-mono text-[10px] text-[#86868b]">
                            {product.sku}
                          </span>
                          <span className="mt-0.5 inline-block text-[10px] font-medium text-[#6e6e73]">
                            {product.category}
                          </span>
                        </div>
                      </div>
                      <h3 className="mt-2.5 text-xs font-semibold text-[#1d1d1f]">
                        {product.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[11px] text-[#6e6e73]">
                        {product.shortDesc}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#1d1d1f] tabular-nums">
                        ${(product.priceCents / 100).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddToBag(product.id)}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium transition ${
                          justAdded
                            ? "bg-[#30d158] text-black"
                            : "bg-[#1d1d1f] text-white hover:bg-black/80"
                        }`}
                      >
                        {justAdded && <Check className="h-3 w-3" />}
                        {justAdded ? "Added" : "Add"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart & Checkout */}
            <div className="mt-5 rounded-2xl bg-[#f5f5f7] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1d1d1f]">
                  Bag ({cartLines.reduce((a, b) => a + b.qty, 0)})
                </span>
                {cartLines.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCart({})}
                    className="inline-flex items-center gap-1 text-[11px] text-[#6e6e73] hover:text-[#ff3b30]"
                  >
                    <Trash2 className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>

              {cartLines.length === 0 ? (
                <p className="mt-2 text-xs text-[#6e6e73]">
                  Add a product above or click &ldquo;Burst 5 Orders&rdquo; to
                  stream{" "}
                  <span className="font-mono text-[#1d1d1f]">
                    /?wc-ajax=checkout
                  </span>{" "}
                  telemetry.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {cartLines.map(({ product, qty }) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-2 text-xs text-[#1d1d1f]"
                    >
                      <span className="truncate pr-1">{product.name}</span>
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="inline-flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              setCart((prev) => ({
                                ...prev,
                                [product.id]: Math.max(0, (prev[product.id] || 1) - 1),
                              }))
                            }
                            className="p-0.5 text-[#6e6e73] hover:text-[#1d1d1f]"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-mono text-[11px]">{qty}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setCart((prev) => ({
                                ...prev,
                                [product.id]: (prev[product.id] || 0) + 1,
                              }))
                            }
                            className="p-0.5 text-[#6e6e73] hover:text-[#1d1d1f]"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="w-14 text-right font-mono tabular-nums">
                          ${((product.priceCents * qty) / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-black/[0.08] pt-2 text-xs">
                    <div className="flex justify-between text-[#6e6e73]">
                      <span>Subtotal</span>
                      <span className="font-mono">
                        ${(subtotalCents / 100).toFixed(2)}
                      </span>
                    </div>
                    {discountCents > 0 && (
                      <div className="flex justify-between text-[#1c7c35]">
                        <span>
                          Builder Promo ({storeConfig.promoDiscountPercent}%)
                        </span>
                        <span className="font-mono">
                          -${(discountCents / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#6e6e73]">
                      <span>Shipping</span>
                      <span className="font-mono">
                        {remainingForFreeShipping === 0 ? "Free" : "$9.00"}
                      </span>
                    </div>
                  </div>

                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs text-[#1d1d1f] outline-none focus:border-[#0071e3]"
                    placeholder="shopper@example.com"
                  />

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#0071e3] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#0077ed]"
                  >
                    Execute /?wc-ajax=checkout
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {checkoutBanner && (
                <div
                  className={`mt-3 rounded-xl px-3 py-2 font-mono text-[11px] ${
                    checkoutBanner.ok
                      ? "bg-[#30d158]/15 text-[#1c7c35]"
                      : "bg-[#ff3b30]/15 text-[#c92a22]"
                  }`}
                >
                  {checkoutBanner.message}
                </div>
              )}
            </div>
          </div>

          {/* Fault Injector */}
          <div className="rounded-[28px] bg-white p-6 studio-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4 text-[#ff3b30]" />
                <h2 className="text-sm font-semibold text-[#1d1d1f]">
                  Fault Injector
                </h2>
              </div>
              <span className="font-mono text-[11px] text-[#6e6e73]">
                {storeConfig.activeFault}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-[#6e6e73]">
              Inject a realistic WooCommerce regression and watch Revenue AI trace
              and patch it.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {(
                [
                  ["N_PLUS_1", "N+1 SQL Query", "+2.4s checkout stall"],
                  ["PAYMENT_WEBHOOK", "Webhook 401", "Fails order confirm"],
                  ["SHIPPING_API", "Carrier Timeout", "3.4s cart delay"],
                  ["NONE", "Clear Faults", "Restore 312ms SLA"],
                ] as const
              ).map(([code, title, sub]) => {
                const active = storeConfig.activeFault === code && code !== "NONE";
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleInjectFault(code)}
                    className={`rounded-2xl border p-3 text-left text-xs transition ${
                      code === "NONE"
                        ? "border-black/[0.06] bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/10"
                        : active
                        ? "border-[#ff3b30] bg-[#ff3b30]/10 text-[#1d1d1f]"
                        : "border-black/[0.06] bg-[#fbfbfd] text-[#1d1d1f] hover:border-black/20"
                    }`}
                  >
                    <div className="font-semibold">{title}</div>
                    <div className="mt-0.5 text-[10px] text-[#6e6e73]">{sub}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: macOS Pro Control Plane */}
        <div className="space-y-6 lg:col-span-7">
          <div className="overflow-hidden rounded-[28px] bg-[#111113] text-white hardware-frame-shadow">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#16161a] px-5 py-3.5">
              <div className="inline-flex flex-wrap gap-1 rounded-full bg-black/50 p-1">
                {[
                  {
                    id: "revenue",
                    label: "Revenue AI",
                    count: incidents.filter((i) => i.status !== "resolved").length,
                  },
                  {
                    id: "builder",
                    label: "Builder AI",
                    count: patches.filter((p) => p.status === "staged_qa").length,
                  },
                  {
                    id: "analytics",
                    label: "Analytics AI",
                    count: orders.length,
                  },
                  {
                    id: "infra",
                    label: "Envs & SEO",
                    count: catalogFindings.length,
                  },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as ConsoleTab)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                      activeTab === t.id
                        ? "bg-[#3a3a3c] text-white"
                        : "text-[#98989d] hover:text-white"
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className="font-mono text-[10px] opacity-75">
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#86868b]">
                {storeConfig.hposEnabled && (
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[#30d158]">
                    HPOS On
                  </span>
                )}
                {storeConfig.redisObjectCache && (
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[#d1d1d6]">
                    Redis 7
                  </span>
                )}
                {storeConfig.autoScalingActive && (
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[#64d2ff]">
                    16× Scale
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              {/* TAB 1: REVENUE AI */}
              {activeTab === "revenue" && (
                <div className="animate-panel-in space-y-4">
                  <div className="border-b border-white/[0.08] pb-3">
                    <h2 className="text-sm font-semibold text-white">
                      Revenue AI — 24/7 Checkout Guard &amp; APM
                    </h2>
                    <p className="mt-0.5 text-xs text-[#86868b]">
                      Live SQLite incidents with time-offset span waterfalls and
                      PR diffs.
                    </p>
                  </div>

                  {incidents.slice(0, 3).map((inc) => {
                    const traces = JSON.parse(inc.traceJson || "[]") as ApmSpan[];
                    const isOpen = inc.status !== "resolved";
                    const failingSpan = traces.find((s) => s.status !== "ok");
                    return (
                      <div
                        key={inc.id}
                        className="rounded-2xl border border-white/[0.08] bg-[#09090b] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isOpen ? "bg-[#ff453a]" : "bg-[#30d158]"
                              }`}
                            />
                            <span className="text-xs font-semibold text-white">
                              {inc.title}
                            </span>
                          </div>
                          <span
                            className={`font-mono text-xs ${
                              isOpen ? "text-[#ff453a]" : "text-[#30d158]"
                            }`}
                          >
                            {isOpen
                              ? `$${inc.revenueAtRiskPerHr}/hr at risk`
                              : "Resolved"}
                          </span>
                        </div>

                        <div className="mt-1.5 font-mono text-[11px] text-[#86868b]">
                          {inc.affectedEndpoint} · p99 {inc.p99LatencyMs}ms ·{" "}
                          {inc.status}
                        </div>

                        {traces.length > 0 && isOpen && (
                          <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
                            {traces.map((s) => {
                              const leftPct = Math.min(
                                86,
                                Math.round((s.startMs / inc.p99LatencyMs) * 100)
                              );
                              const widthPct = Math.max(
                                6,
                                Math.min(
                                  100 - leftPct,
                                  Math.round(
                                    (s.durationMs / inc.p99LatencyMs) * 100
                                  )
                                )
                              );
                              return (
                                <div key={s.name} className="text-[11px]">
                                  <div className="flex justify-between">
                                    <span className="text-[#d1d1d6]">
                                      {s.name}
                                    </span>
                                    <span className="font-mono text-[#86868b]">
                                      {s.durationMs}ms
                                    </span>
                                  </div>
                                  <div className="relative mt-1 h-1.5 w-full rounded-full bg-white/[0.06]">
                                    <div
                                      className={`absolute top-0 h-full rounded-full ${
                                        s.status === "ok"
                                          ? "bg-[#30d158]"
                                          : s.status === "error"
                                          ? "bg-[#ff453a]"
                                          : "bg-[#ffd60a]"
                                      }`}
                                      style={{
                                        left: `${leftPct}%`,
                                        width: `${widthPct}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                            {failingSpan && (
                              <div className="rounded-xl bg-[#ff453a]/10 px-3 py-2 font-mono text-[10.5px] text-[#ff6961]">
                                Root cause [{failingSpan.layer.toUpperCase()}]:{" "}
                                {failingSpan.detail}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-3 rounded-xl bg-black/70 p-2.5">
                          <CodeDiffView diff={inc.diffPatch} compact />
                        </div>

                        {isOpen && (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              disabled={!canEditStage}
                              onClick={() => handleIncidentFix(inc.id, "qa")}
                              className="rounded-full bg-[#2c2c30] px-3.5 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                            >
                              Stage in QA
                            </button>
                            <button
                              type="button"
                              disabled={!canDeployProd}
                              onClick={() => handleIncidentFix(inc.id, "prod")}
                              className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
                            >
                              {canDeployProd
                                ? "Deploy Fix to PROD"
                                : "Owner Role Required"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: BUILDER AI */}
              {activeTab === "builder" && (
                <div className="animate-panel-in space-y-4">
                  <div className="border-b border-white/[0.08] pb-3">
                    <h2 className="text-sm font-semibold text-white">
                      Builder AI — Plain-English Store Releases
                    </h2>
                    <p className="mt-0.5 text-xs text-[#86868b]">
                      Promote staged patches to update the live Storefront on the
                      left.
                    </p>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-[#09090b] p-4">
                    <textarea
                      rows={2}
                      value={builderPrompt}
                      onChange={(e) => setBuilderPrompt(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/60 p-3 text-xs text-white outline-none focus:border-[#2997ff]"
                      placeholder="e.g. Set free shipping threshold to $50 or activate 20% discount"
                    />
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Lower free shipping threshold to $50",
                        "Activate 15% VIP checkout discount",
                        "Hide shipping banner",
                      ].map((ex) => (
                        <button
                          key={ex}
                          type="button"
                          onClick={() => setBuilderPrompt(ex)}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-[#d1d1d6] hover:text-white"
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={!canEditStage}
                      onClick={handleBuilderGenerate}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black disabled:opacity-40"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Stage Diff in QA
                    </button>
                  </div>

                  <div className="space-y-3">
                    {patches.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        className="rounded-2xl border border-white/[0.08] bg-[#09090b] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white">
                            {p.summary}
                          </span>
                          <span className="font-mono text-[10px] text-[#86868b]">
                            {p.status} · {p.targetEnv}
                          </span>
                        </div>
                        <div className="mt-2 rounded-xl bg-black/70 p-2.5">
                          <CodeDiffView diff={p.diffText} compact />
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {p.status === "staged_qa" && (
                            <button
                              type="button"
                              disabled={!canDeployProd}
                              onClick={() => handleBuilderDeploy(p.id, "deploy")}
                              className="rounded-full bg-[#30d158] px-3.5 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
                            >
                              {canDeployProd
                                ? "Promote to PROD"
                                : "Owner Role Required"}
                            </button>
                          )}
                          {p.status === "deployed" && (
                            <button
                              type="button"
                              disabled={!canDeployProd}
                              onClick={() =>
                                handleBuilderDeploy(p.id, "rollback")
                              }
                              className="inline-flex items-center gap-1 rounded-full bg-[#2c2c30] px-3.5 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                            >
                              <RotateCcw className="h-3 w-3" />
                              1-Click Rollback
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ANALYTICS AI */}
              {activeTab === "analytics" && (
                <div className="animate-panel-in space-y-4">
                  <div className="border-b border-white/[0.08] pb-3">
                    <h2 className="text-sm font-semibold text-white">
                      Analytics AI — Live Order &amp; Latency Telemetry
                    </h2>
                    <p className="mt-0.5 text-xs text-[#86868b]">
                      Aggregated directly from persisted DemoOrder rows in SQLite.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl bg-[#09090b] p-3.5">
                      <div className="text-[11px] text-[#86868b]">Revenue</div>
                      <div className="mt-1 font-mono text-lg font-semibold text-[#30d158] tabular-nums">
                        ${grossRevenueUsd.toFixed(2)}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#09090b] p-3.5">
                      <div className="text-[11px] text-[#86868b]">Avg Checkout</div>
                      <div className="mt-1 font-mono text-lg font-semibold text-white tabular-nums">
                        {avgCheckoutMs}ms
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#09090b] p-3.5">
                      <div className="text-[11px] text-[#86868b]">Completed</div>
                      <div className="mt-1 font-mono text-lg font-semibold text-white tabular-nums">
                        {completedOrders.length}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#09090b] p-3.5">
                      <div className="text-[11px] text-[#86868b]">Failed</div>
                      <div className="mt-1 font-mono text-lg font-semibold text-[#ff453a] tabular-nums">
                        {failedOrders.length}
                      </div>
                    </div>
                  </div>

                  {/* Live SQLite Checkout Latency SVG Chart */}
                  {recentOrdersForChart.length > 0 && (
                    <div className="rounded-2xl border border-white/[0.06] bg-[#09090b] p-4">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-white">
                          Recent Checkouts Latency (`/?wc-ajax=checkout`)
                        </span>
                        <span className="font-mono text-[#6e6e73]">
                          Target SLA &lt; 400ms
                        </span>
                      </div>
                      <svg
                        viewBox="0 0 520 115"
                        className="mt-3 h-28 w-full overflow-visible"
                        role="img"
                        aria-label="Live checkout latency bars from SQLite order telemetry"
                      >
                        <line
                          x1="0"
                          y1="82"
                          x2="520"
                          y2="82"
                          stroke="rgba(255,255,255,0.08)"
                          strokeDasharray="3 3"
                        />
                        {recentOrdersForChart.map((ord, idx) => {
                          const slotW = 520 / recentOrdersForChart.length;
                          const cx = slotW * idx + slotW / 2;
                          const barH = Math.max(
                            8,
                            Math.min(72, Math.round((ord.checkoutMs / 3400) * 72))
                          );
                          const isBad =
                            ord.checkoutMs > 800 || ord.status !== "completed";
                          return (
                            <g key={ord.id}>
                              <rect
                                x={cx - 12}
                                y={88 - barH}
                                width="24"
                                height={barH}
                                rx="4"
                                fill={isBad ? "#ff453a" : "#30d158"}
                                opacity={isBad ? "0.8" : "0.75"}
                                style={{
                                  transition:
                                    "all 480ms cubic-bezier(0.22, 1, 0.36, 1)",
                                }}
                              />
                              <text
                                x={cx}
                                y={88 - barH - 5}
                                textAnchor="middle"
                                fill={isBad ? "#ff6961" : "#a1a1a6"}
                                fontSize="9"
                                fontFamily="monospace"
                              >
                                {ord.checkoutMs}ms
                              </text>
                              <text
                                x={cx}
                                y="104"
                                textAnchor="middle"
                                fill="#6e6e73"
                                fontSize="8.5"
                                fontFamily="monospace"
                              >
                                {ord.orderNumber.replace("WC-", "#")}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  )}

                  <div className="rounded-2xl bg-[#09090b] p-4 text-xs text-[#d1d1d6]">
                    <div className="flex items-center gap-2 font-medium text-white">
                      <Activity className="h-3.5 w-3.5 text-[#30d158]" />
                      Operational Takeaway
                    </div>
                    <p className="mt-1.5 text-[#a1a1a6]">
                      {failedOrders.length > 0
                        ? `${failedOrders.length} failed checkout attempt(s) logged. Apply Revenue AI's PR in the Revenue AI tab to restore conversion.`
                        : `All ${completedOrders.length} recent checkout transactions completed in an average of ${avgCheckoutMs}ms.`}
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-white/[0.08] bg-[#09090b] font-mono text-[11px] text-[#86868b]">
                        <tr>
                          <th className="px-3 py-2.5">Order</th>
                          <th className="px-3 py-2.5">Items</th>
                          <th className="px-3 py-2.5">Total</th>
                          <th className="px-3 py-2.5">Latency</th>
                          <th className="px-3 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {orders.slice(0, 7).map((o) => (
                          <tr key={o.id} className="text-[#d1d1d6]">
                            <td className="px-3 py-2 font-mono">{o.orderNumber}</td>
                            <td className="max-w-[180px] truncate px-3 py-2">
                              {o.itemsSummary}
                            </td>
                            <td className="px-3 py-2 font-mono tabular-nums">
                              ${(o.totalCents / 100).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 font-mono tabular-nums">
                              {o.checkoutMs}ms
                            </td>
                            <td className="px-3 py-2 font-mono">
                              <span
                                className={
                                  o.status === "completed"
                                    ? "text-[#30d158]"
                                    : "text-[#ff453a]"
                                }
                              >
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: ENVS & CATALOG SEO */}
              {activeTab === "infra" && (
                <div className="animate-panel-in space-y-5">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-sm font-semibold text-white">
                        DEV -&gt; QA -&gt; PROD Pipeline
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={!canEditStage}
                          onClick={() => handleEnvAction("promote_dev_to_qa")}
                          className="rounded-full bg-[#2c2c30] px-3 py-1 text-[11px] font-medium text-white disabled:opacity-40"
                        >
                          DEV -&gt; QA
                        </button>
                        <button
                          type="button"
                          disabled={!canDeployProd}
                          onClick={() => handleEnvAction("promote_qa_to_prod")}
                          className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-black disabled:opacity-40"
                        >
                          QA -&gt; PROD
                        </button>
                        <button
                          type="button"
                          disabled={!canDeployProd}
                          onClick={() => handleEnvAction("rollback_prod")}
                          className="rounded-full bg-[#ff453a]/20 px-3 py-1 text-[11px] text-[#ff6961] disabled:opacity-40"
                        >
                          Rollback PROD
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {environments.map((env) => (
                        <div
                          key={env.id}
                          className="rounded-2xl border border-white/[0.08] bg-[#09090b] p-3.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-semibold text-white">
                              {env.name}
                            </span>
                            <span
                              className={`font-mono text-[10px] ${
                                env.status === "degraded"
                                  ? "text-[#ff453a]"
                                  : "text-[#30d158]"
                              }`}
                            >
                              {env.status}
                            </span>
                          </div>
                          <div className="mt-1 font-mono text-[11px] text-[#2997ff]">
                            {env.versionTag} ({env.commitSha})
                          </div>
                          <div className="mt-1 text-[11px] text-[#86868b]">
                            {env.workerPool}
                          </div>
                          <div className="mt-1 font-mono text-[11px] text-[#d1d1d6]">
                            p95: {env.p95LatencyMs}ms
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/[0.08] pt-4">
                    <div className="flex items-center gap-2">
                      <SearchCheck className="h-4 w-4 text-[#30d158]" />
                      <h3 className="text-sm font-semibold text-white">
                        Catalog &amp; SEO Audit ({catalogFindings.length})
                      </h3>
                    </div>
                    {catalogFindings.length === 0 ? (
                      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#30d158]/10 p-3.5 text-xs text-[#30d158]">
                        <CheckCircle2 className="h-4 w-4" />
                        All SKUs pass taxonomy, alt-text, and SEO description
                        checks.
                      </div>
                    ) : (
                      <div className="mt-3 space-y-2.5">
                        {catalogFindings.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#09090b] p-3.5"
                          >
                            <div>
                              <div className="text-xs font-semibold text-white">
                                {item.name}{" "}
                                <span className="font-mono text-[11px] text-[#86868b]">
                                  ({item.sku} · {item.seoScore}/100)
                                </span>
                              </div>
                              <div className="mt-1 text-[11px] text-[#ffd60a]">
                                {item.issues.join(" · ")}
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={!canEditStage}
                              onClick={() => handleCatalogFix(item.id)}
                              className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
                            >
                              Auto-Fix
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Audit Feed */}
          <div className="rounded-[24px] bg-white p-5 studio-shadow">
            <div className="flex items-center gap-2 border-b border-black/[0.06] pb-3">
              <GitBranch className="h-4 w-4 text-[#1d1d1f]" />
              <h3 className="text-xs font-semibold text-[#1d1d1f]">
                RBAC &amp; Deployment Audit Trail
              </h3>
            </div>
            <div className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
              {audits.slice(0, 6).map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-start justify-between gap-3 rounded-xl bg-[#f5f5f7] px-3.5 py-2 text-[11px]"
                >
                  <div>
                    <span className="font-semibold text-[#1d1d1f]">
                      {ev.actor}
                    </span>{" "}
                    <span className="font-mono text-[#0071e3]">[{ev.role}]</span>{" "}
                    <span className="text-[#6e6e73]">{ev.detail}</span>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-[#86868b]">
                    {ev.environment}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* WooCommerce Connector Modal */}
      {wooModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-md">
          <div className="animate-modal-in w-full max-w-lg rounded-[28px] bg-white p-7 studio-shadow">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3.5">
              <div className="flex items-center gap-2">
                <PlugZap className="h-4 w-4 text-[#0071e3]" />
                <h3 className="text-base font-semibold text-[#1d1d1f]">
                  WooCommerce REST API v3 Connector
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWooModalOpen(false)}
                className="rounded-full p-1 text-[#6e6e73] hover:bg-black/5 hover:text-[#1d1d1f]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[#6e6e73]">
              Validate live connectivity against any public WooCommerce store using a
              read-only REST Consumer Key &amp; Secret, or stay in Sandbox mode.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#1d1d1f]">
                  WooCommerce Store URL
                </label>
                <input
                  type="url"
                  value={wooUrl}
                  onChange={(e) => setWooUrl(e.target.value)}
                  placeholder="https://yourstore.com"
                  className="mt-1 w-full rounded-xl border border-black/15 bg-[#fbfbfd] px-3.5 py-2 font-mono text-xs text-[#1d1d1f] outline-none focus:border-[#0071e3]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1d1d1f]">
                  Consumer Key
                </label>
                <input
                  type="text"
                  value={wooKey}
                  onChange={(e) => setWooKey(e.target.value)}
                  placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="mt-1 w-full rounded-xl border border-black/15 bg-[#fbfbfd] px-3.5 py-2 font-mono text-xs text-[#1d1d1f] outline-none focus:border-[#0071e3]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1d1d1f]">
                  Consumer Secret
                </label>
                <input
                  type="password"
                  value={wooSecret}
                  onChange={(e) => setWooSecret(e.target.value)}
                  placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="mt-1 w-full rounded-xl border border-black/15 bg-[#fbfbfd] px-3.5 py-2 font-mono text-xs text-[#1d1d1f] outline-none focus:border-[#0071e3]"
                />
              </div>
            </div>

            {wooTestFeedback && (
              <div
                className={`mt-4 rounded-xl px-3.5 py-2.5 text-xs ${
                  wooTestFeedback.ok
                    ? "bg-[#30d158]/15 text-[#1c7c35]"
                    : "bg-[#ff3b30]/15 text-[#c92a22]"
                }`}
              >
                {wooTestFeedback.message}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetSandbox}
                className="rounded-full bg-[#f5f5f7] px-4 py-2 text-xs font-medium text-[#1d1d1f] hover:bg-black/10"
              >
                Use Built-in Sandbox
              </button>
              <button
                type="button"
                onClick={handleTestWoo}
                className="rounded-full bg-[#0071e3] px-5 py-2 text-xs font-medium text-white hover:bg-[#0077ed]"
              >
                Test &amp; Connect Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
