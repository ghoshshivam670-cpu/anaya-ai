import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/seed-data";

export async function POST(req: NextRequest) {
  await ensureSeeded();

  const body = (await req.json().catch(() => ({}))) as { productId?: string };
  if (!body.productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: body.productId },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const nextCategory =
    product.category.toLowerCase() === "uncategorized"
      ? "Sun Care"
      : product.category;
  const nextAlt = product.altText.trim()
    ? product.altText
    : `Studio product photograph of ${product.name}`;
  const nextDesc =
    product.description.trim().length < 60
      ? `${product.description.trim()} Formulated for sensitive skin barriers with dermatologist-tested botanical actives and zero white cast.`
      : product.description;

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: {
      category: nextCategory,
      altText: nextAlt,
      description: nextDesc,
      seoScore: 96,
    },
  });

  await prisma.auditEvent.create({
    data: {
      actor: "Catalog & SEO AI",
      role: "Editor",
      action: "CATALOG_AUTO_FIX",
      environment: "QA",
      detail: `Reclassified ${updated.sku} (${updated.name}) -> ${nextCategory}, enriched alt text & SEO description (score 96/100).`,
    },
  });

  return NextResponse.json({ ok: true, product: updated });
}
