# 📊 AUDITORIA COMPLETA - PROJETO HERGÉ

**Data da Auditoria:** 2026-07-18  
**Versão do Projeto:** 0.1.0  
**Branch:** master  
**Status:** ✅ Clean

---

## 1️⃣ ESTRUTURA EXISTENTE

### 📁 Diretório de Fontes
```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (25 endpoints)
│   ├── dashboard/                # Dashboard principal (página)
│   ├── login/                    # Login (página)
│   ├── meta-ads/                 # Meta Ads (página)
│   ├── projects/                 # Seleção de projetos (página)
│   ├── settings/                 # Configurações (página)
│   ├── layout.tsx                # Layout global
│   ├── page.tsx                  # Página raiz (redirect)
│   └── globals.css               # Estilos globais
├── components/                   # Componentes React
│   ├── dashboard/                # Componentes do dashboard
│   ├── dashboard/                # Componentes de KPI e gráficos
│   └── providers.tsx             # Provedores (Auth, etc)
├── lib/                          # Lógica de negócio
│   ├── auth.ts                   # NextAuth com Credentials
│   ├── prisma.ts                 # Cliente Prisma
│   ├── ads/                      # Sincronização genérica de ads
│   ├── conversions/              # Tracking de conversões (Conversions API)
│   ├── dashboard/                # Queries de dashboard
│   ├── google-ads/               # Integração Google Ads
│   ├── meta-ads/                 # Integração Meta Ads
│   ├── shopee-ads/               # Integração Shopee Ads
│   └── tiktok-ads/               # Integração TikTok Ads
├── types/                        # Tipos TypeScript
│   └── next-auth.d.ts            # Tipagem NextAuth
└── proxy.ts                      # (Não documentado)
```

---

## 2️⃣ BANCO DE DADOS (Prisma)

### 📋 Modelos Existentes

#### 🔐 Autenticação
- **User** - Usuário (NextAuth)
  - id, email, name, image, passwordHash, emailVerified, accounts, sessions

- **Account** - Conta OAuth (NextAuth)
  - Integração com Google, Meta, etc.

- **Session** - Sessão JWT (NextAuth)

#### 📊 Ads & Campaigns
- **AdAccount** (⭐ IMPORTANTE)
  - id, channel (META/GOOGLE/TIKTOK/SHOPEE)
  - externalAccountId, name, loginCustomerId
  - accessToken, refreshToken
  - lastSyncedAt, createdAt, updatedAt
  - Relacionamento: campaigns[]

- **Campaign**
  - id, adAccountId, externalCampaignId, name, objective
  - Relacionamento: snapshots[], conversions[], alerts[]

- **MetricSnapshot**
  - Data diária de cada campanha
  - date, spend, impressions, clicks, conversions, conversionValue
  - Contém payload bruto da API para auditoria

#### 💰 Conversões
- **ConversionEvent**
  - channel, sourceType (SHOPIFY/CRM/TYPEFORM/API/MANUAL/OTHER)
  - amount, externalId, metadata (JSON)
  - pushBackStatus ("pending", "sent", "failed")
  - Ligação com Campaign (soft delete via SetNull)

#### ⚠️ Alertas
- **Alert**
  - campaignId, severity (INFO/WARNING/CRITICAL)
  - type, message, threshold, currentValue
  - dismissedAt

---

## 3️⃣ ENDPOINTS DE API (25 endpoints)

### 🔐 Autenticação
```
POST   /api/auth/[...nextauth]              # NextAuth
POST   /api/auth/meta/connect               # OAuth Meta
POST   /api/auth/meta/connect-default       # OAuth Meta (default)
POST   /api/auth/meta/discover              # Descobrir business accounts
GET    /api/auth/meta/accounts              # Listar contas Meta
GET    /api/auth/meta/business-accounts     # Listar business accounts
POST   /api/auth/google/connect             # OAuth Google
GET    /api/auth/google/accounts            # Listar contas Google
POST   /api/auth/tiktok/connect             # OAuth TikTok
GET    /api/auth/tiktok/accounts            # Listar contas TikTok
POST   /api/auth/shopee/accounts            # Conectar Shopee
```

