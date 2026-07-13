import { prisma } from "@/lib/prisma";

interface GoogleAdsTokenPayload {
  refreshToken: string;
  customerId: string; // Customer ID (ex: 1234567890)
  accountName: string;
}

export async function storeGoogleAdsToken(
  userId: string,
  payload: GoogleAdsTokenPayload
) {
  return prisma.adAccount.upsert({
    where: {
      userId_channel_externalId: {
        userId,
        channel: "GOOGLE",
        externalId: payload.customerId,
      },
    },
    update: {
      name: payload.accountName,
      refreshToken: payload.refreshToken,
      lastSyncedAt: new Date(),
    },
    create: {
      userId,
      channel: "GOOGLE",
      externalId: payload.customerId,
      name: payload.accountName,
      refreshToken: payload.refreshToken,
      lastSyncedAt: new Date(),
    },
  });
}

export async function getGoogleAdsRefreshToken(userId: string, customerId: string) {
  const account = await prisma.adAccount.findUnique({
    where: {
      userId_channel_externalId: {
        userId,
        channel: "GOOGLE",
        externalId: customerId,
      },
    },
  });

  return account?.refreshToken || null;
}

export async function getUserGoogleAdsAccounts(userId: string) {
  return prisma.adAccount.findMany({
    where: {
      userId,
      channel: "GOOGLE",
    },
  });
}
