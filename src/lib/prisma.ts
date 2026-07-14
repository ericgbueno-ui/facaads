import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("DATABASE_URL não está definida - Prisma será desativado");
    return null;
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

let prismaInstance: PrismaClient | null = null;

export function getPrisma() {
  if (!prismaInstance) {
    prismaInstance = createPrismaClient() as PrismaClient;
  }
  return prismaInstance;
}

// For backward compatibility
export const prisma = {
  get user() { return getPrisma().user; },
  get account() { return getPrisma().account; },
  get session() { return getPrisma().session; },
  get verificationToken() { return getPrisma().verificationToken; },
  get adAccount() { return getPrisma().adAccount; },
  get adCampaign() { return getPrisma().adCampaign; },
  get metricSnapshot() { return getPrisma().metricSnapshot; },
  get adChannel() { return getPrisma().adChannel; },
} as any;
