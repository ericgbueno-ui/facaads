import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getUserMetaAccounts, storeMetaAccessToken } from "@/lib/meta-ads/auth";
import { prisma } from "@/lib/prisma";
import { validateCompanyAccess } from "@/lib/auth-middleware";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = process.env.META_ADS_ACCESS_TOKEN;
    const companyId = req.nextUrl.searchParams.get("companyId");
    const memberships = await prisma.companyUser.findMany({ where: { userId: session.user.id! }, select: { companyId: true } });
    const companyIds = memberships.map((membership) => membership.companyId);
    if (companyId) {
      const access = await validateCompanyAccess(session.user.id!, companyId);
      if (!access.valid) return NextResponse.json({ error: access.error }, { status: 403 });
    }
    let syncedCount = 0;

    if (accessToken && companyId) {
      try {
        // 1. Discover direct ad accounts
        const adUrl = `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name&access_token=${accessToken}`;
        const adResponse = await fetch(adUrl);
        const adData = await adResponse.json();

        if (adResponse.ok && adData.data) {
          for (const acc of adData.data) {
            await storeMetaAccessToken({
              accessToken,
              businessAccountId: acc.id,
              accountName: acc.name,
              companyId,
            });
            syncedCount++;
          }
          console.log(`[meta/accounts] synced ${syncedCount} direct ad account(s)`);
        }

        // 2. Discover business accounts and their ad accounts
        const bizUrl = `https://graph.facebook.com/v21.0/me/businesses?fields=id,name,owned_ad_accounts{id,name}&access_token=${accessToken}`;
        const bizResponse = await fetch(bizUrl);
        const bizData = await bizResponse.json();

        if (bizResponse.ok && bizData.data) {
          for (const business of bizData.data) {
            if (business.owned_ad_accounts?.data) {
              for (const adAcc of business.owned_ad_accounts.data) {
                await storeMetaAccessToken({
                  accessToken,
                  businessAccountId: adAcc.id,
                  accountName: adAcc.name || business.name,
                  companyId,
                });
                syncedCount++;
              }
            }
          }
          console.log(`[meta/accounts] synced ${syncedCount} total ad account(s) from business accounts`);
        }
      } catch (err) {
        console.warn("[meta/accounts] failed to discover accounts from Meta API:", err);
      }
    }

    // Get all accounts from database (including discovered ones)
    const accounts = await getUserMetaAccounts(companyIds);
    console.log(`[meta/accounts] returning ${accounts.length} account(s)`);

    return NextResponse.json({
      ok: true,
      accounts: accounts.map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        externalId: acc.externalAccountId,
        lastSyncedAt: acc.lastSyncedAt,
      })),
    });
  } catch (err) {
    console.error("Get Meta accounts error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
