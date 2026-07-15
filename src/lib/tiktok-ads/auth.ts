import { prisma } from "@/lib/prisma";

interface TikTokAdsTokenPayload {
  accessToken: string;
  advertiserId: string;
  accountName: string;
}

export async function storeTikTokAdsToken(payload: TikTokAdsTokenPayload) {
  return prisma.adAccount.upsert({
    where: {
      channel_externalAccountId: {
        channel: "TIKTOK",
        externalAccountId: payload.advertiserId,
      },
    },
    update: {
      name: payload.accountName,
      accessToken: payload.accessToken,
      lastSyncedAt: new Date(),
    },
    create: {
      channel: "TIKTOK",
      externalAccountId: payload.advertiserId,
      name: payload.accountName,
      accessToken: payload.accessToken,
      lastSyncedAt: new Date(),
    },
  });
}

export async function getTikTokAdsAccessToken(advertiserId: string) {
  const account = await prisma.adAccount.findUnique({
    where: {
      channel_externalAccountId: {
        channel: "TIKTOK",
        externalAccountId: advertiserId,
      },
    },
  });

  return account?.accessToken || null;
}

export async function getUserTikTokAdsAccounts() {
  return prisma.adAccount.findMany({
    where: {
      channel: "TIKTOK",
    },
  });
}
