import { NextRequest, NextResponse } from "next/server";
import { AdChannel } from "@prisma/client";
import { auth } from "@/lib/auth";
import { parseShopeeAdsCsv } from "@/lib/ads/shopee";
import { upsertDailyMetrics } from "@/lib/ads/sync";

export const maxDuration = 60;

// Import manual: Shopee Ads não tem API pública confirmada de relatórios (ver src/lib/ads/shopee.ts).
// Uso: POST multipart/form-data com campos "file" (CSV exportado do Seller Center) e "shopId".
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const shopId = form.get("shopId");

  if (!(file instanceof File) || typeof shopId !== "string" || !shopId) {
    return NextResponse.json(
      { error: "envie multipart/form-data com 'file' (CSV) e 'shopId'" },
      { status: 400 }
    );
  }

  try {
    const csvContent = await file.text();
    const metrics = parseShopeeAdsCsv(csvContent);
    const summary = await upsertDailyMetrics(
      AdChannel.SHOPEE,
      { externalAccountId: shopId, name: `shop/${shopId}` },
      metrics
    );

    return NextResponse.json({ ok: true, rows: metrics.length, ...summary });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 422 });
  }
}
