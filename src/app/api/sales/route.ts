import { NextRequest, NextResponse } from "next/server";
import { AdChannel, ConversionSourceType, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const Schema = z.object({
  account: z.string().min(1),
  accountName: z.string().optional(),
  channel: z.enum(["META", "GOOGLE", "TIKTOK", "SHOPEE"]).default("META"),
  amount: z.number().positive(),
  phone: z.string().optional(),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const b = Schema.parse(await req.json());
    const ev = await prisma.conversionEvent.create({
      data: {
        channel: b.channel as AdChannel,
        sourceType: "MANUAL" as ConversionSourceType,
        amount: new Prisma.Decimal(b.amount),
        metadata: { account: b.account, accountName: b.accountName ?? null, phone: b.phone ?? null, note: b.note ?? null, by: session.user.email },
        pushBackStatus: "manual",
      },
    });
    return NextResponse.json({ ok: true, id: ev.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.flatten() }, { status: 400 });
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const evs = await prisma.conversionEvent.findMany({
    where: { sourceType: "MANUAL", createdAt: { gte: since } },
    select: { amount: true, metadata: true },
  });
  const byAccount: Record<string, { sales: number; revenue: number }> = {};
  for (const e of evs) {
    const acc = (e.metadata as any)?.account;
    if (!acc) continue;
    byAccount[acc] ??= { sales: 0, revenue: 0 };
    byAccount[acc].sales += 1;
    byAccount[acc].revenue += Number(e.amount || 0);
  }
  return NextResponse.json({ ok: true, byAccount });
}
