import { prisma } from "@/lib/prisma";

interface MetaAccessTokenPayload {
  accessToken: string;
  businessAccountId: string; // Ad Account ID
  accountName: string;
}

export async function storeMetaAccessToken(
  userId: string,
  payload: MetaAccessTokenPayload
) {
  return prisma.adAccount.upsert({
    where: {
      userId_channel_externalId: {
        userId,
        channel: "META",
        externalId: payload.businessAccountId,
      },
    },
    update: {
      name: payload.accountName,
      accessToken: payload.accessToken,
      lastSyncedAt: new Date(),
    },
    create: {
      userId,
      channel: "META",
      externalId: payload.businessAccountId,
      name: payload.accountName,
      accessToken: payload.accessToken,
      lastSyncedAt: new Date(),
    },
  });
}

export async function getMetaAccessToken(userId: string, accountId: string) {
  const account = await prisma.adAccount.findUnique({
    where: {
      userId_channel_externalId: {
        userId,
        channel: "META",
        externalId: accountId,
      },
    },
  });

  return account?.accessToken || null;
}

export async function getUserMetaAccounts(userId: string) {
  return prisma.adAccount.findMany({
    where: {
      userId,
      channel: "META",
    },
  });
}
