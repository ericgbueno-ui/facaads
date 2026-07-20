# Etapa 3 — Integrações reais

Implementação de código concluída em 20/07/2026.

## Canais

- Meta Ads: Graph API oficial, métricas diárias por campanha e origem `LIVE`.
- Google Ads: OAuth oficial, GAQL, métricas diárias por campanha e origem `LIVE`.
- TikTok Ads: Business API oficial, relatório diário e origem `LIVE`.
- Shopee Ads: não há credenciais oficiais configuradas; somente CSV, marcado como `IMPORTED`.
- WhatsApp: Cloud API oficial para envio; webhook com verificação HMAC `x-hub-signature-256`.

## Segurança aplicada

- conexão vinculada obrigatoriamente a uma empresa;
- acesso à empresa validado no servidor;
- listagem de contas limitada às empresas do usuário;
- integrações cadastradas manualmente começam em `pending_validation`;
- sincronizador canônico: `POST /api/sync/all-channels`;
- rota genérica antiga de fila retorna `USE_CANONICAL_SYNC`;
- ausência de credenciais retorna estado não configurado, nunca sucesso fictício.

## Credenciais presentes no ambiente

- Meta access token: presente;
- Google OAuth, refresh token e developer token: presentes;
- TikTok access token: presente;
- Shopee Partner API: ausente;
- WhatsApp Cloud API: ausente.

Nenhum canal pode ser considerado conectado apenas pela presença de variável de ambiente. É necessária uma conta vinculada a uma empresa e validação real no provedor.

## Dependência pendente

A migração da Etapa 2 continua bloqueada pelo `Schema engine error` do Prisma no Neon. Ela precisa ser aplicada antes de publicar as Etapas 2 e 3.
