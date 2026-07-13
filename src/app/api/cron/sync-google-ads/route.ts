import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncGoogleAdsCampaigns } from "@/lib/google-ads/sync";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const googleAccounts = await prisma.adAccount.findMany({
      where: {
        channel: "GOOGLE",
        refreshToken: { not: null },
      },
      include: { user: true },
    });

    console.log(`Syncing ${googleAccounts.length} Google Ads accounts...`);

    const results = [];

    for (const account of googleAccounts) {
      if (!account.refreshToken) continue;

      const result = await syncGoogleAdsCampaigns(
        account.userId,
        account.externalId,
        account.refreshToken
      );

      results.push({
        accountId: account.externalId,
        accountName: account.name,
        ...result,
      });
    }

    return NextResponse.json({
      ok: true,
      message: `Synced ${results.length} Google Ads accounts`,
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
