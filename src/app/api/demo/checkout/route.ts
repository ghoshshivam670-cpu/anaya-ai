import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/seed-data";

export async function POST(req: NextRequest) {
  await ensureSeeded();

  const body = (await req.json().catch(() => ({}))) as {
    customerEmail?: string;
    items?: Array<{ productId: string; quantity: number }>;
  };

  const config = await prisma.storeConfig.findUnique({
    where: { id: "default" },
  });
  if (!config) {
    return NextResponse.json({ error: "Store config missing" }, { status: 500 });
  }

  const requestedItems = Array.isArray(body.items) ? body.items : [];
  if (requestedItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: requestedItems.map((i) => i.productId) } },
  });

  let subtotalCents = 0;
  const summaryParts: string[] = [];

  for (const line of requestedItems) {
    const product = products.find((p) => p.id === line.productId);
    if (!product) continue;
    const qty = Math.max(1, Math.min(20, Math.floor(line.quantity || 1)));
    subtotalCents += product.priceCents * qty;
    summaryParts.push(`${product.name} x${qty}`);
  }

  if (subtotalCents === 0) {
    return NextResponse.json({ error: "No valid products in cart" }, { status: 400 });
  }

  const discountCents =
    config.promoDiscountPercent > 0
      ? Math.round(subtotalCents * (config.promoDiscountPercent / 100))
      : 0;
  const afterDiscount = subtotalCents - discountCents;
  const freeShipping = afterDiscount >= config.freeShippingThreshold * 100;
  const shippingCents = freeShipping ? 0 : 900;
  const totalCents = afterDiscount + shippingCents;

  // Simulate realistic WooCommerce ?wc-ajax=checkout telemetry based on activeFault
  let checkoutMs = 285 + Math.floor(Math.random() * 62);
  let status: "completed" | "failed" = "completed";
  let failureReason: string | null = null;

  if (config.activeFault === "N_PLUS_1") {
    checkoutMs = 2490 + Math.floor(Math.random() * 520);
  } else if (config.activeFault === "SHIPPING_API") {
    checkoutMs = 3120 + Math.floor(Math.random() * 480);
  } else if (config.activeFault === "PAYMENT_WEBHOOK") {
    checkoutMs = 1580 + Math.floor(Math.random() * 320);
    status = "failed";
    failureReason =
      "HTTP 401 from /wp-json/wc/v3/anaya-pay/webhook — HMAC verification mismatch detected by Revenue AI.";
  }

  const orderNumber = `WC-${10500 + Math.floor(Math.random() * 89000)}`;
  const order = await prisma.demoOrder.create({
    data: {
      orderNumber,
      customerEmail: (body.customerEmail || "shopper@anayabotanics.com").trim(),
      itemsSummary: summaryParts.join(", "),
      totalCents,
      status,
      checkoutMs,
      environment: "PROD",
    },
  });

  return NextResponse.json({
    ok: status === "completed",
    order,
    breakdown: {
      subtotalCents,
      discountCents,
      shippingCents,
      totalCents,
      freeShipping,
    },
    telemetry: {
      endpoint: "/?wc-ajax=checkout",
      checkoutMs,
      hposActive: config.hposEnabled,
      redisObjectCache: config.redisObjectCache,
      failureReason,
    },
  });
}
