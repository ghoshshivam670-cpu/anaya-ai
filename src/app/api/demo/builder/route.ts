import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/seed-data";
import { synthesizeBuilderPatch } from "@/lib/agents";

export async function POST(req: NextRequest) {
  await ensureSeeded();

  const body = (await req.json().catch(() => ({}))) as {
    action?: "generate" | "deploy" | "rollback";
    prompt?: string;
    patchId?: string;
  };

  const action = body.action || "generate";

  if (action === "generate") {
    const prompt = (body.prompt || "").trim();
    if (!prompt) {
      return NextResponse.json(
        { error: "Enter a plain-English change request." },
        { status: 400 }
      );
    }
    const generated = synthesizeBuilderPatch(prompt);
    const patch = await prisma.builderPatch.create({
      data: {
        prompt,
        summary: generated.summary,
        targetEnv: "QA",
        diffText: generated.diffText,
        smokeTestStatus: "passed",
        appliedConfigJson: JSON.stringify(generated.configUpdates),
        status: "staged_qa",
      },
    });
    await prisma.environmentNode.update({
      where: { id: "QA" },
      data: {
        status: "staging",
        versionTag: `v2.15.0-qa`,
        commitSha: patch.id.slice(-7),
        lastDeployedAt: new Date(),
      },
    });
    await prisma.auditEvent.create({
      data: {
        actor: "Builder AI",
        role: "Editor",
        action: "GENERATE_QA_PATCH",
        environment: "QA",
        detail: `${generated.summary} (smoke tests passed)`,
      },
    });
    return NextResponse.json({ ok: true, patch });
  }

  if (!body.patchId) {
    return NextResponse.json({ error: "patchId required" }, { status: 400 });
  }

  const patch = await prisma.builderPatch.findUnique({
    where: { id: body.patchId },
  });
  if (!patch) {
    return NextResponse.json({ error: "Patch not found" }, { status: 404 });
  }

  if (action === "deploy") {
    const updates = JSON.parse(patch.appliedConfigJson || "{}") as Record<
      string,
      unknown
    >;
    await prisma.storeConfig.update({
      where: { id: "default" },
      data: {
        ...(typeof updates.freeShippingThreshold === "number"
          ? { freeShippingThreshold: updates.freeShippingThreshold }
          : {}),
        ...(typeof updates.checkoutBannerText === "string"
          ? { checkoutBannerText: updates.checkoutBannerText }
          : {}),
        ...(typeof updates.shippingBannerEnabled === "boolean"
          ? { shippingBannerEnabled: updates.shippingBannerEnabled }
          : {}),
        ...(typeof updates.promoDiscountPercent === "number"
          ? { promoDiscountPercent: updates.promoDiscountPercent }
          : {}),
      },
    });
    const updated = await prisma.builderPatch.update({
      where: { id: patch.id },
      data: { status: "deployed", targetEnv: "PROD" },
    });
    await prisma.environmentNode.update({
      where: { id: "PROD" },
      data: {
        versionTag: "v2.15.0",
        commitSha: patch.id.slice(-7),
        status: "healthy",
        lastDeployedAt: new Date(),
      },
    });
    await prisma.environmentNode.update({
      where: { id: "QA" },
      data: { status: "healthy" },
    });
    await prisma.auditEvent.create({
      data: {
        actor: "Merchant Owner",
        role: "Owner",
        action: "DEPLOY_BUILDER_PATCH",
        environment: "PROD",
        detail: `Deployed Builder AI patch to PROD: ${patch.summary}`,
      },
    });
    return NextResponse.json({ ok: true, patch: updated });
  }

  // rollback
  await prisma.storeConfig.update({
    where: { id: "default" },
    data: {
      freeShippingThreshold: 75,
      promoDiscountPercent: 0,
      shippingBannerEnabled: true,
      checkoutBannerText: "Free express shipping on orders over $75",
    },
  });
  const updated = await prisma.builderPatch.update({
    where: { id: patch.id },
    data: { status: "rolled_back" },
  });
  await prisma.environmentNode.update({
    where: { id: "PROD" },
    data: {
      versionTag: "v2.14.0",
      commitSha: "4c22e90",
      status: "healthy",
      lastDeployedAt: new Date(),
    },
  });
  await prisma.auditEvent.create({
    data: {
      actor: "Merchant Owner",
      role: "Owner",
      action: "ROLLBACK_RELEASE",
      environment: "PROD",
      detail: `1-click rollback executed; restored baseline release v2.14.0.`,
    },
  });
  return NextResponse.json({ ok: true, patch: updated });
}
