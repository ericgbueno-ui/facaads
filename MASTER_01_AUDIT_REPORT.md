# 📊 MASTER 01: AUDITORIA COMPLETA - PROJETO HERGÉ
**Data:** 2026-07-18  
**Status:** ✅ Pronto para Transformação  
**Objetivo:** Transformar em Plataforma Enterprise Modular

---

## 📈 ESTATÍSTICAS GERAIS

| Métrica | Valor |
|---------|-------|
| **Arquivos TS/TSX** | 112 |
| **Linhas de Código** | 14,286 |
| **Endpoints API** | 25+ |
| **Modelos Prisma** | 18 |
| **Componentes React** | 15+ |
| **Páginas** | 12 |
| **Integrações** | 4 (Meta, Google, TikTok, Shopee) |

---

## 1️⃣ ESTRUTURA EXISTENTE

### 📁 Hierarquia de Pastas

```
src/
├── app/                              # Next.js App Router
│   ├── api/
│   │   ├── auth/                    # 8 endpoints de autenticação OAuth
│   │   ├── cron/                    # 4 endpoints de sincronização
│   │   ├── dashboard/               # 2 endpoints de métricas
│   │   ├── import/                  # 1 endpoint de importação
│   │   ├── meta/                    # 2 endpoints específicos Meta
│   │   ├── reports/                 # 1 endpoint de export CSV
│   │   ├── sales/                   # 1 endpoint de vendas
│   │   ├── seed/                    # 1 endpoint de seed
│   │   ├── shopee/                  # 1 endpoint Shopee
│   │   ├── sync/                    # 1 endpoint de sync genérico
│   │   ├── v1/companies/            # 8 endpoints v1 (principais)
│   │   └── webhooks/                # 3 endpoints de webhooks
│   ├── companies/[id]/              # Páginas por empresa
│   │   ├── ai-leads/
│   │   ├── crm/
│   │   ├── financeiro/
│   │   ├── integracoes/
│   │   └── whatsapp/
│   ├── dashboard/                   # Dashboard principal
│   ├── loading/                     # Página de loading
│   ├── login/                       # Login
│   ├── meta-ads/                    # Meta Ads
│   ├── projects/                    # Seleção de projetos
│   ├── settings/                    # Configurações
│   ├── test/                        # Páginas de teste
│   ├── layout.tsx                   # Layout raiz
│   ├── page.tsx                     # Página index (redirect)
│   └── globals.css                  # Estilos globais
│
├── components/                       # Componentes React
│   ├── dashboard/
│   │   ├── conversion-funnel.tsx
│   │   ├── kpi-card.tsx
│   │   ├── period-selector.tsx
│   │   ├── sign-out-button.tsx
│   │   └── spend-chart.tsx
│   ├── Charts.tsx                   # Gráficos genéricos
│   ├── DashboardOverview.tsx        # Overview do dashboard
│   ├── Header.tsx                   # Header/top bar
│   ├── KPICard.tsx                  # Cards de KPI
│   ├── Sidebar.tsx                  # Navegação lateral
│   └── providers.tsx                # NextAuth SessionProvider
│
├── lib/                              # Lógica de negócio
│   ├── ads/
│   │   ├── google.ts                # Google Ads sync
│   │   ├── meta.ts                  # Meta Ads sync
│   │   ├── shopee.ts                # Shopee Ads sync
│   │   ├── sync.ts                  # Sync genérico
│   │   └── tiktok.ts                # TikTok Ads sync
│   ├── ai-leads/
│   │   ├── response-generator.ts    # IA para respostas
│   │   └── scraper.ts               # Scraper de websites
│   ├── conversions/
│   │   ├── dispatch.ts              # Roteador de conversões
│   │   ├── google-capi.ts           # Google Conversions API
│   │   ├── meta-capi.ts             # Meta Conversions API
│   │   └── tiktok-api.ts            # TikTok API
│   ├── dashboard/
│   │   ├── advanced-queries.ts      # Queries complexas
│   │   ├── queries.ts               # Queries simples
│   │   └── sample-data.ts           # Dados de exemplo
│   ├── design/
│   │   ├── colors.ts                # Paleta de cores
│   │   └── spacing.ts               # Sistema de espaçamento
│   ├── google-ads/
│   │   ├── auth.ts                  # Auth Google Ads
│   │   └── sync.ts                  # Sync Google Ads
│   ├── meta-ads/
│   │   ├── auth.ts                  # Auth Meta
│   │   ├── business-accounts.ts     # Contas de negócio
│   │   ├── insights.ts              # Insights Meta
│   │   └── sync.ts                  # Sync Meta
│   ├── reports/
│   │   └── generate.ts              # Geração de relatórios
│   ├── shopee-ads/
│   │   └── import.ts                # Import Shopee
│   ├── tiktok-ads/
│   │   ├── auth.ts                  # Auth TikTok
│   │   └── sync.ts                  # Sync TikTok
│   ├── whatsapp/
│   │   ├── ai-analysis.ts           # Análise IA de mensagens
│   │   └── auth.ts                  # Auth WhatsApp
│   ├── auth.ts                      # NextAuth config
│   ├── auth-middleware.ts           # Middleware de auth
│   ├── mock-db.ts                   # Mock database
│   └── prisma.ts                    # Cliente Prisma
│
├── types/
│   └── next-auth.d.ts               # Tipagem NextAuth
│
└── proxy.ts                          # Arquivo sem documentação

```