### 📊 Dashboard
```
GET    /api/dashboard/metrics               # Métricas agregadas
GET    /api/meta/overview                   # Overview Meta Ads
GET    /api/meta/insights                   # Insights Meta Ads
```

### 📈 Sincronização de Ads
```
GET    /api/cron/sync-ads                   # Sincronizar todas as contas
GET    /api/cron/sync-meta-ads              # Sincronizar Meta
GET    /api/cron/sync-google-ads            # Sincronizar Google
GET    /api/cron/sync-tiktok-ads            # Sincronizar TikTok
GET    /api/cron/detect-alerts              # Detectar alertas
```

### 💰 Conversões
```
POST   /api/webhooks/conversion             # Webhook de conversões
POST   /api/sales                           # Registrar venda manual
GET    /api/sales                           # Listar vendas
POST   /api/import/shopee-ads               # Importar Shopee
POST   /api/shopee/import                   # Import Shopee (duplicado?)
```

### 🌱 Utilitários
```
GET    /api/seed                            # Popular DB com dados de teste
GET    /api/reports/export-csv              # Exportar relatório CSV
```

---

## 4️⃣ TECNOLOGIAS

### Backend
- **Next.js 16.2.10** - Full-stack framework
- **Prisma 6.19.3** - ORM com adapter Neon
- **NextAuth 5.0.0-beta.31** - Autenticação
- **PostgreSQL** - Database
- **Neon Serverless** - Driver do banco

### Frontend
- **React 19.2.4** - UI library
- **TailwindCSS 4** - Styling
- **Recharts 3.9.2** - Gráficos

### IA
- **Anthropic SDK 0.105.0** - Claude API (integração preparada)

### Autenticação
- **bcryptjs** - Hash de senhas
- **Zod** - Validação

### Utilitários
- **tsx** - TypeScript executor

---

## 5️⃣ FUNCIONALIDADES IMPLEMENTADAS

### ✅ Autenticação
- [x] Login com Credentials (email/password)
- [x] Autenticação via OAuth (Meta, Google, TikTok)
- [x] JWT Sessions
- [x] NextAuth integrado com Prisma

### ✅ Integrações de Ads
- [x] Meta Ads (Business Accounts)
- [x] Google Ads
- [x] TikTok Ads
- [x] Shopee Ads
- [x] Sincronização automática via cron
- [x] Armazenamento de tokens

### ✅ Dashboard
- [x] Overview de contas
- [x] Métricas principais (impressões, cliques, conversões)
- [x] Cálculo de KPIs (CTR, CPC, CPM, CPA, ROAS)
- [x] Gráficos com Recharts
- [x] Dados de demonstração
- [x] Dados ao vivo (Meta)

### ✅ Conversões
- [x] Registrar vendas manuais
- [x] Tracking de origem (Campaign, AdSet, Ad)
- [x] Conversions API (Meta, Google, TikTok)
- [x] Webhook para webhooks externos
- [x] Suporte a múltiplas fontes

### ✅ Tipos de Veículo
- [x] Spin
- [x] Sedan
- [x] Modal de venda simplificado

### ✅ UI/UX
- [x] Design system consistente
- [x] Modo claro/escuro ready
- [x] Componentes reutilizáveis
- [x] Responsivo (mobile/tablet/desktop)
- [x] Gradientes e glassmorphism

---

## 6️⃣ O QUE PODE SER REAPROVEITADO

### 🎯 Para HERGÉ AGENCY

#### Autenticação (90% reutilizável)
- [x] NextAuth setup
- [x] JWT strategy
- [x] Prisma adapter
- [x] Estrutura de User/Account/Session
- **Necessário:** Adicionar campos de empresa, role, permissões

