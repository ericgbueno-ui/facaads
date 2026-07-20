import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");

assert.equal(existsSync(resolve(root, "src/lib/mock-db.ts")), false, "mock-db não pode existir no fluxo operacional");
assert.equal(existsSync(resolve(root, "src/lib/dashboard/sample-data.ts")), false, "sample-data não pode existir no fluxo operacional");
assert.equal(existsSync(resolve(root, "prisma/seed-data.ts")), false, "seed sintético não pode existir");

const schema = read("prisma/schema.prisma");
assert.match(schema, /enum DataOrigin[\s\S]*LIVE[\s\S]*MANUAL[\s\S]*IMPORTED[\s\S]*DEMO/);
for (const model of ["MetricSnapshot", "ConversionEvent", "Lead", "Sale", "WhatsAppMessage"]) {
  const block = schema.match(new RegExp(`model ${model} \\{[\\s\\S]*?\\n\\}`))?.[0] ?? "";
  assert.match(block, /dataOrigin\s+DataOrigin/, `${model} precisa registrar dataOrigin`);
  assert.match(block, /sourcedAt\s+DateTime/, `${model} precisa registrar sourcedAt`);
}

const dashboard = read("src/app/api/dashboard/overview/route.ts");
assert.match(dashboard, /dataOrigin:\s*\{\s*not:\s*"DEMO"/, "Dashboard deve excluir DEMO dos KPIs");
assert.doesNotMatch(dashboard, /mockDashboardData|mock-db/, "Dashboard não pode usar fallback mock");

assert.doesNotMatch(dashboard, /salesRevenue\s*>\s*0\s*\?\s*salesRevenue\s*:\s*adRevenue/, "Media revenue cannot replace confirmed sales");
assert.doesNotMatch(dashboard, /salesPerCampaign\.get\(id\)\s*\|\|\s*c\.conversions/, "Media conversions cannot replace attributed sales");
assert.match(dashboard, /paymentStatus:\s*"completed"/, "Financial KPIs must use completed payments");
assert.match(dashboard, /revenueSource:\s*"completed_sales"/, "Dashboard must publish its revenue definition");

const kpiService = read("src/core/revenue-intelligence/services/kpi-service.ts");
assert.doesNotMatch(kpiService, /deals:\s*campaign\.leads\.length/, "Leads cannot be presented as deals");
assert.match(kpiService, /sales:\s*\{\s*where:[\s\S]*paymentStatus:\s*'completed'/, "Campaign KPI must filter completed sales");
assert.match(kpiService, /totalRevenue\s*=\s*campaign\.sales\.reduce/, "Campaign revenue must come from confirmed sales");

const authMiddleware = read("src/lib/auth-middleware.ts");
assert.match(authMiddleware, /validateCompanyAccess/, "Isolamento por empresa precisa ser validado");
assert.match(authMiddleware, /\/companies\\\/\(\[\^\/\]\+\)/, "IDs de empresa completos precisam ser extraídos da rota");

const healthRoute = read("src/app/api/v1/companies/[companyId]/data-health/route.ts");
assert.match(healthRoute, /validateCompanyAccess/, "Saúde dos dados deve respeitar multi-tenancy");

console.log("Data trust checks: OK");