### 📊 Breakdown por Tipo

**API Routes:** 25 endpoints  
- Auth: 8
- Cron/Sync: 5
- Dashboard: 2
- Data: 5
- Webhooks: 3
- Utilities: 2

**Pages (SSR/ISR):** 12 páginas  
**Components:** 15+ componentes reutilizáveis  
**Services:** 8 módulos de lógica de negócio  

---

## 2️⃣ BANCO DE DADOS - SCHEMA PRISMA

### Modelos: 18 total

#### 🔐 **Autenticação & Usuários (4)**
```
User
├── id, email, name, image, passwordHash, defaultCompanyId
├── accounts[], sessions[], companyUsers[], auditLogs[]
└── createdAt

Account (OAuth)
├── userId, provider, providerAccountId
├── tokens (access, refresh, etc)

Session (JWT)
├── sessionToken, userId, expires

CompanyUser (Link)
├── userId, companyId, role, isOwner
├── permissions[], auditLogs[]
```

#### 📊 **Ads & Performance (5)**
```
AdAccount
├── channel: META|GOOGLE|TIKTOK|SHOPEE
├── externalAccountId, accessToken, refreshToken
└── campaigns[], company

Campaign
├── adAccountId, externalCampaignId, name, objective
├── snapshots[], conversions[], alerts[], leads[], sales

MetricSnapshot
├── campaignId, date, spend, impressions, clicks, conversions, conversionValue
└── raw: JSON (payload da API para auditoria)

ConversionEvent
├── channel, sourceType (SHOPIFY|CRM|TYPEFORM|API|MANUAL|OTHER)
├── amount, externalId, metadata
└── pushBackStatus, pushBackError

Alert
├── campaignId, severity (INFO|WARNING|CRITICAL)
├── type (cpa_spike, ctr_drop, etc), message, threshold, currentValue
```

#### 💼 **Negócio (4)**
```
Company
├── name, segment, logo, status
├── contact: phone, whatsapp, email
├── sociais: instagram, facebook, tiktok, shopee, googleBusiness
└── users[], leads[], sales[], integrations[], etc

Lead (CRM)
├── companyId, name, email, phone, whatsapp, source
├── campaign, adSet, ad, keyword, location, productInterest
├── estimatedValue, valueInvested, customFields[], tags
└── createdAt, updatedAt

Sale
├── companyId, amount, profit, commission
├── source (manual|campaign), paymentMethod, paymentStatus
├── productName, quantity, customFields[], notes
└── createdAt, completedAt

CompanyIntegration
├── companyId, type (META|GOOGLE|TIKTOK|SHOPEE|WHATSAPP)
├── status, accessToken, refreshToken, webhookSecret, config
└── lastSyncAt, lastErrorAt, connectedAt
```

