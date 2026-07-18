# 🚀 PRÓXIMOS PASSOS - IMPLEMENTAÇÃO HERGÉ AGENCY

---

## 📌 RESUMO DA AUDITORIA

### ✅ Concluído
- [x] Mapeamento completo do código existente
- [x] Documentação de 25 endpoints
- [x] Análise de 66 arquivos TypeScript
- [x] Esquema do banco de dados desenhado
- [x] Identificação de 11 novos modelos
- [x] Planejamento de 7 fases de implementação

### 📊 Análise de Risco
| Aspecto | Risco | Mitigação |
|--------|-------|-----------|
| **Multi-tenancy** | 🟡 Médio | Middleware de validação em cada request |
| **Migration DB** | 🟡 Médio | Testes em staging antes de prod |
| **Backwards Compatibility** | 🟢 Baixo | Adicionar companyId como opcional |
| **Performance** | 🟢 Baixo | Índices bem planejados |

---

## 🎯 FASE 1: FUNDAÇÃO (Semana 1-2)

### Tarefas Mínimas Viáveis

#### 1.1 - Database
- [ ] Criar migration: `001_add_company_and_users.sql`
- [ ] Adicionar modelos: Company, CompanyUser, Permission
- [ ] Estender User com `defaultCompanyId`
- [ ] Estender AdAccount com `companyId` (opcional)
- [ ] Testar migrations em DB local

#### 1.2 - Auth Middleware
- [ ] Criar `src/lib/auth-middleware.ts`
- [ ] Validar `company_id` em cada request protegido
- [ ] Verificar permissão do usuário na empresa
- [ ] Retornar 403 se acesso negado

#### 1.3 - Gestão de Empresas
- [ ] Criar endpoints:
  - `POST /api/v1/companies` - Criar empresa
  - `GET /api/v1/companies` - Listar empresas do usuário
  - `GET /api/v1/companies/:id` - Detalhe
  - `PUT /api/v1/companies/:id` - Editar
- [ ] Validar com Zod
- [ ] Testar endpoints

#### 1.4 - Dashboard Master
- [ ] Criar página `/companies`
- [ ] Listar empresas do usuário
- [ ] Card para criar nova empresa
- [ ] Link para entrar em empresa

#### 1.5 - Testes
- [ ] Testes unitários para auth middleware
- [ ] Testes E2E para criação de empresa
- [ ] Testes de isolamento de dados

---

## 📚 FASE 2: CRM (Semana 2-3)

### Pré-requisito
- Fase 1 concluída

### Tarefas

#### 2.1 - Modelos CRM
- [ ] Criar migrations:
  - `002_add_crm_models.sql` (Lead, CRMPipeline, CRMStage)
  - `003_add_lead_notes_activities.sql`
- [ ] Implementar validações Zod

#### 2.2 - Endpoints de Lead
- [ ] `POST /api/v1/companies/:id/leads` - Criar
- [ ] `GET /api/v1/companies/:id/leads` - Listar
- [ ] `GET /api/v1/companies/:id/leads/:id` - Detalhe
- [ ] `PUT /api/v1/companies/:id/leads/:id` - Editar
- [ ] `DELETE /api/v1/companies/:id/leads/:id` - Deletar

#### 2.3 - Endpoints de Pipeline
- [ ] `POST /api/v1/companies/:id/pipelines` - Criar
- [ ] `GET /api/v1/companies/:id/pipelines` - Listar
- [ ] `PUT /api/v1/companies/:id/pipelines/:id` - Editar
- [ ] `POST /api/v1/companies/:id/pipelines/:id/stages` - Adicionar stage

#### 2.4 - Páginas CRM
- [ ] `/companies/:id/crm` - Dashboard CRM
- [ ] `/companies/:id/crm/leads` - Lista de leads
- [ ] `/companies/:id/crm/leads/:id` - Detalhe + notas + atividades
- [ ] `/companies/:id/crm/pipelines` - Gerenciar pipelines

#### 2.5 - Componentes
- [ ] Kanban board para pipeline
- [ ] Card de lead
- [ ] Modal para criar/editar lead
- [ ] Timeline de atividades

---

## 💬 FASE 3: WHATSAPP (Semana 3-4)

### Pré-requisito
- Fase 2 concluída

### Tarefas

#### 3.1 - Modelos WhatsApp
- [ ] Criar migration `004_add_whatsapp_models.sql`
- [ ] Adicionar: WhatsAppConversation, WhatsAppMessage, AIAnalysis

#### 3.2 - Integração WhatsApp
- [ ] Estudar [WhatsApp Business Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)
- [ ] Criar `src/lib/whatsapp/auth.ts`
- [ ] Criar `src/lib/whatsapp/sync.ts`
- [ ] Criar `src/lib/whatsapp/webhooks.ts`

