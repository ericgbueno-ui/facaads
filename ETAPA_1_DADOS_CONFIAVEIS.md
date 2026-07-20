# Etapa 1 — Dados confiáveis

Status: implementada em 20/07/2026.

## Regra operacional

O sistema não pode substituir falhas, ausência de dados ou integrações não configuradas por métricas demonstrativas. Dados exibidos no fluxo operacional devem ter origem real e rastreável.

## Alterações aplicadas

- removidos os fallbacks `mock-db` e `sample-data` do dashboard;
- falhas do dashboard agora retornam `503` e são exibidas como indisponibilidade;
- períodos sem registros exibem zeros e estado vazio;
- removidos seeds sintéticos rotulados como dados reais;
- desativado provisionamento administrativo por HTTP;
- removidas credenciais fixas da autenticação;
- sincronizações simuladas não retornam mais métricas inventadas;
- conversões Meta, Google e TikTok sem credenciais falham explicitamente;
- mensagens de WhatsApp não são persistidas como enviadas sem integração real;
- dashboard agregado exige autenticação e limita consultas às empresas do usuário.

## Estado das integrações

- Meta Ads: sincronização real disponível apenas quando há conta e token válidos.
- Google Ads: não configurado.
- TikTok Ads: não configurado.
- Shopee Ads: não configurado.
- WhatsApp Cloud API: envio não configurado.
- Instagram Graph API: coleta não configurada.

Documentos históricos que declaram “100%”, “dados reais” ou “pronto para produção” não devem ser usados como fonte de status. Este documento prevalece até uma nova auditoria técnica validada.