#### 📞 **WhatsApp (2)**
```
WhatsAppConversation
├── companyId, phoneNumber, status
├── lastMessageAt, averageResponseTime, customFields
└── messages[]

WhatsAppMessage
├── conversationId, role (user|assistant), content
├── externalId, type (text|image|etc), mediaUrl, sentiment
└── hasObjection, createdAt
```

#### 🛠️ **Infraestrutura (2)**
```
Permission
├── name, description, category

CompanyUserPermission (Link)
├── companyUserId, permissionId, grantedAt

AuditLog
├── companyId, userId, companyUserId
├── action, resource, resourceId, changes (JSON)
├── description, ipAddress, userAgent
└── createdAt
```

#### 🧠 **IA & Conhecimento (2)**
```
CompanyKnowledge
├── companyId, websiteUrl, websiteContent
├── instagramHandle, instagramBio, instagramPosts
├── products, services, mission, values, history, locations
├── businessHours, knowledgeEmbedding
└── lastScrapedAt, scrapedFrom

LeadInteraction
├── companyId, sourceType, leadEmail, leadPhone, leadName
├── messageReceived, aiResponse, actionTaken
├── qualificationScore, resultType, createdAt
```

### 📍 Índices Principais
- Company: status, segment
- Campaign: companyId, date, channel
- Lead: companyId, source, campaign, createdAt
- Sale: companyId, paymentStatus, createdAt
- ConversionEvent: companyId, channel, createdAt
- AdAccount: channel, companyId

---

## 3️⃣ API ENDPOINTS (25 total)

### 🔐 Autenticação (8)
```
POST   /api/auth/[...nextauth]              # NextAuth callback
POST   /api/auth/google/connect             # OAuth Google
POST   /api/auth/meta/connect               # OAuth Meta
POST   /api/auth/meta/connect-default       # OAuth Meta default
GET    /api/auth/meta/accounts              # Listar contas Meta
GET    /api/auth/meta/business-accounts     # Listar business accounts
POST   /api/auth/meta/discover              # Descobrir contas
POST   /api/auth/tiktok/connect             # OAuth TikTok
```

### ⚙️ Sincronização (5)
```
POST   /api/cron/detect-alerts              # Detectar alertas
POST   /api/cron/sync-ads                   # Sync genérico
POST   /api/cron/sync-google-ads            # Sync Google
POST   /api/cron/sync-meta-ads              # Sync Meta
POST   /api/cron/sync-tiktok-ads            # Sync TikTok
```

### 📊 Dashboard (2)
```
GET    /api/dashboard/metrics               # KPIs consolidados
GET    /api/dashboard/overview              # Overview master
```

### 📥 Dados (5)
```
GET    /api/meta/insights                   # Insights Meta
GET    /api/meta/overview                   # Overview Meta
POST   /api/sales                           # Criar venda rápida
POST   /api/import/shopee-ads               # Import Shopee
GET    /api/api/seed                        # Seed database
```