#### 3.3 - Endpoints WhatsApp
- [ ] `POST /api/v1/companies/:id/integrations/whatsapp` - Conectar
- [ ] `GET /api/v1/companies/:id/whatsapp/conversations` - Listar
- [ ] `GET /api/v1/companies/:id/whatsapp/:id` - Detalhe conversa
- [ ] `POST /api/v1/companies/:id/whatsapp/:id/send` - Enviar mensagem
- [ ] `POST /api/webhooks/whatsapp` - Webhook de entrada

#### 3.4 - IA Analysis
- [ ] Integrar Claude API
- [ ] Criar prompts para análise:
  - Sentimento da conversa
  - Detecção de objeções
  - Resumo de conversa
  - Recomendação de próxima ação
- [ ] Criar background job para análise

#### 3.5 - Páginas WhatsApp
- [ ] `/companies/:id/whatsapp` - Lista de conversas
- [ ] `/companies/:id/whatsapp/:id` - Detalhe + chat + análise IA

---

## 💰 FASE 4: FINANCEIRO (Semana 4-5)

### Pré-requisito
- Fase 1 concluída

### Tarefas

#### 4.1 - Expandir Modelo Sale
- [ ] Criar migration `005_expand_sales_model.sql`
- [ ] Adicionar: profit, commission, paymentStatus, paymentMethod

#### 4.2 - Endpoints Financeiro
- [ ] `POST /api/v1/companies/:id/sales` - Registrar venda
- [ ] `GET /api/v1/companies/:id/sales` - Listar
- [ ] `PUT /api/v1/companies/:id/sales/:id` - Editar
- [ ] `GET /api/v1/companies/:id/sales/report` - Relatório

#### 4.3 - Dashboard Financeiro
- [ ] Criar página `/companies/:id/financeiro`
- [ ] KPIs: Receita, Lucro, Comissão, Ticket médio
- [ ] Gráfico: Receita por período
- [ ] Tabela: Vendas recentes

#### 4.4 - Relatórios
- [ ] Implementar `src/lib/reports/generate.ts`
- [ ] Exportar: PDF, Excel, CSV
- [ ] Filtros: Data, fonte, vendedor

---

## 🔌 FASE 5: INTEGRAÇÕES (Semana 5-6)

### Pré-requisito
- Fase 1 concluída

### Tarefas

#### 5.1 - Modelo de Integração
- [ ] Criar migration `006_add_integrations_model.sql`
- [ ] Adicionar: CompanyIntegration

#### 5.2 - Endpoints de Integração
- [ ] `POST /api/v1/companies/:id/integrations` - Conectar
- [ ] `GET /api/v1/companies/:id/integrations` - Listar
- [ ] `PUT /api/v1/companies/:id/integrations/:id` - Editar config
- [ ] `DELETE /api/v1/companies/:id/integrations/:id` - Desconectar
- [ ] `POST /api/v1/companies/:id/integrations/:id/test` - Testar

#### 5.3 - Adaptar Integrações Existentes
- [ ] Meta Ads: Fazer multi-tenant
- [ ] Google Ads: Fazer multi-tenant
- [ ] TikTok Ads: Fazer multi-tenant
- [ ] Shopee Ads: Fazer multi-tenant

#### 5.4 - Página de Integrações
- [ ] `/companies/:id/integrations` - Dashboard
- [ ] Card para cada integração
- [ ] Modal de conexão
- [ ] Histórico de sincronização

---

## 👥 FASE 6: PERMISSÕES (Semana 6-7)

### Pré-requisito
- Fase 1 concluída

### Tarefas

#### 6.1 - Modelo de Permissões
- [ ] Criar migration `007_add_permissions_model.sql`
- [ ] Adicionar: Permission, CompanyUserPermission

#### 6.2 - Roles Padrões
- [ ] Admin - Acesso completo
- [ ] Manager - Gerenciar leads, vendas, usuários
- [ ] Analyst - Visualizar relatórios, não editar
- [ ] Finance - Apenas vendas e relatórios financeiros

#### 6.3 - Endpoints de Permissões
- [ ] `POST /api/v1/companies/:id/users` - Convidar usuário
- [ ] `GET /api/v1/companies/:id/users` - Listar
- [ ] `PUT /api/v1/companies/:id/users/:id` - Editar role
- [ ] `DELETE /api/v1/companies/:id/users/:id` - Remover

#### 6.4 - Audit Trail
- [ ] Criar migration `008_add_audit_logs.sql`
- [ ] Log de toda ação: create, update, delete
- [ ] Endpoint: `GET /api/v1/companies/:id/audit` - Listar

#### 6.5 - Página de Usuários
- [ ] `/companies/:id/settings/users` - Gerenciar
- [ ] Tabela de usuários
- [ ] Modal de convite
- [ ] Mudança de role

---

## 🚀 FASE 7: DEPLOY (Semana 7-8)

### Pré-requisito
- Fases 1-6 concluídas

### Tarefas

#### 7.1 - Testes
- [ ] Testes unitários: 80% cobertura
- [ ] Testes E2E: fluxos críticos
- [ ] Teste de performance
- [ ] Teste de segurança

