import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/seed-data";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeeded();
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    stage?: "qa" | "prod";
  };
  const stage = body.stage === "qa" ? "qa" : "prod";

  const incident = await prisma.revenueIncident.findUnique({ where: { id } });
  if (!incident) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  }

  if (stage === "qa") {
    const updated = await prisma.revenueIncident.update({
      where: { id },
      data: { status: "staged_qa" },
    });
    await prisma.environmentNode.update({
      where: { id: "QA" },
      data: {
        versionTag: "v2.14.2-hotfix",
        p95LatencyMs: 258,
        status: "staging",
        lastDeployedAt: new Date(),
      },
    });
    await prisma.auditEvent.create({
      data: {
        actor: "Revenue AI",
        role: "Editor",
        action: "STAGE_FIX_QA",
        environment: "QA",
        detail: `Applied Revenue AI patch for ${incident.faultType} in QA; 12/12 smoke tests green.`,
      },
    });
    return NextResponse.json({ ok: true, incident: updated });
  }

  // Deploy fix to PROD
  const updated = await prisma.revenueIncident.update({
    where: { id },
    data: {
      status: "resolved",
      severity: "resolved",
      p99LatencyMs: 312,
      title: incident.title.startsWith("Resolved:")
        ? incident.title
        : `Resolved: ${incident.title}`,
    },
  });

  await prisma.storeConfig.update({
    where: { id: "default" },
    data: { activeFault: "NONE" },
  });

  await prisma.environmentNode.update({
    where: { id: "PROD" },
    data: {
      status: "healthy",
      p95LatencyMs: 312,
      versionTag: "v2.14.2",
      commitSha: Math.random().toString(16).slice(2, 9),
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
      action: "DEPLOY_FIX_PROD",
      environment: "PROD",
      detail: `Promoted Revenue AI patch for ${incident.faultType} to Production. Checkout p99 restored to 312ms.`,
    },
  });

  return NextResponse.json({ ok: true, incident: updated });
}