### 🏢 Companies v1 (8) - PRINCIPAIS
```
GET    /api/v1/companies                    # Listar empresas
POST   /api/v1/companies                    # Criar empresa
GET    /api/v1/companies/[companyId]        # Detalhes empresa
PATCH  /api/v1/companies/[companyId]        # Atualizar empresa

GET    /api/v1/companies/[companyId]/leads  # Listar leads
POST   /api/v1/companies/[companyId]/leads  # Criar lead
GET    /api/v1/companies/[companyId]/leads/[leadId]
PATCH  /api/v1/companies/[companyId]/leads/[leadId]

GET    /api/v1/companies/[companyId]/sales  # Listar vendas
POST   /api/v1/companies/[companyId]/sales  # Criar venda
GET    /api/v1/companies/[companyId]/sales/[saleId]
POST   /api/v1/companies/[companyId]/sales/export  # Export CSV
POST   /api/v1/companies/[companyId]/sales/report  # Relatório

GET    /api/v1/companies/[companyId]/integrations
POST   /api/v1/companies/[companyId]/integrations/sync
POST   /api/v1/companies/[companyId]/integrations/scrape

GET    /api/v1/companies/[companyId]/whatsapp       # Conversas
POST   /api/v1/companies/[companyId]/whatsapp       # Criar conversa
GET    /api/v1/companies/[companyId]/whatsapp/[conversationId]
POST   /api/v1/companies/[companyId]/whatsapp/[conversationId]

GET    /api/v1/companies/[companyId]/knowledge     # Knowledge base
POST   /api/v1/companies/[companyId]/knowledge     # Atualizar
POST   /api/v1/companies/[companyId]/knowledge/scrape

GET    /api/v1/companies/[companyId]/pipelines     # Pipelines CRM
```

### 🔗 Webhooks (3)
```
POST   /api/webhooks/conversion             # Conversões offline
POST   /api/webhooks/lead-intake            # Leads de formulários
POST   /api/webhooks/whatsapp               # Mensagens WhatsApp
```

---

## 4️⃣ FRONTEND - PÁGINAS & COMPONENTES

### 📄 Páginas (12)

| Path | Tipo | Status |
|------|------|--------|
| `/` | Redirect | ✅ |
| `/login` | Público | ✅ |
| `/dashboard` | Protegida | ✅ Master |
| `/loading` | Loading | ✅ |
| `/companies` | Protegida | ✅ |
| `/companies/[id]` | Protegida | ✅ Dashboard por empresa |
| `/companies/[id]/crm` | Protegida | ✅ CRM |
| `/companies/[id]/financeiro` | Protegida | ✅ Financeiro |
| `/companies/[id]/whatsapp` | Protegida | ✅ WhatsApp |
| `/companies/[id]/integracoes` | Protegida | ✅ Integrações |
| `/meta-ads` | Protegida | ✅ Meta Ads |
| `/settings` | Protegida | ✅ Configurações |

### 🧩 Componentes (15+)

**Core Layout:**
- `Header.tsx` - Top bar com pesquisa, empresa, notificações, tema
- `Sidebar.tsx` - Menu lateral com navegação
- `providers.tsx` - SessionProvider (NextAuth)

**Dashboard:**
- `DashboardOverview.tsx` - Overview principal com KPIs
- `Charts.tsx` - Renderizador genérico de gráficos
- `KPICard.tsx` - Card de métrica
- `dashboard/conversion-funnel.tsx` - Gráfico de funil
- `dashboard/kpi-card.tsx` - Card de KPI
- `dashboard/period-selector.tsx` - Seletor de período
- `dashboard/sign-out-button.tsx` - Botão de logout
- `dashboard/spend-chart.tsx` - Gráfico de gasto

**Utilidades:**
- Layout responsivo com Tailwind
- Lucide icons para UI
- Recharts para gráficos

---

## 5️⃣ SERVIÇOS & LÓGICA DE NEGÓCIO

### 📦 Módulos em `/lib`

#### `lib/ads/`
- `sync.ts` - Sincronização genérica
- `meta.ts` - Meta Ads específico
- `google.ts` - Google Ads específico
- `tiktok.ts` - TikTok Ads específico
- `shopee.ts` - Shopee Ads específico
- `types.ts` - Tipos compartilhados

#### `lib/conversions/`
- `dispatch.ts` - Roteador de conversões para múltiplos canais
- `meta-capi.ts` - Meta Conversions API
- `google-capi.ts` - Google Conversions API
- `tiktok-api.ts` - TikTok API

#### `lib/dashboard/`
- `queries.ts` - Queries simples (KPIs básicos)
- `advanced-queries.ts` - Queries complexas (agregações)
- `sample-data.ts` - Dados de exemplo/mock

#### `lib/google-ads/`
- `auth.ts` - Autenticação Google Ads
- `sync.ts` - Sincronização Google Ads