#### Integrações de Ads (100% reutilizável)
- [x] Meta Ads auth e sync
- [x] Google Ads auth e sync
- [x] TikTok Ads auth e sync
- [x] Shopee Ads auth e sync
- [x] Conversions API
- **Necessário:** Associar a empresa (multi-tenant)

#### Dashboard (70% reutilizável)
- [x] Estrutura de componentes
- [x] KPI cards
- [x] Gráficos
- [x] Layout
- **Necessário:** Adaptar para company-specific, adicionar filtros, adicionar mais integrações

#### Conversões (80% reutilizável)
- [x] Modelo ConversionEvent
- [x] Tracking de origem
- [x] Webhook
- [x] Manual tracking
- **Necessário:** Adicionar Lead CRM, adicionar campos adicionais (origem, UTM, dispositivo, etc)

#### Dados de Vendas (100% reutilizável)
- [x] Modelo e endpoint para vendas
- [x] Associação com conta e campanha
- **Necessário:** Expandir para incluir lucro, comissão, forma de pagamento

---

## 7️⃣ O QUE PRECISA SER MELHORADO

### 🔴 Problemas Encontrados

#### Autenticação
1. **Hardcoded credentials** - Email/senha em código (dev only, OK)
2. **Sem roles/permissões** - Todos os usuários têm acesso a tudo
3. **Sem validação de email** - Não há verificação de email
4. **Sem rate limiting** - APIs de autenticação não têm proteção

#### Multi-tenancy
1. **SEM isolamento de dados** - Não há campo de empresa nos modelos
2. **SEM permissões por empresa** - User acessa todas as contas
3. **SEM namespace** - AdAccounts não estão ligadas a empresa

#### Segurança
1. **Tokens não têm expiração** - accessToken pode ter validade indefinida
2. **Sem audit trail** - Não há log de ações
3. **Sem verificação de escopo** - User pode acessar qualquer conta

#### Performance
1. **Sem cache** - Todas as queries executam diretamente
2. **Sem paginação** - Endpoints retornam tudo de uma vez
3. **Sem índices específicos** - DB pode ser lenta com muitos dados

#### API
1. **Sem versionamento** - `/api/v1/`
2. **Sem documentação** - OpenAPI/Swagger
3. **Sem validação clara** - Alguns endpoints aceitam qualquer coisa

#### UI
1. **Sem feedback de erro** - Usuário não sabe por que falhou
2. **Sem validação de form** - Cliente aceita valores inválidos
3. **Sem loading states** - UI fica congelada

---

## 8️⃣ O QUE PRECISA SER CRIADO

### 🆕 Modelos Prisma Necessários

```typescript
// Empresas (multi-tenancy)
Company
├── id, name, segment, logo, status
├── contacts (responsável, telefone, whatsapp, cidade, estado)
├── urls (site, instagram, facebook, tiktok, shopee, google)
├── notes, createdAt, updatedAt
└── Relacionamentos: users[], leads[], crm_pipelines[], campaigns[], etc

// Gerenciamento de Usuários
CompanyUser
├── userId, companyId, role (admin/manager/analyst/finance)
└── permissions, createdAt

// CRM
Lead
├── company_id, origem, campanha, ad_set, ad, palavra_chave, utm
├── cidade, estado, data, hora, dispositivo
├── produto_interesse, valor_investido
├── pipeline_stage (Novo Lead / Contato / Orçamento / etc)
└── Relacionamentos: conversas_whatsapp[], eventos_ia[]

CRMPipeline
├── company_id, nome, status, ordem
└── stages[] (customizável por empresa)

CRMStage
├── pipeline_id, nome, ordem, cor
└── leads[]

// WhatsApp
WhatsAppConversation
├── company_id, lead_id, phone, status
├── ultima_interacao, tempo_resposta
├── vendedor, observacoes
└── mensagens[]

WhatsAppMessage
├── conversation_id, role (user/assistant), content, timestamp
└── ia_analysis (sentimento, objeções, etc)

// IA
AIAnalysis
├── conversation_id, lead_id, tipo (mensagens/produtos/interesses/objeções)
├── resultado (JSON), confiança
└── created_at

// Financeiro
Sale
├── company_id, lead_id, valor, lucro, comissão
├── origem, campanha, anuncio
├── forma_pagamento, data
└── cliente

// Integrações
CompanyIntegration
├── company_id, tipo (meta/google/tiktok/shopee/whatsapp/analytics)
├── credentials (encrypted)
├── status, last_sync
└── config (JSON)

// Permissões
Permission
├── name, description
└── roles[]

CompanyUserPermission
├── company_user_id, permission_id
└── granted_at
```

