import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/seed-data";
import { FAULT_BLUEPRINTS, type FaultCode } from "@/lib/agents";

export async function POST(req: NextRequest) {
  await ensureSeeded();

  const body = (await req.json().catch(() => ({}))) as { fault?: string };
  const requested = (body.fault || "NONE").toUpperCase() as FaultCode;

  if (requested === "NONE") {
    await prisma.storeConfig.update({
      where: { id: "default" },
      data: { activeFault: "NONE" },
    });
    await prisma.revenueIncident.updateMany({
      where: { status: { in: ["open", "staged_qa"] } },
      data: { status: "resolved", severity: "resolved", p99LatencyMs: 318 },
    });
    await prisma.environmentNode.update({
      where: { id: "PROD" },
      data: { status: "healthy", p95LatencyMs: 318 },
    });
    await prisma.auditEvent.create({
      data: {
        actor: "Sandbox Operator",
        role: "Admin",
        action: "CLEAR_FAULTS",
        environment: "PROD",
        detail: "Cleared injected checkout faults; restored baseline sub-second SLA.",
      },
    });
    return NextResponse.json({ ok: true, activeFault: "NONE" });
  }

  const blueprint = FAULT_BLUEPRINTS[requested];
  if (!blueprint) {
    return NextResponse.json({ error: "Unknown fault code" }, { status: 400 });
  }

  await prisma.storeConfig.update({
    where: { id: "default" },
    data: { activeFault: requested },
  });

  const incident = await prisma.revenueIncident.create({
    data: {
      title: blueprint.title,
      faultType: blueprint.faultType,
      severity: blueprint.severity,
      revenueAtRiskPerHr: blueprint.revenueAtRiskPerHr,
      affectedEndpoint: blueprint.affectedEndpoint,
      p99LatencyMs: blueprint.p99LatencyMs,
      traceJson: JSON.stringify(blueprint.traces),
      diffPatch: blueprint.diffPatch,
      status: "open",
    },
  });

  await prisma.environmentNode.update({
    where: { id: "PROD" },
    data: {
      status: "degraded",
      p95LatencyMs: blueprint.p99LatencyMs,
    },
  });

  await prisma.auditEvent.create({
    data: {
      actor: "Revenue AI",
      role: "Admin",
      action: "INCIDENT_DETECTED",
      environment: "PROD",
      detail: `${blueprint.title} ($${blueprint.revenueAtRiskPerHr}/hr at risk). Auto-fix PR drafted.`,
    },
  });

  return NextResponse.json({ ok: true, activeFault: requested, incident });
}
