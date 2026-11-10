export type FaultCode = "NONE" | "N_PLUS_1" | "PAYMENT_WEBHOOK" | "SHIPPING_API";

export interface ApmSpan {
  name: string;
  layer: "edge" | "php" | "db" | "external";
  startMs: number;
  durationMs: number;
  status: "ok" | "slow" | "error";
  detail: string;
}

export interface FaultBlueprint {
  faultType: Exclude<FaultCode, "NONE">;
  title: string;
  severity: "critical" | "warning";
  revenueAtRiskPerHr: number;
  affectedEndpoint: string;
  p99LatencyMs: number;
  traces: ApmSpan[];
  diffPatch: string;
}

export const FAULT_BLUEPRINTS: Record<Exclude<FaultCode, "NONE">, FaultBlueprint> = {
  N_PLUS_1: {
    faultType: "N_PLUS_1",
    title: "N+1 wp_postmeta lookup blocking /?wc-ajax=checkout",
    severity: "critical",
    revenueAtRiskPerHr: 1480,
    affectedEndpoint: "POST /?wc-ajax=checkout",
    p99LatencyMs: 2840,
    traces: [
      {
        name: "Cloudflare Edge TLS & WAF",
        layer: "edge",
        startMs: 0,
        durationMs: 18,
        status: "ok",
        detail: "Bypass cache (dynamic session cookie detected)",
      },
      {
        name: "PHP-FPM Worker :: WC_Checkout::process_checkout()",
        layer: "php",
        startMs: 18,
        durationMs: 210,
        status: "ok",
        detail: "Validated 3 cart line items & nonce",
      },
      {
        name: "MySQL :: anaya_loyalty_points_hook() [x148 queries]",
        layer: "db",
        startMs: 228,
        durationMs: 2490,
        status: "error",
        detail: "Uncached get_post_meta() loop on wp_postmeta instead of HPOS batch read",
      },
      {
        name: "Stripe PaymentIntent Capture",
        layer: "external",
        startMs: 2718,
        durationMs: 122,
        status: "ok",
        detail: "Succeeded after SQL lock cleared",
      },
    ],
    diffPatch: `--- a/wp-content/plugins/anaya-loyalty/includes/checkout-hook.php
+++ b/wp-content/plugins/anaya-loyalty/includes/checkout-hook.php
@@ -42,11 +42,13 @@ function anaya_calculate_cart_loyalty_tier($cart) {
-  foreach ($cart->get_cart() as $item) {
-    $tier = get_post_meta($item['product_id'], '_loyalty_multiplier', true);
-    $points += (int) $item['quantity'] * (int) $tier;
-  }
+  $product_ids = wp_list_pluck($cart->get_cart(), 'product_id');
+  $cached = wp_cache_get('loyalty_mult_' . md5(implode(',', $product_ids)), 'anaya_loyalty');
+  if (false === $cached) {
+    $cached = anaya_batch_fetch_hpos_multipliers($product_ids);
+    wp_cache_set('loyalty_mult_' . md5(implode(',', $product_ids)), $cached, 'anaya_loyalty', 900);
+  }
+  foreach ($cart->get_cart() as $item) {
+    $points += (int) $item['quantity'] * (int) ($cached[$item['product_id']] ?? 1);
+  }
 }`,
  },
  PAYMENT_WEBHOOK: {
    faultType: "PAYMENT_WEBHOOK",
    title: "Payment webhook signature mismatch stalling order confirmation",
    severity: "critical",
    revenueAtRiskPerHr: 2190,
    affectedEndpoint: "POST /wp-json/wc/v3/anaya-pay/webhook",
    p99LatencyMs: 1620,
    traces: [
      {
        name: "Edge Ingress",
        layer: "edge",
        startMs: 0,
        durationMs: 14,
        status: "ok",
        detail: "POST webhook payload 4.2 KB",
      },
      {
        name: "REST Controller :: verify_hmac_signature()",
        layer: "php",
        startMs: 14,
        durationMs: 42,
        status: "error",
        detail: "HTTP 401: Comparing raw body after stripslashes_deep() mutation",
      },
      {
        name: "Retry Queue Backoff",
        layer: "external",
        startMs: 56,
        durationMs: 1564,
        status: "slow",
        detail: "Order stuck in pending_payment -> 34% mobile cart drop-off",
      },
    ],
    diffPatch: `--- a/wp-content/plugins/anaya-gateway/includes/webhook-handler.php
+++ b/wp-content/plugins/anaya-gateway/includes/webhook-handler.php
@@ -18,7 +18,7 @@ public function handle_webhook(WP_REST_Request $request) {
-  $payload = wp_json_encode($request->get_json_params());
+  $payload = $request->get_body();
   $sig = $request->get_header('x-gateway-signature');
   if (!hash_equals(hash_hmac('sha256', $payload, ANAYA_WEBHOOK_SECRET), (string) $sig)) {
     return new WP_REST_Response(['error' => 'Invalid signature'], 401);
   }`,
  },
  SHIPPING_API: {
    faultType: "SHIPPING_API",
    title: "Synchronous carrier rate API timeout on Cart Drawer update",
    severity: "warning",
    revenueAtRiskPerHr: 860,
    affectedEndpoint: "POST /?wc-ajax=update_shipping_method",
    p99LatencyMs: 3410,
    traces: [
      {
        name: "Edge Router",
        layer: "edge",
        startMs: 0,
        durationMs: 16,
        status: "ok",
        detail: "Routed to checkout worker pool",
      },
      {
        name: "WC_Shipping::calculate_shipping()",
        layer: "php",
        startMs: 16,
        durationMs: 54,
        status: "ok",
        detail: "Cart weight 1.8 kg, ZIP 94107",
      },
      {
        name: "External Carrier Quote API (Uncached)",
        layer: "external",
        startMs: 70,
        durationMs: 3340,
        status: "error",
        detail: "Blocking cURL call with 15s timeout & zero Redis stale-while-revalidate",
      },
    ],
    diffPatch: `--- a/wp-content/plugins/anaya-shipping/includes/live-rates.php
+++ b/wp-content/plugins/anaya-shipping/includes/live-rates.php
@@ -64,8 +64,12 @@ function anaya_fetch_carrier_rates($package) {
-  $resp = wp_remote_post($this->endpoint, ['timeout' => 15, 'body' => $body]);
+  $cache_key = 'rates_' . md5($package['destination']['postcode'] . '_' . $package['contents_cost']);
+  $cached = get_transient($cache_key);
+  if ($cached !== false) return $cached;
+  $resp = wp_remote_post($this->endpoint, ['timeout' => 1.5, 'body' => $body]);
+  if (is_wp_error($resp)) return anaya_flat_fallback_rates($package);
+  set_transient($cache_key, $resp, 15 * MINUTE_IN_SECONDS);
 }`,
  },
};