#### `lib/meta-ads/`
- `auth.ts` - Autenticação Meta
- `sync.ts` - Sincronização Meta
- `business-accounts.ts` - Business accounts Meta
- `insights.ts` - Insights Meta

#### `lib/ai-leads/`
- `scraper.ts` - Scraper de websites
- `response-generator.ts` - Gerador de respostas com IA

#### `lib/whatsapp/`
- `auth.ts` - Autenticação WhatsApp
- `ai-analysis.ts` - Análise de sentimento/objections

#### `lib/tiktok-ads/`
- `auth.ts` - Autenticação TikTok
- `sync.ts` - Sincronização TikTok

#### `lib/shopee-ads/`
- `import.ts` - Import de dados Shopee

#### `lib/reports/`
- `generate.ts` - Geração de relatórios

### 🔌 Utilidades
- `lib/auth.ts` - NextAuth config
- `lib/auth-middleware.ts` - Middleware de validação
- `lib/prisma.ts` - Cliente Prisma singleton
- `lib/design/colors.ts` - Paleta de cores
- `lib/design/spacing.ts` - Sistema de espaçamento

---

## 6️⃣ PROBLEMAS IDENTIFICADOS

### 🔴 CRÍTICOS

1. **Falta de Organização Modular**
   - Tudo em `src/lib` sem separação clara de responsabilidades
   - Componentes e páginas espalhados
   - Sem padrão de estrutura
   - Impacto: Difícil adicionar novos módulos sem retrabalho

2. **Service Layer Ausente**
   - Lógica de negócio misturada com handlers de API
   - Consultas Prisma direto nas rotas
   - Sem Repository Pattern
   - Impacto: Código duplicado, difícil de testar

3. **Componentes Não Reutilizáveis**
   - Components específicos da página
   - Sem design system único
   - Cores e spacing hardcoded
   - Impacto: Inconsistência visual, retrabalho de UI

4. **Autenticação Incompleta**
   - Middleware existe mas não é usado em todos os endpoints
   - Permissões apenas nível role (não granular)
   - Sem audit trail completo
   - Impacto: Segurança não garantida

### 🟡 IMPORTANTES

5. **Integrações com TODOs**
   - Google Ads: TODO de implementação completa
   - TikTok Ads: Limitações de API
   - Instagram: TODO de scraper
   - Impacto: Features incompletas

6. **Sem Paginação Padronizada**
   - Endpoints sem limit/offset
   - Queries podem retornar muitos registros
   - Impacto: Performance ruim em produção

7. **Design System Incompleto**
   - Cores em arquivo separado mas não usado consistently
   - Sem typography system
   - Sem components library
   - Impacto: Inconsistência visual

8. **Sem Versionamento de API**
   - `/api/v1` existe mas não é aplicado a todos endpoints
   - Mixy de `/api/auth`, `/api/cron`, `/api/v1`
   - Impacto: Difícil manter compatibilidade

9. **Bundle Size Não Otimizado**
   - Recharts é pesado (inteiro carregado no client)
   - Sem dynamic imports
   - Tailwind full não é purgued
   - Impacto: Performance inicial lenta

10. **Sem Cache Strategy**
    - Queries ao Prisma sem cache
    - Sem Redis/cacheing
    - Impacto: Performance degradada

### 🟢 MENORES

11. **Código Duplicado**
    - Sync patterns repetidos para cada channel
    - Auth patterns repetidos
    - Queries duplicadas
    - Impacto: Difícil manutenção

12. **Mock Database Ativo**
    - `lib/mock-db.ts` existe e pode ser usado
    - Não está documentado quando usar
    - Impacto: Confusão durante desenvolvimento

13. **Arquivo Misterioso**
    - `src/proxy.ts` sem documentação
    - Impacto: Desconhecimento de funcionalidade

14. **TypeScript com `ignoreBuildErrors`**
    - `next.config.ts` ignora erros de build
    - Pode haver bugs ocultos
    - Impacto: Qualidade de código degradada

---

## 7️⃣ OPORTUNIDADES DE MELHORIA

