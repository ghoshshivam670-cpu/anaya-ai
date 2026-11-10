export interface WooTestRequest {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

export interface WooProductPreview {
  id: number;
  name: string;
  sku: string;
  price: string;
  stockStatus: string;
  categories: string[];
}

export interface WooTestResult {
  connected: boolean;
  storeUrl: string;
  wooVersion?: string;
  wpVersion?: string;
  hposEnabled?: boolean;
  latencyMs: number;
  productsSample?: WooProductPreview[];
  message: string;
}

function normalizeStoreUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export async function testWooCommerceConnection(
  input: WooTestRequest
): Promise<WooTestResult> {
  const storeUrl = normalizeStoreUrl(input.url);
  if (!storeUrl || !input.consumerKey.trim() || !input.consumerSecret.trim()) {
    return {
      connected: false,
      storeUrl,
      latencyMs: 0,
      message:
        "Provide a valid WooCommerce store URL, Consumer Key (ck_...), and Consumer Secret (cs_...).",
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(storeUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("Unsupported protocol");
    }
  } catch {
    return {
      connected: false,
      storeUrl,
      latencyMs: 0,
      message: "Invalid URL format. Example: https://store.example.com",
    };
  }

  const credentials = Buffer.from(
    `${input.consumerKey.trim()}:${input.consumerSecret.trim()}`
  ).toString("base64");

  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const productsUrl = `${parsed.origin}/wp-json/wc/v3/products?per_page=5`;
    const res = await fetch(productsUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    const latencyMs = Date.now() - start;

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      return {
        connected: false,
        storeUrl: parsed.origin,
        latencyMs,
        message: `WooCommerce REST API returned HTTP ${res.status}. ${
          res.status === 401 || res.status === 403
            ? "Check Consumer Key/Secret permissions (Read access required)."
            : errorText.slice(0, 140) || "Verify REST API is enabled."
        }`,
      };
    }

    const rawProducts = (await res.json()) as Array<{
      id: number;
      name?: string;
      sku?: string;
      price?: string;
      stock_status?: string;
      categories?: Array<{ name?: string }>;
    }>;

    const productsSample: WooProductPreview[] = Array.isArray(rawProducts)
      ? rawProducts.slice(0, 5).map((p) => ({
          id: p.id,
          name: p.name || "Untitled Product",
          sku: p.sku || `WC-${p.id}`,
          price: p.price || "0.00",
          stockStatus: p.stock_status || "instock",
          categories: Array.isArray(p.categories)
            ? p.categories.map((c) => c.name || "Uncategorized")
            : [],
        }))
      : [];

    // Try system_status if key has admin-level privileges (non-fatal if restricted)
    let wooVersion = "WooCommerce REST v3";
    let wpVersion = "WordPress";
    let hposEnabled = true;

    try {
      const sysRes = await fetch(`${parsed.origin}/wp-json/wc/v3/system_status`, {
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(4000),
      });
      if (sysRes.ok) {
        const sys = (await sysRes.json()) as {
          environment?: { version?: string; wp_version?: string };
          settings?: { custom_orders_table_enabled?: boolean };
        };
        if (sys.environment?.version) {
          wooVersion = `WooCommerce ${sys.environment.version}`;
        }
        if (sys.environment?.wp_version) {
          wpVersion = `WordPress ${sys.environment.wp_version}`;
        }
        if (typeof sys.settings?.custom_orders_table_enabled === "boolean") {
          hposEnabled = sys.settings.custom_orders_table_enabled;
        }
      }
    } catch {
      // Optional metadata check
    }

    return {
      connected: true,
      storeUrl: parsed.origin,
      wooVersion,
      wpVersion,
      hposEnabled,
      latencyMs,
      productsSample,
      message: `Connected cleanly to ${parsed.origin} in ${latencyMs}ms (${productsSample.length} products sampled).`,
    };
  } catch (err) {
    const latencyMs = Date.now() - start;
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "Connection timed out after 7s. Confirm the store is publicly reachable."
        : `Could not reach ${parsed.origin}/wp-json/wc/v3/products. (${
            err instanceof Error ? err.message : "Network error"
          })`;
    return {
      connected: false,
      storeUrl: parsed.origin,
      latencyMs,
      message,
    };
  } finally {
    clearTimeout(timeout);
  }
}
