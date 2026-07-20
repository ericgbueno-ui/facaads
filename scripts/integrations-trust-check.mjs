import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");
const sync = read("src/app/api/sync/all-channels/route.ts");
assert.match(sync, /syncGoogleAdsAccount/, "Sincronizador canônico precisa executar Google real");
assert.match(sync, /syncTikTokAdAccount/, "Sincronizador canônico precisa executar TikTok real");
assert.match(sync, /fetchMetaCampaignInsights/, "Sincronizador canônico precisa executar Meta real");
assert.match(sync, /somente importação CSV auditável/, "Shopee deve declarar a origem importada");

const whatsappWebhook = read("src/app/api/webhooks/whatsapp/route.ts");
assert.match(whatsappWebhook, /x-hub-signature-256/, "Webhook WhatsApp deve validar assinatura");
assert.doesNotMatch(whatsappWebhook, /seu_token_aqui/, "Webhook não pode usar token padrão");
const whatsappSend = read("src/lib/whatsapp/send-message.ts");
assert.match(whatsappSend, /graph\.facebook\.com\/v21\.0/, "Envio deve usar WhatsApp Cloud API oficial");
assert.match(whatsappSend, /WHATSAPP_NOT_CONFIGURED/, "Envio não configurado deve falhar explicitamente");

for (const provider of ["meta", "google", "tiktok"]) {
  const connect = read(`src/app/api/auth/${provider}/connect/route.ts`);
  assert.match(connect, /validateCompanyAccess/, `${provider} deve validar acesso ao tenant`);
  assert.match(connect, /companyId/, `${provider} deve persistir vínculo com tenant`);
}

const genericSync = read("src/app/api/v1/integrations/sync/route.ts");
assert.match(genericSync, /USE_CANONICAL_SYNC/, "Atalho de sync não auditável deve permanecer bloqueado");
const metaCron = read("src/app/api/cron/sync-ads/route.ts");
assert.match(metaCron, /getMetaAccessToken/, "Meta cron must use the canonical credential");
assert.doesNotMatch(metaCron, /META_SYSTEM_USER_TOKEN|META_AD_ACCOUNT_IDS/, "Legacy Meta configuration cannot drive sync");
assert.match(metaCron, /companyId:\s*\{\s*not:\s*null\s*\}/, "Meta cron must only sync tenant-linked accounts");

console.log("Integration trust checks: OK");
