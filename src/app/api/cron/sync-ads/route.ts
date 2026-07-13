import { NextRequest, NextResponse } from "next/server";
import { AdChannel } from "@prisma/client";
import { fetchMetaCampaignInsights } from "@/lib/ads/meta";
import { fetchGoogleAdsCampaignMetrics } from "@/lib/ads/google";
import { fetchTikTokCampaignMetrics } from "@/lib/ads/tiktok";
import { upsertDailyMetrics } from "@/lib/ads/sync";

export const maxDuration = 60;

function yyyymmdd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // sem secret configurado, libera (uso local)
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  const metaToken = process.env.META_SYSTEM_USER_TOKEN;
  const metaAccountIds = (process.env.META_AD_ACCOUNT_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (metaToken && metaAccountIds.length > 0) {
    const today = new Date();
    const since = yyyymmdd(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000));
    const until = yyyymmdd(today);

    const metaResults = [];
    for (const accountId of metaAccountIds) {
      try {
        const metrics = await fetchMetaCampaignInsights({
          accountExternalId: accountId,
          since,
          until,
          accessToken: metaToken,
        });
        const summary = await upsertDailyMetrics(
          AdChannel.META,
          { externalAccountId: accountId, name: `act_${accountId}` },
          metrics
        );
        metaResults.push({ accountId, ...summary, rows: metrics.length });
      } catch (err) {
        metaResults.push({ accountId, error: (err as Error).message });
      }
    }
    results.meta = metaResults;
  } else {
    results.meta = "skipped (META_SYSTEM_USER_TOKEN ou META_AD_ACCOUNT_IDS não configurados)";
  }

  const googleCustomerIds = (process.env.GOOGLE_ADS_CUSTOMER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (process.env.GOOGLE_ADS_DEVELOPER_TOKEN && googleCustomerIds.length > 0) {
    const today = new Date();
    const since = yyyymmdd(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000));
    const until = yyyymmdd(today);

    const googleResults = [];
    for (const customerId of googleCustomerIds) {
      try {
        const metrics = await fetchGoogleAdsCampaignMetrics({ customerId, since, until });
        const summary = await upsertDailyMetrics(
          AdChannel.GOOGLE,
          { externalAccountId: customerId, name: `customer/${customerId}` },
          metrics
        );
        googleResults.push({ customerId, ...summary, rows: metrics.length });
      } catch (err) {
        googleResults.push({ customerId, error: (err as Error).message });
      }
    }
    results.google = googleResults;
  } else {
    results.google =
      "skipped (GOOGLE_ADS_DEVELOPER_TOKEN ou GOOGLE_ADS_CUSTOMER_IDS não configurados)";
  }

  const tiktokAdvertiserIds = (process.env.TIKTOK_ADVERTISER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (process.env.TIKTOK_ACCESS_TOKEN && tiktokAdvertiserIds.length > 0) {
    const today = new Date();
    const since = yyyymmdd(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000));
    const until = yyyymmdd(today);

    const tiktokResults = [];
    for (const advertiserId of tiktokAdvertiserIds) {
      try {
        const metrics = await fetchTikTokCampaignMetrics({ advertiserId, since, until });
        const summary = await upsertDailyMetrics(
          AdChannel.TIKTOK,
          { externalAccountId: advertiserId, name: `advertiser/${advertiserId}` },
          metrics
        );
        tiktokResults.push({ advertiserId, ...summary, rows: metrics.length });
      } catch (err) {
        tiktokResults.push({ advertiserId, error: (err as Error).message });
      }
    }
    results.tiktok = tiktokResults;
  } else {
    results.tiktok = "skipped (TIKTOK_ACCESS_TOKEN ou TIKTOK_ADVERTISER_IDS não configurados)";
  }

  // Shopee Ads entra aqui conforme a integração for implementada.

  return NextResponse.json({ ok: true, results });
}