export interface BuilderGeneration {
  summary: string;
  diffText: string;
  configUpdates: Partial<{
    freeShippingThreshold: number;
    checkoutBannerText: string;
    shippingBannerEnabled: boolean;
    promoDiscountPercent: number;
  }>;
}

export function synthesizeBuilderPatch(prompt: string): BuilderGeneration {
  const lower = prompt.toLowerCase();

  // Extract dollar threshold if user mentions e.g. $50, $60, $100
  const dollarMatch = prompt.match(/\$(\d{2,4})/);
  const percentMatch = prompt.match(/(\d{1,2})\s*%/);

  if (lower.includes("discount") || lower.includes("promo") || lower.includes("coupon") || percentMatch) {
    const pct = percentMatch ? Math.min(50, Math.max(5, Number(percentMatch[1]))) : 15;
    return {
      summary: `Activated ${pct}% automatic checkout promo & updated cart banner`,
      configUpdates: {
        promoDiscountPercent: pct,
        shippingBannerEnabled: true,
        checkoutBannerText: `Auto-applied ${pct}% VIP launch discount at checkout`,
      },
      diffText: `--- a/wp-content/themes/anaya-store/functions.php
+++ b/wp-content/themes/anaya-store/functions.php
@@ -112,4 +112,11 @@ add_action('woocommerce_cart_calculate_fees', function($cart) {
+  if (is_admin() && !defined('DOING_AJAX')) return;
+  $discount = $cart->get_subtotal() * ${(pct / 100).toFixed(2)};
+  if ($discount > 0) {
+    $cart->add_fee(__('Anaya VIP Launch (${pct}%)', 'anaya'), -$discount);
+  }
 });`,
    };
  }

  if (lower.includes("hide") && lower.includes("banner")) {
    return {
      summary: "Disabled free-shipping progress bar on Cart Drawer",
      configUpdates: {
        shippingBannerEnabled: false,
      },
      diffText: `--- a/wp-content/themes/anaya-store/templates/cart/mini-cart.php
+++ b/wp-content/themes/anaya-store/templates/cart/mini-cart.php
@@ -19,3 +19,1 @@
-  <?php anaya_render_shipping_progress_bar(); ?>
+  <?php /* Shipping banner disabled via Builder AI release */ ?>`,
    };
  }

  if (lower.includes("shipping") || lower.includes("threshold") || dollarMatch) {
    const threshold = dollarMatch ? Math.min(500, Math.max(25, Number(dollarMatch[1]))) : 50;
    return {
      summary: `Updated free express shipping threshold to $${threshold} with live progress bar`,
      configUpdates: {
        freeShippingThreshold: threshold,
        shippingBannerEnabled: true,
        checkoutBannerText: `Free express shipping on orders over $${threshold}`,
      },
      diffText: `--- a/wp-content/themes/anaya-store/templates/cart/shipping-progress.php
+++ b/wp-content/themes/anaya-store/templates/cart/shipping-progress.php
@@ -8,5 +8,5 @@
-$threshold = (int) get_option('anaya_free_shipping_threshold', 75);
+$threshold = ${threshold};
 $remaining = max(0, $threshold - WC()->cart->get_subtotal());
-echo sprintf('Free express shipping on orders over $%d', $threshold);
+echo $remaining === 0
+  ? 'Unlocked: Free express shipping!'
+  : sprintf('Add $%s more for free express shipping', number_format($remaining, 2));`,
    };
  }

  return {
    summary: `Applied storefront UX refinement: "${prompt.slice(0, 68)}"`,
    configUpdates: {
      shippingBannerEnabled: true,
      checkoutBannerText: prompt.slice(0, 84),
    },
    diffText: `--- a/wp-content/themes/anaya-store/templates/checkout/trust-bar.php
+++ b/wp-content/themes/anaya-store/templates/checkout/trust-bar.php
@@ -4,3 +4,5 @@
 <div class="anaya-checkout-notice">
-  <span>Express WooCommerce Checkout</span>
+  <span>${prompt.replace(/</g, "").slice(0, 84)}</span>
 </div>`,
  };
}
