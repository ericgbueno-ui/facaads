#!/usr/bin/env npx ts-node
/**
 * Test database connection
 * Run with: npm exec ts-node test-db-connection.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

async function testConnection() {
  console.log("📌 DATABASE_URL:", process.env.DATABASE_URL ? "✅ Carregada" : "❌ Não encontrada");

  const prisma = new PrismaClient();

  try {
    console.log("🔌 Testando conexão com banco de dados...\n");

    // Test 1: Simple query
    console.log("1️⃣  Executando query simples...");
    const result = await prisma.$queryRaw`SELECT 1 as success`;
    console.log("✅ Query executada:", result);

    // Test 2: Check tables
    console.log("\n2️⃣  Verificando tabelas...");
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log("✅ Tabelas encontradas:");
    (tables as any[]).forEach((t) => console.log(`   - ${t.table_name}`));

    // Test 3: Count records
    console.log("\n3️⃣  Contando registros...");
    const userCount = await prisma.user.count();
    const campaignCount = await prisma.campaign.count();
    const snapshotCount = await prisma.metricSnapshot.count();
    const conversionCount = await prisma.conversionEvent.count();
    const alertCount = await prisma.alert.count();

    console.log(`✅ Registros na base:`);
    console.log(`   - Usuários: ${userCount}`);
    console.log(`   - Campanhas: ${campaignCount}`);
    console.log(`   - Snapshots: ${snapshotCount}`);
    console.log(`   - Eventos de conversão: ${conversionCount}`);
    console.log(`   - Alertas: ${alertCount}`);

    console.log("\n✨ Conexão bem-sucedida!");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Erro de conexão:");
    console.error((err as Error).message);

    if ((err as any).code === "P1002") {
      console.error("\n💡 Sugestão: Verifique se o banco está acessível");
      console.error("   - DATABASE_URL está correta?");
      console.error("   - Firewall permite conexão?");
      console.error("   - Banco de dados existe?");
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
