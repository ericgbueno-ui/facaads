import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncMetaAdAccountCampaigns } from "@/lib/meta-ads/sync";

export const maxDuration = 300; // 5 minutes timeout for cron

export async function GET(req: NextRequest) {
  // Verify cron secret
  const secret = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all Meta Ads accounts with access tokens
    const metaAccounts = await prisma.adAccount.findMany({
      where: {
        channel: "META",
        accessToken: { not: null },
      },
      include: {
        user: true,
      },
    });

    console.log(`Syncing ${metaAccounts.length} Meta Ads accounts...`);

    const results = [];

    // Sync each account
    for (const account of metaAccounts) {
      if (!account.accessToken) continue;

      const result = await syncMetaAdAccountCampaigns(
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
      message: `Synced ${results.length} accounts`,
      results,
    });
  } catch (err) {
    console.error("Cron sync error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}
