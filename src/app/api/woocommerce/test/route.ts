import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/seed-data";
import { testWooCommerceConnection } from "@/lib/woocommerce";

export async function POST(req: NextRequest) {
  await ensureSeeded();

  const body = (await req.json().catch(() => ({}))) as {
    action?: "test" | "reset_sandbox";
    url?: string;
    consumerKey?: string;
    consumerSecret?: string;
  };

  if (body.action === "reset_sandbox") {
    const config = await prisma.storeConfig.update({
      where: { id: "default" },
      data: {
        mode: "sandbox",
        storeName: "Anaya Botanics (WooCommerce Sandbox)",
        wooConnected: false,
        wooVersion: "WooCommerce 9.6 / HPOS Active",
      },
    });
    await prisma.auditEvent.create({
      data: {
        actor: "Sandbox Operator",
        role: "Admin",
        action: "SWITCH_SANDBOX_MODE",
        environment: "PROD",
        detail: "Switched active connector back to built-in WooCommerce Sandbox Store.",
      },
    });
    return NextResponse.json({ ok: true, config });
  }

  const result = await testWooCommerceConnection({
    url: body.url || "",
    consumerKey: body.consumerKey || "",
    consumerSecret: body.consumerSecret || "",
  });

  if (result.connected) {
    await prisma.storeConfig.update({
      where: { id: "default" },
      data: {
        mode: "woocommerce",
        wooUrl: result.storeUrl,
        wooConsumerKey: body.consumerKey ? `${body.consumerKey.slice(0, 8)}...` : "",
        wooConsumerSecret: "********",
        wooConnected: true,
        wooVersion: result.wooVersion || "WooCommerce REST v3",
        hposEnabled: result.hposEnabled ?? true,
        storeName: `${new URL(result.storeUrl).hostname} (Live WooCommerce)`,
      },
    });
    await prisma.auditEvent.create({
      data: {
        actor: "Merchant Owner",
        role: "Owner",
        action: "CONNECT_WOOCOMMERCE",
        environment: "PROD",
        detail: `Verified live WooCommerce REST v3 connection to ${result.storeUrl} (${result.latencyMs}ms).`,
      },
    });
  }

  return NextResponse.json(result, { status: result.connected ? 200 : 400 });
}
