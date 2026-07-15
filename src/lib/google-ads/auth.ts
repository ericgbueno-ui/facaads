import { prisma } from "@/lib/prisma";

interface GoogleAdsTokenPayload {
  refreshToken: string;
  customerId: string; // Customer ID (ex: 1234567890)
  accountName: string;
}

export async function storeGoogleAdsToken(payload: GoogleAdsTokenPayload) {
  return prisma.adAccount.upsert({
    where: {
      channel_externalAccountId: {
        channel: "GOOGLE",
        externalAccountId: payload.customerId,
      },
    },
    update: {
      name: payload.accountName,
      refreshToken: payload.refreshToken,
      lastSyncedAt: new Date(),
    },
    create: {
      channel: "GOOGLE",
      externalAccountId: payload.customerId,
      name: payload.accountName,
      refreshToken: payload.refreshToken,
      lastSyncedAt: new Date(),
    },
  });
}

export async function getGoogleAdsRefreshToken(customerId: string) {
  const account = await prisma.adAccount.findUnique({
    where: {
      channel_externalAccountId: {
        channel: "GOOGLE",
        externalAccountId: customerId,
      },
    },
  });

  return account?.refreshToken || null;
}

export async function getUserGoogleAdsAccounts() {
  return prisma.adAccount.findMany({
    where: {
      channel: "GOOGLE",
    },
  });
}
