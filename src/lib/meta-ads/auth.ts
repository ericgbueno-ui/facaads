import { prisma } from "@/lib/prisma";

interface MetaAccessTokenPayload {
  accessToken: string;
  businessAccountId: string; // Ad Account ID
  accountName: string;
}

export async function storeMetaAccessToken(payload: MetaAccessTokenPayload) {
  return prisma.adAccount.upsert({
    where: {
      channel_externalAccountId: {
        channel: "META",
        externalAccountId: payload.businessAccountId,
      },
    },
    update: {
      name: payload.accountName,
      accessToken: payload.accessToken,
      lastSyncedAt: new Date(),
    },
    create: {
      channel: "META",
      externalAccountId: payload.businessAccountId,
      name: payload.accountName,
      accessToken: payload.accessToken,
      lastSyncedAt: new Date(),
    },
  });
}

export async function getMetaAccessToken(accountId: string) {
  const account = await prisma.adAccount.findUnique({
    where: {
      channel_externalAccountId: {
        channel: "META",
        externalAccountId: accountId,
      },
    },
  });

  return account?.accessToken || null;
}

export async function getUserMetaAccounts() {
  return prisma.adAccount.findMany({
    where: {
      channel: "META",
    },
  });
}