### 🆕 Endpoints Necessários

```
EMPRESAS
POST   /api/v1/companies                    # Criar empresa
GET    /api/v1/companies                    # Listar (do user)
GET    /api/v1/companies/:id                # Detalhe
PUT    /api/v1/companies/:id                # Editar
DELETE /api/v1/companies/:id                # Deletar

LEADS / CRM
POST   /api/v1/companies/:id/leads          # Criar lead
GET    /api/v1/companies/:id/leads          # Listar
GET    /api/v1/companies/:id/leads/:id      # Detalhe
PUT    /api/v1/companies/:id/leads/:id      # Editar
GET    /api/v1/companies/:id/leads/filter   # Filtros

PIPELINE
POST   /api/v1/companies/:id/pipelines      # Criar pipeline
GET    /api/v1/companies/:id/pipelines      # Listar
PUT    /api/v1/companies/:id/pipelines/:id  # Editar

WHATSAPP
GET    /api/v1/companies/:id/conversations  # Listar conversas
GET    /api/v1/companies/:id/conversations/:id # Detalhe
POST   /api/v1/companies/:id/conversations/:id/messages # Enviar

FINANCEIRO
POST   /api/v1/companies/:id/sales          # Registrar venda
GET    /api/v1/companies/:id/sales          # Listar
GET    /api/v1/companies/:id/sales/report   # Relatório

DASHBOARD
GET    /api/v1/companies/:id/dashboard      # Métricas gerais
GET    /api/v1/companies/:id/dashboard/kpis # KPIs
GET    /api/v1/dashboard/master             # Dashboard master (admin)

INTEGRAÇÕES
POST   /api/v1/companies/:id/integrations   # Conectar integração
GET    /api/v1/companies/:id/integrations   # Listar
PUT    /api/v1/companies/:id/integrations/:id # Editar
POST   /api/v1/companies/:id/integrations/:id/test # Testar

RELATÓRIOS
POST   /api/v1/companies/:id/reports        # Gerar relatório
GET    /api/v1/companies/:id/reports        # Listar
GET    /api/v1/companies/:id/reports/:id    # Detalhe
GET    /api/v1/companies/:id/reports/:id/export # Exportar (PDF/Excel/CSV)

USUÁRIOS
POST   /api/v1/companies/:id/users          # Convidar usuário
GET    /api/v1/companies/:id/users          # Listar
PUT    /api/v1/companies/:id/users/:id      # Editar permissões
DELETE /api/v1/companies/:id/users/:id      # Remover
```

### 🆕 Páginas Necessárias

```
DASHBOARD
/companies                                  # Seleção de empresas
/companies/:id                              # Dashboard principal
/companies/:id/analytics                    # Análise detalhada

CRM
/companies/:id/crm                          # Pipeline CRM
/companies/:id/crm/leads                    # Lista de leads
/companies/:id/crm/leads/:id                # Detalhe do lead

WHATSAPP
/companies/:id/whatsapp                     # Conversas
/companies/:id/whatsapp/:id                 # Detalhe conversa

INTEGRAÇÕES
/companies/:id/integrations                 # Gerenciar integrações
/companies/:id/integrations/:tipo           # Conectar integração

FINANCEIRO
/companies/:id/financeiro                   # Overview
/companies/:id/financeiro/vendas            # Vendas
/companies/:id/financeiro/relatorio         # Relatórios

CONFIGURAÇÕES
/companies/:id/settings                     # Configurações da empresa
/companies/:id/settings/usuarios            # Usuários
/companies/:id/settings/permissoes          # Permissões
/companies/:id/settings/integrações         # Integrações
```

