import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeeded } from "@/lib/seed-data";

export async function POST(req: NextRequest) {
  await ensureSeeded();

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    storeUrl?: string;
    platform?: string;
    monthlyOrders?: string;
    notes?: string;
  };

  if (!body.name?.trim() || !body.email?.trim() || !body.storeUrl?.trim()) {
    return NextResponse.json(
      { error: "Name, work email, and store URL are required." },
      { status: 400 }
    );
  }

  const lead = await prisma.contactLead.create({
    data: {
      name: body.name.trim(),
      email: body.email.trim(),
      storeUrl: body.storeUrl.trim(),
      platform: (body.platform || "WooCommerce").trim(),
      monthlyOrders: (body.monthlyOrders || "10k-50k").trim(),
      notes: (body.notes || "").trim(),
    },
  });

  return NextResponse.json({ ok: true, leadId: lead.id });
}
