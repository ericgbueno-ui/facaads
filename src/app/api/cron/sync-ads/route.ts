import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncMetaAdAccount } from "@/lib/meta-ads/sync";
import { getMetaAccessToken } from "@/lib/meta-ads/config";

export const maxDuration = 300;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = getMetaAccessToken();
  if (!token) {
    return NextResponse.json({ ok: false, error: "META_ADS_ACCESS_TOKEN não configurado" }, { status: 503 });
  }

  const accounts = await prisma.adAccount.findMany({
    where: { channel: "META", companyId: { not: null } },
    select: { id: true, externalAccountId: true, accessToken: true, companyId: true },
  });

  const results = [];
  for (const account of accounts) {
    try {
      const summary = await syncMetaAdAccount({ ...account, accessToken: account.accessToken || token }, 7);
      results.push({ accountId: account.externalAccountId, ...summary });
    } catch (error) {
      results.push({ accountId: account.externalAccountId, error: error instanceof Error ? error.message : "sync failed" });
    }
  }

  const synced = results.reduce((total, item) => total + ("snapshots" in item ? item.snapshots : 0), 0);
  return NextResponse.json({ ok: results.length > 0 && results.every((item) => !("error" in item)), synced, results });
}
