# Etapa 2 — Rastreabilidade e saúde dos dados

Implementação de código concluída em 20/07/2026.

## Entregas

- enum `DataOrigin`: `LIVE`, `MANUAL`, `IMPORTED`, `DEMO`;
- procedência em métricas, conversões, leads, vendas e mensagens;
- sistema e identificador externo da origem;
- horário de coleta e usuário responsável quando aplicável;
- exclusão de registros `DEMO` dos KPIs do dashboard;
- filtros confiáveis nos relatórios e listagens de vendas/leads;
- correção da extração de IDs de empresas no middleware multi-tenant;
- API autenticada `/api/v1/companies/[companyId]/data-health`;
- página `/companies/[id]/data-health`;
- teste automatizado `npm run test:data-trust`;
- migração aditiva em `prisma/migrations/20260720_data_provenance/migration.sql`.

## Estado do banco

A migração está versionada, mas o comando `prisma migrate deploy` não foi concluído no banco Neon: o Prisma retornou `Schema engine error` em três verificações consecutivas, sem diagnóstico adicional. Nenhum SQL alternativo foi executado para não quebrar o histórico de migrations.

Antes de publicar esta versão, é obrigatório corrigir a conectividade do Prisma Migrate e executar:

```bash
npx prisma migrate deploy
```

O código não deve ser implantado antes de a migração ser confirmada no banco.
