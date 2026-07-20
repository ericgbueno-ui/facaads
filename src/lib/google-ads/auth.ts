import { prisma } from "@/lib/prisma";

interface GoogleAdsTokenPayload {
  companyId: string;
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
      companyId: payload.companyId,
      lastSyncedAt: new Date(),
    },
    create: {
      channel: "GOOGLE",
      externalAccountId: payload.customerId,
      name: payload.accountName,
      refreshToken: payload.refreshToken,
      companyId: payload.companyId,
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

export async function getUserGoogleAdsAccounts(companyIds: string[]) {
  return prisma.adAccount.findMany({
    where: {
      channel: "GOOGLE",
      companyId: { in: companyIds },
    },
  });
}
