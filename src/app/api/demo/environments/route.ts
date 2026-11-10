import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/seed-data";

export async function POST(req: NextRequest) {
  await ensureSeeded();

  const body = (await req.json().catch(() => ({}))) as {
    action?: "promote_dev_to_qa" | "promote_qa_to_prod" | "rollback_prod";
  };

  const action = body.action;
  const [dev, qa, prod] = await Promise.all([
    prisma.environmentNode.findUnique({ where: { id: "DEV" } }),
    prisma.environmentNode.findUnique({ where: { id: "QA" } }),
    prisma.environmentNode.findUnique({ where: { id: "PROD" } }),
  ]);

  if (!dev || !qa || !prod) {
    return NextResponse.json({ error: "Environments missing" }, { status: 500 });
  }

  if (action === "promote_dev_to_qa") {
    const updated = await prisma.environmentNode.update({
      where: { id: "QA" },
      data: {
        versionTag: dev.versionTag.replace("-dev", "-rc"),
        commitSha: dev.commitSha,
        status: "staging",
        lastDeployedAt: new Date(),
      },
    });
    await prisma.auditEvent.create({
      data: {
        actor: "Lead Engineer",
        role: "Admin",
        action: "PROMOTE_DEV_QA",
        environment: "QA",
        detail: `Promoted ${dev.commitSha} from DEV to QA with automated lint & smoke checks.`,
      },
    });
    return NextResponse.json({ ok: true, environment: updated });
  }

  if (action === "promote_qa_to_prod") {
    const updated = await prisma.environmentNode.update({
      where: { id: "PROD" },
      data: {
        versionTag: qa.versionTag.replace("-rc1", "").replace("-rc", ""),
        commitSha: qa.commitSha,
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
        action: "PROMOTE_QA_PROD",
        environment: "PROD",
        detail: `Zero-downtime promotion of ${qa.commitSha} from QA to Production.`,
      },
    });
    return NextResponse.json({ ok: true, environment: updated });
  }

  if (action === "rollback_prod") {
    const updated = await prisma.environmentNode.update({
      where: { id: "PROD" },
      data: {
        versionTag: "v2.14.0",
        commitSha: "4c22e90",
        p95LatencyMs: 312,
        status: "healthy",
        lastDeployedAt: new Date(),
      },
    });
    await prisma.storeConfig.update({
      where: { id: "default" },
      data: { activeFault: "NONE" },
    });
    await prisma.auditEvent.create({
      data: {
        actor: "Merchant Owner",
        role: "Owner",
        action: "ONE_CLICK_ROLLBACK",
        environment: "PROD",
        detail: "1-click rollback executed on Production -> restored v2.14.0 (4c22e90).",
      },
    });
    return NextResponse.json({ ok: true, environment: updated });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
