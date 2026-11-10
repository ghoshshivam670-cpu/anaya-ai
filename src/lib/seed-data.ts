import { prisma } from "@/lib/prisma";
import { FAULT_BLUEPRINTS } from "@/lib/agents";

let seedPromise: Promise<void> | null = null;

export async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

async function runSeed(): Promise<void> {
  const existingConfig = await prisma.storeConfig.findUnique({
    where: { id: "default" },
  });

  if (!existingConfig) {
    await prisma.storeConfig.create({
      data: {
        id: "default",
        storeName: "Anaya Botanics (WooCommerce Sandbox)",
        mode: "sandbox",
        activeFault: "NONE",
        shippingBannerEnabled: true,
        freeShippingThreshold: 75,
        checkoutBannerText: "Free express shipping on orders over $75",
        promoDiscountPercent: 0,
        redisObjectCache: true,
        hposEnabled: true,
        autoScalingActive: true,
      },
    });
  }

  const envCount = await prisma.environmentNode.count();
  if (envCount === 0) {
    await prisma.environmentNode.createMany({
      data: [
        {
          id: "DEV",
          name: "DEV",
          url: "https://dev.anayabotanics.anaya.site",
          versionTag: "v2.14.2-dev",
          commitSha: "a91f4c2",
          phpRuntime: "PHP 8.3 (OPcache + JIT)",
          workerPool: "4 workers · 1 zone",
          p95LatencyMs: 284,
          uptimePercent: "99.95%",
          status: "healthy",
        },
        {
          id: "QA",
          name: "QA",
          url: "https://qa.anayabotanics.anaya.site",
          versionTag: "v2.14.1-rc1",
          commitSha: "7d8e10b",
          phpRuntime: "PHP 8.3 (OPcache + JIT)",
          workerPool: "8 workers · 2 zones",
          p95LatencyMs: 262,
          uptimePercent: "99.98%",
          status: "healthy",
        },
        {
          id: "PROD",
          name: "PROD",
          url: "https://anayabotanics.com",
          versionTag: "v2.14.0",
          commitSha: "4c22e90",
          phpRuntime: "PHP 8.3-FPM Custom I/O",
          workerPool: "24 workers · Auto-scale 16x",
          p95LatencyMs: 318,
          uptimePercent: "99.99%",
          status: "healthy",
        },
      ],
    });
  }

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          sku: "ANB-SER-01",
          name: "Saffron Radiance Recovery Serum",
          slug: "saffron-radiance-serum",
          category: "Serums",
          priceCents: 6800,
          stock: 142,
          accentColor: "#10b981",
          shortDesc: "Cold-pressed Kashmiri saffron & niacinamide barrier serum.",
          description:
            "Clinically tested brightening botanical serum formulated for sensitive skin barriers with 5% niacinamide and antioxidant saffron extract.",
          altText: "Amber glass dropper bottle of Saffron Radiance Recovery Serum",
          seoScore: 98,
        },
        {
          sku: "ANB-CLN-02",
          name: "Vetiver Enzyme Gel Cleanser",
          slug: "vetiver-enzyme-cleanser",
          category: "Cleansers",
          priceCents: 3800,
          stock: 215,
          accentColor: "#06b6d4",
          shortDesc: "pH-balanced daily botanical cleanser without sulfates.",
          description:
            "Gentle gel-to-milk cleanser infused with distilled vetiver root and papaya enzymes to lift mineral sunscreen without stripping lipids.",
          altText: "Frosted bottle of Vetiver Enzyme Gel Cleanser on stone surface",
          seoScore: 95,
        },
        {
          sku: "ANB-CRM-03",
          name: "Ceramide Cloud Night Cream",
          slug: "ceramide-cloud-night-cream",
          category: "Moisturizers",
          priceCents: 5400,
          stock: 89,
          accentColor: "#8b5cf6",
          shortDesc: "Triple-lipid overnight recovery moisturizer.",
          description:
            "Whipped ceramide NP/AP complex paired with squalane to lock in hydration overnight.",
          altText: "",
          seoScore: 68,
        },
        {
          sku: "ANB-SPF-04",
          name: "Mineral Dew Invisible Fluid SPF 50",
          slug: "mineral-dew-spf-50",
          category: "Uncategorized",
          priceCents: 4200,
          stock: 64,
          accentColor: "#f59e0b",
          shortDesc: "Zero-cast zinc oxide fluid.",
          description: "Sheer daily mineral sunscreen.",
          altText: "Mineral Dew SPF 50 tube",
          seoScore: 54,
        },
        {
          sku: "ANB-MST-05",
          name: "Neroli Electro-Hydrating Mist",
          slug: "neroli-hydrating-mist",
          category: "Toners & Mists",
          priceCents: 3200,
          stock: 170,
          accentColor: "#ec4899",
          shortDesc: "Micro-fine botanical toning mist with magnesium.",
          description:
            "Instant hydration mist crafted with steam-distilled bitter orange blossom and skin-identical electrolytes.",
          altText: "Fine mist spray bottle of Neroli Electro-Hydrating Mist",
          seoScore: 91,
        },
        {
          sku: "ANB-KIT-06",
          name: "Complete Barrier Ritual Bundle",
          slug: "complete-barrier-bundle",
          category: "Bundles",
          priceCents: 13900,
          stock: 41,
          accentColor: "#14b8a6",
          shortDesc: "3-step morning & night routine with 15% bundle savings.",
          description:
            "Pairs Vetiver Enzyme Gel Cleanser, Saffron Radiance Recovery Serum, and Ceramide Cloud Night Cream in reusable travel packaging.",
          altText: "Three-piece Complete Barrier Ritual skincare gift box",
          seoScore: 97,
        },
      ],
    });
  }

  const orderCount = await prisma.demoOrder.count();
  if (orderCount === 0) {
    const now = Date.now();
    await prisma.demoOrder.createMany({
      data: [
        {
          orderNumber: "WC-10481",
          customerEmail: "maya.lin@example.com",
          itemsSummary: "Saffron Radiance Recovery Serum x1",
          totalCents: 6800,
          status: "completed",
          checkoutMs: 312,
          environment: "PROD",
          createdAt: new Date(now - 1000 * 60 * 55),
        },
        {
          orderNumber: "WC-10482",
          customerEmail: "arjun.k@example.com",
          itemsSummary: "Complete Barrier Ritual Bundle x1",
          totalCents: 13900,
          status: "completed",
          checkoutMs: 289,
          environment: "PROD",
          createdAt: new Date(now - 1000 * 60 * 44),
        },
        {
          orderNumber: "WC-10483",
          customerEmail: "elena.r@example.com",
          itemsSummary: "Ceramide Cloud Night Cream x2",
          totalCents: 10800,
          status: "completed",
          checkoutMs: 341,
          environment: "PROD",
          createdAt: new Date(now - 1000 * 60 * 32),
        },
        {
          orderNumber: "WC-10484",
          customerEmail: "devon.p@example.com",
          itemsSummary: "Vetiver Enzyme Gel Cleanser x1, Neroli Mist x1",
          totalCents: 7000,
          status: "completed",
          checkoutMs: 304,
          environment: "PROD",
          createdAt: new Date(now - 1000 * 60 * 21),
        },
        {
          orderNumber: "WC-10485",
          customerEmail: "priya.n@example.com",
          itemsSummary: "Mineral Dew Invisible Fluid SPF 50 x2",
          totalCents: 8400,
          status: "completed",
          checkoutMs: 326,
          environment: "PROD",
          createdAt: new Date(now - 1000 * 60 * 11),
        },
      ],
    });
  }

  const incidentCount = await prisma.revenueIncident.count();
  if (incidentCount === 0) {
    const bp = FAULT_BLUEPRINTS.N_PLUS_1;
    await prisma.revenueIncident.create({
      data: {
        title: "Resolved: " + bp.title,
        faultType: bp.faultType,
        severity: "resolved",
        revenueAtRiskPerHr: bp.revenueAtRiskPerHr,
        affectedEndpoint: bp.affectedEndpoint,
        p99LatencyMs: 318,
        traceJson: JSON.stringify(bp.traces),
        diffPatch: bp.diffPatch,
        status: "resolved",
      },
    });
  }

  const patchCount = await prisma.builderPatch.count();
  if (patchCount === 0) {
    await prisma.builderPatch.create({
      data: {
        prompt: "Enable free express shipping threshold banner at $75",
        summary: "Updated free express shipping threshold to $75 with live progress bar",
        targetEnv: "PROD",
        diffText: `--- a/wp-content/themes/anaya-store/templates/cart/shipping-progress.php
+++ b/wp-content/themes/anaya-store/templates/cart/shipping-progress.php
@@ -8,3 +8,3 @@
-$threshold = 100;
+$threshold = 75;
 echo sprintf('Free express shipping on orders over $%d', $threshold);`,
        smokeTestStatus: "passed",
        appliedConfigJson: JSON.stringify({ freeShippingThreshold: 75 }),
        status: "deployed",
      },
    });
  }

  const auditCount = await prisma.auditEvent.count();
  if (auditCount === 0) {
    await prisma.auditEvent.createMany({
      data: [
        {
          actor: "Revenue AI",
          role: "Admin",
          action: "AUTO_PATCH_VERIFIED",
          environment: "PROD",
          detail: "Batched wp_postmeta loyalty lookup into HPOS object cache; checkout p99 dropped from 2.84s to 318ms.",
        },
        {
          actor: "Ananya Verma",
          role: "Owner",
          action: "PROMOTE_RELEASE",
          environment: "PROD",
          detail: "Promoted release v2.14.0 from QA after 12/12 synthetic checkout smoke tests passed.",
        },
      ],
    });
  }
}
