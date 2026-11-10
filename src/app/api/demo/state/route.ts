import { connection } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/seed-data";

export async function GET() {
  await connection();
  await ensureSeeded();

  const [storeConfig, environments, products, orders, incidents, patches, audits] =
    await Promise.all([
      prisma.storeConfig.findUnique({ where: { id: "default" } }),
      prisma.environmentNode.findMany({ orderBy: { id: "asc" } }),
      prisma.product.findMany({ orderBy: { sku: "asc" } }),
      prisma.demoOrder.findMany({ orderBy: { createdAt: "desc" }, take: 25 }),
      prisma.revenueIncident.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
      prisma.builderPatch.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
      prisma.auditEvent.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    ]);

  const catalogFindings = products
    .map((p) => {
      const issues: string[] = [];
      if (p.category.toLowerCase() === "uncategorized") {
        issues.push("Assigned to Uncategorized taxonomy");
      }
      if (!p.altText.trim()) {
        issues.push("Missing product image alt attribute");
      }
      if (p.description.trim().length < 60) {
        issues.push("Thin SEO product description (< 60 chars)");
      }
      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        seoScore: p.seoScore,
        issues,
      };
    })
    .filter((item) => item.issues.length > 0);

  return NextResponse.json({
    storeConfig,
    environments,
    products,
    orders,
    incidents,
    patches,
    audits,
    catalogFindings,
  });
}
