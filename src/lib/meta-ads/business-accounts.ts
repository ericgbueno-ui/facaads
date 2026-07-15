import { prisma } from "@/lib/prisma";

export interface MetaBusinessAccount {
  id: string;
  name: string;
  adAccounts: Array<{
    id: string;
    name: string;
    accountStatus: number;
  }>;
}

export async function fetchMetaBusinessAccounts(
  accessToken: string
): Promise<MetaBusinessAccount[]> {
  try {
    // Get business accounts
    const response = await fetch(
      `https://graph.facebook.com/v21.0/me/businesses?fields=id,name,owned_ad_accounts{id,name,account_status}&access_token=${accessToken}`
    );

    if (!response.ok) {
      console.error("Meta API error:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (err) {
    console.error("Failed to fetch Meta business accounts:", err);
    return [];
  }
}

export async function storeMetaBusinessAccount(
  businessId: string,
  businessName: string,
  accessToken: string
) {
  return prisma.adAccount.upsert({
    where: {
      channel_externalAccountId: {
        channel: "META",
        externalAccountId: businessId,
      },
    },
    update: {
      name: businessName,
      accessToken,
      lastSyncedAt: new Date(),
    },
    create: {
      channel: "META",
      externalAccountId: businessId,
      name: businessName,
      accessToken,
      lastSyncedAt: new Date(),
    },
  });
}