---

## 9️⃣ IMPACTOS NO SISTEMA

### ✅ O que NÃO será afetado
- Autenticação existente (será estendida)
- Sincronização de ads (será reutilizada)
- Endpoints de OAuth (será estendida)
- Componentes UI (será reutilizada)
- Tecnologias (Next.js, Prisma, etc)

### ⚠️ O que SERÁ modificado
1. **Database Schema** - Adicionar 10+ novos modelos
2. **User Model** - Adicionar company_id, roles
3. **AdAccount Model** - Adicionar company_id
4. **Campaign Model** - Adicionar company_id (herdar de AdAccount)
5. **ConversionEvent Model** - Adicionar company_id, mais campos
6. **Auth Middleware** - Validar company_id em requests
7. **API Routes** - Adicionar prefixo /api/v1/, estruturar por empresa

### 🚀 Escalabilidade
- Multi-tenant ready
- Preparado para 10k+ empresas
- Database indexes para queries rápidas
- Paginação em todos os endpoints
- Caching em Redis (future)

---

## 🔟 ROADMAP DE IMPLEMENTAÇÃO

### FASE 1 - FUNDAÇÃO (Semana 1-2)
- [x] Auditoria completa ✅
- [ ] Schema Prisma (Company, CompanyUser, Lead, etc)
- [ ] Migrations
- [ ] Auth middleware para company isolation
- [ ] Dashboard master

### FASE 2 - CRM (Semana 2-3)
- [ ] Modelo de Lead completo
- [ ] CRM Pipeline dinâmico
- [ ] Páginas de CRM
- [ ] Filtros e buscas

### FASE 3 - WHATSAPP (Semana 3-4)
- [ ] Modelo de WhatsApp
- [ ] Integração com API oficial
- [ ] Conversas em tempo real
- [ ] IA de análise

### FASE 4 - FINANCEIRO (Semana 4-5)
- [ ] Modelo de Sales expandido
- [ ] Dashboard financeiro
- [ ] Relatórios
- [ ] Exportação

### FASE 5 - INTEGRAÇÕES (Semana 5-6)
- [ ] Estrutura genérica de integrações
- [ ] Gerenciar conexões
- [ ] Sincronização por empresa

### FASE 6 - PERMISSÕES (Semana 6-7)
- [ ] Roles e permissões
- [ ] Audit trail
- [ ] Convites de usuários

### FASE 7 - DEPLOY (Semana 7-8)
- [ ] Testes E2E
- [ ] Performance
- [ ] Security review
- [ ] Documentação

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Database migrations criadas
- [ ] Novos modelos Prisma implementados
- [ ] Auth middleware implementado
- [ ] Endpoints /api/v1/* criados
- [ ] Páginas criadas
- [ ] Componentes reutilizados
- [ ] Testes unitários
- [ ] Testes E2E
- [ ] Documentação OpenAPI
- [ ] README atualizado
- [ ] Deploy em staging
- [ ] Deploy em produção

---

## 📚 REFERÊNCIAS

### Arquivos Importantes
- `prisma/schema.prisma` - Schema atual
- `src/lib/auth.ts` - Autenticação
- `src/app/dashboard/page.tsx` - Dashboard exemplo
- `src/app/projects/page.tsx` - Seleção de contas exemplo

### Documentação
- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma](https://www.prisma.io/docs/)
- [NextAuth](https://authjs.dev/)
- [TailwindCSS](https://tailwindcss.com/docs)

---

**Auditoria finalizada com sucesso! ✨**  
Próximo passo: Implementar Fase 1 (Fundação)
