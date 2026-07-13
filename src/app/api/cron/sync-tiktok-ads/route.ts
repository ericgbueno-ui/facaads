import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncTikTokAdsCampaigns } from "@/lib/tiktok-ads/sync";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tiktokAccounts = await prisma.adAccount.findMany({
      where: {
        channel: "TIKTOK",
        accessToken: { not: null },
      },
      include: { user: true },
    });

    console.log(`Syncing ${tiktokAccounts.length} TikTok Ads accounts...`);

    const results = [];

    for (const account of tiktokAccounts) {
      if (!account.accessToken) continue;

      const result = await syncTikTokAdsCampaigns(
        account.userId,
        account.externalId,
        account.accessToken
      );

      results.push({
        accountId: account.externalId,
        accountName: account.name,
        ...result,
      });
    }

    return NextResponse.json({
      ok: true,
      message: `Synced ${results.length} TikTok Ads accounts`,
      results,
    });
  } catch (err) {
    console.error("Cron sync error:", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