#### 7.2 - Documentação
- [ ] Comentários no código
- [ ] README atualizado
- [ ] OpenAPI/Swagger
- [ ] Guia de deploy

#### 7.3 - Deploy Staging
- [ ] Fazer backup do banco
- [ ] Executar migrations
- [ ] Testar em staging
- [ ] Monitorar erros

#### 7.4 - Deploy Produção
- [ ] Backup do banco de produção
- [ ] Executar migrations
- [ ] Monitorar uptime
- [ ] Estar pronto para rollback

#### 7.5 - Pós-Deploy
- [ ] Monitorar logs
- [ ] Coletar feedback
- [ ] Documentar issues
- [ ] Planejar melhorias

---

## ⏱️ CRONOGRAMA

```
Semana 1   │ Fundação (Auth, Company, Dashboard)
Semana 2   │ CRM (Leads, Pipeline)
Semana 3   │ WhatsApp (Conversas, IA)
Semana 4   │ Financeiro (Vendas, Relatórios)
Semana 5   │ Integrações (Ads multi-tenant)
Semana 6   │ Permissões (Roles, Audit)
Semana 7   │ Deploy (Testes, Documentação)
Semana 8   │ Pós-Deploy (Ajustes)
```

---

## 🎯 PRIORIDADES

### 🔴 Crítico (Deve fazer)
1. Database schema (Company, CompanyUser)
2. Auth middleware (Isolamento de dados)
3. Endpoints de empresa
4. Dashboard master

### 🟡 Importante (Deveria fazer)
1. CRM (Lead, Pipeline)
2. WhatsApp (Conversas)
3. Financeiro (Sales)

### 🟢 Nice to have (Poderia fazer depois)
1. IA automática
2. Relatórios automáticos
3. Análise avançada

---

## 📋 CHECKLIST PRÉ-IMPLEMENTAÇÃO

- [ ] Criar branch `feat/herge-agency` 
- [ ] Estudar código existente (✅ Feito)
- [ ] Desenhar schema Prisma (✅ Feito)
- [ ] Planejar migrações
- [ ] Configurar ambiente de teste
- [ ] Criar testes unitários base
- [ ] Documentar decisões de arquitetura
- [ ] Comunicar timeline ao cliente
- [ ] Preparar staging environment
- [ ] Backup automático do banco

---

## 🛠️ FERRAMENTAS NECESSÁRIAS

### Já Instaladas ✅
- Next.js 16.2.10
- Prisma 6.19.3
- Postgres
- TypeScript
- Zod
- TailwindCSS

### Precisa Instalar
- [ ] `@prisma/migrate` (já vem com Prisma)
- [ ] `openapi-generator-cli` (opcional, para docs)
- [ ] `jest` + `@testing-library` (testes)
- [ ] `supertest` (testes de API)

### Precisa Configurar
- [ ] GitHub Actions CI/CD
- [ ] Pre-commit hooks (lint + format)
- [ ] Environment variables (staging vs prod)
- [ ] Monitoramento (Sentry ou similar)

---

## 📞 COMUNICAÇÃO COM CLIENTE

### Preparar para Apresentação
1. **Resumo da Auditoria** (RESUMO_AUDITORIA.md)
2. **Timeline de 8 semanas**
3. **Demonstração do sistema atual**
4. **Validação de requisitos**

### Milestones a Comunicar
- [ ] Semana 2: Company management working
- [ ] Semana 4: CRM + WhatsApp beta
- [ ] Semana 6: Financeiro + Relatórios
- [ ] Semana 8: Launch

---

## ⚠️ RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|--------|-----------|
| Migration DB quebrar | Média | Alto | Testes locais, backup, rollback plan |
| Performance degradar | Baixa | Médio | Índices, caching, testes load |
| Falta de especificação | Média | Alto | Validar requisitos com cliente |
| Escopo creep | Alta | Alto | Priorizar MVP, planejar fases |

---

## 📖 DOCUMENTAÇÃO A MANTER ATUALIZADA

1. **AUDITORIA_COMPLETA.md** - Análise atual
2. **RESUMO_AUDITORIA.md** - Executivo
3. **SCHEMA_PRISMA_NOVO.md** - Schema detalhado
4. **PROXIMOS_PASSOS.md** - Este arquivo
5. **README.md** - Documentação do projeto
6. **MIGRATION_GUIDE.md** - Guia de migrações (criar)
7. **API_DOCS.md** - Documentação de APIs (criar)

---

## 🎓 LEARNING & SKILLS

Para executar este plano com sucesso, certifique-se de dominar:

- ✅ Next.js App Router
- ✅ Prisma ORM
- ✅ PostgreSQL
- ✅ TypeScript
- ✅ REST API design
- ✅ Multi-tenancy patterns
- 🟡 WhatsApp Business Cloud API
- 🟡 Claude API (IA)
- 🟡 Security best practices

---

**Próxima reunião: Apresentar auditoria ao cliente e validar prioridades**

**Estimativa total: 7-8 semanas**  
**Data prevista: Setembro 2026**
