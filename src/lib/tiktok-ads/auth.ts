import { prisma } from "@/lib/prisma";

interface TikTokAdsTokenPayload {
  accessToken: string;
  advertiserId: string;
  accountName: string;
}

export async function storeTikTokAdsToken(
  userId: string,
  payload: TikTokAdsTokenPayload
) {
  return prisma.adAccount.upsert({
    where: {
      userId_channel_externalId: {
        userId,
        channel: "TIKTOK",
        externalId: payload.advertiserId,
      },
    },
    update: {
      name: payload.accountName,
      accessToken: payload.accessToken,
      lastSyncedAt: new Date(),
    },
    create: {
      userId,
      channel: "TIKTOK",
      externalId: payload.advertiserId,
      name: payload.accountName,
      accessToken: payload.accessToken,
      lastSyncedAt: new Date(),
    },
  });
}

export async function getTikTokAdsAccessToken(userId: string, advertiserId: string) {
  const account = await prisma.adAccount.findUnique({
    where: {
      userId_channel_externalId: {
        userId,
        channel: "TIKTOK",
        externalId: advertiserId,
      },
    },
  });

  return account?.accessToken || null;
}

export async function getUserTikTokAdsAccounts(userId: string) {
  return prisma.adAccount.findMany({
    where: {
      userId,
      channel: "TIKTOK",
    },
  });
}