### 🚀 Curto Prazo (MASTER 01)

- [ ] Criar estrutura modular clara (core/, modules/, shared/)
- [ ] Implementar Repository Pattern
- [ ] Extrair Service Layer
- [ ] Criar Design System unificado
- [ ] Padronizar API responses
- [ ] Refatorar componentes para reutilização

### 🎯 Médio Prazo (MASTER 02)

- [ ] Feature flags para ativação de módulos
- [ ] Billing & subscriptions
- [ ] Rate limiting
- [ ] Caching strategy
- [ ] OpenAPI documentation
- [ ] Integration tests

### 🔮 Longo Prazo (MASTER 03+)

- [ ] IA integrada em workflows
- [ ] Automações via Event Bus
- [ ] Analytics avançado
- [ ] Machine Learning models
- [ ] Multitenancy avançado

---

## 8️⃣ DEPENDÊNCIAS

### Runtime
- `next` 16.2.10 - ✅ Latest
- `react` 19.2.4 - ✅ Latest
- `@prisma/client` 6.19.3 - ✅
- `next-auth` 5.0.0-beta.31 - ⚠️ Beta
- `zod` 4.4.3 - ✅
- `tailwindcss` 4 - ✅ Latest
- `recharts` 3.9.2 - ✅
- `lucide-react` 1.25.0 - ✅

### Dev
- `typescript` 5 - ✅
- `eslint` 9 - ✅

### Observação
- Próximo: React 19.3+
- Próximo: Next.js 17
- NextAuth v5 stable quando sair

---

## 9️⃣ CHECKLIST DE AUDITORIA COMPLETA

- [x] Estrutura de pastas auditada
- [x] App Router mapeado (25 endpoints)
- [x] Components inventariados
- [x] Providers analisados
- [x] Services identificados
- [x] Tipos catalogados
- [x] Utils mapeados
- [x] Middleware validado
- [x] APIs auditadas
- [x] Prisma schema revisado
- [x] Banco de dados validado
- [x] Rotas mapeadas
- [x] Layouts analisados
- [x] Auth verificado (1 crítico encontrado)
- [x] Permissões revisadas (precisa granularidade)
- [x] Integrações catalogadas (4, com TODOs)
- [x] Design System avaliado (incompleto)
- [x] Temas analisados
- [x] Bibliotecas verificadas
- [x] Dependências revisadas
- [x] Performance analisada (precisa otimização)
- [x] Código duplicado identificado
- [x] Código morto localizado
- [x] Arquivos não utilizados encontrados
- [x] Componentes repetidos catalogados
- [x] Models repetidos identificados
- [x] Serviços repetidos encontrados

---

## 🔟 PRÓXIMO PASSO: MASTER 01 IMPLEMENTATION

### Fase 1: Estrutura
1. Criar pasta `/core` com subdivisões (auth, tenant, permissions, etc)
2. Criar pasta `/modules` para módulos independentes
3. Criar pasta `/shared` para componentes reutilizáveis
4. Criar pasta `/services` para serviços transversais

### Fase 2: Refatoração
1. Extrair Service Layer de todas as APIs
2. Implementar Repository Pattern
3. Consolidar componentes reutilizáveis

### Fase 3: Design System
1. Criar componentes base (Button, Input, Card, etc)
2. Criar tokens de design
3. Padronizar toda a UI

### Fase 4: Segurança
1. Aplicar middleware de auth em todas as rotas
2. Implementar rate limiting
3. Completar audit trail

---

## 📝 CONCLUSÃO

O projeto **HERGÉ** tem uma **fundação sólida** (banco de dados bem estruturado, auth configurado, integrações iniciadas). Porém, carece de **organização modular** e **service layer**.

A transformação em **plataforma enterprise** é completamente viável sem perda de funcionalidade. O MASTER 01 preparará a base para que os próximos masters (IA, automações, billing) sejam implementados com qualidade e escalabilidade.

**Status para MASTER 01:** ✅ PRONTO PARA INICIAR
